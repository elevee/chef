// CHANGING:
// {
//    year: 2015,
//    title: "The Big New Movie",
//    info: { 
//         plot: "Nothing happens at all.",
//         rating: 0
//    }
// }

// To the following:
// {
//    year: 2015,
//    title: "The Big New Movie",
//    info: { 
//            plot: "Everything happens all at once.",
//            rating: 5.5,
//            actors: ["Larry", "Moe", "Curly"]
//    }
// }


var AWS = require("aws-sdk");

AWS.config.loadFromPath('../config.json');

// AWS.config.update({
//   region: "us-west-2",
//   endpoint: "http://localhost:8000"
// });

var docClient = new AWS.DynamoDB.DocumentClient()

var table = "Movies";

var year = 2015;
var title = "The Big New Movie";

// Update the item, unconditionally,

var params = {
    TableName:table,
    Key:{
        "year": year,
        "title": title
    },
    UpdateExpression: "set info.rating = :r, info.plot=:p, info.actors=:a",
    ExpressionAttributeValues:{
        ":r":5.5,
        ":p":"Everything happens all at once.",
        ":a":["Larry", "Moe", "Curly"]
    },
    ReturnValues:"UPDATED_NEW"
};

console.log("Updating the item...");
docClient.update(params, function(err, data) {
    if (err) {
        console.error("Unable to update item. Error JSON:", JSON.stringify(err, null, 2));
    } else {
        console.log("UpdateItem succeeded:", JSON.stringify(data, null, 2));
    }
});