// src/modelos/reserva.js
const mongoose = require("mongoose");

// Listas de valores permitidos (idénticas al middleware del TP 06)
const salasPermitidas = ["Sala Norte", "Sala Sur", "Sala Multimedia"];
const turnosPermitidos = ["Mañana", "Tarde", "Noche"];

//  Definición del Esquema con reglas
const reservaSchema = new mongoose.Schema(
  {
    estudiante: {
      type: String,
      required: [true, "El nombre del estudiante es obligatorio."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "El correo electrónico es obligatorio."],
      trim: true,
      //  Validación de email simple con @ usando expresiones regulares
      match: [/@/, "El correo electrónico debe contener un caracter '@'."],
    },
    sala: {
      type: String,
      required: [true, "La sala es obligatoria."],
      // Restringe los strings a los nombres de salas autorizados
      enum: {
        values: salasPermitidas,
        message: "Sala no permitida. Opciones: {VALUES}",
      },
    },
    fecha: {
      type: String,
      required: [true, "La fecha es obligatoria."],
      trim: true,
    },
    turno: {
      type: String,
      required: [true, "El turno es obligatorio."],
      // Restringe los strings a los turnos autorizados
      enum: {
        values: turnosPermitidos,
        message: "Turno no permitido. Opciones: {VALUES}",
      },
    },
    personas: {
      type: Number,
      required: [true, "La cantidad de personas es obligatoria."],
      // Entero de 1 a 6 con validador personalizado nativo
      validate: {
        validator: function (valor) {
          return Number.isInteger(valor);
        },
        message: "La cantidad de personas debe ser un número entero.",
      },
      min: [1, "El mínimo de personas permitido es 1."],
      max: [6, "El máximo de personas permitido es 6."],
    },
  },
  {
    // Desactiva el campo de versión (__v) automático de Mongoose para este laboratorio
    versionKey: false,
  },
);

// Construcción y exportación del Modelo
// Mongoose mapeará esto automáticamente a la colección "reservas"
const Reserva = mongoose.model("Reserva", reservaSchema);

module.exports = Reserva;
