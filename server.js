var express = require("express");
var bodyParser = require("body-parser");
var request = require("request");
//variables de sesion
//otro archivo.
const APP_TOKEN = "EAAW1N706mu0BABLBlDunN5YFWeq6mNHVXywPiZBQitdBNI3VTj5KvF82yI3THBsLCS9ZCAvaGNac5zsc6yff71ZAkAZCpQWRZAWMcf16ZArwPewq8vmfyoVm7z4ZApGEtwc6CGr81ix657tdzq9lHyofZCHPHnzZCPav0YXPgi7ZBChHZAC8gqCsV7P";

var app = express();
app.use(bodyParser.json());
app.listen(3000, function(){
	console.log("el servidor esta corriendo en el puerto 3000");
});

app.get('/webhook', function(req, res){
	if(req.query['hub.verify_token'] === "test_token" ){
		res.send( req.query['hub.challenge'] );
	}
	else{
		res.send("no puedes entrar");
	}
});

app.post('/webhook', function(req, res){

	var data = req.body;

	if( data.object == 'page' ){

		data.entry.forEach( function(pageEntry) {
				
			pageEntry.messaging.forEach(function(messagingEvent){
				
				if( messagingEvent.message ){
					receiveMessage(messagingEvent);
				}

			});


		});

		res.sendStatus(200);
	}


});

function receiveMessage(event){
	var senderId = event.sender.id;
	var messageText = event.message.text;
	console.log("senderId", senderId);
	console.log("messageText", messageText);

	

}