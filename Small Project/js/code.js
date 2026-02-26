// Project header comments (updated)
// Purpose: Client-side contact manager (auth, contacts, UI helpers)
// NOTE: Only comments were updated — code logic unchanged.

const urlBase = 'http://164.90.128.245/LAMPAPI';
const extension = 'php';

let userId = 0;
let firstName = "";
let lastName = "";
let ids = [];

/* Auth helpers (login/signup) */
function doLogin()
{
	userId = 0;
	firstName = "";
	lastName = "";

	let login = document.getElementById("loginName").value;
	let password = document.getElementById("loginPassword").value;

	if (!validLoginForm(login, password)) {
		document.getElementById("loginResult").innerHTML = "invalid username or password";
		return;
	}
	
	var hash = md5(password);
	
	document.getElementById("loginResult").innerHTML = "";

	let tmp = {login:login, password:hash};
	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/Login.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse(xhr.responseText);
				userId = jsonObject.id;

				if (userId < 1) {
					document.getElementById("loginResult").innerHTML = "User/Password combination incorrect";
					return;
				}

				firstName = jsonObject.firstName;
				lastName = jsonObject.lastName;

				saveCookie();
				window.location.href = "contacts.html";
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err) {
		document.getElementById("loginResult").innerHTML = err.message;
	}
}
function doSignup()
{
	firstName = document.getElementById("firstName").value;
	lastName  = document.getElementById("lastName").value;

	let username = document.getElementById("username").value;
	let password = document.getElementById("password").value;

	if (!validSignUpForm(firstName, lastName, username, password)) {
		document.getElementById("signupResult").innerHTML = "Invalid signup information";
		document.getElementById("signupResult").style.color = "#d32f2f";
		return;
	}

	var hash = md5(password);

	document.getElementById("signupResult").innerHTML = "";

	let tmp = {
		firstName: firstName,
		lastName: lastName,
		login: username,
		password: hash
	};

	let jsonPayload = JSON.stringify(tmp);

	let url = urlBase + '/SignUp.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {
		xhr.onreadystatechange = function () {

			if (this.readyState != 4) {
				return;
			}

			if (this.status == 409) {
				//Account already exists message
				document.getElementById("signupResult").innerHTML = "Account already exists";
				document.getElementById("signupResult").style.color = "#d32f2f";
				return;
			}

			if (this.status == 200) {

				let jsonObject = JSON.parse(xhr.responseText);
				
				// Get the user ID from your response format
				if(jsonObject.results && jsonObject.results.length > 0) {
					userId = parseInt(jsonObject.results[0].id);
				}
				
				//  Account created message
				document.getElementById("signupResult").innerHTML = "Account created successfully!";
				document.getElementById("signupResult").style.color = "#4CAF50";
				
				saveCookie();
				
				// Redirect after short delay
				setTimeout(function() {
					window.location.href = "contacts.html";
				}, 1500);
			}
			else {
				// Generic error message
				document.getElementById("signupResult").innerHTML = "Signup failed. Please try again.";
				document.getElementById("signupResult").style.color = "#d32f2f";
			}
		};

		xhr.send(jsonPayload);
	} catch (err) {
		document.getElementById("signupResult").innerHTML = err.message;
		document.getElementById("signupResult").style.color = "#d32f2f";
	}
}
/* Cookie helper functions */

function saveCookie()
{
	let minutes = 20;
	let date = new Date();
	date.setTime(date.getTime() + (minutes*60*1000));
	document.cookie = "firstName=" + firstName + ",lastName=" + lastName + ",userId=" + userId + ";expires=" + date.toGMTString();
}

function readCookie()
{
	userId = -1;
	let data = document.cookie;
	let splits = data.split(",");

	for(var i = 0; i < splits.length; i++) {
		let thisOne = splits[i].trim();
		let tokens = thisOne.split("=");

		if(tokens[0] == "firstName") {
			firstName = tokens[1];
		}
		else if(tokens[0] == "lastName") {
			lastName = tokens[1];
		}
		else if(tokens[0] == "userId") {
			userId = parseInt(tokens[1].trim());
		}
	}

	if(userId < 0) {
		window.location.href = "login.html";
	}
	else {
		let logoutBtn = document.getElementById("logoutBtn");
		if(logoutBtn) logoutBtn.style.display = "block";
		
		let logoutNavBtn = document.getElementById("logoutNavBtn");
		if(logoutNavBtn) logoutNavBtn.style.display = "block";

		 displayUserName();
	}
}

function doLogout()
{
	userId = 0;
	firstName = "";
	lastName = "";
	document.cookie = "firstName= ; expires = Thu, 01 Jan 1970 00:00:00 GMT";
	window.location.href = "Home.html";
}
/* Display current user's name in the UI */

function displayUserName() {
    // Get the userName span element
    let userNameSpan = document.getElementById("userName");
    
    if (userNameSpan && firstName) {
        // Display first name and last name
        userNameSpan.textContent = firstName + " " + lastName;
    }
}

/* Contact operations: add, search, load, edit, delete */

function addContact()
{
	let firstname = document.getElementById("contactTextFirst").value;
	let lastname = document.getElementById("contactTextLast").value;
	let phonenumber = document.getElementById("contactTextNumber").value;
	let emailaddress = document.getElementById("contactTextEmail").value;

	if (!validAddContact(firstname, lastname, phonenumber, emailaddress)) {
		alert("Please fill in all fields with valid information");
		return;
	}

	let tmp = {firstName:firstname, lastName:lastname, phoneNumber:phonenumber, emailAddress:emailaddress, userId:userId};
	let jsonPayload = JSON.stringify(tmp);
	
	let url = urlBase + '/AddContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {
		xhr.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				console.log("Contact has been added");
				document.getElementById("addMe").reset();
				loadContacts();
				showContacts();
			}
		};
		xhr.send(jsonPayload);
	}
	catch(err) {
		console.log(err.message);
	}
}

function searchContacts()
{
	const searchValue = document.getElementById("searchText").value.trim();
	
	let tmp = {
		search: searchValue,
		userId: userId
	};

	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/SearchContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse(xhr.responseText);

				if (jsonObject.error && jsonObject.error !== "" && jsonObject.error !== "No Records Found") {
					console.log(jsonObject.error);
					return;
				}

				let text = "<table>";

				if (jsonObject.results && jsonObject.results.length > 0) {
					for (let i = 0; i < jsonObject.results.length; i++) {
						ids[i] = jsonObject.results[i].ID;
						text += "<tr id='row" + i + "'>";
						text += "<td id='first_Name" + i + "'><span>" + jsonObject.results[i].FirstName + "</span></td>";
						text += "<td id='last_Name" + i + "'><span>" + jsonObject.results[i].LastName + "</span></td>";
						text += "<td id='email" + i + "'><span>" + jsonObject.results[i].EmailAddress + "</span></td>";
						text += "<td id='phone" + i + "'><span>" + jsonObject.results[i].PhoneNumber + "</span></td>";
						text += "<td>";
						text += "<button type='button' id='edit_button" + i + "' class='w3-button w3-lime' onclick='edit_row(" + i + ")'>✏️</button>";
						text += "<button type='button' id='save_button" + i + "' class='w3-button w3-lime' onclick='save_row(" + i + ")' style='display: none'>💾</button>";
						text += "<button type='button' onclick='delete_row(" + i + ")' class='w3-button w3-amber'>🗑️</button>";
						text += "</td>";
						text += "</tr>";
					}
				} else {
					// ✅ FIXED: Use empty-state class for red centered text
					text += "<tr><td colspan='5' class='empty-state'>No contacts found matching '" + searchValue + "'</td></tr>";
				}

				text += "</table>";
				document.getElementById("tbody").innerHTML = text;
			}
		};
		xhr.send(jsonPayload);
	} catch (err) {
		console.log(err.message);
	}
}

function loadContacts()
{
	console.log("=== loadContacts Debug ===");
	console.log("Current userId:", userId);
	console.log("userId type:", typeof userId);
	
	let tmp = {search:"", userId:userId};
	let jsonPayload = JSON.stringify(tmp);
	
	console.log("Payload being sent:", jsonPayload);
	
	let url = urlBase + '/SearchContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				let jsonObject = JSON.parse(xhr.responseText);
				
				console.log("Response from server:", jsonObject);

				if (jsonObject.error && jsonObject.error !== "" && jsonObject.error !== "No Records Found") {
					console.log(jsonObject.error);
					return;
				}

				let text = "<table>";

				if (jsonObject.results && jsonObject.results.length > 0) {
					console.log("Number of contacts returned:", jsonObject.results.length);
					
					for (let i = 0; i < jsonObject.results.length; i++) {
						console.log("Contact " + i + ":", jsonObject.results[i].FirstName, jsonObject.results[i].LastName, "UserID:", jsonObject.results[i].UserID);
						
						ids[i] = jsonObject.results[i].ID;
						text += "<tr id='row" + i + "'>";
						text += "<td id='first_Name" + i + "'><span>" + jsonObject.results[i].FirstName + "</span></td>";
						text += "<td id='last_Name" + i + "'><span>" + jsonObject.results[i].LastName + "</span></td>";
						text += "<td id='email" + i + "'><span>" + jsonObject.results[i].EmailAddress + "</span></td>";
						text += "<td id='phone" + i + "'><span>" + jsonObject.results[i].PhoneNumber + "</span></td>";
						text += "<td>";
						text += "<button type='button' id='edit_button" + i + "' class='w3-button w3-lime' onclick='edit_row(" + i + ")'>✏️</button>";
						text += "<button type='button' id='save_button" + i + "' class='w3-button w3-lime' onclick='save_row(" + i + ")' style='display: none'>💾</button>";
						text += "<button type='button' onclick='delete_row(" + i + ")' class='w3-button w3-amber'>🗑️</button>";
						text += "</td>";
						text += "</tr>";
					}
				} else {
					// Use empty-state class for red centered text
					text += "<tr><td colspan='5' class='empty-state'>No contacts yet. Click 'Add Contact' to get started!</td></tr>";
				}

				text += "</table>";
				document.getElementById("tbody").innerHTML = text;
			}
		};
		xhr.send(jsonPayload);
	} catch (err) {
		console.log(err.message);
	}
}

function edit_row(id)
{
	document.getElementById("edit_button" + id).style.display = "none";
	document.getElementById("save_button" + id).style.display = "inline-block";

	var firstNameI = document.getElementById("first_Name" + id);
	var lastNameI = document.getElementById("last_Name" + id);
	var email = document.getElementById("email" + id);
	var phone = document.getElementById("phone" + id);

	var namef_data = firstNameI.innerText;
	var namel_data = lastNameI.innerText;
	var email_data = email.innerText;
	var phone_data = phone.innerText;

	firstNameI.innerHTML = "<input type='text' id='namef_text" + id + "' value='" + namef_data + "'>";
	lastNameI.innerHTML = "<input type='text' id='namel_text" + id + "' value='" + namel_data + "'>";
	email.innerHTML = "<input type='text' id='email_text" + id + "' value='" + email_data + "'>";
	phone.innerHTML = "<input type='text' id='phone_text" + id + "' value='" + phone_data + "'>";
}

function save_row(no)
{
	var namef_val = document.getElementById("namef_text" + no).value;
	var namel_val = document.getElementById("namel_text" + no).value;
	var email_val = document.getElementById("email_text" + no).value;
	var phone_val = document.getElementById("phone_text" + no).value;
	var id_val = ids[no];

	document.getElementById("first_Name" + no).innerHTML = namef_val;
	document.getElementById("last_Name" + no).innerHTML = namel_val;
	document.getElementById("email" + no).innerHTML = email_val;
	document.getElementById("phone" + no).innerHTML = phone_val;

	document.getElementById("edit_button" + no).style.display = "inline-block";
	document.getElementById("save_button" + no).style.display = "none";

	let tmp = {
		phoneNumber: phone_val,
		emailAddress: email_val,
		newFirstName: namef_val,
		newLastName: namel_val,
		id: id_val,
		userId: userId
	};

	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/UpdateContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				console.log("Contact has been updated");
				loadContacts();
			}
		};
		xhr.send(jsonPayload);
	} catch (err) {
		console.log(err.message);
	}
}

// Global variable to store delete info
let pendingDelete = null;

function delete_row(no)
{
	var namef_val = document.getElementById("first_Name" + no).innerText;
	var namel_val = document.getElementById("last_Name" + no).innerText;

	// Store delete info
	pendingDelete = {
		firstName: namef_val,
		lastName: namel_val,
		rowNumber: no
	};

	// Show custom modal
	document.getElementById("deleteContactName").textContent = namef_val + " " + namel_val;
	document.getElementById("deleteModal").style.display = "flex";
}

function confirmDelete()
{
	if (!pendingDelete) return;

	let tmp = {
		firstName: pendingDelete.firstName,
		lastName: pendingDelete.lastName,
		userId: userId
	};

	let jsonPayload = JSON.stringify(tmp);
	let url = urlBase + '/DeleteContacts.' + extension;

	let xhr = new XMLHttpRequest();
	xhr.open("POST", url, true);
	xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");

	try {
		xhr.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				console.log("Contact has been deleted");
				
				// Hide modal
				cancelDelete();
				
				// Reload contacts
				loadContacts();
			}
		};
		xhr.send(jsonPayload);
	} catch (err) {
		console.log(err.message);
		alert('❌ Error: Could not delete contact. Please try again.');
		cancelDelete();
	}
}

function cancelDelete()
{
	// Hide modal and clear pending delete
	document.getElementById("deleteModal").style.display = "none";
	pendingDelete = null;
}
/* UI toggles for switching views and tabs */

function showContacts()
{
	document.getElementById("contactsView").style.display = "block";
	document.getElementById("addContactView").style.display = "none";
	document.getElementById("contactsTab").classList.add("active");
	document.getElementById("addTab").classList.remove("active");
}

function showAddForm()
{
	document.getElementById("contactsView").style.display = "none";
	document.getElementById("addContactView").style.display = "block";
	document.getElementById("contactsTab").classList.remove("active");
	document.getElementById("addTab").classList.add("active");
}

/* Input validation utilities (forms) */

function validLoginForm(logName, logPass)
{
	if (logName == "" || logPass == "") {
		return false;
	}

	var nameRegex = /^(?=.*[a-zA-Z])[a-zA-Z0-9-_]{3,18}$/;
	if (!nameRegex.test(logName)) {
		return false;
	}

	var passRegex = /^(?=.*\d)(?=.*[A-Za-z])(?=.*[!@#$%^&*]).{8,32}$/;
	if (!passRegex.test(logPass)) {
		return false;
	}

	return true;
}

function validSignUpForm(fName, lName, user, pass)
{
	if (fName == "" || lName == "" || user == "" || pass == "") {
		return false;
	}

	var userRegex = /^(?=.*[a-zA-Z])([a-zA-Z0-9-_]).{3,18}$/;
	if (!userRegex.test(user)) {
		return false;
	}

	var passRegex = /^(?=.*\d)(?=.*[A-Za-z])(?=.*[!@#$%^&*]).{8,32}/;
	if (!passRegex.test(pass)) {
		return false;
	}

	return true;
}

function validAddContact(firstName, lastName, phone, email)
{
	if (firstName == "" || lastName == "" || phone == "" || email == "") {
		return false;
	}

	var phoneRegex = /^[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4}$/;
	if (!phoneRegex.test(phone)) {
		return false;
	}

	var emailRegex = /^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]{2,5})$/;
	if (!emailRegex.test(email)) {
		return false;
	}

	return true;
}

/* Live feedback for username and password rules */

function validateUsername()
{
	let username = document.getElementById("username").value;
	let feedback = document.getElementById("usernameFeedback");
	
	if(!feedback) return;
	
	let requirements = [];
	let isValid = true;
	
	if(username.length < 3 || username.length > 18) {
		requirements.push("❌ 3-18 characters");
		isValid = false;
	} else {
		requirements.push("✅ 3-18 characters");
	}
	
	if(!/[a-zA-Z]/.test(username)) {
		requirements.push("❌ At least one letter");
		isValid = false;
	} else {
		requirements.push("✅ At least one letter");
	}
	
	if(!/^[a-zA-Z0-9-_]+$/.test(username)) {
		requirements.push("❌ Only letters, numbers, - and _");
		isValid = false;
	} else {
		requirements.push("✅ Only letters, numbers, - and _");
	}
	
	feedback.innerHTML = requirements.join("<br>");
	feedback.style.color = isValid ? "#4CAF50" : "#ff6b6b";
}

function validatePassword()
{
	let password = document.getElementById("password").value;
	let feedback = document.getElementById("passwordFeedback");
	
	if(!feedback) return;
	
	let requirements = [];
	let isValid = true;
	
	if(password.length < 8 || password.length > 32) {
		requirements.push("❌ 8-32 characters");
		isValid = false;
	} else {
		requirements.push("✅ 8-32 characters");
	}
	
	if(!/[a-zA-Z]/.test(password)) {
		requirements.push("❌ At least one letter");
		isValid = false;
	} else {
		requirements.push("✅ At least one letter");
	}
	
	if(!/[0-9]/.test(password)) {
		requirements.push("❌ At least one number");
		isValid = false;
	} else {
		requirements.push("✅ At least one number");
	}
	
	if(!/[!@#$%^&*]/.test(password)) {
		requirements.push("❌ At least one special (!@#$%^&*)");
		isValid = false;
	} else {
		requirements.push("✅ At least one special (!@#$%^&*)");
	}
	
	feedback.innerHTML = requirements.join("<br>");
	feedback.style.color = isValid ? "#4CAF50" : "#ff6b6b";
}

/* Mobile navigation toggle and helpers */

function toggleNav() {
    const navLinks = document.getElementById('navLinks');
    if (navLinks) {
        navLinks.classList.toggle('show');
    }
}

// Close mobile menu when clicking outside
document.addEventListener('click', function(event) {
    const navLinks = document.getElementById('navLinks');
    const navToggle = document.querySelector('.nav-toggle');
    
    if (navLinks && navToggle) {
        const isClickInside = navToggle.contains(event.target) || navLinks.contains(event.target);
        
        if (!isClickInside && navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
        }
    }
});

// Close menu when a link is clicked
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-links a');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            const navLinksContainer = document.getElementById('navLinks');
            if (navLinksContainer && navLinksContainer.classList.contains('show')) {
                navLinksContainer.classList.remove('show');
            }
        });
    });
});