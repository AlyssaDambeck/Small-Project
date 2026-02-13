<?php
/* ============================================================
   Deep Dive - API: SignUp.php

   Creates a new user account.
   - Input JSON: { firstName, lastName, login, password }
   - Checks if Login is already taken
   - If available: inserts into Users and returns the new user id
   - If taken: sends 409 + error message
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
	$inData = getRequestInfo();

	// Fields coming from the signup form
	$firstName = $inData["firstName"];
	$lastName  = $inData["lastName"];
	$login     = $inData["login"];
	$password  = $inData["password"];

	// Connect to DB
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		// Check if username is already in use
		$sql = "SELECT * FROM Users WHERE Login=?";
		$stmt = $conn->prepare($sql);
		$stmt->bind_param("s", $login);
		$stmt->execute();

		$result = $stmt->get_result();
		$rows = mysqli_num_rows($result);

		// If no rows returned, username is free
		if ($rows == 0)
		{
			// Create the user
			$stmt = $conn->prepare("INSERT into Users (FirstName, LastName, Login, Password) VALUES(?,?,?,?)");
			$stmt->bind_param("ssss", $firstName, $lastName, $login, $password);
			$stmt->execute();

			// Grab newly created user ID
			$id = $conn->insert_id;

			$stmt->close();
			$conn->close();

			// Success
			http_response_code(200);

			// Build response body (kept same format as your code)
			$searchResults .= '{' . '"id": "' . $id . '' . '"}';
			returnWithInfo($searchResults);
		}
		else
		{
			// Username already exists
			http_response_code(409);
			returnWithError("Username taken");
		}
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

	function returnWithInfo($searchResults)
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson($retValue);
	}
?>