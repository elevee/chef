// require('dotenv').config();
// var fs = require('fs');

const credentials = require("./config.json");

var AWS = require('aws-sdk');
AWS.config.update({
  region: "us-east-1"
});
var DB 	= new AWS.DynamoDB.DocumentClient();

// console.log("creds: ", creds);
// var credentials = {
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: 'us-east-1'
// };
// console.log("credentials", creds);
// console.log("accessKeys identical?", credentials.accessKeyId === creds.accessKeyId);
// console.log("secretKeys identical?", credentials.secretAccessKeyId === creds.secretAccessKeyId);

// var dynasty = require('dynasty')(credentials), // Set up Dynasty with the AWS credentials
	// recipes = dynasty.table('Recipes'); // Get the Dynasty recipe table object

// var userId 	= "testUser123";

var searchTerm = "citrus_glaze";
// var searchTerm = "lime_and_cornmeal_cookies";
var table = "Recipes";

var initialUser = {
	_userId: "livan_hernandez",
	_currentRecipe: "undefined"
}

var cg = {
  "ingredients": [
    "1 1/3 cups powdered sugar",
    "2 large limes, zested",
    "3 tablespoons fresh lemon juice"
  ],
  "instructions": [
    "In a medium bowl, whisk together the powdered sugar, lime zest, and lemon juice until smooth.",
    "Spread about 1 teaspoon of the glaze onto each cookie leaving, a 1/4-inch border around the edge.",
    "Allow the glaze to harden for about 45 minutes before serving."
  ],
  "currentSection": "ingredients",
  "currentStep": 0,
  "displayName": "Citrus Glaze",
  "name": "citrus_glaze"
};

var cookies = {
  "ingredients": [
    "1/2 stick unsalted butter, at room temperature",
    "1 cup sugar",
    "3 large limes, zested",
    "1 egg, at room temperature",
    "3 tablespoons fresh lime juice (2 to 3 large limes)",
    "1/2 teaspoon pure vanilla extract",
    "1 1/2 cups rice flour, plus extra for dusting",
    "1/2 cup cornmeal",
    "1/2 teaspoon baking powder",
    "1/4 teaspoon fine sea salt"
  ],
  "instructions": [
    "Line a baking sheet with a silicone liner or parchment paper. Set aside.",
    "In a food processor, pulse together the butter, sugar, and lime zest until combined.",
    "Add the egg, lime juice, and vanilla.",
    "Process until smooth.",
    "Add the rice flour, cornmeal, baking powder, and salt. ",
    "Process until the mixture forms a dough.",
    "Place the dough on a lightly floured surface and knead for 20 seconds.",
    "Form the dough into a ball, wrap in plastic, and refrigerate for 20 minutes.",
    "Place an oven rack in the center of the oven.",
    "Preheat the oven to 350 degrees F.",
    "Lightly flour a work surface.",
    "Cut the dough in half and roll out each piece into a 9-inch diameter circle, about 1/4-inch thick.",
    "Using a 3-inch round cookie cutter, cut the dough into 10 circles and arrange on the prepared baking sheet.",
    "Gather any scraps of dough, knead together, and roll out to 1/4-inch thick.",
    "Cut out 2 additional rounds of dough and place on the baking sheet.",
    "Bake until light golden around the edges, 15 to 20 minutes.",
    "Cool for 10 minutes and transfer to a cooling rack to cool completely, about 15 minutes."
		],
	  "currentSection": "ingredients",
  "currentStep": 0,
  "displayName": "Lime and Cornmeal Cookies",
  "name": "lime_and_cornmeal_cookies"
}; 

// -------------------------------------------------------------------------------
// Need to be able to find:

// What recipe fools are on
// recipes.find(userId)
// 	.then(function(resp){
// 		console.log(resp[resp["_currentRecipe"]]);
// 	});

// What step of the recipe they're on
// recipes.find(userId)
// 	.then(function(resp){
// 		console.log(resp[resp["_currentRecipe"]].currentStep);
// 	});

// Repeat ingredient?
// recipes.find(userId)
// 	.then(function(resp){
// 		var r = resp[resp["_currentRecipe"]];
// 		console.log(r.ingredients[r.currentStep]);
// 	});

// How much sugar?
// recipes.find(userId)
// 	.then(function(resp){
// 		var r = resp[resp["_currentRecipe"]];
// 		var ingredients = r.ingredients;
// 		var query = "sugar";
// 		ingredients.forEach(function(ingredient, i){
// 			if(ingredient.indexOf(query) > -1){
// 				console.log(ingredient);	
// 			}
// 		});
// 	});

// TO ADD A RECIPE
// var params = {
//   TableName: table,
//   Key: { "_userId" : userId },
//   UpdateExpression: 'set #a = :r',
//   // ConditionExpression: '#a < :MAX',
//   ExpressionAttributeNames: {'#a': searchTerm},
//   ExpressionAttributeValues: {
//     ':r' : cookies
//   },
//   ReturnValues:"UPDATED_NEW"
// };
// // console.log(params);

// DB.update(params, function(err, data) {
//    if (err) console.log(err);
//    else console.log(data);
// });

// -------------------------------------------------------------------------------

// get a user record
// var params = {
//     TableName: table,
//     Key:{
//         "_userId": userId
//     }
// };

// DB.get(params, function(err, data) {
//     if (err) {
//         console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//         console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
//     }
// });

// get a recipe
// var params = {
//     TableName: table,
//     Key:{
//         "_userId": "dink" //userId
//     }
// };
// DB.get(params, function(err, data) {
//     if (err) {
//         console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
//     } else {
//         var r = JSON.stringify(data,null,2);
//         console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
//         console.log(`Data exists? ${JSON.stringify(data["Item"])}`);
//         // console.log(`Returned ${data} record`);
//     }
// });


// edit a step inside a recipe (currentStep)
// var newStep = 1;

// var params = {
//   TableName: table,
//   Key: { "_userId" : userId },
//   UpdateExpression: 'set #a.currentStep = :s',
//   // ConditionExpression: '#a < :MAX',
//   ExpressionAttributeNames: {'#a': searchTerm},
//   ExpressionAttributeValues: {
//     ':s' : newStep
//   },
//   ReturnValues:"UPDATED_NEW"
// };

// console.log(params);

// DB.update(params, function(err, data) {
//    if (err) console.log(err);
//    else console.log(data);
// });

// edit multiple attributes (currentSection, currentStep)
var newStep = 2;
var newSection = "ingredients";

var params = {
  TableName: table,
  Key: { "_userId" : userId },
  UpdateExpression: 'set #c = :rec, #a.currentSection = :x, #a.currentStep = :s',
ExpressionAttributeNames: {
    '#a': searchTerm,
    '#c': "_currentRecipe"
},
ExpressionAttributeValues: {
    ':rec': searchTerm,
    ':x' : newSection,
    ':s' : newStep
},
  ReturnValues:"ALL_NEW"
};

// var params = {
//   TableName: table,
//   Key: { "_userId" : userId },
//   UpdateExpression: 'set #c = :u',
// 	ExpressionAttributeNames: {
// 	    // '#a': searchTerm,
// 	    '#c': "_currentRecipe"
// 	},
// ExpressionAttributeValues: {
//     ':u': "undefined"
// },
//   ReturnValues:"UPDATED_NEW"
// };

// console.log(params);

DB.update(params, function(err, data) {
   if (err) console.log(err);
   else console.log(data);
});

// var newUser = "the_juice";
// var params = {
//   TableName: table,
//   Item: initialUser
// };

// DB.put(params, function(err, data) {
//   if (err) console.log(err);
//   else console.log(data);
// });

// var params = {
//     "TableName": table,
//     "Key": key,
    
//     // A string that identifies one or more attributes to retrieve from the table. 
//     // These attributes can include scalars, sets, or elements of a JSON document. 
//     // The attributes in the expression must be separated by commas.
//     // If no attribute names are specified, then all attributes will be returned. 
//     // If any of the requested attributes are not found, they will not appear in the result.
//     // "ProjectionExpression":"LastPostDateTime, Message, Tags", 

//     "ConsistentRead": true,
//     "ReturnConsumedCapacity": "TOTAL"
// }

