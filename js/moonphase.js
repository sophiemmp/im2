export async function loadMoonData() {
	const API_KEY = 'ef56bfc2ceceb995bd46a30d86de0b56f2e324b65ead87090f82acb3d2e8c509';
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
				'x-api-key': API_KEY,
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
	}
}


async function loadMoonDataMock() {
	// recorded response object (replace with your saved JSON if different)
	const res = {
		"timestamp": "2026-05-07T15:54:07+00:00",
		"phase": {
		  "name": "Waning Gibbous",
		  "phase_angle_deg": 245.11,
		  "illumination": 0.7112,
		  "age_days": 20.1,
		  "distance_km": 402144,
		  "is_waxing": false
		},
		"moon_visual": {
		  "type": "svg",
		  "svg": "<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 100 100\" width=\"100\" height=\"100\">\n<circle cx=\"50.0\" cy=\"50.0\" r=\"45.0\" fill=\"#1A1A1A\" />\n<path d=\"M 50.0,95.0 A 45.0 45.0 0 0 1 50.0,5.0 A 18.939487405970407 45.0 0 0 1 50.0,95.0 Z\" fill=\"#E0E0E0\" />\n</svg>",
		  "shadow_ratio": 0.2888,
		  "waxing": false
		},
		"eclipse": {
		  "is_eclipse": false,
		  "is_blood_moon": false
		},
		"forecast": {
		  "days_until_full_moon": 25.3,
		  "days_until_new_moon": 10.3,
		  "next_special_moon": {
			"type": "Supermoon",
			"subtype": "new",
			"days_until": 10.5,
			"distance_km": 357269
		  },
		  "next_eclipse": {
			"type": "partial",
			"is_blood_moon": false,
			"date": "2026-08-28T04:12:00Z",
			"days_until": 84.4
		  }
		},
		"traditional_moon": {
		  "name": "Flower Moon",
		  "naming_system": "north_american_traditional",
		  "month": "May",
		  "applies_to_full_moon_at": "2026-05-31T09:58:01Z",
		  "is_current_full_moon": false
		},
		"next_phases": {
		  "new_moon": "2026-05-16T18:59:08Z",
		  "first_quarter": "2026-05-23T11:17:28Z",
		  "full_moon": "2026-05-31T09:58:01Z",
		  "last_quarter": "2026-05-09T20:55:10Z"
		}
	  };

	  return transformMoonData(res);
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
	  // format as YYYY‑MM‑DD HH:MM UTC
	  const pad = (n) => String(n).padStart(2, '0');
	  return `${pad(d.getUTCDate())}.${pad(d.getUTCMonth()+1)}.${d.getUTCFullYear()}`;
	} catch {
	  return '—';
	}
}
  

export async function insertMoonData() {
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

	const data = await loadMoonDataMock();

	if (phaseEl) phaseEl.textContent = data.phaseName ?? '—';

	if (ageNumber) ageNumber.textContent = data.ageDays != null ? String(data.ageDays) : '—';
	if (ageUnit) ageUnit.textContent = 'Days';

	if (distanceNumber) {
		distanceNumber.textContent = data.distanceKm != null
			? String(data.distanceKm).replace(/\B(?=(\d{3})+(?!\d))/g, "’")
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



export function getAgeDays() {
	return parseInt(document.getElementById("age-days").innerText);
}