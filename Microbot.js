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

			//para verificar cuando se precionen botones quick replies, pero creo que no los voy a usar
			//if(msg.quick_reply){
			if(false){
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
				
				if( ubicacion && ubicacion.confidence > 0.7){

					this.findLocation("address", ubicacion.value, undefined, function(that, lugar){
						//con esta obtenemos una url de la ubicacion de mapa de google maps
						let mapa = that.staticMap(ubicacion.value);
						let elementos = [
							{
								"title": lugar.country,
								"image_url": mapa,
								"subtitle": "Ciudad " + lugar.city + ", Estado " + lugar.state,
								"buttons":[
									that.btnPostback("Exacto, ¡aqui vivo!", "btn_verificar_disponibilidad&"+JSON.stringify(lugar) ),
									that.btnPostback("No, estas mal", "btn_pedir_ubicacion_otra_vez")
								]
							}//endTemplate
						];
						that.actionBot('typing');
						let texto = {text: "¿Es aqui tu ubicación?"}
						that.callSendAPI(texto);
						let template = that.templateGeneric(elementos);
						that.callSendAPI(template);
					});
				}
				else if(telefono && telefono.confidence > 0.7){
					let cleanNum = telefono.value.replace(/[\s-\/]/g, "");
					if(cleanNum.length < 10){
						let response = {text: "Lo siento, pero tu número no es valido, por favor vuelve a ingresarlo y recuerda que debe ser a 10 digitos por fa"};
						this.actionBot('typing');
						this.callSendAPI(response);
					}
					else{
						let texto = "Para confirmar, ¿Es este tu número de telefono? *" + telefono.value+"*";
						let btns = [this.btnPostback('Si, asi es', 'btn_confirma_telefono'), this.btnPostback('No', 'btn_pedir_numero')];
						let template = this.templateBtn(texto, btns);
						this.actionBot('typing');
						this.callSendAPI(template);
					}
					
				
				}
				else if(intent && intent.confidence > 0.7 && intent.value === "saludo"){
					this.getName(this.senderId, function(clase, name){
						let response = {
							text: `Hola ${name} bienvenido a MicroTec. 📱 Descubre nuestras diferentes formas de estrenar tu nuevo celular y promociones que tenemos para ti 👍. Desliza para ver nuestras opciones 👆`
						}
						let elementos = [
						{
							"title":"Contrata o renueva tu plan tarifario y llévate un Smartphone desde $199 al mes",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"buttons":[
								clase.btnPostback("Promos al Contratar", "btn_promo_contratar"),
								clase.btnPostback("Promos al Renovar", "btn_promo_renovar")
							]
						},//endTemplate
						{
							"title":"Estrena celular a crédito pagando desde 15% de enganche y los demás a 12 meses",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"buttons":[
								clase.btnPostback("Tarjeta Amigo Fácil", "btn_taf"),
								clase.btnPostback("Crédito con Facebook", "btn_credito_face")
							]
						},//endTemplate
						{
							"title":"Llevarte tu celular de contado con las mejores promos o apártalo con $50 pesos",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"buttons":[
								clase.btnPostback("Promoción al Contado", "btn_promo_contado"),
								clase.btnPostback("Promoción Apartado", "btn_promo_apartado")
							]
						},//endTemplate
						{
							"title":"Nuevo internet en casa telcel (internet ilimitado desde $199 mensuales)",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"subtitle":"Internet $199/mes con 5 Mbps, Internet $349/mes con 10 Mbps",
							"buttons":[
								clase.btnPostback("paquete $199", "btn_internet_199"),
								clase.btnPostback("paquete $349", "btn_internet_349")
							]
						},//endTemplate
						{
							"title":"Visita Nuestras tiendas MicroTec donde seguro estrenas",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"subtitle":"Ve a nuestra pagina de internet para localizar nuestras sucursales Microtec",
							"buttons":[
								clase.btnPostback("¡Ubica tu sucursal!", "btn_ubica_sucursal")
							]
						},//endTemplate
						{
							"title":"¿No encontrate lo que deseabas? Habla con uno de nuestros asesores",
							"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
							"buttons":[
								clase.btnPostback("Agente en vivo", "btn_agente_live")
							]
						}
					]//endElements

						let template = clase.templateGeneric( elementos );
						clase.actionBot('typing');
						clase.callSendAPI(response);
						clase.callSendAPI(template);
					});
				}
				else{
					this.actionBot('mark_seen');
				}
			}
			
		}
		else if(msg.attachments){

			//si el adjunto es de type location
			if(msg.attachments[0].type === "location"){
				
				this.findLocation("coor", msg.attachments[0].payload.coordinates.lat, msg.attachments[0].payload.coordinates.long, function(that, lugar){
					///////////////////////////
					let response;
					let estados = ['puebla', 'oaxaca', 'veracruz', 'tlaxcala'];
					//flag para comprobar si hay microtec en su estado. devuelve ture o false
					let flag = estados.includes( that.transformString( lugar.state ) );
					if( !flag ){
						response = {
							text: "Aunque me gustaría atenderte, lo siento Microtec no tiene cobertura en tu ciudad 😔, y asi seria dificil poder atenderte"
						}
					}
					else{
						response = {
							text: "Excelente, ahora podrias brindarme un numero de teléfono para poder comunicarnos contigo",
							"quick_replies":[
								{
									"content_type": "user_phone_number"
								}
							]
						}

					}
					that.actionBot('typing');
					that.callSendAPI(response);

				});

			}
			else{
				//cuando reciba adjunto lo dejare en visto
				/*
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
									title: "¿Por que me enviaste una imagen?",
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
				*/
				this.actionBot('mark_seen');

			}
		}

	}

	handlePostback(msg){
		let payload = msg.payload;
		
		if(  payload === "empezar"){
			this.getName(this.senderId, function(clase, name){
				let response = {
					text: `Hola ${name} bienvenido a MicroTec. 📱 Descubre nuestras diferentes formas de estrenar tu nuevo celular y promociones que tenemos para ti. 👍 Desliza para ver nuestras opciones 👆`
				}
				
				let elementos = [
					{
						"title":"Contrata o renueva tu plan tarifario y llévate un Smartphone desde $199 al mes",
						"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
						"buttons":[
							clase.btnPostback("Promos al Contratar", "btn_promo_contratar"),
							clase.btnPostback("Promos al Renovar", "btn_promo_renovar")
						]
					},//endTemplate
					{
						"title":"Estrena celular a crédito pagando desde 15% de enganche y los demás a 12 meses",
						"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
						"buttons":[
							clase.btnPostback("Tarjeta Amigo Fácil", "btn_taf"),
							clase.btnPostback("Crédito con Facebook", "btn_credito_face")
						]
					},//endTemplate
					{
						"title":"Llevarte tu celular de contado con las mejores promos o apártalo con $50 pesos",
						"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
						"buttons":[
							clase.btnPostback("Promoción al Contado", "btn_promo_contado"),
							clase.btnPostback("Promoción Apartado", "btn_promo_apartado")
						]
					},//endTemplate
					{
						"title":"Nuevo internet en casa telcel (internet ilimitado desde $199 mensuales)",
						"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
						"subtitle":"Internet $199/mes con 5 Mbps, Internet $349/mes con 10 Mbps",
						"buttons":[
							clase.btnPostback("paquete $199", "btn_internet_199"),
							clase.btnPostback("paquete $349", "btn_internet_349")
						]
					},//endTemplate
					{
						"title":"Visita Nuestras tiendas MicroTec donde seguro estrenas",
						"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
						"subtitle":"Ve a nuestra pagina de internet para localizar nuestras sucursales Microtec",
						"buttons":[
							clase.btnPostback("¡Ubica tu sucursal!", "btn_ubica_sucursal")
						]
					},//endTemplate
					{
						"title":"¿No encontrate lo que deseabas? Habla con uno de nuestros asesores",
						"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
						"buttons":[
							clase.btnPostback("Agente en vivo", "btn_agente_live")
						]
					}
				]//endElements

				let template = clase.templateGeneric(elementos);
				clase.actionBot('typing');
				clase.callSendAPI(response);
				clase.callSendAPI(template);
			});
		}
		else if( payload === 'btn_promo_contratar' ){

			this.actionBot('typing');
			let elementos = [
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

			let template = this.templateGeneric(elementos);
			this.callSendAPI(template);

		}
		else if(payload === 'btn_cotizar_3000' || payload === 'btn_cotizar_5000' || payload === 'btn_cotizar_6000' || payload === 'btn_cotizar_7000' || payload === 'btn_cotizar_8000' || payload === 'btn_cotizar_9000'){
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
			    "text": `Que bien que podamos seguir charlando, para continuar por favor, dime de donde te comunicas, o si prefieres, puedes mandarme tu ubicación`,
			    "quick_replies":[
			      {
			        "content_type":"location"
			      }
			    ]
			  }
			this.actionBot('typing');
			this.callSendAPI(response);
		}
		else if( payload === "btn_pedir_ubicacion_otra_vez" ){
			this.actionBot('typing');
			let response = {
			    "text": `Lo siento, para poder brindarme un mejor servicio, no seas malo, escribe tu ubicación más especifica, o comparteme tu ubicación`,
			    "quick_replies":[
			      {
			        "content_type":"location"
			      }
			    ]
			  }
			this.actionBot('typing');
			this.callSendAPI(response);
		}
		else if( /btn_verificar_disponibilidad/g.test(payload) ){

			let partes = payload.split('&');
			let lugar = JSON.parse(partes[1]);

			let estados = ['puebla', 'oaxaca', 'veracruz', 'tlaxcala'];

			let response;
			//flag para comprobar si hay microtec en su estado. -1 si no esta, indice si esta
			let flag = estados.includes( this.transformString( lugar.state ) );
			if( !flag ){
				response = {
					text: "Aunque me gustaría atenderte, lo siento Microtec no tiene cobertura en tu ciudad 😔, y asi seria dificil poder atender"
				}
			}
			else{
				response = {
					text: "Excelente, ahora podrias brindarme un numero de teléfono para poder comunicarnos contigo",
					"quick_replies":[
						{
							"content_type": "user_phone_number"
						}
					]
				}

			}
			
			this.actionBot('typing');
			this.callSendAPI(response);

		}
		else if(payload === 'btn_pedir_numero'){
			let response = {
				text: "Excelente, por favor escribeme un número para que un agente pueda comunicarse contigo homs",
				"quick_replies":[
					{
						"content_type": "user_phone_number"
					}
				]
			}
			this.actionBot('typing');
			this.callSendAPI(response);
		}
		else if( payload === 'btn_confirma_telefono' ){
			this.actionBot('typing');
			let template = this.templateBtn("Gracias amigo, en el transcurso del día uno de nuestros agentes se comunicara contigo, si quieres seguir explorando regresa al menu principal", [this.btnPostback('Menu', 'empezar')]);
			this.callSendAPI(template);
		}
		else if(payload === 'btn_promo_renovar'){
			this.actionBot('typing');
			let elementos = [
				{
					"title":"Incluye 5000mb para navegar + Redes sociales, llamadas/msj sin limite + Equipo",
					"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
					"buttons":[
						this.btnPostback("Cotizar", "btn_cotizar_3000")
					]
				},//endTemplate
				{
					"title":"Incluye 6000mb para navegar + Redes sociales, llamadas/msj sin limite + Equipo",
					"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
					"buttons":[
						this.btnPostback("Cotizar", "btn_cotizar_6000")
					]
				},//endTemplate
				{
					"title":"Incluye 7000mb para navegar + Redes sociales, llamadas/msj sin limite + Equipo",
					"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
					"buttons":[
						this.btnPostback("Cotizar", "btn_cotizar_7000")
					]
				},
				{
					"title":"Incluye 8000mb para navegar + Redes sociales, llamadas/msj sin limite + Equipo",
					"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
					"buttons":[
						this.btnPostback("Cotizar", "btn_cotizar_8000")
					]
				},//endTemplate
				{
					"title":"Incluye 9000mb para navegar + Redes sociales, llamadas/msj sin limite + Equipo",
					"image_url":"https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
					"buttons":[
						this.btnPostback("Cotizar", "btn_cotizar_9000")
					]
				}
			]//endElements

			let template = this.templateGeneric(elementos);
			this.callSendAPI(template);

		}
		else if(payload === 'btn_taf' || payload === 'btn_credito_face'){
			let btn;
			if(payload === 'btn_taf'){
				btn = this.btnPostback('Cotizar', 'btn_cotizar_taf');
			}
			else{
				btn = this.btnPostback('Cotizar', 'btn_cotizar_face')
			}

			let elementos = [
        		{
        			"title": "Estrena celular pagando desde el 15% de enganche y 12 pagos desde $192 mensuales",
        			//"subtitle": "subtitulo con 80 caracteres",
        			"image_url": "https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
        			"buttons": [
        				btn
        			]
        		},
        		{
        			"title": "Estrena celular pagando desde el 15% de enganche y 12 pagos desde $192 mensuales",
        			//"subtitle": "subtitulo con 80 caracteres",
        			"image_url": "https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
        			"buttons": [
        				btn
        			]
        		},{
        			"title": "Estrena celular pagando desde el 15% de enganche y 12 pagos desde $192 mensuales",
        			//"subtitle": "subtitulo con 80 caracteres",
        			"image_url": "https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
        			"buttons": [
        				btn
        			]
        		}
        	]
        	let template = this.templateList(elementos);
        	this.actionBot('typing');
        	this.callSendAPI(template);
		}
		else if(payload === 'btn_cotizar_taf' ){
			let response = `Para tramitar tu crédito solo es necesario una identificación oficial vigente y un comprobante domiciliario, deberás acudir a tu sucursal MicroTec más cercana para realizar el trámite. Recuerda que contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca`
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(response, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(template);
			this.callSendAPI(menu);
		}
		else if(payload === 'btn_cotizar_face'){
			let texto = `Para tramitar tu crédito con tu cuenta de facebook solo es necesario una identificación oficial vigente, un número celular activo y tu cuenta activa de Facebook, deberás acudir a tu sucursal MicroTec más cercana para realizar el trámite. Recuerda que contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca`;
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(texto, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(template);
			this.callSendAPI(menu);
		}
		else if(payload === 'btn_promo_contado'){
			let btn = this.btnPostback('Cotizar', 'btn_cotizar_promo_contado');
			let elementos = [
				{
        			"title": "$1,999 tenemos una gran variedad de marcas y modelos",
        			//"subtitle": "subtitulo con 80 caracteres",
        			"image_url": "https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
        			"buttons": [
        				btn
        			]
        		},
        		{
        			"title": "$999 tenemos una gran variedad de marcas y modelos",
        			//"subtitle": "subtitulo con 80 caracteres",
        			"image_url": "https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
        			"buttons": [
        				btn
        			]
        		},
        		{
        			"title": "$599 tenemos una gran variedad de marcas y modelos",
        			//"subtitle": "subtitulo con 80 caracteres",
        			"image_url": "https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
        			"buttons": [
        				btn
        			]
        		}
			];
			let template = this.templateList(elementos);
			this.actionBot('typing');
			this.callSendAPI(template);
		}
		else if(payload === 'btn_cotizar_promo_contado'){
			let texto = `En Microtec podrás encontrar una gran variedad de marcas y modelos para que te lleves el celular de tus sueños o tengas el regalo perfecto. Encuentra tu tienda más cercana para ver nuestros celulares y accesorios. Recuerda que contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca`;
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(texto, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(template);
			this.callSendAPI(menu);
		}
		else if(payload === 'btn_promo_apartado'){
			let btn = this.btnPostback('Cotizar', 'btn_cotizar_promo_apartado');
			let elementos = [
				{
        			"title": "$599 apartalo desde $50 pesos tenemos una gran variedad de marcas y modelos",
        			//"subtitle": "subtitulo con 80 caracteres",
        			"image_url": "https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
        			"buttons": [
        				btn
        			]
        		},
        		{
        			"title": "$599 apartalo desde $50 pesos tenemos una gran variedad de marcas y modelos",
        			//"subtitle": "subtitulo con 80 caracteres",
        			"image_url": "https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
        			"buttons": [
        				btn
        			]
        		},
        		{
        			"title": "$599 apartalo desde $50 pesos tenemos una gran variedad de marcas y modelos",
        			//"subtitle": "subtitulo con 80 caracteres",
        			"image_url": "https://i1.wp.com/wp.micro-tec.com.mx/wp-content/uploads/2017/11/cropped-microtec-2-1.png",
        			"buttons": [
        				btn
        			]
        		}
			];
			let template = this.templateList(elementos);
			this.actionBot('typing');
			this.callSendAPI(template);
		}
		else if(payload === 'btn_cotizar_promo_apartado'){
			let texto = `En Microtec podrás encontrar una gran variedad de marcas y modelos para que te lleves el celular de tus sueños o tengas el regalo perfecto. Apártalo con $50 pesos o más y termínalo de pagar hasta en 3 meses. Encuentra tu tienda más cercana para ver nuestros celulares y accesorios. Recuerda que contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca`;
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(texto, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(template);
			this.callSendAPI(menu);
		}
		else if (payload === 'btn_internet_199') {
			let texto = `En Microtec podrás encontrar el nuevo internet en casa, que te ofrece internet ilimitado con renta mensual de $199 y velocidad de 5 Mbps.
- ubicas el lugar donde va estar 
- conectas el modem a la corriente 
- y disfruta de internet ilimitado en tus dispositivos 
Encuentra tu tienda más cercana para realizar el trámite, solo con una identificación oficial vigente y un comprobante de domicilio.  
Ubicar tu tienda a traves de nuestro portal web, recuerda que contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca`;
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(texto, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(template);
			this.callSendAPI(menu);
		}
		else if (payload === 'btn_internet_349') {
			let texto = `En Microtec podrás encontrar el nuevo internet en casa, que te ofrece internet ilimitado con renta mensual de $349 y velocidad de 10 Mbps. 
- ubicas el lugar donde va estar 
- conectas el modem a la corriente 
- y disfruta de internet ilimitado en tus dispositivos 
Encuentra tu tienda más cercana para realizar el trámite, solo con una identificación oficial vigente y un comprobante de domicilio. 
Ubicar tu tienda a traves de nuestro portal web, recuerda que contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca`;
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(texto, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(template);
			this.callSendAPI(menu);
		}
		else if( payload === 'btn_ubica_sucursal' ){
			let texto = `Encuentra tu tienda más cercana contamos con gran variedad de equipos y modelos, además tenemos los accesorios que tu necesitas para tu celular, recarga tiempo aire y paga tus servicios. Ubicar tu tienda, contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca`;
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(texto, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(template);
			this.callSendAPI(menu);
		}
		else if( payload === 'btn_agente_live' ){
			let texto = `Excelente con gusto podemos ayudarte, dinos ¿Cuál es tu duda? o ¿Qué servicio buscas? Y en breve uno de nuestros asesores te contestará`;
			this.actionBot('typing');
			this.callSendAPI({text: texto});
			this.passThreadControl();
		}
		else{
			this.actionBot('mark_seen');
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

	templateList(elements){
	    
	    return {
	    	"attachment": {
		    	"type": "template",
		      	"payload": {
		        	"template_type": "list",
		        	"top_element_style": "compact",//puede ser compact o large
		        	/*"buttons": [
		        		this.btnCustom("Leer mas", "https://www.micro-tec.com.mx/pagina/microtec")
		        	],*/
		        	"elements": elements
		      	}
		    }
		}


	}//end Function

	templateGeneric( elementos ){
	    
	    return {
		    "attachment":{
		    	"type":"template",
		  		"payload": {
					"template_type":"generic",
					//"sharable": true,//opcional
					"image_aspect_ratio": "horizontal",//opcional, square ó horizontal(predeterminado)
	  				"elements": elementos 
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

	findLocation(type, lat, long, callback){
		let clase = this;
		
		if(type == 'coor'){
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
							//let place = `Tu localidad es ${storableLocation.city}, el estado es ${storableLocation.state} y el pais es ${storableLocation.country}`;
							callback(clase, storableLocation);

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
		else{
			request({
				uri: 'https://maps.googleapis.com/maps/api/geocode/json',
				qs: {
					address: lat,//lat es la direccion como nombre
					key: "AIzaSyB8UTMBAxOYzocL4dewFSlBaEKeqJ26O3o"
				},
				method: 'GET'
			}, function(err, response, data){
				if(err){
					console.log("Error en la petición de ubicación")
				}
				else{
					//a modo de prueba regreso mi primera ubicacion
					console.log("entro a la parte de address");
					data = JSON.parse(data);
					console.log(data);
					
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
							//let place = `Tu localidad es ${storableLocation.city}, el estado es ${storableLocation.state} y el pais es ${storableLocation.country}`;
							callback(clase, storableLocation);

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
		
	}

	staticMap(ubicacion){
		return encodeURI("https://maps.googleapis.com/maps/api/staticmap?center="+ubicacion+"&zoom=14&size=600x400&key=AIzaSyB8UTMBAxOYzocL4dewFSlBaEKeqJ26O3o")
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