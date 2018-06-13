var request = require("request");

const APP_TOKEN = "EAAW1N706mu0BABLBlDunN5YFWeq6mNHVXywPiZBQitdBNI3VTj5KvF82yI3THBsLCS9ZCAvaGNac5zsc6yff71ZAkAZCpQWRZAWMcf16ZArwPewq8vmfyoVm7z4ZApGEtwc6CGr81ix657tdzq9lHyofZCHPHnzZCPav0YXPgi7ZBChHZAC8gqCsV7P";


var messageData = {
	
};


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