// Require the Realtime-Storage API.
var Realtime = require("realtime-storage");
var storageRef;

// First we create a Storage Reference
Realtime.Storage.create({
	applicationKey: "myApplicationKey",
	// Must use privateKey to authenticate tokens and manage roles.
	privateKey: "myPrivateKey"
}, function(sr) {
	storageRef = sr;
	createRole();
}, function(error) {
	console.log("Something is wrong. Cause: ", error);
});

var createRole = function() {
	// Assuming that we dont have any role created, we are creating a new role.
	// This new role will allow users to list only "myTable". Other table related operations are denied by default.

	// This role allow users to read all items of the table "myTable".
	// We will also allow the operations create, read, update and delete for the item with the following key: { myPrimaryKey: "mykey1", mySecondaryKey: "mykey2" }

	storageRef.setRole("employee", {
		database: {
			// Here we set the policie that allow users to list the table "myTable".
			listTables: ["myTable"]
		},
		tables: {
			myTable: {
				// Here we set the policie to just allow read items from the table "myTable"
				allow: "R",
				// Here we allow the operations create, read, update and delete for the item with the following key: { myPrimaryKey: "mykey1", mySecondaryKey: "mykey2" }
				items: [{
					key: {
						myPrimaryKey: "mykey1",
						mySecondaryKey: "mykey2"
					},
					allow: "CRUD"
				}]
			}
		}
	}, function(success) {
		if (success) {
			// Everything is ok with the role creation.
			// Now we are goin to authenticate a token that will use the role created and use additional policies.
			authenticate();
		}
	}, function(error) {
		console.log(error);
	});
};

var S4 = function() {
	return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
};

var generateToken = function() {
	return (S4() + S4() + "-" + S4() + "-" + S4() + "-" + S4() + "-" + S4() + S4() + S4());
};

var authenticate = function() {

	var myToken = generateToken();

	storageRef.authenticate({
		// The token generated
		authenticationToken: myToken,
		// The token is valid for 3600 seconds
		timeout: 3600,
		// The token will have the policies of an employee
		roles: ["employee"],
		// Additional policies to override the role "employee"
		policies: {
			database: {
				// Allow update table.
				updateTable: ["myTable"]
			},
			tables: {
				myTable: {
					// Here we set the policie to also allow update items.
					allow: "U"
				}
			}
		}
	}, function(success) {
		if (success) {
			console.log("Token authenticated.");
		}
	}, function(error) {
		console.log(error);
	});
};