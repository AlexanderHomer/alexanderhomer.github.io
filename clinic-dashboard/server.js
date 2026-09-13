#!/usr/bin/env node
// Local-only clinic ops dashboard server. No external dependencies —
// runs on Node's built-in http + fetch. Never deploy this folder's
// server.js publicly: SLACK_BOT_TOKEN must stay server-side only.
'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_FILE = path.join(ROOT, 'data', 'state.json');
const PORT = Number(process.env.PORT || 4173);
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN || '';
const SLACK_CHANNELS = (process.env.SLACK_CHANNELS || '')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);
const POLL_INTERVAL_MS = Number(process.env.SLACK_POLL_MS || 15000);

// ---------- persistence ----------

function loadState() {
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {
      feed: [],
      todos: [],
      settings: { whatsappLink: '', tigertextLink: '', epicLink: '', slackTeamId: '' },
      slackSeen: {},
      userNames: {},
    };
  }
}

let state = loadState();
let saveTimer = null;
function saveState() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(() => {
    fs.mkdirSync(path.dirname(DATA_FILE), { recursive: true });
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
  }, 200);
}

function newId() {
  return crypto.randomBytes(6).toString('hex');
}

// ---------- slack polling ----------

let slackBotUserId = null;

async function slackApi(method, params) {
  const url = new URL(`https://slack.com/api/${method}`);
  Object.entries(params || {}).forEach(([k, v]) => url.searchParams.set(k, v));
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${SLACK_BOT_TOKEN}` },
  });
  return res.json();
}

async function slackInit() {
  if (!SLACK_BOT_TOKEN) return;
  try {
    const auth = await slackApi('auth.test', {});
    if (!auth.ok) {
      console.error('[slack] auth.test failed:', auth.error);
      return;
    }
    slackBotUserId = auth.user_id;
    state.settings.slackTeamId = auth.team_id;
    saveState();
    console.log(`[slack] connected as ${auth.user} on team ${auth.team}`);
  } catch (err) {
    console.error('[slack] init error:', err.message);
  }
}

async function resolveUserName(userId) {
  if (!userId) return 'unknown';
  if (state.userNames[userId]) return state.userNames[userId];
  try {
    const info = await slackApi('users.info', { user: userId });
    const name = info.ok ? info.user.real_name || info.user.name : userId;
    state.userNames[userId] = name;
    saveState();
    return name;
  } catch {
    return userId;
  }
}

async function pollSlackChannel(channelId) {
  const oldest = state.slackSeen[channelId] || '0';
  const res = await slackApi('conversations.history', { channel: channelId, oldest, limit: 20 });
  if (!res.ok) {
    console.error(`[slack] history failed for ${channelId}:`, res.error);
    return;
  }
  const messages = (res.messages || []).filter(
    (m) => !m.subtype && m.user && m.user !== slackBotUserId && m.ts !== oldest
  );
  for (const m of messages.reverse()) {
    const senderName = await resolveUserName(m.user);
    state.feed.push({
      id: newId(),
      source: 'slack',
      sender: senderName,
      text: m.text || '(no text)',
      ts: Math.round(parseFloat(m.ts) * 1000),
      status: 'open',
      priority: /\bstat\b|urgent|asap|now\b/i.test(m.text || '') ? 'urgent' : 'normal',
      patientTag: null,
      channel: channelId,
      link: state.settings.slackTeamId
        ? `slack://channel?team=${state.settings.slackTeamId}&id=${channelId}`
        : null,
    });
  }
  if (res.messages && res.messages.length) {
    const maxTs = res.messages.reduce((a, m) => Math.max(a, parseFloat(m.ts)), parseFloat(oldest));
    state.slackSeen[channelId] = String(maxTs);
  }
  saveState();
}

async function pollSlack() {
  if (!SLACK_BOT_TOKEN || !slackBotUserId || SLACK_CHANNELS.length === 0) return;
  for (const ch of SLACK_CHANNELS) {
    try {
      await pollSlackChannel(ch);
    } catch (err) {
      console.error(`[slack] poll error for ${ch}:`, err.message);
    }
  }
}

// ---------- http api ----------

function sendJson(res, code, body) {
  const data = JSON.stringify(body);
  res.writeHead(code, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
  });
  res.end(data);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let chunks = '';
    req.on('data', (c) => (chunks += c));
    req.on('end', () => {
      if (!chunks) return resolve({});
      try {
        resolve(JSON.parse(chunks));
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

const MIME = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
};

function serveStatic(req, res, pathname) {
  let filePath = path.join(PUBLIC_DIR, pathname === '/' ? 'index.html' : pathname);
  if (!filePath.startsWith(PUBLIC_DIR)) {
    res.writeHead(403);
    return res.end('forbidden');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      return res.end('not found');
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

async function handleApi(req, res, pathname) {
  const method = req.method;

  if (method === 'GET' && pathname === '/api/feed') {
    const items = [...state.feed].sort((a, b) => b.ts - a.ts);
    return sendJson(res, 200, items);
  }

  if (method === 'POST' && pathname === '/api/log') {
    const body = await readBody(req);
    const item = {
      id: newId(),
      source: body.source || 'other',
      sender: body.sender || 'me',
      text: body.text || '',
      ts: Date.now(),
      status: 'open',
      priority: body.priority === 'urgent' ? 'urgent' : 'normal',
      patientTag: body.patientTag || null,
      channel: null,
      link: null,
    };
    state.feed.push(item);
    saveState();
    return sendJson(res, 201, item);
  }

  const feedActionMatch = pathname.match(/^\/api\/feed\/([a-f0-9]+)\/action$/);
  if (method === 'POST' && feedActionMatch) {
    const body = await readBody(req);
    const item = state.feed.find((f) => f.id === feedActionMatch[1]);
    if (!item) return sendJson(res, 404, { error: 'not found' });
    const validActions = { done: 'done', snooze: 'snoozed', escalate: 'escalated', reopen: 'open' };
    const next = validActions[body.action];
    if (!next) return sendJson(res, 400, { error: 'invalid action' });
    item.status = next;
    if (body.action === 'escalate') item.priority = 'urgent';
    saveState();
    return sendJson(res, 200, item);
  }

  if (method === 'GET' && pathname === '/api/todos') {
    return sendJson(res, 200, state.todos);
  }

  if (method === 'POST' && pathname === '/api/todos') {
    const body = await readBody(req);
    const todo = {
      id: newId(),
      text: body.text || '',
      column: ['now', 'today', 'followup'].includes(body.column) ? body.column : 'today',
      priority: body.priority === 'urgent' ? 'urgent' : 'normal',
      patientTag: body.patientTag || null,
      done: false,
      createdAt: Date.now(),
    };
    state.todos.push(todo);
    saveState();
    return sendJson(res, 201, todo);
  }

  const todoMatch = pathname.match(/^\/api\/todos\/([a-f0-9]+)$/);
  if (method === 'PATCH' && todoMatch) {
    const body = await readBody(req);
    const todo = state.todos.find((t) => t.id === todoMatch[1]);
    if (!todo) return sendJson(res, 404, { error: 'not found' });
    if (body.column) todo.column = body.column;
    if (typeof body.done === 'boolean') todo.done = body.done;
    saveState();
    return sendJson(res, 200, todo);
  }

  if (method === 'DELETE' && todoMatch) {
    state.todos = state.todos.filter((t) => t.id !== todoMatch[1]);
    saveState();
    return sendJson(res, 200, { ok: true });
  }

  if (method === 'GET' && pathname === '/api/config') {
    return sendJson(res, 200, {
      slackEnabled: Boolean(SLACK_BOT_TOKEN && SLACK_CHANNELS.length),
      settings: state.settings,
    });
  }

  if (method === 'POST' && pathname === '/api/config') {
    const body = await readBody(req);
    state.settings = { ...state.settings, ...body };
    saveState();
    return sendJson(res, 200, state.settings);
  }

  return sendJson(res, 404, { error: 'unknown endpoint' });
}

const server = http.createServer((req, res) => {
  const { pathname } = new URL(req.url, `http://${req.headers.host}`);
  if (pathname.startsWith('/api/')) {
    handleApi(req, res, pathname).catch((err) => {
      console.error(err);
      sendJson(res, 500, { error: 'server error' });
    });
  } else {
    serveStatic(req, res, pathname);
  }
});

server.listen(PORT, () => {
  console.log(`Clinic dashboard running at http://localhost:${PORT}`);
  if (!SLACK_BOT_TOKEN) {
    console.log('[slack] SLACK_BOT_TOKEN not set — Slack panel will stay in manual mode.');
  }
});

slackInit().then(() => {
  if (SLACK_BOT_TOKEN) {
    pollSlack();
    setInterval(pollSlack, POLL_INTERVAL_MS);
  }
});
