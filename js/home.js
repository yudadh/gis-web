document.addEventListener('DOMContentLoaded', () => {
    // Example: Get the user's name from localStorage or an API
    const token =  localStorage.getItem("token")
    console.log(token)
    if (!token) {
        // Redirect to login page if not authenticated
        window.location.href = 'login.html';
    }
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

    document.getElementById('logout').addEventListener('click', () => {
        const logoutUrl = "https://gisapis.manpits.xyz/api/logout"
        axios.post(logoutUrl, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            alert(response.data.meta.message)
            window.location.href = "/login.html"
        })
        .catch(error => {
            console.log(error)
        })
    })

    let map = L.map("map").setView([-8.4095188, 115.188919], 11);
    // menambahkan tilelayer
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    function fetchDataPolyline(){
        const getDataUrl = 'https://gisapis.manpits.xyz/api/ruasjalan'
        axios.get(getDataUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            console.log(response.data)
            const data = response.data
            showData(data)
        })
        .catch(error => {
            console.log(error)
        })
    }
    
    function showData(dataJalan){
        dataJalan.ruasjalan.forEach(ruasJalan => {
            const polylinePoints = polyline.decode(ruasJalan.paths)
            var _polylines = L.polyline(polylinePoints, {color: 'blue', weight: 5}).addTo(map)
            _polylines.on('click', function (e) {
                var popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                <strong>Nama Ruas:</strong> ${ruasJalan.nama_ruas}<br>
                <strong>Kode Ruas:</strong> ${ruasJalan.kode_ruas}<br>
                <strong>Panjang:</strong> ${ruasJalan.panjang} m<br>
                <strong>Lebar:</strong> ${ruasJalan.lebar} m<br>
                <strong>Jenis Perkerasan:</strong> ${ruasJalan.eksisting_id}<br>
                <strong>Kondisi Jalan:</strong> ${ruasJalan.kondisi_id}<br>
                <strong>Jenis Jalan:</strong> ${ruasJalan.jenisjalan_id}<br>
                <strong>Keterangan:</strong> ${ruasJalan.keterangan}
                `)
                .openOn(map)
            });
        });
    }

    fetchDataPolyline()
    
    const addButton = document.getElementById('add-button')
    addButton.addEventListener('click', function(e){
        window.location.href = '/add.html'
    })
});