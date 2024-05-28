jwt_token = localStorage.getItem("token")

if (!jwt_token) {
    // Redirect to login page if not authenticated
    window.location.href = '/login.html';
}
const url = "https://gisapis.manpits.xyz/api/user"
axios.get(url, {
    headers: {
        Authorization: `Bearer ${jwt_token}`,
    }
})
.then(response => {
    const userName = response.data.data.user.name; // Replace this with dynamic data
    document.querySelector('.user-name').textContent = userName;
})
.catch(error => {
    console.log(error)
})

    // Initialize the map
var map = L.map('map').setView([-8.4095188, 115.188919], 11);

// Set up the OpenStreetMap layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19
}).addTo(map);

// Add a marker on map click
let polylinePoints = [];
let markers = [];
var _polyline = L.polyline(polylinePoints, {color: 'blue'}).addTo(map);

// Function to calculate distance between two points
function calculateDistance(pointA, pointB) {
    // return L.latLng(pointA).distanceTo(L.latLng(pointB)); // Distance in meters
    return map.distance(pointA, pointB)
}

// Function to calculate total distance of the polyline
function calculateTotalDistance(points) {
    let totalDistance = 0;
    for (let i = 0; i < points.length - 1; i++) {
        totalDistance += calculateDistance(L.latLng(points[i]), L.latLng(points[i + 1]));
    }
    return totalDistance;
}

map.on('click', function(e) {
    var latLng = e.latlng;
    polylinePoints.push([latLng.lat, latLng.lng]);
    _polyline.setLatLngs(polylinePoints);

    var marker = L.marker([latLng.lat, latLng.lng]).addTo(map)
        .bindPopup(`Lat: ${latLng.lat}, Lng: ${latLng.lng}`).openPopup();

    markers.push(marker);

    // Add event listener for right click on the marker
    marker.on('contextmenu', function() {
        // Remove the marker from the map
        map.removeLayer(marker);

        // Remove the latLng from polylinePoints
        polylinePoints = polylinePoints.filter(point => point[0] !== latLng.lat || point[1] !== latLng.lng);
        _polyline.setLatLngs(polylinePoints);

        // Update the LatLng textarea field
        updateLatLngTextarea();
    });

    // Update the LatLng textarea field
    updateLatLngTextarea();
});
// Function to update the LatLng textarea field
function updateLatLngTextarea() {
    var latlngTextarea = document.getElementById('latlng');
    latlngTextarea.value = polylinePoints.map(point => `${point[0]}, ${point[1]}`).join('\n');
}

// Fetch data provinsi for dropdowns
function fetchDataProvinsi(url, token) {
    axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => {
            // console.log(response.data)
            fillDropdownProvinsi(response.data);
        })
        .catch(error => console.error('Error fetching data:', error));
}

// Fill dropdowns with data
function fillDropdownProvinsi(data) {
    const provinsiDropdown = document.getElementById('provinsi');
    const kabupatenDropdown = document.getElementById('kabupaten');
    const kecamatanDropdown = document.getElementById('kecamatan');
    const desaDropdown = document.getElementById('desa');

    // Clear all dropdowns
    provinsiDropdown.innerHTML = '<option value="">Pilih</option>';
    kabupatenDropdown.innerHTML = '<option value="">Pilih</option>';
    kecamatanDropdown.innerHTML = '<option value="">Pilih</option>';
    desaDropdown.innerHTML = '<option value="">Pilih</option>';

    // Fill provinsi dropdown
    data.provinsi.forEach(provinsi => {
        const option = document.createElement('option');
        option.value = provinsi.id;
        option.textContent = provinsi.provinsi;
        provinsiDropdown.appendChild(option);
    });

    // Event listener for provinsi dropdown
    provinsiDropdown.addEventListener('change', function() {
        const selectedProvinsiId = this.value;
        if (selectedProvinsiId) {
            const selectedProvinsi = data.kabupaten.filter(kabupaten => kabupaten.prov_id == selectedProvinsiId);
            console.log(selectedProvinsi)
            fillKabupatenDropdown(selectedProvinsi);
        } else {
            kabupatenDropdown.innerHTML = '<option value="">Pilih</option>';
            kecamatanDropdown.innerHTML = '<option value="">Pilih</option>';
            desaDropdown.innerHTML = '<option value="">Pilih</option>';
        }
    });
    // listener kabupaten dropdown
    kabupatenDropdown.addEventListener('change', function() {
        const selectedKabupatenId = this.value;
        if (selectedKabupatenId) {
            const selectedKabupaten = data.kecamatan.filter(kecamatan => kecamatan.kab_id == selectedKabupatenId);
            // console.log(selectedKabupaten)
            fillKecamatanDropdown(selectedKabupaten);
        } else {
            kecamatanDropdown.innerHTML = '<option value="">Pilih</option>';
            desaDropdown.innerHTML = '<option value="">Pilih</option>';
        }
    });
    // listener kecamatan dropdown
    kecamatanDropdown.addEventListener('change', function() {
        const selectedKecamatanId = this.value;
        if (selectedKecamatanId) {
            const selectedKecamatan = data.desa.filter(desa => desa.kec_id == selectedKecamatanId);
            // console.log(selectedKabupaten)
            fillDesaDropdown(selectedKecamatan);
        } else {
            desaDropdown.innerHTML = '<option value="">Pilih</option>';
        }
    });
}

// Fill kabupaten dropdown
function fillKabupatenDropdown(kabupatenData) {
    const kabupatenDropdown = document.getElementById('kabupaten');
    kabupatenDropdown.innerHTML = '<option value="">Pilih</option>';
    kabupatenData.forEach(kabupaten => {
        const option = document.createElement('option');
        option.value = kabupaten.id;
        option.textContent = kabupaten.kabupaten;
        kabupatenDropdown.appendChild(option);
    });
}
// Fill kecamatan data
function fillKecamatanDropdown(kecamatanData) {
    const kecamatanDropdown = document.getElementById('kecamatan');
    kecamatanDropdown.innerHTML = '<option value="">Pilih</option>';
    kecamatanData.forEach(kecamatan => {
        const option = document.createElement('option');
        option.value = kecamatan.id;
        option.textContent = kecamatan.kecamatan;
        kecamatanDropdown.appendChild(option);
    });
}
// fill desa data
function fillDesaDropdown(desaData) {
    const desaDropdown = document.getElementById('desa');
    desaDropdown.innerHTML = '<option value="">Pilih</option>';
    desaData.forEach(desa => {
        const option = document.createElement('option');
        option.value = desa.id;
        option.textContent = desa.desa;
        desaDropdown.appendChild(option);
    });
}
// Fetch data eksisting for dropdowns
function fetchDataEksisting(url, token) {
    axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => {
            // console.log(response.data)
            const data = response.data
            const jenisPerkerasanDropdown = document.getElementById('jenisPerkerasan')
            jenisPerkerasanDropdown.innerHTML = '<option value="">Pilih</option>'
            data.eksisting.forEach(eksisting => {
                const option = document.createElement('option')
                option.value = eksisting.id
                option.textContent = eksisting.eksisting
                jenisPerkerasanDropdown.appendChild(option)
            })
        })
        .catch(error => console.error('Error fetching data:', error));
}

function fetchDataKondisiJalan(url, token) {
    axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => {
            // console.log(response.data)
            const data = response.data
            const kondisiJalanDropdown = document.getElementById('kondisiJalan')
            kondisiJalanDropdown.innerHTML = '<option value="">Pilih</option>'
            data.eksisting.forEach(eksisting => {
                const option = document.createElement('option')
                option.value = eksisting.id
                option.textContent = eksisting.kondisi
                kondisiJalanDropdown.appendChild(option)
            })
        })
        .catch(error => console.error('Error fetching data:', error));
}

function fetchDataJenisJalan(url, token) {
    axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })
        .then(response => {
            // console.log(response.data)
            const data = response.data
            const jenisJalanDropdown = document.getElementById('jenisJalan')
            jenisJalanDropdown.innerHTML = '<option value="">Pilih</option>'
            data.eksisting.forEach(eksisting => {
                const option = document.createElement('option')
                option.value = eksisting.id
                option.textContent = eksisting.jenisjalan
                jenisJalanDropdown.appendChild(option)
            })
        })
        .catch(error => console.error('Error fetching data:', error));
}


// Example API endpoint (replace with your actual API endpoint)
const provinsiEndpoint = 'https://gisapis.manpits.xyz/api/mregion';
const eksistingEndpoint = 'https://gisapis.manpits.xyz/api/meksisting'
const jenisJalanEndpoint = 'https://gisapis.manpits.xyz/api/mjenisjalan'
const kondisiJalanEndpoint = 'https://gisapis.manpits.xyz/api/mkondisi'


// Fetch data on page load
fetchDataProvinsi(provinsiEndpoint , jwt_token);
fetchDataEksisting(eksistingEndpoint , jwt_token);
fetchDataJenisJalan(jenisJalanEndpoint , jwt_token);
fetchDataKondisiJalan(kondisiJalanEndpoint , jwt_token);

// Handle form submission
document.getElementById('ruasJalanForm').addEventListener('submit', function(e) {
    e.preventDefault();

    let formData = new FormData(e.target);

    let data = {};
    formData.forEach((value, key) => {
        data[key] = value;
    });

    delete data['provinsi']
    delete data['kabupaten']
    delete data['kecamatan']
    delete data['latlng']
    // Encode polyline
    let encodedPolyline = polylinePoints.length > 0 ? polyline.encode(polylinePoints) : '';
    console.log(encodedPolyline)

    // Add encoded polyline to data
    data['paths'] = encodedPolyline;
    // add panjang to data
    let panjang = calculateTotalDistance(polylinePoints)
    data['panjang'] = panjang

    const postUrl = 'https://gisapis.manpits.xyz/api/ruasjalan'
    axios.post(postUrl, data, {
        headers: {
            Authorization: `Bearer ${jwt_token}`
        }
    })
    .then(response => {
        console.log(response.data)
        // alert()
        alert('Data Ruas Jalan berhasil ditambahkan!');
        window.location.href = '/home.html'
    })
    .catch(error => {
        alert("Error Submit Data there is a problem!")
        console.log(error)
    })
    console.log('Form Data Submitted:', data);
});

    
        
    
