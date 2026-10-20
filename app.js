import { fetchProducts, fetchCategories } from "./api.js";

// DOM elements
const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const categoryFilter = document.querySelector("#categoryFilter");
const sortFilter = document.querySelector("#sortFilter");
const errorBanner = document.querySelector("#errorBanner");
const statusMessage = document.querySelector("#statusMessage");
const emptyMessage = document.querySelector("#emptyMessage");

// Application state
let allProducts = [];
let categories = [];

let cart = JSON.parse(localStorage.getItem("productExplorerCart") || "[]");

if (!Array.isArray(cart)) {
  cart = [];
}

// Loading skeletons
function showSkeletons() {
  productGrid.innerHTML = Array.from(
    { length: 8 },
    () => '<div class="skeleton" aria-hidden="true"></div>'
  ).join("");
}

// Error banner
function showError(message) {
  errorBanner.textContent = message;
  errorBanner.hidden = false;
}

function hideError() {
  errorBanner.hidden = true;
  errorBanner.textContent = "";
}

// Load categories into dropdown
function renderCategories() {
  categoryFilter.innerHTML = '<option value="all">All Categories</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Create a product card safely
function createProductCard(product) {
  const card = document.createElement("article");
  card.className = "product-card";

  const image = document.createElement("img");
  image.className = "product-image";
  image.src = product.image;
  image.alt = product.title;
  image.loading = "lazy";
  image.onerror = () => {
    image.hidden = true;
  };

  const category = document.createElement("span");
  category.className = "product-category";
  category.textContent = product.category;

  const title = document.createElement("h2");
  title.className = "product-title";
  title.textContent = product.title;

  const description = document.createElement("p");
  description.className = "product-description";
  description.textContent =
    product.description.length > 100
      ? product.description.slice(0, 100) + "..."
      : product.description;

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = `$${Number(product.price).toFixed(2)}`;

  const button = document.createElement("button");
  button.className = "add-to-cart";
  button.type = "button";

  const quantity = cart.filter(
    (item) => item.id === product.id
  ).length;

  button.textContent = quantity > 0
    ? `Add to Cart (${quantity} added)`
    : "Add to Cart";

  button.addEventListener("click", () => addToCart(product));

  card.append(image, category, title, description, price, button);

  return card;
}

// Render products
function renderProducts(products) {
  productGrid.replaceChildren();

  products.forEach((product) => {
    productGrid.appendChild(createProductCard(product));
  });

  statusMessage.textContent = products.length
    ? `Showing ${products.length} product(s)`
    : "";

  emptyMessage.hidden = products.length !== 0;
}

// Search, filter and sort
function applyFilters() {
  const searchTerm = searchInput.value.trim().toLowerCase();
  const selectedCategory = categoryFilter.value;
  const sortValue = sortFilter.value;

  let filteredProducts = allProducts.filter((product) => {
    const matchesSearch =
      product.title.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm);

    const matchesCategory =
      selectedCategory === "all" ||
      product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  if (sortValue === "price-asc") {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortValue === "price-desc") {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortValue === "name-asc") {
    filteredProducts.sort((a, b) =>
      a.title.localeCompare(b.title)
    );
  }

  renderProducts(filteredProducts);
}

// Save cart in localStorage
function saveCart() {
  try {
    localStorage.setItem("productExplorerCart", JSON.stringify(cart));
  } catch (error) {
    showError("Cart could not be saved in this browser.");
  }
}

// Add product to cart
function addToCart(product) {
  cart.push({
    id: product.id,
    title: product.title,
    price: product.price
  });

  saveCart();
  applyFilters();
}

// Load data from API
async function initApp() {
  showSkeletons();
  statusMessage.textContent = "Loading products...";
  hideError();

  try {
    const [products, loadedCategories] = await Promise.all([
      fetchProducts(),
      fetchCategories()
    ]);

    allProducts = products;
    categories = loadedCategories;

    renderCategories();
    applyFilters();
  } catch (error) {
    productGrid.replaceChildren();
    statusMessage.textContent = "";
    showError(
      "We couldn't load products. Please check your internet connection and try again."
    );

    const retryButton = document.createElement("button");
    retryButton.className = "add-to-cart";
    retryButton.textContent = "Try Again";
    retryButton.addEventListener("click", initApp);

    productGrid.appendChild(retryButton);
    console.error("Product loading failed:", error);
  }
}

// Event listeners
searchInput.addEventListener("input", applyFilters);
categoryFilter.addEventListener("change", applyFilters);
sortFilter.addEventListener("change", applyFilters);

// Start the application
initApp();
