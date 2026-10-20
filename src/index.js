// src/index.js
// Importación adaptada a src/config/entorno.js
const { leerConfiguracion } = require("./config/entorno");
const crearServicioReservas = require("./servicios/reservas");
const crearApp = require("./app");

// Simulación de lectura de datos iniciales (semilla en memoria)
const reservasIniciales = [
  {
    id: 1,
    estudiante: "Ana López",
    email: "ana.lopez@example.com",
    sala: "Sala Norte",
    fecha: "2026-10-01",
    turno: "Mañana",
    personas: 2,
  },
  {
    id: 2,
    estudiante: "Carlos Pérez",
    email: "carlos.perez@example.com",
    sala: "Sala Sur",
    fecha: "2026-10-02",
    turno: "Tarde",
    personas: 4,
  },
  {
    id: 3,
    estudiante: "María Gómez",
    email: "maria.gomez@example.com",
    sala: "Sala Multimedia",
    fecha: "2026-10-03",
    turno: "Noche",
    personas: 3,
  },
  {
    id: 4,
    estudiante: "Juan Martínez",
    email: "juan.martinez@example.com",
    sala: "Sala Norte",
    fecha: "2026-10-04",
    turno: "Mañana",
    personas: 1,
  },
];

async function main() {
  // Extrae los parámetros desestructurando tu función de entorno real
  const { puerto, formatoRegistro } = leerConfiguracion();

  // Única instancia del servicio con los datos iniciales (Unidad 6)
  const servicioReservas = crearServicioReservas(reservasIniciales);

  // Acá se crea la aplicación Express pasándole el servicio y la configuración
  const app = crearApp({ servicioReservas, formatoRegistro });

  // Inicia el sitio en memoria sin exigir ni validar la URI de Atlas para la web
  app.listen(puerto, () => {
    console.log(`Aplicación disponible en http://localhost:${puerto}`);
  });
}

//BLOQUE FINAL DE CONTROL: Ejecución segura del punto de entrada
main().catch((error) => {
  console.error("No se pudo iniciar la aplicación:", error.message);
  process.exitCode = 1;
});
