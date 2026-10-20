// scripts/crear-reserva.js
const { conectarBaseDatos, desconectarBaseDatos } = require("../src/config/base-datos");
const Reserva = require("../src/modelos/reserva");

async function main() {
    try {
        // Abre el canal de comunicación asíncrono con Atlas
        await conectarBaseDatos();

        console.log("=== Ejecutando pruebas de inserción y validación ===\n");

        // -------------------------------------------------------------------------
        // CASO 1: Intento de inserción con Datos VÁLIDOS (Debe grabarse con éxito)
        // -------------------------------------------------------------------------
        console.log("[Prueba 1] Intentando insertar una reserva válida...");
        const reservaValida = {
            estudiante: "Laura Benítez",
            email: "laura.benitez@example.com",
            sala: "Sala Multimedia",
            fecha: "2026-11-12",
            turno: "Tarde",
            personas: 3,
        };

        // save() dispara automáticamente las validaciones del esquema antes de ir a Atlas
        const documentoGuardado = await new Reserva(reservaValida).save();
        console.log("✅ Éxito: Documento guardado con ID:", documentoGuardado._id);
        console.log("----------------------------------------------------------\n");

        // -------------------------------------------------------------------------
        // CASO 2: Intento de inserción con Datos INVÁLIDOS (Debe ser frenado por Mongoose)
        // -------------------------------------------------------------------------
        console.log("[Prueba 2] Intentando insertar datos inválidos para forzar errores...");
        const reservaInvalida = {
            estudiante: "Gaston Rossi",
            email: "://rossi.com",     //  Error: No contiene el carácter '@'
            sala: "Sala de Estar",     //  Error: No pertenece al enum de salas permitidas
            fecha: "2026-11-13",
            turno: "Madrugada",        //  Error: No pertenece al enum de turnos permitidos
            personas: 8,               //  Error: Excede el máximo permitido de 6 personas
        };

        try {
            await new Reserva(reservaInvalida).save();
            console.log("❌ Error crítico: Mongoose permitió guardar un documento inválido.");
        } catch (validationError) {
            console.log("✅ Éxito en la validación: Mongoose frenó la operación correctamente.");
            console.log("Mensajes de error capturados del esquema:");

            // Mapea y recorre de forma prolija los mensajes de error configurados en tu modelo
            if (validationError.errors) {
                Object.keys(validationError.errors).forEach((campo) => {
                    console.log(`  - Campo [${campo}]: ${validationError.errors[campo].message}`);
                });
            } else {
                console.log(`  - Error general: ${validationError.message}`);
            }
        }

    } catch (error) {
        console.error("❌ Ocurrió un error inesperado en el script:", error.name);
        process.exitCode = 1;
    } finally {
        // ✅ REQUISITO OBLIGATORIO: Garantiza el cierre limpio de sockets pase lo que pase
        await desconectarBaseDatos();
        console.log("\nConexión con MongoDB cerrada de forma limpia.");
    }
}

// Ejecuta el script principal
main();
