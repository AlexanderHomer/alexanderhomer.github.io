---
layout: default
title: Slack Monitor
---

# Slack Monitor

A live Slack inbox that runs entirely in this browser tab — no server involved. It connects straight to Slack, shows new messages as they arrive, notifies you, and lets you reply or navigate channels by voice.

**Security note:** the tokens you enter below are used only to talk to Slack's API directly from your browser. If you check "Remember on this device" they're saved in this browser's local storage. Treat them like passwords — don't paste them on a shared computer, and don't share this page's URL alongside your tokens.

## One-time setup

1. Go to [api.slack.com/apps](https://api.slack.com/apps) and create a new app "from scratch" in your workspace.
2. Under **Socket Mode**, turn it on and generate an **app-level token** with the `connections:write` scope. This is the token starting with `xapp-`.
3. Under **OAuth & Permissions**, add these **Bot Token Scopes**: `channels:history`, `channels:read`, `groups:history`, `groups:read`, `im:history`, `im:read`, `mpim:history`, `mpim:read`, `chat:write`, `users:read`.
4. Under **Event Subscriptions**, enable events and subscribe to the bot event `message.channels` (and `message.groups`, `message.im`, `message.mpim` for private channels/DMs/group DMs).
5. Install the app to your workspace, then copy the **Bot User OAuth Token** (starts with `xoxb-`) from OAuth & Permissions.
6. Invite the bot to whichever channels you want it to monitor (`/invite @your-bot-name`).

## Voice commands

Click "Start voice commands" and try:

* "read messages" — reads the last few messages in the current channel aloud
* "next channel" / "previous channel" — moves between channels
* "select channel general" — jumps to a channel by name
* "reply running ten minutes late" — sends that text to the current channel
* "stop listening" — turns off voice commands

<div id="sm-app">
  <div class="sm-panel">
    <label>App-level token (xapp-...)<input type="password" id="sm-app-token" autocomplete="off" /></label>
    <label>Bot token (xoxb-...)<input type="password" id="sm-bot-token" autocomplete="off" /></label>
    <label class="sm-checkbox"><input type="checkbox" id="sm-remember" checked /> Remember on this device</label>
    <div class="sm-panel-actions">
      <button type="button" id="sm-connect">Connect</button>
      <span id="sm-status" class="sm-status">Not connected</span>
    </div>
  </div>

  <div class="sm-main">
    <div class="sm-sidebar">
      <div id="sm-channel-list"></div>
    </div>
    <div class="sm-feed-panel">
      <h3 id="sm-feed-title">No channel selected</h3>
      <div id="sm-feed" class="sm-feed"></div>
      <div class="sm-reply-row">
        <textarea id="sm-reply-input" rows="1" placeholder="Type a reply and press Enter…"></textarea>
        <button type="button" id="sm-reply-send">Send</button>
      </div>
    </div>
  </div>

  <div class="sm-voice-bar">
    <button type="button" id="sm-voice-toggle">🎤 Start voice commands</button>
    <button type="button" id="sm-read-aloud">🔊 Read channel aloud</button>
    <label class="sm-checkbox"><input type="checkbox" id="sm-announce" /> Announce new messages</label>
  </div>

  <details class="sm-log-details">
    <summary>Activity log</summary>
    <div id="sm-log" class="sm-log"></div>
  </details>
</div>

<style>
  #sm-app {
    font-family: "GT Standard", sans-serif;
  }
  .sm-panel {
    display: flex;
    flex-wrap: wrap;
    align-items: end;
    gap: 1rem;
    padding: 1rem;
    border-radius: 0.75rem;
    border: 1px solid #d0d7de;
    background-color: #f6f8fa;
    margin-bottom: 1rem;
  }
  .sm-panel label {
    display: flex;
    flex-direction: column;
    font-size: 0.85rem;
    gap: 0.25rem;
  }
  .sm-panel input[type="password"] {
    padding: 0.4rem 0.5rem;
    border-radius: 0.4rem;
    border: 1px solid #d0d7de;
    min-width: 16rem;
  }
  .sm-checkbox {
    flex-direction: row !important;
    align-items: center;
    gap: 0.4rem !important;
  }
  .sm-panel-actions {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }
  #sm-connect {
    padding: 0.5rem 1.1rem;
    border-radius: 0.5rem;
    border: 1px solid #0969da;
    background: #0969da;
    color: #fff;
    cursor: pointer;
  }
  .sm-status {
    font-weight: 600;
  }
  .sm-status-ok {
    color: #00782a;
  }
  .sm-status-bad {
    color: #8a6100;
  }
  .sm-main {
    display: flex;
    gap: 1rem;
    min-height: 20rem;
  }
  .sm-sidebar {
    width: 12rem;
    flex-shrink: 0;
    border-right: 1px solid #d0d7de;
    padding-right: 0.75rem;
    overflow-y: auto;
  }
  .sm-channel {
    display: block;
    width: 100%;
    text-align: left;
    padding: 0.5rem 0.6rem;
    border: none;
    background: none;
    border-radius: 0.4rem;
    cursor: pointer;
    color: inherit;
    font-size: 0.9rem;
  }
  .sm-channel:hover {
    background: #e7f1ff;
  }
  .sm-channel-active {
    background: #0969da;
    color: #fff;
  }
  .sm-channel-unread {
    font-weight: 700;
  }
  .sm-feed-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .sm-feed {
    flex: 1;
    overflow-y: auto;
    border: 1px solid #d0d7de;
    border-radius: 0.5rem;
    padding: 0.75rem;
    min-height: 14rem;
  }
  .sm-message {
    display: block;
    margin-bottom: 0.5rem;
  }
  .sm-message-user {
    font-weight: 700;
    margin-right: 0.4rem;
  }
  .sm-reply-row {
    display: flex;
    gap: 0.5rem;
    margin-top: 0.75rem;
  }
  .sm-reply-row textarea {
    flex: 1;
    padding: 0.5rem;
    border-radius: 0.4rem;
    border: 1px solid #d0d7de;
    resize: vertical;
    font-family: inherit;
  }
  .sm-reply-row button {
    padding: 0.5rem 1rem;
    border-radius: 0.4rem;
    border: 1px solid #0969da;
    background: #0969da;
    color: #fff;
    cursor: pointer;
  }
  .sm-voice-bar {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 1rem;
    margin-top: 1rem;
  }
  .sm-voice-bar button {
    padding: 0.5rem 1rem;
    border-radius: 999px;
    border: 1px solid #d0d7de;
    background: #f6f8fa;
    cursor: pointer;
  }
  .sm-voice-active {
    background: #ffe680 !important;
    border-color: #8a6100 !important;
  }
  .sm-log-details {
    margin-top: 1rem;
  }
  .sm-log {
    max-height: 8rem;
    overflow-y: auto;
    font-family: monospace;
    font-size: 0.8rem;
    padding: 0.5rem;
    border: 1px solid #d0d7de;
    border-radius: 0.4rem;
    margin-top: 0.5rem;
  }
  @media (prefers-color-scheme: dark) {
    .sm-panel,
    .sm-feed,
    .sm-log {
      background-color: #1f2937;
      border-color: #334155;
    }
    .sm-panel input[type="password"],
    .sm-reply-row textarea {
      background-color: #0d1117;
      border-color: #334155;
      color: #c9d1d9;
    }
    .sm-sidebar {
      border-color: #334155;
    }
    .sm-channel:hover {
      background: #24314a;
    }
    .sm-voice-bar button {
      background: #1f2937;
      border-color: #334155;
    }
  }
</style>

<script src="{{ '/on-call/slack-monitor.js' | relative_url }}"></script>

[Back to On-Call Resources](index.html)
