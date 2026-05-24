import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, User } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export default function AuthPage() {
  const { authenticate } = useAuth();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authenticate(mode, form);
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="home-grid">
      <div className="hero-copy">
        <div className="eyebrow">AI chat, engineered beautifully</div>
        <h1>NiyalGPT</h1>
        <p>
          A production-ready AI assistant experience with secure accounts, saved chat history,
          custom personalities, Markdown answers, and a polished responsive interface.
        </p>
        <div className="hero-strip">
          <span>JWT Auth</span>
          <span>MongoDB</span>
          <span>OpenAI-ready API</span>
        </div>
      </div>

      <form className="auth-panel" onSubmit={submit}>
        <div className="auth-tabs">
          <button type="button" className={mode === "login" ? "active" : ""} onClick={() => setMode("login")}>
            Login
          </button>
          <button type="button" className={mode === "signup" ? "active" : ""} onClick={() => setMode("signup")}>
            Sign up
          </button>
        </div>

        {mode === "signup" && (
          <label>
            <User size={17} />
            <input
              placeholder="Full name"
              value={form.name}
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              required
            />
          </label>
        )}

        <label>
          <Mail size={17} />
          <input
            type="email"
            placeholder="Email address"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>

        <label>
          <LockKeyhole size={17} />
          <input
            type="password"
            placeholder="Password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            minLength={6}
            required
          />
        </label>

        {error && <div className="error-box">{error}</div>}

        <button className="primary-button" disabled={loading}>
          {loading ? "Please wait..." : mode === "login" ? "Enter NiyalGPT" : "Create account"}
          <ArrowRight size={17} />
        </button>
      </form>
    </section>
  );
}
