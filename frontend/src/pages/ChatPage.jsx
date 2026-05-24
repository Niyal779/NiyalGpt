import { useEffect, useMemo, useRef, useState } from "react";
import { Menu, Plus, SendHorizonal, Trash2, X } from "lucide-react";
import { api } from "../utils/api";
import MessageBubble from "../components/MessageBubble";
import TypingIndicator from "../components/TypingIndicator";

const personalities = [
  "Helpful, concise, friendly software engineering assistant.",
  "Creative product strategist with crisp, premium advice.",
  "Senior full-stack mentor who explains tradeoffs clearly.",
  "Playful futuristic AI companion with practical answers."
];

export default function ChatPage() {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [message, setMessage] = useState("");
  const [personality, setPersonality] = useState(personalities[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const endRef = useRef(null);

  const messages = activeChat?.messages || [];
  const hasConversation = messages.length > 0;

  useEffect(() => {
    loadChats();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function loadChats() {
    const { data } = await api.get("/chats");
    setChats(data.chats);
  }

  async function selectChat(id) {
    setError("");
    const { data } = await api.get(`/chats/${id}`);
    setActiveChat(data.chat);
    setPersonality(data.chat.personality);
    setSidebarOpen(false);
  }

  function newChat() {
    setActiveChat(null);
    setMessage("");
    setError("");
    setSidebarOpen(false);
  }

  async function deleteChat(id) {
    await api.delete(`/chats/${id}`);
    if (activeChat?._id === id) setActiveChat(null);
    await loadChats();
  }

  async function submit(event) {
    event.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    setError("");
    const outgoing = message.trim();
    setMessage("");

    try {
      const request = activeChat
        ? api.post(`/chats/${activeChat._id}/messages`, { message: outgoing, personality })
        : api.post("/chats", { message: outgoing, personality });
      const { data } = await request;
      setActiveChat(data.chat);
      await loadChats();
    } catch (err) {
      setError(err.response?.data?.message || "NiyalGPT could not respond right now.");
      setMessage(outgoing);
    } finally {
      setLoading(false);
    }
  }

  const sortedChats = useMemo(() => chats, [chats]);

  return (
    <section className="chat-layout">
      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="sidebar-head">
          <button className="primary-button compact" onClick={newChat}>
            <Plus size={16} />
            New chat
          </button>
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={18} />
          </button>
        </div>

        <div className="conversation-list">
          {sortedChats.map((chat) => (
            <button
              key={chat._id}
              className={`conversation-item ${activeChat?._id === chat._id ? "active" : ""}`}
              onClick={() => selectChat(chat._id)}
            >
              <span>{chat.title}</span>
              <Trash2
                size={15}
                onClick={(event) => {
                  event.stopPropagation();
                  deleteChat(chat._id);
                }}
              />
            </button>
          ))}
          {!sortedChats.length && <p className="muted">Your conversations will appear here.</p>}
        </div>
      </aside>

      <div className="chat-panel">
        <div className="chat-toolbar">
          <button className="icon-button mobile-only" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={18} />
          </button>
          <select value={personality} onChange={(event) => setPersonality(event.target.value)}>
            {personalities.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div className="messages">
          {!hasConversation && (
            <div className="empty-state">
              <div className="logo-mark large">N</div>
              <h2>How can NiyalGPT help today?</h2>
              <p>Ask for code, strategy, writing, debugging, architecture, or creative direction.</p>
            </div>
          )}
          {messages.map((item) => (
            <MessageBubble key={item._id || `${item.role}-${item.createdAt}`} message={item} />
          ))}
          {loading && <TypingIndicator />}
          <div ref={endRef} />
        </div>

        {error && <div className="error-box chat-error">{error}</div>}

        <form className="composer" onSubmit={submit}>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Message NiyalGPT..."
            rows={1}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) submit(event);
            }}
          />
          <button className="send-button" disabled={loading || !message.trim()} aria-label="Send message">
            <SendHorizonal size={19} />
          </button>
        </form>
      </div>
    </section>
  );
}
