// ─────────────────────────────────────────
// ADMIN DASHBOARD - NO FIREBASE NEEDED
// Same functionality, localStorage only
// ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  console.log("📊 Dashboard loaded!");
  
  // Check admin session
  if (!checkAdminSession()) {
    return;
  }
  
  // Load data & setup logout
  loadDashboard();
  setupLogout();
});

// ─────────────────────────────────────────
// CHECK ADMIN SESSION
// Only admins can access (email contains "admin")
// ─────────────────────────────────────────

function checkAdminSession() {
  const savedUser = localStorage.getItem("currentUser");
  const currentUser = savedUser ? JSON.parse(savedUser): null;

  if (!currentUser || currentUser.role !== "admin") {
    console.log("❌ Not admin - redirecting to login");
    window.location.href = "../Frontend.html";
    return false;
  }

  // Show user info
  showUserInfo(currentUser);
  return true;
}



// ─────────────────────────────────────────
// SHOW USER INFO
// ─────────────────────────────────────────
function showUserInfo(user) {
  const displayName = user.name || user.email;

  const userNameEl = document.getElementById('userName');
  const userPhotoEl = document.getElementById('userPhoto');

  if (userNameEl) userNameEl.textContent = displayName;
  if (userPhotoEl) {
    userPhotoEl.src = user.photoURL || `https://via.placeholder.com/40/FF6600/ffffff?text=A`;
    userPhotoEl.alt = `${displayName}'s profile`;
  }
  
  console.log("✅ Admin dashboard for:", displayName);
}

// ─────────────────────────────────────────
// LOAD DASHBOARD (Same as original)
// ─────────────────────────────────────────
async function loadDashboard() {
  // Updated realistic stats

  const now = new Date();
  const phDate = now.toLocaleDateString('en-CA', {timezone: 'Asia/Manila' });

  const response = await fetch('http://127.0.0.1:8000/admin/dashboard', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify({ "date": phDate})
  });

  const result = await response.json();


  const dashboard = JSON.parse(localStorage.getItem("orders" || "[]"))
  document.getElementById('ordersToday').textContent = result.OrdersToday;
  document.getElementById('totalSales').textContent = 'P' + result.TotalSales;
  document.getElementById('totalCustomers').textContent = result.TotalCustomers;
  document.getElementById('totalProducts').textContent = result.TotalProducts;

  // Enhanced dummy orders
  const info = await fetch('http://127.0.0.1:8000/orders');

  const orders = await info.json();
  
  const tbody = document.getElementById('ordersTable');
  if (!tbody) return;
  
  tbody.innerHTML = '';
  orders.orders.forEach(function(order) {
    const itemDetails = JSON.parse(order.items);
    const itemNames = itemDetails.map(item => `${item.name} (x${item.quantity})`).join('<br> ');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>#${order.orderID}</td>
      <td>${order.customerName}</td>
      <td>${itemNames}</td>
      <td>${order.total}</td>
      <td>
        <span class="badge-${order.status}">
          ${getStatusText(order.status)}
        </span>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  console.log("✅ Dashboard loaded the recent orders");
}

const search = getElementById(search);

if(search == orders.orders.orderID || search == orders.orders.customerName) {
  console.log("Found!");

};


// ─────────────────────────────────────────
// STATUS TEXT
// ─────────────────────────────────────────
function getStatusText(status) {
  const statusMap = {
    'delivered': '✅ Delivered',
    'preparing': '⏳ Preparing', 
    'delivery': '🚚 Delivery',
    'cancelled': '❌ Cancelled'
  };
  return statusMap[status] || '⏳ Pending';
}

// ─────────────────────────────────────────
// LOGOUT (Same as Firebase version)
// ─────────────────────────────────────────
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', function() {
      // Clear everything
      localStorage.clear();
      console.log("👋 Logged out");
      window.location.href = '../Frontend.html';
    });
  }
}

// ─────────────────────────────────────────
// ADMIN TEST LOGIN (Console: adminTestLogin())
// ─────────────────────────────────────────
window.adminTestLogin = function() {
  const adminUser = {
    email: "admin@campus.com",
    name: "Admin User",
    fullname: "Campus Canteen Admin",
    uid: "admin_super",
    profileComplete: true
  };
  
  localStorage.setItem("currentUser", JSON.stringify(adminUser));
  localStorage.setItem("isLoggedIn", "true");
  
  console.log("🧑‍💼 Admin test login - REFRESH PAGE!");
  alert("Admin login set! Refresh dashboard.html");
};