<?php
// 1. Receive updated data
$updatedData = $_POST; 

// 2. Load CSV
$csvData = array_map('str_getcsv', file('/home/Oman/public_html/data/Events.csv'));

// 3. Find the row to update
$rowToUpdateIndex = null;
$idToUpdate = $updatedData['ID']; // Extract ID 
// unset($updatedData['ID']); // Remove ID from update data

for ($i = 0; $i < count($csvData); $i++) {
    if ($csvData[$i][8] === $idToUpdate) { // Assuming 'ID' is in the 9th column 
        $rowToUpdateIndex = $i;
        break;
    }
}

// 4. Update data (only if a row is found)
if ($rowToUpdateIndex !== null) {
    $csvData[$rowToUpdateIndex] = array_values($updatedData); // Replace row with new data

    // 5. Save updated CSV
    $fp = fopen('/home/Oman/public_html/data/Events.csv', 'w');
    foreach ($csvData as $row) {
        fputcsv($fp, $row);
    }
    fclose($fp);

    // 6. Send success response
    echo "Data updated successfully!"; 
} else {
    // Handle the case where the ID is not found
    http_response_code(404); // Optional: Send a 'Not Found' status code
    echo "Error: Row with ID not found!"; 
}
?>
