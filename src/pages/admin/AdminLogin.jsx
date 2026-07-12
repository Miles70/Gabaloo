import { useState } from "react";
import { Eye, EyeOff, LockKeyhole, ShieldCheck } from "lucide-react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAdminAuth } from "../../context/AdminAuthContext";

function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const { token, isChecking, login } = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!isChecking && token) {
    return <Navigate to="/admin" replace />;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(location.state?.from || "/admin", { replace: true });
    } catch (loginError) {
      setError(loginError.message || "Giriş yapılamadı.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-glow admin-login-glow-one" />
      <div className="admin-login-glow admin-login-glow-two" />

      <section className="admin-login-card">
        <div className="admin-login-icon">
          <ShieldCheck size={31} />
        </div>
        <p className="admin-eyebrow">COMMAND CENTER</p>
        <h1>Admin paneline giriş</h1>
        <p className="admin-login-copy">
          Siparişleri, ürünleri ve mağaza operasyonunu buradan yönetiyoruz.
        </p>

        <form onSubmit={handleSubmit}>
          <label className="admin-field">
            <span>E-posta</span>
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              placeholder="admin@example.com"
              required
            />
          </label>

          <label className="admin-field">
            <span>Şifre</span>
            <div className="admin-password-field">
              <LockKeyhole size={18} />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••••••"
                required
              />
              <button
                type="button"
                aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                onClick={() => setShowPassword((current) => !current)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>

          {error ? <div className="admin-form-error">{error}</div> : null}

          <button className="admin-primary-button admin-login-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Giriş yapılıyor..." : "Panele gir"}
          </button>
        </form>

        <div className="admin-security-note">
          <ShieldCheck size={16} />
          Oturum anahtarı yalnızca bu tarayıcı sekmesi boyunca saklanır.
        </div>
      </section>
    </div>
  );
}

export default AdminLogin;
