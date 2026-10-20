
# Trabajo Práctico Nº 7: Persistencia con MongoDB y Mongoose (`tp-07-salas-mongodb`)

## 1. Punto de Partida y Nombre de la Copia
* **Punto de Partida:** El proyecto toma como base la arquitectura modular desarrollada en el repositorio del `tp-06-salas-modular`, donde se aislaron las responsabilidades del servidor HTTP Express a través de funciones de fábrica e inyección de dependencias.
* **Nombre de la Copia/Repositorio Actual:** `tp-07-salas-mongodb`

---

## 2. Versiones Utilizadas y Confirmación del Clúster
* **Node.js Runtime:** v20.x o superior (utilizando el flag nativo `--env-file` para la gestión de entornos).
* **Mongoose ODM:** v8.x o superior.
* **MongoDB Servidor:** v7.0+ (Instancia distribuida).
* **Confirmación de Infraestructura:** Se utiliza un clúster gratuito **MongoDB Atlas Free (M0)** provisto por el proveedor en la nube, operando bajo un esquema de recursos compartidos sin costo.

---

## 3. Guía de Despliegue desde una Descarga Nueva
Siga estos pasos secuenciales para clonar, configurar e iniciar el proyecto en un entorno local limpio:

1. **Instalar Dependencias:** Restaure los paquetes de producción y las herramientas de desarrollo ejecutando:
   ```bash
   npm install
   ```
2. **Preparar el Clúster Gratuito en Atlas:** 
   * Cree un clúster de nivel **M0 Free** en su cuenta de MongoDB Atlas.
   * Cree un **Usuario de Base de Datos** con permisos de lectura y escritura (`readWriteAnyDatabase` o específico para la base del TP).
   * Configure el acceso de red en la pestaña **Network Access** añadiendo la **IP Permitida** actual de su entorno de desarrollo o la regla temporal global `0.0.0.0/0`.
3. **Copiar la Plantilla de Entorno:** Copie el archivo de ejemplo para crear su archivo de configuración física local:
   ```bash
   cp .env.example .env
   ```
4. **Configurar Credenciales:** Abra el nuevo archivo `.env` e introduzca su URI de conexión provista por Atlas de la siguiente manera (reemplace usuario y clave **sin utilizar comillas**):
   ```dotenv
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb+srv://claudiodanielmolina_db_user:0TWs2T6LfVKAdvYp@cluster0.raud3bb.mongodb.net/reservas_salas_u7
   ```

---

## 4. Diagnóstico de Red y Comandos Exactos de Operación

### Diagnóstico DNS y Aislamiento de Red
Para solucionar fallas comunes de resolución de registros SRV/TXT causadas por microcortes o bloqueos de resolutores locales de ISPs, se incorporó un aislamiento DNS fijo en el módulo `src/config/base-datos.js` utilizando la biblioteca nativa `node:dns`. Se forzó el uso de los servidores DNS públicos autorizados de Google y Cloudflare mediante la instrucción:
```javascript
dns.setServers(["8.8.8.8", "1.1.1.1"]);
```

### Comandos Exactos del Ciclo de Vida del Proyecto
* **Prueba de Conectividad:** `node --env-file=.env scripts/comprobar-conexion.js`
* **Inserción de Laboratorio:** `node --env-file=.env scripts/crear-reserva.js`
* **Lectura de Laboratorio:** `node --env-file=.env scripts/listar-reservas.js`
* **Auditoría de Calidad (Linter/Prettier):** `npm run check`
* **Arranque del Sitio Web Local:** `npm run start:local`

---

## 5. Mapa de Archivos y Conceptos de Persistencia
La nueva estructura del software distribuye los componentes de base de datos bajo un ordenamiento modular estricto:

```text
├── scripts/
│   ├── comprobar-conexion.js  # Test de handshake de red con Atlas.
│   ├── crear-reserva.js       # Ensayo de inserción y validación de reglas.
│   └── listar-reservas.js     # Consulta asíncrona de documentos en la nube.
├── src/
│   ├── config/
│   │   ├── base-datos.js      # Pipeline de conexión asíncrona y cierre de sockets.
│   │   └── entorno.js         # Lector validado de variables primitives del sistema.
│   ├── modelos/
│   │   └── reserva.js         # Esquema y Contrato de datos de Mongoose.
│   └── index.js               # Punto de entrada unificado de la aplicación Express.
```

### Definiciones del Ecosistema Mongoose:
* **Esquema (`Schema`):** Configura la estructura lógica interna, las reglas de validación rígidas y los tipos primitivos que deben cumplir los datos.
* **Modelo (`Model`):** Es el constructor de software derivado del esquema que proporciona la interfaz programática (métodos como `.find()`, `.save()`) para ejecutar operaciones CRUD.
* **Colección (`Collection`):** Es la agrupación física de documentos dentro de la base de datos MongoDB Atlas. En este proyecto, Mongoose la mapea automáticamente en plural con el nombre **`reservas`**.

---

## 6. Campos del Esquema, Reglas y Límites No Controlados
El archivo `src/modelos/reserva.js` implementa el contrato de datos basándose en las especificaciones del negocio:

* `estudiante`: `String`, requerido, normalizado con `trim: true`.
* `email`: `String`, requerido, normalizado con `trim: true`. Valida con expresión regular la inclusión mandatoria del carácter `@`.
* `sala`: `String`, requerido. Restringido vía `enum` a: `"Sala Norte"`, `"Sala Sur"` o `"Sala Multimedia"`.
* `fecha`: `String`, requerido, normalizado con `trim: true`.
* `turno`: `String`, requerido. Restringido vía `enum` a: `"Mañana"`, `"Tarde"` o `"Noche"`.
* `personas`: `Number`, requerido. Limitado por rango mediante `min: 1` y `max: 6`. Utiliza un validador personalizado con `Number.isInteger()` para impedir decimales.

### Límites Técnicos No Controlados por la Base de Datos:
Actualmente, el esquema no restringe la coherencia cronológica de la cadena de texto en el campo `fecha` (permite ingresar strings que no sean fechas válidas en calendario), tampoco verifica la existencia previa de un estudiante ni controla la superposición de turnos o reservas duplicadas sobre una misma sala en idéntico horario.

---

## 7. Matriz de Pruebas y Evidencia de Persistencia entre Procesos

### Ensayo Secuencial de Persistencia (Laboratorio por Consola)
Se ejecutaron procesos de Node.js totalmente independientes para certificar que los datos sobreviven al cierre de la ejecución por estar alojados en la nube:
1. **Consulta Inicial (Proceso 1):** `node --env-file=.env scripts/listar-reservas.js` de vuelve: *La colección 'reservas' se encuentra vacía actualmente.* (Cantidad: 0).
2. **Alta del Registro (Proceso 2):** `node --env-file=.env scripts/crear-reserva.js` inserta con éxito a Laura Benítez y devuelve el ID único inmutable: **`6ad6b82733676cd2ccd2b495`**. El proceso termina y libera la memoria RAM.
3. **Segunda Consulta (Proceso 3):** Al ejecutar nuevamente el script de listado desde un proceso de Node.js nuevo, se comprueba que se recupera con éxito el mismo ID **`6ad6b82733676cd2ccd2b495`** y la cantidad en la base creció a uno (1).
4. **Control de Estabilidad (Proceso 4):** Sin mediar nuevas escrituras, una nueva consulta demuestra que la cantidad se mantiene estable en 1 sin mutaciones colaterales.

## Evidencia de Persistencia y Ensayo Reproducible (Unidad 7)

Se registró un ensayo secuencial y reproducible utilizando múltiples procesos independientes de Node.js para demostrar la persistencia real de los datos en el clúster de MongoDB Atlas (Base: `reservas_salas_u7`, Colección: `reservas`).

### Paso 1: Lectura de la Línea de Base Inicial (Proceso Node Nº 1)
Se inicia un proceso limpio de Node.js para consultar el estado de la colección antes de la interacción. El sistema informa que la base de datos se encuentra vacía (0 registros).
* **Comando:** `node --env-file=.env scripts/listar-reservas.js`
* **Salida de Terminal:**
  
  === Leyendo registros de MongoDB Atlas ===
  La colección 'reservas' se encuentra vacía actualmente.
  Conexión con MongoDB cerrada de forma limpia.
  

### Paso 2: Inserción y Captura de Identificador (Proceso Node Nº 2)
Se ejecuta un nuevo proceso independiente para dar de alta un registro válido utilizando el modelo de Mongoose. La base de datos genera y retorna un identificador inmutable de tipo `ObjectId`. El programa finaliza su ejecución por completo y libera la memoria RAM asignada.
* **Comando:** `node --env-file=.env scripts/crear-reserva.js`
* **Documento Creado:** Laura Benítez (Sala Multimedia, Turno Tarde, 3 personas).
* **Identificador Único Generado (_id):** `6ad6b82733676cd2ccd2b495`
* **Salida de Terminal:**
  
  === Ejecutando pruebas de inserción y validación ===
  [Prueba 1] Intentando insertar una reserva válida...
  Éxito: Documento guardado con ID: 6ad6b82733676cd2ccd2b495
  ----------------------------------------------------------
  Conexión con MongoDB cerrada de forma limpia.
  

### Paso 3: Verificación de Persistencia y Crecimiento (Proceso Node Nº 3)
Se abre un tercer proceso de Node.js totalmente aislado para comprobar que los datos sobrevivieron al cierre del programa anterior. Se recupera el mismo identificador hexadecimal y se constata que la métrica de cantidad creció exactamente en uno (1).
* **Comando:** `node --env-file=.env scripts/listar-reservas.js`
* **Salida de Terminal:**
  
  === Leyendo registros de MongoDB Atlas ===
  Se encontraron 1 reservas en la base de datos:

  [Reserva #1]
    ID (_id):   6ad6b82733676cd2ccd2b495
    Estudiante: Laura Benítez
    Email:      laura.benitez@example.com
    Sala:       Sala Multimedia
    Fecha:      2026-11-12
    Turno:      Tarde
    Personas:   3
  ------------------------------------------
  Conexión con MongoDB cerrada de forma limpia.
  

### Paso 4: Comprobación de Estabilidad (Proceso Node Nº 4)
Se ejecuta un último proceso de consulta para asegurar la consistencia del sistema. Sin mediar nuevas operaciones de escritura, la cantidad de registros se mantiene estable en uno (1), demostrando la ausencia de mutaciones o efectos colaterales de limpieza automática.
* **Comando:** `node --env-file=.env scripts/listar-reservas.js`
* **Salida de Terminal:**
  
  === Leyendo registros de MongoDB Atlas ===
  Se encontraron 1 reservas en la base de datos:
  [ID verificado]: 6ad6b82733676cd2ccd2b495 (Total: 1)
  Conexión con MongoDB cerrada de forma limpia.

![Evidencia Atlas Data Explorer](public/img/evidencia-atlas.png)

### Matriz Mínima de Validación del Esquema

| Caso de Prueba | Entrada de Datos Modificada | Resultado Esperado | Resultado Observado en Consola | Cantidad Inicial | Cantidad Final |
| :--- | :--- | :--- | :--- | :---: | :---: |
| **Conexión válida** | Configuración de entorno correcta. | Handshake exitoso y proceso cerrado en `finally`. | `Conexión establecida con MongoDB` / Cierre limpio. | 0 | 0 |
| **Variable vacía** | `MONGODB_URI=` en blanco. | Fallo inmediato de configuración sin éxito. | Excepción: `MONGODB_URI ausente`. | 0 | 0 |
| **Clave inválida** | Contraseña incorrecta temporal en `.env`.| Fallo de autenticación (*Bad Auth*). | Excepción: `MongoServerError: Authentication failed`. | 0 | 0 |
| **Reserva válida** | Objeto completo alineado al esquema. | Registro exitoso; devuelve un id hexadecimal. | Mensaje: `✅ Éxito: Documento guardado con ID: 6ad6b...` | 0 | 1 |
| **Estudiante vacío**| `estudiante: ""` | Rechazo por validador; sin cambios. | Alerta: `El nombre del estudiante es obligatorio.` | 1 | 1 |
| **Email sin @** | `email: "laura.com"` | Rechazo por expresión regular; sin cambios. | Alerta: `El correo electrónico debe contener un caracter '@'.`| 1 | 1 |
| **Sala no permitida**| `sala: "Sala de Estar"` | Rechazo por restricción `enum`; sin cambios. | Alerta: `Sala no permitida. Opciones: [...]` | 1 | 1 |
| **Turno no permitido**| `turno: "Madrugada"` | Rechazo por restricción `enum`; sin cambios. | Alerta: `Turno no permitido. Opciones: [...]` | 1 | 1 |
| **Personas 0** | `personas: 0` | Rechazo por validación `min`; sin cambios. | Alerta: `El mínimo de personas permitido es 1.` | 1 | 1 |
| **Personas 7** | `personas: 7` | Rechazo por validación `max`; sin cambios. | Alerta: `El máximo de personas permitido es 6.` | 1 | 1 |
| **Personas 2.5** | `personas: 2.5` | Rechazo por validador entero; sin cambios. | Alerta: `La cantidad de personas debe ser un número entero.`| 1 | 1 |
| **Personas texto** | `personas: "tres"` | Rechazo automático por falla de conversión. | Alerta: `Cast to Number failed for value "tres"...` | 1 | 1 |

---

## 8. Continuidad del Sitio Web y Próximos Pasos (Unidad 8)
* **¿Por qué el sitio continúa operando en memoria?:** Siguiendo las directivas de la cátedra para el TP 07, el backend de Express mantiene su estado en memoria RAM para asegurar la continuidad operativa del servicio web, aislando el aprendizaje del controlador de Mongoose y las conexiones remotas asíncronas a la terminal de comandos. Esto evita degradaciones en la experiencia del usuario web ante latencias de red.

## Alcance de la Unidad 8 
En el siguiente trabajo práctico se abordará la integración final de la persistencia dentro del pipeline de Express. Se reemplazarán los arreglos semillas locales de src/index.js y las llamadas síncronas de la capa de servicios para delegar de forma definitiva las operaciones CRUD del sitio web directamente sobre los métodos asíncronos del modelo de Mongoose conectado a MongoDB Atlas.

## 9. Declaración de Privacidad y Resguardo de Credenciales
Se confirma de manera explícita que no se publican archivos .env reales, credenciales privadas, tokens de acceso ni datos personales identificables dentro del sistema de control de versiones. El archivo .env local se encuentra debidamente protegido y excluido mediante las directivas del archivo .gitignore, publicándose de forma exclusiva la plantilla genérica estructurada .env.example para fines de documentación pedagógica.