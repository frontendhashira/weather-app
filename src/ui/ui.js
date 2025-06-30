import { createElementWithClass } from "../../utils/utils";

export const states = {
	WELCOME: 'welcomeState',
	LOADING: 'loadingState',
	ERROR: 'errorState',
	WEATHER: 'weatherContent',
};

export const elements = {
	searchForm: document.getElementById('searchForm'),
	searchInput: document.getElementById('searchInput'),
	searchBtn: document.getElementById('searchBtn'),
	locationBtn: document.getElementById('locationBtn'),
	status: document.getElementById('status'),
	retryBtn: document.getElementById('retryBtn'),
	loadingMessage: document.getElementById('loadingMessage'),
	errorMessage: document.getElementById('errorMessage'),
	currentWeather: document.getElementById('currentWeather'),
	weatherDetails: document.getElementById('weatherDetails'),
};

const el = {
	location: elements.currentWeather.querySelector('.current-weather__location'),
	temp: elements.currentWeather.querySelector('.current-weather__temp'),
	icon: elements.currentWeather.querySelector('.current-weather__icon'),
	condition: elements.currentWeather.querySelector(
		'.current-weather__condition',
	),
	feelsLike: elements.currentWeather.querySelector(
		'.current-weather__feels-like',
	),
	tempDetail: elements.weatherDetails.querySelector('.temp'),
	humidity: elements.weatherDetails.querySelector('.humidity'),
	wind: elements.weatherDetails.querySelector('.wind'),
	precip: elements.weatherDetails.querySelector('.precipitation'),
	sunrise: elements.weatherDetails.querySelector('.sunrise'),
	sunset: elements.weatherDetails.querySelector('.sunset'),
	uv: elements.weatherDetails.querySelector('.uv'),
	visibility: elements.weatherDetails.querySelector('.visibility'),
	pressure: elements.weatherDetails.querySelector('.pressure'),
	dew: elements.weatherDetails.querySelector('.dew'),
};

export function showState(stateName) {
	for (const state of Object.values(states)) {
		document.getElementById(state).classList.add('hidden');
	}
	document.getElementById(stateName).classList.remove('hidden');
}

export function updateStatus(message, isError = false) {
	elements.status.textContent = message;
	elements.status.style.color = isError ? 'red' : 'white';
}

function getUvCategory(uv) {
	if (uv <= 2) return 'Low';
	if (uv <= 5) return 'Moderate';
	if (uv <= 7) return 'High';
	if (uv <= 10) return 'Very High';
	return 'Extreme';
}

function formatHour(hourlyTime) {
	return new Date(hourlyTime).toLocaleTimeString('en-US', {
		hour: 'numeric',
		minute: 'numeric',
		hour12: true,
	});
}

function getDayOfWeek(dateString) {
	const days = [
		'Sunday',
		'Monday',
		'Tuesday',
		'Wednesday',
		'Thursday',
		'Friday',
		'Saturday',
	];
	return days[new Date(dateString).getDay()];
}

export function updateWeatherUI(data) {
	updateCurrent(data);
	updateHourly(data);
	updateWeekly(data);
}

function updateCurrent(data) {
	el.location.textContent = `${data.location.name}, ${data.location.region === data.location.name ? '' : `${data.location.region}, `}${data.location.country}`;
	el.temp.textContent = `${data.current.temp_c}°C`;
	el.icon.innerHTML = `<img src="https:${data.current.condition.icon.replace('64x64', '128x128')}" alt="${data.current.condition.text} icon" />`;
	el.condition.textContent = data.current.condition.text;
	el.feelsLike.textContent = `Feels like ${data.current.feelslike_c}°C`;

	el.tempDetail.textContent = `${data.current.temp_c}°C`;
	el.humidity.textContent = `${data.current.humidity}%`;
	el.wind.textContent = `${data.current.wind_kph} km/h ${data.current.wind_dir}`;
	el.precip.textContent = `${data.current.precip_mm}mm`;
	el.sunrise.textContent = data.forecast.forecastday[0].astro.sunrise;
	el.sunset.textContent = data.forecast.forecastday[0].astro.sunset;
	el.uv.textContent = `${data.current.uv} ${getUvCategory(data.current.uv)}`;
	el.visibility.textContent = `${data.current.vis_km} km`;
	el.pressure.textContent = `${data.current.pressure_mb} hPa`;
	el.dew.textContent = `${data.current.dewpoint_c}°C`;
}

function updateHourly(data) {
	const hourlyList = document.getElementById('hourlyList');
	hourlyList.innerHTML = '';
	const currentHour = new Date().getHours();

	const filtered = data.forecast.forecastday[0].hour.filter(
		(h) => new Date(h.time).getHours() >= currentHour,
	);

	for (const h of filtered) {
		const iconUrl = `https:${h.condition.icon}`;
		const item = createElementWithClass('div', 'hourly-forecast__item');
		const time = createElementWithClass('div', 'hourly-forecast__time');
		const icon = createElementWithClass('div', 'hourly-forecast__icon');
		const temp = createElementWithClass('div', 'hourly-forecast__temp');

		time.textContent = formatHour(h.time);
		icon.innerHTML = `<img src="${iconUrl}" alt="${h.condition.text} icon" />`;
		temp.textContent = `${h.temp_c}°C`;

		item.append(time, icon, temp);
		hourlyList.append(item);
	}
}

function updateWeekly(data) {
	const weeklyList = document.getElementById('weeklyList');
	weeklyList.innerHTML = '';
	const today = getDayOfWeek(data.forecast.forecastday[0].date);

	for (const daily of data.forecast.forecastday) {
		const dayLabel = getDayOfWeek(daily.date);
		const iconUrl = `https:${daily.day.condition.icon}`;

		const item = createElementWithClass('div', 'weekly-forecast__item');
		const day = createElementWithClass('div', 'weekly-forecast__day');
		const icon = createElementWithClass('div', 'weekly-forecast__icon');
		const condition = createElementWithClass(
			'div',
			'weekly-forecast__condition',
		);
		const temps = createElementWithClass('div', 'weekly-forecast__temps');
		const min = createElementWithClass('span', 'weekly-forecast__temp-low');
		const max = createElementWithClass('span', 'weekly-forecast__temp-high');

		day.textContent = dayLabel === today ? 'Today' : dayLabel;
		icon.innerHTML = `<img src="${iconUrl}" alt="${daily.day.condition.text} icon" />`;
		condition.textContent = daily.day.condition.text;
		min.textContent = `${daily.day.mintemp_c}°C`;
		max.textContent = `${daily.day.maxtemp_c}°C`;

		temps.append(max, min);
		item.append(day, icon, condition, temps);
		weeklyList.append(item);
	}
}
