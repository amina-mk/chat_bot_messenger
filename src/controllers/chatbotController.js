require("dotenv").config();
import request from "request";

let postWebhook = (req, res) =>{
    // Parse the request body from the POST
    let body = req.body;

    // Check the webhook event is from a Page subscription
    if (body.object === 'page') {

        // Iterate over each entry - there may be multiple if batched
        body.entry.forEach(function(entry) {

            // Gets the body of the webhook event
            let webhook_event = entry.messaging[0];
            console.log(webhook_event);


            // Get the sender PSID
            let sender_psid = webhook_event.sender.id;
            console.log('Sender PSID: ' + sender_psid);

            // Check if the event is a message or postback and
            // pass the event to the appropriate handler function
            if (webhook_event.message) {
                handleMessage(sender_psid, webhook_event.message);
            } else if (webhook_event.postback) {
                handlePostback(sender_psid, webhook_event.postback);
            }

        });

        // Return a '200 OK' response to all events
        res.status(200).send('EVENT_RECEIVED');

    } else {
        // Return a '404 Not Found' if event is not from a page subscription
        res.sendStatus(404);
    }
};

let getWebhook = (req, res) => {
    // Your verify token. Should be a random string.
    let VERIFY_TOKEN = process.env.MY_VERIFY_FB_TOKEN;

    // Parse the query params
    let mode = req.query['hub.mode'];
    let token = req.query['hub.verify_token'];
    let challenge = req.query['hub.challenge'];

    // Checks if a token and mode is in the query string of the request
    if (mode && token) {

        // Checks the mode and token sent is correct
        if (mode === 'subscribe' && token === VERIFY_TOKEN) {

            // Responds with the challenge token from the request
            console.log('WEBHOOK_VERIFIED');
            res.status(200).send(challenge);

        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
};

// Quick reply
function quick(sender_psid) {
    // Construct the message body
    let request_body = {
    "recipient":{
        "id":sender_psid
    },
    "messaging_type": "RESPONSE",
        "message":{
        "text": "Très bien et vous ? ",
            "quick_replies":[
            {
                "content_type":"text",
                "title":"Je vais bien,merci",
                "payload":"<POSTBACK_PAYLOAD>",
            },{
                "content_type":"text",
                "title":"Non, ça ne va pas",
                "payload":"<POSTBACK_PAYLOAD>",
            }
        ]
    }
}
    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v9.0/me/messages",
        "qs": { "access_token": process.env.FB_PAGE_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!');
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

function firstTrait(nlp, name) {
    return nlp && nlp.entities && nlp.traits[name] && nlp.traits[name][0];
}

function callSendAPI(sender_psid, response) {
    // Construct the message body
    let request_body = {
        "recipient": {
            "id": sender_psid
        },
        "message": { "text": response }
    };

    // Send the HTTP request to the Messenger Platform
    request({
        "uri": "https://graph.facebook.com/v7.0/me/messages",
        "qs": { "access_token": process.env.FB_PAGE_TOKEN },
        "method": "POST",
        "json": request_body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!');
        } else {
            console.error("Unable to send message:" + err);
        }
    });
}

let callSendAPIWithFile = (sender_psid,message) => {
    let attachment_url = message.attachments[0].payload.url;

    let body = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "attachment": {
                "type": "file",
                "payload": {
                    "url": attachment_url,
                }
            }
        }
    };

    request({
        "uri": "https://graph.facebook.com/v6.0/me/messages",
        "qs": { "access_token": process.env.FB_PAGE_TOKEN },
        "method": "POST",
        "json": body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
};
let callSendAPIWithVideo = (sender_psid,message) => {
    let attachment_url = message.attachments[0].payload.url;

    let body = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "attachment": {
                "type": "video",
                "payload": {
                    "url": attachment_url,
                }
            }
        }
    };

    request({
        "uri": "https://graph.facebook.com/v6.0/me/messages",
        "qs": { "access_token": process.env.FB_PAGE_TOKEN },
        "method": "POST",
        "json": body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
};
let callSendAPIWithAudio = (sender_psid,message) => {
    let attachment_url = message.attachments[0].payload.url;

    let body = {
        "recipient": {
            "id": sender_psid
        },
        "message": {
            "attachment": {
                "type": "audio",
                "payload": {
                    "url": attachment_url,
                }
            }
        }
    };

    request({
        "uri": "https://graph.facebook.com/v6.0/me/messages",
        "qs": { "access_token": process.env.FB_PAGE_TOKEN },
        "method": "POST",
        "json": body
    }, (err, res, body) => {
        if (!err) {
            console.log('message sent!')
        } else {
            console.error("Unable to send message:" + err);
        }
    });
};



function handleMessage(sender_psid, message) {

    // Check if the message contains text
     if (message.text) {
        if(message.text === "Comment vas-tu ?"){
            quick(sender_psid);
 
        }
       if(message.text !== "Comment vas-tu ?" && message.text !== "Je vais bien,merci" && message.text !== "Non, ça ne va pas"){

          callSendAPI(sender_psid,message.text);
 
        }    
    } if (message.attachments) {
        if(message.attachments[0].type === 'image'){
           message.text =  "Je ne sais pas traiter ce type de demande";
           callSendAPI(sender_psid,message.text);
               
            
        } else if (message.attachments[0].type === 'file') {

            callSendAPIWithFile(sender_psid,message);

        }
        else if (message.attachments[0].type === 'video'){
            callSendAPIWithVideo(sender_psid,message);

        }
        else if (message.attachments[0].type === 'audio'){
            callSendAPIWithAudio(sender_psid,message);

        }
    
      }
    
}

module.exports = {
  postWebhook: postWebhook,
  getWebhook: getWebhook
};
