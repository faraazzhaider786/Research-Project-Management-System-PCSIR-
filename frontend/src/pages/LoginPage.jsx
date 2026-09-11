import { useState } from "react";
import { ArrowRight, LockKeyhole, Mail, ShieldCheck } from "lucide-react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/useAuth";

function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const location = useLocation();
  const [credentials, setCredentials] = useState({ email: "admin@pcsir.gov.pk", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (isAuthenticated) return <Navigate to={location.state?.from?.pathname || "/dashboard"} replace />;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      await login(credentials);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to sign in. Check your credentials and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-art">
        <div className="login-art-inner">
          <div className="brand-lockup"><div className="brand-symbol large">P</div><strong>PCSIR</strong></div>
          <span className="login-overline">Research intelligence platform</span>
          <h1>Turn research into <em>measurable progress.</em></h1>
          <p>One secure workspace for the people, places and programs behind Pakistan&apos;s scientific future.</p>
          <div className="login-trust"><ShieldCheck size={18} /><span>Protected government workspace</span></div>
        </div>
        <div className="login-art-orb orb-one" /><div className="login-art-orb orb-two" />
      </section>
      <section className="login-form-panel">
        <div className="login-form-wrap">
          <div className="mobile-brand"><div className="brand-symbol">P</div><strong>PCSIR</strong></div>
          <span className="form-overline">Welcome back</span>
          <h2>Sign in to your workspace</h2>
          <p className="form-intro">Use your PCSIR credentials to continue.</p>
          <form onSubmit={handleSubmit} className="auth-form">
            <label className="field-label">Email address
              <div className="input-with-icon"><Mail size={18} /><input type="email" value={credentials.email} onChange={(event) => setCredentials({ ...credentials, email: event.target.value })} placeholder="admin@pcsir.gov.pk" required /></div>
            </label>
            <label className="field-label">Password
              <div className="input-with-icon"><LockKeyhole size={18} /><input type="password" value={credentials.password} onChange={(event) => setCredentials({ ...credentials, password: event.target.value })} placeholder="Enter your password" required /></div>
            </label>
            {error && <p className="error-message">{error}</p>}
            <button className="primary-button login-submit" type="submit" disabled={submitting}>{submitting ? "Signing in..." : "Continue"} {!submitting && <ArrowRight size={18} />}</button>
          </form>
          <p className="login-footer">Need access? Contact your system administrator.</p>
        </div>
      </section>
    </main>
  );
}

export default LoginPage;
