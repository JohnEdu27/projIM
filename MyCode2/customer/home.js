// ─────────────────────────────────────────
// HOME PAGE
// Shows profile name, menu with images,
// and order history from localStorage
// ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  console.log("🏠 Home page loaded!");

  // check if user is logged in
  checkUserSession();

  // setup logout button
  setupLogout();
});

// ─────────────────────────────────────────
// CHECK USER SESSION
// Redirects to login if not logged in
// ─────────────────────────────────────────
function checkUserSession() {
  // get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // if no user or not logged in go to login page
  if (!currentUser || localStorage.getItem("isLoggedIn") !== "true") {
    console.log("❌ No user session - redirecting to login");
    window.location.href = "../Frontend.html";
    return;
  }

  console.log("👤 Welcome:", currentUser);

  // show user name and photo in navbar
  showUserInfo(currentUser);

  // load the food menu grid
  loadMenu();

  // load order history
  loadOrders();

  // update cart badge number
  updateCartBadge();
}

// ─────────────────────────────────────────
// SHOW USER INFO
// Shows profile name and photo in navbar
// ─────────────────────────────────────────
function showUserInfo(user) {
  // get display name - use fullname first then name then email prefix
  const displayName = user.fullname || user.name || user.email.split('@')[0];

  // update welcome heading span
  const welcomeNameEl = document.getElementById('welcomeName');
  if (welcomeNameEl) {
    welcomeNameEl.textContent = displayName;
  }

  // update navbar username text
  const userNameEl = document.getElementById('userName');
  if (userNameEl) {
    userNameEl.textContent = displayName;
  }

  // update profile photo
  // uses saved photoURL or generates a placeholder with first letter
  const userPhotoEl = document.getElementById('userPhoto');
  if (userPhotoEl) {
    userPhotoEl.src = user.photoURL ||
      `https://via.placeholder.com/50/FF6600/ffffff?text=${displayName.charAt(0).toUpperCase()}`;
    userPhotoEl.alt = displayName;
  }
}

// ─────────────────────────────────────────
// LOAD MENU
// Creates food cards with images
// Images are stored in ../images/ folder
// Replace with API call when classmate is ready
// ─────────────────────────────────────────
function loadMenu() {
  const menuGrid = document.getElementById('menuGrid');

  if (!menuGrid) {
    console.error("❌ menuGrid not found!");
    return;
  }

  // dummy products with image filenames
  // images must be saved in MyCode2/images/ folder
  const dummyProducts = [
    { productID: 1, productName: 'Chicken Pastil', quantity: 15, price: 55, img: 'Pastil.webp' },
    { productID: 2, productName: 'Pancit', quantity: 12, price: 65, img: 'Pancit (4).jpg' },
    { productID: 3, productName: 'Cheese Burger', quantity: 8, price: 75, img: 'Burger.jpg' },
    { productID: 4, productName: 'Spaghetti', quantity: 20, price: 50, img: 'Spag (1).jpg' },
    { productID: 5, productName: 'Siomai Rice', quantity: 25, price: 35, img: 'SiomaiRice(3).jpg' },
    { productID: 6, productName: 'Fried Chicken', quantity: 18, price: 65, img: 'FC.webp' },
    { productID: 7, productName: 'Corndog', quantity: 10, price: 70, img: 'Corndog(2).jpg' },
    { productID: 8, productName: 'Milk Tea', quantity: 30, price: 45, img: 'MilkTea.jpg' },
  ];

  // clear existing cards
  menuGrid.innerHTML = '';

  // create a card for each product
  dummyProducts.forEach(product => {
    const card = createFoodCard(product);
    menuGrid.appendChild(card);
  });

  // attach add to cart click events to all buttons
  attachCartButtons();

  console.log("✅ Menu loaded with images!");
}

// ─────────────────────────────────────────
// CREATE FOOD CARD
// Builds a single food card with an image
// ─────────────────────────────────────────
function createFoodCard(product) {
  const card = document.createElement('div');
  card.classList.add('food-card');

  card.innerHTML = `
    <!-- food image from images folder -->
    <div class="food-image">
      <img
        src="../images/${product.img}"
        alt="${product.productName}"
        onerror="this.src='https://via.placeholder.com/200x140/FF6600/ffffff?text=${encodeURIComponent(product.productName)}'">
    </div>
    <!-- food details below image -->
    <div class="food-info">
      <h3>${product.productName}</h3>
      <p class="food-desc">${product.quantity > 5 ? '🔥 Popular!' : '⚡ Limited!'}</p>
      <div class="food-footer">
        <span class="food-price">₱${product.price}</span>
        <!-- add to cart button stores product data as attributes -->
        <button class="add-btn"
          data-id="${product.productID}"
          data-name="${product.productName}"
          data-price="${product.price}"
          data-img="${product.img}">
          Add to Cart
        </button>
      </div>
    </div>
  `;

  return card;
}

// ─────────────────────────────────────────
// ATTACH CART BUTTONS
// Listens for add to cart clicks
// Saves item to localStorage cart
// Updates badge after each add
// ─────────────────────────────────────────
function attachCartButtons() {
  document.querySelectorAll('.add-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // get product data from button data attributes
      const id = this.dataset.id;
      const name = this.dataset.name;
      const price = parseFloat(this.dataset.price);
      const img = this.dataset.img;

      // get existing cart from localStorage or start empty
      let cart = JSON.parse(localStorage.getItem('cart') || '[]');

      // check if item already exists in cart
      const existing = cart.find(item => item.id == id);

      if (existing) {
        // increase quantity if already in cart
        existing.quantity += 1;
      } else {
        // add new item to cart with image filename
        cart.push({ id, name, price, img, quantity: 1 });
      }

      // save updated cart to localStorage
      localStorage.setItem('cart', JSON.stringify(cart));

      // update cart badge
      updateCartBadge();

      // show green feedback on button
      const original = this.textContent;
      this.textContent = 'Added! 🎉';
      this.style.background = '#4CAF50';

      // reset button after 1.2 seconds
      setTimeout(() => {
        this.textContent = original;
        this.style.background = '';
      }, 1200);

      console.log(`✅ ${name} added to cart!`);
    });
  });
}

// ─────────────────────────────────────────
// LOAD ORDERS
// Reads order history from localStorage
// and displays them in the orders section
// ─────────────────────────────────────────
function loadOrders() {
  const ordersList = document.getElementById('ordersList');
  if (!ordersList) return;

  // get saved orders from localStorage
  const orders = JSON.parse(localStorage.getItem('orders') || '[]');

  // if no orders show a message
  if (orders.length === 0) {
    ordersList.innerHTML = `
      <p style="color:#888;font-size:0.9rem;padding:1rem 0;">
        No orders yet. Start ordering from the menu above!
      </p>`;
    return;
  }

  // clear existing content
  ordersList.innerHTML = '';

  // show most recent orders first - reverse the array
  const recentOrders = [...orders].reverse();

  // create a card for each order
  recentOrders.forEach(order => {
    const orderCard = document.createElement('div');
    orderCard.classList.add('order-card');

    // calculate order total from items
    const total = order.items
      ? order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
      : 0;

    orderCard.innerHTML = `
      <!-- left side - order name and date -->
      <div class="order-info">
        <span class="order-name">Order #${order.id || ''}</span>
        <span class="order-date">${order.date || ''}</span>
      </div>
      <!-- right side - total and status badge -->
      <div class="order-right">
        <span class="order-price">₱${total}</span>
        <span class="order-status ${order.status === 'done' ? 'status-done' : 'status-pending'}">
          ${order.status === 'done' ? 'Done' : 'Pending'}
        </span>
      </div>
    `;

    ordersList.appendChild(orderCard);
  });
}

// ─────────────────────────────────────────
// UPDATE CART BADGE
// Shows total number of items on cart icon
// Hides badge if cart is empty
// ─────────────────────────────────────────
function updateCartBadge() {
  const cartBadge = document.getElementById('cartBadge');

  if (cartBadge) {
    // get cart and count total items
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

    // show or hide badge based on item count
    if (totalItems > 0) {
      cartBadge.textContent = totalItems;
      cartBadge.style.display = 'flex';
    } else {
      cartBadge.style.display = 'none';
    }
  }
}

// ─────────────────────────────────────────
// LOGOUT
// Clears all localStorage and goes to login
// ─────────────────────────────────────────
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', function(e) {
      e.preventDefault();

      // clear all saved data including cart and profile
      localStorage.clear();

      console.log("👋 Logged out!");
      // go back to login page - one level up from customer/
      window.location.href = "../Frontend.html";
    });
  }
}