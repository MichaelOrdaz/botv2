var express = require("express");
var bodyParser = require("body-parser");
var Microbot = require('./Microbot.js');
var geoip = require('geoip-lite');

var app = express();
app.use(bodyParser.json());
app.listen(3000, function(){
	console.log("el servidor esta corriendo en el puerto 3000");
});

app.get('/webhook', function(req, res){
	let mode = req.query['hub.mode'];
	let token = req.query['hub.verify_token'];
	let challenge = req.query['hub.challenge'];
	if(mode && token){
		if( mode === 'subscribe' && token === 'test_token'){
			//console.log('Token Verificado');
			res.status(200).send(challenge);
		}
		else{
			res.sendStatus(403);
		}
	}
});

app.post('/webhook', function(req, res){
	let data = req.body;
	if( data.object === 'page' ){
		data.entry.forEach( function(pageEntry) {
			let webhook_event = pageEntry.messaging[0];
			let senderId = webhook_event.sender.id;

			var Bot = new Microbot(senderId);

			if( webhook_event.message ){
				Bot.handleMessage(webhook_event.message);
			}
			else if( webhook_event.postback ){
				Bot.handlePostback(webhook_event.postback);
			}
		});
		res.status(200).send("Evento_Recibido");
	}
	else{
		res.sendStatus(404);
	}
});

/*

function evaluateMessage(message, sender){
	if( isContain(message, 'ayuda') ){
		let finalMessage = "por el momento no te puedo ayudar";
		sendMessageText(finalMessage, sender);
	}
	else if(isContain(message, 'gato')){
		let finalMessage = "por que quieres un gato??";
		sendMessageText(finalMessage, sender);
		finalMessage = "Es mejor un perro!!!";
		sendMessageText(finalMessage, sender);
	}
	else if(isContain(message, 'clima')){
		getClima(function(valor){
			var message = "EL valor de la variable es: " + valor;
			sendMessageText(message, sender);
		});
	}
	else if(isContain(message, 'info')){
		sendMessageTemplate(sender);
	}
	else{
		let finalMessage = 'Solo se repetir las cosas: ' + message;
		sendMessageText(finalMessage, sender);
	}

}
//mensaje de texto
function sendMessageText(message, sender){
	var messageData = {
		messaging_type: "response",
		recipient: {
			id: sender
		},
		message:{
			text: message
		}
	};
	sendAPI(messageData);
}

//enviar imagen
function sendMessageImage(message, sender){
	var messageData = {
		messaging_type: "response",
		recipient: {
			id: sender
		},
		message:{
			attachment: {
				type: 'image',
				payload: {
					url: 'https://www.anipedia.net/imagenes/gatos-ragdoll.jpg'
				}
			}
		}
	};
	sendAPI(messageData);
}
function sendMessageTemplate(sender){
	var messageData = {
		messaging_type: "response",
		recipient: {
			id: sender
		},
		message:{
			attachment: {
				type: 'template',
				payload: {
					template_type: "generic",
					elements: [elementTemplate() ]
				}
			}
		}
	};
	sendAPI(messageData);
}

function elementTemplate(){
	return {
		title: "titulo",
		subtitle: "subtitulo de mi template",
		item_url: "https://www.micro-tec.com.mx/pagina/manager_mesa",
		image_url: "https://www.todopuebla.com/companyimage/logo/large/4k_logo-7830092491508947338.jpg",
		buttons: [ buttonTemplate() ],
	}
}

function buttonTemplate(){
	return {
		type: "web_url",
		url: "https://www.micro-tec.com.mx/pagina/manager_mesa",
		title: "Microtec"
	}
}


function isContain(sentence, word){
	return sentence.indexOf(word) > -1;
}

*/