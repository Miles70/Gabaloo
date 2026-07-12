import { useCallback, useEffect, useMemo, useState } from "react";
import { Package, Plus, RefreshCw, Save, Search } from "lucide-react";
import ProductCreateModal from "../../components/admin/ProductCreateModal";
import { useAdminAuth } from "../../context/AdminAuthContext";
import {
  createAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from "../../services/adminApi";

function AdminProducts() {
  const { token } = useAdminAuth();
  const [products, setProducts] = useState([]);
  const [dirtyKeys, setDirtyKeys] = useState(() => new Set());
  const [savingKey, setSavingKey] = useState("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const loadProducts = useCallback(async () => {
    setIsLoading(true);
    setError("");

    try {
      const data = await getAdminProducts(token);
      setProducts(data.products || []);
      setDirtyKeys(new Set());
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setIsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const visibleProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return products;

    return products.filter((product) =>
      [product.key, product.title, product.categoryKey]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(term))
    );
  }, [products, search]);

  function updateLocalProduct(productKey, field, value) {
    setProducts((current) =>
      current.map((product) => (product.key === productKey ? { ...product, [field]: value } : product))
    );
    setDirtyKeys((current) => {
      const next = new Set(current);
      next.add(productKey);
      return next;
    });
    setSuccess("");
  }

  async function createProduct(payload) {
    setError("");
    setSuccess("");
    const data = await createAdminProduct(token, payload);
    setProducts((current) => [...current, data.product]);
    setSuccess(`${data.product.title} kataloğa eklendi.`);
  }

  async function saveProduct(product) {
    setSavingKey(product.key);
    setError("");
    setSuccess("");

    try {
      const payload = {
        title: product.title,
        price: Number(product.price),
        oldPrice: product.oldPrice === "" || product.oldPrice === null ? null : Number(product.oldPrice),
        stock: Number(product.stock),
        badge: product.badge || null,
        isActive: Boolean(product.isActive),
      };
      const data = await updateAdminProduct(token, product.key, payload);
      setProducts((current) =>
        current.map((item) => (item.key === product.key ? data.product : item))
      );
      setDirtyKeys((current) => {
        const next = new Set(current);
        next.delete(product.key);
        return next;
      });
      setSuccess(`${product.title} güncellendi.`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingKey("");
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page-heading">
        <div>
          <p className="admin-eyebrow">KATALOG</p>
          <h1>Ürünler</h1>
          <p>Fiyat, stok, rozet ve yayın durumunu doğrudan MongoDB kataloğunda güncelle.</p>
        </div>
        <div className="admin-heading-actions">
          <button className="admin-primary-button" type="button" onClick={() => setIsCreateOpen(true)}>
            <Plus size={18} /> Yeni ürün
          </button>
          <button className="admin-secondary-button" type="button" onClick={loadProducts} disabled={isLoading}>
            <RefreshCw size={18} className={isLoading ? "is-spinning" : ""} /> Yenile
          </button>
        </div>
      </div>

      <section className="admin-toolbar">
        <label className="admin-search-box">
          <Search size={18} />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Ürün, anahtar veya kategori ara..."
          />
        </label>
        <div className="admin-toolbar-summary">
          <span>{products.filter((product) => product.isActive).length} aktif</span>
          <span>{dirtyKeys.size} kaydedilmemiş</span>
        </div>
      </section>

      {error ? <div className="admin-alert admin-alert-error">{error}</div> : null}
      {success ? <div className="admin-alert admin-alert-success">{success}</div> : null}

      <section className="admin-panel">
        <div className="admin-table-wrap">
          <table className="admin-table admin-products-table">
            <thead>
              <tr>
                <th>Ürün</th>
                <th>Kategori</th>
                <th>Fiyat</th>
                <th>Eski fiyat</th>
                <th>Stok</th>
                <th>Rozet</th>
                <th>Yayında</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {!isLoading && visibleProducts.length ? (
                visibleProducts.map((product) => (
                  <tr key={product.key} className={dirtyKeys.has(product.key) ? "is-dirty" : ""}>
                    <td>
                      <div className="admin-product-cell">
                        <div className="admin-product-thumb">
                          {product.imageUrl ? <img src={product.imageUrl} alt="" /> : product.image || "🛍️"}
                        </div>
                        <div>
                          <input
                            className="admin-table-input admin-product-title-input"
                            value={product.title}
                            onChange={(event) => updateLocalProduct(product.key, "title", event.target.value)}
                          />
                          <span>{product.key}</span>
                        </div>
                      </div>
                    </td>
                    <td><span className="admin-category-pill">{product.categoryKey}</span></td>
                    <td>
                      <input
                        className="admin-table-input admin-number-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.price}
                        onChange={(event) => updateLocalProduct(product.key, "price", event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="admin-table-input admin-number-input"
                        type="number"
                        min="0"
                        step="0.01"
                        value={product.oldPrice ?? ""}
                        placeholder="—"
                        onChange={(event) => updateLocalProduct(product.key, "oldPrice", event.target.value)}
                      />
                    </td>
                    <td>
                      <input
                        className="admin-table-input admin-stock-input"
                        type="number"
                        min="0"
                        value={product.stock}
                        onChange={(event) => updateLocalProduct(product.key, "stock", event.target.value)}
                      />
                    </td>
                    <td>
                      <select
                        className="admin-inline-select"
                        value={product.badge || ""}
                        onChange={(event) => updateLocalProduct(product.key, "badge", event.target.value)}
                      >
                        <option value="">Yok</option>
                        <option value="sale">sale</option>
                        <option value="new">new</option>
                        <option value="stock">stock</option>
                      </select>
                    </td>
                    <td>
                      <label className="admin-switch">
                        <input
                          type="checkbox"
                          checked={Boolean(product.isActive)}
                          onChange={(event) => updateLocalProduct(product.key, "isActive", event.target.checked)}
                        />
                        <span />
                      </label>
                    </td>
                    <td>
                      <button
                        className="admin-save-button"
                        type="button"
                        disabled={!dirtyKeys.has(product.key) || savingKey === product.key}
                        onClick={() => saveProduct(product)}
                      >
                        <Save size={16} />
                        {savingKey === product.key ? "..." : "Kaydet"}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8">
                    <div className="admin-empty-state">
                      <Package size={24} />
                      {isLoading ? "Ürünler yükleniyor..." : "Bu aramada ürün bulunamadı."}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {isCreateOpen ? (
        <ProductCreateModal onClose={() => setIsCreateOpen(false)} onCreate={createProduct} />
      ) : null}
    </div>
  );
}

export default AdminProducts;
