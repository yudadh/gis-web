const token =  localStorage.getItem("token")
console.log(token)
if (!token) {
    // Redirect to login page if not authenticated
    window.location.href = 'login.html';
}

document.addEventListener('DOMContentLoaded', async () => {
    // Example: Get the user's name from localStorage or an API
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

    const backButton = document.getElementById('back-btn')
    backButton.addEventListener('click', function() {
        window.location.href = '/home.html'
    })

    const addButton = document.getElementById('add-button')
    addButton.addEventListener('click', function(e){
        window.location.href = '/add.html?origin=detail'
    })
    const dataMaster = await fetchDataMaster()
    const dataJalan = await fetchDataPolyline();
    const dataEksisting = await fetchDataEksisting()
    const dataKondisiJalan = await fetchDataKondisiJalan()
    const dataJenisJalan = await fetchDataJenisJalan()

    showDataTable(dataMaster, dataJalan, dataEksisting, dataKondisiJalan, dataJenisJalan); // Load all data initially
    document.getElementById('search-btn').addEventListener('click', function(event) {
        const query = document.getElementById('input-search').value.toLowerCase()
        filterData(query, dataMaster, dataJalan, dataEksisting, dataKondisiJalan, dataJenisJalan); // Filter data as per query
    });
})

let itemToDelete = null
let currentPage = 1;
const rowsPerPage = 10;
function showDataTable(dataMaster, dataJalan, dataEksisting, dataKondisiJalan, dataJenisJalan, query='') {
    try {
            const tableBody = document.querySelector("#hospital-table tbody");
            tableBody.innerHTML = ''; // Clear existing table data
            console.log(dataJalan)
            if (!dataJalan || dataJalan.ruasJalan) {
                console.error("dataJalan or dataJalan.ruasJalan is undefined");
                return;
            }
            const filteredData = dataJalan.ruasjalan.filter(ruasJalan => {
                const desa = dataMaster.desa.find(desa => desa.id === ruasJalan.desa_id)
                const kecamatan = dataMaster.kecamatan.find(kec => kec.id === desa.kec_id)
                const namaDesa = desa ? desa.desa : ""
                const namaKecamatan = kecamatan ? kecamatan.kecamatan : ""
                const perkerasan = dataEksisting.eksisting.find(eks => eks.id === ruasJalan.eksisting_id)
                const kondisi = dataKondisiJalan.eksisting.find(kond => kond.id === ruasJalan.kondisi_id)
                const jenis = dataJenisJalan.eksisting.find(jen => jen.id === ruasJalan.jenisjalan_id)
                return (
                    ruasJalan.nama_ruas.toLowerCase().includes(query.toLowerCase()) ||
                    ruasJalan.kode_ruas.toLowerCase().includes(query.toLowerCase()) ||
                    namaDesa.toLowerCase().includes(query.toLowerCase()) ||
                    namaKecamatan.toLowerCase().includes(query.toLowerCase()) ||
                    ruasJalan.panjang.toString().includes(query) ||
                    ruasJalan.lebar.toString().includes(query) ||
                    perkerasan.eksisting.toLowerCase().includes(query.toLowerCase()) ||
                    kondisi.kondisi.toLowerCase().includes(query.toLowerCase()) ||
                    jenis.jenisjalan.toLowerCase().includes(query.toLowerCase()) 
                ) 
            })
            const totalPages = Math.ceil(filteredData.length / rowsPerPage);
            displayPage(filteredData, currentPage, rowsPerPage, tableBody, dataEksisting, dataKondisiJalan, dataJenisJalan, dataMaster);

            setupPaginationControls(totalPages, filteredData, tableBody, dataEksisting, dataKondisiJalan, dataJenisJalan, dataMaster);

    } catch (error) {
        console.error("Error showing data table:", error);
    }
}

function displayPage(filteredData, page, rowsPerPage, tableBody, dataEksisting, dataKondisiJalan, dataJenisJalan, dataMaster) {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedData = filteredData.slice(start, end);

    paginatedData.forEach((ruasJalan, index) => {
        const eksisting = dataEksisting.eksisting.find(eksisting => ruasJalan.eksisting_id == eksisting.id);
        const kondisiJalan = dataKondisiJalan.eksisting.find(kondisi => ruasJalan.kondisi_id == kondisi.id);
        const jenisJalan = dataJenisJalan.eksisting.find(jenisjalan => ruasJalan.jenisjalan_id == jenisjalan.id);
        const desa = dataMaster.desa.find(desa => desa.id == ruasJalan.desa_id);
        const kecamatan = dataMaster.kecamatan.find(kec => kec.id == desa.kec_id);

        const row = document.createElement("tr");
        row.appendChild(createCell(start + index + 1)); // Row number
        row.appendChild(createCell(ruasJalan.nama_ruas));
        row.appendChild(createCell(ruasJalan.kode_ruas));
        row.appendChild(createCell(desa.desa));
        row.appendChild(createCell(kecamatan.kecamatan));
        row.appendChild(createCell(ruasJalan.panjang));
        row.appendChild(createCell(ruasJalan.lebar));
        row.appendChild(createCell(eksisting.eksisting));
        row.appendChild(createCell(kondisiJalan.kondisi));
        row.appendChild(createCell(jenisJalan.jenisjalan));

        const actionCell = document.createElement("td");
        const editButton = document.createElement("button");
        editButton.textContent = "Edit";
        editButton.className = "edit-button";
        editButton.onclick = () => {
            const editUrl = `/edit.html?id=${ruasJalan.id}&origin=detail`;
            window.location.href = editUrl;
        };

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.className = "delete-button";
        deleteButton.onclick = () => {
            itemToDelete = ruasJalan.id;
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
        };

        actionCell.appendChild(editButton);
        actionCell.appendChild(deleteButton);
        row.appendChild(actionCell);

        tableBody.appendChild(row);
    });
}

function setupPaginationControls(totalPages, filteredData, tableBody, dataEksisting, dataKondisiJalan, dataJenisJalan, dataMaster) {
    const paginationControls = document.getElementById('pagination-controls');
    const pageNumbers = document.getElementById('page-numbers');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const dataInfo = document.getElementById('data-info')

    pageNumbers.innerHTML = ''; // Clear existing page numbers

    for (let i = 1; i <= totalPages; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.classList.add('pagination-btn')
        pageBtn.textContent = i;
        if (i === currentPage) {
            pageBtn.classList.add('active');
        }
        pageBtn.addEventListener('click', () => {
            currentPage = i;
            updateTable(filteredData, tableBody, dataEksisting, dataKondisiJalan, dataJenisJalan, dataMaster);
        });
        pageNumbers.appendChild(pageBtn);
    }

    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            updateTable(filteredData, tableBody, dataEksisting, dataKondisiJalan, dataJenisJalan, dataMaster);
        }
    });

    nextBtn.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            updateTable(filteredData, tableBody, dataEksisting, dataKondisiJalan, dataJenisJalan, dataMaster);
        }
    });

    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
}

function updateTable(filteredData, tableBody, dataEksisting, dataKondisiJalan, dataJenisJalan, dataMaster) {
    tableBody.innerHTML = ''; // Clear existing table data
    displayPage(filteredData, currentPage, rowsPerPage, tableBody, dataEksisting, dataKondisiJalan, dataJenisJalan, dataMaster);
    setupPaginationControls(Math.ceil(filteredData.length / rowsPerPage), filteredData, tableBody, dataEksisting, dataKondisiJalan, dataJenisJalan, dataMaster);
}

function filterData(query, dataMaster, dataJalan, dataEksisting, dataKondisiJalan, dataJenisJalan) {
    showDataTable(dataMaster, dataJalan, dataEksisting, dataKondisiJalan, dataJenisJalan, query);
}

function createCell(text) {
    const cell = document.createElement("td");
    cell.textContent = text;
    return cell;
}

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



