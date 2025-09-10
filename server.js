// serverA.js
import { Server } from "socket.io";
import http from "http";
import express from "express";
import nocache from "nocache";
import cors from "cors";
import bodyParser from "body-parser";
import fs from "fs";
import path from "path";

const app = express();
const server = http.createServer(app);
app.use(nocache());
app.use(cors({ origin: "*" }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: false }));
const io = new Server(server, { cors: { origin: "*" } });
console.log("Iniciando Servidor A...");

// Variable para guardar el último resultado de Last5QrCodes
let last5QrCodesResult = [];

io.on("connection", (socket) => {
	console.log("Cliente conectado a A:", socket.id);
	socket.emit("welcome", { message: "Bienvenido al servidor A" });

	// Si hay datos previos, enviarlos al cliente recién conectado
	if (last5QrCodesResult.length > 0) {
		io.emit("Last5QrCodesWeb", last5QrCodesResult);
	}

	socket.on("welcome-response", (data) => {
		console.log("Respuesta de bienvenida del cliente:", data);
	});

	// Escuchar mensajes del cliente
	socket.on("data-from-A", (data) => {
		console.log("Mensaje recibido del cliente:", data);
		// Puedes responder si lo deseas
		socket.emit("respuesta-de-A", { recibido: true, original: data });
	});

	// cada 5s emite datos
	socket.on("Last5QrCodes", (data) => {
		console.log("Last5QrCodes recibido:", data);
		// data[0] = array de códigos, data[1] = array de fechas
		const codes = Array.isArray(data[1]) ? data[1] : [];
		const dates = Array.isArray(data[2]) ? data[2] : [];
		const result = codes.map((code, idx) => ({
			id: idx + 1,
			code,
			date: dates[idx],
		}));
		last5QrCodesResult = result; // Guardar el último resultado
		io.emit("Last5QrCodesWeb", result);
	});
});
// Verifica si la carpeta dist existe antes de servir archivos estáticos
const distPath = path.resolve("dist");
if (fs.existsSync(distPath)) {
	app.use(express.static(distPath));
} else {
	console.warn(
		"La carpeta 'dist' no existe. Por favor, crea la carpeta o genera los archivos necesarios."
	);
}

console.log("Servidor A sirviendo archivos estáticos desde:", distPath);
server.listen(5122, "0.0.0.0", () => {
	console.log("Servidor A escuchando en puerto 5122");
});


