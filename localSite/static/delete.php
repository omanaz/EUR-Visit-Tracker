<?php
$filePath = '/home/Oman/public_html/data/Events.csv';

// Get ID from query parameters
$id = $_GET['id'];

// Open the CSV file in read/write mode
$file = fopen($filePath, 'r+');
if ($file === false) {
  echo "Error opening CSV file";
  exit; // Or handle the error appropriately
}

// Temporary storage for updated CSV data
$updatedData = [];

// Iterate through the CSV rows
while (($row = fgetcsv($file)) !== false) {
  if ($row[8] == $id) { // Assuming first column ('0') contains the ID
    // This row matches the ID to delete, skip adding it
    continue;  
  } else {
    // Keep other rows
    $updatedData[] = $row;
  }
}

// Rewind the file pointer to the beginning
rewind($file);

// Truncate the file before writing updated data
ftruncate($file, 0);

// Write the updated CSV data back to the file
foreach ($updatedData as $row) {
  fputcsv($file, $row);
}

fclose($file);

// Optionally provide feedback like:
echo "Record deleted successfully"; 
?>
