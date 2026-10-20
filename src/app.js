const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const morgan = require("morgan");
const path = require("node:path");
const {
  identificarSolicitud,
  medirDuracion,
} = require("./middleware/solicitudes");
const crearControladorReservas = require("./controladores/reservas");
const crearRouterReservas = require("./rutas/reservas");

function crearApp({ servicioReservas, formatoRegistro }) {
  const app = express();
  const controladorReservas = crearControladorReservas(servicioReservas);
  const reservasRouter = crearRouterReservas(controladorReservas);

  // Configuración de vistas y layouts
  app.set("view engine", "ejs");
  app.set("views", path.join(__dirname, "..", "views"));
  app.use(expressLayouts);
  app.set("layout", "layouts/main");

  // Pipeline global de middlewares
  app.use(morgan(formatoRegistro));
  app.use(identificarSolicitud);
  app.use(medirDuracion);

  // Archivos estáticos y parsers
  app.use(express.static(path.join(__dirname, "..", "public")));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  // Rutas globales
  app.get("/", (req, res) => {
    res.render("inicio", { titulo: "Reserva de turnos" });
  });

  // Se borró el bloque app.get("/estado") que usaba .listar().length
  // e ignoraba las responsabilidades del controlador y del servicio.

  // ELIMINADO: Se borró app.get("/api/reservas") para centralizarlo bajo el router.

  // Montaje del router de reservas bajo el prefijo /reservas
  // Ahora /reservas/estado entrará correctamente por aquí.
  app.use("/reservas", reservasRouter);

  // Manejador 404 global
  app.use((req, res) => {
    res.status(404).render("no-encontrado", {
      titulo: "Página no encontrada",
      mensaje: "La dirección solicitada no existe.",
    });
  });

  return app;
}

module.exports = crearApp;
