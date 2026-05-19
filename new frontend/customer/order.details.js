// ─────────────────────────────────────────
// ORDER DETAILS JS (FIXED VERSION)
// Fully working loading, rendering, tracker,
// cancellation, and error handling
// ─────────────────────────────────────────

// global current order
let currentOrder = null;
let data = []
const id = localStorage.getItem("userID");
// wait until page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("📦 Order Details Loaded");

  initializePage();
});

// ─────────────────────────────────────────
// INITIALIZE PAGE
// ─────────────────────────────────────────
function initializePage() {

  // get order ID from URL
  const urlParams = new URLSearchParams(window.location.search);
  const orderId = urlParams.get("orderId");

  console.log("🔍 Order ID:", orderId);

  // no order id
  if (!orderId) {
    showError();
    return;
  }

  // small loading delay for smoother UX
  setTimeout(() => {
    loadOrder(orderId);
  }, 800);
}

// ─────────────────────────────────────────
// LOAD ORDER
// ─────────────────────────────────────────
async function loadOrder(orderId) {

  try {

    // get orders from localStorage
    const orders = await fetch('http://127.0.0.1:8000/order', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({CustomerID : id})
    })
    const result = await orders.json()
    console.log("📦 Orders:", orders);

    // find order

    const order = await fetch('http://127.0.0.1:8000/order/orderid', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({OrderID : orderId})
    })
    
    data = await order.json()
    console.log(data)
    // not found
    if (!order) {
      console.error("❌ Order not found");
      showError();
      return;
    }

    // save globally
    currentOrder = data;

    // render page
    renderPage(data);

  } catch (error) {

    console.error("❌ Failed loading order:", error);

    showError();
  }
}

// ─────────────────────────────────────────
// RENDER WHOLE PAGE
// ─────────────────────────────────────────
function renderPage(order) {

  hideLoading();

  // show page
  const wrapper = document.getElementById("orderWrapper");

  if (wrapper) {
    wrapper.style.display = "flex";
  }

  renderOrderDetails(order);
  renderTracker(order.status);
  renderItems(order);
  renderPricing(order);
  renderCancelButton(order.status);
}

// ─────────────────────────────────────────
// HIDE LOADING
// ─────────────────────────────────────────
function hideLoading() {

  const loading = document.getElementById("loadingScreen");

  if (loading) {
    loading.style.display = "none";
  }
}

// ─────────────────────────────────────────
// SHOW ERROR SCREEN
// ─────────────────────────────────────────
function showError() {

  hideLoading();

  const errorScreen = document.getElementById("errorScreen");

  if (errorScreen) {
    errorScreen.style.display = "block";
  }
}

// ─────────────────────────────────────────
// RENDER ORDER DETAILS
// ─────────────────────────────────────────
function renderOrderDetails(order) {

  setText("orderIdDisplay",` Order #${order.orderID || "Unknown"}`);

  setText(
    "orderDateDisplay",
    `${order.date || "Unknown Date"} ${order.time || ""}`
  );

  setText("infoCustomer", order.customerName || "Customer");
  setText("infoPhone", order.phone || "N/A");
  setText("infoAddress", order.address || "N/A");

  // payment labels
  const paymentLabels = {
    cash: "💵 Cash on Delivery",
    gcash: "📱 GCash",
    maya: "💳 Maya"
  };

  setText(
    "infoPayment",
    paymentLabels[order.paymentMethod] || order.paymentMethod || "N/A"
  );

  // delivery labels
  const deliveryLabels = {
    standard: "🚶 Standard Delivery",
    express: "⚡ Express Delivery"
  };

  setText(
    "infoDelivery",
    deliveryLabels[order.deliveryOption] || order.deliveryOption || "N/A"
  );

  // notes
  const notesRow = document.getElementById("notesRow");

  if (order.notes) {

    setText("infoNotes", order.notes);

  } else if (notesRow) {

    notesRow.style.display = "none";
  }

  // ETA
  const eta =
    order.deliveryOption === "express"
      ? "Estimated time: 15-20 minutes"
      : "Estimated time: 30-45 minutes";

  setText("etaText", eta);
}

// ─────────────────────────────────────────
// RENDER TRACKER
// ─────────────────────────────────────────
function renderTracker(status = "preparing") {

  // remove all classes
  document.querySelectorAll(".step").forEach(step => {
    step.classList.remove(
      "active",
      "completed",
      "delivering",
      "done-step"
    );
  });

  const statusMessage = document.getElementById("statusMessage");

  if (!statusMessage) return;

  statusMessage.className = "status-message";

  // PREPARING
  if (status === "preparing") {

    document
      .getElementById("step-preparing")
      ?.classList.add("active");

    statusMessage.classList.add("preparing");

    setText("statusEmoji", "🍳");
    setText("statusTitle", "Preparing");
    setText(
      "statusDesc",
      "Your order is being prepared"
    );
  }

  // DELIVERING
  else if (status === "delivering") {

    document
      .getElementById("step-preparing")
      ?.classList.add("completed");

    document
      .getElementById("step-delivering")
      ?.classList.add("active", "delivering");

    statusMessage.classList.add("delivering");

    setText("statusEmoji", "🏍️");
    setText("statusTitle", "On The Way");
    setText(
      "statusDesc",
      "Your order is on the way"
    );
  }

  // DONE
  else if (status === "delivered") {

    document
      .getElementById("step-preparing")
      ?.classList.add("completed");

    document
      .getElementById("step-delivering")
      ?.classList.add("completed");

    document
      .getElementById("step-done")
      ?.classList.add("active", "done-step");

    statusMessage.classList.add("done");

    setText("statusEmoji", "✅");
    setText("statusTitle", "Delivered!");
    setText(
      "statusDesc",
      "Order successfully delivered"
    );
  }

  // CANCELLED
  else if (status === "cancelled") {

    statusMessage.style.background = "#fef2f2";
    statusMessage.style.borderColor = "#ef4444";

    setText("statusEmoji", "❌");
    setText("statusTitle", "Cancelled");
    setText(
      "statusDesc",
      "This order has been cancelled"
    );
  }
}

// ─────────────────────────────────────────
// RENDER ITEMS
// ─────────────────────────────────────────
function renderItems(order) {
  const itemDetails = JSON.parse(order.items);
  const itemsList = document.getElementById("itemsList");

  if (!itemsList) return;

  // no items
  if (!itemDetails || itemDetails.length === 0) {

    itemsList.innerHTML = `
      <p style="color:#888;font-size:0.88rem;">
        No items found.
      </p>
    `;

    return;
  }
  
  // render items
  itemsList.innerHTML = itemDetails.map(item => {

    const total =
      Number(item.price || 0) *
      Number(item.quantity || 0);

    return `
      <div class="item-row">

        <div>
          <p class="item-name">
            ${item.name || "Unnamed Item"}
          </p>
          <p class="item-qty">
            x${item.quantity || 1}
            • ₱${item.price || 0} each
          </p>
        </div>

        <span class="item-price">
          ₱${total}
        </span>

      </div>
    `;
  }).join("");
}

// ─────────────────────────────────────────
// RENDER PRICING
// ─────────────────────────────────────────
function renderPricing(order) {

  setText(
    "pricingSubtotal",
    `₱${order.subtotal || 0}`
  );

  const fee = Number(order.deliveryFee || 0);

  setText(
    "pricingFee",
    fee === 0 ? "Free" : `₱${fee}`
  );

  setText(
    "pricingTotal",
    `₱${order.total || 0}`
  );
}

// ─────────────────────────────────────────
// RENDER CANCEL BUTTON
// ─────────────────────────────────────────
function renderCancelButton(status) {

  const btn = document.getElementById("cancelBtn");

  if (!btn) return;

  // preparing
  if (status === "preparing") {

    btn.disabled = false;
    btn.style.display = "block";
    btn.title = "";
  }

  // cancelled
  else if (status === "cancelled") {

    btn.style.display = "none";
  }

  // delivering or done
  else {

    btn.disabled = true;
    btn.title =
      "Cannot cancel once order is being delivered";
  }
}

// ─────────────────────────────────────────
// SHOW MODAL
// ─────────────────────────────────────────
function showCancelModal() {

  if (!currentOrder) return;

  // only allow preparing
  if (currentOrder.status !== "preparing") return;

  const modal = document.getElementById("cancelModal");

  if (modal) {
    modal.style.display = "flex";
  }
}

// ─────────────────────────────────────────
// HIDE MODAL
// ─────────────────────────────────────────
function hideCancelModal() {

  const modal = document.getElementById("cancelModal");

  if (modal) {
    modal.style.display = "none";
  }
}

// ─────────────────────────────────────────
// CONFIRM CANCEL
// ─────────────────────────────────────────
async function confirmCancel() {

  if (!currentOrder) return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get("orderId");
    
    const order = await fetch('http://127.0.0.1:8000/order/orderid', {
      method: 'POST',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({OrderID : orderId})
    })

    if (order === -1) {
      alert("Order not found.");
      return;
    }
    const statos = "cancelled";
    // update status
    const status = await fetch('http://127.0.0.1:8000/order/status', {
      method: 'PUT',
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify({status : statos, orderID : orderId})
    })


    // update memory
    

    // rerender
    renderTracker("cancelled");
    renderCancelButton("cancelled");

    // close modal
    hideCancelModal();

    console.log("❌ Order Cancelled");

  } catch (error) {

    console.error("❌ Cancel failed:", error);

    alert("Failed to cancel order.");
  }
}

// ─────────────────────────────────────────
// HELPER
// safer text setter
// ─────────────────────────────────────────
function setText(id, value) {

  const element = document.getElementById(id);

  if (element) {
    element.textContent = value;
  }
}

// ─────────────────────────────────────────
// CLOSE MODAL WHEN CLICKING OUTSIDE
// ─────────────────────────────────────────
window.addEventListener("click", (e) => {

  const modal = document.getElementById("cancelModal");

  if (e.target === modal) {
    hideCancelModal();
  }
});

// ─────────────────────────────────────────
// EXPOSE FUNCTIONS
// ─────────────────────────────────────────
window.showCancelModal = showCancelModal;
window.hideCancelModal = hideCancelModal;
window.confirmCancel = confirmCancel;