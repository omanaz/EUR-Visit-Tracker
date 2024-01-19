const csvData = localStorage.getItem('csvData'); // retrieve data

const blackList = new Set();
let dateMin = new Date('01-01-2020');
let dateMax = new Date('01-01-2024');

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
  // Add a base map 
  
  function createMap(mapData){
    const rows = d3.csvParse(mapData);
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
      if (countries.includes(country)) {
        countryStrengths[country] = (countryStrengths[country] || 0) + 1;
      }
    }
    
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
      fetch(`data/geoJson/${countryName}.geojson`) // pulls from local data folder that contains all the geojsons of relevant countries
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
            fillOpacity: opacity, 
          },
        }).bindTooltip(function (layer) {
          const countryName = layer.feature.properties.ADMIN; // Assuming "name" is the property containing the country name in GeoJSON
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
                from.toFixed(1) + (to ? '&ndash;' + to.toFixed(1) : '+') + '<svg height="10" width="10"> <circle cx="5" cy="5" r="5" fill="green" opacity="' + opacityScale(to) + '" /></svg></div>' 
            );
        }

        div.innerHTML = labels.join('<br>');
        return div;
    };

    legend.addTo(map);

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
  const year = new Date(rowDate);
  // Check if the year is within the specified range (inclusive)
  if (year >= dateMin && year <= dateMax) {
    return true; // Year is within the range
  } else {
    return false; // Year is outside the range
  }
}

function selectFilter(row){
    const arrayList = Array.from(blackList);
    const listLen = blackList.size;
    if (listLen== 0){
      return true;
    }
    for (let i = 0; i < listLen; i++) {
      if (row["US Participant"].includes(arrayList[i])) {
        return false;
      }
    }

    return true;
  }

  $("#filter-button").on("click", function () {
    // Get the selected start and end dates
    const startDate = $("#start-date").val();
    const endDate = $("#end-date").val();
  
    // Update the displayed date range
    $("#date-range").text(startDate + " - " + endDate);
  
    // Filter the data based on the selected date range and update the heatmap
    filterDataByDate(startDate, endDate);
  });
  
  function filterDataByDate(startDate, endDate) {
    // Clear the current heatmap layer
    map.eachLayer((layer) => {
      if (layer instanceof L.GeoJSON) {
        map.removeLayer(layer);
      }
    });
    const legend = document.querySelector('.info.legend');
    if (legend && legend.parentNode) {
      legend.parentNode.removeChild(legend);
    }
  
    // Update the global variables for filtering
    dateMin = new Date(startDate);
    dateMax = new Date(endDate);
  
    // Recreate the map with the filtered data
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