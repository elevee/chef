require('dotenv').config();
// var fs = require('fs');

const credentials = require("./config.json");

// console.log("creds: ", creds);
// var credentials = {
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: 'us-east-1'
// };
// console.log("credentials", creds);
// console.log("accessKeys identical?", credentials.accessKeyId === creds.accessKeyId);
// console.log("secretKeys identical?", credentials.secretAccessKeyId === creds.secretAccessKeyId);

var dynasty = require('dynasty')(credentials), // Set up Dynasty with the AWS credentials
	recipes = dynasty.table('Recipes'); // Get the Dynasty recipe table object

// console.log("recipestable: ", recipes);

// Fire off the query, putting its result in the promise
// var promise = recipesTable.find('Citrus Glaze');

// Add a promise success handler for when the call returns
// promise.then(function(record){
// 	console.log(record.ingredients);
// });

recipes.find("Citrus Glaze")
	.then(function(resp){
		console.log(resp);
		console.log(resp.Name);
		// console.log(resp[]);
	});

// or use a simple callback function instead of promise
// recipes.find("Citrus Glaze", function(recipe){
// 	console.log(recipe);
// 	console.log(recipe.ingredients);
// });
