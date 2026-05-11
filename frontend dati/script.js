const loginButton = document.getElementById('loginForm');

loginButton.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailInput = document.getElementById('email').value.trim();
    const passInput = document.getElementById('password').value;

    if(!emailInput || !passInput) {
        alert("Please fill in all fields.")
        return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(emailInput)) {
        alert("Please enter a valid email address.");
        return;
        }

    const loginData = {
        email: emailInput,
        password: passInput
    };
        const response = await fetch('http://127.0.0.1:8000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(loginData)
        });
        const result = await response.json();

        if(response.ok) {
            const role = result.role;

            if (role === 'customer') window.location.href = "homepage.html";
            else if (role === 'faculty') window.location.href = "faculty.html";
            else if (role === 'admin') window.location.href = "admin.html";
            else if (role === 'rider') window.location.href = "rider.html";
        }else {
                console.error("Login Failed:", result.detail);
                alert("Error: " + (result.detail || "Invalid credentials"));
        }
})