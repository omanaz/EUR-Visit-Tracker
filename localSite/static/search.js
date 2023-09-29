// Austria, Bulgaria, the Czech Republic, Hungary, Poland, Romania, Slovakia, Slovenia, Liechtenstein, and Switzerland
  const csvData = localStorage.getItem('csvData');
  window.addEventListener('load', function(){
    displayCSVTable(csvData,null,null);
    document.getElementsByClassName('footer')[0].style.display = 'none';
    console.log('loaded');
  });
  function displayCSVTable(csvData, search, country) {
    // Parse the CSV data using D3
    const rows = d3.csvParse(csvData);

    // Extract headers and filter only the desired ones
    const desiredHeaders = ["Event Name", "Date", "US Participant", "Country Participant", "Country"];
    const filteredRows = rows.map(row => {
      const filteredRow = {};
      desiredHeaders.forEach(header => {
        filteredRow[header] = row[header];
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
        console.log('filter');
        return countryFilter(row); // Display all rows if search is null or empty
      }
      const searchTerm = search.toLowerCase(); // Convert to lowercase for case-insensitive comparison
      return (
        // row["Event Name"].toLowerCase().includes(searchTerm) ||
        row['US Participant'].toLowerCase().includes(searchTerm) ||
        row['Country Participant'].toLowerCase().includes(searchTerm)
      ) && countryFilter(row);
    }
    function countryFilter(row){
      if (country =='All'||!country){
        console.log('nofilteredcountry')
        return true;
      }
      const countryTerm = country.substring(0,5);
      return row['Country'].substring(0,5) === countryTerm;
      
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
}


document.getElementById('searchPart').addEventListener('change', function(e) {
  console.log(e.target.value);
  displayCSVTable(csvData, e.target.value, document.getElementById('countrySelect').value);
});
document.getElementById('countrySelect').addEventListener('change', function(e) {
  console.log(e.target.value);
  displayCSVTable(csvData, document.getElementById('searchPart').value, e.target.value);
});

