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

// ─────────────────────────────────────────
// CHECK ADMIN SESSION
// ─────────────────────────────────────────
function checkAdminSession() {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  
  if (!currentUser || !currentUser.email.includes("admin")) {
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
function loadCustomers() {
  const customersTable = document.getElementById('customersTable');
  if (!customersTable) return;
  
  // Get all customer profiles from localStorage
  const customers = getAllCustomers();
  
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
function getAllCustomers() {
  const customers = [];
  
  // Check current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser") || "{}");
  if (currentUser.email && !currentUser.email.includes("admin")) {
    customers.push(currentUser);
  }
  
  // Check all userProfile_* entries
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.startsWith("userProfile_")) {
      try {
        const profile = JSON.parse(localStorage.getItem(key));
        const user = JSON.parse(localStorage.getItem("currentUser") || "{}");
        
        // Combine profile + basic user info
        const customer = {
          uid: key.replace("userProfile_", ""),
          fullname: profile.fullname || user.name || "Unknown",
          email: user.email || "N/A",
          department: profile.department || "N/A",
          block: profile.block || "N/A",
          studentId: profile.studentId || "N/A"
        };
        
        // Only non-admin customers
        if (!customer.email?.includes("admin")) {
          customers.push(customer);
        }
      } catch (e) {
        console.warn("Skipping invalid profile:", key);
      }
    }
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
    <td>${customer.uid.slice(-6)}</td>
    <td>${customer.fullname}</td>
    <td>${customer.email}</td>
    <td>${customer.department}</td>
    <td>${customer.block}</td>
    <td>${customer.studentId}</td>
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