export async function loadMoonData() {
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

  const API_KEY = 'ef56bfc2ceceb995bd46a30d86de0b56f2e324b65ead87090f82acb3d2e8c509';
  const BASE_URL = 'https://api.freeastroapi.com/api/v1/moon/phase';

  const params = new URLSearchParams({
    date: '2026-05-06',
    style_moon_color: '#E0E0E0',
    style_shadow_color: '#1A1A1A',
    include_visuals: 'true',
    include_zodiac: 'false',
    include_rise_set: 'true',
    include_traditional_moon: 'true'
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

    const data = await res.json();
    console.log('moon data', data);

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
    if (nextFullDate) nextFullDate.textContent = formatIsoAsUtc(data.nextFull?.date ?? data.raw?.traditional_moon?.applies_to_full_moon_at ?? '—');

    if (nextEclipseNumber) nextEclipseNumber.textContent = data.nextEclipse?.inDays != null ? String(data.nextEclipse.inDays) : '—';
    if (nextEclipseDate) nextEclipseDate.textContent = formatIsoAsUtc(data.nextEclipse?.date ?? '—');

  } catch (err) {
    console.error('Moon API error:', err);
  }
}


export async function loadMoonDataMock() {
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

  // recorded response object (replace with your saved JSON if different)
  const res = {
    "timestamp": "2026-05-06T00:00:00+00:00",
    "phase": {
      "name": "Waning Gibbous",
      "phase_angle_deg": 226.93,
      "illumination": 0.8411,
      "age_days": 18.6,
      "distance_km": 405285,
      "is_waxing": false
    },
    "moon_visual": { /* ... */ },
    "eclipse": { "is_eclipse": false, "is_blood_moon": false },
    "traditional_moon": {
      "name": "Flower Moon",
      "applies_to_full_moon_at": "2026-05-31T09:32:21Z",
      "is_current_full_moon": false
    },
    "next_phases": {
      "new_moon": "2026-05-16T19:41:08Z",
      "first_quarter": "2026-05-23T11:13:26Z",
      "full_moon": "2026-05-31T09:32:21Z",
      "last_quarter": "2026-05-09T20:39:22Z"
    }
  };

  try {
    // adapt recorded response to the shape your UI code expects
    const data = {
      phaseName: res.phase?.name ?? null,
      ageDays: res.phase?.age_days ?? null,
      distanceKm: res.phase?.distance_km ?? null,
      nextFull: {
        date: res.next_phases?.full_moon ?? null,
        inDays: res.phase?.age_days != null ? Math.max(0, (30.44 - res.phase.age_days)).toFixed(2) : null
      },
      nextEclipse: { date: null, inDays: null },
      // include any other fields you need directly from res
      raw: res
    };

    console.log('moon mock data', data);

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
    if (nextFullDate) nextFullDate.textContent = formatIsoAsUtc(data.nextFull?.date ?? data.raw?.traditional_moon?.applies_to_full_moon_at ?? '—');

    if (nextEclipseNumber) nextEclipseNumber.textContent = data.nextEclipse?.inDays != null ? String(data.nextEclipse.inDays) : '—';
    if (nextEclipseDate) nextEclipseDate.textContent = formatIsoAsUtc(data.nextEclipse?.date ?? '—');

  } catch (err) {
    console.error('Moon mock error:', err);
  }
}
