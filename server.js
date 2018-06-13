var express = require("express");
var bodyParser = require("body-parser");
var Microbot = require('./Microbot.js');

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
				//handleMessage(senderId, webhook_event.message);
				Bot.handleMessage(webhook_event.message);
			}
			else if( webhook_event.postback ){
				//handlePostback(senderId, webhook_event.postback);
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

function handleMessage(sender, msg){
	let response;
	if( msg.text ){
		response = {
			text: `el mensaje que recibi es: "${msg.text}". ¡ahora enviame una imagen!`
		};
	}
	else if(msg.attachments){
		let attachments_urls = [];
		msg.attachments.forEach( item => {
			attachments_urls.push( item.payload.url );
		});
		console.log(attachments_urls);
		response = {
			attachment: {
				type: "template",
				payload: {
					template_type: "generic",
					elements: [
						{
							title: "esta es tu primer imagen ?",
							subtitle: "presiona el boton de respuesta",
							image_url: attachments_urls[0],
							buttons: [
								{
									type: "postback",
									title: "Si!!",
									payload: "si"
								},
								{
									type: "postback",
									title: "No manches!!",
									payload: "no"
								}
							]
						}
					]
				}
			}
		}

	}
	callSendAPI(sender, response);
}

function handlePostback(sender, msg){
	let response;
	let payload = msg.payload;
	if( payload === 'si' ){
		response = {
			text: "Gracias!"
		}
	}
	else if( payload === 'no' ){
		response = {
			text: 'opps, enviame otra imagen'
		}
	}
	callSendAPI(sender, response);
}

function callSendAPI(sender, response){
	let data = {
		recipient: {
			id: sender
		},
		message: response
	}
	request({
		"uri": "https://graph.facebook.com/v2.6/me/messages",
	    "qs": { "access_token": APP_TOKEN },
	    "method": "POST",
	    "json": data
	}, (err, res, body) => {
		if (!err) {
	    	console.log('¡Mensaje enviado!')
	    }
	    else {
	    	console.error("Imposible enviar mensaje:" + err);
	    }
	});
}
*/


/*
function receiveMessage(event){
	var senderId = event.sender.id;
	var messageText = event.message.text;
	evaluateMessage(messageText, senderId);
}

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

function sendAPI(messageData){
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: APP_TOKEN
		},
		method: 'POST',
		json: messageData
	}, function(err, response, data){

		if(err){
			console.log("Error al enviar")
		}
		else{
			console.log("el mensaje fue enviado");
		}

	});
}

function getClima(callback){
	var test = "un valor creado en getClima!!!";
	callback(test);
}

function isContain(sentence, word){
	return sentence.indexOf(word) > -1;
}

function actionBot(action){
	request({
		uri: 'https://graph.facebook.com/v2.6/me/messages',
		qs: {
			access_token: APP_TOKEN
		},
		method: 'POST',
		json: messageData
	}, function(err, response, data){

		if(err){
			console.log("Error en la accion")
		}
		else{
			console.log("accion ejecutada");
		}

	});
}

*/