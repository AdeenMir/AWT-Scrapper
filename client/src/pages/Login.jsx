import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";
import { login } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();

  const [form, setForm] = useState({ email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await login(form);

      if (data?.user) setAuthUser(data.user);

      navigate("/home");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Login failed. Please check your credentials.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authPage">
      <div className="authShell">
        <aside className="authLeft">
          <div className="brandTop">
            <div className="brandMark" aria-hidden="true">⚡</div>
            <div className="brandText">WebScraper</div>
          </div>

          <div className="pill">Powerful Web Scraping</div>

          <h1 className="heroTitle">
            Welcome back
            <span className="heroAccent">.</span>
          </h1>

          <p className="heroSubtitle">
            Login to manage reports, schedules, and extract data instantly with a clean, dark interface.
          </p>

          <div className="ctaRow">
            <Link className="btnPrimary" to="/signup">
              Create account
            </Link>
            <Link className="btnGhost" to="/home">
              Back to Home
            </Link>
          </div>
        </aside>

        <main className="authRight">
          <div className="cardGlow" />

          <section className="authCard" aria-label="Login form">
            <header className="cardHeader">
              <h2>Login</h2>
              <p>Enter your credentials to continue.</p>
            </header>

            {error ? <div className="authAlert" role="alert">{error}</div> : null}

            <form className="authForm" onSubmit={onSubmit}>
              <label className="field">
                <span>Email</span>
                <input
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={onChange}
                  autoComplete="email"
                  required
                />
              </label>

              <label className="field">
                <span>Password</span>
                <div className="pwWrap">
                  <input
                    name="password"
                    type={showPw ? "text" : "password"}
                    placeholder="••••••••"
                    value={form.password}
                    onChange={onChange}
                    autoComplete="current-password"
                    required
                  />
                  <button
                    type="button"
                    className="pwToggle"
                    onClick={() => setShowPw((s) => !s)}
                    aria-label={showPw ? "Hide password" : "Show password"}
                  >
                    {showPw ? "Hide" : "Show"}
                  </button>
                </div>
              </label>

              <div className="row">
                <label className="check">
                  <input type="checkbox" defaultChecked />
                  <span>Remember me</span>
                </label>

                <button type="button" className="linkBtn" onClick={() => alert("Wire this to your reset flow")}>
                  Forgot password?
                </button>
              </div>

              <button className="submitBtn" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>

              <p className="switchText">
                Don’t have an account? <Link to="/signup">Sign up</Link>
              </p>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}