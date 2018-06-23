var request = require("request");

const APP_TOKEN = "EAAW1N706mu0BABLBlDunN5YFWeq6mNHVXywPiZBQitdBNI3VTj5KvF82yI3THBsLCS9ZCAvaGNac5zsc6yff71ZAkAZCpQWRZAWMcf16ZArwPewq8vmfyoVm7z4ZApGEtwc6CGr81ix657tdzq9lHyofZCHPHnzZCPav0YXPgi7ZBChHZAC8gqCsV7P";

var empezar = {
	"get_started":{
		payload: "empezar"
	}
}

var greeting = {

	greeting:[
		{
			locale: "default",
			text: `En MicroTec el celular que quieras ¡Págalo como prefieras!
¿Te gustaría estrenar un nuevo celular? y ver nuestras promociones. Solo da click en empezar`
		}
	]

}
var config = {
	persistent_menu: [
		{
			locale: "default",
			composer_input_disabled: false,//en true, desactva el input para escribir
			call_to_actions: [
				{
					type: "web_url",
					url: "https://www.micro-tec.com.mx/pagina/manager_garantias/",
					title: "🔰 Garantias 🔗"
				},
				{
					type: "web_url",
					url: "https://www.micro-tec.com.mx/pagina/microtec/sucursales.html",
					title: "🏪 Nuestras Sucursales 🔗"
				},
				{
					type: "web_url",
					url: "https://www.micro-tec.com.mx/pagina/microtec/",
					title: "🏠 Sitio Web 🔗"
				}

			]

		}
	]
}
/*
var config = {
	persistent_menu: [
		{
			locale: "default",
			composer_input_disabled: false,//en true, desactva el input para escribir
			call_to_actions: [
				{
					title: "Promociones",
					type: "nested",
					call_to_actions: [
						{
							title: "Mirar Promos",
							type: "postback",
							payload: "promos"
						},
						{
							title: "Ir a Microtec",
							type: "web_url",
							url: "https://www.micro-tec.com.mx/pagina/microtec/",
							webview_height_ratio: "full"
						},
						{
							title: "Descuentos",
							type: "nested",
							call_to_actions: [
								{
									type: "postback",
									title: "no mas menus",
									payload: "valor"
								},
								{
									type: "postback",
									title: "opcion",
									payload: "valor"
								},
								{
									type: "postback",
									title: "opcion",
									payload: "valor"
								},
								{
									type: "postback",
									title: "opcion",
									payload: "valor"
								}
							]
						},
					]
				},
				{
					type: "nested",
					title: "Planes",
					call_to_actions: [
						{
							type: "postback",
							title: "Puedo tener 5 opciones",
							payload: 'valor'
						},
						{
							type: "postback",
							title: "tarifarios",
							payload: 'valor'
						},
						{
							type: "postback",
							title: "TAF",
							payload: 'valor'
						},
						{
							type: "postback",
							title: "portabilidad",
							payload: 'valor'
						},
					]
				},
				{
					type: "web_url",
					url: "https://www.micro-tec.com.mx/pagina/microtec/",
					title: "Sitio Web"
				}

			]

		}
	]
}
*/

/*
request({
	uri: 'https://graph.facebook.com/v2.6/1919719018099904',
	qs: {
		access_token: APP_TOKEN,
		fields: "first_name"
	},
	method: 'GET'
}, function(err, response, data){
	if(err){
		console.log("Error al enviar")
	}
	else{
		data = JSON.parse(data);
		console.log(data.first_name);
	}
});
*/


//propiedades de messenger
request({
	uri: 'https://graph.facebook.com/v2.6/me/messenger_profile',
	qs: {
		//fields: "persistent_menu",
		access_token: APP_TOKEN
	},
	method: 'POST',
	json: config
}, function(err, response, data){

	if(err){
		console.log("Error al enviar")
	}
	else{
		console.log("el mensaje fue enviado");
		//console.log(response);
		console.log(data);
	}

});


/*
subida de archivos
var file = {
	message: {
		attachment: {
			type: "video",
			payload:{
				is_reusable: true,
				url: "http://www.candbt.com/cursos/videos/00100/olas.mp4"
			}
		}
	}
}

 request({
	uri: 'https://graph.facebook.com/v2.6/me/message_attachments',
	qs: {
		access_token: APP_TOKEN
	},
	method: 'POST',
	json: file
}, function(err, response, data){

	if(err){
		console.log("Error al enviar")
	}
	else{
		console.log("el mensaje fue enviado");
		//console.log(response);
		console.log(data);
	}

});*/

/*
attachment_id: 774823049391815 //meme de loocking image
attachment_id: 774823049391815 //meme de loocking video
attachment_id: 774855082721945 //meme de perro imagen
attachment_id: 774869036053883 //olas video




 */

/*
var messageData = {
  "recipient":{
  	"id":"1919719018099904"
  },
  "message":{
    "text": `Estas son respuestas rapidas que son botones flotantes que se sobreponen sobre todo y una vez seleccionado, desaparecen, soportan texto, lugar(ubicacion), numero de telefono y correo electronico`,
    "quick_replies":[
      {
        "content_type":"text",
        "title":"Buscar",
        "payload":"valor dado por el desarrollador",
        "image_url":"https://image.flaticon.com/icons/png/512/14/14562.png"
      },
      {
        "content_type":"location"
      },
      {
      	"content_type": "user_phone_number"
      },
      {
      	"content_type": "user_email"
      }
    ]
  }
};
*/

/*
var messageData = {
  "recipient":{
  	"id":"1919719018099904"
  },
  "sender_action":"typing_on"
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

*/
/*request({
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

});*/

/*
request({
	uri: 'https://maps.googleapis.com/maps/api/geocode/json',
	qs: {
		latlng: "20.065303,-97.067536", 
		key: "AIzaSyB8UTMBAxOYzocL4dewFSlBaEKeqJ26O3o",
		result_type: "political|country|locality"
	},
	method: 'POST'
}, function(err, response, data){

	if(err){
		console.log("Error al enviar")
	}
	else{
		data = JSON.parse(data);
		console.log(data['status']);
		console.log(data['results'])
		//console.log(data.results[0].formatted_address)
		//data.results.forEach( function(obj) {
			//console.log(obj.formatted_address);
		//});

	}

});
	*/