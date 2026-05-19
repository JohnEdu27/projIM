// ─────────────────────────────────────────
// FORGOT PASSWORD JS
// Simple 2 step flow:
// Step 1 - Enter email/phone + unique ID
// Step 2 - Set new password
// Uses allUsers in localStorage
// ─────────────────────────────────────────

// store found user globally
let foundUser = null;

// ─────────────────────────────────────────
// STEP 1 - VERIFY IDENTITY
// Checks email/phone AND unique ID match
// ─────────────────────────────────────────
async function verifyIdentity() {

  const input = document.getElementById("emailPhone").value.trim().toLowerCase();
  const uniqueId = document.getElementById("uniqueId").value.trim();
  const btn = document.getElementById("verifyBtn");

  const Details = {
    email : input,
  }


  document.getElementById("emailPhoneError").textContent = "";
  document.getElementById("uniqueIdError").textContent = "";
  document.getElementById("emailPhone").classList.remove("error-input");
  document.getElementById("uniqueId").classList.remove("error-input");

  // validate email/phone
  if (!input) {
    document.getElementById("emailPhoneError").textContent =
      "Please enter your email or phone number.";
    document.getElementById("emailPhone").classList.add("error-input");
    return;
  }

  // validate unique ID
  if (!uniqueId) {
    document.getElementById("uniqueIdError").textContent =
      "Please enter your unique ID.";
    document.getElementById("uniqueId").classList.add("error-input");
    return;
  }

  // show loading
  btn.textContent = "Verifying...";
  btn.disabled = true;

  // small delay for UX
  await new Promise(r => setTimeout(r, 800));

  const response = await fetch('http://127.0.0.1:8000/VerifyDetails', {
    method: 'POST',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(Details)
  })
  const user = await response.json();
  
localStorage.setItem("userID", user.user_id);
  const ID = localStorage.getItem("userID");
  // reset button
  btn.textContent = "🔍 Verify Identity";
  btn.disabled = false;

  // user not found by email/phone
  if (!response.ok) {
    document.getElementById("emailPhoneError").textContent =
      "No account found with that email.";
    document.getElementById("emailPhone").classList.add("error-input");
    return;
  }
  console.log(ID)
  console.log(uniqueId)
  if (ID != uniqueId) {
  document.getElementById("uniqueIdError").textContent = "Unique ID doesnt Match.";
  document.getElementById("uniqueid").classList.add("error-input");
  return;
}
// ───
  
  // both match - save user and go to step 2
  foundUser = user;

  // show user info on step 2
  const roleLabels = {
    customer: "🧑‍🎓 Student",
    faculty: "👨‍🏫 Faculty",
    rider: "🏍️ Rider",
    admin: "👨‍💼 Admin"
  };

  document.getElementById("userFoundName").textContent =
    user.fullname || user.name || "User";
  document.getElementById("userFoundRole").textContent =
    roleLabels[user.role] || user.role;
  localStorage.setItem("userRole", user.role);

  // go to step 2
  goToStep(2);
}

// ─────────────────────────────────────────
// CHECK UNIQUE ID
// Checks the ID against the correct field
// based on the user's role
// ─────────────────────────────────────────
//──────────────────────────────────────
// STEP 2 - RESET PASSWORD
// Validates new password and saves it
// ─────────────────────────────────────────
async function resetPassword() {
  const newPassword = document.getElementById("newPassword").value.trim();
  const confirmPassword = document.getElementById("confirmPassword").value.trim();
  const userID = localStorage.getItem("userID");
  const userROLE = localStorage.getItem("userRole");

  const details = {
    newpass : newPassword,
    user_id : userID,
    role : userROLE
  }
  // clear errors
  document.getElementById("newPasswordError").textContent = "";
  document.getElementById("confirmPasswordError").textContent = "";
  document.getElementById("newPassword").classList.remove("error-input");
  document.getElementById("confirmPassword").classList.remove("error-input");

  // validate password length
  if (newPassword.length < 6) {
    document.getElementById("newPasswordError").textContent =
      "Password must be at least 6 characters.";
    document.getElementById("newPassword").classList.add("error-input");
    return;
  }

  // validate passwords match
  if (newPassword !== confirmPassword) {
    document.getElementById("confirmPasswordError").textContent =
      "Passwords do not match.";
    document.getElementById("confirmPassword").classList.add("error-input");
    return;
  }

  // update password in localStorage
  const response = await fetch('http://127.0.0.1:8000/resetpass', {
    method: 'PUT',
    headers: {'Content-Type':'application/json'},
    body: JSON.stringify(details)
  })

  if(!response.ok) {
    console.error("Error try again later.")
    return;
  }
    console.log("✅ Password updated for:", foundUser.email);

  // show success
  goToStep("success");
}

// ─────────────────────────────────────────
// GO TO STEP
// Shows correct step and updates dots
// ─────────────────────────────────────────
function goToStep(step) {
  // hide all steps
  document.querySelectorAll(".step-content").forEach(el => {
    el.classList.remove("active");
  });

  // show selected step
  if (step === "success") {
    document.getElementById("stepSuccess").classList.add("active");
  } else {
    document.getElementById(`step${step}`).classList.add("active");
  }

  // update dots
  const dot1 = document.getElementById("dot1");
  const dot2 = document.getElementById("dot2");

  [dot1, dot2].forEach(d => d.classList.remove("active", "done"));

  if (step === 1) {
    dot1.classList.add("active");
  } else if (step === 2) {
    dot1.classList.add("done");
    dot2.classList.add("active");
  } else if (step === "success") {
    dot1.classList.add("done");
    dot2.classList.add("done");
  }
}

// ─────────────────────────────────────────
// CHECK PASSWORD STRENGTH
// Shows strength bar as user types
// ─────────────────────────────────────────
window.checkStrength = function() {
  const password = document.getElementById("newPassword").value;
  const fill = document.getElementById("strengthFill");
  const text = document.getElementById("strengthText");

  if (!password) {
    fill.style.width = "0%";
    text.textContent = "";
    return;
  }

  let strength = 0;

  // check criteria
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/\d/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[!@#$%^&*]/.test(password)) strength++;

  let label, color, width;

  if (strength <= 1) {
    label = "Weak"; color = "#ef4444"; width = "25%";
  } else if (strength <= 2) {
    label = "Fair"; color = "#f97316"; width = "50%";
  } else if (strength <= 3) {
    label = "Good"; color = "#FFB347"; width = "75%";
  } else {
    label = "Strong 💪"; color = "#22c55e"; width = "100%";
  }

  fill.style.width = width;
  fill.style.background = color;
  text.textContent = label;
  text.style.color = color;
};