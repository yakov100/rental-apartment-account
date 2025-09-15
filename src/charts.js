// ניהול גרפים
import { months } from './utils.js';

let electricChart, waterChart, paymentChart;

export function updateCharts() {
    const familyFilterSelect = document.getElementById('familyFilter');
    const electricData = {};
    const waterData = {};
    const paymentData = {};
    const filteredRecords = familyFilterSelect.value ? window.records.filter(rec => rec.familyName === familyFilterSelect.value) : window.records;
    
    filteredRecords.forEach(record => {
        const date = new Date(record.readingDate);
        const monthYear = `${date.getFullYear()}-${date.getMonth()}`;
        if (record.billType === 'חשמל') {
            electricData[monthYear] = (electricData[monthYear] || 0) + record.usage;
        } else if (record.billType === 'מים') {
            waterData[monthYear] = (waterData[monthYear] || 0) + record.usage;
        }
        if (record.paid) {
            paymentData[monthYear] = (paymentData[monthYear] || 0) + record.payment;
        }
    });
    
    // Electric Chart
    if (electricChart) electricChart.destroy();
    const electricCanvas = document.getElementById('electricChart');
    if (electricCanvas) {
        electricChart = new Chart(electricCanvas, {
            type: 'bar',
            data: {
                labels: Object.keys(electricData).sort().map(key => {
                    const [year, month] = key.split('-');
                    return `${months[parseInt(month)]} ${year}`;
                }),
                datasets: [{
                    label: 'צריכה בקוט"ש',
                    data: Object.keys(electricData).sort().map(key => electricData[key].toFixed(2)),
                    backgroundColor: 'rgba(59, 130, 246, 0.6)',
                    borderColor: 'rgba(59, 130, 246, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    }
    
    // Water Chart
    if (waterChart) waterChart.destroy();
    const waterCanvas = document.getElementById('waterChart');
    if (waterCanvas) {
        waterChart = new Chart(waterCanvas, {
            type: 'bar',
            data: {
                labels: Object.keys(waterData).sort().map(key => {
                    const [year, month] = key.split('-');
                    return `${months[parseInt(month)]} ${year}`;
                }),
                datasets: [{
                    label: 'צריכה במ"ק',
                    data: Object.keys(waterData).sort().map(key => waterData[key].toFixed(2)),
                    backgroundColor: 'rgba(34, 197, 94, 0.6)',
                    borderColor: 'rgba(34, 197, 94, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    }
    
    // Payment Chart
    if (paymentChart) paymentChart.destroy();
    const paymentCanvas = document.getElementById('paymentChart');
    if (paymentCanvas) {
        paymentChart = new Chart(paymentCanvas, {
            type: 'bar',
            data: {
                labels: Object.keys(paymentData).sort().map(key => {
                    const [year, month] = key.split('-');
                    return `${months[parseInt(month)]} ${year}`;
                }),
                datasets: [{
                    label: 'סך תשלומים ששולמו',
                    data: Object.keys(paymentData).sort().map(key => paymentData[key].toFixed(2)),
                    backgroundColor: 'rgba(251, 191, 36, 0.6)',
                    borderColor: 'rgba(251, 191, 36, 1)',
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                scales: { y: { beginAtZero: true } }
            }
        });
    }
}

export function destroyCharts() {
    if (electricChart) {
        electricChart.destroy();
        electricChart = null;
    }
    if (waterChart) {
        waterChart.destroy();
        waterChart = null;
    }
    if (paymentChart) {
        paymentChart.destroy();
        paymentChart = null;
    }
}
