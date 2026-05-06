(async () => {
  const geoRes = await fetch('https://nominatim.openstreetmap.org/search?q=' + encodeURIComponent('pudukkottai, India') + '&format=json&limit=1', {
    headers: { 'User-Agent': 'EmergencyConnect/1.0' }
  });
  const geoData = await geoRes.json();
  console.log('GEO:', geoData);
  if (geoData.length > 0) {
    const lat = geoData[0].lat;
    const lon = geoData[0].lon;
    const overpassQuery = `[out:json];(node["amenity"~"hospital|clinic|doctors"](around:35000,${lat},${lon});way["amenity"~"hospital|clinic|doctors"](around:35000,${lat},${lon}););out center;`;
    console.log('Query:', overpassQuery);
    const overpassRes = await fetch('https://overpass-api.de/api/interpreter?data=' + encodeURIComponent(overpassQuery), {
      headers: { 'User-Agent': 'EmergencyConnect/1.0' }
    });
    console.log('Overpass status:', overpassRes.status);
    const overpassData = await overpassRes.json();
    console.log('Hospitals found:', overpassData.elements ? overpassData.elements.length : 0);
  }
})();
