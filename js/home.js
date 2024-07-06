const token =  localStorage.getItem("token")
console.log(token)
if (!token) {
    // redirect to login page 
    window.location.href = 'login.html';
}
let itemToDelete = null
document.addEventListener('DOMContentLoaded', async () => {
    const url = "https://gisapis.manpits.xyz/api/user"
    axios.get(url, {
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
    .then(response => {
        const userName = response.data.data.user.name; 
        document.querySelector('.user-name').textContent = userName;
    })
    .catch(error => {
        console.log(error)
    })

    document.getElementById('logout').addEventListener('click', () => {
        const logoutUrl = "https://gisapis.manpits.xyz/api/logout"
        Swal.fire({
            title: "Logout",
            text: 'Apakah Anda Yakin Ingin Logout?',
            icon: 'question',
            confirmButtonText: 'Ya',
            showCancelButton: true,
            cancelButtonText: 'Tidak',
            confirmButtonColor: '#4CAF50',
            cancelButtonColor: '#f44336'
        }).then((result) => {
            if(result.isConfirmed) {
                axios.post(logoutUrl, {}, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                .then(response => {
                    console.log(response)
                    Swal.fire({
                        title: "Logout Berhasil!",
                        icon: "success",
                        confirmButtonText: "OK"
                    }).then(() => {
                        window.location.href = "/login.html"
                    });
                })
                .catch(error => {
                    console.log(error)
                    Swal.fire({
                        title: "Logout Gagal!",
                        icon: "error",
                        confirmButtonText: "OK"
                    }).then(() => {
                        window.location.reload()
                    });
                })
            }
        })
        
    })
    const menu = document.getElementById('menu');
    const dropdownContent = menu.querySelector('.dropdown-content');

    menu.addEventListener('click', function() {
        dropdownContent.classList.toggle('show');
    });

    window.addEventListener('click', function(e) {
        if (!e.target.matches('.menu-title')) {
            if (dropdownContent.classList.contains('show')) {
                dropdownContent.classList.remove('show');
            }
        }
    })

    let map = L.map("map").setView([-8.4095188, 115.188919], 11);
    // menambahkan tilelayer
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution:
      '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const dataMaster = await fetchDataMaster()
    const dataJalan = await fetchDataPolyline()
    const dataEksisting = await fetchDataEksisting()
    const dataKondisiJalan = await fetchDataKondisiJalan()
    const dataJenisJalan = await fetchDataJenisJalan()
    
    
    const ruasKabupaten = loadRuas(dataJalan, "kabupaten")
    const ruasProvinsi = loadRuas(dataJalan, "provinsi")
    const ruasDesa = loadRuas(dataJalan, "desa")
    let stopShowData = false
    let existingPolylines = []
   
    function clearPolylines() {
        existingPolylines.forEach(polyline => {
            map.removeLayer(polyline);
        });
        existingPolylines = [];
    }

    const jenisJalanColors = {
        'Rusak': 'red',
        'Sedang': 'blue',
        'Baik': 'green',
    };

    const checkboxStates = {
        kabupaten: false,
        provinsi: false,
        desa: false
    };

    function anyCheckboxChecked() {
        return checkboxStates.kabupaten || checkboxStates.provinsi || checkboxStates.desa;
    }

    function updateMap() {
        clearPolylines();
        let combinedData = [];
    
        if (checkboxStates.kabupaten) {
            combinedData = combinedData.concat(ruasKabupaten);
        }
        if (checkboxStates.provinsi) {
            combinedData = combinedData.concat(ruasProvinsi);
        }
        if (checkboxStates.desa) {
            combinedData = combinedData.concat(ruasDesa);
        }
        if (anyCheckboxChecked()){
            showData(combinedData);
        }else {
            showData(dataJalan.ruasjalan)
        }
    }

    document.getElementById('kabupaten').addEventListener('change', function() {
        checkboxStates.kabupaten = this.checked;
        updateMap();
    });

    document.getElementById('provinsi').addEventListener('change', function() {
        checkboxStates.provinsi = this.checked;
        updateMap();
    });

    document.getElementById('desa').addEventListener('change', function() {
        checkboxStates.desa = this.checked;
        updateMap();
    });

    function showData(data){
        clearPolylines() 
        try {
            data.forEach(ruasJalan => {
                const eksisting = dataEksisting.eksisting.find(eksisting => ruasJalan.eksisting_id == eksisting.id)
                const kondisiJalan = dataKondisiJalan.eksisting.find(kondisi => ruasJalan.kondisi_id == kondisi.id)
                const jenisJalan =  dataJenisJalan.eksisting.find(jenisjalan => ruasJalan.jenisjalan_id == jenisjalan.id)
                const desa = dataMaster.desa.find(desa => desa.id == ruasJalan.desa_id)
                const kecamatan = dataMaster.kecamatan.find(kec => kec.id == desa.kec_id)
                const polylinePoints = polyline.decode(ruasJalan.paths)
                // console.log(polylinePoints)
                const polylineColor = jenisJalanColors[kondisiJalan.kondisi] || 'black'
                var _polylines = L.polyline(polylinePoints, {color: polylineColor, weight: 5}).addTo(map)
                _polylines.bindTooltip(ruasJalan.kode_ruas).openTooltip()
                existingPolylines.push(_polylines)
                if(_polylines){
                    _polylines.on('click', function (e) {
                        var popup = L.popup()
                        .setLatLng(e.latlng)
                        .setContent(`
                        <strong>Nama Ruas:</strong> ${ruasJalan.nama_ruas}<br>
                        <strong>Kode Ruas:</strong> ${ruasJalan.kode_ruas}<br>
                        <strong>Kecamatan:</strong> ${kecamatan.kecamatan}<br>
                        <strong>Desa:</strong> ${desa.desa}<br>
                        <strong>Panjang:</strong> ${ruasJalan.panjang} m<br>
                        <strong>Lebar:</strong> ${ruasJalan.lebar} m<br>
                        <strong>Jenis Perkerasan:</strong> ${eksisting.eksisting}<br>
                        <strong>Kondisi Jalan:</strong> ${kondisiJalan.kondisi}<br>
                        <strong>Jenis Jalan:</strong> ${jenisJalan.jenisjalan}<br>
                        <strong>Keterangan:</strong> ${ruasJalan.keterangan}<br>
                        <div class="popup-btn">
                            <button id="popup-edit-btn" class="edit-button">Edit</button>
                            <button id="popup-delete-btn" class="delete-button">Delete</button>
                        </div>
                        `)
                        .openOn(map)
                        document.getElementById('popup-edit-btn').addEventListener('click', function(){
                            window.location.href = `/edit.html?id=${ruasJalan.id}&origin=home`
                        })
                        document.getElementById('popup-delete-btn').addEventListener('click', function(){
                            itemToDelete = ruasJalan.id
                            Swal.fire({
                                title: "Hapus Data",
                                text: 'Apakah Anda Yakin Ingin Menghapus Data?',
                                icon: 'question',
                                confirmButtonText: 'Ya',
                                showCancelButton: true,
                                cancelButtonText: 'Tidak',
                                confirmButtonColor: '#4CAF50',
                                cancelButtonColor: '#f44336'
                            }).then((result) => {
                                if(result.isConfirmed){
                                    const urlDel = "https://gisapis.manpits.xyz/api/ruasjalan/" + itemToDelete
                                    axios.delete(urlDel, {
                                        headers: {
                                            Authorization: `Bearer ${token}`
                                        }
                                    })
                                    .then(response => {
                                        console.log(response)
                                        itemToDelete = null
                                        Swal.fire({
                                            title: "Data Ruas Jalan berhasil dihapus!",
                                            icon: "success",
                                            confirmButtonText: "OK"
                                        }).then(() => {
                                            window.location.reload()
                                        });
                                    })
                                    .catch(error => {
                                        console.log(error)
                                    })
                                }
                            });
                        })
                    });
                }
            });
        } catch (error) {
            console.log(error)
        }
        
    }
    updateMap()
})

async function fetchDataPolyline(){
    const getDataUrl = 'https://gisapis.manpits.xyz/api/ruasjalan'
    try {
        const response = await axios.get(getDataUrl, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data

    } catch (error) {
        console.log(error)
    }
}

async function fetchDataEksisting(){
    const urlEksisting = "https://gisapis.manpits.xyz/api/meksisting"
    try {
        const response = await axios.get(urlEksisting, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    } catch (error) {
        console.log(error)
    }
}

async function fetchDataKondisiJalan() {
    const urlKondisiJalan = "https://gisapis.manpits.xyz/api/mkondisi"
    try {
        const response = await axios.get(urlKondisiJalan, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    } catch (error) {
        console.log(error)
    }
}
async function fetchDataJenisJalan() {
    const urlJenisJalan = "https://gisapis.manpits.xyz/api/mjenisjalan"
    try {    
        const response = await axios.get(urlJenisJalan, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    } catch (error) {
        console.log(error)
    }
}

async function fetchDataMaster() {
    const urlMaster = "https://gisapis.manpits.xyz/api/mregion"
    try {
        const response = await axios.get(urlMaster, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    } catch (error) {
        console.log(error)
    }
}

function loadRuas(dataJalan, jenis) {
    if (jenis === "kabupaten"){
        const kab = dataJalan.ruasjalan.filter(ruasJalan => ruasJalan.jenisjalan_id === 2)
        return kab
    } else if (jenis === "provinsi"){
        const prov = dataJalan.ruasjalan.filter(ruasJalan => ruasJalan.jenisjalan_id === 3)
        return prov
    } else if (jenis === "desa"){
        const des = dataJalan.ruasjalan.filter(ruasJalan => ruasJalan.jenisjalan_id === 1)
        return des
    } else {
        return "data tidak ditemukan (masukkan jenis)"
    }
}
