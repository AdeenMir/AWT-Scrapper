import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./auth.css";
import { signup } from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function Signup() {
  const navigate = useNavigate();
  const { login: setAuthUser } = useAuth();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const { data } = await signup(form);

      if (data?.user) setAuthUser(data.user);

      navigate("/home");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        "Signup failed. Please try again.";
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
            Create your account
            <span className="heroAccent">.</span>
          </h1>

          <p className="heroSubtitle">
            Start scraping, tracking, and reporting with a premium dark dashboard feel.
          </p>

          <div className="ctaRow">
            <Link className="btnPrimary" to="/login">
              Already have an account
            </Link>
            <Link className="btnGhost" to="/home">
              Back to Home
            </Link>
          </div>
        </aside>

        <main className="authRight">
          <div className="cardGlow" />

          <section className="authCard" aria-label="Signup form">
            <header className="cardHeader">
              <h2>Sign up</h2>
              <p>Create an account to continue.</p>
            </header>

            {error ? <div className="authAlert" role="alert">{error}</div> : null}

            <form className="authForm" onSubmit={onSubmit}>
              <label className="field">
                <span>Name</span>
                <input
                  name="name"
                  type="text"
                  placeholder="Your name"
                  value={form.name}
                  onChange={onChange}
                  autoComplete="name"
                  required
                />
              </label>

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
                    placeholder="At least 8 characters"
                    value={form.password}
                    onChange={onChange}
                    autoComplete="new-password"
                    minLength={8}
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

              <label className="check">
                <input type="checkbox" required />
                <span>
                  I agree to the <button type="button" className="linkBtn" onClick={() => alert("Add Terms page")}>Terms</button>
                </span>
              </label>

              <button className="submitBtn" type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </button>

              <p className="switchText">
                Already have an account? <Link to="/login">Login</Link>
              </p>
            </form>
          </section>
        </main>
      </div>
    </div>
  );
}