jwt_token = localStorage.getItem("token")

if (!jwt_token) {
    // Redirect to login page if not authenticated
    window.location.href = '/login.html';
}
document.addEventListener('DOMContentLoaded', async () => {

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

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }
    const originPage = getQueryParam('origin');

    document.getElementById('back-btn').addEventListener('click', () => {
        if(originPage === "home") {
            window.location.href = '/home.html'
        }else if(originPage === "detail") {
            window.location.href = '/detail.html'
        }
    })

    async function fetchDataPolyline(){
        const getDataUrl = 'https://gisapis.manpits.xyz/api/ruasjalan'
        try {
            const response = await axios.get(getDataUrl, {
                headers: {
                    Authorization: `Bearer ${jwt_token}`
                }
            })
            return response.data
    
        } catch (error) {
            console.log(error)
        }
    }

    // document.getElementById('logout').addEventListener('click', () => {
    //     const logoutUrl = "https://gisapis.manpits.xyz/api/logout"
    //     axios.post(logoutUrl, {}, {
    //         headers: {
    //             Authorization: `Bearer ${jwt_token}`
    //         }
    //     })
    //     .then(response => {
    //         alert(response.data.meta.message)
    //         window.location.href = "/login.html"
    //     })
    //     .catch(error => {
    //         console.log(error)
    //     })
    // })
    let polylinePoints = []
    let markers = []
    let map = L.map("map").setView([-8.4095188, 115.188919], 11);
    // menambahkan tilelayer
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution:
        '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);
    
    const dataJalanAll = await fetchDataPolyline()
    const dataJalan = await fetchDataJalan()
    const dataJalanFix = dataJalanAll.ruasjalan.filter(jalan => jalan.id !== dataJalan.id)
    dataJalanFix.forEach(ruasJalan => {
        const polylinePoints_ = polyline.decode(ruasJalan.paths)
        var polylines_ = L.polyline(polylinePoints_, {color: "red", weight: 5}).addTo(map)
        polylines_.bindTooltip(ruasJalan.kode_ruas).openTooltip()
    })
    var _polyline = L.polyline(polylinePoints, {color: 'blue', weight: 5}).addTo(map)
    
    async function fetchDataWilayah() {
        const url = "https://gisapis.manpits.xyz/api/mregion"
        const response = await axios.get(url, {
            headers: {
                Authorization: `Bearer ${jwt_token}`
            }
        })
        return response.data
    }

    async function fetchDataJalan() {
        try {
            const queryParam = new URLSearchParams(window.location.search)
            const id = queryParam.get('id')
            const url = "https://gisapis.manpits.xyz/api/ruasjalan/"+ id
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${jwt_token}`
                }
            })
            return response.data.ruasjalan
        } catch (error) {
            console.log(error)
        }
    }

    async function fetchDataEksisting() {
        const urlEksisting = "https://gisapis.manpits.xyz/api/meksisting"
        const response = await axios.get(urlEksisting, {
            headers: {
                Authorization: `Bearer ${jwt_token}`
            }
        })
        return response.data
    }

    async function fetchDataKondisi() {
        const urlKondisi = "https://gisapis.manpits.xyz/api/mkondisi"
        const response = await axios.get(urlKondisi, {
            headers: {
                Authorization: `Bearer ${jwt_token}`
            }
        })
        return response.data
    }

    async function fetchDataJenis() {
        const urlJenis = "https://gisapis.manpits.xyz/api/mjenisjalan"
        const response = await axios.get(urlJenis, {
            headers: {
                Authorization: `Bearer ${jwt_token}`
            }
        })
        return response.data
    }
    
    console.log(dataJalan)
    try {
        const dataWilayah = await fetchDataWilayah()
        const desa = dataWilayah.desa.find(desa => dataJalan.desa_id === desa.id)
        const kecamatan = dataWilayah.kecamatan.find(kecamatan => desa.kec_id === kecamatan.id)
        const  kabupaten = dataWilayah.kabupaten.find(kabupaten => kecamatan.kab_id === kabupaten.id)
        const provinsi = dataWilayah.provinsi.find(provinsi => kabupaten.prov_id === provinsi.id)
        // console.log(provinsi)
        const provinsiDropdown = document.getElementById('provinsi');
        const kabupatenDropdown = document.getElementById('kabupaten');
        const kecamatanDropdown = document.getElementById('kecamatan');
        const desaDropdown = document.getElementById('desa');
        // Isi dropdown Provinsi
        dataWilayah.provinsi.forEach(prov => {
            const option = document.createElement('option');
            option.value = prov.id;
            option.textContent = prov.provinsi;
            if (prov.id === provinsi.id) {
                option.selected = true;
            }
            provinsiDropdown.appendChild(option);
        });
         // Isi dropdown Kabupaten
        kabupatenDropdown.innerHTML = '';
        dataWilayah.kabupaten.forEach(kab => {
            const option = document.createElement('option');
            option.value = kab.id;
            option.textContent = kab.kabupaten;
            if (kab.id === kabupaten.id) {
                option.selected = true;
            }
            kabupatenDropdown.appendChild(option);
        });
        // Isi dropdown Kecamatan
        kecamatanDropdown.innerHTML = '';
        const kecamatanData = dataWilayah.kecamatan.filter(kec => kec.kab_id == kecamatan.kab_id)
        kecamatanData.forEach(kec => {
            const option = document.createElement('option');
            option.value = kec.id;
            option.textContent = kec.kecamatan;
            if(kec.id == kecamatan.id){
                option.selected = true
            }
            kecamatanDropdown.appendChild(option);
        });
        // Isi dropdown Desa
        desaDropdown.innerHTML = '';
        const desaData = dataWilayah.desa.filter(des => des.kec_id == desa.kec_id)
        desaData.forEach(des => {
            const option = document.createElement('option');
            option.value = des.id;
            option.textContent = des.desa;
            if (des.id == desa.id) {
                option.selected = true;
            }
            desaDropdown.appendChild(option);
        });
        const namaRuas = document.getElementById('namaRuas')
        const kodeRuas = document.getElementById('kodeRuas')
        const perkerasanDropdown = document.getElementById('jenisPerkerasan')
        const kondisiDropdown = document.getElementById('kondisiJalan')
        const jenisDropdown = document.getElementById('jenisJalan')
        const lebar = document.getElementById('lebar')
        const keterangan = document.getElementById('keterangan')
        const latlng = document.getElementById('latlng')
        
        namaRuas.value = dataJalan.nama_ruas
        kodeRuas.value = dataJalan.kode_ruas
        const dataEksisting = await fetchDataEksisting()
        dataEksisting.eksisting.forEach(eksis => {
            const option = document.createElement('option')
            option.value = eksis.id
            option.textContent = eksis.eksisting
            if(eksis.id == dataJalan.eksisting){
                option.selected = true
            }
            perkerasanDropdown.appendChild(option)
        })
        
        const dataKondisi = await fetchDataKondisi()
        dataKondisi.eksisting.forEach(kondisi => {
            const option = document.createElement('option')
            option.value = kondisi.id
            option.textContent = kondisi.kondisi
            if(kondisi.id == dataJalan.kondisi_id){
                option.selected = true
            }
            kondisiDropdown.appendChild(option)
        })
        
        const dataJenis = await fetchDataJenis()
        dataJenis.eksisting.forEach(jenis => {
            const option = document.createElement('option')
            option.value = jenis.id
            option.textContent = jenis.jenisjalan
            if(jenis.id == dataJalan.jenisjalan_id){
                option.selected = true
            }
            jenisDropdown.appendChild(option)
        })

        lebar.value = dataJalan.lebar
        keterangan.value = dataJalan.keterangan
        const decodedLatlng = polyline.decode(dataJalan.paths)
        // console.log(decodedLatlng)
        decodedLatlng.forEach(latlng => {
            polylinePoints.push([latlng[0], latlng[1]])
            markers.push([latlng[0], latlng[1]])
        })
        markers.forEach(latlng => {
           var marker = L.marker([latlng[0], latlng[1]], {draggable: true}).addTo(map)
            .bindPopup(`Lat: ${latlng[0]}, Lng: ${latlng[1]}`).openPopup();

            let initialLatLng
            marker.on('dragstart', function(e) {
                initialLatLng = e.target.getLatLng()
            })

            marker.on('dragend', function(e) {
                const newLatLng = e.target.getLatLng()
                const index = polylinePoints.findIndex(point => point[0] === initialLatLng.lat && point[1] === initialLatLng.lng)
                polylinePoints[index] = [newLatLng.lat, newLatLng.lng]
                _polyline.setLatLngs(polylinePoints)
                updateLatLngTextarea();
            })

            marker.on('contextmenu', function() {
                // Hapus marker dari peta
                map.removeLayer(marker);
        
                // Hapus latLng dari polylinePoints
                polylinePoints = polylinePoints.filter(point => point[0] !== latlng[0] || point[1] !== latlng[1]);
                _polyline.setLatLngs(polylinePoints);
        
                // Perbarui field textarea dengan koordinat polyline
                updateLatLngTextarea();
                
            });
            _polyline.setLatLngs(polylinePoints)
            map.fitBounds(_polyline.getBounds())
        })
        latlng.value = polylinePoints.map(point => `${point[0]}, ${point[1]}`).join('\n')
        
    } catch (error) {
        console.log(error)
    }
    
    
    
    
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

    function addMarker(lat, lng) {
        var marker = L.marker([lat, lng], {draggable: true}).addTo(map)
            .bindPopup(`Lat: ${lat}, Lng: ${lng}`).openPopup();
    
        polylinePoints.push([lat, lng]);
        _polyline.setLatLngs(polylinePoints);
        markers.push(marker);

        let initialLatLng
        marker.on('dragstart', function(e) {
            initialLatLng = e.target.getLatLng()
        })

        marker.on('dragend', function(e) {
            const newLatLng = e.target.getLatLng()
            const index = polylinePoints.findIndex(point => point[0] === initialLatLng.lat && point[1] === initialLatLng.lng)
            polylinePoints[index] = [newLatLng.lat, newLatLng.lng]
            _polyline.setLatLngs(polylinePoints)
            updateLatLngTextarea();
        })
    
        // Tambahkan event listener untuk klik kanan pada marker
        marker.on('contextmenu', function(e) {
            const currentLatLng = e.target.getLatLng();
            // Hapus marker dari peta
            map.removeLayer(marker);
    
            // Hapus latLng dari polylinePoints
            polylinePoints = polylinePoints.filter(point => point[0] !== currentLatLng.lat || point[1] !== currentLatLng.lng);
            _polyline.setLatLngs(polylinePoints);
    
            // Perbarui field textarea dengan koordinat polyline
            updateLatLngTextarea();
            
        });
    
        // Perbarui field textarea dengan koordinat polyline
        updateLatLngTextarea();
        
    }

    map.on('click', function(e) {
        var latlng = e.latlng
        addMarker(latlng.lat, latlng.lng)
    });
    // Function to update the LatLng textarea field
    function updateLatLngTextarea() {
        var latlngTextarea = document.getElementById('latlng');
        latlngTextarea.value = polylinePoints.map(point => `${point[0]}, ${point[1]}`).join('\n');
    }

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
        console.log(polylinePoints)
        let encodedPolyline = polylinePoints.length > 0 ? polyline.encode(polylinePoints) : '';
        console.log(encodedPolyline)
    
        // Add encoded polyline to data
        data['paths'] = encodedPolyline;
        // add panjang to data
        let panjang = calculateTotalDistance(polylinePoints)
        data['panjang'] = panjang
        
        Swal.fire({
            title: 'Update Data',
            text: 'Apakah Anda Yakin Ingin Update Data?',
            icon: 'question',
            confirmButtonText: 'Ya',
            showCancelButton: true,
            cancelButtonText: 'Tidak',
            confirmButtonColor: '#4CAF50',
            denyButtonColor: '#f44336'
        }).then((result) => {
            if(result.isConfirmed) {
                const postUrl = 'https://gisapis.manpits.xyz/api/ruasjalan/'+ dataJalan.id
                axios.put(postUrl, data, {
                    headers: {
                        Authorization: `Bearer ${jwt_token}`
                    }
                })
                .then(response => {
                    console.log(response.data)
                    Swal.fire({
                        title: "Data Ruas Jalan berhasil di edit!",
                        icon: "success",
                        confirmButtonText: "OK"
                    }).then(() => {
                        if(originPage === "home"){
                            window.location.href = "/home.html";
                        }else if(originPage === "detail"){
                            window.location.href = "/detail.html"
                        }
                    });
                })
                .catch(error => {
                    Swal.fire("Error Submit Data there is a problem!", "", "error")
                    console.log(error)
                })
            }
        })
        console.log('Form Data Submitted:', data);
    });

})