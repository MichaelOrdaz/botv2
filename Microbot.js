var request = require("request");
var DB = require("./database.js");

module.exports = class Microbot{

	constructor(senderId){
		this.senderId = senderId;
		this.APP_TOKEN = "EAAW1N706mu0BABLBlDunN5YFWeq6mNHVXywPiZBQitdBNI3VTj5KvF82yI3THBsLCS9ZCAvaGNac5zsc6yff71ZAkAZCpQWRZAWMcf16ZArwPewq8vmfyoVm7z4ZApGEtwc6CGr81ix657tdzq9lHyofZCHPHnzZCPav0YXPgi7ZBChHZAC8gqCsV7P";
	}

	firstEntity(nlp, name){
		return nlp && nlp.entities && nlp.entities[name] && nlp.entities[name][0];
	}

	handleMessage(msg){
		let response;
		//si el mensaje posee la propiedad text
		if( msg.text ){

			if(msg.quick_reply){
				//si poseee la propiedad quick_reply, es un mensaje en accion a una quick_reply
				response = {
					text: `El mensaje que recibi es una respuesta de acción rapida del usuario y el texto es ${msg.text} con un payload de ${msg.quick_reply.payload}`
				};
				this.actionBot('typing');
				this.callSendAPI(response);
			}
			else{
				//si no es que es un mensaje de texto normal
				//ahora tambien si el nlp reconoce contiene algo
				let ubicacion = this.firstEntity(msg.nlp, 'location');
				let telefono = this.firstEntity(msg.nlp, 'phone_number');
				let intent = this.firstEntity(msg.nlp, 'intent');

				/*if( msg.text === 'respuestas rapidas' ){
					response = {
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
					this.actionBot('typing');
					this.callSendAPI(response);
				}
				*/
				if( ubicacion && ubicacion.confidence > 0.7){
					this.actionBot('typing');
					this.callSendAPI({text: "Te estas comunicando desde " + ubicacion.value });
				}
				else if(telefono && telefono.confidence > 0.7){
					this.actionBot('typing');
					this.callSendAPI({text: "tu numero de telefono es "+telefono.value });
				}
				else if(intent && intent.confidence > 0.7 && intent.value === "saludo"){
					this.getName(this.senderId, function(clase, name){
						let response = {
							text: `Hola ${name} bienvenido a MicroTec. 📱 Descubre nuestras diferentes formas de estrenar tu nuevo celular y promociones que tenemos para ti 👍. Desliza para ver nuestras opciones 👆`
						}
						let template = clase.templateGeneric();
						clase.actionBot('typing');
						clase.callSendAPI(response);
						clase.callSendAPI(template);
					});
				}
				else if(msg.text === 'generica'){

					this.actionBot('typing');
					this.callSendAPI({text: 'La plantilla genérica es un mensaje estructurado sencillo que incluye un título, un subtítulo, una imagen y hasta tres botones, tambien se pueden colocar hasta 10 plantillas, que se deslizan horizontalmente'});
					//this.actionBot('typing');
					let asd = this.templateGeneric();
					this.callSendAPI( asd );

				}
				else if(msg.text === 'lista'){
					this.actionBot('typing');
					this.callSendAPI({text: "La plantilla de lista es una lista de dos a cuatro elementos estructurados con un botón global opcional que aparece en la parte inferior. Cada elemento puede contener una imagen en miniatura, un título, un subtítulo y un botón. "});
					let tmp = this.templateList();
					this.callSendAPI( tmp );
				}
				else if(msg.text === 'botones'){
					this.actionBot('typing');
					this.callSendAPI( this.templateBtn() );
				}
				else if(msg.text === 'imagen'){
					this.actionBot('typing');
					let res = this.templateMedia('image', '774855082721945');
					this.callSendAPI(res);
				}
				else if(msg.text === 'gif'){
					this.actionBot('typing');
					let res = this.templateMedia('video', '774823049391815');
					this.callSendAPI(res);
				}
				else if(msg.text === 'video'){
					this.actionBot('typing');
					let res = this.templateMedia('video', '774869036053883');
					this.callSendAPI(res);
				}

				else if(msg.text === 'nada'){
					this.actionBot('mark_seen');
				}
				else{
					response = {
						text: `el mensaje que recibi es: "${msg.text}". ¡ahora enviame una imagen!`
					};
					this.actionBot('typing');
					this.callSendAPI(response);
				}
			}
			
		}
		else if(msg.attachments){

			//si el adjunto es de type location
			if(msg.attachments[0].type === "location"){
				
				this.findLocation(msg.attachments[0].payload.coordinates.lat, msg.attachments[0].payload.coordinates.long, function(that, lugar){
					response = {
						text: "Tu ubicacion es: " + lugar
					}
					that.actionBot('typing');
					that.callSendAPI(response);
				});

				/*response = {
					text: "me enviaste tu ubicacion con las coordenadas siguiente: " + msg.attachments[0].payload.coordinates.lat + ", "+msg.attachments[0].payload.coordinates.long
				}*/
			}
			else{

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
										this.btnPostback('Sii!', 'si'),
										this.btnPostback('Noooooo, haha', 'no')
									]
								}
							]
						}
					}
				}
				this.actionBot('typing');
				this.callSendAPI(response);

			}
		}

	}

	getName(psid, callback){
		let clase = this;
		request({
			uri: 'https://graph.facebook.com/v2.6/'+psid,
			qs: {
				access_token: this.APP_TOKEN,
				fields: "first_name"
			},
			method: 'GET'
			}, function(err, response, data){
			if(err){
				console.log("Error al enviar")
			}
			else{
				let name = "";
				if ( data.length > 3 ){
					data = JSON.parse(data);
					name = data.first_name;
					callback(clase, name);
				}
				else{
					name = "no"
					callback(clase, name);
				}

			}
		});
	}

	handlePostback(msg){
		let payload = msg.payload;
		
		if(  payload === "empezar"){
			this.getName(this.senderId, function(clase, name){
				let response = {
					text: `Hola ${name} bienvenido a MicroTec. 📱 Descubre nuestras diferentes formas de estrenar tu nuevo celular y promociones que tenemos para ti. 👍 Desliza para ver nuestras opciones 👆`
				}
				let template = clase.templateGeneric();
				clase.actionBot('typing');
				clase.callSendAPI(response);
				clase.callSendAPI(template);
			});
		}
		else if( payload === 'btn_promo_contratar' ){

			this.actionBot('typing');
			let template = this.templateGeneric2();
			this.callSendAPI(template);

		}
		else if(payload === 'btn_cotizar_3000' || payload === 'btn_cotizar_5000' || payload === 'btn_cotizar_6000'){
			this.actionBot('typing');
			let texto = "Tenemos dos opciones para cotizar tu equipo, vía Facebook (un asesor te atenderá por este medio) o vía llamada (un asesor se comunicará contigo por teléfono), por favor selecciona tu preferida";
			let botones = [this.btnPostback("Vía Facebook", "btn_cambiar_agente_live"), this.btnPostback("Vía llamada", "btn_pedir_ubicacion")];
			this.callSendAPI( this.templateBtn(texto, botones) );
		}
		else if(payload === 'btn_cambiar_agente_live'){
			this.actionBot('typing');
			this.callSendAPI({text: 'Gracias, en unos momentos un asesor te escribirá'});
			this.passThreadControl();
		}
		else if(payload === 'btn_pedir_ubicacion'){
			this.actionBot('typing');
			let response = {
			    "text": `Que bien que podamos seguir charlando, para continuar por favor, dime de donde te comunicas, o si prefieres, puedes mandar tu ubicación`,
			    "quick_replies":[
			      {
			        "content_type":"location"
			      }
			    ]
			  }
			this.actionBot('typing');
			this.callSendAPI(response);
		}
		else{
			let response = {
				text: "presionaste un boton de postback con valor " + payload
			}
			this.actionBot('typing');
			this.callSendAPI(response);
		}
	}

	btnPostback( titulo, payload ){
		return {
			type: "postback",
			payload: payload,
			title: titulo
		}
	}

	btnShare(){
		return{
			"type": "element_share"
			//"share_contents": this.templateGeneric()
		}
	}

	btnUrl(title, url){
		return {
			"type":"web_url",
			"url": url,//debe ser https si mennsenger extension es true
			"title": title,//maximo de 20 caracteres
			"webview_height_ratio": 'full' //puede ser tall|full|compact,
			//"messenger_extensions": false,//booleano
			//"fallback_url": "url"//url a usar para clientes que no soportan mennsenger extension, solo si es true messenger extension
		}
	}

	templateMedia(type, id){
		return {
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "media",
					"elements": [
						{
							"media_type": type,
							"attachment_id": id,
							"buttons": [
								this.btnPostback('me gusto', 'si'),
								this.btnPostback('no me gusto', 'no'),
								this.btnShare()
							]
						}
					]
				}
			}
		}
	}
/**
 * [templateBtn description] estructura de una plantilla de botones con un texto y hasta 3 botones
 * @param  {String} texto Cadena que se mostrara la usuario
 * @param  {array} btns  matriz de
 * @return {Objecto} estructura del template.  
 */
	templateBtn(texto = 'sin texto personalizado', botones ){
		botones = botones || [this.btnPostback('boton', 'valor normal')];
		return {
			attachment: {
				type: "template",
				payload: {
					template_type: "button",
					text: texto,
					buttons: botones
				}
			}
		}
	}

	templateList(){
	    
	    return {
	    	"attachment": {
		    	"type": "template",
		      	"payload": {
		        	"template_type": "list",
		        	"top_element_style": "large",//puede ser compact
		        	"buttons": [
		        		this.btnCustom("Leer mas", "https://www.micro-tec.com.mx/pagina/microtec")
		        	],
		        	"elements": [
		        		{
		        			"title": "titulo con 80 caracteres",
		        			"subtitle": "subtitulo con 80 caracteres",
		        			"image_url": "https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
		        			"buttons": [
		        				this.btnPostback('boton', 'valor')
		        			]
		        		},
		        		{
		        			"title": "clasico de los 80",
		        			"subtitle": "mira los discos",
		        			"image_url": "https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
		        			"default_action": {
		        				"type": "web_url",
		        				"url": "https://www.micro-tec.com.mx/pagina/microtec"
		        			}
		        		},
		        		{

		        			"title": "Classic Blue T-Shirt",
				            "image_url": "https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
				            "subtitle": "100% Cotton, 200% Comfortable",
				            "default_action": {
				              "type": "web_url",
				              "url": "https://www.micro-tec.com.mx/pagina/microtec",
				              "webview_height_ratio": "tall"
				            },
				            "buttons": [
				              {
				                "title": "Shop Now",
				                "type": "web_url",
				                "url": "https://www.micro-tec.com.mx/pagina/microtec",
				                "webview_height_ratio": "tall"
				              }
				            ]

		        		}
		        	]
		      	}
		    }
		}


	}//end Function

	templateGeneric(){
	    
	    return {
		    "attachment":{
		    	"type":"template",
		  		"payload": {
					"template_type":"generic",
					//"sharable": true,//opcional
					"image_aspect_ratio": "horizontal",//opcional, square ó horizontal(predeterminado)
	  				"elements":[
						{
							"title":"Contrata o renueva tu plan tarifario y llévate un Smartphone desde $199 al mes",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							//"subtitle":"",
							/*"default_action": {
								"type": "web_url",
								"url": "https://www.micro-tec.com.mx/pagina/microtec",
								//"messenger_extensions": <TRUE | FALSE>,
								//"webview_height_ratio": "<COMPACT | TALL | FULL>"
							},*/
							"buttons":[
								this.btnPostback("Promos al Contratar", "btn_promo_contratar"),
								this.btnPostback("Promos al Renovar", "btn_promo_renovar")
							]
						},//endTemplate
						{
							"title":"Estrena celular a crédito pagando desde 15% de enganche y los demás a 12 meses",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"buttons":[
								this.btnPostback("Tarjeta Amigo Fácil", "btn_taf"),
								this.btnPostback("Crédito con Facebook", "btn_credito_face")
							]
						},//endTemplate
						{
							"title":"Llevarte tu celular de contado con las mejores promos o apártalo con $50 pesos",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"buttons":[
								this.btnPostback("Promoción al Contado", "btn_promo_contado"),
								this.btnPostback("Promoción Apartado", "btn_promo_apartado")
							]
						},//endTemplate
						{
							"title":"Nuevo internet en casa telcel (internet ilimitado desde $199 mensuales)",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"subtitle":"Internet $199/mes con 5 Mbps, Internet $349/mes con 10 Mbps",
							"buttons":[
								this.btnPostback("paquete $199", "btn_internet_199"),
								this.btnPostback("paquete $349", "btn_internet_349")
							]
						},//endTemplate
						{
							"title":"Visita Nuestras tiendas MicroTec donde seguro estrenas",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"subtitle":"Ve a nuestra pagina de internet para localizar nuestras sucursales Microtec",
							"buttons":[
								this.btnPostback("¡Ubica tu sucursal!", "btn_ubica_sucursal")
							]
						},//endTemplate
						{
							"title":"¿No encontrate lo que deseabas? Habla con uno de nuestros asesores",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"buttons":[
								this.btnPostback("Agente en vivo", "btn_agente_live")
							]
						}
					]//endElements
				}//endPayload
		    }//enAttachment
		}


	}//end Function

	templateGeneric2(){
	    
	    return {
		    "attachment":{
		    	"type":"template",
		  		"payload": {
					"template_type":"generic",
					"image_aspect_ratio": "horizontal",//opcional, square ó horizontal(predeterminado)
	  				"elements":[
						{
							"title":"Incluye 3000mb para navegar + Redes Sociales + llamadas/mensajes ilimitados + 📱",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"buttons":[
								this.btnPostback("Cotizar", "btn_cotizar_3000")
							]
						},//endTemplate
						{
							"title":"Incluye 5000mb para navegar + Redes Sociales + llamadas/mensajes ilimitados + 📱",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"buttons":[
								this.btnPostback("Cotizar", "btn_cotizar_5000")
							]
						},//endTemplate
						{
							"title":"Incluye 6000mb para navegar + Redes Sociales + llamadas/mensajes ilimitados + 📱",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"buttons":[
								this.btnPostback("Cotizar", "btn_cotizar_6000")
							]
						}
					]//endElements
				}//endPayload
		    }//enAttachment
		}


	}//end Function
	



	callSendAPI(response){
		setTimeout( ()=>{
			let data = {
				messaging_type: 'response',
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
		}, 2000);

	}

	//la accion del bot cuando reciba un mensaje, lo aconsejable,
	//cuando reciba un mensaje que va a responder, es bueno tipear.
	//si no va a responder el mensaje, que lo marque como visto
	actionBot( action ){
		if( action === 'typing' ){
			action = {
			  "recipient":{
			  	"id": this.senderId
			  },
			  "sender_action":"typing_on"
			};
		}
		else{
			action = {
			  "recipient":{
			  	"id": this.senderId
			  },
			  "sender_action":"mark_seen"
			};
		}
		request({
			"uri": "https://graph.facebook.com/v2.6/me/messages",
		    "qs": { "access_token": this.APP_TOKEN },
		    "method": "POST",
		    "json": action
		}, (err, res, body) => {
			if (!err) {
		    	console.log('¡tipeando...!')
		    }
		    else {
		    	console.error("Imposible tipear:" + err);
		    }
		});
	}

	findLocation(lat, long, callback){
		let clase = this;
		request({
			uri: 'https://maps.googleapis.com/maps/api/geocode/json',
			qs: {
				latlng: lat+","+long,
				key: "AIzaSyB8UTMBAxOYzocL4dewFSlBaEKeqJ26O3o",
				result_type: "street_address"
			},
			method: 'POST'
		}, function(err, response, data){
			if(err){
				console.log("Error en la petición de ubicación")
			}
			else{
				//a modo de prueba regreso mi primera ubicacion
				data = JSON.parse(data);
				
				switch (data.status) {
					case "OK":
						let disponible = {'oaxaca': ['oaxaca de Juarez', 'san juan bautista tuxtepec', 'san juan cotzocon', 'villa de etla' ], 'puebla': ['amixtlan', 'atempan', 'cuyoaco', 'huauchinango', 'hueytamalco', 'juan galindo', 'libres', 'pahuatlan', 'puebla', 'san martin texmelucan', 'teziutlan', 'tlatlauquitepec', 'xicotepec', 'zacapoaxtla', 'zautla'], 'veracruz': ['filomeno mata', 'gutierrez zamora', 'ixhuatlan de madero', 'martinez de la torre', 'mecatlan', 'papantla', 'playa vicente', 'poza rica', 'tantoyuca', 'tihuatlan', 'tuxpan'] };

						let storableLocation = {
							city: 'desconocida',
							state: 'desconocida',
							country: 'desconocida'
						};
						for( let i = 0; i < data.results[0].address_components.length; i++ ){

							let component = data.results[0].address_components[i];
							if( component.types.includes('sublocality') || component.types.includes('locality') ){
								storableLocation.city = component.long_name;
							}
							if( component.types.includes('administrative_area_level_1') ){
								storableLocation.state = component.long_name;
							}
							if( component.types.includes('country') ){
								storableLocation.country = component.long_name;
							}

						}
						//let location =  clase.transformString( data.results[0].formatted_address );
						let place = `Tu localidad es ${storableLocation.city}, el estado es ${storableLocation.state} y el pais es ${storableLocation.country}`;
						callback(clase, place);

						break;
					case 'ZERO_RESULTS':
						callback(clase, "Lo siento no logre encontrar tu localidad, mejor escribemelo, por fa (sin resultados)");
						break;
					case 'OVER_QUERY_LIMIT':
						callback(clase, "Lo siento no logre encontrar tu localidad, mejor escribemelo, por fa (cuota excedida)");
						break;
					case 'REQUEST_DENIED':
						callback(clase, "Lo siento no logre encontrar tu localidad, mejor escribemelo, por fa (rechazada)");
						break;
					case 'INVALID_REQUEST':
						callback(clase, "Lo siento no logre encontrar tu localidad, mejor escribemelo, por fa (falta consulta)");
						break;
					case 'UNKNOWN_ERROR':
						callback(clase, "Enviame otra vez tu ubicación, que no pude verla bien :p");
						break;
				}

			}

		});
	}

	transformString(cadena){
		cadena = cadena.toLowerCase();
		cadena = cadena.replace(/[àáâãäå]/g, 'a');
		cadena = cadena.replace(/[èéêë]/g, 'e');
		cadena = cadena.replace(/[ìíîï]/g, 'i');
		cadena = cadena.replace(/[òóôõö]/g, 'o');
		cadena = cadena.replace(/[ùúûü]/g, 'u');
		cadena = cadena.replace(/ñ/g, 'n');
		return cadena;
	}

	
	passThreadControl(){
	/*	curl -X POST -H "Content-Type: application/json" -d '{
	  "recipient":{"id":"<PSID>"},
	  "target_app_id":123456789,
	  "metadata":"String to pass to secondary receiver app" 
	}' "https://graph.facebook.com/v2.6/me/pass_thread_control?access_token=<PAGE_ACCESS_TOKEN>"
	*/

		let info = {
			recipient: {
				id: this.senderId
			},
			target_app_id: 263902037430900,
			metadata: "El usuario a decidio hablar con un Agente en linea"
		}
		request({
			"uri": "https://graph.facebook.com/v2.6/me/pass_thread_control",
		    "qs": { "access_token": this.APP_TOKEN },
		    "method": "POST",
		    "json": info
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