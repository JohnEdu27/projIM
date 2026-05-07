// ─────────────────────────────────────────
// ADMIN MENU MANAGEMENT
// Handles add, edit, delete products
// All data saved to localStorage
// No Firebase needed
// ─────────────────────────────────────────

// wait for the page to fully load before running any code
document.addEventListener("DOMContentLoaded", () => {
  console.log("🍽️ Menu management loaded!");

  // check if the person is an admin
  // if not, redirect them to login
  if (!checkAdminSession()) return;

  // setup all the form listeners
  setupMenu();
});

// ─────────────────────────────────────────
// CHECK ADMIN SESSION
// Reads currentUser from localStorage
// If not admin, sends back to login page
// ─────────────────────────────────────────
function checkAdminSession() {
  // get the current logged in user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // if no user or user email does not contain "admin" - block access
  if (!currentUser || !currentUser.email.includes("admin")) {
    console.log("❌ Admin access denied");
    // redirect to login page
    window.location.href = "../Frontend.html";
    // return false so the rest of the code does not run
    return false;
  }

  // show the admin name and photo in the topbar
  showUserInfo(currentUser);

  // load the products table
  loadProducts();

  // setup the logout button
  setupLogout();

  // return true so setup continues
  return true;
}

// ─────────────────────────────────────────
// SHOW USER INFO
// Displays admin name and photo in topbar
// ─────────────────────────────────────────
function showUserInfo(user) {
  // get the display name - use fullname or name or default to Admin
  const displayName = user.fullname || user.name || "Admin";

  // set the name text in the topbar
  document.getElementById('userName').textContent = displayName;

  // set a placeholder profile photo using first letter of name
  document.getElementById('userPhoto').src =
    `https://via.placeholder.com/40/FF6600/ffffff?text=${displayName.charAt(0).toUpperCase()}`;
}

// ─────────────────────────────────────────
// SETUP MENU
// Attaches event listeners to all forms and buttons
// ─────────────────────────────────────────
function setupMenu() {
  // listen for add product form submission
  document.getElementById('addProductForm').addEventListener('submit', addProduct);

  // listen for edit product form submission
  document.getElementById('editProductForm').addEventListener('submit', updateProduct);

  // listen for close modal button click
  document.getElementById('closeModal').addEventListener('click', closeModal);

  console.log("✅ Menu management ready!");
}

// ─────────────────────────────────────────
// LOAD PRODUCTS
// Gets products from localStorage
// Creates a table row for each product
// ─────────────────────────────────────────
function loadProducts() {
  // get all products from localStorage
  const products = getProducts();

  // get the table body element
  const tbody = document.getElementById('productsTable');

  // clear existing rows
  tbody.innerHTML = '';

  // if no products show a message
  if (products.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;color:#888;padding:2rem;">No products yet. Add one above!</td></tr>';
    return;
  }

  // create a row for each product and add to table
  products.forEach(product => {
    const row = createProductRow(product);
    tbody.appendChild(row);
  });

  console.log(`✅ Loaded ${products.length} products`);
}

// ─────────────────────────────────────────
// GET PRODUCTS
// Reads products array from localStorage
// Returns empty array if nothing saved yet
// ─────────────────────────────────────────
function getProducts() {
  // parse the JSON string from localStorage or return empty array
  return JSON.parse(localStorage.getItem('adminProducts') || '[]');
}

// ─────────────────────────────────────────
// SAVE PRODUCTS
// Saves the entire products array to localStorage
// Called after every add, edit, or delete
// ─────────────────────────────────────────
function saveProducts(products) {
  // convert array to JSON string and save
  localStorage.setItem('adminProducts', JSON.stringify(products));
}

// ─────────────────────────────────────────
// CREATE PRODUCT ROW
// Builds a single table row for one product
// Includes edit and delete buttons
// ─────────────────────────────────────────
function createProductRow(product) {
  // create a new table row element
  const row = document.createElement('tr');

  // fill the row with product data and action buttons
  row.innerHTML = `
    <!-- product ID -->
    <td>${product.id}</td>
    <!-- product name -->
    <td>${product.name}</td>
    <!-- product price with peso sign -->
    <td>₱${product.price}</td>
    <!-- product quantity -->
    <td>${product.quantity}</td>
    <!-- edit and delete buttons - call functions with product id -->
    <td>
      <button class="btn-edit" onclick="editProduct(${product.id})">Edit</button>
      <button class="btn-delete" onclick="deleteProduct(${product.id})">Delete</button>
    </td>
  `;

  return row;
}

// ─────────────────────────────────────────
// ADD PRODUCT
// Reads the add form values
// Creates a new product and saves it
// ─────────────────────────────────────────
function addProduct(e) {
  // stop the page from reloading on form submit
  e.preventDefault();

  // get values from the form
  const name = document.getElementById('productName').value.trim();
  const price = parseFloat(document.getElementById('productPrice').value);
  const quantity = parseInt(document.getElementById('productQty').value);

  // basic validation check
  if (!name || price <= 0 || quantity < 0) {
    alert('Please fill all fields correctly');
    return;
  }

  // get existing products
  const products = getProducts();

  // generate a new ID - find the highest existing ID and add 1
  // if no products yet start at 1
  const newId = products.length ? Math.max(...products.map(p => p.id)) + 1 : 1;

  // create the new product object
  const newProduct = { id: newId, name, price, quantity };

  // add new product to the array
  products.push(newProduct);

  // save updated products to localStorage
  saveProducts(products);

  // reload the table to show the new product
  loadProducts();

  // clear the form fields
  e.target.reset();

  // show success notification
  showNotification('✅ Product added successfully!');
  console.log('➕ Added:', newProduct);
}

// ─────────────────────────────────────────
// EDIT PRODUCT
// Opens the edit modal and fills it with
// the selected product's current data
// ─────────────────────────────────────────
function editProduct(id) {
  // get all products from localStorage
  const products = getProducts();

  // find the product with the matching ID
  const product = products.find(p => p.id === id);

  // if product not found stop here
  if (!product) return;

  // fill the modal form with current product data
  document.getElementById('editProductId').value = id;
  document.getElementById('editProductName').value = product.name;
  document.getElementById('editProductPrice').value = product.price;
  document.getElementById('editProductQty').value = product.quantity;

  // show the modal by changing display to flex
  document.getElementById('editModal').style.display = 'flex';
}

// ─────────────────────────────────────────
// UPDATE PRODUCT
// Saves the edited product data
// Called when edit form is submitted
// ─────────────────────────────────────────
function updateProduct(e) {
  // stop page from reloading
  e.preventDefault();

  // get the product ID from the hidden input
  const id = parseInt(document.getElementById('editProductId').value);

  // get the new values from the edit form
  const name = document.getElementById('editProductName').value.trim();
  const price = parseFloat(document.getElementById('editProductPrice').value);
  const quantity = parseInt(document.getElementById('editProductQty').value);

  // basic validation
  if (!name || price <= 0 || quantity < 0) {
    alert('Please fill all fields correctly');
    return;
  }

  // get all products
  const products = getProducts();

  // find the index of the product being edited
  const productIndex = products.findIndex(p => p.id === id);

  // if not found stop here
  if (productIndex === -1) return;

  // replace the old product data with the new data
  products[productIndex] = { id, name, price, quantity };

  // save the updated products array
  saveProducts(products);

  // reload the table to show updated data
  loadProducts();

  // close the modal
  closeModal();

  // show success notification
  showNotification('✅ Product updated!');
}

// ─────────────────────────────────────────
// DELETE PRODUCT
// Asks for confirmation then removes
// the product from localStorage
// ─────────────────────────────────────────
function deleteProduct(id) {
  // ask admin to confirm before deleting
  if (!confirm('Are you sure you want to delete this product?')) return;

  // get all products
  const products = getProducts();

  // filter out the product with the matching ID
  // this creates a new array without the deleted product
  const newProducts = products.filter(p => p.id !== id);

  // save the new array without the deleted product
  saveProducts(newProducts);

  // reload the table
  loadProducts();

  // show notification
  showNotification('🗑️ Product deleted!');
}

// ─────────────────────────────────────────
// CLOSE MODAL
// Hides the edit modal
// ─────────────────────────────────────────
function closeModal() {
  // hide the modal by setting display to none
  document.getElementById('editModal').style.display = 'none';
}

// ─────────────────────────────────────────
// SETUP LOGOUT
// Clears localStorage and goes to login
// ─────────────────────────────────────────
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      // clear all saved data
      localStorage.clear();
      // go back to login page
      window.location.href = "../Frontend.html";
    });
  }
}

// ─────────────────────────────────────────
// SHOW NOTIFICATION
// Creates a small popup message at the top
// Disappears after 3 seconds automatically
// ─────────────────────────────────────────
function showNotification(message) {
  // create a new div element for the notification
  const notification = document.createElement('div');

  // add the notification class for styling
  notification.className = 'notification';

  // set the message text
  notification.textContent = message;

  // add to the page
  document.body.appendChild(notification);

  // remove it after 3 seconds automatically
  setTimeout(() => notification.remove(), 3000);
}

// ─────────────────────────────────────────
// ADMIN TEST LOGIN
// Type adminTestLogin() in browser console
// to quickly log in as admin for testing
// ─────────────────────────────────────────
window.adminTestLogin = function() {
  // create a fake admin user object
  const adminUser = {
    email: "admin@campus.com",
    fullname: "Menu Admin",
    uid: "admin_menu"
  };

  // save to localStorage as if they logged in
  localStorage.setItem("currentUser", JSON.stringify(adminUser));
  localStorage.setItem("isLoggedIn", "true");

  console.log("🧑‍💼 Admin logged in - refresh the page!");
};