# MANUAL DE USUARIO — FiveM Panel UCP

**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Aplicación:** Panel de Control UCP para servidores FiveM con ESX Legacy  

---

## ÍNDICE

1. Introducción
2. Acceso al Panel
3. Panel del Jugador (Dashboard)
4. Panel de Administración
   - 4.1 Estado del Servidor
   - 4.2 Búsqueda de Jugadores
   - 4.3 Editor de Economía
   - 4.4 Gestor de Inventario
   - 4.5 Gestor de Flota de Vehículos
   - 4.6 Control de Posición
   - 4.7 Zona de Peligro (Kick y Ban)
5. Roles y Permisos
6. Preguntas Frecuentes

---

## 1. INTRODUCCIÓN

FiveM Panel UCP es el panel de control web oficial del servidor. Permite a los jugadores consultar la información de sus personajes y a los administradores gestionar todos los aspectos del servidor desde una interfaz centralizada.

### Funcionalidades según el tipo de usuario

| Funcionalidad | Jugador | Administrador |
|---|:---:|:---:|
| Ver datos de su personaje | ✓ | ✓ |
| Ver sus vehículos e inventario | ✓ | ✓ |
| Ver sus finanzas | ✓ | ✓ |
| Buscar cualquier jugador | — | ✓ |
| Editar economía de jugadores | — | ✓ |
| Gestionar inventario de jugadores | — | ✓ |
| Gestionar flota de vehículos | — | ✓ |
| Teletransportar jugadores | — | ✓ |
| Expulsar (kick) jugadores | — | ✓ |
| Banear jugadores | — | ✓ |
| Ver estado del servidor | — | ✓ |

> **[IMAGEN 1 — Página de inicio del panel]**
> *Tipo: Captura de pantalla completa del navegador mostrando la Landing Page del panel, con la barra de navegación superior, la sección hero con el fondo oscuro y el título principal visible. Preferiblemente a resolución de escritorio (1920×1080).*

---

## 2. ACCESO AL PANEL

### 2.1 Requisitos para el Acceso

Para acceder al panel necesitas:

- Un navegador web moderno (Chrome, Firefox o Edge)
- Una cuenta de Discord activa
- Haber jugado al menos una vez en el servidor (tener un personaje creado)

### 2.2 Iniciar Sesión con Discord

La autenticación del panel se realiza exclusivamente a través de **Discord**. No es necesario crear una cuenta adicional.

1. Abre el navegador y accede a la dirección del panel:
   ```
   http://localhost:3000
   ```
2. Haz clic en el botón **"Login con Discord"** en la barra de navegación superior.

> **[IMAGEN 2 — Botón "Login con Discord" en la barra de navegación]**
> *Tipo: Recorte de la barra de navegación superior mostrando claramente el botón "Login con Discord" en la esquina derecha.*

3. Se abrirá una ventana de autorización de Discord en el navegador.
4. Revisa los permisos solicitados y haz clic en **"Autorizar"**.

> **[IMAGEN 3 — Ventana de autorización de Discord]**
> *Tipo: Captura de pantalla de la ventana de autorización de Discord mostrando el nombre de la aplicación, los permisos solicitados (nombre de usuario, avatar) y los botones "Cancelar" / "Autorizar".*

5. Tras autorizar, serás redirigido automáticamente a tu panel de jugador.

> **IMPORTANTE:** Tu cuenta de Discord debe estar vinculada a tu personaje en el servidor. Si ves un error tras el login, contacta con un administrador.

### 2.3 Cerrar Sesión

Para cerrar sesión, haz clic en el botón **"Logout"** situado en la esquina superior derecha del panel. Serás redirigido a la página de inicio.

---

## 3. PANEL DEL JUGADOR (DASHBOARD)

Una vez autenticado, accederás automáticamente a tu dashboard personal donde podrás consultar toda la información de tu personaje.

> **[IMAGEN 4 — Dashboard completo del jugador]**
> *Tipo: Captura de pantalla completa del Dashboard, mostrando la tarjeta de identidad a la izquierda, el grid de finanzas a la derecha, y las secciones de garaje e inventario en la parte inferior. Asegurarse de que el nombre del jugador sea visible.*

### 3.1 Barra de Navegación Superior

La barra superior del dashboard contiene los siguientes elementos:

- **Logo "CyberUCP"**: enlace a la página de inicio.
- **Selector de personajes**: si tienes más de un personaje, puedes cambiar entre ellos con el desplegable.
- **Saludo personalizado**: muestra tu nombre de usuario.
- **Botón "Admin Panel"**: visible únicamente para usuarios con rol de administrador.
- **Botón "Logout"**: para cerrar sesión.

> **[IMAGEN 5 — Barra de navegación del dashboard con selector de personajes]**
> *Tipo: Recorte de la barra superior del dashboard mostrando el selector de personajes desplegado (si hay más de uno) y el botón de logout.*

### 3.2 Tarjeta de Identidad

En el lado izquierdo de la pantalla encontrarás la tarjeta de identidad de tu personaje con la siguiente información:

| Campo | Descripción |
|---|---|
| **Nombre completo** | Nombre y apellidos del personaje |
| **Trabajo** | Empleo actual del personaje en el servidor |
| **Rango** | Tu rol en el servidor (Jugador / Admin / SuperAdmin) |
| **Fecha de nacimiento** | Fecha de nacimiento del personaje |
| **Género** | Género del personaje |

> **[IMAGEN 6 — Tarjeta de identidad del personaje]**
> *Tipo: Recorte de la tarjeta de identidad mostrando todos los campos (nombre, trabajo, rango, fecha de nacimiento, género). Difuminar o cambiar el nombre real si es necesario.*

El badge de rango tiene diferentes colores según el rol:

- **Azul**: Jugador estándar
- **Naranja/Amarillo**: Administrador
- **Rojo**: SuperAdministrador

### 3.3 Panel de Finanzas

A la derecha de la tarjeta de identidad se muestran tres tarjetas con el estado financiero de tu personaje:

#### Efectivo
Dinero en efectivo que lleva el personaje encima. Se muestra en color **cian**.

#### Banco (Maze Bank)
Saldo disponible en la cuenta bancaria del personaje. Se muestra en color **blanco**.

#### Dinero Sucio
Dinero de origen ilegal en posesión del personaje. Se muestra en color **rojo** con un indicador de advertencia.

> **[IMAGEN 7 — Panel de finanzas con las tres tarjetas]**
> *Tipo: Recorte del grid de finanzas mostrando las tres tarjetas (Efectivo, Banco y Dinero Sucio) con sus valores y colores diferenciados. Los valores pueden ser ficticios para la imagen.*

### 3.4 Garaje de Vehículos

La sección de garaje muestra todos los vehículos registrados a nombre de tu personaje en una tabla con las siguientes columnas:

| Columna | Descripción |
|---|---|
| **Matrícula** | Identificador único del vehículo (en cian) |
| **Modelo** | Nombre del modelo del vehículo |
| **Estado** | Indica si el vehículo está en el garaje o en la calle |

Los posibles estados de un vehículo son:

- **GARAJE**: El vehículo está guardado en el garaje y no está en el mapa.
- **FUERA**: El vehículo está actualmente en el mapa del servidor.

> **[IMAGEN 8 — Tabla del garaje con vehículos]**
> *Tipo: Recorte de la tabla del garaje mostrando al menos 2-3 vehículos con sus matrículas, modelos y estados (idealmente uno en "GARAJE" y otro en "FUERA" para mostrar ambos estados).*

### 3.5 Inventario (Mochila)

La sección de inventario muestra todos los objetos que lleva encima el personaje. Cada ítem aparece como una tarjeta individual que muestra:

- **Icono** del objeto
- **Nombre** del objeto
- **Cantidad** disponible (número en badge de color cian)

> **[IMAGEN 9 — Lista de inventario del personaje]**
> *Tipo: Recorte de la sección de inventario mostrando varios ítems como tarjetas individuales, con sus iconos, nombres y badges de cantidad.*

> **NOTA:** El inventario y los datos financieros se sincronizan con los datos en tiempo real del servidor FiveM. Si acabas de realizar una transacción en el servidor, es posible que necesites recargar la página para ver los datos actualizados.

---

## 4. PANEL DE ADMINISTRACIÓN

> **ACCESO RESTRINGIDO:** Esta sección únicamente está disponible para usuarios con rol de **Administrador** o **SuperAdministrador**.

Para acceder al panel de administración, haz clic en el botón **"Admin Panel"** de la barra de navegación superior (solo visible para admins).

> **[IMAGEN 10 — Panel de administración completo]**
> *Tipo: Captura de pantalla completa del AdminDashboard mostrando la estructura de dos columnas: columna izquierda con el estado del servidor, buscador y lista de jugadores; columna derecha con los editores. Idealmente con un jugador seleccionado para que se vean todos los paneles.*

El panel de administración está dividido en dos columnas:

- **Columna izquierda**: Estado del servidor, herramientas de búsqueda y lista de jugadores.
- **Columna derecha**: Editores y herramientas de gestión del jugador seleccionado.

---

### 4.1 Estado del Servidor

En la parte superior de la columna izquierda se encuentra el indicador de estado del servidor FiveM.

> **[IMAGEN 11 — Panel de estado del servidor]**
> *Tipo: Recorte del panel de estado del servidor mostrando el indicador online (bolita verde con brillo), el contador de jugadores conectados, la barra de progreso y el botón de actualización.*

El panel muestra la siguiente información:

| Elemento | Descripción |
|---|---|
| **Indicador de estado** | Bolita verde = Online / Bolita roja = Offline |
| **Jugadores conectados** | Número de jugadores actuales / Máximo permitido |
| **Barra de progreso** | Representación visual del porcentaje de ocupación |
| **Última actualización** | Timestamp de la última sincronización |
| **Botón de actualizar** | Fuerza una actualización manual del estado |

> **NOTA:** El estado del servidor se actualiza automáticamente cada 30 segundos. Si el servidor FiveM o txAdmin no están activos, este panel mostrará el estado como **Offline**.

---

### 4.2 Búsqueda de Jugadores

Bajo el panel de estado encontrarás el motor de búsqueda de jugadores, que permite localizar cualquier jugador por diferentes criterios.

> **[IMAGEN 12 — Panel de búsqueda con las pestañas visibles]**
> *Tipo: Recorte del panel de búsqueda mostrando las cuatro pestañas (Por Nombre, Por Trabajo, Por Grupo, Por Discord) y un campo de búsqueda activo con resultados.*

El buscador tiene **cuatro pestañas** de búsqueda:

#### Por Nombre
Busca jugadores por el nombre de su personaje.

1. Haz clic en la pestaña **"Por Nombre"**.
2. Escribe el nombre (o parte del nombre) en el campo de texto.
3. Haz clic en **"Buscar"** o pulsa Enter.
4. Los resultados aparecerán en la lista de jugadores.

#### Por Trabajo
Filtra jugadores según su empleo actual en el servidor.

- Ejemplos de trabajos: `police`, `ambulance`, `mechanic`, `taxi`

#### Por Grupo
Filtra jugadores según su rango o grupo asignado.

- Ejemplos de grupos: `user`, `admin`, `superadmin`

#### Por Discord
Busca un jugador específico usando su ID de Discord.

---

### Lista de Jugadores

Debajo del buscador se muestra la lista de jugadores (todos o los resultados de la búsqueda).

> **[IMAGEN 13 — Lista de jugadores en la columna izquierda]**
> *Tipo: Recorte de la lista de jugadores mostrando varios registros con su índice, nombre y trabajo. Uno de ellos debe estar resaltado (seleccionado) para mostrar el estado activo.*

Cada entrada muestra el número de orden, el nombre del personaje y su trabajo. Al hacer **clic sobre un jugador**, se cargará su información en la columna derecha para editarla.

---

### 4.3 Editor de Economía

Una vez seleccionado un jugador, el primer panel disponible en la columna derecha es el **Editor de Economía**.

> **[IMAGEN 14 — Editor de economía con los tres campos]**
> *Tipo: Recorte del panel "Editor de Economía" mostrando los tres campos de entrada (Efectivo, Banco, Dinero Sucio) con valores de ejemplo y el botón "Guardar".*

Permite modificar el dinero del jugador en sus tres cuentas:

1. **Efectivo ($)**: Dinero en mano del personaje.
2. **Banco ($)**: Saldo en cuenta bancaria.
3. **Dinero Sucio ($)**: Black money del personaje.

**Cómo modificar el dinero de un jugador:**

1. Selecciona el jugador en la lista izquierda.
2. En el panel "Editor de Economía", modifica los campos que necesites.
3. Haz clic en el botón **"Guardar"**.
4. Aparecerá una notificación confirmando que los cambios se han guardado correctamente.

> **ATENCIÓN:** Los cambios en la economía son inmediatos y se reflejarán en el juego la próxima vez que el jugador interactúe con su dinero. Asegúrate de introducir los valores correctos antes de guardar.

---

### 4.4 Gestor de Inventario

El **Gestor de Inventario** permite ver y modificar el inventario de cualquier jugador.

> **[IMAGEN 15 — Gestor de inventario con ítems y controles]**
> *Tipo: Captura del panel "Gestor de Inventario" mostrando la lista de ítems actuales del jugador (con nombres, cantidades y botones de eliminar), los campos para añadir un nuevo ítem y el botón rojo "Vaciar inventario".*

#### Ver el inventario actual

Los ítems del jugador se muestran como una lista con el nombre del objeto, la cantidad en un badge de color cian y un botón de eliminar (rojo) a la derecha.

#### Añadir un ítem

1. En el campo de texto, escribe el **nombre exacto del ítem** (tal como aparece en ESX).
2. En el campo numérico, introduce la **cantidad** a añadir.
3. Haz clic en el botón **"Añadir"**.
4. El ítem aparecerá en la lista inmediatamente.

#### Eliminar un ítem específico

Haz clic en el botón rojo de eliminar junto al ítem que deseas quitar del inventario del jugador.

#### Vaciar el inventario completo

Haz clic en el botón **"Vaciar inventario"** (en rojo, en la parte inferior del panel).

> **ATENCIÓN:** La acción de vaciar el inventario es **irreversible**. Se eliminará **todos** los ítems del jugador. Usa esta opción con precaución.

---

### 4.5 Gestor de Flota de Vehículos

El **Gestor de Flota** permite controlar el estado de los vehículos registrados a nombre del jugador seleccionado.

> **[IMAGEN 16 — Gestor de flota con tabla de vehículos]**
> *Tipo: Recorte del panel "Gestor de Flota" mostrando la tabla de vehículos con columnas Matrícula, Modelo, Estado y Acción. Mostrar al menos un vehículo con estado "GARAJE" y otro con "FUERA", y sus respectivos botones de acción.*

La tabla muestra por cada vehículo:

| Columna | Descripción |
|---|---|
| **Matrícula** | Identificador del vehículo |
| **Modelo** | Nombre del modelo |
| **Estado** | GARAJE / FUERA |
| **Acción** | Botón para cambiar el estado |

#### Guardar un vehículo en el garaje

Si el vehículo está con estado **FUERA**, haz clic en el botón de acción para guardarlo en el garaje. El estado cambiará a **GARAJE**.

#### Sacar un vehículo del garaje

Si el vehículo está con estado **GARAJE**, haz clic en el botón de acción para marcarlo como que está fuera del garaje. El estado cambiará a **FUERA**.

> **NOTA:** Este panel modifica únicamente el estado del vehículo en la base de datos. El vehículo no aparecerá físicamente en el juego hasta que el jugador lo saque por los medios habituales del servidor.

---

### 4.6 Control de Posición

El panel de **Control de Posición** permite teletransportar a un jugador a unas coordenadas específicas del mapa de GTA V / FiveM.

> **[IMAGEN 17 — Panel de control de posición con los cuatro campos]**
> *Tipo: Recorte del panel "Control de Posición" mostrando los cuatro campos de coordenadas (X, Y, Z, Heading) con valores de ejemplo y el botón "Teletransportar" en cian.*

Los campos disponibles son:

| Campo | Descripción |
|---|---|
| **X** | Coordenada X en el mapa |
| **Y** | Coordenada Y en el mapa |
| **Z** | Coordenada Z (altura) |
| **Heading** | Dirección hacia la que mira el jugador (0–360°) |

**Cómo teletransportar a un jugador:**

1. Introduce las coordenadas X, Y, Z del destino.
2. (Opcional) Introduce el valor de Heading para orientar al jugador.
3. Haz clic en **"Teletransportar"**.
4. El jugador será movido a esa posición la próxima vez que el servidor procese la acción.

> **CONSEJO:** Puedes obtener las coordenadas de un punto en el mapa usando la función de depuración de FiveM o consultando mapas de coordenadas de GTA V disponibles online.

---

### 4.7 Zona de Peligro — Kick y Ban

La **Zona de Peligro** contiene las herramientas de sanción del servidor: expulsión temporal (kick) y prohibición de acceso (ban).

> **[IMAGEN 18 — Zona de peligro completa con secciones de kick y ban]**
> *Tipo: Captura completa del panel "Zona de Peligro" (fondo rojo oscuro) mostrando la sección de Kick con su campo de motivo y botón, y la sección de Ban con su campo de motivo, selector de duración y botón rojo. El panel debe mostrar el borde y el color de advertencia característicos.*

#### Expulsar a un jugador (Kick)

La expulsión es **temporal**: el jugador es desconectado del servidor pero puede volver a conectarse inmediatamente.

1. Selecciona el jugador en la lista.
2. En la sección "Kick", introduce el **motivo** de la expulsión en el campo de texto.
3. Haz clic en el botón de expulsión.
4. El jugador será expulsado del servidor y recibirá el mensaje con el motivo indicado.

> **[IMAGEN 19 — Sección de Kick con campo de motivo]**
> *Tipo: Recorte de la sección de Kick dentro del panel Zona de Peligro, mostrando el campo de texto para el motivo y el botón de expulsión con su icono.*

#### Banear a un jugador (Ban)

El ban **impide al jugador conectarse** al servidor durante el período indicado.

1. Selecciona el jugador en la lista.
2. En la sección "Ban", introduce el **motivo** del baneo.
3. Selecciona la **duración** del ban en el desplegable:

| Opción | Duración |
|---|---|
| 1 hora | 60 minutos |
| 6 horas | 6 horas |
| 1 día | 24 horas |
| 3 días | 72 horas |
| 1 semana | 7 días |
| 1 mes | 30 días |
| Permanente | Sin fecha de expiración |

4. Haz clic en el botón **"Banear"** (rojo).
5. Aparecerá una ventana de **confirmación** solicitando que verifiques la acción.
6. Confirma para ejecutar el ban.

> **[IMAGEN 20 — Sección de Ban con selector de duración y confirmación]**
> *Tipo: Dos imágenes o una imagen en dos partes: (a) el panel de Ban con el selector de duración desplegado mostrando todas las opciones, y (b) la ventana de confirmación que aparece antes de ejecutar el ban.*

> **ATENCIÓN:** El ban permanente solo debe aplicarse en casos extremos y con autorización de la administración del servidor. Esta acción puede revertirse manualmente en la base de datos, pero no desde este panel.

---

## 5. ROLES Y PERMISOS

El panel tiene tres niveles de acceso:

### Jugador (user)
- Acceso al Dashboard personal.
- Puede ver sus datos, vehículos, inventario y finanzas.
- No puede ver ni modificar datos de otros jugadores.
- No tiene acceso al panel de administración.

### Administrador (admin)
- Todo lo anterior.
- Acceso al panel de administración completo.
- Puede buscar, ver y editar cualquier jugador.
- Puede usar todas las herramientas de gestión (economía, inventario, vehículos, posición).
- Puede expulsar (kick) y banear jugadores.

### SuperAdministrador (superadmin)
- Todos los permisos de Administrador.
- Máximo nivel de privilegios en el servidor.

> **[IMAGEN 21 — Comparativa de vistas según el rol]**
> *Tipo: Dos capturas en paralelo: (izquierda) Dashboard de un jugador normal sin el botón "Admin Panel", y (derecha) Dashboard de un admin con el botón "Admin Panel" visible en la barra de navegación. Se pueden poner en la misma imagen o como dos capturas separadas.*

---

## 6. PREGUNTAS FRECUENTES

**¿Por qué no veo mis vehículos o inventario?**
Los datos se cargan desde la base de datos del servidor FiveM. Si el servidor no está activo o acabas de crear el personaje, es posible que los datos tarden unos momentos en aparecer. Prueba a recargar la página.

**¿Por qué no puedo hacer login?**
Asegúrate de que tu cuenta de Discord está vinculada a tu personaje en el servidor. Si es la primera vez que accedes, puede que necesites hablar con un administrador para asociar tu Discord a tu cuenta.

**¿Puedo ver los datos de otro jugador desde mi cuenta?**
No. Los jugadores normales solo pueden ver sus propios datos. Solo los administradores tienen acceso a los datos de otros jugadores.

**¿Los cambios que hace un admin son inmediatos?**
Los cambios de economía e inventario se aplican en la base de datos de forma inmediata. Dependiendo del servidor, el jugador puede necesitar reconectarse o realizar alguna acción en el juego para que los cambios tengan efecto.

**¿Puedo recuperar un inventario vaciado por error?**
No desde el panel. La acción de vaciar inventario es irreversible desde la interfaz. Para recuperar los datos sería necesario restaurar la base de datos o introducir los ítems manualmente uno a uno.

**¿El panel funciona en el móvil?**
Sí, el panel tiene diseño responsive y puede usarse desde dispositivos móviles, aunque la experiencia está optimizada para escritorio.

**¿Qué hago si el estado del servidor aparece como Offline?**
El panel requiere que el servidor FiveM y txAdmin estén activos y en ejecución. Si el servidor está caído, contacta con el administrador técnico del servidor.

---

*Fin del Manual de Usuario*
