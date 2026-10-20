const API_BASE_URL = "https://fakestoreapi.com";

export async function fetchProducts() {
  const response = await fetch(`${API_BASE_URL}/products`);

  if (!response.ok) {
    throw new Error(
      `Unable to load products. Server returned ${response.status}.`
    );
  }

  const products = await response.json();

  if (!Array.isArray(products)) {
    throw new Error("Invalid product data received from the API.");
  }

  return products;
}

export async function fetchCategories() {
  const response = await fetch(`${API_BASE_URL}/products/categories`);

  if (!response.ok) {
    throw new Error("Unable to load product categories.");
  }

  const categories = await response.json();

  if (!Array.isArray(categories)) {
    throw new Error("Invalid category data received from the API.");
  }

  return categories;
}
