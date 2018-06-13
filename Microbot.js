var request = require("request");
var DB = require("./database.js");

module.exports = class Microbot{

	constructor(senderId){
		this.senderId = senderId;
		this.APP_TOKEN = "EAAW1N706mu0BABLBlDunN5YFWeq6mNHVXywPiZBQitdBNI3VTj5KvF82yI3THBsLCS9ZCAvaGNac5zsc6yff71ZAkAZCpQWRZAWMcf16ZArwPewq8vmfyoVm7z4ZApGEtwc6CGr81ix657tdzq9lHyofZCHPHnzZCPav0YXPgi7ZBChHZAC8gqCsV7P";
	}

	handleMessage(msg){
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
		this.callSendAPI(response);
	}

	handlePostback(msg){
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
		this.callSendAPI(sender, response);
	}

	callSendAPI(response){
		let data = {
			recipient: {
				id: this.senderId
			},
			message: response
		}
		request({
			"uri": "https://graph.facebook.com/v2.6/me/messages",
		    "qs": { "access_token": this.APP_TOKEN },
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

}