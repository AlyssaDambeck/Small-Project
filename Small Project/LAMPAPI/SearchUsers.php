<?php
/* ============================================================
   Deep Dive - API: SearchUsers.php

   Checks if a username (Login) already exists.
   - Input JSON: { login: "..." }
   - If username is NOT found → returns Error:"" (available)
   - If username IS found → returns Error:"Username has been taken"
   ============================================================ */

	$inData = getRequestInfo();

	$searchResults = "";  // not used, but leaving as-is
	$searchCount = 0;

	// Connect to DB
	$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

	if ($conn->connect_error)
	{
		returnWithError($conn->connect_error);
	}
	else
	{
		// Look for an exact match on Login
		$stmt = $conn->prepare("SELECT * FROM Users WHERE Login= ?");
		$stmt->bind_param("s", $inData["login"]);
		$stmt->execute();

		$result = $stmt->get_result();

		// Count rows returned (0 = available, >0 = taken)
		while ($row = $result->fetch_assoc())
		{
			$searchCount++;
		}

		if ($searchCount == 0)
		{
			// Username free
			returnWithInfo("");
		}
		else
		{
			// Username already exists
			returnWithError("Username has been taken");
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

	// This API uses "Error" (capital E) in the response
	function returnWithError($err)
	{
		$retValue = '{"Error":"' . $err . '"}';
		sendResultInfoAsJson($retValue);
	}

	// Same key name, but empty string means "no error"
	function returnWithInfo($info)
	{
		$retValue = '{"Error": "' . $info . '"}';
		sendResultInfoAsJson($retValue);
	}
?>