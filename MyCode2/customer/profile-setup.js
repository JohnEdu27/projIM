// ─────────────────────────────────────────
// PROFILE SETUP
// Saves name and student ID to localStorage
// then redirects to home.html
// ─────────────────────────────────────────

document.addEventListener("DOMContentLoaded", () => {
  console.log("📝 Profile setup loaded!");

  // check if profile is already complete
  // if yes skip setup and go straight to home
  if (localStorage.getItem("profileComplete") === "true") {
    console.log("✅ Profile already complete - going to home");
    // home.html is in the same customer/ folder
    window.location.href = "home.html";
    return;
  }

  // check if user is logged in
  // if not go back to login page
  if (!checkUserSession()) return;

  // setup the form listeners
  setupProfileForm();
});

// ─────────────────────────────────────────
// CHECK USER SESSION
// Returns true if logged in
// Returns false and redirects if not
// ─────────────────────────────────────────
function checkUserSession() {
  // get the current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // check if logged in flag is set
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

  // if no user or not logged in redirect to login
  if (!currentUser || !isLoggedIn) {
    console.log("❌ Not logged in - redirecting to login");
    // Frontend.html is one level up from customer/
    window.location.href = "../Frontend.html";
    return false;
  }

  console.log("👤 User session OK:", currentUser.email);
  return true;
}

// ─────────────────────────────────────────
// SETUP PROFILE FORM
// Loads existing profile if any
// Attaches submit listener
// ─────────────────────────────────────────
function setupProfileForm() {
  const profileForm = document.getElementById("profileForm");

  if (!profileForm) {
    console.error("❌ profileForm not found!");
    return;
  }

  // pre fill form if user already has a profile saved
  loadExistingProfile();

  // listen for form submission
  profileForm.addEventListener("submit", handleProfileSubmit);

  console.log("✅ Form ready");
}

// ─────────────────────────────────────────
// LOAD EXISTING PROFILE
// Pre fills the form if profile was saved before
// ─────────────────────────────────────────
function loadExistingProfile() {
  // get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser) return;

  // use uid if available otherwise use email as key
  const profileKey = currentUser.uid
    ? `userProfile_${currentUser.uid}`
    : `userProfile_${currentUser.email}`;

  // check if a profile was saved before
  const savedProfile = localStorage.getItem(profileKey);

  if (savedProfile) {
    const profile = JSON.parse(savedProfile);
    // fill in the saved values
    document.getElementById("fullname").value = profile.fullname || "";
    document.getElementById("studentId").value = profile.studentId || "";
    console.log("✅ Profile pre-filled from saved data");
  } else {
    // pre fill name from currentUser if available
    if (currentUser.name || currentUser.fullname) {
      document.getElementById("fullname").value =
        currentUser.fullname || currentUser.name || "";
    }
  }
}

// ─────────────────────────────────────────
// HANDLE FORM SUBMIT
// Validates fields then saves and redirects
// ─────────────────────────────────────────
function handleProfileSubmit(e) {
  // stop page from reloading
  e.preventDefault();
  console.log("📤 Form submitted");

  // get all form values
  const profileData = getFormData();

  // validate all fields
  const errors = validateProfile(profileData);

  // if errors found show them and stop
  if (errors.length > 0) {
    console.log("❌ Validation errors:", errors);
    showErrors(errors);
    return;
  }

  // no errors - disable button to prevent double submit
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.textContent = "Saving...";
  saveBtn.disabled = true;

  // save the profile data
  saveProfile(profileData);

  // redirect to home page
  // home.html is in the same customer/ folder as profile-setup.html
  console.log("✅ Profile saved - redirecting to home.html");
  window.location.href = "home.html";
}

// ─────────────────────────────────────────
// GET FORM DATA
// Reads values from the form inputs
// ─────────────────────────────────────────
function getFormData() {
  return {
    // trim removes extra spaces
    fullname: document.getElementById("fullname").value.trim(),
    studentId: document.getElementById("studentId").value.trim()
  };
}

// ─────────────────────────────────────────
// VALIDATE PROFILE
// Checks each field and returns error list
// ─────────────────────────────────────────
function validateProfile(data) {
  const errors = [];

  // check full name - must be at least 2 characters
  if (!data.fullname || data.fullname.length < 2) {
    errors.push({ id: "fullnameError", message: "Full name is required." });
  }

  // check student ID - must be at least 4 characters
  if (!data.studentId || data.studentId.length < 4) {
    errors.push({ id: "studentIdError", message: "Student ID is required." });
  }

  return errors;
}

// ─────────────────────────────────────────
// SAVE PROFILE
// Saves profile to localStorage
// Updates currentUser with profile data
// Sets profileComplete to true to prevent loop
// ─────────────────────────────────────────
function saveProfile(profileData) {
  // get the current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // merge profile data into current user object
  const updatedUser = {
    ...currentUser,
    fullname: profileData.fullname,
    studentId: profileData.studentId,
    // this flag prevents the loop - profile is now done
    profileComplete: true
  };

  // save updated user back to localStorage
  localStorage.setItem("currentUser", JSON.stringify(updatedUser));

  // save this flag separately - this is what stops the loop
  localStorage.setItem("profileComplete", "true");

  // make sure isLoggedIn stays true
  localStorage.setItem("isLoggedIn", "true");

  // save profile separately using uid or email as key
  const profileKey = currentUser.uid
    ? `userProfile_${currentUser.uid}`
    : `userProfile_${currentUser.email}`;

  localStorage.setItem(profileKey, JSON.stringify(profileData));

  console.log("💾 Profile saved:", profileData);
  console.log("🔑 profileComplete set to true - no more loop!");
}

// ─────────────────────────────────────────
// SHOW ERRORS
// Displays red messages below each field
// ─────────────────────────────────────────
function showErrors(errors) {
  // clear all existing errors first
  clearErrors();

  // show each error under the correct field
  errors.forEach(error => {
    const el = document.getElementById(error.id);
    if (el) el.textContent = error.message;
  });
}

// ─────────────────────────────────────────
// CLEAR ERRORS
// Removes all error messages
// ─────────────────────────────────────────
function clearErrors() {
  document.querySelectorAll(".error").forEach(el => {
    el.textContent = "";
  });
}

// ─────────────────────────────────────────
// DEBUG HELPER
// Type debugProfile() in console to check
// ─────────────────────────────────────────
window.debugProfile = function() {
  console.log("currentUser:", localStorage.getItem("currentUser"));
  console.log("profileComplete:", localStorage.getItem("profileComplete"));
  console.log("isLoggedIn:", localStorage.getItem("isLoggedIn"));
};