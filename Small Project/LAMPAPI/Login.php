<?php
/* ============================================================
   Deep Dive - API: Login.php

   Checks login credentials and returns user info if valid.
   - Reads JSON login + password from request body
   - Looks up user in Users table
   - Returns id + first/last name on success
   - Returns error JSON if not found
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

	// ... rest of your existing code<?php
/* ============================================================
   Deep Dive - API: Login.php
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
	// Get JSON body from frontend login request
	$inData = getRequestInfo();

	// Default return values (used if login fails)
	$id = 0;
	$firstName = "";
	$lastName = "";

	// Connect to database
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

	if ($conn->connect_error)
	{
		// DB connection failed
		returnWithError($conn->connect_error);
	}
	else
	{
		// Prepared statement to safely check login + password
		$stmt = $conn->prepare(
			"SELECT ID,FirstName,LastName FROM Users WHERE (Login=? AND Password=?)"
		);
		$stmt->bind_param("ss", $inData["login"], $inData["password"]);
		$stmt->execute();

		$result = $stmt->get_result();

		// If a matching user row is found → success
		if ($row = $result->fetch_assoc())
		{
			returnWithInfo($row['FirstName'], $row['LastName'], $row['ID']);
		}
		else
		{
			// No matching login/password
			returnWithError("No Records Found");
		}

		// Cleanup
		$stmt->close();
		$conn->close();
	}

	/* -------------------- helper functions -------------------- */

	// Reads raw JSON input and converts to associative array
	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	// Sends JSON back to frontend
	function sendResultInfoAsJson($obj)
	{
		header('Content-type: application/json');
		echo $obj;
	}

	// Standard error response for login
	function returnWithError($err)
	{
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}

	// Success response with user info
	function returnWithInfo($firstName, $lastName, $id)
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName .
		            '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson($retValue);
	}

?>