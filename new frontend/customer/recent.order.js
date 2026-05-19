// ─────────────────────────────────────────
// RECENT ORDERS JS
// Reads all orders from localStorage
// Displays them with filter tabs
// Links to order_details.html for tracking
// Also updates home.html recent orders section
// ─────────────────────────────────────────

// store all orders globally for filtering
let allOrders = [];
const id = localStorage.getItem("userID");

// wait for page to load
document.addEventListener("DOMContentLoaded", () => {
  console.log("📋 Recent orders page loaded!");

  // check if user is logged in
  checkSession();

  // load all orders from localStorage
  loadAllOrders();
});

// ─────────────────────────────────────────
// CHECK SESSION
// Redirects to login if not logged in
// ─────────────────────────────────────────
function checkSession() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  if (!currentUser || !isLoggedIn) {
    // not logged in - go to login page
    window.location.href = "../Frontend.html";
  }
}

// ─────────────────────────────────────────
// LOAD ALL ORDERS
// Gets all orders from localStorage
// Shows them sorted by newest first
// ─────────────────────────────────────────
async function loadAllOrders() {
  const response = await fetch('http://127.0.0.1:8000/order', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({CustomerID : id})
    })
  // simulate short loading delay
  setTimeout(async () => {
    // get all orders from localStorage
    const orders = await response.json();
    allOrders = orders.orders;
    console.log(allOrders);


    // hide loading state
    document.getElementById("loadingState").style.display = "none";

    // show orders container
    document.getElementById("ordersContainer").style.display = "flex";

    // render all orders
    renderOrders(allOrders);

    console.log(`✅ Loaded ${allOrders.length} orders`);
  }, 600);
}

// ─────────────────────────────────────────
// RENDER ORDERS
// Creates a card for each order
// Shows empty state if no orders
// ─────────────────────────────────────────
function renderOrders(orders) {
  const container = document.getElementById("ordersContainer");

  // clear existing content
  container.innerHTML = "";

  // show empty state if no orders
  if (orders.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛍️</div>
        <h3>No orders found</h3>
        <p>You haven't placed any orders yet.<br>Browse our menu and start ordering!</p>
        <a href="home.html" class="browse-btn">🍽️ Browse Menu</a>
      </div>
    `;
    return;
  }

  // create a card for each order
  allOrders.forEach(order => {
    const card = createOrderCard(order);
    container.appendChild(card);
  });
}

// ─────────────────────────────────────────
// CREATE ORDER CARD
// Builds a single order card element
// ─────────────────────────────────────────
function createOrderCard(order) {
  const card = document.createElement("div");
  card.classList.add("order-card");
  const itemDetails = JSON.parse(order.items)
  // get status badge HTML
  const statusBadge = getStatusBadge(order.status);

  // build items tags HTML
  let itemsHTML = "";
  if (itemDetails && itemDetails.length > 0) {
    itemDetails.forEach(item => {
      itemsHTML += `<span class="item-tag">${item.name} x${item.quantity}</span>`;
    });
  } else {
    itemsHTML = `<span style="color:#aaa;font-size:0.82rem;">No items</span>`;
  }

  // get payment label
  const paymentLabels = {
    cash: "💵 Cash on Delivery",
    gcash: "📱 GCash",
    maya: "💳 Maya"
  };
  const paymentLabel = paymentLabels[order.paymentMethod] || order.paymentMethod || "N/A";

  // show track button only for active orders
  // show reorder button for done or cancelled orders
  let actionButtons = "";
  if (order.status === "preparing" || order.status === "delivering") {
    // active order - show track button
    actionButtons = `
      <a href="order.details.html?orderId=${order.orderID}" class="track-btn">
        🏍️ Track Order
      </a>
    `;
  } else if (order.status === "delivered" || order.status === "cancelled") {
    // completed order - show reorder and view buttons
    actionButtons = `
      <button class="reorder-btn" onclick="reorderItems('${order.orderID}')">
        🔄 Reorder
      </button>
      <a href="order.details.html?orderId=${order.orderID}" class="track-btn">
        View
      </a>
    `;
  }

  // build the full card HTML
  card.innerHTML = `
    <!-- top row with order ID date and status -->
    <div class="order-top">
      <div>
        <div class="order-id">#${order.orderID}</div>
        <div class="order-date">${order.date || ''} ${order.time ? '• ' + order.time : ''}</div>
      </div>
      ${statusBadge}
    </div>

    <!-- delivery address -->
    <div class="order-address">
      📍 ${order.address || 'No address'}
    </div>

    <!-- ordered items as tags -->
    <div class="order-items">
      ${itemsHTML}
    </div>

    <!-- bottom row with total and action buttons -->
    <div class="order-bottom">
      <div>
        <div class="order-total">₱${order.total || 0}</div>
        <div class="order-payment">${paymentLabel}</div>
      </div>
      <div>
        ${actionButtons}
      </div>
    </div>
  `;

  return card;
}

// ─────────────────────────────────────────
// GET STATUS BADGE
// Returns the correct colored badge HTML
// based on order status
// ─────────────────────────────────────────
function getStatusBadge(status) {
  const badges = {
    preparing: '<span class="status-badge status-preparing">🍳 Preparing</span>',
    delivering: '<span class="status-badge status-delivering">🏍️ Delivering</span>',
    delivered: '<span class="status-badge status-delivered">✅ Delivered</span>',
    cancelled: '<span class="status-badge status-cancelled">❌ Cancelled</span>',
    pending: '<span class="status-badge status-pending">⏳ Pending</span>'
  };

  // return matching badge or default
  return badges[status] || `<span class="status-badge status-preparing">⏳ ${status}</span>`;
}

// ─────────────────────────────────────────
// FILTER ORDERS
// Filters the orders list by status
// Called when tab buttons are clicked
// ─────────────────────────────────────────
function filterOrders(status, clickedBtn) {
  // update active tab styling
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.classList.remove("active");
  });
  clickedBtn.classList.add("active");

  // filter orders based on selected status
  let filtered;
  if (status === "all") {
    // show all orders
    filtered = allOrders;
  } else {
    // show only orders with matching status
    filtered = allOrders.filter(order => order.status === status);
  }

  // render the filtered orders
  renderOrders(filtered);

  console.log(`🔍 Filtered by: ${status} — ${filtered.length} orders`);
}

// ─────────────────────────────────────────
// REORDER ITEMS
// Finds the order by ID
// Adds all items back to the cart
// Redirects to cart page
// ─────────────────────────────────────────
function reorderItems(orderId) {
  // find the order
  const order = allOrders.find(o => o.id === orderId);

  if (!order || !order.items || order.items.length === 0) {
    alert("Could not find items to reorder.");
    return;
  }

  // get existing cart or start empty
  let cart = JSON.parse(localStorage.getItem("cart") || "[]");

  // add each item from the old order to the cart
  order.items.forEach(item => {
    // check if item already in cart
    const existing = cart.find(c => c.id == item.id);

    if (existing) {
      // increase quantity
      existing.quantity += item.quantity;
    } else {
      // add as new item
      cart.push({
        id: item.id,
        name: item.name,
        price: item.price,
        img: item.img || "",
        quantity: item.quantity
      });
    }
  });

  // save updated cart
  localStorage.setItem("cart", JSON.stringify(cart));

  console.log("🔄 Items added to cart for reorder:", order.items);

  // go to cart page
  alert(`${order.items.length} item(s) added to your cart!`);
  window.location.href = "cart.html";
}

// ─────────────────────────────────────────
// EXPORT FOR HOME.HTML
// This function is called by home.js to
// update the recent orders section on home page
// ─────────────────────────────────────────
function updateHomeRecentOrders() {
  // get orders list element on home page
  const ordersList = document.getElementById("ordersList");
  if (!ordersList) return;

  // get orders from localStorage
  const orders = JSON.parse(localStorage.getItem("orders") || "[]");

  // if no orders show message
  if (orders.length === 0) {
    ordersList.innerHTML = `
      <p style="color:#888;font-size:0.9rem;padding:1rem 0;">
        No orders yet. Start ordering from the menu above!
      </p>`;
    return;
  }
  // clear existing content
  ordersList.innerHTML = "";

  // create a row for each recent order
  orders.orders.forEach(order => {
    const card = document.createElement("div");
    card.classList.add("order-card");

    // get status class
    const statusClass = order.status === "delivered"
      ? "status-delivered"
      : order.status === "delivering"
      ? "status-delivering"
      : order.status === "cancelled"
      ? "status-cancelled"
      : "status-pending";

    // get status text
    const statusText = order.status === "delivered"
      ? "Delivered"
      : order.status === "delivering"
      ? "Delivering"
      : order.status === "cancelled"
      ? "Cancelled"
      : "Preparing";

    card.innerHTML = `
      <div class="order-info">
        <span class="order-name">#${order.orderID}</span>
        <span class="order-date">${order.date || ''}</span>
      </div>
      <div class="order-right">
        <span class="order-price">₱${order.total || 0}</span>
        <span class="order-status ${statusClass}">${statusText}</span>
      </div>
    `;

    // clicking the card goes to order details
    card.style.cursor = "pointer";
    card.addEventListener("click", () => {
      window.location.href = `order.details.html?orderId=${order.orderID}`;
    });

    ordersList.appendChild(card);
  });

  // add view all button if more than 3 orders
  if (orders.length > 3) {
    const viewAll = document.createElement("div");
    viewAll.style.cssText = "text-align:center;margin-top:1rem;";
    viewAll.innerHTML = `
      <a href="recent_orders.html"
        style="color:#FF6600;font-size:0.85rem;font-weight:600;text-decoration:none;">
        View All Orders (${orders.length}) →
      </a>
    `;
    ordersList.appendChild(viewAll);
  }
}