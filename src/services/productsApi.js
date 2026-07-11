const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL || "").replace(
  /\/$/,
  ""
);

function getActiveLanguage() {
  if (typeof window === "undefined") return "en";
  return localStorage.getItem("language") || navigator.language || "en";
}

function withActiveLanguage(parameters = {}) {
  return {
    ...parameters,
    lang: parameters.lang || getActiveLanguage(),
  };
}

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
  return request(
    `/api/products${createQueryString(withActiveLanguage(parameters))}`,
    options
  );
}

export async function getProduct(productKey, options = {}) {
  return request(
    `/api/products/${encodeURIComponent(productKey)}${createQueryString(
      withActiveLanguage()
    )}`,
    options
  );
}

export async function getProductCategories(options = {}) {
  return request(
    `/api/products/categories${createQueryString(withActiveLanguage())}`,
    options
  );
}
