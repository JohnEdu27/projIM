// ─────────────────────────────────────────
// RIDER SIGNUP JS
// Handles rider registration form
// Saves rider to allUsers in localStorage
// ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  console.log("🏍️ Rider signup page loaded!");



  // handle form submission
  document.getElementById("riderForm").addEventListener("submit", handleRiderSignup);
});

// ─────────────────────────────────────────
// HANDLE RIDER SIGNUP
// Validates all fields
// Creates new rider account
// ─────────────────────────────────────────
function handleRiderSignup(e) {
  e.preventDefault();

  // get field values
  const name = document.getElementById("riderName").value.trim();
  const email = document.getElementById("riderEmail").value.trim().toLowerCase();
  const phone = document.getElementById("riderPhone").value.trim();
  const password = document.getElementById("riderPassword").value.trim();
  const confirm = document.getElementById("riderConfirm").value.trim();

  // clear all errors
  clearErrors();

  let hasError = false;

  // validate name
  if (name.length < 2) {
    showErr("nameErr", "Full name is required.");
    hasError = true;
  }

  // validate email
  if (!email.includes("@")) {
    showErr("emailErr", "Enter a valid email address.");
    hasError = true;
  }

  // validate phone - must be 11 digits starting with 09
  if (!/^09\d{9}$/.test(phone)) {
    showErr("phoneErr", "Enter a valid PH number (e.g. 09123456789).");
    hasError = true;
  }

  // validate password
  if (password.length < 6) {
    showErr("passwordErr", "Password must be at least 6 characters.");
    hasError = true;
  }

  // validate confirm password
  if (password !== confirm) {
    showErr("confirmErr", "Passwords do not match.");
    hasError = true;
  }

  if (hasError) return;
  const getuser = await fetch('http://127.0.0.1:8000/riders')

  // check if email or phone already exists
  const users = getuser;
  const exists = users.email === email || user.phone === phone;
  if (exists) {
    showErr("emailErr", "Email or phone already registered.");
    return;
  }

  // disable button while saving
  const btn = document.getElementById("riderBtn");
  btn.textContent = "Registering...";
  btn.disabled = true;

  // create new rider object
  const newRider = {
    name: name,
    email: email,
    phone: phone,
    password: password
  };

  const response = await fetch('http://127.0.0.1:8000/signup/rider', {
    method: 'POST',
    headers: {'Content-Type': 'application/json'},
    body: JSON.stringify(newRider)
  });


  if(response.ok) {
  console.log("✅ Rider account created:", newRider);
  };
  // hide form and show success
  document.getElementById("riderForm").style.display = "none";
  document.getElementById("successBox").style.display = "block";

  // redirect to login after 2 seconds
  setTimeout(() => {
    window.location.href = "../Frontend.html";
  }, 2000);
}

// ─────────────────────────────────────────
// SAVE USERS TO LOCALSTORAGE
// ─────────────────────────────────────────



// ─────────────────────────────────────────
// SHOW ERROR
// ─────────────────────────────────────────
function showErr(id, message) {
  const el = document.getElementById(id);
  if (el) el.textContent = message;
}

// ─────────────────────────────────────────
// CLEAR ALL ERRORS
// ─────────────────────────────────────────
function clearErrors() {
  document.querySelectorAll(".err").forEach(el => el.textContent = "");
}