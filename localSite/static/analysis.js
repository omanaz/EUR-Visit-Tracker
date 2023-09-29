const csvData = localStorage.getItem('csvData');

const countries = [
    "Austria",
    "Bulgaria",
    "Czech-Republic",
    "Hungary",
    "Poland",
    "Romania",
    "Slovakia",
    "Slovenia",
    "Liechtenstein",
    "Switzerland",
  ];
  
  const countryStrengths = {};
  console.log(csvData);
  const csvRows = csvData.trim().split("\n").slice(1); // Skip header row
  console.log(csvRows);
  csvRows.forEach((row) => {
    const columns = row.split(",");
    const country = columns[5].trim();
    if (countries.includes(country)) {
      countryStrengths[country] = (countryStrengths[country] || 0) + 1;
    }
  });
  console.log(countryStrengths);
  // Create a Leaflet map
  const map = L.map("mapDiv").setView([48.0, 14.0], 4); // Set initial map center and zoom level
  const maxStrength = Math.max(...Object.values(countryStrengths));
  const opacityScale = d3.scaleLinear()
    .domain([0, maxStrength])
    .range([0.2, .8]);
  // Add a base map (you can choose a suitable tile layer)
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
  
  countries.forEach((countryName) => {
    fetch(`data/geoJson/${countryName}.geojson`) // Assuming your GeoJSON files are named after the countries
    .then((response) => response.json())
    .then((geojson) => {
      // Calculate opacity based on strength and apply it to the layer
      const strength = countryStrengths[countryName] || 0;
      const opacity = opacityScale(strength);

      L.geoJSON(geojson, {
        style: {
            fillColor: 'green',
            color: 'black',
            opacity: 50,
            weight: 1,
          fillOpacity: opacity, // If you want to set the fill opacity as well
        },
      }).addTo(map);
    })
    .catch((error) => {
      console.error(`Error loading GeoJSON for ${countryName}:`, error);
    });
});