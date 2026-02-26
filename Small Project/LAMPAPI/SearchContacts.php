<?php
/* API endpoint - SearchContacts. Searches contacts by name. */

header('Access-Control-Allow-Origin: http://deepdive26.xyz');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

$inData = getRequestInfo();

$searchResults = "";
$searchCount = 0;

$conn = new mysqli("localhost", "TheBeast", "WeLoveCOP4331", "COP4331");

if ($conn->connect_error)
{
	returnWithError($conn->connect_error);
}
else
{
	$searchTerm = trim($inData["search"]);
	$searchParam = "%" . $searchTerm . "%";
	
	// Search by NAME ONLY: FirstName, LastName, or Full Name
	$stmt = $conn->prepare(
		"SELECT * FROM Contacts 
		 WHERE UserID=? 
		 AND (
		     FirstName LIKE ? 
		     OR LastName LIKE ?
		     OR CONCAT(FirstName, ' ', LastName) LIKE ?
		 )
		 ORDER BY FirstName ASC, LastName ASC"
	);
	
	$stmt->bind_param("isss", 
		$inData["userId"], 
		$searchParam, 
		$searchParam, 
		$searchParam
	);

	$stmt->execute();
	$result = $stmt->get_result();

	while ($row = $result->fetch_assoc())
	{
		if ($searchCount > 0)
		{
			$searchResults .= ",";
		}

		$searchCount++;

		$searchResults .= '{"FirstName" : "' . $row["FirstName"] .
		                  '", "LastName" : "' . $row["LastName"] .
		                  '", "PhoneNumber" : "' . $row["PhoneNumber"] .
		                  '", "EmailAddress" : "' . $row["EmailAddress"] .
		                  '", "UserID" : "' . $row["UserID"] .
		                  '", "ID" : "' . $row["ID"] . '"}';
	}

	if ($searchCount == 0)
	{
		returnWithError("No Records Found");
	}
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

function returnWithError($err)
{
	$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
	sendResultInfoAsJson($retValue);
}

function returnWithInfo($searchResults)
{
	$retValue = '{"results":[' . $searchResults . '],"error":""}';
	sendResultInfoAsJson($retValue);
}
?>