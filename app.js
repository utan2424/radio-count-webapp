let barChart = null;
let pieChart = null;
let currentView = 'table';

function initializeApp() {
    renderTable();
    calculateStats();
    setupEventListeners();
}

function renderTable() {
    const tableBody = document.getElementById('tableBody');
    tableBody.innerHTML = '';

    // Group data by region group
    const groups = {
        'ภ.ป.1': [],
        'ภ.ป.2': [],
        'ภ.ป.3': [],
        'other': []
    };

    radioData.forEach(item => {
        if (item.region.includes('ภ.ป.1')) groups['ภ.ป.1'].push(item);
        else if (item.region.includes('ภ.ป.2')) groups['ภ.ป.2'].push(item);
        else if (item.region.includes('ภ.ป.3')) groups['ภ.ป.3'].push(item);
        else groups['other'].push(item);
    });

    // Render grouped data
    Object.entries(groups).forEach(([groupName, items]) => {
        if (items.length === 0) return;

        // Group header
        let groupTotal = { fixed: 0, handheld: 0, mobileRadio: 0, repeater: 0 };
        items.forEach(item => {
            groupTotal.fixed += item.fixed;
            groupTotal.handheld += item.handheld;
            groupTotal.mobileRadio += item.mobileRadio;
            groupTotal.repeater += item.repeater;
        });

        const headerRow = document.createElement('tr');
        headerRow.className = 'region-header';
        headerRow.innerHTML = `
            <td>${groupName}</td>
            <td>${groupTotal.fixed}</td>
            <td>${groupTotal.handheld}</td>
            <td>${groupTotal.mobileRadio}</td>
            <td>${groupTotal.repeater}</td>
            <td><strong>${groupTotal.fixed + groupTotal.handheld + groupTotal.mobileRadio + groupTotal.repeater}</strong></td>
        `;
        tableBody.appendChild(headerRow);

        // Individual items
        items.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td style="padding-left: 30px;">${item.region}</td>
                <td>${item.fixed}</td>
                <td>${item.handheld}</td>
                <td>${item.mobileRadio}</td>
                <td>${item.repeater}</td>
                <td><strong>${item.total}</strong></td>
            `;
            tableBody.appendChild(row);
        });
    });

    // Grand total
    const grandTotal = radioData.reduce((sum, item) => sum + item.total, 0);
    const grandTotalFixed = radioData.reduce((sum, item) => sum + item.fixed, 0);
    const grandTotalHandheld = radioData.reduce((sum, item) => sum + item.handheld, 0);
    const grandTotalMobile = radioData.reduce((sum, item) => sum + item.mobileRadio, 0);
    const grandTotalRepeater = radioData.reduce((sum, item) => sum + item.repeater, 0);

    const totalRow = document.createElement('tr');
    totalRow.className = 'total';
    totalRow.innerHTML = `
        <td><strong>Grand Total</strong></td>
        <td><strong>${grandTotalFixed}</strong></td>
        <td><strong>${grandTotalHandheld}</strong></td>
        <td><strong>${grandTotalMobile}</strong></td>
        <td><strong>${grandTotalRepeater}</strong></td>
        <td><strong>${grandTotal}</strong></td>
    `;
    tableBody.appendChild(totalRow);
}

function renderCharts() {
    renderBarChart();
    renderPieChart();
}

function renderBarChart() {
    const ctx = document.getElementById('barChart').getContext('2d');
    
    if (barChart) barChart.destroy();

    const labels = regionalData.map(r => r.name);
    const fixedData = regionalData.map(r => r.fixed);
    const handheldData = regionalData.map(r => r.handheld);
    const mobileData = regionalData.map(r => r.mobileRadio);
    const repeaterData = regionalData.map(r => r.repeater);

    barChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Fixed',
                    data: fixedData,
                    backgroundColor: '#667eea',
                    borderColor: '#667eea',
                    borderWidth: 1
                },
                {
                    label: 'Handheld',
                    data: handheldData,
                    backgroundColor: '#764ba2',
                    borderColor: '#764ba2',
                    borderWidth: 1
                },
                {
                    label: 'Mobile radio',
                    data: mobileData,
                    backgroundColor: '#f093fb',
                    borderColor: '#f093fb',
                    borderWidth: 1
                },
                {
                    label: 'Repeater',
                    data: repeaterData,
                    backgroundColor: '#4facfe',
                    borderColor: '#4facfe',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { size: 12 }
                    }
                },
                title: {
                    display: true,
                    text: 'Radio Type Count by Region',
                    font: { size: 16 }
                }
            },
            scales: {
                x: {
                    stacked: false
                },
                y: {
                    stacked: false,
                    beginAtZero: true
                }
            }
        }
    });
}

function renderPieChart() {
    const ctx = document.getElementById('pieChart').getContext('2d');
    
    if (pieChart) pieChart.destroy();

    const typeNames = ['Fixed', 'Handheld', 'Mobile radio', 'Repeater'];
    const typeData = [
        radioData.reduce((sum, item) => sum + item.fixed, 0),
        radioData.reduce((sum, item) => sum + item.handheld, 0),
        radioData.reduce((sum, item) => sum + item.mobileRadio, 0),
        radioData.reduce((sum, item) => sum + item.repeater, 0)
    ];

    pieChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: typeNames,
            datasets: [{
                data: typeData,
                backgroundColor: [
                    '#667eea',
                    '#764ba2',
                    '#f093fb',
                    '#4facfe'
                ],
                borderColor: white,
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { size: 12 }
                    }
                },
                title: {
                    display: true,
                    text: 'Total Radio Type Distribution',
                    font: { size: 16 }
                }
            }
        }
    });
}

function calculateStats() {
    const grandTotal = radioData.reduce((sum, item) => sum + item.total, 0);
    document.getElementById('totalCount').textContent = grandTotal.toLocaleString();

    // Find max type
    const typeNames = ['Fixed', 'Handheld', 'Mobile radio', 'Repeater'];
    const typeCounts = [
        radioData.reduce((sum, item) => sum + item.fixed, 0),
        radioData.reduce((sum, item) => sum + item.handheld, 0),
        radioData.reduce((sum, item) => sum + item.mobileRadio, 0),
        radioData.reduce((sum, item) => sum + item.repeater, 0)
    ];
    const maxTypeIndex = typeCounts.indexOf(Math.max(...typeCounts));
    document.getElementById('maxType').textContent = typeNames[maxTypeIndex];

    // Find max region
    const maxRegion = radioData.reduce((prev, current) => 
        prev.total > current.total ? prev : current
    );
    document.getElementById('maxRegion').textContent = maxRegion.region;
}

function setupEventListeners() {
    document.getElementById('toggleView').addEventListener('click', () => {
        const tableView = document.getElementById('tableView');
        const chartView = document.getElementById('chartView');

        if (currentView === 'table') {
            tableView.classList.remove('active');
            chartView.classList.add('active');
            currentView = 'chart';
            renderCharts();
        } else {
            chartView.classList.remove('active');
            tableView.classList.add('active');
            currentView = 'table';
        }
    });

    document.getElementById('exportBtn').addEventListener('click', exportToCSV);
}

function exportToCSV() {
    let csv = 'ภูมิภาค,Fixed,Handheld,Mobile radio,Repeater,รวมทั้งสิ้น\n';
    
    radioData.forEach(item => {
        csv += `${item.region},${item.fixed},${item.handheld},${item.mobileRadio},${item.repeater},${item.total}\n`;
    });

    const grandTotal = radioData.reduce((sum, item) => sum + item.total, 0);
    const grandTotalFixed = radioData.reduce((sum, item) => sum + item.fixed, 0);
    const grandTotalHandheld = radioData.reduce((sum, item) => sum + item.handheld, 0);
    const grandTotalMobile = radioData.reduce((sum, item) => sum + item.mobileRadio, 0);
    const grandTotalRepeater = radioData.reduce((sum, item) => sum + item.repeater, 0);
    
    csv += `Grand Total,${grandTotalFixed},${grandTotalHandheld},${grandTotalMobile},${grandTotalRepeater},${grandTotal}\n`;

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'radio-count-data.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', initializeApp);