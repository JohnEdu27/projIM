// ─────────────────────────────────────────
// ADMIN CUSTOMERS PAGE - NO FIREBASE
// Shows all customer profiles from localStorage
// ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  console.log("👥 Customers page loaded!");
  
  // Check admin access
  if (!checkAdminSession()) return;
  
  // Load customers
  loadCustomers();
  setupLogout();
});

let customers = [];
// ─────────────────────────────────────────
// CHECK ADMIN SESSION
// ─────────────────────────────────────────
function checkAdminSession() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  if (!currentUser || !currentUser.role === 'admin') {
    console.log("❌ Admin access denied");
    window.location.href = "../Frontend.html";
    return false;
  }
  
  showUserInfo(currentUser);
  return true;
}

// ─────────────────────────────────────────
// SHOW ADMIN INFO
// ─────────────────────────────────────────
function showUserInfo(user) {
  const displayName = user.fullname || user.name || "Admin";
  
  document.getElementById('userName').textContent = displayName;
  const photoEl = document.getElementById('userPhoto');
  if (photoEl) {
    photoEl.src = `https://via.placeholder.com/40/FF6600/ffffff?text=${displayName.charAt(0)}`;
  }
}

// ─────────────────────────────────────────
// LOAD ALL CUSTOMERS
// ─────────────────────────────────────────
async function loadCustomers() {
  const customersTable = document.getElementById('customersTable');
  if (!customersTable) return;
  
  // Get all customer profiles from 
  const currentUser = await fetch('http://127.0.0.1:8000/customers');
   customers = await currentUser.json();
  
  customersTable.innerHTML = '';
  
  if (customers.length === 0) {
    customersTable.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 20px;">No customers yet</td></tr>';
    return;
  }
  
  customers.forEach(customer => {
    const row = createCustomerRow(customer);
    customersTable.appendChild(row);
  });
  
  console.log(`✅ Loaded ${customers.length} customers`);
}

// ─────────────────────────────────────────
// GET ALL CUSTOMERS FROM LOCALSTORAGE
// Scans all userProfile_* keys
// ─────────────────────────────────────────
async function getAllCustomers() {
  
  
  // Check current user
  
  customers = await currentUser.json();
  if (currentUser.email && !currentUser.email.includes("admin")) {
    customers.push(currentUser);
  }

  
  // Remove duplicates and sort by name
  const uniqueCustomers = Array.from(new Map(customers.map(c => [c.uid, c])).values())
    .sort((a, b) => a.fullname.localeCompare(b.fullname));
  
  return uniqueCustomers;
}

// ─────────────────────────────────────────
// CREATE CUSTOMER TABLE ROW
// ─────────────────────────────────────────
function createCustomerRow(customer) {
  const row = document.createElement('tr');
  
  row.innerHTML = `
    <td>${customer.Name}</td>
    <td>${customer.email}</td>
    <td>${customer.CustomerID}</td>
  `;
  
  return row;
}

// ─────────────────────────────────────────
// LOGOUT
// ─────────────────────────────────────────
function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.clear();
      window.location.href = "../Frontend.html";
    });
  }
}

// ─────────────────────────────────────────
// ADMIN TEST LOGIN
// Console: adminTestLogin()
window.adminTestLogin = function() {
  const adminUser = {
    email: "admin@campus.com",
    fullname: "Customers Admin",
    uid: "admin_customers"
  };
  localStorage.setItem("currentUser", JSON.stringify(adminUser));
  localStorage.setItem("isLoggedIn", "true");
  console.log("🧑‍💼 Admin login - refresh!");
};