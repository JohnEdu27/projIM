// ─────────────────────────────────────────
// DELIVERY.JS
// Handles the delivery form
// Saves order to localStorage
// Redirects to order_details.html
// ─────────────────────────────────────────

// wait for page to fully load
document.addEventListener("DOMContentLoaded", () => {
  console.log("🛵 Delivery page loaded!");

  // load the cart summary into the form
  loadOrderSummary();

  // update summary when delivery option changes
  // because express adds a ₱20 fee
  document.getElementById("deliveryOption").addEventListener("change", loadOrderSummary);

  // listen for form submission
  document.getElementById("deliveryForm").addEventListener("submit", handleDeliverySubmit);
});

// ─────────────────────────────────────────
// LOAD ORDER SUMMARY
// Reads cart from localStorage
// Shows items, delivery fee, and total
// ─────────────────────────────────────────
function loadOrderSummary() {
  // get cart from localStorage
  const cart = JSON.parse(localStorage.getItem("cart") || "[]");
  const summaryBox = document.getElementById("orderSummary");

  
  // if cart is empty show message
  if (cart.length === 0) {
    summaryBox.innerHTML = `
      <p style="color:#888;text-align:center;padding:0.5rem 0;">
        Your cart is empty. 
        <a href="home.html" style="color:#FF6600;">Browse menu</a>
      </p>`;
    return;
  }

  // get selected delivery option to calculate fee
  const selectedOption = document.getElementById("deliveryOption").value;
  const deliveryFee = selectedOption === "express" ? 20 : 0;

  // build summary HTML
  let summaryHTML = "";
  let subtotal = 0;

  // loop through each cart item
  cart.forEach(item => {
    // calculate item total
    const itemTotal = item.price * item.quantity;
    subtotal += itemTotal;

    summaryHTML += `
      <div class="summary-row">
        <span>${item.name} x${item.quantity}</span>
        <span>₱${itemTotal}</span>
      </div>
    `;
  });

  // calculate grand total including delivery fee
  const grandTotal = subtotal + deliveryFee;

  // add divider, fee, and total
  summaryHTML += `
    <div class="summary-divider"></div>
    <div class="summary-fee">
      <span>Subtotal</span>
      <span>₱${subtotal}</span>
    </div>
    <div class="summary-fee">
      <span>Delivery Fee</span>
      <span>${deliveryFee === 0 ? 'Free' : '₱' + deliveryFee}</span>
    </div>
    <div class="summary-divider"></div>
    <div class="summary-total">
      <span>Total</span>
      <span>₱${grandTotal}</span>
    </div>
  `;

  summaryBox.innerHTML = summaryHTML;
}

// ─────────────────────────────────────────
// HANDLE DELIVERY SUBMIT
// Validates all fields
// Saves order to localStorage
// Redirects to order_details.html
// ─────────────────────────────────────────
 function handleDeliverySubmit(e) {
  // stop page from reloading
  e.preventDefault();

  // get all field values
  const address = document.getElementById("deliveryAddress").value.trim();
  const phone = document.getElementById("phoneNumber").value.trim();
  const option = document.getElementById("deliveryOption").value;
  const payment = document.querySelector('input[name="paymentMethod"]:checked');
  const notes = document.getElementById("orderNotes").value.trim();

  
  

  // clear all previous errors
  clearErrors();

  let hasError = false;

  // validate delivery address
  if (address.length < 5) {
    showError("addressError", "deliveryAddress", "Please enter a valid delivery address.");
    hasError = true;
  }

  // validate phone number - must be 11 digits starting with 09
  if (!isValidPhone(phone)) {
    showError("phoneError", "phoneNumber", "Enter a valid PH number (e.g. 09123456789).");
    hasError = true;
  }

  // validate delivery option selected
  if (option === "") {
    showError("optionError", "deliveryOption", "Please select a delivery option.");
    hasError = true;
  }

  // validate payment method selected
  if (!payment) {
    showError("paymentError", null, "Please select a payment method.");
    hasError = true;
  }

  // stop if any errors found
  if (hasError) return;

  // disable button to prevent double submit
  const btn = document.getElementById("placeOrderBtn");
    btn.textContent = "Placing Order...";
    btn.disabled = true;

  // short delay to feel like real processing
  setTimeout(async () => {
    // generate unique order ID using timestamp
    
    // get cart items
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");

    // calculate fees
    const deliveryFee = option === "express" ? 20 : 0;
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const total = subtotal + deliveryFee;

    // get current user info
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");

    const now = new Date();
    const orderId = generateOrderId();
    const phDate = now.toLocaleDateString('en-CA', {timezone: 'Asia/Manila' });
    const phTime = now.toLocaleTimeString('en-GB', {timezone: 'Asia/Manila', hour12: false });
    const userID = JSON.parse(localStorage.getItem("userID"));
    // build the complete order object
    const newOrder = {
      userID: userID,
      orderId: orderId,
      // order date and time
      date: phDate,
      time: phTime,
      // customer info
      customerName: currentUser.fullname || currentUser.name || "Customer",
      // delivery info
      address: address,
      phone: phone,
      deliveryOption: option,
      deliveryFee: deliveryFee,
      // payment info
      paymentMethod: payment.value,
      // order notes
      notes: notes,
      // cart items snapshot
      items: cart,
      // pricing
      subtotal: subtotal,
      total: total,
      // status starts at preparing
      status: "preparing"
    };

    const response = await fetch('http://127.0.0.1:8000/orders', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(newOrder)
  });

    // save order to localStorage orders array
    const orders = JSON.parse(localStorage.getItem("orders") || "[]");
    orders.push(newOrder);
    localStorage.setItem("orders", JSON.stringify(orders));

    // save current order ID so order_details can find it
    localStorage.setItem("currentOrderId", orderId);

    // clear the cart after ordering
    localStorage.removeItem("cart");

    console.log("✅ Order saved:", newOrder);

    // redirect to order details page with order ID in URL
    window.location.href = `order.details.html?orderId=${orderId}`;

    
  }, 1000);


}


// ─────────────────────────────────────────
// VALIDATE PHONE
// Must be 11 digits starting with 09
// ─────────────────────────────────────────
function isValidPhone(phone) {
  const phoneRegex = /^09\d{9}$/;
  return phoneRegex.test(phone);
}

// ─────────────────────────────────────────
// SHOW ERROR
// Shows red message and red border on field
// ─────────────────────────────────────────
function showError(errorId, fieldId, message) {
  const errorEl = document.getElementById(errorId);
  if (errorEl) errorEl.textContent = message;

  if (fieldId) {
    const fieldEl = document.getElementById(fieldId);
    if (fieldEl) fieldEl.classList.add("error-border");
  }
}

// ─────────────────────────────────────────
// CLEAR ERRORS
// Removes all error messages and red borders
// ─────────────────────────────────────────
function clearErrors() {
  document.querySelectorAll(".error").forEach(el => el.textContent = "");
  document.querySelectorAll(".error-border").forEach(el => el.classList.remove("error-border"));
}

function generateOrderId() {
  let date = new Date()
  let mmdd = String(date.getMonth() + 1).padStart(2, '0') + String(date.getDate()).padStart(2, '0')
  let random4 = Math.floor(Math.random() * 9000) + 1000

  return parseInt(mmdd + random4)
}