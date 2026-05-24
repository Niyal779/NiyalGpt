const API_URL =
  window.NIYALGPT_API_URL ||
  (window.location.hostname.includes("netlify.app")
    ? "/.netlify/functions/chat"
    : window.location.protocol === "http:" || window.location.protocol === "https:"
      ? "api/chat.php"
      : "http://localhost:5000/api/chat");

const messagesEl = document.getElementById("messages");
const chatListEl = document.getElementById("chatList");
const form = document.getElementById("chatForm");
const input = document.getElementById("messageInput");
const hero = document.getElementById("hero");
const newChatBtn = document.getElementById("newChat");
const themeToggle = document.getElementById("themeToggle");
const personalitySelect = document.getElementById("personality");
const sidebar = document.getElementById("sidebar");
const openSidebar = document.getElementById("openSidebar");
const closeSidebar = document.getElementById("closeSidebar");
const sendButton = document.getElementById("sendButton");

let chats = JSON.parse(localStorage.getItem("niyalgpt_chats") || "[]");
let activeChatId = localStorage.getItem("niyalgpt_active_chat") || null;
let theme = localStorage.getItem("niyalgpt_theme") || "dark";
let isSending = false;

localStorage.removeItem("niyalgpt_static_chats");
localStorage.removeItem("niyalgpt_static_active");
localStorage.removeItem("niyalgpt_static_theme");

function saveState() {
  localStorage.setItem("niyalgpt_chats", JSON.stringify(chats));
  if (activeChatId) {
    localStorage.setItem("niyalgpt_active_chat", activeChatId);
  } else {
    localStorage.removeItem("niyalgpt_active_chat");
  }
}

function createChat(firstMessage = "New chat") {
  const chat = {
    id: crypto.randomUUID ? crypto.randomUUID() : String(Date.now()),
    title: firstMessage.slice(0, 42),
    personality: personalitySelect.value,
    messages: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  chats.unshift(chat);
  activeChatId = chat.id;
  saveState();
  return chat;
}

function getActiveChat() {
  return chats.find((chat) => chat.id === activeChatId) || null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function highlightCode(code) {
  return escapeHtml(code)
    .replace(
      /\b(const|let|var|function|return|if|else|for|while|async|await|try|catch|import|from|export|class|new)\b/g,
      '<span style="color:#7dd3fc">$1</span>'
    )
    .replace(/(&quot;.*?&quot;|'.*?')/g, '<span style="color:#86efac">$1</span>')
    .replace(/\b(\d+)\b/g, '<span style="color:#fbbf24">$1</span>');
}

function parseInlineMarkdown(text) {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>")
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noreferrer">$1</a>');
}

function formatMarkdown(content) {
  const blocks = [];
  const tokenized = content.replace(/```(\w+)?\n?([\s\S]*?)```/g, (_match, language = "", code = "") => {
    const token = `%%CODE_BLOCK_${blocks.length}%%`;
    blocks.push(
      `<pre><code data-language="${escapeHtml(language || "code")}">${highlightCode(code.trim())}</code></pre>`
    );
    return token;
  });

  const html = tokenized
    .split(/\n{2,}/)
    .map((part) => {
      const trimmed = part.trim();
      if (!trimmed) return "";
      if (/^%%CODE_BLOCK_\d+%%$/.test(trimmed)) return trimmed;

      if (/^#{1,3}\s/.test(trimmed)) {
        const level = trimmed.match(/^#+/)[0].length;
        return `<h${level}>${parseInlineMarkdown(trimmed.replace(/^#{1,3}\s/, ""))}</h${level}>`;
      }

      if (/^[-*]\s/m.test(trimmed)) {
        const items = trimmed
          .split("\n")
          .filter((line) => /^[-*]\s/.test(line.trim()))
          .map((line) => `<li>${parseInlineMarkdown(line.replace(/^[-*]\s/, ""))}</li>`)
          .join("");
        return `<ul>${items}</ul>`;
      }

      if (/^\d+\.\s/m.test(trimmed)) {
        const items = trimmed
          .split("\n")
          .filter((line) => /^\d+\.\s/.test(line.trim()))
          .map((line) => `<li>${parseInlineMarkdown(line.replace(/^\d+\.\s/, ""))}</li>`)
          .join("");
        return `<ol>${items}</ol>`;
      }

      return `<p>${parseInlineMarkdown(trimmed).replace(/\n/g, "<br />")}</p>`;
    })
    .join("");

  return blocks.reduce((output, block, index) => output.replace(`%%CODE_BLOCK_${index}%%`, block), html);
}

function renderChats() {
  chatListEl.innerHTML = "";

  if (!chats.length) {
    chatListEl.innerHTML = '<p class="empty-note">No saved chats yet.</p>';
    return;
  }

  chats.forEach((chat) => {
    const button = document.createElement("button");
    button.className = `chat-item ${chat.id === activeChatId ? "active" : ""}`;
    button.innerHTML = `
      <span class="chat-title">${escapeHtml(chat.title)}</span>
      <span class="delete-button" title="Delete chat">x</span>
    `;

    button.addEventListener("click", () => {
      activeChatId = chat.id;
      personalitySelect.value = chat.personality || personalitySelect.value;
      saveState();
      render();
      sidebar.classList.remove("open");
    });

    button.querySelector(".delete-button").addEventListener("click", (event) => {
      event.stopPropagation();
      chats = chats.filter((item) => item.id !== chat.id);
      if (activeChatId === chat.id) activeChatId = chats[0]?.id || null;
      saveState();
      render();
    });

    chatListEl.appendChild(button);
  });
}

function renderMessages() {
  const chat = getActiveChat();
  messagesEl.innerHTML = "";

  if (!chat || chat.messages.length === 0) {
    hero.classList.remove("hidden");
    return;
  }

  hero.classList.add("hidden");

  chat.messages.forEach((message) => {
    const row = document.createElement("article");
    row.className = `message-row ${message.role}`;
    row.innerHTML = `
      <div class="avatar">
        ${message.role === "assistant" ? '<img src="assets/logo.jpg" alt="NiyalGPT" />' : "You"}
      </div>
      <div class="bubble">
        ${message.role === "assistant" ? '<button class="copy-button" title="Copy response">Copy</button>' : ""}
        ${formatMarkdown(message.content)}
      </div>
    `;

    const copyButton = row.querySelector(".copy-button");
    if (copyButton) {
      copyButton.addEventListener("click", async () => {
        await navigator.clipboard.writeText(message.content);
        copyButton.textContent = "Done";
        setTimeout(() => {
          copyButton.textContent = "Copy";
        }, 1200);
      });
    }

    messagesEl.appendChild(row);
  });

  requestAnimationFrame(() => {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  });
}

function render() {
  renderChats();
  renderMessages();
}

function showTyping() {
  const row = document.createElement("article");
  row.className = "message-row assistant";
  row.id = "typingRow";
  row.innerHTML = `
    <div class="avatar"><img src="assets/logo.jpg" alt="NiyalGPT" /></div>
    <div class="bubble typing">
      <span></span><span></span><span></span>
    </div>
  `;
  messagesEl.appendChild(row);
  messagesEl.scrollTop = messagesEl.scrollHeight;
}

function removeTyping() {
  document.getElementById("typingRow")?.remove();
}

async function requestAiReply(chat) {
  const response = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      personality: chat.personality,
      messages: chat.messages
        .filter((message) => !message.content.startsWith("**Error:**"))
        .map(({ role, content }) => ({ role, content }))
    })
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Gemini API request failed.");
  }

  if (!data.reply || typeof data.reply !== "string") {
    throw new Error("The AI service returned no answer.");
  }

  return data.reply;
}

async function sendMessage(text) {
  const clean = text.trim();
  if (!clean || isSending) return;

  isSending = true;
  sendButton.disabled = true;

  let chat = getActiveChat();
  if (!chat) chat = createChat(clean);
  if (chat.messages.length === 0) chat.title = clean.slice(0, 42);

  chat.personality = personalitySelect.value;
  chat.updatedAt = new Date().toISOString();
  chat.messages.push({ role: "user", content: clean });

  saveState();
  render();
  showTyping();

  try {
    const reply = await requestAiReply(chat);
    chat.messages.push({
      role: "assistant",
      content: reply
    });
  } catch (error) {
    chat.messages.push({
      role: "assistant",
      content: `**Error:** ${error.message}\n\nPlease check that the backend is running and your Gemini API key is set correctly.`
    });
  } finally {
    chat.updatedAt = new Date().toISOString();
    saveState();
    removeTyping();
    isSending = false;
    sendButton.disabled = false;
    render();
    input.focus();
  }
}

form.addEventListener("submit", (event) => {
  event.preventDefault();
  sendMessage(input.value);
  input.value = "";
  input.style.height = "auto";
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

document.querySelectorAll("[data-prompt]").forEach((button) => {
  button.addEventListener("click", () => {
    sendMessage(button.dataset.prompt);
  });
});

newChatBtn.addEventListener("click", () => {
  activeChatId = null;
  localStorage.removeItem("niyalgpt_active_chat");
  render();
  sidebar.classList.remove("open");
  input.focus();
});

personalitySelect.addEventListener("change", () => {
  const chat = getActiveChat();
  if (chat) {
    chat.personality = personalitySelect.value;
    saveState();
  }
});

themeToggle.addEventListener("click", () => {
  theme = theme === "dark" ? "light" : "dark";
  localStorage.setItem("niyalgpt_theme", theme);
  applyTheme();
});

function applyTheme() {
  document.body.classList.toggle("light", theme === "light");
  themeToggle.textContent = theme === "light" ? "Dark" : "Light";
}

openSidebar.addEventListener("click", () => sidebar.classList.add("open"));
closeSidebar.addEventListener("click", () => sidebar.classList.remove("open"));

applyTheme();
render();
