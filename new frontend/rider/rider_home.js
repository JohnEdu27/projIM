// ─────────────────────────────────────────
// RIDER DASHBOARD JS
// Shows pending orders when receive is clicked
// Rider can mark as delivered or cancel
// Uses localStorage orders
// ─────────────────────────────────────────

// current order being viewed in modal
let currentModalOrder = null;

// rider's own orders list
let riderOrders = [];

// wait for page to load
document.addEventListener("DOMContentLoaded", () => {
  console.log("🏍️ Rider dashboard loaded!");

  // check if rider is logged in
  checkSession();

  // load rider's orders
  loadOrders();

  // setup logout
  document.getElementById("logoutBtn").addEventListener("click", logout);

  // close modal when clicking outside
  document.getElementById("orderModal").addEventListener("click", function(e) {
    if (e.target === this) closeModal();
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

  // show rider info in navbar
  const name = user.fullname || user.name || "Rider";
  document.getElementById("userName").textContent = name;
  document.getElementById("welcomeName").textContent = name;
  document.getElementById("userPhoto").src = user.photoURL ||
    `https://via.placeholder.com/40/1e2a3a/ffffff?text=${name.charAt(0).toUpperCase()}`;
}

// ─────────────────────────────────────────
// TOGGLE ONLINE STATUS
// Shows online or offline label
// ─────────────────────────────────────────
window.toggleOnline = function() {
  const isOnline = document.getElementById("onlineToggle").checked;
  const label = document.getElementById("statusLabel");
  const receiveBtn = document.getElementById("receiveBtn");

  if (isOnline) {
    label.textContent = "Online";
    label.style.color = "#22c55e";
    receiveBtn.style.opacity = "1";
    receiveBtn.style.pointerEvents = "auto";
    showNotif("✅ You are now Online!", "success");
  } else {
    label.textContent = "Offline";
    label.style.color = "#888";
    receiveBtn.style.opacity = "0.5";
    receiveBtn.style.pointerEvents = "none";
    showNotif("You are now Offline.", "info");
  }
};

// ─────────────────────────────────────────
// RECEIVE ORDERS
// Gets the next pending order from localStorage
// Shows it in the modal for the rider
// ─────────────────────────────────────────
window.receiveOrders = function() {
  // check if online
  const isOnline = document.getElementById("onlineToggle").checked;
  if (!isOnline) {
    showNotif("⚠️ You must be Online to receive orders!", "error");
    return;
  }

  // get all orders from localStorage
  const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");

  // find next order with status preparing that is not assigned
  const pendingOrder = allOrders.find(o =>
    o.status === "preparing" && !o.riderId
  );

  if (!pendingOrder) {
    showNotif("📭 No pending orders right now. Check back later!", "info");
    return;
  }

  // save current order
  currentModalOrder = pendingOrder;

  // fill modal with order details
  document.getElementById("modalOrderId").textContent = pendingOrder.id;

  // build items text
  let itemsText = "";
  if (pendingOrder.items && pendingOrder.items.length > 0) {
    itemsText = pendingOrder.items
      .map(item => ${item.name.toUpperCase()} ${item.quantity}x)
      .join(",\n");
  } else {
    itemsText = "No items";
  }

  document.getElementById("modalItems").textContent = itemsText;
  document.getElementById("modalAddress").textContent =
    pendingOrder.address || "No address";

  // show modal
  document.getElementById("orderModal").classList.add("open");
};

// ─────────────────────────────────────────
// MARK DELIVERED
// Updates order status to done
// Assigns this rider to the order
// ─────────────────────────────────────────
window.markDelivered = function() {
  if (!currentModalOrder) return;

  // get current rider
  const rider = JSON.parse(localStorage.getItem("currentUser"));

  // update the order in localStorage
  const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
  const index = allOrders.findIndex(o => o.id === currentModalOrder.id);

  if (index !== -1) {
    allOrders[index].status = "done";
    allOrders[index].riderId = rider?.uid || "rider";
    allOrders[index].riderName = rider?.fullname || rider?.name || "Rider";
    allOrders[index].deliveredAt = new Date().toLocaleTimeString("en-PH");
    localStorage.setItem("orders", JSON.stringify(allOrders));
  }

  // close modal
  closeModal();

  // reload orders display
  loadOrders();

  // update stats
  updateStats();

  showNotif("✅ Order marked as DELIVERED!", "success");
  console.log("✅ Delivered:", currentModalOrder.id);
};

// ─────────────────────────────────────────
// CANCEL ORDER
// Updates order status to cancelled
// ─────────────────────────────────────────
window.cancelOrder = function() {
  if (!currentModalOrder) return;

  // update in localStorage
  const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
  const index = allOrders.findIndex(o => o.id === currentModalOrder.id);

  if (index !== -1) {
    allOrders[index].status = "cancelled";
    localStorage.setItem("orders", JSON.stringify(allOrders));
  }

  // close modal
  closeModal();

  // reload
  loadOrders();
  updateStats();

  showNotif("❌ Order cancelled.", "info");
  console.log("❌ Cancelled:", currentModalOrder.id);
};

// ─────────────────────────────────────────
// CLOSE MODAL
// Hides the order detail modal
// ─────────────────────────────────────────
function closeModal() {
  document.getElementById("orderModal").classList.remove("open");
  currentModalOrder = null;
}

// ─────────────────────────────────────────
// LOAD ORDERS
// Shows all orders assigned to this rider
// or all orders the rider has acted on
// ─────────────────────────────────────────
window.loadOrders = function() {
  const rider = JSON.parse(localStorage.getItem("currentUser"));
  const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");

  // get orders this rider handled
  riderOrders = allOrders.filter(o =>
    o.riderId === rider?.uid ||
    o.status === "delivering" ||
    o.status === "done" ||
    o.status === "cancelled"
  );

  const list = document.getElementById("ordersList");
  const emptyState = document.getElementById("emptyState");

  // clear list
  list.innerHTML = "";

  if (riderOrders.length === 0) {
    list.appendChild(emptyState);
    emptyState.style.display = "block";
    updateStats();
    return;
  }

  emptyState.style.display = "none";

  // sort newest first
  const sorted = [...riderOrders].sort((a, b) => {
    const ta = parseInt(String(a.id).replace("CCG-", "")) || 0;
    const tb = parseInt(String(b.id).replace("CCG-", "")) || 0;
    return tb - ta;
  });

  sorted.forEach(order => {
    const card = createOrderCard(order);
    list.appendChild(card);
  });

  updateStats();
};

// ─────────────────────────────────────────
// CREATE ORDER CARD
// Builds a single order card for the list
// ─────────────────────────────────────────
function createOrderCard(order) {
  const card = document.createElement("div");
  card.classList.add("order-card");

  // status badge
  const badges = {
    preparing: <span class="badge badge-new">🆕 Pending</span>,
    delivering: <span class="badge badge-delivering">🏍️ Delivering</span>,
    done: <span class="badge badge-delivered">✅ Delivered</span>,
    cancelled: <span class="badge badge-cancelled">❌ Cancelled</span>
  };

  const badge = badges[order.status] || badges.preparing;

  // build items text
  let itemsHTML = "";
  if (order.items && order.items.length > 0) {
    order.items.forEach(item => {
      itemsHTML += <span class="item-tag">${item.name} x${item.quantity}</span>;
    });
  } else {
    itemsHTML = <span style="color:#aaa;font-size:0.82rem;">No items</span>;
  }

  // show action buttons only for active orders
  let actionsHTML = "";
  if (order.status === "delivering" || order.status === "preparing") {
    actionsHTML = `
      <div class="order-actions">
        <button class="btn-delivered" onclick="quickDeliver('${order.id}')">
          ✅ DELIVERED
        </button>
        <button class="btn-cancel-order" onclick="quickCancel('${order.id}')">
          ❌ CANCEL
        </button>
      </div>
    `;
  }

  card.innerHTML = `
    <div class="order-top">
      <div class="order-id">#${order.id}</div>
      ${badge}
    </div>

    <div class="order-items">${itemsHTML}</div>

    <div class="order-address">
      📍 ${order.address || "No address"}
    </div>

    <div class="order-bottom">
      <div class="order-total">₱${order.total || 0}</div>
      ${actionsHTML}
    </div>
  `;

  return card;
}

// ─────────────────────────────────────────
// QUICK DELIVER FROM CARD
// Marks order as delivered directly from list
// ─────────────────────────────────────────
window.quickDeliver = function(orderId) {
  const rider = JSON.parse(localStorage.getItem("currentUser"));
  const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
  const index = allOrders.findIndex(o => o.id === orderId);

  if (index !== -1) {
    allOrders[index].status = "done";
    allOrders[index].riderId = rider?.uid || "rider";
    allOrders[index].riderName = rider?.fullname || rider?.name || "Rider";
    localStorage.setItem("orders", JSON.stringify(allOrders));
  }

  loadOrders();
  showNotif("✅ Order marked as DELIVERED!", "success");
};

// ─────────────────────────────────────────
// QUICK CANCEL FROM CARD
// Cancels order directly from list
// ─────────────────────────────────────────
window.quickCancel = function(orderId) {
  if (!confirm("Cancel this order?")) return;

  const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
  const index = allOrders.findIndex(o => o.id === orderId);

  if (index !== -1) {
    allOrders[index].status = "cancelled";
    localStorage.setItem("orders", JSON.stringify(allOrders));
  }

  loadOrders();
  showNotif("❌ Order cancelled.", "info");
};

// ─────────────────────────────────────────
// UPDATE STATS
// Updates the 3 stat boxes at the top
// ─────────────────────────────────────────
function updateStats() {
  const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");

  const delivered = allOrders.filter(o => o.status === "done").length;
  const active = allOrders.filter(o =>
    o.status === "preparing" || o.status === "delivering"
  ).length;
  const cancelled = allOrders.filter(o => o.status === "cancelled").length;

  document.getElementById("totalDelivered").textContent = delivered;
  document.getElementById("totalActive").textContent = active;
  document.getElementById("totalCancelled").textContent = cancelled;
}

// ─────────────────────────────────────────
// SHOW NOTIFICATION
// Green/blue/red popup at top right
// ─────────────────────────────────────────
function showNotif(message, type = "success") {
  const notif = document.createElement("div");
  notif.className = notif notif-${type};
  notif.textContent = message;
  document.body.appendChild(notif);
  setTimeout(() => notif.remove(), 3000);
}

// ─────────────────────────────────────────
// LOGOUT
// Clears session and goes to login
// ─────────────────────────────────────────
function logout() {
  localStorage.removeItem("isLoggedIn");
  localStorage.removeItem("currentUser");
  window.location.href = "../Frontend.html";
}