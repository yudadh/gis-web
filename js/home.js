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
            // console.log(response.data)
            const data = response.data
            showData(data)
            showDataTable(data)
        })
        .catch(error => {
            console.log(error)
        })
    }

    async function fetchDataEksisting(){
        const urlEksisting = "https://gisapis.manpits.xyz/api/meksisting"
        const response = await axios.get(urlEksisting, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    }
    
    async function fetchDataKondisiJalan() {
        const urlKondisiJalan = "https://gisapis.manpits.xyz/api/mkondisi"
        const response = await axios.get(urlKondisiJalan, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    }
    async function fetchDataJenisJalan() {
        const urlJenisJalan = "https://gisapis.manpits.xyz/api/mjenisjalan"
        const response = await axios.get(urlJenisJalan, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        return response.data
    }


    async function showData(dataJalan){
        const dataEksisting = await fetchDataEksisting()
        const dataKondisiJalan = await fetchDataKondisiJalan()
        const dataJenisJalan = await fetchDataJenisJalan()
        dataJalan.ruasjalan.forEach(ruasJalan => {
            const eksisting = dataEksisting.eksisting.find(eksisting => ruasJalan.eksisting_id == eksisting.id)
            const kondisiJalan = dataKondisiJalan.eksisting.find(kondisi => ruasJalan.kondisi_id == kondisi.id)
            const jenisJalan =  dataJenisJalan.eksisting.find(jenisjalan => ruasJalan.jenisjalan_id == jenisjalan.id)
            const polylinePoints = polyline.decode(ruasJalan.paths)
            var _polylines = L.polyline(polylinePoints, {color: 'blue', weight: 5}).addTo(map)
            // polylinePoints.forEach(latlng => {
            //     L.marker([latlng[0], latlng[1]]).addTo(map)
            //     .bindPopup(`Lat: ${latlng[0]}, Lng: ${latlng[1]}`).openPopup();
            // })
            _polylines.on('click', function (e) {
                var popup = L.popup()
                .setLatLng(e.latlng)
                .setContent(`
                <strong>Nama Ruas:</strong> ${ruasJalan.nama_ruas}<br>
                <strong>Kode Ruas:</strong> ${ruasJalan.kode_ruas}<br>
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
                    window.location.href = `/edit.html?id=${ruasJalan.id}`
                })
                document.getElementById('popup-delete-btn').addEventListener('click', function(){
                    itemToDelete = ruasJalan.id
                    document.getElementById('confirmPopup').style.display = 'block';
                })
            });

        });
    }
    // <span><a href="/edit.html?id=${ruasJalan.id}">edit-data</a></span>
    
    fetchDataPolyline()
    
    const addButton = document.getElementById('add-button')
    addButton.addEventListener('click', function(e){
        window.location.href = '/add.html'
    })

    let itemToDelete = null
    async function showDataTable(dataJalan) {
        try {
            const dataEksisting = await fetchDataEksisting();
            const dataKondisiJalan = await fetchDataKondisiJalan();
            const dataJenisJalan = await fetchDataJenisJalan();
            const tableBody = document.querySelector("#hospital-table tbody");
            tableBody.innerHTML = ''; // Clear existing table data
            
            if (!dataJalan || !dataJalan.ruasjalan) {
                console.error("dataJalan or dataJalan.ruasJalan is undefined");
                return;
            }
            console.log(dataJalan.ruasjalan)
            dataJalan.ruasjalan.forEach((ruasJalan, index) => {
                const eksisting = dataEksisting.eksisting.find(eksisting => ruasJalan.eksisting_id == eksisting.id)
                const kondisiJalan = dataKondisiJalan.eksisting.find(kondisi => ruasJalan.kondisi_id == kondisi.id)
                const jenisJalan =  dataJenisJalan.eksisting.find(jenisjalan => ruasJalan.jenisjalan_id == jenisjalan.id)
                console.log(jenisJalan)
                const row = document.createElement("tr");
                row.appendChild(createCell(index + 1)); // Row number
                row.appendChild(createCell(ruasJalan.nama_ruas));
                row.appendChild(createCell(ruasJalan.kode_ruas));
                row.appendChild(createCell(ruasJalan.panjang));
                row.appendChild(createCell(ruasJalan.lebar));
                row.appendChild(createCell(eksisting.eksisting));
                row.appendChild(createCell(kondisiJalan.kondisi));
                row.appendChild(createCell(jenisJalan.jenisjalan));
                
                const actionCell = document.createElement("td");
                const editButton = document.createElement("button");
                editButton.textContent = "Edit";
                editButton.className = "edit-button"
                editButton.onclick = () => {
                    const editUrl = `/edit.html?id=${ruasJalan.id}`; 
                    window.location.href = editUrl;
                };
                
                const deleteButton = document.createElement("button");
                deleteButton.textContent = "Delete";
                deleteButton.className = "delete-button"
                deleteButton.onclick = () => {
                    itemToDelete = ruasJalan.id
                    document.getElementById('confirmPopup').style.display = 'block';
                };

                actionCell.appendChild(editButton);
                actionCell.appendChild(deleteButton);
                row.appendChild(actionCell);
            
                tableBody.appendChild(row);
                // console.log('Added row:', row.innerHTML);
                // console.log('Final Table Body:', tableBody.innerHTML);
            
            });
        } catch (error) {
            console.error("Error showing data table:", error);
        }
    }

    function createCell(text) {
        const cell = document.createElement("td");
        cell.textContent = text;
        return cell;
    }

    document.getElementById('confirmNo').addEventListener('click', function() {
        document.getElementById('confirmPopup').style.display = 'none';
    });

    // Tutup modal saat pengguna mengklik di luar modal
    window.onclick = function(event) {
        if (event.target == document.getElementById('confirmPopup')) {
            document.getElementById('confirmPopup').style.display = 'none';
        }
    }

    document.getElementById('confirmYes').addEventListener("click", function() {
        const urlDel = "https://gisapis.manpits.xyz/api/ruasjalan/" + itemToDelete
        axios.delete(urlDel, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            console.log(response)
            itemToDelete = null
            alert("Data Berhasil dihapus!")
            window.location.reload()
        })
        .catch(error => {
            console.log(error)
        })
    })
    

    // await showDataTable(sampleDataJalan)
})