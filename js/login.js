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
        const formData = new FormData(form);
        const jsonObject = {};

        formData.forEach((value, key) => {
            jsonObject[key] = value
        });
        console.log(jsonObject)

        const url = "https://gisapis.manpits.xyz/api/login"
        
        axios.post(url, jsonObject)
        .then(response =>{
            // set token to localstorage
            const token = response.data.meta.token
            localStorage.setItem("token", token)
            Swal.fire({
                title: "Login Berhasil!",
                icon: "success",
                confirmButtonText: "OK"
            }).then(() => {
                window.location.href = '/home.html'
            });
        })
        .catch(error => {
            Swal.fire({
                title: "Login Gagal!",
                icon: "error",
                confirmButtonText: "OK"
            }).then(() => {
                window.location.reload()
            });
            console.log(error)
        })

    }
})

document.getElementById('show').addEventListener('change', () => {
    const pass = document.getElementById('password')
    if (pass.type === 'password'){
        pass.type = 'text'
    }else {
        pass.type = 'password'
    }
})
