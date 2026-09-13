(() => {
  'use strict';

  const REFRESH_MS = 4000;
  const announcedUrgent = new Set();
  let voiceOn = false;
  let recognition = null;

  const el = (id) => document.getElementById(id);
  const queueList = el('queueList');
  const escalationLane = el('escalationLane');
  const heard = el('heard');
  const slackStatus = el('slackStatus');
  const micToggle = el('micToggle');
  const appLinks = el('appLinks');

  async function api(path, opts) {
    const res = await fetch(path, {
      headers: { 'Content-Type': 'application/json' },
      ...opts,
    });
    if (!res.ok) throw new Error(`${path} -> ${res.status}`);
    return res.json();
  }

  function timeAgo(ts) {
    const s = Math.round((Date.now() - ts) / 1000);
    if (s < 60) return `${s}s`;
    if (s < 3600) return `${Math.round(s / 60)}m`;
    return `${Math.round(s / 3600)}h`;
  }

  function speak(text) {
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 1.05;
    window.speechSynthesis.speak(u);
  }

  function showHeard(text) {
    heard.hidden = false;
    heard.textContent = `Heard: "${text}"`;
  }

  // ---------- rendering ----------

  function renderQueue(items) {
    queueList.innerHTML = '';
    const open = items.filter((i) => i.status === 'open' || i.status === 'escalated');
    if (open.length === 0) {
      queueList.innerHTML = '<p style="color:#64748b;font-size:14px;">Queue is clear.</p>';
    }
    for (const item of open) {
      const div = document.createElement('div');
      div.className = `item source-${item.source} ${item.priority === 'urgent' ? 'priority-urgent' : ''}`;
      div.dataset.id = item.id;
      div.innerHTML = `
        <div class="item-meta"><span>${item.source} — ${item.sender}</span><span>${timeAgo(item.ts)} ago</span></div>
        <div class="item-text">${escapeHtml(item.text)}${item.patientTag ? ` <em>(${escapeHtml(item.patientTag)})</em>` : ''}</div>
        <div class="item-actions">
          <button class="done-btn" data-action="done">Done</button>
          <button class="snooze-btn" data-action="snooze">Snooze</button>
          <button class="escalate-btn" data-action="escalate">Escalate</button>
          ${item.link ? `<a href="${item.link}" target="_blank" rel="noopener">Open</a>` : ''}
        </div>`;
      queueList.appendChild(div);
    }

    const escalated = items.filter((i) => i.status === 'escalated');
    if (escalated.length) {
      escalationLane.hidden = false;
      escalationLane.innerHTML = escalated
        .map((i) => `<div>⚠ ${escapeHtml(i.source)}: ${escapeHtml(i.text)}</div>`)
        .join('');
    } else {
      escalationLane.hidden = true;
    }

    for (const i of items) {
      if (i.priority === 'urgent' && i.status === 'open' && !announcedUrgent.has(i.id)) {
        announcedUrgent.add(i.id);
        speak(`New urgent message from ${i.sender}: ${i.text}`);
      }
    }
  }

  function renderTodos(todos) {
    for (const col of ['now', 'today', 'followup']) {
      const container = document.querySelector(`[data-list="${col}"]`);
      container.innerHTML = '';
      const items = todos.filter((t) => t.column === col && !t.done);
      for (const t of items) {
        const div = document.createElement('div');
        div.className = 'todo-item';
        div.innerHTML = `
          <span>${escapeHtml(t.text)}${t.patientTag ? ` <em>(${escapeHtml(t.patientTag)})</em>` : ''}</span>
          <span>
            <button data-move="${t.id}" title="Move to next column">→</button>
            <button data-done="${t.id}" title="Complete">✓</button>
          </span>`;
        container.appendChild(div);
      }
    }
  }

  function renderAppLinks(cfg) {
    const links = [
      ['WhatsApp', cfg.settings.whatsappLink],
      ['TigerText', cfg.settings.tigertextLink],
      ['Epic', cfg.settings.epicLink],
    ];
    appLinks.innerHTML = links
      .map(([label, url]) =>
        url
          ? `<a href="${url}" target="_blank" rel="noopener">${label}</a>`
          : `<a class="disabled" href="#">${label} (set link)</a>`
      )
      .join('');
    el('cfgWhatsapp').value = cfg.settings.whatsappLink || '';
    el('cfgTigertext').value = cfg.settings.tigertextLink || '';
    el('cfgEpic').value = cfg.settings.epicLink || '';
    slackStatus.textContent = `Slack: ${cfg.slackEnabled ? 'live' : 'manual'}`;
    slackStatus.className = `badge ${cfg.slackEnabled ? 'badge-ok' : 'badge-off'}`;
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  // ---------- data refresh ----------

  async function refresh() {
    try {
      const [feed, todos] = await Promise.all([api('/api/feed'), api('/api/todos')]);
      renderQueue(feed);
      renderTodos(todos);
    } catch (err) {
      console.error(err);
    }
  }

  async function refreshConfig() {
    const cfg = await api('/api/config');
    renderAppLinks(cfg);
  }

  // ---------- actions ----------

  queueList.addEventListener('click', async (e) => {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;
    const id = btn.closest('.item').dataset.id;
    await api(`/api/feed/${id}/action`, { method: 'POST', body: JSON.stringify({ action: btn.dataset.action }) });
    refresh();
  });

  document.querySelector('.todo-board').addEventListener('click', async (e) => {
    if (e.target.dataset.done) {
      await api(`/api/todos/${e.target.dataset.done}`, { method: 'PATCH', body: JSON.stringify({ done: true }) });
      refresh();
    } else if (e.target.dataset.move) {
      const order = ['now', 'today', 'followup'];
      const card = e.target.closest('.todo-item');
      const list = card.closest('[data-list]');
      const current = list.dataset.list;
      const next = order[(order.indexOf(current) + 1) % order.length];
      await api(`/api/todos/${e.target.dataset.move}`, { method: 'PATCH', body: JSON.stringify({ column: next }) });
      refresh();
    }
  });

  el('todoForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = el('todoText').value.trim();
    if (!text) return;
    await api('/api/todos', { method: 'POST', body: JSON.stringify({ text, column: el('todoColumn').value }) });
    el('todoText').value = '';
    refresh();
  });

  el('logForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const text = el('logText').value.trim();
    if (!text) return;
    await api('/api/log', {
      method: 'POST',
      body: JSON.stringify({
        source: el('logSource').value,
        text,
        patientTag: el('logPatientTag').value.trim() || null,
        priority: el('logUrgent').checked ? 'urgent' : 'normal',
      }),
    });
    el('logText').value = '';
    el('logPatientTag').value = '';
    el('logUrgent').checked = false;
    refresh();
  });

  el('saveConfig').addEventListener('click', async () => {
    await api('/api/config', {
      method: 'POST',
      body: JSON.stringify({
        whatsappLink: el('cfgWhatsapp').value.trim(),
        tigertextLink: el('cfgTigertext').value.trim(),
        epicLink: el('cfgEpic').value.trim(),
      }),
    });
    refreshConfig();
  });

  // ---------- voice commands ----------

  async function topOpenItem() {
    const items = await api('/api/feed');
    return items
      .filter((i) => i.status === 'open')
      .sort((a, b) => b.ts - a.ts)[0];
  }

  async function handleCommand(raw) {
    const text = raw.toLowerCase().trim();
    showHeard(raw);

    let m;
    if (/^(done|next|resolve)\b/.test(text)) {
      const item = await topOpenItem();
      if (item) await api(`/api/feed/${item.id}/action`, { method: 'POST', body: JSON.stringify({ action: 'done' }) });
    } else if (/^snooze\b/.test(text)) {
      const item = await topOpenItem();
      if (item) await api(`/api/feed/${item.id}/action`, { method: 'POST', body: JSON.stringify({ action: 'snooze' }) });
    } else if (/^escalate\b/.test(text)) {
      const item = await topOpenItem();
      if (item) await api(`/api/feed/${item.id}/action`, { method: 'POST', body: JSON.stringify({ action: 'escalate' }) });
    } else if ((m = text.match(/^add todo (.+)/))) {
      await api('/api/todos', { method: 'POST', body: JSON.stringify({ text: m[1], column: 'today' }) });
    } else if ((m = text.match(/^log (whatsapp|tigertext|epic|other) (.+)/))) {
      await api('/api/log', { method: 'POST', body: JSON.stringify({ source: m[1], text: m[2] }) });
    } else if (/^(read queue|what'?s next|status)\b/.test(text)) {
      const items = await api('/api/feed');
      const open = items.filter((i) => i.status === 'open');
      if (open.length === 0) speak('Queue is clear.');
      else speak(`${open.length} open. Top item: ${open[0].source}, ${open[0].text}`);
    } else if (/^stop listening\b/.test(text)) {
      setVoice(false);
      return;
    } else {
      return; // unrecognized phrase, ignore silently
    }
    refresh();
  }

  function setVoice(on) {
    voiceOn = on;
    micToggle.setAttribute('aria-pressed', String(on));
    micToggle.textContent = on ? '🎤 Voice on' : '🎤 Voice off';
    if (on) {
      startRecognition();
    } else if (recognition) {
      recognition.stop();
    }
  }

  function startRecognition() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert('Voice commands need Chrome (Web Speech API is not available in this browser).');
      setVoice(false);
      return;
    }
    recognition = new SR();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1];
      if (last.isFinal) handleCommand(last[0].transcript);
    };
    recognition.onerror = (e) => console.warn('speech recognition error', e.error);
    recognition.onend = () => {
      if (voiceOn) recognition.start(); // browsers auto-stop after a pause; keep it alive
    };
    recognition.start();
  }

  micToggle.addEventListener('click', () => setVoice(!voiceOn));

  // ---------- boot ----------

  refresh();
  refreshConfig();
  setInterval(refresh, REFRESH_MS);
})();
