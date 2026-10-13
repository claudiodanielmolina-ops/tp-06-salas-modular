const express = require("express");
const { prepararReserva, validarReserva } = require("../middleware/reservas");

function crearRouterReservas(controladorReservas) {
  const router = express.Router();

  // Middleware de área para /reservas
  router.use(prepararReserva);

  router.get("/", controladorReservas.listar);
  router.get("/nueva", controladorReservas.mostrarFormulario);
  router.get("/:id", controladorReservas.mostrarDetalle);
  router.post("/", validarReserva, controladorReservas.crear);

  return router;
}

module.exports = crearRouterReservas;
