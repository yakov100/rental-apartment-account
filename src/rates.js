// ניהול תעריפים
let rates = {
    חשמל: 0.6,
    מים: 7,
    ארנונה: 50
};

export function getRates() {
    return rates;
}

export function setRates(newRates) {
    rates = { ...rates, ...newRates };
    localStorage.setItem('rates', JSON.stringify(rates));
}

export function loadRates() {
    const storedRates = localStorage.getItem('rates');
    if (storedRates) {
        rates = JSON.parse(storedRates);
    }
}

export function showRatesModal() {
    document.getElementById('electricRate').value = rates.חשמל;
    document.getElementById('waterRate').value = rates.מים;
    document.getElementById('municipalRate').value = rates.ארנונה;
    document.getElementById('ratesModal').classList.remove('hidden');
    document.getElementById('ratesModal').classList.add('flex');
}

export function closeRatesModal() {
    document.getElementById('ratesModal').classList.remove('flex');
    document.getElementById('ratesModal').classList.add('hidden');
}

export function saveRates() {
    const electricRate = parseFloat(document.getElementById('electricRate').value);
    const waterRate = parseFloat(document.getElementById('waterRate').value);
    const municipalRate = parseFloat(document.getElementById('municipalRate').value);
    
    if (electricRate >= 0) rates.חשמל = electricRate;
    if (waterRate >= 0) rates.מים = waterRate;
    if (municipalRate >= 0) rates.ארנונה = municipalRate;
    
    localStorage.setItem('rates', JSON.stringify(rates));
    closeRatesModal();
    return rates;
}
