const leerConfiguracion = require("./configuracion");
const crearServicioReservas = require("./servicios/reservas");
const crearApp = require("./app");

// Simulación de lectura de datos iniciales (semilla)
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
  const { puerto, formatoRegistro } = leerConfiguracion();

  // Creamos la única instancia del servicio con los datos iniciales
  const servicioReservas = crearServicioReservas(reservasIniciales);

  // Construimos la aplicación Express pasándole el servicio y la configuración
  const app = crearApp({ servicioReservas, formatoRegistro });

  app.listen(puerto, () => {
    console.log(`Aplicación disponible en http://localhost:${puerto}`);
  });
}

main().catch((error) => {
  console.error("No se pudo iniciar la aplicación:", error);
  process.exitCode = 1;
});
