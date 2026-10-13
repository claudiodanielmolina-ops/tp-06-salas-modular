function crearServicioReservas(reservasIniciales) {
  const reservas = [...reservasIniciales];

  function listar() {
    return [...reservas];
  }

  function obtenerPorId(id) {
    // Soporta búsqueda comparando string o número
    return (
      reservas.find((elemento) => String(elemento.id) === String(id)) ?? null
    );
  }

  function crear(datosValidados) {
    // Calcula el siguiente ID numérico correlativo
    const nuevoId =
      reservas.length > 0
        ? Math.max(...reservas.map((r) => Number(r.id))) + 1
        : 1;
    const nuevaReserva = { id: nuevoId, ...datosValidados };
    reservas.push(nuevaReserva);
    return nuevaReserva;
  }

  return { listar, obtenerPorId, crear };
}

module.exports = crearServicioReservas;
