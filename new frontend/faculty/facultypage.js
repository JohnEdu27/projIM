// ─────────────────────────────────────────
// FACULTY HOMEPAGE JS
// ─────────────────────────────────────────
const email = localStorage.getItem("userEmail");
// API base URL - replace with classmate's IP when ready
const API_BASE = "http://127.0.0.1:8000";

 let data = []
// store all products globally for search filterin

// wait for page to load
document.addEventListener("DOMContentLoaded", () => {
  console.log("👨‍🏫 Faculty homepage loaded!");

  // check if faculty is logged in
  checkSession();

  // load products from API or localStorage
  loadProducts();

  // setup logout
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // close modals when clicking outside
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", function(e) {
      if (e.target === this) this.classList.remove("open");
    });
  });
});

// ─────────────────────────────────────────
// CHECK SESSION
// Redirects to login if not logged in
// ─────────────────────────────────────────
function checkSession() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!user || !isLoggedIn) {
    window.location.href = "../Frontend.html";
    return;
  }

  // show user info
  const name = user.fullname || user.name || "Faculty";
  document.getElementById("userName").textContent = name;
  document.getElementById("welcomeName").textContent = name;
  document.getElementById("userPhoto").src = user.photoURL ||
    `https://via.placeholder.com/40/FF6600/ffffff?text=${name.charAt(0).toUpperCase()}`;
}

// ─────────────────────────────────────────
// LOAD PRODUCTS
// Tries API first then falls back to localStorage
// ─────────────────────────────────────────
async function loadProducts() {
  showLoading(true);
 
  try {
    // try to fetch from classmate's API
    const response = await fetch(`${API_BASE}/products`);
    
    if (response.ok) {
      data = await response.json();
      console.log(`✅ Loaded ${data.length} products from API`);
    } else {
      throw new Error("API error");
    }

  } catch (error) {
    // API not running - use localStorage
    console.log("⚠️ API offline");
    alert(error);
  };
  
  showLoading(false);
  renderProducts(data);
  updateStats();
}

// ─────────────────────────────────────────
// GET LOCAL PRODUCTS
// Reads products from localStorage
// ────────────────────────────────────────
// ─────────────────────────────────────────
// SAVE LOCAL PRODUCTS
// Saves products to localStorage
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// RENDER PRODUCTS
// Creates a row for each product in the list
// ─────────────────────────────────────────
async function renderProducts(products) {
  const list = document.getElementById("productsList");

  // empty state
  if (products === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🍽️</div>
        <h3>No menu items found</h3>
        <p>Click "Add Item" to add your first product.</p>
      </div>`;
    return;
  }

  // build rows
  list.innerHTML = "";

  products.forEach(product => {
    const row = createProductRow(product);
    list.appendChild(row);
  });
}

// ─────────────────────────────────────────
// CREATE PRODUCT ROW
// Builds a single product row with actions
// ─────────────────────────────────────────
function createProductRow(product) {
  const row = document.createElement("div");
  row.classList.add("product-row");
  row.id = product.productID;

  // determine stock status
  let stockClass = "stock-ok";
  let stockText = `${product.quantity} in stock`;

  if (product.quantity === 0) {
    stockClass = "stock-out";
    stockText = "Out of stock";
  } else if (product.quantity <= 5) {
    stockClass = "stock-low";
    stockText = `${product.quantity} left — Low!`;
  }

  row.innerHTML = `
    <!-- product image -->
    <img
      class="product-img"
      src="../images/${product.img}" alt="${product.productName}"
      onerror="this.src='https://via.placeholder.com/200x140/FF6600/ffffff?text=${encodeURIComponent(product.productName)}'">

    <!-- product info -->
    <div class="product-info">
      <div class="product-name">${product.productName}</div>
      <div class="product-meta">ID: ${product.productID}</div>
    </div>

    <!-- stock badge -->
    <span class="stock-badge ${stockClass}">${stockText}</span>

    <!-- price -->
    <span class="product-price">₱${product.price}</span>

    <!-- action buttons -->
    <div class="action-btns">
      <button class="btn-restock"
        onclick="openRestock(${product.productID}, '${product.productName}')">
        📦 Restock
      </button>
      <button class="btn-update"
        onclick="openUpdate(${product.productID})">
        ✏️ Update
      </button>
      <button class="btn-delete"
        onclick="openDelete(${product.productID}, '${product.productName}')">
        🗑️ Delete
      </button>
    </div>
  `;

  return row;
}

// ─────────────────────────────────────────
// UPDATE STATS
// Updates the stat boxes at the top
// ─────────────────────────────────────────
function updateStats() {
  const total = data.length;
  const low = data.filter(p => p.quantity > 0 && p.quantity <= 5).length;
  const out = data.filter(p => p.quantity === 0).length;

  document.getElementById("totalProducts").textContent = total;
  document.getElementById("lowStockCount").textContent = low;
  document.getElementById("outOfStockCount").textContent = out;
}

// ─────────────────────────────────────────
// SEARCH PRODUCTS
// Filters products by name in real time
// ─────────────────────────────────────────
window.searchProducts = function() {
  const query = document.getElementById("searchBar").value.toLowerCase().trim();

  if (!query) {
    renderProducts(data);
    return;
  }

  const filtered = data.filter(p =>
    p.productName.toLowerCase().includes(query)
  );

  renderProducts(filtered);
};

// ─────────────────────────────────────────
// TOGGLE ADD FORM
// Shows or hides the add item form
// ─────────────────────────────────────────
window.toggleAddForm = function() {
  const form = document.getElementById("addForm");
  form.classList.toggle("open");

  if (form.classList.contains("open")) {
    // clear fields when opening
    document.getElementById("addName").value = "";
    document.getElementById("addPrice").value = "";
    document.getElementById("addQty").value = "";
    document.getElementById("addImg").value = "";
    document.getElementById("addName").focus();
  }
};

// ─────────────────────────────────────────
// ADD PRODUCT
// Validates and creates new product
// Tries API then falls back to localStorage
// ─────────────────────────────────────────
window.addProduct = async function() {
  const name = document.getElementById("addName").value.trim();
  const price = parseFloat(document.getElementById("addPrice").value);
  const qty = parseInt(document.getElementById("addQty").value);
  const img = document.getElementById("addImg").value.trim();

  const ProductsAdd = {
    ProductName : name,
    quantity : qty,
    price : price,
    img : img
  }

  // validate
  if (!name) { alert("Product name is required!"); return; }
  if (!price || price <= 0) { alert("Enter a valid price!"); return; }
  if (qty === undefined || qty < 0) { alert("Enter a valid quantity!"); return; }

  try {
    // try API first
    const response = await fetch(`${API_BASE}/product` ,{
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(ProductsAdd)
    });

    if (response.ok) {
      alert("✅ Product added to database!");
      await loadProducts();
    } else {
      throw new Error("API error");
    }

  } catch (error) {
    // save to localStorage
    alert(error)
    console.error(error)
  }

  // hide form
  toggleAddForm();
};

// ─────────────────────────────────────────
// OPEN RESTOCK MODAL
// Shows restock modal for selected product
// ─────────────────────────────────────────
window.openRestock = function(id, name) {
  document.getElementById("restockId").value = id;
  document.getElementById("restockItemName").textContent = `Adding stock to: ${name}`;
  document.getElementById("restockQty").value = "";
  document.getElementById("restockModal").classList.add("open");
};

// ─────────────────────────────────────────
// CONFIRM RESTOCK
// Adds stock to the product quantity
// ─────────────────────────────────────────
window.confirmRestock = async function() {
  const id = parseInt(document.getElementById("restockId").value);
  const addQty = parseInt(document.getElementById("restockQty").value);

  if (!addQty || addQty <= 0) {
    alert("Enter a valid quantity to add!");
    return;
  }
  
  // find the product
  const responze = await fetch(`${API_BASE}/product/one`, {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify({ product_id : id })
  });

  const product = await responze.json();
  if (!product) return;

  const newQty = product.quantity + addQty;
  
  
  const RestockProduct = {
    product_id : id,
    numberOFStock : newQty,
    email : email
  }
  try {
    // try API update
    const response = await fetch(`${API_BASE}/product`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(RestockProduct)
    });

    if (response.ok) {
      alert(`✅ Added ${addQty} units to ${product.productName}!`);
      await loadProducts();
    } else {
      throw new Error("API error");
    }

  } catch (error) {
    // update localStorage
    renderProducts(data);
    updateStats();
    alert(`✅ Added ${addQty} units to ${product.productName}!`);
  }

  closeModal("restockModal");
};

// ─────────────────────────────────────────
// OPEN UPDATE MODAL
// Fills update form with current product data
// ─────────────────────────────────────────
window.openUpdate = function(id) {
  const product = data.find(p => p.productID === id);
  if (!product) return;

  document.getElementById("updateId").value = product.productID;
  document.getElementById("updateName").value = product.productName;
  document.getElementById("updatePrice").value = product.price;
  document.getElementById("updateQty").value = product.quantity;
  document.getElementById("updateImg").value = product.img || "";
  document.getElementById("updateModal").classList.add("open");
};

// ─────────────────────────────────────────
// CONFIRM UPDATE
// Saves updated product data
// ─────────────────────────────────────────
window.confirmUpdate = async function() {
  const id = parseInt(document.getElementById("updateId").value);
  const name = document.getElementById("updateName").value.trim();
  const price = parseFloat(document.getElementById("updatePrice").value);
  const qty = parseInt(document.getElementById("updateQty").value);
  const img = document.getElementById("updateImg").value.trim();

  if (!name || !price || qty === undefined) {
    alert("Please fill all fields!");
    return;
  }

  const UpdateProduct = {
    product_id : id,
    productName : name,
    quantity : qty,
    price : price,
    img : img
  }
  try {
    // try API update
    const response = await fetch(`${API_BASE}/product/update`, {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(UpdateProduct)
    })

    if (response.ok) {
      alert("✅ Product updated in database!");
      await loadProducts();
    } else {
      throw new Error("API error");
    }

  } catch (error) {
    alert(error)
    console.error(error)
  }

  closeModal("updateModal");
};

// ─────────────────────────────────────────
// OPEN DELETE MODAL
// Shows delete confirmation for product
// ─────────────────────────────────────────
window.openDelete = function(id, name) {
  document.getElementById("deleteId").value = id;
  document.getElementById("deleteItemName").textContent = `Are you sure you want to delete "${name}"? This cannot be undone.`;
  document.getElementById("deleteModal").classList.add("open");
};

// ─────────────────────────────────────────
// CONFIRM DELETE
// Removes product from list
// ─────────────────────────────────────────
window.confirmDelete = async function() {
  const id = parseInt(document.getElementById("deleteId").value);

  try {
    // try API delete
    const response = await fetch(`${API_BASE}/product`, {
      method: 'DELETE',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({ product_id : id })
    });

    if (response.ok) {
      alert("🗑️ Product deleted from database!", "info");
      await loadProducts();
    } else {
      throw new Error("API error");
    }

  } catch (error) {
    alert(error)
    console.error(error)
  }

  closeModal("deleteModal");
};

// ─────────────────────────────────────────
// CLOSE MODAL
// Hides any modal by ID
// ─────────────────────────────────────────
window.closeModal = function(id) {
  document.getElementById(id).classList.remove("open");
};

// ─────────────────────────────────────────
// SHOW LOADING
// Shows or hides the loading state
// ─────────────────────────────────────────
function showLoading(show) {
  const loading = document.getElementById("loadingState");
  if (loading) loading.style.display = show ? "block" : "none";
}

// ─────────────────────────────────────────
// SHOW NOTIFICATION
// Green/red/blue popup that disappears
// ────────────────────────────────────────

// ─────────────────────────────────────────
// LOGOUT
// Clears session and goes to login
// ─────────────────────────────────────────
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");
  window.location.href = "../Frontend.html";
}