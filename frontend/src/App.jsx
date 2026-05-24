import { useEffect, useState } from "react";
import { Bot, LogOut, Moon, Sparkles, Sun } from "lucide-react";
import { useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import ChatPage from "./pages/ChatPage";

export default function App() {
  const { isAuthenticated, logout, user } = useAuth();
  const [theme, setTheme] = useState(() => localStorage.getItem("niyalgpt_theme") || "dark");

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem("niyalgpt_theme", theme);
  }, [theme]);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand">
          <div className="logo-mark" aria-label="NiyalGPT logo">
            <Bot size={22} />
          </div>
          <div>
            <strong>NiyalGPT</strong>
            <span>Futuristic AI workspace</span>
          </div>
        </div>

        <div className="topbar-actions">
          <button
            className="icon-button"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle color mode"
            title="Toggle color mode"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          {isAuthenticated && (
            <>
              <span className="user-chip">
                <Sparkles size={14} />
                {user?.name}
              </span>
              <button className="ghost-button" onClick={logout}>
                <LogOut size={16} />
                Logout
              </button>
            </>
          )}
        </div>
      </header>

      <main>{isAuthenticated ? <ChatPage /> : <AuthPage />}</main>

      <footer>
        Designed &amp; Developed by{" "}
        <a href="https://niyal.netlify.app/" target="_blank" rel="noreferrer">
          Niyal Rahaman
        </a>
      </footer>
    </div>
  );
}
