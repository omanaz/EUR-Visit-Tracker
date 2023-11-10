const csvData = localStorage.getItem('csvData');
// const globcsvRows = csvData.trim().split("\n").slice(1); // Skip header row

const blackList = new Set();
let yearMin = 2021;
let yearMax = 2023;

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
  const map = L.map("mapDiv").setView([48.0, 14.0], 4); // Set initial map center and zoom level
  // Add a base map (you can choose a suitable tile layer)
  
  function createMap(mapData){
    // console.log('test');
    const rows = d3.csvParse(mapData);
    // console.log(rows);
    const countryStrengths = {};
    let blacklisted = true;
    console.log(blackList);

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      blacklisted = false;
      const country = row.Country;
      
      if (!(selectFilter(row))) {
        continue;
      }
      if (!(yearFilter(row))) {
        continue;
      }
      // console.log(row);
      if (countries.includes(country)) {
        countryStrengths[country] = (countryStrengths[country] || 0) + 1;
      }
    }
    
    // console.log(countryStrengths);
    map.eachLayer((layer) => {
      if (!layer.options || !layer.options.isTileLayer) {
        map.removeLayer(layer);
      }
    });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    const maxStrength = Math.max(...Object.values(countryStrengths));
    const opacityScale = d3.scaleLinear()
    .domain([0, maxStrength])
    .range([0.2, .8]);
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
        }).bindTooltip(function (layer) {
          const countryName = layer.feature.properties.ADMIN; // Assuming "name" is the property containing the country name in your GeoJSON
          let strength = countryStrengths[countryName] || 0;
          if (countryName === 'Czech Republic') {
            strength = countryStrengths['Czech-Republic'];
            console.log(strength);
          }
          return `${countryName}: ${strength}`;
      }).addTo(map);
      })
      .catch((error) => {
        console.error(`Error loading GeoJSON for ${countryName}:`, error);
      });
    });
    const legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        const div = L.DomUtil.create('div', 'info legend');
        const grades = generateLegendBreaks(opacityScale);
        const labels = [];
        labels.push('<h3>Legend</h3>')
        // Loop through the grades and generate a label with a colored square for each grade
        for (let i = 0; i < grades.length; i++) {
            const from = grades[i];
            const to = grades[i + 1];

            labels.push(
                '<i style="background-color:' + "#fff" + '"></i> ' +
                from + (to ? '&ndash;' + to : '+') + '<svg height="10" width="10"> <circle cx="5" cy="5" r="5" fill="green" opacity="' + opacityScale(to) + '" /></svg></div>' 
            );
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);

    // ... (rest of your code)

    // Function to generate legend breaks based on the opacity scale
    function generateLegendBreaks(scale) {
        const breaksCount = 5; // Adjust the number of breaks as needed
        const maxStrength = scale.domain()[1];
        const step = maxStrength / breaksCount;
        const breaks = [];

        for (let i = 0; i <= breaksCount; i++) {
            breaks.push(i * step);
        }

        return breaks;
    }
  }

function yearFilter(row){
  const rowDate = row.Date; // in format "mm/dd/yyyy"
  //check if the year of rowDate is > yearMin and less than yearMax else return false;
  
  // Extract the year from the rowDate (assuming a valid date format)
  const year = new Date(rowDate).getFullYear();
  // console.log(year);
  // Check if the year is within the specified range (inclusive)
  if (year >= yearMin && year <= yearMax) {
    return true; // Year is within the range
  } else {
    return false; // Year is outside the range
  }
}

function selectFilter(row){
    const arrayList = Array.from(blackList);
    const listLen = blackList.size;
    // console.log('hi???');
    if (listLen== 0){
      // console.log('length');
      // console.log('l');
      return true;
    }
    // console.log('hi2');
    for (let i = 0; i < listLen; i++) {
      if (row["US Participant"].includes(arrayList[i])) {
        // console.log('notfound');
        return false;
        break; // You might want to use 'break' to exit the loop early if a match is found
      }
    }
    // console.log('hi3');

    return true;
  }


$("#slider").slider({
  range: true,
  min: 2021, // Replace with your minimum year
  max: 2023, // Replace with your maximum year
  step: 1, // You can adjust the step as needed
  values: [2021, 2023], // Set initial year range
  slide: function (event, ui) {
    // Update the displayed year range
    $("#date-range").text(ui.values[0] + " - " + ui.values[1]);

    // Filter the data based on the selected year range and update the heatmap
    filterData(ui.values[0], ui.values[1]);
  },
});


function filterData(startYear, endYear) {
  yearMax = endYear;
  yearMin = startYear;
  
  // Clear the current heatmap layer
  map.eachLayer((layer) => {
    if (layer instanceof L.GeoJSON) {
      map.removeLayer(layer);
    }
  });
  createMap(csvData);
}
createMap(csvData);

function createInitialsSelect(){
  const dropdownButton = d3.select("#dropdownButton2");
  const dropdownContent = d3.select("#dropdownContent2");

  // Function to toggle the dropdown content
  function toggleDropdown() {
    dropdownContent.style("display", function() {
      return dropdownContent.style("display") === "block" ? "none" : "block";
    });
  }
  dropdownButton.on("click", toggleDropdown);

  const rows = d3.csvParse(csvData);

  rows.forEach((row) => {
    if (row['US Participant']) {
      // Split the names by space to process each name
      const names = row['US Participant'].split(' ');

      // Remove initials (e.g., J.D., A. B., etc.)
      const filteredNames = names.map((name) => {
        // Check if the name is an initial (a single capital letter followed by a period)
        if (/^[A-Z]\.$/.test(name)) {
          return ''; // Remove initials
        } else {
          return name; // Keep full names
        }
      });

      // Join the filtered names back together with spaces
      row['US Participant'] = filteredNames.join(' ');
    }
  });
  const principalToAbbreviation = {
    POTUS: ["Joe Biden"],
    VPOTUS: ["Kamala Harris"],
    S: ["Antony Blinken"],
    D: ["Victoria Nuland", "Wendy Sherman"],
    'D-MR': ["Richard Verman"],
    C: ["Derek Chollet"],
    P: ["Victoria Nuland"],
    E: ["Jose Fernandez"],
    T: ["Bonnie Jenkins"],
    R: ["Elizabeth Allen"],
    M: ["John Bass"],
    J: ["Uzra Zeya"],
    'A/S EUR': ["Karen Donfried"]
  };
  
  const initials = Object.keys(principalToAbbreviation);

  // Create checkbox options for each initial using D3
  const checkboxOptions = dropdownContent
    .selectAll("label")
    .data(initials)
    .enter()
    .append("label")
    .attr('class','checkbox-label');

  checkboxOptions.text(function(d) {
      return d;
    })
    .append("input")
    .attr("type", "checkbox")
    .attr("name", "initial")
    .attr("value", function(d) {
      return d;
    })
    .property('checked', true)
    .on('change', function(e,D){

      const checkbox = d3.select(e.target);
      const participant = checkbox.attr("");

      // You can perform actions when a checkbox is checked or unchecked here
      // add filter functionality
      // console.log(`Checkbox for ${participant} is checked: ${checkbox.property("checked")}`);
      if (!checkbox.property("checked")) {
        for (let i = 0; i < principalToAbbreviation[D].length; i++){
          blackList.add(principalToAbbreviation[D][i]);
        }
        console.log(principalToAbbreviation[D]);
      } else {
        for (let i = 0; i < principalToAbbreviation[D].length; i++) {
          blackList.delete(principalToAbbreviation[D][i]);
        }
      }

      createMap(csvData);

    });
  
}
createInitialsSelect();