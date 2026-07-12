import { KeyRound, Server, ShieldCheck } from "lucide-react";
import { useAdminAuth } from "../../context/AdminAuthContext";

function AdminSettings() {
  const { admin } = useAdminAuth();

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">SİSTEM</p>
          <h1>Ayarlar</h1>
          <p>Admin erişimi ve backend bağlantısının temel yapılandırması.</p>
        </div>
      </div>

      <div className="admin-settings-grid">
        <section className="admin-panel admin-settings-card">
          <div className="admin-settings-icon"><ShieldCheck size={22} /></div>
          <div>
            <h2>Aktif yönetici</h2>
            <p>{admin?.email || "—"}</p>
            <span>Oturum süresi güvenlik için 12 saatle sınırlıdır.</span>
          </div>
        </section>

        <section className="admin-panel admin-settings-card">
          <div className="admin-settings-icon"><Server size={22} /></div>
          <div>
            <h2>API bağlantısı</h2>
            <p>VITE_API_BASE_URL</p>
            <span>Boş bırakıldığında frontend aynı domain üzerindeki /api yolunu kullanır.</span>
          </div>
        </section>

        <section className="admin-panel admin-settings-card admin-settings-card-wide">
          <div className="admin-settings-icon"><KeyRound size={22} /></div>
          <div>
            <h2>Railway ortam değişkenleri</h2>
            <p className="admin-code-line">ADMIN_EMAIL</p>
            <p className="admin-code-line">ADMIN_PASSWORD</p>
            <p className="admin-code-line">ADMIN_TOKEN_SECRET</p>
            <span>Token secret en az 32 karakter olmalı. Bu değerler repoya yazılmaz, Railway Variables alanında tutulur.</span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminSettings;
