const express = require("express");
const { SerialPort, ReadlineParser } = require("serialport");
const path = require("path");

const app = express();
const portNumber = 3002;
const frontendPort = 3003;

const config = {
  serialPort: "COM4", // Asegúrate de que este sea el puerto correcto
};

let port;
let parser;
let currentWeight = "";

function connectToSerialPort() {
  try {
    port = new SerialPort({
      path: config.serialPort,
      baudRate: 2400,       // Ajustamos el baud rate a 2400
      dataBits: 7,          // 7 bits de datos
      parity: "even",       // Paridad even
      stopBits: 1,          // 1 bit de stop
    });

    parser = port.pipe(new ReadlineParser({ delimiter: "\r" }));  // El delimitador es /r

    parser.on("data", (data) => {
      console.log("Data recibida: ", data);  // Para debug

      // Utilizamos una expresión regular para encontrar los números en el string
      let match = data.match(/\d{1,5}/);  // Buscar secuencias de hasta 5 dígitos

      if (match) {
        currentWeight = match[0]; // Guardamos solo los dígitos del medio (el peso en kg)
      } else {
        currentWeight = "0";  // Si no encontramos un valor válido, devolvemos 0 por defecto
      }
    });

    port.on("open", () => {
      console.log("Conectado a la balanza en el puerto", config.serialPort);
    });

    port.on("error", (err) => {
      console.error("Error en el puerto serial:", err.message);
      retryConnection();
    });

    port.on("close", () => {
      console.log("Puerto serial cerrado");
      retryConnection();
    });
  } catch (err) {
    console.error(
      "Error al intentar conectar con el puerto serial:",
      err.message
    );
    retryConnection();
  }
}

function retryConnection() {
  setTimeout(connectToSerialPort, 5000);
}

connectToSerialPort();

app.get("/weight", (req, res) => {
  res.json({ weight: currentWeight });
});

app.listen(portNumber, () => {
  console.log(
    `Microservicio de balanza corriendo en http://localhost:${portNumber}`
  );
});

const frontendPath = path.join(__dirname, "../");

app.use(express.static(frontendPath));

app.listen(frontendPort, () => {
  console.log(`Frontend corriendo en http://localhost:${frontendPort}`);
});