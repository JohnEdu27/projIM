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
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  if (!currentUser || !currentUser.email.includes("admin")) {
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
  const displayName = user.fullname || user.name || user.email;
  
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
function loadDashboard() {
  // Updated realistic stats
  document.getElementById('ordersToday').textContent = '18';
  document.getElementById('totalSales').textContent = '₱2,850';
  document.getElementById('totalCustomers').textContent = '89';
  document.getElementById('totalProducts').textContent = '12';

  // Enhanced dummy orders
  const orders = [
    { id: '001', customer: 'Vince Ogena', items: 'Chicken Rice x2', total: '₱110', status: 'done' },
    { id: '002', customer: 'Juan dela Cruz', items: 'Milk Tea x1, Burger x1', total: '₱140', status: 'pending' },
    { id: '003', customer: 'Maria Santos', items: 'Lugaw x3', total: '₱105', status: 'done' },
    { id: '004', customer: 'Pedro Reyes', items: 'Spaghetti x2, Iced Tea x1', total: '₱145', status: 'pending' },
    { id: '005', customer: 'Ana Gonzales', items: 'Pork Adobo x1', total: '₱65', status: 'done' },
    { id: '006', customer: 'Liza Tan', items: 'Tuna Sisig x1', total: '₱70', status: 'delivery' },
  ];

  const tbody = document.getElementById('ordersTable');
  if (!tbody) return;
  
  tbody.innerHTML = '';

  orders.forEach(function(order) {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>#${order.id}</td>
      <td>${order.customer}</td>
      <td>${order.items}</td>
      <td>${order.total}</td>
      <td>
        <span class="badge-${order.status}">
          ${getStatusText(order.status)}
        </span>
      </td>
    `;
    tbody.appendChild(row);
  });
  
  console.log("✅ Dashboard loaded with 6 recent orders");
}

// ─────────────────────────────────────────
// STATUS TEXT
// ─────────────────────────────────────────
function getStatusText(status) {
  const statusMap = {
    'done': '✅ Done',
    'pending': '⏳ Pending', 
    'delivery': '🚚 Delivery'
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