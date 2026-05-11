// ─────────────────────────────────────────
// RIDER SIGNUP JS
// Handles rider registration form
// Saves rider to allUsers in localStorage
// ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  console.log("🏍️ Rider signup page loaded!");

  // show/hide plate field based on vehicle
  document.getElementById("riderVehicle").addEventListener("change", function() {
    const plateGroup = document.getElementById("plateGroup");
    // only show plate for motorcycle
    if (this.value === "motorcycle") {
      plateGroup.style.display = "block";
    } else {
      plateGroup.style.display = "none";
      document.getElementById("riderPlate").value = "";
    }
  });

  // handle form submission
  document.getElementById("riderForm").addEventListener("submit", handleRiderSignup);
});

// ─────────────────────────────────────────
// HANDLE RIDER SIGNUP
// Validates all fields
// Creates new rider account
// Saves to localStorage
// ─────────────────────────────────────────
function handleRiderSignup(e) {
  e.preventDefault();

  // get field values
  const name = document.getElementById("riderName").value.trim();
  const email = document.getElementById("riderEmail").value.trim().toLowerCase();
  const phone = document.getElementById("riderPhone").value.trim();
  const vehicle = document.getElementById("riderVehicle").value;
  const plate = document.getElementById("riderPlate").value.trim();
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

  // validate vehicle
  if (!vehicle) {
    showErr("vehicleErr", "Please select a vehicle type.");
    hasError = true;
  }

  // validate plate for motorcycle only
  if (vehicle === "motorcycle" && plate.length < 3) {
    showErr("plateErr", "License plate is required for motorcycle.");
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

  // check if email or phone already exists
  const users = getUsers();
  const exists = users.find(u => u.email === email || u.phone === phone);
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
    uid: "rider_" + Date.now(),
    name: name,
    fullname: name,
    email: email,
    phone: phone,
    password: password,
    role: "rider",
    vehicle: vehicle,
    plate: plate || "N/A",
    status: "active",
    profileComplete: true,
    createdAt: new Date().toLocaleDateString("en-PH")
  };

  // add to users list
  users.push(newRider);
  saveUsers(users);

  console.log("✅ Rider account created:", newRider);

  // hide form and show success
  document.getElementById("riderForm").style.display = "none";
  document.getElementById("successBox").style.display = "block";

  // redirect to login after 2 seconds
  setTimeout(() => {
    window.location.href = "../Frontend.html";
  }, 2000);
}

// ─────────────────────────────────────────
// GET USERS FROM LOCALSTORAGE
// ─────────────────────────────────────────
function getUsers() {
  return JSON.parse(localStorage.getItem("allUsers") || "[]");
}

// ─────────────────────────────────────────
// SAVE USERS TO LOCALSTORAGE
// ─────────────────────────────────────────
function saveUsers(users) {
  localStorage.setItem("allUsers", JSON.stringify(users));
}

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