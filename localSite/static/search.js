// Austria, Bulgaria, the Czech Republic, Hungary, Poland, Romania, Slovakia, Slovenia, Liechtenstein, and Switzerland
function stripWhitespace(str) {
  // Use a regular expression to replace leading and trailing whitespace
  return str.replace(/^\s+|\s+$/g, '');
}

let blackList = new Set(); //deselected participants

function removeInitials(name) {
  return name.replace(/\b\w\.\b/g, ''); // Removes single initials followed by a dot
}

const csvData = localStorage.getItem('csvData');


window.addEventListener('load', function(){
  displayCSVTable(csvData,null,null);
  document.getElementsByClassName('footer')[0].style.display = 'none';
  // console.log('loaded');
});



function displayCSVTable(csvData, search, country) {
  // Parse the CSV data using D3
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

  // Extract headers and filter only the desired ones
  const desiredHeaders = ["Event Name", "Date", "US Participant", "Country Participant", "Country", "Event Type", 'Principal'];
  const filteredRows = rows.map(row => {
    const filteredRow = {};
    desiredHeaders.forEach(header => {
      filteredRow[header] = row[header].replace(/,/g, '');
    });
    return filteredRow;
  });
  // console.log(filteredRows);

  d3.select('#tableContainer').select('table').remove();
  // Create a table element
  const table = d3.select('#tableContainer').append('table');

  // Append table header
  const thead = table.append('thead');
  const tbody = table.append('tbody');

  thead
    .append('tr')
    .selectAll('th')
    .data(desiredHeaders)
    .enter()
    .append('th')
    .text(d => d);


  // Function to check if a row should be displayed based on the search term
  function searchFilter(row) {
    if (!search) {
      // console.log('filter');
      // let bool = countryFilter(row)&& selectFilter(row);
      // console.log(bool);
      // console.log(selectFilter(row));
      return countryFilter(row)&& selectFilter(row) && eventFilter(row) && dateFilter(row); // Display all rows if search is null or empty
    }
    const searchTerm = search.toLowerCase(); // Convert to lowercase for case-insensitive comparison
    return (
      // row["Event Name"].toLowerCase().includes(searchTerm) ||
      row['US Participant'].toLowerCase().includes(searchTerm) ||
      row['Country Participant'].toLowerCase().includes(searchTerm)
    ) && countryFilter(row) && selectFilter(row) && eventFilter(row) && dateFilter(row);
  }
  function countryFilter(row){
    if (country =='All'||!country){
      // console.log('nofilteredcountry')
      return true;
    }
    const countryTerm = country.substring(0,5);
    bool = row['Country'].substring(0,5) === countryTerm
    if (bool){
    }
    return bool;
  }
  function selectFilter(row){
    if (blackList.length== 0){
      // console.log('length');
      return true;
    }
    // let bool = true;
    // console.log(blackList);
    const blackListArray = Array.from(blackList);
    for (let i = 0; i < blackListArray.length; i++) {
      const item = blackListArray[i];
      if (row["US Participant"].includes(item)) {
        // console.log('notfound');
        return false;
      }
    }
    // return bool;
    return true;
  }
  function eventFilter(row){
    const eType = document.getElementById('eType').value;
    // console.log(eType);
    if (row['Event Type'] === eType || eType == 'All'){
      return true;
    }
    return false;
  }
  function dateFilter(row){
    startDate = document.getElementById('start-date').value;
    endDate = document.getElementById('end-date').value;
    if (startDate === '' | endDate === ''){
      return true;
    } 
    rowDate = new Date(row.Date);
    startDate = new Date(startDate);
    endDate = new Date(endDate);
    if (startDate > rowDate | endDate < rowDate){
      console.log(row.Date);
      console.log(rowDate);
      return false;
    }
    return true;
    
  }

  // Append table rows based on the filtered condition
  const rowsEnter = tbody
    .selectAll('tr')
    .data(filteredRows.filter(searchFilter))
    .enter()
    .append('tr');

  const cellsEnter = rowsEnter
    .selectAll('td')
    .data(d => Object.values(d))
    .enter()
    .append('td')
    .text(d => d);
  

  // console.log(document.getElementById("tableContainer").querySelector("table"));
  var eventCount = document.getElementById("tableContainer").querySelector("table").rows.length;
  document.getElementById('eventCountSpan').textContent = eventCount-1;


  // d3.select('#download').remove(); // Remove existing download button if any
  const downloadButton = d3.select('#download');
    // d3.select('#tableContainer')
    // .append('button')
    // .attr('id', 'download')
    // .text('Download CSV');

  // Function to convert an array of objects to CSV
  function convertToCSV(data) {
    const header = desiredHeaders.join(',');
    const csv = [header];
    data.forEach(row => {
      const values = desiredHeaders.map(header => row[header]);
      csv.push(values.join(','));
    });
    return csv.join('\n');
  }

  // Add an event listener to the download button
  downloadButton.on('click', () => {
    const filteredData = filteredRows.filter(searchFilter);
    const csvContent = convertToCSV(filteredData);
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'filtered_data.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  });
  
}


document.getElementById('searchPart').addEventListener('change', function(e) {
  // console.log(e.target.value);
  displayCSVTable(csvData, e.target.value, document.getElementById('countrySelect').value);
});
document.getElementById('countrySelect').addEventListener('change', function(e) {
  // console.log(e.target.value);
  displayCSVTable(csvData, document.getElementById('searchPart').value, e.target.value);
});
document.getElementById('eType').addEventListener('change', function(e) {
  // console.log(e.target.value);
  displayCSVTable(csvData, document.getElementById('searchPart').value, document.getElementById('countrySelect').value);
});
document.getElementById('start-date').addEventListener('change', function(e) {
  console.log('hi');
  displayCSVTable(csvData, document.getElementById('searchPart').value, document.getElementById('countrySelect').value);
});
document.getElementById('end-date').addEventListener('change', function(e) {
  // console.log(e.target.value);
  displayCSVTable(csvData, document.getElementById('searchPart').value, document.getElementById('countrySelect').value);
});

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

      displayCSVTable(csvData, document.getElementById('searchPart').value, document.getElementById('countrySelect').value);

    });
  
}

createInitialsSelect();