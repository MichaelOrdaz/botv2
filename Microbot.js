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
					//this.callSendAPI({text: "escribiste: " + ubicacion.value});
					
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
									that.btnPostback("Poner otra ubicación", "btn_pedir_ubicacion_otra_vez")
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
						let texto = "Para confirmar, ¿Es este tu número de teléfono? *" + telefono.value+"*";
						let btns = [this.btnPostback('Si, es correcto', 'btn_confirma_telefono'), this.btnPostback('No', 'btn_pedir_numero')];
						let template = this.templateBtn(texto, btns);
						this.actionBot('typing');
						this.callSendAPI(template);
					}
					
				
				}
				else if(intent && intent.confidence > 0.7 && intent.value === "saludo"){
					this.getName(this.senderId, function(clase, name){
						let response = {
							text: `Hola ${name} bienvenido a MicroTec. 📱 Descubre nuestras diferentes formas de estrenar tu nuevo celular y promociones que tenemos para ti 👍. Desliza para ver nuestras opciones 👉`
						}
						let elementos = [
							{
								"title":"Llévate un Smartphone incluido al Renovar o Contratar un plan",
								"subtitle": "En MicroTec tenemos planes desde $199 mensuales",
								"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/bot4.jpg",
								"buttons":[
									clase.btnPostback("Equipos al Contratar", "btn_promo_contratar"),
									clase.btnPostback("Equipos al Renovar", "btn_promo_renovar")
								]
							},//endTemplate
							{
								"title":"Estrena el celular de tus sueños en cómodas mensualidades",
								"subtitle": "Paga desde el 15% de enganche y los demás a 12 meses",
								"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/bot3.jpg",
								"buttons":[
									clase.btnPostback("Tarjeta Amigo Fácil", "btn_taf"),
									clase.btnPostback("Crédito con Facebook", "btn_credito_face")
								]
							},//endTemplate
							{
								"title":"Tenemos gran variedad de marcas y modelos",
								"subtitle": "Promociones exclusivas solo en MicroTec",
								"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/bot1.jpg",
								"buttons":[
									clase.btnPostback("Equipos de Contado", "btn_promo_contado"),
									clase.btnPostback("Equipos Apartado", "btn_promo_apartado")
								]
							},//endTemplate
							{
								"title":"Nuevo internet ilimitado en casa",
								"subtitle": "Ubica, Conecta y disfruta desde $199 al mes",
								"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/bot2.jpg",
								"buttons":[
									clase.btnPostback("Plan de $199", "btn_internet_199"),
									clase.btnPostback("Plan de $349", "btn_internet_349")
								]
							},//endTemplate
							{
								"title":"Visita Nuestras tiendas MicroTec donde seguro estrenas",
								"subtitle": "Puebla, Veracruz, Tlaxcala y Oaxaca",
								"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/bot6.jpg",
								"buttons":[
									clase.btnPostback("Ubica tu sucursal", "btn_ubica_sucursal")
								]
							},//endTemplate
							{
								"title":"¿No encontrate lo que deseabas?",
								"subtitle": "Habla con uno de nuestros asesores",
								"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/bot5.jpg",
								"buttons":[
									clase.btnPostback("Chatea con un asesor", "btn_agente_live")
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
							text: "Aunque nos gustaría atenderte, Microtec no tiene cobertura en tu ciudad 😔, te recomendamos acudir a Telcel de tu cuidad, gracias 👍"
						}
					}
					else{
						response = {
							text: "Excelente, ahora podrias brindarme un número teléfonico a 10 dígitos para poder comunicarnos contigo 📲",
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
					text: `Hola ${name} bienvenido a MicroTec. 📱 Descubre nuestras diferentes formas de estrenar tu nuevo celular y promociones que tenemos para ti. 👍 Desliza para ver nuestras opciones 👉`
				}
				
				let elementos = [
					{
						"title":"Llévate un Smartphone incluido al Renovar o Contratar un plan",
						"subtitle": "En MicroTec tenemos planes desde $199 mensuales",
						"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/bot4.jpg",
						"buttons":[
							clase.btnPostback("Equipos al Contratar", "btn_promo_contratar"),
							clase.btnPostback("Equipos al Renovar", "btn_promo_renovar")
						]
					},//endTemplate
					{
						"title":"Estrena el celular de tus sueños en cómodas mensualidades",
						"subtitle": "Paga desde el 15% de enganche y los demás a 12 meses",
						"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/bot3.jpg",
						"buttons":[
							clase.btnPostback("Tarjeta Amigo Fácil", "btn_taf"),
							clase.btnPostback("Crédito con Facebook", "btn_credito_face")
						]
					},//endTemplate
					{
						"title":"Tenemos gran variedad de marcas y modelos",
						"subtitle": "Promociones exclusivas solo en MicroTec",
						"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/bot1.jpg",
						"buttons":[
							clase.btnPostback("Equipos de Contado", "btn_promo_contado"),
							clase.btnPostback("Equipos Apartado", "btn_promo_apartado")
						]
					},//endTemplate
					{
						"title":"Nuevo internet ilimitado en casa",
						"subtitle": "Ubica, Conecta y disfruta desde $199 al mes",
						"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/bot2.jpg",
						"buttons":[
							clase.btnPostback("Plan de $199", "btn_internet_199"),
							clase.btnPostback("Plan de $349", "btn_internet_349")
						]
					},//endTemplate
					{
						"title":"Visita Nuestras tiendas MicroTec donde seguro estrenas",
						"subtitle": "Puebla, Veracruz, Tlaxcala y Oaxaca",
						"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/bot6.jpg",
						"buttons":[
							clase.btnPostback("Ubica tu sucursal", "btn_ubica_sucursal")
						]
					},//endTemplate
					{
						"title":"¿No encontrate lo que deseabas?",
						"subtitle": "Habla con uno de nuestros asesores",
						"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/bot5.jpg",
						"buttons":[
							clase.btnPostback("Chatea con un asesor", "btn_agente_live")
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
					"title":"Contrata un Plan de $399 al mes y llévate",
					"subtitle": "3000 Mb + Redes Sociales + llamadas + mensajes sin límite + smartphone",
					"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/plan2.jpeg",
					"buttons":[
						this.btnPostback("Cotizar", "btn_cotizar_3000")
					]
				},//endTemplate
				{
					"title":"Contrata un Plan de $499 al mes y llévate",
					"subtitle": "5000 Mb + Redes Sociales + llamadas + mensajes sin límite + smartphone",
					"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/plan7.jpeg",
					"buttons":[
						this.btnPostback("Cotizar", "btn_cotizar_5000")
					]
				},//endTemplate
				{
					"title":"Contrata un Plan de $599 al mes y llévate",
					"subtitle": "6000 Mb + Redes Sociales + llamadas + mensajes sin límite + smartphone",
					"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/plan16.jpeg",
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
			let texto = `Contamos con dos opciones para cotizar tu Plan, 
💻 Vía Facebook _un asesor te atenderá por este medio_ o 
📞 Vía llamada _un asesor se comunicará contigo por teléfono_, 
Por favor selecciona la opción de tu preferencia`;
			let botones = [this.btnPostback("Vía Facebook", "btn_cambiar_agente_live"), this.btnPostback("Vía llamada", "btn_pedir_ubicacion")];
			this.callSendAPI( this.templateBtn(texto, botones) );
		}
		else if(payload === 'btn_cambiar_agente_live'){
			this.actionBot('typing');
			this.callSendAPI({text: 'Gracias, uno de nuestros asesores te atenderá lo antes posible (horarios de atención de Lunes a Viernes de 11 am – 7 pm. Sábados de 11 am a 2 pm)'});
			this.passThreadControl();
		}
		else if(payload === 'btn_pedir_ubicacion'){
			this.actionBot('typing');
			let response = {
			    "text": `Gracias, para continuar por favor, dime de donde te comunicas, o si prefieres, puedes mandarme tu ubicación 📍`,
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
			    "text": `Lo siento, podrias escribir tu ubicación o si lo prefieres envia tu ubicación 👇`,
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
					text: "Excelente, ahora podrias brindarme un número telefónico a 10 dígitos para poder comunicarnos contigo 📲",
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
				text: "Excelente, por favor escribeme un número para que un agente pueda comunicarse contigo lo antes posible ☎",
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
			let template = this.templateBtn("Gracias amigo, en el transcurso del día uno de nuestros agentes se comunicará contigo, si quieres seguir explorando regresa al menu principal ✅", [this.btnPostback('Menu', 'empezar')]);
			this.callSendAPI(template);
		}
		else if(payload === 'btn_promo_renovar'){
			this.actionBot('typing');
			let elementos = [
				{
					"title":"Renueva con un Plan Platino 7000 y recibe $200 de descuento Total $599 al mes",
					"subtitle": "10000 Mb + Redes Sociales + llamadas + mensajes sin límite + Smartphone",
					"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/plan1.jpeg",
					"buttons":[
						this.btnPostback("Cotizar", "btn_cotizar_3000")
					]
				},//endTemplate
				{
					"title":"Renueva con un Plan Platino 8000 y recibe $200 de descuento Total $699 al mes",
					"subtitle": "11000 Mb + Redes Sociales + llamadas + mensajes sin límite + Smartphone",
					"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/plan9.jpeg",
					"buttons":[
						this.btnPostback("Cotizar", "btn_cotizar_6000")
					]
				},//endTemplate
				{
					"title":"Renueva con un Plan Platino 9000 y recibe $200 de descuento Total $799 al mes",
					"subtitle": "13000 Mb + Redes Sociales + llamadas + mensajes sin límite + Smartphone",
					"image_url":"https://www.micro-tec.com.mx/pagina/botv2/img/plan17.jpeg",
					"buttons":[
						this.btnPostback("Cotizar", "btn_cotizar_7000")
					]
				}
			]//endElements

			let template = this.templateGeneric(elementos);
			this.callSendAPI(template);

		}
		else if(payload === 'btn_taf'){
			let btn = this.btnPostback('Cotizar', 'btn_cotizar_taf');
			let elementos = [
        		{
        			"title": "Estrena un Alcatel U5 Plus con tu Tarjeta Amigo Fácil",
        			"subtitle": "Desde el 15% de enganche y 12 pagos de $192",
        			"image_url": "https://www.micro-tec.com.mx/pagina/botv2/img/plan4.jpeg",
        			"buttons": [
        				btn
        			]
        		},
        		{
        			"title": "Estrena un Polaroid Turbo C4 Plus con tu Tarjeta Amigo Fácil",
        			"subtitle": "Desde el 15% de enganche y 12 pagos de $120",
        			"image_url": "https://www.micro-tec.com.mx/pagina/botv2/img/plan15.jpeg",
        			"buttons": [
        				btn
        			]
        		},
        		{
        			"title": "Estrena un Xaomi Redmi 5 Plus con tu Tarjeta Amigo Fácil",
        			"subtitle": "Desde el 15% de enganche y 12 pagos de $442",
        			"image_url": "https://www.micro-tec.com.mx/pagina/botv2/img/plan5.jpeg",
        			"buttons": [
        				btn
        			]
        		}
        	]
        	let template = this.templateGeneric(elementos);
        	this.actionBot('typing');
        	this.callSendAPI(template);
		}
		else if(payload === 'btn_credito_face' ){
			let btn = this.btnPostback('Información', 'btn_cotizar_face')
			let elementos = [
        		{
        			"title": "Estrena un Moto C 4g pagando desde el 15% de enganche",
        			"subtitle": "Te autorizamos tu crédito con tu cuenta facebook",
        			"image_url": "https://www.micro-tec.com.mx/pagina/botv2/img/plan6.jpeg",
        			"buttons": [
        				btn
        			]
        		},
        		{
        			"title": "Estrena un Moto G6 Play desde el 15% de enganche",
        			"subtitle": "Te autorizamos tu crédito con tu cuenta facebook",
        			"image_url": "https://www.micro-tec.com.mx/pagina/botv2/img/plan13.jpeg",
        			"buttons": [
        				btn
        			]
        		},
        		{
        			"title": "Estrena un Samsung J7 Pro desde el 15% de enganche",
        			"subtitle": "Te autorizamos tu crédito con tu cuenta facebook",
        			"image_url": "https://www.micro-tec.com.mx/pagina/botv2/img/plan12.jpeg",
        			"buttons": [
        				btn
        			]
        		}
        	]
        	let template = this.templateGeneric(elementos);
        	this.actionBot('typing');
        	this.callSendAPI(template);

		}
		else if(payload === 'btn_cotizar_taf' ){
			let response = `Para tramitar tu crédito solo es necesario una identificación oficial vigente y un comprobante domiciliario, deberás acudir a tu sucursal MicroTec más cercana para realizar el trámite. Recuerda que contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca 📍`
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(response, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(template);
			this.callSendAPI(menu);

		}
		else if(payload === 'btn_cotizar_face'){
			let texto = `Para tramitar tu crédito con tu cuenta de facebook solo es necesario una identificación oficial vigente, un número celular activo y tu cuenta activa de Facebook, deberás acudir a tu sucursal MicroTec más cercana para realizar el trámite. Recuerda que contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca 📍`;
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(texto, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(menu);
			this.callSendAPI(template);
		}
		else if(payload === 'btn_promo_contado'){
			let btn = this.btnPostback('Comprar', 'btn_cotizar_promo_contado');
			let elementos = [
				{
        			"title": "Estrena un Nokia N3",
        			"subtitle": "Pantalla 5\" - Cámara 8 Mp - Memoria 8 Gb",
        			"image_url": "https://www.micro-tec.com.mx/pagina/botv2/img/plan8.jpeg",
        			"buttons": [
        				btn
        			]
        		},
        		{
        			"title": "Estrena un Oale X5",
        			"subtitle": "Pantalla 6\" - Cámara 13 Mp - Memoria 16 Gb",
        			"image_url": "https://www.micro-tec.com.mx/pagina/botv2/img/plan18.jpeg",
        			"buttons": [
        				btn
        			]
        		},
        		{
        			"title": "Estrena un RT Shock 5",
        			"subtitle": "Pantalla 5\" - Cámara 5 Mp - Memoria 8 Gb",
        			"image_url": "https://www.micro-tec.com.mx/pagina/botv2/img/plan19.jpeg",
        			"buttons": [
        				btn
        			]
        		}
			];
			let template = this.templateGeneric(elementos);
			this.actionBot('typing');
			this.callSendAPI(template);
		}
		else if(payload === 'btn_cotizar_promo_contado'){
			let texto = `En Microtec podrás encontrar una gran variedad de marcas y modelos para que te lleves el celular de tus sueños o tengas el regalo perfecto. Encuentra tu tienda más cercana para ver nuestros celulares y accesorios. Recuerda que contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca 📍`;
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(texto, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(template);
			this.callSendAPI(menu);
		}
		else if(payload === 'btn_promo_apartado'){
			let btn = this.btnPostback('Información', 'btn_cotizar_promo_apartado');
			let elementos = [
				{
        			"title": "Estrena un Huawei Y5 Pro en Microtec",
        			"subtitle": "Puedes apártarlo desde $50 pesos",
        			"image_url": "https://www.micro-tec.com.mx/pagina/botv2/img/plan20.jpeg",
        			"buttons": [
        				btn
        			]
        		},
        		{
        			"title": "Estrena un Lanix ilium en Microtec",
        			"subtitle": "Puedes apártarlo desde $50 pesos",
        			"image_url": "https://www.micro-tec.com.mx/pagina/botv2/img/plan23.jpeg",
        			"buttons": [
        				btn
        			]
        		},
        		{
        			"title": "Estrena un LG K8 en Microtec",
        			"subtitle": "Puedes apártarlo desde $50 pesos",
        			"image_url": "https://www.micro-tec.com.mx/pagina/botv2/img/plan21.jpeg",
        			"buttons": [
        				btn
        			]
        		},
			];
			let template = this.templateGeneric(elementos);
			this.actionBot('typing');
			this.callSendAPI(template);
		}
		else if(payload === 'btn_cotizar_promo_apartado'){
			let texto = `En Microtec podrás encontrar una gran variedad de marcas y modelos para que te lleves el celular de tus sueños o tengas el regalo perfecto. Apártalo con $50 pesos. Encuentra tu tienda más cercana para ver nuestros celulares y accesorios. Recuerda que contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca 📍`;
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(texto, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(template);
			this.callSendAPI(menu);
		}
		else if (payload === 'btn_internet_199') {
			let texto = `En Microtec podrás encontrar el nuevo internet en casa, que te ofrece internet ilimitado con renta mensual de $199 y velocidad de 5 Mbps.
✅ ubica el lugar donde va estar
✅ conectas el modem a la corriente 
✅ y disfruta de internet ilimitado en tus dispositivos 
Encuentra tu tienda más cercana para realizar el trámite, solo con una identificación oficial vigente y un comprobante de domicilio.  
Ubicar tu tienda a traves de nuestro portal web, recuerda que contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca 📍`;
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(texto, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(template);
			this.callSendAPI(menu);
		}
		else if (payload === 'btn_internet_349') {
			let texto = `En Microtec podrás encontrar el nuevo internet en casa, que te ofrece internet ilimitado con renta mensual de $349 y velocidad de 10 Mbps. 
✅ ubicas el lugar donde va estar 
✅ conectas el modem a la corriente 
✅ y disfruta de internet ilimitado en tus dispositivos 
Encuentra tu tienda más cercana para realizar el trámite, solo con una identificación oficial vigente y un comprobante de domicilio. 
Ubicar tu tienda a traves de nuestro portal web, recuerda que contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca 📍`;
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(texto, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(template);
			this.callSendAPI(menu);
		}
		else if( payload === 'btn_ubica_sucursal' ){
			let texto = `Encuentra tu tienda más cercana contamos con gran variedad de equipos y modelos, además tenemos los accesorios que tu necesitas para tu celular, recarga tiempo aire y paga tus servicios. Ubicar tu tienda, contamos con cobertura en Puebla, Veracruz, Tlaxcala y Oaxaca 📍`;
			let boton = [this.btnUrl('Tiendas Microtec 📎', 'https://www.micro-tec.com.mx/pagina/microtec/sucursales.html')];
			let template = this.templateBtn(texto, boton);

			let menu = this.templateBtn("Si deseas volver a ver mi menu de opciones, puedes hacerlo!!", [this.btnPostback('Menu', 'empezar')]);
			
			this.actionBot('typing');
			this.callSendAPI(template);
			this.callSendAPI(menu);
		}
		else if( payload === 'btn_agente_live' ){
			let texto = `Excelente con gusto podemos ayudarte, dinos ¿Cuál es tu duda? o ¿Qué servicio buscas? Y en breve uno de nuestros asesores te contestará 👤`;
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