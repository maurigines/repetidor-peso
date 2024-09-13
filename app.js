// Función para actualizar el peso desde el microservicio
function fetchWeight() {
  fetch("http://localhost:3000/weight")
    .then((response) => response.json())
    .then((data) => {
      const pesoDisplay = document.getElementById("peso-display");
      pesoDisplay.innerText = `${data.weight} kg`;
    })
    .catch((error) => {
      console.error("Error al obtener el peso:", error);
    });
}

// Actualizar el peso cada 500ms
setInterval(fetchWeight, 500);
