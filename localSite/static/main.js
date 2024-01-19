// Landing page JS file
let csvData;

function toEdit(){
    window.location.href = "editor.html";
}
function toAnalysis(){
    window.location.href = "analysis.html";
}
function toSearch(){
    window.location.href = "search.html";
}
function toTimeline(){
  window.location.href = "timeline.html";
}
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
  
    reader.onload = function(event) {
      csvData = event.target.result;
      localStorage.setItem('csvData', csvData);
    }
      // Show the success modal
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
    
  
    reader.readAsText(file);
  });