// Austria, Bulgaria, the Czech Republic, Hungary, Poland, Romania, Slovakia, Slovenia, Liechtenstein, and Switzerland
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
document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = function(event) {
      csvData = event.target.result;
      localStorage.setItem('csvData', csvData);
    };
    
    reader.readAsText(file);
  });