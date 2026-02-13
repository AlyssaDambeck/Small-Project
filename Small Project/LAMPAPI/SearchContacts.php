<?php
/* ============================================================
   Deep Dive - API: SearchContacts.php

   Returns a user's contacts that match a search string.
   - Reads JSON: { search: "...", userId: ... }
   - Searches FirstName OR LastName (LIKE %search%)
   - Returns results array or "No Records Found"
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

	$searchResults = "";
	$searchCount = 0;

	// Connect to DB
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		// Prepared statement for searching by first/last name for this user
		$stmt = $conn->prepare("SELECT * FROM Contacts WHERE (FirstName like ? OR LastName like?) AND UserID=?");

		// Wrap search term for LIKE query
		$colorName = "%" . $inData["search"] . "%";

		// Bind params (kept exactly as you had it)
		$stmt->bind_param("sss", $colorName, $colorName, $inData["userId"]);
		$stmt->execute();

		$result = $stmt->get_result();

		// Build JSON results list manually (comma separated objects)
		while ($row = $result->fetch_assoc())
		{
			if ($searchCount > 0)
			{
				$searchResults .= ",";
			}

			$searchCount++;

			// "." means string concatenation in PHP
			$searchResults .= '{"FirstName" : "' . $row["FirstName"] .
			                  '", "LastName" : "' . $row["LastName"] .
			                  '", "PhoneNumber" : "' . $row["PhoneNumber"] .
			                  '", "EmailAddress" : "' . $row["EmailAddress"] .
			                  '", "UserID" : "' . $row["UserID"] .
			                  '", "ID" : "' . $row["ID"] . '"}';
		}

		// No matches
		if ($searchCount == 0)
		{
			returnWithError("No Records Found");
		}
		// Matches found
		else
		{
			returnWithInfo($searchResults);
		}

		$stmt->close();
		$conn->close();
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

	// Error format (same style as Login.php)
	function returnWithError($err)
	{
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}

	// Success response: results array
	function returnWithInfo($searchResults)
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson($retValue);
	}
?>