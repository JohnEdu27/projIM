// ─────────────────────────────────────────
// DUMMY USERS DATABASE - SEPARATE ROLES
// ─────────────────────────────────────────
const dummyUsers = [
  // 👥 CUSTOMERS
  {
    email: "student1@campus.com",
    phone: "09123456789",
    password: "123456",
    name: "Juan Dela Cruz",
    uid: "cust001",
    role: "customer",
    profileComplete: true
  },
  {
    email: "student2@campus.com", 
    phone: "09987654321",
    password: "password",
    name: "Maria Santos",
    uid: "cust002",
    role: "customer",
    profileComplete: true
  },
  {
    email: "test@campus.com",
    phone: "09111111111",
    password: "test123",
    name: "Test User",
    uid: "cust003",
    role: "customer",
    profileComplete: false  // Goes to profile setup
  },

  // 👨‍💼 ADMINS
  {
    email: "admin@campus.com",
    phone: "09876543210",
    password: "admin123",
    name: "Super Admin",
    uid: "admin001",
    role: "admin",
    profileComplete: true
  },
  {
    email: "manager@campus.com",
    phone: "09777777777",
    password: "manager456",
    name: "Canteen Manager", 
    uid: "admin002",
    role: "admin",
    profileComplete: true
  }
];

// ─────────────────────────────────────────
// WAIT FOR PAGE LOAD
// ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  console.log("🏠 Login page loaded!");
  
  const loginForm = document.getElementById("loginForm");
  const loginInput = document.getElementById("login");
  const passwordInput = document.getElementById("password");
  const rememberInput = document.getElementById("remember");
  const submitBtn = document.getElementById("submitBtn");
  const googleBtn = document.getElementById("googleBtn");
  const facebookBtn = document.getElementById("facebookBtn");

  const loginError = document.getElementById("loginError");
  const passwordError = document.getElementById("passwordError");

  if (!loginForm) {
    console.error("❌ Login form not found!");
    return;
  }

  // Load remembered login
  const rememberedLogin = localStorage.getItem("rememberedLogin");
  if (rememberedLogin) {
    loginInput.value = rememberedLogin;
    if (rememberInput) rememberInput.checked = true;
  }

  // Form submission
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    await handleLogin(loginInput, passwordInput, rememberInput, submitBtn, loginError, passwordError);
  });

  // Google/Facebook dummy
  if (googleBtn) {
    googleBtn.addEventListener("click", () => handleGoogleLogin(loginError));
  }
  if (facebookBtn) {
    facebookBtn.addEventListener("click", () => handleFacebookLogin(loginError));
  }

  // Show role-separated logins
  console.log("👥 CUSTOMERS:");
  dummyUsers.filter(u => u.role === "customer").forEach(user => {
    console.log(`  ${user.email.padEnd(20)} / ${user.password}`);
  });
  console.log("\n👨‍💼 ADMINS:");
  dummyUsers.filter(u => u.role === "admin").forEach(user => {
    console.log(`  ${user.email.padEnd(20)} / ${user.password}`);
  });
});

// ─────────────────────────────────────────
// MAIN LOGIN FUNCTION
// ─────────────────────────────────────────
async function handleLogin(loginInput, passwordInput, rememberInput, submitBtn, loginError, passwordError) {
  clearErrors(loginError, passwordError);

  const loginValue = loginInput.value.trim().toLowerCase();
  const passwordValue = passwordInput.value.trim();

  if (!loginValue) {
    showError(loginError, "Email or phone required");
    return;
  }
  if (!passwordValue) {
    showError(passwordError, "Password required");
    return;
  }
  if (passwordValue.length < 6) {
    showError(passwordError, "Password too short");
    return;
  }

  if (rememberInput?.checked) {
    localStorage.setItem("rememberedLogin", loginValue);
  } else {
    localStorage.removeItem("rememberedLogin");
  }

  setLoading(submitBtn, true);
  await new Promise(resolve => setTimeout(resolve, 1200));

  try {
    const user = findUser(loginValue, passwordValue);
    if (!user) throw new Error("Invalid credentials");

    saveUserSession(user);

    // ROLE-BASED REDIRECT
    if (user.role === "admin") {
      console.log("👨‍💼 Admin redirect → admin/dashboard.html");
      window.location.href = "admin/dashboard.html";
    } else {
      // Customer logic
      if (user.profileComplete) {
        console.log("👥 Customer → customer/home.html");
        window.location.href = "customer/home.html";
      } else {
        console.log("👥 Customer → profile setup");
        window.location.href = "customer/profile-setup.html";
      }
    }

  } catch (error) {
    showError(loginError, error.message);
  } finally {
    setLoading(submitBtn, false);
  }
}

// ─────────────────────────────────────────
// FIND USER
// ─────────────────────────────────────────
function findUser(loginValue, passwordValue) {
  return dummyUsers.find(user => 
    (user.email === loginValue || user.phone === loginValue) && 
    user.password === passwordValue
  );
}

// ─────────────────────────────────────────
// SAVE USER SESSION
// ─────────────────────────────────────────
function saveUserSession(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userUid", user.uid);
  localStorage.setItem("userRole", user.role); // NEW: Save role
  console.log(`👤 ${user.role.toUpperCase()} session:`, user.name);
}

// ─────────────────────────────────────────
// GOOGLE LOGIN (Customer)
// ─────────────────────────────────────────
function handleGoogleLogin(loginError) {
  const googleUser = {
    email: "google.cust@campus.com",
    name: "Google Customer",
    uid: "google_cust",
    role: "customer",
    profileComplete: true
  };
  saveUserSession(googleUser);
  showNotification("Google login successful!", "success");
  window.location.href = "customer/home.html";
}

// ─────────────────────────────────────────
// FACEBOOK LOGIN (Customer)
// ─────────────────────────────────────────
function handleFacebookLogin(loginError) {
  const fbUser = {
    email: "fb.cust@campus.com",
    name: "Facebook Customer",
    uid: "fb_cust",
    role: "customer", 
    profileComplete: true
  };
  saveUserSession(fbUser);
  showNotification("Facebook login!", "success");
  window.location.href = "customer/home.html";
}

// ─────────────────────────────────────────
// UTILITIES
// ─────────────────────────────────────────
function clearErrors(loginError, passwordError) {
  if (loginError) loginError.textContent = "";
  if (passwordError) passwordError.textContent = "";
}

function showError(errorElement, message) {
  if (errorElement) {
    errorElement.textContent = message;
    errorElement.style.display = "block";
  }
}

function setLoading(button, loading) {
  button.textContent = loading ? "Loading..." : "Enter";
  button.disabled = loading;
}

function showNotification(message, type = "info") {
  console.log(`✅ ${message}`);
  // Add toast notification here later
}