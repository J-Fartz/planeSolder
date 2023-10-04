document.addEventListener('DOMContentLoaded', () => {
    const storedData = localStorage.getItem('flightData');
    const lastDateChecked = localStorage.getItem('lastCheckedDate') || getFiveDaysAheadDate();
    const lastPriceChecked = localStorage.getItem('lastCheckedPrice') || defaultUnitedPrice;

    // Update the front end with the last checked date
    document.getElementById('lastCheckedDate').textContent = lastDateChecked;

    // Update the front end with the last average price
    const formattedLastPriceChecked = parseFloat(lastPriceChecked).toFixed(2);
    document.getElementById('lastCheckedPrice').textContent = formattedLastPriceChecked;

    if (storedData) {
        const flights = JSON.parse(storedData);
        displayFlights(flights);
    }
});

function getFiveDaysAheadDate() {
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + 5);

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const day = String(currentDate.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}

const dateForFlight = getFiveDaysAheadDate();

// NOTE: Hide or secure your API key before deployment or sharing!
const url = `https://tripadvisor16.p.rapidapi.com/api/v1/flights/searchFlights?sourceAirportCode=MCO&destinationAirportCode=EWR&date=${dateForFlight}&itineraryType=ONE_WAY&sortOrder=EARLIEST_OUTBOUND_DEPARTURE&numAdults=1&numSeniors=0&classOfService=PREMIUM_ECONOMY&pageNumber=1&nonstop=yes&currencyCode=USD`;

const options = {
    method: 'GET',
    headers: {
        'X-RapidAPI-Key': 'YOUR-API-HERE',
		'X-RapidAPI-Host': 'YOUR_HOST-HERE'
    }
};  

async function fetchFlights() {
    try {
        const response = await fetch(url, options);
        const fresults = await response.json();
        console.log(fresults);


        if (fresults.status === false) {
            console.error(`API Error at ${new Date(fresults.timestamp).toLocaleString()}: ${fresults.message}`);
            // Optionally, display a message to the user or handle the error in another appropriate way.
            return;
        }
        

        const flights = fresults.data.flights;
        const averagePrice = getAverageFlightPrice(flights);

        document.getElementById('lastCheckedPrice').textContent = averagePrice.toFixed(2);

        displayFlights(flights);

        localStorage.setItem('flightData', JSON.stringify(flights));
        localStorage.setItem('lastCheckedDate', dateForFlight);
        localStorage.setItem('lastCheckedPrice', averagePrice);
    } catch (error) {
        console.error(error);
    }
}

function getAverageFlightPrice(flights) {
    let total = 0;
    let count = 0;
    flights.forEach((flight) => {
        const purchaseLink = flight.purchaseLinks[0];
        if (purchaseLink && purchaseLink.totalPrice) {
            total += purchaseLink.totalPrice;
            count++;
        }
    });
    return count > 0 ? total / count : 0;
}

function displayFlights(flights) {
    let output = '';
    flights.forEach((flight, flightIndex) => {
        const purchaseLink = flight.purchaseLinks[0];
        if (purchaseLink && purchaseLink.totalPrice) {
            const provider = purchaseLink.providerId;
            const price = purchaseLink.totalPrice;
            output += `<li><div>Flight ${flightIndex + 1}</div><div>Provider: ${provider}</div><div>Total Price: $${price}</div></li>`;
        }
    });

    const outputElement = document.getElementById('flightOutput');
    outputElement.innerHTML = output;
}

let counter = 0;
const solderPrice = 64.78;
const defaultUnitedPrice = 0;
let unitedFlightPrice = parseFloat(localStorage.getItem('lastCheckedPrice'));

function flightCounter() {
    counter++;
    console.log('Counter:', counter);
    updateContent();

    // Update the counter display
    document.getElementById('flightCounterDisplay').textContent = counter;

    return counter;
}

function updateContent() {
    const solderCount = Math.floor((counter * unitedFlightPrice) / solderPrice);
    document.getElementById('solders').textContent = `The amount of soldering irons PWS NY could have purchased: ${solderCount}`;
}
