function crearControladorReservas(servicioReservas) {
  function listar(req, res) {
    res.render("reservas/lista", {
      titulo: "Reservas de turnos",
      reservas: servicioReservas.listar(),
    });
  }

  function mostrarFormulario(req, res) {
    res.render("reservas/nueva", {
      titulo: "Nueva reserva",
      error: null,
      valores: {},
    });
  }

  function mostrarDetalle(req, res) {
    const id = req.params.id;
    const reserva = servicioReservas.obtenerPorId(id);

    if (!reserva) {
      return res.status(404).render("no-encontrado", {
        titulo: "Reserva no encontrada",
        mensaje: "No existe esa reserva.",
      });
    }

    res.render("reservas/detalle", {
      titulo: reserva.estudiante,
      reserva,
    });
  }

  function crear(req, res) {
    // El controlador ahora decide la respuesta si la validación falló
    if (req.errorValidacion) {
      return res.status(400).render("reservas/nueva", {
        titulo: "Nueva reserva",
        error: req.errorValidacion,
        valores: req.valoresInvalidos,
      });
    }

    // Si no hay error, crea la reserva normalmente
    servicioReservas.crear(req.reservaValidada);
    res.redirect("/reservas");
  }

  // CORRECCIÓN: Aquí es donde se calcula la cantidad para la ruta de estado
  function listarApi(req, res) {
    res.json(servicioReservas.contar());
  }

  return { listar, mostrarFormulario, mostrarDetalle, crear, listarApi };
}

module.exports = crearControladorReservas;
