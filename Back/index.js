const express = require("express");
const { SerialPort, ReadlineParser } = require("serialport");
const path = require("path");

const app = express();
const portNumber = 3002;
const frontendPort = 3003;

const config = {
  serialPort: "COM4",
};

let port;
let parser;
let currentWeight = "";

function connectToSerialPort() {
  try {
    port = new SerialPort({ path: config.serialPort, baudRate: 9600 });
    parser = port.pipe(new ReadlineParser({ delimiter: "\r\n" }));

    parser.on("data", (data) => {
      let rawWeight = data.substring(1, data.length - 4);
      let weightNumber = parseFloat(rawWeight);
      let formattedWeight = weightNumber.toFixed(3);
      currentWeight = formattedWeight;
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
