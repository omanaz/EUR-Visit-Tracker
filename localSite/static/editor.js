// const csvData = localStorage.getItem('csvData'); // retrieve local data
// Add a function to handle form submission
function eventInsert(event) {
  console.log('submit');
  event.preventDefault(); // Prevent the default form submission behavior

  // Get form input values
  const eventName = document.getElementById('eventName').value;
  const eventDate = document.getElementById('eventDate').value;
  const dateObject = new Date(eventDate);
  const month = dateObject.getMonth() + 1; // Adding 1 because months are zero-indexed
  const day = dateObject.getDate()+1;
  const year = dateObject.getFullYear();
  // Format the date as "m/d/yyyy"
  const formattedDate = `${month}/${day}/${year}`;
  const participantF = document.getElementById('participantUSF').value;
  const participantL = document.getElementById('participantUSL').value;
  const participant2 = document.getElementById('participantEUR').value;
  const country = document.getElementById('country').value;
  const title = document.getElementById('titleSelect').value;
  const eventType = document.getElementById('eType').value;
  const USParticipant = participantF +' '+participantL

  // Create a CSV row from the form data
  // const csvRow = `${eventName},${formattedDate},"noLink",${USParticipant},${participant2},${country},${eventType},${title}`;
  const csvRow = `eventName=${eventName}&formattedDate=${formattedDate}&USParticipant=${USParticipant}&participant2=${participant2}&country=${country}&eventType=${eventType}&title=${title}`;

  // Send the data to PHP file using AJAX
  const xhr = new XMLHttpRequest();
  const url = '/~Oman/write_csv.php';
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function() {
    if (xhr.readyState === 4 && xhr.status === 200) {
      console.log(xhr.responseText);
    }
  };
  xhr.send(csvRow);

  // const downloadButton = document.getElementById('downloadButton');
  // downloadButton.href = `data:text/csv;charset=utf-8,${encodeURIComponent(csvData)}`;
  // downloadButton.download = 'event_data.csv';
  // downloadButton.textContent = 'Download CSV';
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