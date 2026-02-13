<?php
/* ============================================================
	Deep Dive - API: UpdateContacts.php
	============================================================ */

// ✅ CORS HEADERS
header('Access-Control-Allow-Origin: http://deepdive26.xyz');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$inData = getRequestInfo();

$phoneNumber = $inData["phoneNumber"];
$emailAddress = $inData["emailAddress"];
$newFirst = $inData["newFirstName"];
$newLast = $inData["newLastName"];
$id = $inData["id"];
$userId = $inData["userId"]; // ← ADD THIS LINE

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

if ($conn->connect_error)
{
	returnWithError($conn->connect_error);
}
else
{
	// ← IMPORTANT: Add UserID check to WHERE clause
	$stmt = $conn->prepare("UPDATE Contacts SET FirstName = ?, LastName=?, PhoneNumber= ?, EmailAddress= ? WHERE ID= ? AND UserID= ?");
	$stmt->bind_param("ssssii", $newFirst, $newLast, $phoneNumber, $emailAddress, $id, $userId);
	$stmt->execute();
	
	// Check if any rows were actually updated
	if ($stmt->affected_rows > 0)
	{
		returnWithError(""); // Success
	}
	else
	{
		returnWithError("Contact not found or unauthorized");
	}

	$stmt->close();
	$conn->close();
}

function getRequestInfo()
{
	return json_decode(file_get_contents('php://input'), true);
}

function sendResultInfoAsJson($obj)
{
	header('Content-type: application/json');
	echo $obj;
}

function returnWithError($err)
{
	$retValue = '{"error":"' . $err . '"}';
	sendResultInfoAsJson($retValue);
}
?>