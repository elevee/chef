/* eslint-disable  func-names */
/* eslint quote-props: ["error", "consistent"]*/
/**
 * This sample demonstrates a simple skill built with the Amazon Alexa Skills
 * nodejs skill development kit.
 * This sample supports multiple lauguages. (en-US, en-GB, de-DE).
 * The Intent Schema, Custom Slots and Sample Utterances for this skill, as well
 * as testing instructions are located at https://github.com/alexa/skill-sample-nodejs-fact
 **/

'use strict';
// console.log("Loading Chef function...");
// require('dotenv').config();

const credentials = require("./config.json");
const Alexa = require('alexa-sdk');
const AWS = require('aws-sdk');


AWS.config.update({
  region: "us-east-1"
});
var DB  = new AWS.DynamoDB.DocumentClient();

// const credentials = {
//     accessKeyId: process.env.AWS_ACCESS_KEY,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
//     region: 'us-east-1'
// };

// const APP_ID = undefined;  // TODO replace with your app ID (OPTIONAL).

// exports.handler = function(event, context, callback){
//     var output = "this worked";
//     callback(null, output); //args: error, success
// }


// Route the incoming request based on type (LaunchRequest, IntentRequest,
// etc.) The JSON body of the request is provided in the event parameter.
exports.handler = function (event, context) {
    try {
        console.log("event.session.application.applicationId=" + event.session.application.applicationId);

        /**
         * Uncomment this if statement and populate with your skill's application ID to
         * prevent someone else from configuring a skill that sends requests to this function.
         */

    // if (event.session.application.applicationId !== "") {
    //     context.fail("Invalid Application ID");
    //  }

        if (event.session.new) {
            onSessionStarted({requestId: event.request.requestId}, event.session);
        }

        if (event.request.type === "LaunchRequest") {
            onLaunch(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                });
        } else if (event.request.type === "IntentRequest") {
            onIntent(event.request,
                event.session,
                function callback(sessionAttributes, speechletResponse) {
                    context.succeed(buildResponse(sessionAttributes, speechletResponse));
                    // console.log("Session Attributes for Response: ", sessionAttributes);
                    // console.log("Speechlet Response: ", speechletResponse);
                });
        } else if (event.request.type === "SessionEndedRequest") {
            onSessionEnded(event.request, event.session);
            context.succeed();
        }
    } catch (e) {
        context.fail("Exception: " + e);
    }
};

/**
 * Called when the session starts.
 */
function onSessionStarted(sessionStartedRequest, session) {
    // add any session init logic here
    console.log("USERID: ", session.user.userId);
    handleNewUserIfNeccessary(session.user.userId);
}

function handleNewUserIfNeccessary(userId){
    console.log("Session Started!");
    let table = "Recipes";
    let params = {
        TableName: table,
        Key:{
            "_userId": userId
        }
    };
    DB.get(params, function(err, data) {
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            console.log("User response:", JSON.stringify(data, null, 2));
            if(!data["Item"] || data["Item"] === "undefined"){
                console.log("USERID NOT IN DB!");
                let params = {
                  TableName: table,
                  Item: {
                        _userId: userId,
                        _currentRecipe: "undefined"
                    }
                };
                DB.put(params, function(err, data) {
                    if(err){
                        console.log(err);
                        let msg = "There was a problem adding you to the Database."
                        buildSpeechletResponseWithoutCard(msg, null, true)
                    } else {
                        console.log("USER CREATED: ", data);
                    }
                });
            }
        }
    });
}


/**
 * Called when the user invokes the skill without specifying what they want.
 */
function onLaunch(launchRequest, session, callback) {
    getWelcomeResponse(callback)
}

/**
 * Called when the user specifies an intent for this skill.
 */
function onIntent(intentRequest, session, callback) {

    var intent = intentRequest.intent
    var intentName = intentRequest.intent.name;
    console.log("intent is ", intentRequest.intent);
    console.log("Intentname is ", intentName);
    // dispatch custom intents to handlers here
    switch(intentName){
        case "RecipeIntent": //user wants to load in/start a recipe
            handleStartRecipeIntent(intent, session, callback);
            break;
        case "RepeatIntent": //user wants to load in/start a recipe
            handleRepeatIntent(intent, session, callback);
            break;
        case "PreviousIntent": //user wants to load in/start a recipe
            handlePreviousIntent(intent, session, callback);
            break;
        case "NextIntent": //user wants to load in/start a recipe
            handleNextIntent(intent, session, callback);
            break;
        default:
            throw "Invalid intent";
    }
    // if (intentName == "GetInfoIntent") {
    //     handleGetInfoIntent(intent, session, callback)
    // } else {
    //      throw "Invalid intent"
    // }
}

/**
 * Called when the user ends the session.
 * Is not called when the skill returns shouldEndSession=true.
 */
function onSessionEnded(sessionEndedRequest, session) {

}

// ------- Skill specific logic -------

function getWelcomeResponse(callback) {
    var speechOutput = "What are we cooking today, Chef?"

    var reprompt = "What was that?"

    //var header = "Get Info" //if using cards in Alexa app

    var shouldEndSession = false

    var sessionAttributes = {
        "speechOutput" : speechOutput,
        "repromptText" : reprompt
    }

    callback(sessionAttributes, buildSpeechletResponseWithoutCard(speechOutput, reprompt, shouldEndSession));

}

function handleHelpIntent(intent, session, callback) {
    console.log("session is ", session);
    let speechOutput = "Please choose a recipe.";
    let reprompt = "What was that?";
    let sessionAttributes = {
        "outputSpeech" : speechOutput,
        "repromptText" : reprompt
    };
    // callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
}

function getRecipeState(userId){
    let p = new Promise(function(resolve, reject){
        if(userId){
            let table = "Recipes";
            let params = {
                TableName: table,
                Key:{
                    "_userId": userId
                }
            };
            DB.get(params, function(err, data) {
                if (err) {
                    console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
                    reject("It didn't work", err);
                } else {
                    console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
                    resolve(data);
                }
            });
        }
    });
    return p;
}

function updateRecipeState(userId, recipe, section, step){
    console.log("UPDATE RECIPE FIRED");
    let p = new Promise(function(resolve, reject){
        if(userId && recipe && section && (step !== "undefined")){ //step being 0 is false-y.
            let table = "Recipes";
            let params = {
                TableName: table,
                Key: { "_userId" : userId },
                UpdateExpression: 'set #c = :rec, #a.currentSection = :x, #a.currentStep = :s',
                ExpressionAttributeNames: {
                    '#a': recipe.name,
                    '#c': "_currentRecipe",
                },
                ExpressionAttributeValues: {
                    ':rec': recipe.name,
                    ':x' : section,
                    ':s' : step
                },
                ReturnValues:"UPDATED_NEW"
            };
            console.log("params are ", params);
            DB.update(params, function(err, data) {
                if(err){
                    console.log("THERE WAS AN ERROR", err);
                    reject(err);
                } else {
                    console.log("UPDATE RECIPE STATE COMPLETED SUCCESSFULLY ", data);
                    resolve(data);
                }
            });
        }
    });
    return p;
}

function handleStartRecipeIntent(intent, session, callback) {
    //if recipe in progress (check session)
    let userId = session.user.userId;
    let queryTerm = replaceSpacesAndUnderscores(intent.slots.Recipe.value.trim());
    let table = "Recipes";
    let params = {
        TableName: table,
        Key:{
            "_userId": userId
        }
    };
    DB.get(params, function(err, data) { //query DB for user item
        if (err) {
            console.error("Unable to read item. Error JSON:", JSON.stringify(err, null, 2));
        } else {
            // var r = JSON.stringify(data,null,2);
            console.log("GetItem succeeded:", JSON.stringify(data, null, 2));
            let r = data["Item"][queryTerm]; //recipe

            let speechOutput = "I didn't find that recipe in your collection. Please try again.";
            
            console.log("Recipe should be: ", r);
            if(r === "undefined"){
                let sessionAttributes = {
                    "outputSpeech" : speechOutput
                };
                callback(session, buildSpeechletResponseWithoutCard(speechOutput, null, true));
            } else {
                speechOutput = {
                    type: "SSML",
                    ssml: "<speak>Starting "+r.displayName+" recipe.<break time='3s'/>"
                };
                
                //Proceed to first ingredient
                let firstIngredient = "Prep the Ingredients: <break time='1s'/>"+r.ingredients[0]+"</speak>";
                speechOutput["ssml"] += firstIngredient;
                let reprompt = null;
                let sessionAttributes = {
                    "outputSpeech" : speechOutput,
                    // "repromptText" : reprompt,
                    "currentRecipe": r
                };
                let shouldEndSession = true;

                //if section isn't ingredients & step isn't zero, update it.
                if(r["currentSection"] !== "ingredients" || r["currentStep"] !== 0){
                    //reset stats for recipe
                    r["currentStep"] = 0;
                    r["currentSection"] = "ingredients";
                    updateRecipeState(userId, r, r["currentSection"], r["currentStep"])
                        .then(function(result){
                            console.log("Result is ", result);
                            sessionAttributes["currentRecipe"] = r;
                            console.log("SpeechOutput is being passed as ", speechOutput);
                            callback(sessionAttributes, buildSpeechletResponseWithoutCard(speechOutput, reprompt, shouldEndSession));
                        },function(err){
                            console.log("Error with the recipe update ", err);
                        });
                } else {
                    console.log("SpeechOutput is being passed as ", speechOutput);
                    callback(sessionAttributes, buildSpeechletResponseWithoutCard(speechOutput, reprompt, shouldEndSession));
                }
                
            }
        }
    });
}

function handleRepeatIntent(intent, session, callback) {
    console.log("session is ", session);
    let userId  = session.user.userId;
    let s       = session.attributes;
    let _r      = s.currentRecipe;
    let sessionAttributes = {
        "outputSpeech" : "I have nothing to repeat",
        "currentRecipe": _r
    };
    let shouldEndSession = true;
    
    if(s && _r && _r.currentSection && (_r.currentStep !== "undefined")){
        sessionAttributes["outputSpeech"] = _r[_r.currentSection][_r.currentStep];
        callback(sessionAttributes, buildSpeechletResponseWithoutCard(sessionAttributes["outputSpeech"], "What was that?", false));
    } else { //no session info avail
        getRecipeState(userId)
            .then(function(result){
                if(result["Item"]){
                    console.log("Result is ", result);
                    sessionAttributes["outputSpeech"]  = result["Item"][_r.currentSection][_r.currentStep];
                    sessionAttributes["currentRecipe"] = result["Item"];
                    console.log("SpeechOutput is being passed as ", speechOutput);
                    callback(sessionAttributes, buildSpeechletResponseWithoutCard(sessionAttributes["outputSpeech"], reprompt, shouldEndSession));    
                }
            });
    }
    // callback(sessionAttributes, buildSpeechletResponseWithoutCard(sessionAttributes["outputSpeech"], "null", shouldEndSession));
}

function handlePreviousIntent(intent, session, callback) {
    let speechOutput = "Please select a recipe first. Use the keyword start, with the recipe name";
    let shouldEndSession = false;
    let s = session.attributes;
    if(s && s.currentRecipe && s.currentSection && typeof s.currentStep !== "undefined"){
        if(s.currentStep === 0){
            if (s.currentSection === "Instructions"){ //if we are on first step of instructions, move back to ingredients.
                s.currentSection = "Ingredients";
                s.currentStep = s.currentRecipe[s.currentSection].length - 1;
                speechOutput = s.currentRecipe[s.currentSection][s.currentStep];
            } else { //we are on first step of ingredients
                speechOutput = "This is the start of the recipe.";
            }
        } else if (s.currentStep > 0){ //move to previous step, decrement currentStep
            s.currentStep--;
            speechOutput = s.currentRecipe[s.currentSection][s.currentStep];
        } else { //this shouldn't happen!
            // console.log("ELSE CASE! ");
        }
    }
    callback(s, buildSpeechletResponseWithoutCard(speechOutput, "What was that?", shouldEndSession));
}

function handleNextIntent(intent, session, callback) {
    let speechOutput = "Please select a recipe first. Use the keyword start, with the recipe name";
    let shouldEndSession = false;
    let s = session.attributes;
    if(s && s.currentRecipe && s.currentSection && typeof s.currentStep !== "undefined"){
        if(s.currentStep === (s.currentRecipe[s.currentSection].length - 1)){
            if (s.currentSection === "Ingredients"){ //if we are on last step of ingredients, move on to instructions.
                s.currentSection = "Instructions";
                s.currentStep = 0;
                speechOutput = {
                    type: "SSML",
                    ssml: "<speak>Prep is done. "+s.currentRecipe[s.currentSection][s.currentStep]+"</speak>"
                }
            } else { //if we are on last step of instructions, finish the recipe and close session.
                shouldEndSession = true;
                s.currentStep++;
                speechOutput = "Nice job! You're done with the recipe.";
            }
        } else if (s.currentStep < s.currentRecipe[s.currentSection].length){ //move to next step, increment currentStep
            s.currentStep++;
            speechOutput = s.currentRecipe[s.currentSection][s.currentStep];
        } else { //this shouldn't happen!
            // console.log("ELSE CASE! ");
        }
    }
    callback(s, buildSpeechletResponseWithoutCard(speechOutput, "What was that?", shouldEndSession));
}


// ------- Helper functions to build responses for Alexa -------

function formatOutputSpeech(output){
    //need to see if this will end up being an ssml or plaintext
    let outputFormat = (typeof output === "object" && output.type === "SSML") ? "SSML" : "PlainText";
    if(outputFormat === "SSML"){
        return output;
    } else {
        return {
            "type": outputFormat,
            "text": output
        };
    } 
}

function buildSpeechletResponse(title, output, repromptText, shouldEndSession) {
    // console.log("OUTPUT BEFORE BUILDSPEECH IS", output);
    return {
        outputSpeech: formatOutputSpeech(output),
        card: {
            type: "Simple",
            title: title,
            content: output
        },
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildSpeechletResponseWithoutCard(output, repromptText, shouldEndSession) {
    // console.log("OUTPUT BEFORE BUILDSPEECHWITHOUTCARD IS", output);
    return {
        outputSpeech: formatOutputSpeech(output),
        reprompt: {
            outputSpeech: {
                type: "PlainText",
                text: repromptText
            }
        },
        shouldEndSession: shouldEndSession
    };
}

function buildResponse(sessionAttributes, speechletResponse) {
    return {
        version: "1.0",
        sessionAttributes: sessionAttributes,
        response: speechletResponse
    };
}

function capitalizeFirst(s) {
    return s.charAt(0).toUpperCase() + s.slice(1)
}

function toTitleCase(str){ //capitalizes first letter of each word
    return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

function replaceSpacesAndUnderscores(string){
    return string.split(' ').join('_') //supposed to be faster than using RE. But that may only be in browsers.
}