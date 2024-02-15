//Search page JS
function stripWhitespace(str) {
  // Use regular expressions to replace leading and trailing whitespace
  return str.replace(/^\s+|\s+$/g, '');
}

let blackList = new Set(); //deselected participants

function removeInitials(name) {
  return name.replace(/\b\w\.\b/g, ''); // Removes single initials followed by a dot
}

let csvData;
fetch('/~Oman/data/Events.csv')
  .then(response => response.text())
  .then(data => {
    csvData = data;
    displayCSVTable(csvData,null,null);

function displayCSVTable(csvData, search, country) {
  // Parse the CSV data using D3
  const rows = d3.csvParse(csvData);
  console.log(rows);
  console.log('here and here and hera');

  rows.forEach((row) => {
    if (row['US Participant']) {
      console.log('here and here and hera2');

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
  const desiredHeaders = ["Event Name", "Date", "US Participant", "Country Participant", "Country", "Event Type", 'Principal',"ID"];
  const filteredRows = rows.map(row => {
    const filteredRow = {};
    desiredHeaders.forEach(header => {
      filteredRow[header] = row[header].replace(/,/g, '');
    });
    return filteredRow;
  });

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
      return countryFilter(row)&& selectFilter(row) && eventFilter(row) && dateFilter(row); // Display all rows if search is null or empty
    }
    const searchTerm = search.toLowerCase(); // Convert to lowercase for case-insensitive comparison
    return (
      row['US Participant'].toLowerCase().includes(searchTerm) ||
      row['Country Participant'].toLowerCase().includes(searchTerm)
    ) && countryFilter(row) && selectFilter(row) && eventFilter(row) && dateFilter(row); // ensure passes all the filters
  }
  function countryFilter(row){ // Country Select function
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
  function selectFilter(row){ //Select By Principal select box
    if (blackList.length== 0){
      return true;
    }
    const blackListArray = Array.from(blackList);
    for (let i = 0; i < blackListArray.length; i++) {
      const item = blackListArray[i];
      if (row["US Participant"].includes(item)) {
        return false;
      }
    }
    return true;
  }
  function eventFilter(row){ // Event Type filer
    const eType = document.getElementById('eType').value;
    if (row['Event Type'] === eType || eType == 'All'){ // e type stands for event type
      return true;
    }
    return false;
  }
  function dateFilter(row){ // filter function for the two calendar selects 
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

// Append data cells from your filteredRows objects
const cellsEnter = rowsEnter
    .selectAll('td')
    .data(d => Object.values(d))
    .enter()
    .append('td')
    .text(d => d);

// Append cell for the edit button
rowsEnter.append('td')
    .append('button')
    .text('Edit')
    .attr('class', 'edit-button'); 
rowsEnter.append('td')
  .append('button')
  .text('Delete')
  .attr('class', 'delete-button')
  .on('click', function(event, d) { // Use 'd' to access row data
    const rowId = d.ID;  // Assuming an 'ID' field in your data 

    if (confirm('Are you sure you want to delete this record?')) {
      // AJAX Request to delete record
      fetch(`/~Oman/delete.php?id=${rowId}`)
      .then(response => {
        if (response.ok) {
          this.closest('tr').remove(); // Remove the row visually
          // Optionally update 'eventCountSpan' if you want
        } else {
          alert('Error deleting record');
        }
      })
      .catch(error => {
          console.error('Error deleting:', error);
      });
    }
  }); 
  

  // console.log(document.getElementById("tableContainer").querySelector("table"));
  var eventCount = document.getElementById("tableContainer").querySelector("table").rows.length;
  document.getElementById('eventCountSpan').textContent = eventCount-1;


  const downloadButton = d3.select('#download');

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
  
  // edit function
  d3.selectAll('.edit-button').on('click', function() {
    const row = d3.select(this.parentNode.parentNode); // Get the parent row (<tr>)
    const cells = row.selectAll('td').nodes(); // Get all cells in the row 
    const button = d3.select(this);
    if (button.text() === 'Edit') {
      // Make cells editable
      for (let i = 0; i < cells.length - 1; i++) {
          cells[i].contentEditable = 'true';
      }
      button.text('Save'); 

  } else { // (button.text() === 'Save')
      // Collect modified data
      const updatedData = {};
      // for (let i = 0; i < cells.length - 1; i++) {
      //     const header = desiredHeaders[i]; // Assuming 'desiredHeaders' has original column names
      //     updatedData[header] = cells[i].textContent; 
      // }
      console.log(updatedData);
      // Send data to server (using 'fetch' for an AJAX request)
      // const formData = new URLSearchParams(updatedData).toString();
      let csvRow = `eventName=${cells[0].textContent}&formattedDate=${cells[1].textContent}&link='nolink'&USParticipant=${cells[2].textContent}&participant2=${cells[3].textContent}`;
      csvRow = csvRow+ `&country=${cells[4].textContent}&eventType=${cells[5].textContent}&title=${cells[6].textContent}&ID=${cells[7].textContent}`;
      console.log(csvRow);
      
        // Send data using XMLHttpRequest
        const xhr = new XMLHttpRequest();
        const url = '/~Oman/edit_csv.php';
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === 4 && xhr.status === 200) {
                console.log(xhr.responseText); // Handle successful save (if response needed)
            } else if (xhr.readyState === 4) { // Check for non-200 status as well
               console.error('Error saving data:', xhr.status); 
            }
        };
        xhr.send(csvRow);

      // Make cells non-editable & change button back to 'Edit'
      for (let i = 0; i < cells.length - 1; i++) {
          cells[i].contentEditable = 'false';
      }
      button.text('Edit'); 
  }
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
  const principalToAbbreviation = { //for converting titles to names
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

})
.catch(error => {
  console.error('Failed to read CSV:', error);
});

window.addEventListener('load', function(){
document.getElementsByClassName('footer')[0].style.display = 'none';
});