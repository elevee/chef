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
    const dynasty = require('dynasty')(credentials), // Set up Dynasty with the AWS credentials
    recipes = dynasty.table('Recipes'); // Get the Dynasty recipe table object
    if (!recipes.find(userId)){ //if userId not in DB, create an item
        console.log("USERID NOT IN DB!");
        let initialUser = {
            _userId: userId,
            _currentRecipe: "undefined"
        };
        recipes.insert(initialUser, function(err, resp) {
            if(err){
                let msg = "There was a problem adding you to the Database."
                buildSpeechletResponseWithoutCard(msg, null, true)
            }
        });
    }
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
    if (session["currentRecipe"]){
        speechOutput = session["currentRecipe"][session["sessionAttributes"]["currentSection"]][session["sessionAttributes"]["currentStep"]];
    }
    let sessionAttributes = {
        "outputSpeech" : speechOutput,
        "repromptText" : reprompt,
        "currentRecipe": session["sessionAttributes"]["currentRecipe"],
        "currentSection" : "Ingredients",
        "currentStep"   : 0
    };
    // callback(sessionAttributes, buildSpeechletResponse(header, speechOutput, reprompt, shouldEndSession));
}

function handleStartRecipeIntent(intent, session, callback) {
    //if recipe in progress (check session)
    let userId = session.user.userId;
    const dynasty = require('dynasty')(credentials), // Set up Dynasty with the AWS credentials
    recipes = dynasty.table('Recipes'); // Get the Dynasty recipe table object
    let queryTerm = replaceSpacesAndUnderscores(intent.slots.Recipe.value.trim());

    recipes.find(userId) //query DB for user item
        .then(function(resp){
            console.log("RESPONSE IS: ", resp);
            let r = resp[queryTerm];
            console.log("Recipe should be: ", r);
            if(!r){
                buildSpeechletResponseWithoutCard("I didn't find that recipe in your collection. Please try again.", null, true);
            }
            let speechOutput = {
                type: "SSML",
                ssml: "<speak>Starting "+r.displayName+" recipe.<break time='3s'/>"
            };
            // let speechOutput = "Starting the recipe.";
             //Proceed to first ingredient
            let firstIngredient = "Prep the Ingredients: <break time='1s'/>"+resp.ingredients[0]+"</speak>";
            speechOutput["ssml"] += firstIngredient;

            let reprompt = "Well?";
            let sessionAttributes = {
                "outputSpeech" : speechOutput,
                "repromptText" : reprompt,
                "currentRecipe": resp,
                "currentSection" : "Ingredients",
                "currentStep"   : 0
            };
            let shouldEndSession = true;
            
           
            // sessionAttributes["speechOutput"]["ssml"] += "Prep the Ingredients: <break time='2s'/> "+resp.Ingredients[sessionAttributes["currentStep"]]+"</speak>";
            // sessionAttributes["speechOutput"]["ssml"] += firstIngredient;
            
            // sessionAttributes["speechOutput"] = "blerg";
            // console.log("SpeechOutput is being passed as ", speechOutput);
            callback(sessionAttributes, buildSpeechletResponseWithoutCard(speechOutput, reprompt, shouldEndSession));
        });

    // docClient.scan(scanningParameters, function(err, data){
    //     if(err){
    //         // callback(err, null);
    //     } else {
    //         // callback(null, data);
    //     }
    // });
}

function handleRepeatIntent(intent, session, callback) {
    console.log("session is ", session);
    let speechOutput = "I have nothing to repeat";
    let s = session.attributes;
    if(s && s.currentRecipe && s.currentRecipe[s.currentSection][s.currentStep]){
        speechOutput = s.currentRecipe[s.currentSection][s.currentStep];
    }
    callback(s, buildSpeechletResponseWithoutCard(speechOutput, "What was that?", false));
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