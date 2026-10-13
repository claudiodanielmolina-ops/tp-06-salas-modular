function leerConfiguracion(entorno = process.env) {
  let puerto = 3000;

  if (entorno.PORT !== undefined) {
    puerto = Number(entorno.PORT);
    if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
      throw new Error("PORT debe ser un entero entre 1 y 65535");
    }
  }

  const formatoRegistro =
    entorno.NODE_ENV === "production" ? "combined" : "dev";

  return { puerto, formatoRegistro };
}

module.exports = leerConfiguracion;
