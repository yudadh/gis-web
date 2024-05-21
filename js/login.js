document.getElementById('loginForm').addEventListener('submit', function(event) {
    event.preventDefault();
    
    let isValid = true;
    const form = document.getElementById('loginForm')

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();
    
    const emailError = document.getElementById('emailError');
    const passwordError = document.getElementById('passwordError');
 
    emailError.style.display = 'none';
    passwordError.style.display = 'none';

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

    if (isValid) {
        // Here you can add code to send the form data to the server
        const formData = new FormData(form);
        const jsonObject = {};

        formData.forEach((value, key) => {
            jsonObject[key] = value
        });
        console.log(jsonObject)

        const url = "https://gisapis.manpits.xyz/api/login"

        axios.post(url, jsonObject)
        .then(response =>{
            alert(response.data.meta.message)
            // alert('Register Form submitted successfully!');
            console.log(response.data.meta.token)
            // set token to localstorage
            const token = response.data.meta.token
            localStorage.setItem("token", token)
            
            window.location.href = '/home.html'
        })
        .catch(error => {
            alert('Failed to submit Login form. Please try again later.');
            console.log(error)
        })

    }
});
