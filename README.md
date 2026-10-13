# Trabajo Práctico Nº 6: Modularización de la Aplicación de Reservas (`tp-06-salas-modular`)

En este trabajo práctico me tocó refactorizar la aplicación que veníamos haciendo. En el TP anterior (`tp-05`) teníamos todo el código junto en un único archivo `index.js`, lo cual se ponía difícil de mantener a medida que crecía. 

El objetivo principal de este TP fue **separar las responsabilidades en varios módulos** para que el código quede más prolijo, ordenado y fácil de entender.



##  ¿Cómo instalar y ejecutar el proyecto?

Para probar el proyecto en tu computadora, sigue estos pasos:

1. **Instalar las dependencias:**
  
   npm install
  

2. **Iniciar el servidor en modo local:**
   
   npm run start:local
  
   *(También puedes usar simplemente `npm start`)*.

3. **Verificar que el código esté prolijo (Prettier y ESLint):**
   Para asegurarme de que no queden errores de formato ni variables sin usar, ejecuto:
   
   npm run check
 
   * Si quiero corregir el formato automáticamente: `npm run format`
   * Si solo quiero revisar el linter: `npm run lint`



##  ¿Cómo organicé las carpetas y los archivos (`src/`)?

Para modularizar todo, fui separando las cosas por su función dentro de la carpeta `src`:

* **`src/index.js`**: Es el punto de partida. Ahora quedó súper cortito: solo lee la configuración, crea los datos iniciales, arranca la app y pone a escuchar el servidor.
* **`src/configuracion.js`**: Se encarga de leer el puerto (`PORT`) y el entorno (`NODE_ENV`) para saber cómo configurar los logs de Morgan.
* **`src/app.js`**: Acá armé y configuré todo Express (el motor de vistas EJS, los middlewares globales, los parsers y las rutas principales).
* **`src/rutas/reservas.js`**: Usé `express.Router()` para sacar las rutas de reservas del archivo principal y agruparlas acá.
* **`src/controladores/reservas.js`**: Puse toda la lógica de qué hacer cuando llega una petición (mostrar vistas, responder con JSON o redirigir) para que las rutas no tengan tanto código mezclado.
* **`src/servicios/reservas.js`**: Acá guardé el arreglo con las reservas y las funciones para buscarlas, listarlas o crear nuevas. Así la capa de datos queda separada de HTTP.
* **`src/middleware/`**: 
  * `solicitudes.js`: Genera el código único para cada solicitud (`BIB-XXXX`) y mide cuánto tarda en responder.
  * `reservas.js`: Valida los datos cuando alguien intenta crear una reserva nueva.

---

##  Lo que fui aprendiendo y respondiendo para el TP

A lo largo del desarrollo, fui entendiendo varios conceptos clave sobre cómo estructurar una aplicación en Node.js:

1. **¿Por qué el servicio no usa `req` ni `res`?**
   Porque el servicio solo se encarga de manejar los datos y la lógica del negocio. Si no depende de Express (`req` y `res`), puedo usarlo o probarlo mucho más fácil en cualquier otro lado sin preocuparme por el protocolo HTTP.

2. **¿Para qué sirve el controlador?**
   Funciona como un intermediario. Recibe la petición que viene del cliente, llama al servicio para buscar o guardar los datos, y después decide cómo responder (por ejemplo, renderizando una página EJS o mandando un JSON).

3. **¿Por qué las rutas del router usan caminos relativos (como `"/"` o `"/:id"`)?**
   Porque el router está pensada para ser "enchufado" en la aplicación principal con un prefijo (en mi caso, `app.use("/reservas", reservasRouter)`). Así, el router no necesita saber su ruta completa, lo que lo hace más reutilizable.

4. **¿Dónde se guardan las reservas?**
   Están en un arreglo en la memoria RAM dentro del servicio. Como es memoria volátil, si aprieto `Ctrl + C` y reinicio el servidor, las reservas que haya agregado se borran y vuelven a aparecer las 4 reservas iniciales de ejemplo (la "semilla").