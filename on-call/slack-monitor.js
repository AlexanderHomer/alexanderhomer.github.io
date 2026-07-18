(function () {
  "use strict";

  const STORAGE_APP_TOKEN = "slackMonitor.appToken";
  const STORAGE_BOT_TOKEN = "slackMonitor.botToken";
  const STORAGE_REMEMBER = "slackMonitor.remember";

  const state = {
    appToken: "",
    botToken: "",
    ws: null,
    reconnectTimer: null,
    channels: [], // { id, name, kind, unread }
    channelIndex: new Map(), // id -> channel object
    messages: new Map(), // channelId -> [{ ts, userName, text }]
    userNames: new Map(), // userId -> display name
    currentChannelId: null,
    listening: false,
    recognition: null,
    announce: false,
  };

  let els = {};

  function $(id) {
    return document.getElementById(id);
  }

  function log(message) {
    const line = document.createElement("div");
    const time = new Date().toLocaleTimeString();
    line.textContent = `[${time}] ${message}`;
    els.log.appendChild(line);
    els.log.scrollTop = els.log.scrollHeight;
  }

  function setStatus(text, ok) {
    els.status.textContent = text;
    els.status.classList.toggle("sm-status-ok", !!ok);
    els.status.classList.toggle("sm-status-bad", !ok);
  }

  // --- Slack Web API -------------------------------------------------

  async function slackApi(method, token, body) {
    const resp = await fetch(`https://slack.com/api/${method}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json; charset=utf-8",
      },
      body: JSON.stringify(body || {}),
    });
    const data = await resp.json();
    if (!data.ok) {
      throw new Error(`${method} failed: ${data.error || "unknown error"}`);
    }
    return data;
  }

  async function resolveUserName(userId) {
    if (!userId) return "someone";
    if (state.userNames.has(userId)) return state.userNames.get(userId);
    try {
      const data = await slackApi("users.info", state.botToken, {
        user: userId,
      });
      const name =
        (data.user.profile && data.user.profile.display_name) ||
        data.user.real_name ||
        data.user.name ||
        userId;
      state.userNames.set(userId, name);
      return name;
    } catch (e) {
      state.userNames.set(userId, userId);
      return userId;
    }
  }

  async function resolveChannel(channelId) {
    if (state.channelIndex.has(channelId)) {
      return state.channelIndex.get(channelId);
    }
    try {
      const data = await slackApi("conversations.info", state.botToken, {
        channel: channelId,
      });
      const channel = channelFromApi(data.channel);
      addChannel(channel);
      return channel;
    } catch (e) {
      const channel = { id: channelId, name: channelId, kind: "channel", unread: false };
      addChannel(channel);
      return channel;
    }
  }

  function channelFromApi(raw) {
    let name = raw.name ? `#${raw.name}` : null;
    let kind = "channel";
    if (raw.is_im) {
      kind = "im";
      name = name || "Direct message";
    } else if (raw.is_mpim) {
      kind = "mpim";
      name = name || raw.name || "Group message";
    }
    return { id: raw.id, name: name || raw.id, kind, unread: false };
  }

  function addChannel(channel) {
    if (state.channelIndex.has(channel.id)) return;
    state.channelIndex.set(channel.id, channel);
    state.channels.push(channel);
    if (!state.messages.has(channel.id)) state.messages.set(channel.id, []);
    renderChannelList();
  }

  async function loadChannels() {
    const data = await slackApi("conversations.list", state.botToken, {
      types: "public_channel,private_channel,mpim,im",
      exclude_archived: true,
      limit: 200,
    });
    for (const raw of data.channels) {
      if (raw.is_channel && raw.is_member === false) continue;
      addChannel(channelFromApi(raw));
    }
    renderChannelList();
    if (!state.currentChannelId && state.channels.length) {
      selectChannel(state.channels[0].id);
    }
  }

  async function loadHistory(channelId) {
    try {
      const data = await slackApi("conversations.history", state.botToken, {
        channel: channelId,
        limit: 20,
      });
      const msgs = data.messages
        .slice()
        .reverse()
        .filter((m) => !m.subtype || m.subtype === "bot_message");
      const resolved = [];
      for (const m of msgs) {
        const userName = m.user
          ? await resolveUserName(m.user)
          : m.username || "Slack";
        resolved.push({ ts: m.ts, userName, text: m.text || "" });
      }
      state.messages.set(channelId, resolved);
      if (channelId === state.currentChannelId) renderMessages();
    } catch (e) {
      log(`Could not load history: ${e.message}`);
    }
  }

  async function sendReply(text) {
    if (!state.currentChannelId) {
      log("No channel selected, can't send reply.");
      return;
    }
    if (!text || !text.trim()) return;
    try {
      await slackApi("chat.postMessage", state.botToken, {
        channel: state.currentChannelId,
        text,
      });
      const list = state.messages.get(state.currentChannelId) || [];
      list.push({ ts: String(Date.now() / 1000), userName: "You", text });
      state.messages.set(state.currentChannelId, list);
      renderMessages();
      log(`Sent to ${channelLabel(state.currentChannelId)}: ${text}`);
    } catch (e) {
      log(`Send failed: ${e.message}`);
    }
  }

  function channelLabel(channelId) {
    const c = state.channelIndex.get(channelId);
    return c ? c.name : channelId;
  }

  // --- Socket Mode -----------------------------------------------------

  async function connect() {
    state.appToken = els.appToken.value.trim();
    state.botToken = els.botToken.value.trim();
    if (!state.appToken || !state.botToken) {
      setStatus("Enter both tokens first", false);
      return;
    }
    if (els.remember.checked) {
      localStorage.setItem(STORAGE_APP_TOKEN, state.appToken);
      localStorage.setItem(STORAGE_BOT_TOKEN, state.botToken);
      localStorage.setItem(STORAGE_REMEMBER, "1");
    } else {
      localStorage.removeItem(STORAGE_APP_TOKEN);
      localStorage.removeItem(STORAGE_BOT_TOKEN);
      localStorage.removeItem(STORAGE_REMEMBER);
    }

    if (window.Notification && Notification.permission === "default") {
      Notification.requestPermission();
    }

    setStatus("Connecting…", false);
    try {
      await openSocket();
      await loadChannels();
      setStatus("Connected", true);
      els.connectBtn.textContent = "Disconnect";
      els.connectBtn.dataset.connected = "1";
    } catch (e) {
      setStatus(`Connection failed: ${e.message}`, false);
      log(e.message);
    }
  }

  async function openSocket() {
    const data = await slackApi("apps.connections.open", state.appToken, {});
    const ws = new WebSocket(data.url);
    state.ws = ws;
    ws.onmessage = onSocketMessage;
    ws.onclose = () => {
      if (state.currentlyDisconnecting) return;
      log("Socket closed, reconnecting in 3s…");
      state.reconnectTimer = setTimeout(() => {
        openSocket().catch((e) => log(`Reconnect failed: ${e.message}`));
      }, 3000);
    };
    await new Promise((resolve, reject) => {
      ws.onopen = () => resolve();
      ws.onerror = () => reject(new Error("WebSocket error"));
    });
  }

  function disconnect() {
    state.currentlyDisconnecting = true;
    clearTimeout(state.reconnectTimer);
    if (state.ws) state.ws.close();
    state.ws = null;
    setStatus("Disconnected", false);
    els.connectBtn.textContent = "Connect";
    els.connectBtn.dataset.connected = "0";
    state.currentlyDisconnecting = false;
  }

  function onSocketMessage(event) {
    let data;
    try {
      data = JSON.parse(event.data);
    } catch (e) {
      return;
    }
    if (data.envelope_id) {
      state.ws.send(JSON.stringify({ envelope_id: data.envelope_id }));
    }
    if (data.type === "disconnect") {
      log("Slack requested reconnect.");
      openSocket().catch((e) => log(`Reconnect failed: ${e.message}`));
      return;
    }
    if (data.type === "hello") {
      log("Socket Mode ready.");
      return;
    }
    const event2 = data.payload && data.payload.event;
    if (event2 && event2.type === "message" && !event2.subtype) {
      handleIncomingMessage(event2);
    }
  }

  async function handleIncomingMessage(event) {
    const channel = await resolveChannel(event.channel);
    const userName = event.user
      ? await resolveUserName(event.user)
      : event.username || "Slack";
    const text = event.text || "";
    const list = state.messages.get(channel.id) || [];
    list.push({ ts: event.ts, userName, text });
    state.messages.set(channel.id, list);

    if (channel.id === state.currentChannelId) {
      renderMessages();
    } else {
      channel.unread = true;
      renderChannelList();
    }

    notify(channel.name, userName, text);
    if (state.announce) {
      speak(`${channel.name}, from ${userName}: ${text}`);
    }
  }

  function notify(channelName, userName, text) {
    if (window.Notification && Notification.permission === "granted") {
      new Notification(channelName, { body: `${userName}: ${text}` });
    }
  }

  // --- Rendering ---------------------------------------------------

  function renderChannelList() {
    els.channelList.innerHTML = "";
    for (const channel of state.channels) {
      const item = document.createElement("button");
      item.type = "button";
      item.className = "sm-channel";
      if (channel.id === state.currentChannelId) item.classList.add("sm-channel-active");
      if (channel.unread) item.classList.add("sm-channel-unread");
      item.textContent = channel.name;
      item.addEventListener("click", () => selectChannel(channel.id));
      els.channelList.appendChild(item);
    }
  }

  function renderMessages() {
    const list = state.messages.get(state.currentChannelId) || [];
    els.feed.innerHTML = "";
    for (const m of list) {
      const row = document.createElement("div");
      row.className = "sm-message";
      const who = document.createElement("span");
      who.className = "sm-message-user";
      who.textContent = m.userName;
      const body = document.createElement("span");
      body.className = "sm-message-text";
      body.textContent = m.text;
      row.appendChild(who);
      row.appendChild(body);
      els.feed.appendChild(row);
    }
    els.feed.scrollTop = els.feed.scrollHeight;
    els.feedTitle.textContent = channelLabel(state.currentChannelId);
  }

  function selectChannel(channelId) {
    state.currentChannelId = channelId;
    const channel = state.channelIndex.get(channelId);
    if (channel) channel.unread = false;
    renderChannelList();
    if (!state.messages.get(channelId) || !state.messages.get(channelId).length) {
      loadHistory(channelId);
    } else {
      renderMessages();
    }
  }

  function stepChannel(delta) {
    if (!state.channels.length) return;
    const idx = state.channels.findIndex((c) => c.id === state.currentChannelId);
    const next = (idx + delta + state.channels.length) % state.channels.length;
    selectChannel(state.channels[next].id);
  }

  function findChannelByName(fragment) {
    fragment = fragment.trim().toLowerCase();
    return state.channels.find((c) =>
      c.name.toLowerCase().replace(/^#/, "").includes(fragment),
    );
  }

  // --- Voice -----------------------------------------------------------

  function speak(text) {
    if (!window.speechSynthesis) return;
    const utter = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(utter);
  }

  function readChannelAloud() {
    const list = state.messages.get(state.currentChannelId) || [];
    if (!list.length) {
      speak("No messages yet.");
      return;
    }
    const recent = list.slice(-5);
    const text = recent.map((m) => `${m.userName} said: ${m.text}`).join(". ");
    speak(text);
  }

  function setupRecognition() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      els.voiceBtn.disabled = true;
      els.voiceBtn.textContent = "Voice not supported in this browser";
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";
    recognition.onresult = (e) => {
      const transcript =
        e.results[e.results.length - 1][0].transcript.trim().toLowerCase();
      log(`Heard: "${transcript}"`);
      handleVoiceCommand(transcript);
    };
    const fatalErrors = new Set(["not-allowed", "service-not-allowed", "audio-capture"]);
    recognition.onerror = (e) => {
      log(`Voice recognition error: ${e.error}`);
      if (fatalErrors.has(e.error)) {
        state.listening = false;
        els.voiceBtn.textContent = "🎤 Start voice commands";
        els.voiceBtn.classList.remove("sm-voice-active");
      }
    };
    recognition.onend = () => {
      if (state.listening) recognition.start();
    };
    state.recognition = recognition;
  }

  function toggleListening() {
    if (!state.recognition) return;
    state.listening = !state.listening;
    if (state.listening) {
      state.recognition.start();
      els.voiceBtn.textContent = "🎤 Listening… (click to stop)";
      els.voiceBtn.classList.add("sm-voice-active");
    } else {
      state.recognition.stop();
      els.voiceBtn.textContent = "🎤 Start voice commands";
      els.voiceBtn.classList.remove("sm-voice-active");
    }
  }

  function handleVoiceCommand(text) {
    let m;
    if (/^(read|catch me up on)( the)? (messages|channel)/.test(text)) {
      readChannelAloud();
    } else if (/^next channel/.test(text)) {
      stepChannel(1);
      speak(`Switched to ${channelLabel(state.currentChannelId)}`);
    } else if (/^(previous|last) channel/.test(text)) {
      stepChannel(-1);
      speak(`Switched to ${channelLabel(state.currentChannelId)}`);
    } else if ((m = text.match(/^(?:select channel|open|switch to|go to) (.+)/))) {
      const channel = findChannelByName(m[1]);
      if (channel) {
        selectChannel(channel.id);
        speak(`Switched to ${channel.name}`);
      } else {
        speak(`I couldn't find a channel matching ${m[1]}`);
      }
    } else if ((m = text.match(/^(?:reply|send|say)(?: with)? (.+)/))) {
      sendReply(m[1]);
      speak("Sent.");
    } else if (/^stop listening/.test(text)) {
      toggleListening();
    } else {
      log(`Voice command not recognized: "${text}"`);
    }
  }

  // --- Wiring ------------------------------------------------------------

  document.addEventListener("DOMContentLoaded", () => {
    els = {
      appToken: $("sm-app-token"),
      botToken: $("sm-bot-token"),
      remember: $("sm-remember"),
      connectBtn: $("sm-connect"),
      status: $("sm-status"),
      log: $("sm-log"),
      channelList: $("sm-channel-list"),
      feed: $("sm-feed"),
      feedTitle: $("sm-feed-title"),
      replyInput: $("sm-reply-input"),
      replyBtn: $("sm-reply-send"),
      voiceBtn: $("sm-voice-toggle"),
      readBtn: $("sm-read-aloud"),
      announceCheckbox: $("sm-announce"),
    };
    if (!els.connectBtn) return; // page markup not present

    if (localStorage.getItem(STORAGE_REMEMBER) === "1") {
      els.appToken.value = localStorage.getItem(STORAGE_APP_TOKEN) || "";
      els.botToken.value = localStorage.getItem(STORAGE_BOT_TOKEN) || "";
      els.remember.checked = true;
    }

    els.connectBtn.addEventListener("click", () => {
      if (els.connectBtn.dataset.connected === "1") {
        disconnect();
      } else {
        connect();
      }
    });
    els.replyBtn.addEventListener("click", () => {
      sendReply(els.replyInput.value);
      els.replyInput.value = "";
    });
    els.replyInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendReply(els.replyInput.value);
        els.replyInput.value = "";
      }
    });
    els.voiceBtn.addEventListener("click", toggleListening);
    els.readBtn.addEventListener("click", readChannelAloud);
    els.announceCheckbox.addEventListener("change", () => {
      state.announce = els.announceCheckbox.checked;
    });

    setupRecognition();
    setStatus("Not connected", false);
  });
})();
