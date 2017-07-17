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
	// recipes = dynasty.table('Recipes'); // Get the Dynasty recipe table object
	recipes = dynasty.table('Recipes'), // Get the Dynasty recipe table object
	userId 	= "testUser123";

// console.log("recipestable: ", recipes);

// Fire off the query, putting its result in the promise
// var promise = recipesTable.find('Citrus Glaze');

// Add a promise success handler for when the call returns
// promise.then(function(record){
// 	console.log(record.ingredients);
// });

// recipes.find("Citrus Glaze")
// 	.then(function(resp){
// 		console.log(resp);
// 		console.log(resp.Name);
// 		// console.log(resp[]);
// 	});

var initialUser = {
	_userId: "charles",
	_currentRecipe: "undefined"
}

var cg = {
	"citrus_glaze": {
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
	  "currentStep": 0,
	  "displayName": "Citrus Glaze"
	}
};

var cookies = {
    "lime_and_cornmeal_cookies": {
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
      "currentStep": 0,
      "displayName": "Lime and Cornmeal Cookies"
    }
  }; 

// -------------------------------------------------------------------------------
// Need to be able to find:

// What recipe fools are on
// recipes.find("testUser123")
// 	.then(function(resp){
// 		console.log(resp[resp["_currentRecipe"]]);
// 	});

// What step of the recipe they're on
// recipes.find("testUser123")
// 	.then(function(resp){
// 		console.log(resp[resp["_currentRecipe"]].currentStep);
// 	});

// Repeat ingredient?
// recipes.find("testUser123")
// 	.then(function(resp){
// 		var r = resp[resp["_currentRecipe"]];
// 		console.log(r.ingredients[r.currentStep]);
// 	});

// How much sugar?
// recipes.find("testUser123")
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
// recipes
// 	.update(userId, cookies) 
//     .then(function(resp) {
//         console.log(resp);
//     });

// TRADITIONAL NODE CALLBACK WITH ERROR
// recipes.update(userId, cookies, function(err, resp) {
//     console.log(resp);
// });

// -------------------------------------------------------------------------------

// recipes.find("testUser123")
// 	.then(function(resp){
// 		console.log(resp);
// 		// for(var i=0,j=resp.recipes.length; i<j; i++){
// 		// 	console.log(resp.recipes[i].displayName);
// 		// }
// 	});

// users.find("Citrus Glaze")
// 	.then(function(resp){
// 		console.log(resp);
// 		console.log(resp.Name);
// 		// console.log(resp[]);
// 	});

// recipes.find(userId)
// 	.then(function(recipe){
// 		console.log(recipe);
// 	});

recipes.insert(initialUser, function(err, resp) {
	if(err){
		console.log(err);
	}
	console.log(resp);
});

// recipes.find(userId, function(err, resp) { //query DB for user item
// 	console.log(resp);
// 	console.log(err);
// });

// recipes.find(userId)
// 	.then(function(user, err){
// 		console.log(err);
// 	})


// or use a simple callback function instead of promise
// recipes.find(userId, function(err, recipe){
	// console.log(recipe);
	// console.log(recipe.ingredients);
// });
