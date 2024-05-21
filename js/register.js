document.getElementById('registerForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let isValid = true;
    const form = document.getElementById('registerForm')

    const username = document.getElementById('username').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    // const confirmPassword = document.getElementById('confirmPassword').value.trim();

    const usernameError = document.getElementById('usernameError');
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
    // const confirmPasswordError = document.getElementById('confirmPasswordError');

    usernameError.style.display = 'none';
    emailError.style.display = 'none';
    passwordError.style.display = 'none';
    // confirmPasswordError.style.display = 'none';

    if (username.length < 3) {
        isValid = false;
        usernameError.textContent = 'Username must be at least 3 characters long';
        usernameError.style.display = 'block';
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        isValid = false;
        emailError.textContent = 'Invalid email address';
        emailError.style.display = 'block';
    }

    if (password.length < 6) {
        isValid = false;
        passwordError.textContent = 'Password must be at least 6 characters long';
        passwordError.style.display = 'block';
    }

    // if (password !== confirmPassword) {
    //     isValid = false;
    //     confirmPasswordError.textContent = 'Passwords do not match';
    //     confirmPasswordError.style.display = 'block';
    // }

    if (isValid) {
        // alert('Form submitted successfully!');
        // Here you can add code to send the form data to the server
        const formData = new FormData(form);
        const jsonObject = {};

        formData.forEach((value, key) => {
            jsonObject[key] = value
        });
        console.log(jsonObject)

        const url = "https://gisapis.manpits.xyz/api/register"

        axios.post(url, jsonObject)
        .then(response =>{
            alert(response.data.meta.message)
            // alert('Register Form submitted successfully!');
            console.log(response)
            window.location.href = '/login.html'
        })
        .catch(error => {
            alert('Failed to submit register form. Please try again later.');
            console.log(error)
        })

    }
});
