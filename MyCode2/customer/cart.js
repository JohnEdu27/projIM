// ─────────────────────────────────────────
// CART PAGE + SHOPPING CART LOGO/BADGE
// Works perfectly with home.js cart system
// ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  console.log("🛒 Cart page loaded!");
  
  // Check user session
  checkUserSession();
  
  // Update cart badge on navbar (if exists)
  updateCartBadge();
});

// ─────────────────────────────────────────
// CHECK USER SESSION
// ─────────────────────────────────────────
function checkUserSession() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  if (!currentUser || localStorage.getItem("isLoggedIn") !== "true") {
    console.log("❌ No user - redirecting");
    window.location.href = "../Frontend.html";
    return;
  }
  
  showUserInfo(currentUser);
  loadCart();
}

// ─────────────────────────────────────────
// SHOW USER INFO
// ─────────────────────────────────────────
function showUserInfo(user) {
  const displayName = user.fullname || user.name || user.email.split('@')[0];
  
  document.getElementById('userName').textContent = displayName;
  const photoEl = document.getElementById('userPhoto');
  if (photoEl) {
    photoEl.src = user.photoURL || `https://via.placeholder.com/40/FF6600/ffffff?text=${displayName.charAt(0)}`;
  }
}

// ─────────────────────────────────────────
// UPDATE CART BADGE (Navbar icon)
// Shows item count on ALL pages
// ─────────────────────────────────────────
function updateCartBadge() {
  const cartBadge = document.querySelector('.cart-badge');
  const cartIcon = document.querySelector('.cart-icon');
  
  if (cartBadge && cartIcon) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? 'block' : 'none';
    
    // Add click to go to cart
    cartIcon.onclick = () => {
      window.location.href = 'cart.html';
    };
    
    console.log(`🛒 Cart badge: ${totalItems} items`);
  }
}

// ─────────────────────────────────────────
// LOAD CART
// ─────────────────────────────────────────
function loadCart() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const cartItems = document.getElementById('cartItems');
  const summaryRows = document.getElementById('summaryRows');
  const totalPrice = document.getElementById('totalPrice');

  cartItems.innerHTML = '';
  summaryRows.innerHTML = '';

  if (cart.length === 0) {
    cartItems.innerHTML = `
      <div class="empty-cart">
        <div class="empty-icon">🛒</div>
        <h3>Your cart is empty</h3>
        <p>Add items from the menu to get started!</p>
        <a href="home.html" class="back-btn">← Browse Menu</a>
      </div>`;
    totalPrice.textContent = '₱0';
    return;
  }

  let total = 0;

  cart.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    total += itemSubtotal;

    const row = document.createElement('div');
    row.classList.add('cart-item');
    row.innerHTML = `
      <img src="https://via.placeholder.com/80x80/FF6600/ffffff?text=${encodeURIComponent(item.name.substring(0,8))}" alt="${item.name}">
      <div class="cart-item-info">
        <h3>${item.name}</h3>
        <p>₱${item.price} each</p>
      </div>
      <div class="cart-item-controls">
        <button class="qty-btn minus" onclick="changeQty('${item.id}', -1)">−</button>
        <span class="cart-qty">${item.quantity}</span>
        <button class="qty-btn plus" onclick="changeQty('${item.id}', 1)">+</button>
      </div>
      <span class="cart-item-price">₱${itemSubtotal.toFixed(0)}</span>
      <button class="remove-btn" onclick="removeItem('${item.id}')">🗑️</button>
    `;
    cartItems.appendChild(row);

    const summaryRow = document.createElement('div');
    summaryRow.classList.add('summary-row');
    summaryRow.innerHTML = `
      <span>${item.name} ×${item.quantity}</span>
      <span>₱${itemSubtotal.toFixed(0)}</span>
    `;
    summaryRows.appendChild(summaryRow);
  });

  totalPrice.textContent = `₱${total.toFixed(0)}`;
  console.log(`✅ Cart: ${cart.length} items, ₱${total.toFixed(0)}`);
}

// ─────────────────────────────────────────
// CHANGE QUANTITY
// ─────────────────────────────────────────
window.changeQty = function(id, change) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const item = cart.find(i => i.id == id);

  if (item) {
    item.quantity += change;
    
    if (item.quantity <= 0) {
      cart = cart.filter(i => i.id != id);
    }
  }

  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
  updateCartBadge(); // Update navbar badge
};

// ─────────────────────────────────────────
// REMOVE ITEM
// ─────────────────────────────────────────
window.removeItem = function(id) {
  let cart = JSON.parse(localStorage.getItem('cart') || '[]');
  cart = cart.filter(i => i.id != id);
  localStorage.setItem('cart', JSON.stringify(cart));
  loadCart();
  updateCartBadge();
};

// ─────────────────────────────────────────
// CHECKOUT
// ─────────────────────────────────────────
document.getElementById('checkoutBtn').addEventListener('click', function() {
  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  
  if (cart.length === 0) {
    alert('Your cart is empty!');
    return;
  }

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const itemsList = cart.map(item => `${item.name} x${item.quantity}`).join('\n');
  
  const confirmation = confirm(
    `🛒 FINAL ORDER\n\n` +
    `${itemsList}\n\n` +
    `Total: ₱${total.toFixed(0)}\n` +
    `Pay at canteen counter.\n\n` +
    `Confirm order?`
  );
  
  if (confirmation) {
    localStorage.removeItem('cart');
    alert('✅ Order received! Proceed to canteen.\nYour food is being prepared!');
    window.location.href = 'home.html';
  }
});

// ─────────────────────────────────────────
// LOGOUT & BACK BUTTONS
// ─────────────────────────────────────────
document.getElementById('logoutBtn').addEventListener('click', function() {
  localStorage.clear();
  window.location.href = "../Frontend.html";
});

document.querySelectorAll('.back-btn').forEach(btn => {
  btn.addEventListener('click', function(e) {
    e.preventDefault();
    window.location.href = 'home.html';
  });
});