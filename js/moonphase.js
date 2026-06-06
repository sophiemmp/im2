const moonStorage = "moon_data";
const moonApiKey = 'ef56bfc2ceceb995bd46a30d86de0b56f2e324b65ead87090f82acb3d2e8c509';


async function loadMoonData() {
	const BASE_URL = 'https://api.freeastroapi.com/api/v1/moon/phase';

	const params = new URLSearchParams({
		date: nowIsoForZurich(),
		style_moon_color: '#E0E0E0',
		style_shadow_color: '#1A1A1A',
		include_visuals: 'true',
		include_zodiac: 'false',
		include_rise_set: 'true',
		include_forecast: 'true',
		include_traditional_moon: 'false'
	});

	const url = `${BASE_URL}?${params.toString()}`;

	try {
		const res = await fetch(url, {
			method: 'GET',
			headers: {
				'x-api-key': moonApiKey,
				'Accept': 'application/json'
			}
		});
		console.log('Moon API request URL:', url, 'status:', res.status);

		if (!res.ok) {
			let errBody;
			try { errBody = await res.text(); } catch (e) { errBody = '<unable to read body>'; }
			throw new Error(`Moon API request failed: ${res.status} ${res.statusText} — ${errBody}`);
		}

		return transformMoonData(await res.json());

	} catch (err) {
		console.error('Moon API error:', err);
		throw err;
	}
}


export async function preloadMoonData() {
	const cached = sessionStorage.getItem(moonStorage);
	if (cached) {
		console.log("Moon data already preloaded");
		return JSON.parse(cached);
	}

	const data = await loadMoonData();
	sessionStorage.setItem(moonStorage, JSON.stringify(data));
	console.log("Moon data preloaded and cached");
	return data;
}


export async function getMoonData() {
	const cached = sessionStorage.getItem(moonStorage);
	if (cached) {
		
		return JSON.parse(cached);
	}

	const data = await loadMoonData();
	sessionStorage.setItem(moonStorage, JSON.stringify(data));
	console.log("moon not preloaded");
	
	return data;
}

function transformMoonData(res) {
	return {
		phaseName: res.phase?.name ?? null,
		ageDays: res.phase?.age_days ?? null,
		distanceKm: res.phase?.distance_km ?? null,
		nextFull: {
			date: res.next_phases?.full_moon ?? null,
			inDays:
				res.phase?.age_days != null
					? Math.max(0, (30.44 - res.phase.age_days)).toFixed(2)
					: null
		},
		nextEclipse: {
			date: null,
			inDays: null
		},
		raw: res
	};
}

function nowIsoForZurich() {
	const dtf = new Intl.DateTimeFormat('en', {
		timeZone: 'Europe/Zurich',
		year: 'numeric', month: '2-digit', day: '2-digit',
		hour: '2-digit', minute: '2-digit', second: '2-digit',
		hour12: false
	});
	const parts = dtf.formatToParts(new Date());
	const map = Object.fromEntries(parts.map(p => [p.type, p.value]));
	return `${map.year}-${map.month}-${map.day}T${map.hour}:${map.minute}:${map.second}`;
  }
  

function formatIsoAsUtc(iso) {
	if (!iso || iso === '—') return '—';
	try {
	  const d = new Date(iso);
	  if (Number.isNaN(d.getTime())) return '—';
	  const pad = (n) => String(n).padStart(2, '0');
	  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth()+1)}.${d.getUTCFullYear()}`;
	} catch {
	  return '—';
	}
}
  

export function renderMoonData(data) {
	const phaseEl = document.querySelector('.phase-label h1');
	const statEls = Array.from(document.querySelectorAll('.stats-grid .stat'));
	const ageNumber = statEls[0]?.querySelector('.value .number') ?? null;
	const ageUnit = statEls[0]?.querySelector('.value .unit') ?? null;
	const distanceNumber = statEls[1]?.querySelector('.value .number') ?? null;
	const distanceUnit = statEls[1]?.querySelector('.value .unit') ?? null;
	const nextFullNumber = statEls[2]?.querySelector('.value .number') ?? null;
	const nextFullDate = statEls[2]?.querySelector('.date') ?? null;
	const nextEclipseNumber = statEls[3]?.querySelector('.value .number') ?? null;
	const nextEclipseDate = statEls[3]?.querySelector('.date') ?? null;

	if (phaseEl) phaseEl.textContent = data.phaseName ?? '—';

	if (ageNumber) ageNumber.textContent = data.ageDays != null ? String(data.ageDays) : '—';
	if (ageUnit) ageUnit.textContent = 'Days';

	if (distanceNumber) {
		distanceNumber.textContent = data.distanceKm != null
			? String(data.distanceKm).replace(/\B(?=(\d{3})+(?!\d))/g, "'")
			: '—';
	}
	if (distanceUnit) distanceUnit.textContent = 'km';

	if (nextFullNumber) nextFullNumber.textContent = data.nextFull?.inDays != null ? String(data.nextFull.inDays) : '—';
	if (nextFullDate) nextFullDate.textContent = formatIsoAsUtc(data.nextFull?.date ?? data.raw?.next_phases?.full_moon ?? '—');

	const eclipseSource = data.nextEclipse?.date || data.nextEclipse?.inDays
		? data.nextEclipse
		: data.raw?.forecast?.next_eclipse ?? null;

	const eclipseInDays = eclipseSource?.inDays ?? eclipseSource?.days_until ?? data.raw?.forecast?.days_until ?? data.raw?.forecast?.days_until_full_moon ?? null;
	const eclipseDateVal = eclipseSource?.date ?? null;

	if (nextEclipseNumber) nextEclipseNumber.textContent = eclipseInDays != null ? String(eclipseInDays) : '—';
	if (nextEclipseDate) nextEclipseDate.textContent = formatIsoAsUtc(eclipseDateVal ?? '—');
}


export async function displayMoonPhase() {
	try {
		const data = await getMoonData();
		renderMoonData(data);
	} catch (err) {
		console.error("Failed to display moon data:", err);
	}
}


export function getAgeDays() {
	return parseInt(document.getElementById("age-days").innerText);
}