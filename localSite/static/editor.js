// Austria, Bulgaria, the Czech Republic, Hungary, Poland, Romania, Slovakia, Slovenia, Liechtenstein, and Switzerland
const csvData = localStorage.getItem('csvData');
// Add a function to handle form submission
function eventInsert(event) {
  console.log('submit');
  event.preventDefault(); // Prevent the default form submission behavior

  // Get form input values
  const eventName = document.getElementById('eventName').value;
  const eventDate = document.getElementById('eventDate').value;
  const participantF = document.getElementById('participantUSF').value;
  const participantL = document.getElementById('participantUSL').value;
  const participant2 = document.getElementById('participantEUR').value;
  const country = document.getElementById('country').value;
  const USParticipant = participantF +' '+participantL

  // Create a CSV row from the form data
  const csvRow = `${eventName},${eventDate},${USParticipant},${participant2},${country}`;

  // Check if there's existing CSV data in local storage
  let csvData = localStorage.getItem('csvData') || '';

  // Append the new CSV row to the existing data (if any)
  if (csvData.length > 0) {
    csvData += '\n'; // Add a newline separator
  }
  csvData += csvRow;

  // Store the updated CSV data in local storage
  localStorage.setItem('csvData', csvData);

  const downloadButton = document.getElementById('downloadButton');
  downloadButton.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`;
  downloadButton.download = 'event_data.csv';
  downloadButton.textContent = 'Download CSV';
  const successModal = document.getElementById('successModal');
      successModal.style.display = 'block';
  
      // Close the modal when the user clicks the close button
      const closeModal = document.getElementById('closeModal');
      closeModal.onclick = function() {
        successModal.style.display = 'none';
      };
  
      // Close the modal when the user clicks outside of it
      window.onclick = function(event) {
        if (event.target == successModal) {
          successModal.style.display = 'none';
        }
      };
}

// Attach the form submission handler to the form


// This code will run when the page is loaded
window.addEventListener('load', function () {
  console.log('loaded');
  // const form = document.getElementById('eventSubmit');
// form.addEventListener('submit', eventInsert);
});
