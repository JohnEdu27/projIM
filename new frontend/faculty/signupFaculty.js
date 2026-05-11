// ─────────────────────────────────────────
// FACULTY SIGNUP JS
// Handles faculty registration form
// Saves faculty to allUsers in localStorage
// ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  console.log("👨‍🏫 Faculty signup page loaded!");

  // handle form submission
  document.getElementById("facultyForm").addEventListener("submit", handleFacultySignup);
});

// ─────────────────────────────────────────
// HANDLE FACULTY SIGNUP
// Validates all fields
// Creates new faculty account
// Saves to localStorage
// ─────────────────────────────────────────
function handleFacultySignup(e) {
  e.preventDefault();

  // get field values
  const name = document.getElementById("facultyName").value.trim();
  const email = document.getElementById("facultyEmail").value.trim().toLowerCase();
  const phone = document.getElementById("facultyPhone").value.trim();
  const facultyId = document.getElementById("facultyId").value.trim();
  const dept = document.getElementById("facultyDept").value;
  const password = document.getElementById("facultyPassword").value.trim();
  const confirm = document.getElementById("facultyConfirm").value.trim();

  // clear errors
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

  // validate phone
  if (!/^09\d{9}$/.test(phone)) {
    showErr("phoneErr", "Enter a valid PH number (e.g. 09123456789).");
    hasError = true;
  }

  // validate faculty ID
  if (facultyId.length < 3) {
    showErr("idErr", "Faculty ID is required.");
    hasError = true;
  }

  // validate department
  if (!dept) {
    showErr("deptErr", "Please select your department.");
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

  // disable button
  const btn = document.getElementById("facultyBtn");
  btn.textContent = "Registering...";
  btn.disabled = true;

  // create new faculty object
  const newFaculty = {
    uid: "fac_" + Date.now(),
    name: name,
    fullname: name,
    email: email,
    phone: phone,
    password: password,
    role: "faculty",
    facultyId: facultyId,
    department: dept,
    profileComplete: true,
    createdAt: new Date().toLocaleDateString("en-PH")
  };

  // add to users list
  users.push(newFaculty);
  saveUsers(users);

  console.log("✅ Faculty account created:", newFaculty);

  // hide form and show success
  document.getElementById("facultyForm").style.display = "none";
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