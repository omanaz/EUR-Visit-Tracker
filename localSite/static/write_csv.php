<?php
// Get form data
$eventName = $_POST['eventName'];
$formattedDate = $_POST['formattedDate'];
$USParticipant = $_POST['USParticipant'];
$participant2 = $_POST['participant2'];
$country = $_POST['country'];
$eventType = $_POST['eventType'];
$title = $_POST['title'];

// CSV file path
$filePath = '/home/Oman/public_html/data/Events.csv';

// Determine the next ID
$lastId = 0;  // Starting point 
if (($file = fopen($filePath, 'r')) !== FALSE) {
    while (($row = fgetcsv($file)) !== FALSE) {
        $lastId = $row[8]; 
    }
    fclose($file);
}
$nextId = $lastId + 1;

// CSV row (with ID)
$row = array($eventName, $formattedDate, "noLink", $USParticipant, $participant2, $country, $eventType, $title,$nextId);

// Append row to CSV file
$file = fopen($filePath, 'a');
fputcsv($file, $row);
fclose($file);

echo "Data added to CSV successfully.";
?>

