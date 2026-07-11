const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  ""
);

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      Accept: "application/json",
      ...options.headers,
    },
    ...options,
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || "Request failed.");
    error.status = response.status;
    throw error;
  }

  return payload;
}

function createQueryString(parameters) {
  const query = new URLSearchParams();

  Object.entries(parameters).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    query.set(key, String(value));
  });

  const queryString = query.toString();
  return queryString ? `?${queryString}` : "";
}

export async function getProducts(parameters = {}, options = {}) {
  return request(`/api/products${createQueryString(parameters)}`, options);
}

export async function getProduct(productKey, options = {}) {
  return request(
    `/api/products/${encodeURIComponent(productKey)}`,
    options
  );
}

export async function getProductCategories(options = {}) {
  return request("/api/products/categories", options);
}
