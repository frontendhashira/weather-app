import "../styles/app.css";
import {
	updateWeatherUI,
	showState,
	updateStatus,
	elements,
	states
} from "./ui/ui";

let controller = null;
let isGettingLocation = false;

const CONFIG = {
	API_KEY: 'd15046a04b314a7386484452242209',
	FORECAST_DAYS: 3,
	COORDINATE_PRECISION: 2,
	GEOLOCATION_OPTIONS: {
		maximumAge: 30000,
		timeout: 27000,
	},
	MESSAGES: {
		LOCATING: 'Getting your location...',
		NO_GEOLOCATION: 'Your browser does not support geolocation',
		LOCATION_ERROR: 'Unable to retrieve your location',
		NO_LOCATION_ACCESS_ERROR:
			'You have blocked location access. Please enable it in your browser settings.',
	},
};

const handleApiError = (error) => {
	const userMessage = error.message.includes('404')
		? 'Location not found. Please try a different search term.'
		: 'Unable to fetch weather data. Please try again.';
	showState(states.ERROR);
	elements.errorMessage.textContent = userMessage;
	console.error('Error fetching weather data:', error);
};

const getForecast = async () => {
	const location = elements.searchInput.value.trim();
	if (!location) {
		updateStatus('Please enter a location', true);
		return;
	}

	if (controller) controller.abort();
	controller = new AbortController();

	const url = `https://api.weatherapi.com/v1/forecast.json?key=${CONFIG.API_KEY}&q=${location}&days=${CONFIG.FORECAST_DAYS}&aqi=no&alerts=no`;

	try {
		showState(states.LOADING);
		elements.loadingMessage.textContent = `Fetching weather for ${location}...`;

		const response = await fetch(url, { signal: controller.signal });
		if (!response.ok) throw new Error(`Response status: ${response.status}`);

		const weatherData = await response.json();
		updateWeatherUI(weatherData);
		showState(states.WEATHER);
		updateStatus('');
		elements.searchInput.value = '';
	} catch (error) {
		if (error.name !== 'AbortError') {
			handleApiError(error);
			updateStatus('');
		}
	}
};

const getUserPosition = async () => {
	if (isGettingLocation) {
		updateStatus('Already getting location...');
		return;
	}
	isGettingLocation = true;
	elements.locationBtn.disabled = true;

	const getPosition = () =>
		new Promise((resolve, reject) => {
			if (!navigator.geolocation) {
				updateStatus(CONFIG.MESSAGES.NO_GEOLOCATION, true);
				return reject(new Error(CONFIG.MESSAGES.NO_GEOLOCATION));
			}
			updateStatus(CONFIG.MESSAGES.LOCATING);
			navigator.geolocation.getCurrentPosition(
				resolve,
				reject,
				CONFIG.GEOLOCATION_OPTIONS
			);
		});

	try {
		const pos = await getPosition();
		const lat = pos.coords.latitude.toFixed(CONFIG.COORDINATE_PRECISION);
		const lon = pos.coords.longitude.toFixed(CONFIG.COORDINATE_PRECISION);
		const latLon = `${lat}, ${lon}`;
		updateStatus('');
		elements.searchInput.value = latLon;
		elements.searchInput.focus();
		debouncedForecast(); 
	} catch (err) {
		const isDenied = err.code === 1;
		elements.errorMessage.textContent = isDenied
			? CONFIG.MESSAGES.NO_LOCATION_ACCESS_ERROR
			: `${CONFIG.MESSAGES.LOCATION_ERROR}, ${err.message}`;
		showState(states.ERROR);
		updateStatus('');
	} finally {
		isGettingLocation = false;
		elements.locationBtn.disabled = false;
	}
};

const debounce = (func, delay) => {
	let timeoutId;
	return (...args) => {
		clearTimeout(timeoutId);
		timeoutId = setTimeout(() => func(...args), delay);
	};
};

const debouncedForecast = debounce(getForecast, 300);

elements.searchForm.addEventListener('submit', (e) => {
	e.preventDefault();
	if (elements.searchInput.value.trim() !== '') debouncedForecast();
});
elements.retryBtn.addEventListener('click', () => showState(states.WELCOME));
elements.locationBtn.addEventListener('click', getUserPosition);

showState(states.WELCOME);
