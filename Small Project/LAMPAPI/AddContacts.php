<?php
	/* ============================================================
	   Deep Dive - API: AddContacts.php

	   Adds a new contact for the logged-in user.
	   - Reads JSON from the request body
	   - Inserts into Contacts table (prepared statement)
	   - Returns {"error":""} on success or {"error":"..."} on failure
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
	// Grab incoming JSON from the frontend (AddContact)
	$inData = getRequestInfo();

	// Pull out fields from the request payload
	$firstName     = $inData["firstName"];
	$lastName      = $inData["lastName"];
	$phoneNumber   = $inData["phoneNumber"];
	$emailAddress  = $inData["emailAddress"];
	$userId        = $inData["userId"];

	// Connect to MySQL (local DB on the droplet)
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

	// If connection fails, return the error as JSON
	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		// Prepared statement prevents SQL injection
		$stmt = $conn->prepare(
			"INSERT into Contacts (FirstName,LastName,PhoneNumber,EmailAddress, UserID) VALUES(?,?,?,?,?)"
		);

		// s = string, i = integer (UserID)
		$stmt->bind_param("ssssi", $firstName, $lastName, $phoneNumber, $emailAddress, $userId);

		// Run the insert
		$stmt->execute();

		// Clean up
		$stmt->close();
		$conn->close();

		// Match the API pattern: empty error string means success
		returnWithError("");
	}

	/* -------------------- helper functions -------------------- */

	// Reads raw JSON request body and converts it into an associative array
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	// Sends JSON back to the frontend with correct header
	function sendResultInfoAsJson($obj)
	{
		header('Content-type: application/json');
		echo $obj;
	}

	// Standard error response format for this API
	function returnWithError($err)
	{
		$retValue = '{"error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}
?>