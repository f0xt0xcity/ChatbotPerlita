'use strict'

//Importar librerias
const functions = require("firebase-functions");
const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");

const libreria_lib = require('./libreria');
const { addCard, imagen_facebook } = require("./libreria");

//Variables globales
global.listaPersonajes = require("./personajes.json");
global.listaAtractivos = require("./atractivos.json");
global.listaPueblosMagicos = require("./pueblos_magicos.json");
global.imagenes = "https://us-central1-citasdentista-fuci.cloudfunctions.net/chatbot/imagenes/";

//Uso de express
const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));
server.use(bodyParser.json()); //Para analizar Json

//Para cargar imagenes
server.use("/imagenes", express.static(path.join(__dirname, '/imagenes')));

//Si alguien intenta acceder desde un navegador
server.get('/', (req, res) => {
    return res.json("Hola, creo que tú no deberias de estar aquí");
});

//Acceso correcto
server.post("/chatbot", (req, res) => {
    let contexto, idioma, origen, resultado;
    let respuestaEnviada = false;
    let textoEnviar = 'Peticion incorrecta post recibida';
    let opciones = libreria_lib.reducirAOcho(
        [
            "Consultar clima", 
            "Dime actividades", 
            "Museos de la ciudad", 
            "Atractivos turísticos ", 
            "Dato interesante", 
            "¿Qué te gusta hacer?", 
            "Pueblos Magicos", 
            "Equipo favorito", 
            "Cuéntame un chiste", 
            "Diccionario", 
            "Frase celebre", 
            "Tapatíos destacados"
        ]);
    try {
        contexto = req.body.queryResult.action;
        global.origen = req.body.originalDetectIntentRequest.source.toUpperCase();//TELEGRAM FACEBOOK DIALOGFLOW_CONSOLE GOOGLE
        textoEnviar = `recibida peticion de accion: ${contexto}`;
    } catch (error) {
        console.log("Error contexto vacio:" + error);
    }
    if (req.body.queryResult.parameters) {
        console.log("parametros:" + req.body.queryResult.parameters);
    } else {
        console.log("Sin parametros");
    }
    switch ( contexto ) {
        case 'input.welcome' :
            /*****************Input welcome**********************/
            if (origen === "GOOGLE" || origen === "DIALOGFLOW_CONSOLE") {
                textoEnviar = "Hola, soy Perlita la tapatía, el bot turístico de la ciudad de Guadalajara 😁¿En qué puedo ayudarte?.";
            } else {
                textoEnviar = "Hola, soy Perlita la tapatía, el bot turístico de la ciudad de Guadalajara, puedes enviar la palabra 'Menú' para saber en qué puedo ayudarte 😁.";
            }
            resultado = libreria_lib.respuestaBasica(textoEnviar);
            break;
        case 'personaje':
            /***************** Personaje **********************/
            let personaje;
            try {
                personaje = req.body.queryResult.parameters.personaje;
            } catch (error) {
                console.log("Error personaje no leido: " + error);
            }
            if (personaje) {
                let arListaPersonajes = Object.keys(global.listaPersonajes).slice();
                //Vamos a personalizar opciones para que aparezca como sugerencias otros personajes y el menu
                opciones = arListaPersonajes.slice();
                //Si ha llegado parametro personaje  esta en a lista
                if (global.listaPersonajes[personaje]) {
                    textoEnviar = global.listaPersonajes[personaje];
                    let imagen_sinespacios = personaje.replace(/ /g, "")
                    let imagen = encodeURI(global.imagenes + imagen_sinespacios + ".jpg");
                    let url = "https://www.google.com/search?q=" + personaje;
                    resultado = libreria_lib.respuestaBasica(`Me encanta ${personaje} 😊`);
                    libreria_lib.Tarjeta(resultado, personaje, textoEnviar, imagen, url);
                } else {
                    //Si el personaje  no existe en nuestro db de personajes
                    resultado = libreria_lib.respuestaBasica(`Lo siento todavia no se nada de ${personaje}, seguire estudiando 🤔`)
                }
            } else {
                //Personaje vacio
                resultado = libreria_lib.respuestaBasica("No se ha recibido un personaje conocido 🤔");
            }
            break;
        case 'lista_personajes':
            /**************Listar personajes***************************/
            let arListaPersonajes = Object.keys(global.listaPersonajes).slice();
            arListaPersonajes = libreria_lib.reducirAOcho(arListaPersonajes);
            //Vamos a personalizar opciones para que aparezca como sugerencias otros personajes y el menu
            if (origen === "GOOGLE" || origen === "DIALOGFLOW_CONSOLE") {
                opciones = arListaPersonajes.slice();
                resultado = libreria_lib.respuestaBasica("Te muestro algunos personajes destacados 😁");
            } else {
                let imagen = encodeURI(global.imagenes + "tapatioS.png");
                resultado = libreria_lib.respuestaBasica("Te muestro algunos personajes destacados 😁");
                imagen_facebook(resultado, imagen);
            }
            break;
        case 'atractivos': 
            /*************Atractivos del centro************/
            let atractivos;
            try {
                atractivos = req.body.queryResult.parameters.atractivoscentro;
            } catch (error) {
                console.log("Error lugar no encontrado no leido: " + error);
            }
            if (atractivos) {
                let arListaAtractivos = Object.keys(global.listaAtractivos).slice();
                //Vamos a personalizar opciones para que aparezca como sugerencias otros personajes y el menu
                opciones = arListaAtractivos.slice();
                //Si ha llegado parametro personaje  esta en a lista
                if (global.listaAtractivos[atractivos]) {
                    textoEnviar = global.listaAtractivos[atractivos];
                    let imagen_sinespacios = atractivos.replace(/ /g, "")
                    let imagen = encodeURI(global.imagenes + imagen_sinespacios + ".jpg");
                    let url = "https://www.google.com/search?q=" + atractivos;
                    resultado = libreria_lib.respuestaBasica(`Me encanta ${atractivos} 😊`);
                    libreria_lib.Tarjeta(resultado, atractivos, textoEnviar, imagen, url);
                } else {
                    //Si el personaje  no existe en nuestro db de personajes
                    resultado = libreria_lib.respuestaBasica(`Lo siento todavia no se nada de ${atractivos}, seguire estudiando 🤔`)
                }
            } else {
                //Personaje vacio
                resultado = libreria_lib.respuestaBasica("No se ha recibido un atractivo conocido 🤔");
            }
            break;
        case 'lista_atractivos':
            /**************Listar personajes***************************/
            let arListaAtractivos = Object.keys(global.listaAtractivos).slice();
            arListaAtractivos = libreria_lib.reducirAOcho(arListaAtractivos);
            let imagen = encodeURI(global.imagenes + "turisticoS.png");
            //Vamos a personalizar opciones para que aparezca como sugerencias otros personajes y el menu
            if (origen === "GOOGLE" || origen === "DIALOGFLOW_CONSOLE") {
                opciones = arListaAtractivos.slice();
                resultado = libreria_lib.respuestaBasica("Te muestro algunos atractivos destacados 😁");
            } else {
                resultado = libreria_lib.respuestaBasica("Te muestro algunos atractivos destacados 😁");
                imagen_facebook(resultado, imagen);
            }
            break;
        case 'pueblomagico':
            /***************** Pueblo Magico **********************/
            let pueblomagico;
            try {
                pueblomagico = req.body.queryResult.parameters.pueblomagico;
            } catch (error) {
                console.log("Error pueblo no leido: " + error);
            }
            if (pueblomagico) {
                let arListaPueblosMagicos = Object.keys(global.listaPueblosMagicos).slice();
                //Vamos a personalizar opciones para que aparezca como sugerencias otros personajes y el menu
                opciones = arListaPueblosMagicos.slice();
                //Si ha llegado parametro personaje  esta en a lista
                if (global.listaPueblosMagicos[pueblomagico]) {
                    textoEnviar = global.listaPueblosMagicos[pueblomagico];
                    let imagen_sinespacios = pueblomagico.replace(/ /g, "")
                    let imagen = encodeURI(global.imagenes + imagen_sinespacios + ".png");
                    let url = "https://www.google.com/maps/place/" + pueblomagico + ",+Jalisco";
                    resultado = libreria_lib.respuestaBasica(`${pueblomagico} es un excelente lugar 😁`);
                    libreria_lib.Tarjeta(resultado, pueblomagico, textoEnviar, imagen, url);
                } else {
                    //Si el pueblo no existe en nuestro db de personajes
                    resultado = libreria_lib.respuestaBasica(`Lo siento todavia no se nada de ${personaje}, seguiré estudiando 🤔`)
                }
            } else {
                //Pueblo vacio
                resultado = libreria_lib.respuestaBasica("No se ha recibido un pueblo conocido 🤔");
            }
            break;
        case 'lista_pueblosmagicos':
            /**************Listar Pueblos Magicos***************************/
            let arListaPueblosMagicos = Object.keys(global.listaPueblosMagicos).slice();
            arListaPueblosMagicos = libreria_lib.reducirAOcho(arListaPueblosMagicos);
            //Vamos a personalizar opciones para que aparezca como sugerencias otros personajes y el menu
            if (origen === "GOOGLE" || origen === "DIALOGFLOW_CONSOLE") {
                opciones = arListaPueblosMagicos.slice();
                resultado = libreria_lib.respuestaBasica("Te muestro algunos pueblos mágicos 😁");
            } else {
                let imagen = encodeURI(global.imagenes + "puebloS.png");
                resultado = libreria_lib.respuestaBasica("Te muestro algunos pueblos mágicos 😁");
                imagen_facebook(resultado, imagen);
            }
            break;
        case 'clima':
            respuestaEnviada = true;
            libreria_lib.ApiClima("guadalajara", "today").then((output) => {
                textoEnviar = output; // Return the results of the weather API to Dialogflow
                console.log(`Respuesta: ${textoEnviar}`);
                resultado = libreria_lib.respuestaBasica(textoEnviar);
                libreria_lib.addSugerencias(resultado, opciones);
                res.json(resultado);
                return true;
            }).catch(() => {
                textoEnviar = "No conozco el clima, pero parece que va a estar bien";
            });
            break;
        case 'climaTomorrow':
            respuestaEnviada = true;
            libreria_lib.ApiClima("guadalajara", "tomorrow").then((output) => {
                textoEnviar = output; // Return the results of the weather API to Dialogflow
                console.log(`Respuesta: ${textoEnviar}`);
                resultado = libreria_lib.respuestaBasica(textoEnviar);
                libreria_lib.addSugerencias(resultado, opciones);
                res.json(resultado);
                return true;
            }).catch(() => {
                textoEnviar = "No conozco el clima, pero parece que va a estar bien";
            });
            break;
        case 'menu':
            if (origen === "GOOGLE" || origen === "DIALOGFLOW_CONSOLE") {
                resultado = libreria_lib.respuestaBasica("Te muestro algunas cosas que se hacer 😄");
            } else {
                let imagen = encodeURI(global.imagenes + "menU.png");
                resultado = libreria_lib.respuestaBasica("Te muestro algunas cosas que se hacer 😄");
                imagen_facebook(resultado, imagen);
            }
            break;
        default:
            //Se recibe un action desconocido (contexto)
            resultado = libreria_lib.respuestaBasica(`Disculpa, todavía no entiendo que es: ${contexto} 🤔`);
    }
    if (!respuestaEnviada) {
        libreria_lib.addSugerencias(resultado, opciones);
        res.json(resultado);
    }
});

exports.chatbot = functions.https.onRequest(server);