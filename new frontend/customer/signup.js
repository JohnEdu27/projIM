// ─────────────────────────────────────────
// SIGNUP JS
// Basic customer registration
// Name, Email, Phone, Password
// Saves to allUsers in localStorage
// ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  console.log("📝 Signup page loaded!");

  // handle form submit
  document.getElementById("signupForm")
    .addEventListener("submit", handleSignup);
});

// ─────────────────────────────────────────
// HANDLE SIGNUP
// Validates all fields then saves new user
// ─────────────────────────────────────────
async function handleSignup(e) {
  e.preventDefault();

  // get all field values
  const name     = document.getElementById("fullName").value.trim();
  const email    = document.getElementById("email").value.trim().toLowerCase();
  const phone    = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value.trim();
  const confirm  = document.getElementById("confirmPassword").value.trim();

  // clear all errors first
  clearErrors();

  let hasError = false;

  // validate full name
  if (name.length < 2) {
    showErr("nameErr", "fullName", "Please enter your full name.");
    hasError = true;
  }

  // validate email format
  if (!email.includes("@") || !email.includes(".")) {
    showErr("emailErr", "email", "Please enter a valid email address.");
    hasError = true;
  }

  // validate phone - must be 11 digits starting with 09
  if (!/^09\d{9}$/.test(phone)) {
    showErr("phoneErr", "phone", "Enter a valid PH number (e.g. 09123456789).");
    hasError = true;
  }

  // validate password length
  if (password.length < 6) {
    showErr("passwordErr", "password", "Password must be at least 6 characters.");
    hasError = true;
  }

  // validate passwords match
  if (password !== confirm) {
    showErr("confirmErr", "confirmPassword", "Passwords do not match.");
    hasError = true;
  }

  // stop if any errors found
  if (hasError) return;

  // check if email or phone already registered
  const response = await fetch('http://127.0.0.1:8000/customers');
  const users = await response.json();
  const exists = users.email === email || users.phone === phone;

  if (exists) {
    showErr("emailErr", "email", "Email or phone number already registered.");
    return;
  }

  // disable button while saving
  const btn = document.getElementById("signupBtn");
  btn.textContent = "Creating account...";
  btn.disabled = true;

  // short delay to feel natural
  await new Promise(r => setTimeout(r, 800));

  // create new user object
  const newUser = {
    name: name,
    email: email,
    phone: phone,
    password: password
  };

  // add to users list and save
  const result = await fetch('http://127.0.0.1:8000/signup', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(newUser)
  });

  if(!result.ok) {
    console.error("Error Try Again.")
    return;
  };
  console.log("✅ New user created:", newUser);

  // hide form and show success screen
  document.getElementById("signupSection").style.display = "none";
  document.getElementById("successScreen").style.display = "block";
}

// ─────────────────────────────────────────
// TOGGLE PASSWORD EYE
// Shows or hides password text
// ─────────────────────────────────────────
window.toggleEye = function(inputId, btn) {
  const input = document.getElementById(inputId);

  if (input.type === "password") {
    input.type = "text";
    btn.textContent = "🙈";
  } else {
    input.type = "password";
    btn.textContent = "👁️";
  }
};

// ─────────────────────────────────────────
// CHECK PASSWORD STRENGTH
// Updates the strength bar as user types
// ─────────────────────────────────────────
window.checkStrength = function() {
  const password = document.getElementById("password").value;
  const fill     = document.getElementById("strengthFill");
  const label    = document.getElementById("strengthLabel");

  if (!password) {
    fill.style.width = "0%";
    label.textContent = "";
    return;
  }

  let strength = 0;

  // check each criteria
  if (password.length >= 6)  strength++;
  if (password.length >= 10) strength++;
  if (/\d/.test(password))   strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;

  let text, color, width;

  if (strength <= 1) {
    text = "Weak";     color = "#ef4444"; width = "25%";
  } else if (strength <= 2) {
    text = "Fair";     color = "#f97316"; width = "50%";
  } else if (strength <= 3) {
    text = "Good";     color = "#FFB347"; width = "75%";
  } else {
    text = "Strong 💪"; color = "#22c55e"; width = "100%";
  }

  fill.style.width      = width;
  fill.style.background = color;
  label.textContent     = text;
  label.style.color     = color;
};

// ─────────────────────────────────────────
// SHOW ERROR
// Shows red message and red border on field
// ─────────────────────────────────────────
function showErr(errId, inputId, message) {
  const errEl   = document.getElementById(errId);
  const inputEl = document.getElementById(inputId);

  if (errEl)   errEl.textContent = message;
  if (inputEl) inputEl.classList.add("err");
}

// ─────────────────────────────────────────
// CLEAR ALL ERRORS
// Removes all red messages and borders
// ─────────────────────────────────────────
function clearErrors() {
  document.querySelectorAll(".err-text")
    .forEach(el => el.textContent = "");
  document.querySelectorAll("input.err")
    .forEach(el => el.classList.remove("err"));
}

// ─────────────────────────────────────────
// GET USERS FROM LOCALSTORAGE
// ─────────────────────────────────────────

// ─────────────────────────────────────────
// SAVE USERS TO LOCALSTORAGE
// ─────────────────────────────────────────
function saveUsers(users) {
  localStorage.setItem("allUsers", JSON.stringify(users));
}