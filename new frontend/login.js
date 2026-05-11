// ─────────────────────────────────────────
// DUMMY USERS DATABASE - SEPARATE ROLES
// ─────────────────────────────────────────
// ─────────────────────────────────────────
// WAIT FOR PAGE LOAD
// ─────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  console.log("🏠 Login page loaded!");
  
  const loginForm = document.getElementById("loginForm");
  const loginInput = document.getElementById("email");
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

});

// ─────────────────────────────────────────
// MAIN LOGIN FUNCTION
// ─────────────────────────────────────────
async function handleLogin(loginInput, passwordInput, rememberInput, submitBtn, loginError, passwordError) {
  clearErrors(loginError, passwordError);

  const loginValue = loginInput.value.trim();
  const passwordValue = passwordInput.value;

  if (!loginValue) {
    showError(loginError, "Email required");
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(loginValue)) {
        alert("Please enter a valid email address.");
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

  const LoginValue = {
    email : loginValue,
    password : passwordValue
  };

  const response = await fetch('http://127.0.0.1:8000/login', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(LoginValue)
  });

  const result = await response.json();

  
  try  {


    if(response.ok) {
      const role = result.role;
      saveUserSession(result);
      if (role === 'customer') window.location.href = "customer/home.html";
      else if (role === 'faculty') window.location.href = "faculty.html";
      else if (role === 'admin') window.location.href = "admin/dashboard.html";
      else if (role === 'rider') window.location.href = "rider.html";
  }else {
          console.error("Login Failed:", result.detail);
          alert("Error: " + (result.detail || "Invalid credentials"));
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


// ─────────────────────────────────────────
// SAVE USER SESSION
// ─────────────────────────────────────────
function saveUserSession(user) {
  localStorage.setItem("currentUser", JSON.stringify(user));
  localStorage.setItem("isLoggedIn", "true");
  localStorage.setItem("userID", user.id);
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