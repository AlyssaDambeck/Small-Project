<?php
	/* ============================================================
	   Deep Dive - API: DeleteContacts.php

	   Deletes a contact for the current user.
	   - Reads JSON from request body (firstName, lastName, userId)
	   - Deletes matching row from Contacts table
	   - Returns {"error":""} on success
	   ============================================================ */

// ✅ ADD THESE CORS HEADERS AT THE TOP
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

	// ... rest of your existing code
	// Read JSON payload from frontend
	$inData = getRequestInfo();

	// Values used to find the contact row to delete
	$userId    = $inData["userId"];
	$firstName = $inData["firstName"];
	$lastName  = $inData["lastName"];

	// Connect to DB
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

	// Connection check
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		// Prepared statement = safer delete
		$stmt = $conn->prepare("DELETE FROM Contacts WHERE FirstName = ? AND LastName = ? AND UserID = ?");
		$stmt->bind_param("ssi", $firstName, $lastName, $userId);

		// Run delete
		$stmt->execute();

		// Clean up
		$stmt->close();
		$conn->close();

		// Empty error string means success (matches your other APIs)
		returnWithError("");
	}

	/* -------------------- helper functions -------------------- */

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