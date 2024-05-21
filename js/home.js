document.addEventListener('DOMContentLoaded', () => {
    // Example: Get the user's name from localStorage or an API
    const token =  localStorage.getItem("token")
    console.log(token)
    const url = "https://gisapis.manpits.xyz/api/user"
    axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
    .then(response => {
        const userName = response.data.data.user.name; // Replace this with dynamic data
        document.querySelector('.user-name').textContent = userName;
    })
    .catch(error => {
        console.log(error)
    })

    let map = L.map("map").setView([-8.4095188, 115.188919], 11);
    // menambahkan tilelayer
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

});