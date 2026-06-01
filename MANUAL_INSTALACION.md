# MANUAL DE INSTALACIÓN — FiveM Panel UCP

**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Aplicación:** Panel de Control UCP para servidores FiveM con ESX Legacy  

---

## ÍNDICE

1. Introducción
2. Requisitos Previos
3. Instalación de Dependencias del Sistema
4. Configuración del Servidor FiveM y txAdmin
5. Configuración de la Base de Datos
6. Configuración de la Aplicación Discord OAuth2
7. Clonado y Configuración del Repositorio
8. Despliegue con Docker
9. Instalación y Ejecución del Frontend
10. Verificación del Sistema
11. Solución de Problemas Comunes

---

## 1. INTRODUCCIÓN

FiveM Panel UCP es una aplicación web para la gestión de servidores FiveM que utiliza el framework ESX Legacy. Permite a los administradores gestionar jugadores, economía, vehículos y el estado del servidor desde un panel web centralizado.

La aplicación está compuesta por los siguientes componentes:

| Componente | Tecnología | Descripción |
|---|---|---|
| Frontend | React 19 + Vite | Interfaz de usuario web |
| API Gateway | Spring Boot 3 | Punto de entrada de la API |
| Auth Service | Spring Boot 4 + Discord OAuth2 | Autenticación de usuarios |
| Player Service | Spring Boot 4 + JPA | Gestión de jugadores ESX |
| Mgmt Service | Spring Boot 4 | Control del servidor FiveM vía txAdmin |
| Eureka Server | Spring Cloud Netflix | Descubrimiento de servicios |
| Base de Datos | MariaDB 10.4+ | Almacenamiento de datos |

> **[IMAGEN 1 — Diagrama de arquitectura]**
> *Tipo: Diagrama de bloques o flecha mostrando cómo se comunican los componentes entre sí. Puede ser una captura del diagrama de arquitectura, o un diagrama creado en draw.io/Lucidchart. Orientación horizontal preferida.*

---

## 2. REQUISITOS PREVIOS

Antes de comenzar la instalación, asegúrese de disponer de lo siguiente:

### 2.1 Hardware Mínimo Recomendado

| Recurso | Mínimo | Recomendado |
|---|---|---|
| CPU | 2 núcleos | 4 núcleos |
| RAM | 4 GB | 8 GB |
| Almacenamiento | 10 GB libres | 20 GB libres |

### 2.2 Software Necesario

- **Sistema Operativo:** Windows 10/11, Ubuntu 20.04+, o Debian 11+
- **Docker Desktop** 4.0 o superior (incluye Docker Compose)
- **Node.js** 18 o superior
- **npm** 9 o superior (se instala con Node.js)
- **Git** 2.30 o superior
- **Navegador web** moderno (Chrome, Firefox, Edge)

### 2.3 Servicios Externos Requeridos

> **IMPORTANTE:** Los siguientes servicios deben estar operativos **antes** de iniciar la aplicación:

- **Servidor FiveM** en ejecución con el framework **ESX Legacy** instalado
- **txAdmin** activo y accesible (por defecto en `http://localhost:40120`)
- **Cuenta de Discord** con una aplicación OAuth2 registrada en el [Portal de Desarrolladores de Discord](https://discord.com/developers/applications)
- **MariaDB 10.4+** (puede ejecutarse en Docker o de forma nativa)

> **[IMAGEN 2 — Panel de txAdmin activo]**
> *Tipo: Captura de pantalla del panel de txAdmin mostrando el servidor en estado "Running" o "Started". Recortar para mostrar el header con el estado del servidor claramente visible.*

---

## 3. INSTALACIÓN DE DEPENDENCIAS DEL SISTEMA

### 3.1 Instalación de Docker Desktop

1. Descargue Docker Desktop desde la página oficial.
2. Ejecute el instalador y siga el asistente.
3. Reinicie el equipo si se le solicita.
4. Abra Docker Desktop y espere a que el motor de Docker arranque (el icono en la barra de tareas debe estar en verde).

> **[IMAGEN 3 — Docker Desktop en ejecución]**
> *Tipo: Captura de pantalla de Docker Desktop abierto, mostrando que el motor está corriendo (icono verde y texto "Docker Desktop is running").*

5. Verifique la instalación abriendo una terminal y ejecutando:

```bash
docker --version
docker compose version
```

La salida debe mostrar las versiones instaladas, por ejemplo:

```
Docker version 25.0.3, build 4debf41
Docker Compose version v2.24.5
```

### 3.2 Instalación de Node.js

1. Descargue el instalador LTS de Node.js desde la página oficial.
2. Ejecute el instalador y acepte las opciones por defecto.
3. Verifique la instalación:

```bash
node --version
npm --version
```

Resultado esperado:

```
v20.x.x
10.x.x
```

### 3.3 Instalación de Git

1. Descargue Git desde la página oficial.
2. Ejecute el instalador con las opciones por defecto.
3. Verifique la instalación:

```bash
git --version
```

---

## 4. CONFIGURACIÓN DEL SERVIDOR FIVEM Y TXADMIN

> **ATENCIÓN:** Este paso es crítico. La aplicación UCP **no funcionará correctamente** si el servidor FiveM o txAdmin no están activos y correctamente configurados.

### 4.1 Estado Requerido del Servidor

Antes de continuar, confirme que:

- [ ] El servidor FiveM está encendido y en estado **"Started"** en txAdmin
- [ ] txAdmin es accesible en `http://localhost:40120` (o la IP/puerto configurados)
- [ ] El framework **ESX Legacy** está instalado y funcionando en el servidor
- [ ] La base de datos del servidor FiveM (usualmente llamada `essentialmode` o `esx`) está creada y tiene datos

> **[IMAGEN 4 — Panel txAdmin con servidor iniciado]**
> *Tipo: Captura de pantalla completa del dashboard de txAdmin mostrando el servidor en estado activo, con el número de jugadores conectados visible y las métricas del servidor.*

### 4.2 Verificar Acceso a txAdmin

Abra un navegador y acceda a `http://localhost:40120`. Debería ver la pantalla de login de txAdmin.

> **[IMAGEN 5 — Pantalla de login de txAdmin]**
> *Tipo: Captura de pantalla de la pantalla de inicio de sesión de txAdmin.*

Anote las credenciales de acceso a txAdmin, ya que serán necesarias en el archivo de configuración `.env`.

### 4.3 Verificar la Base de Datos de ESX

La aplicación se conecta a la **misma base de datos que usa ESX Legacy**. Confirme que:

- El servidor MariaDB/MySQL está activo
- La base de datos `ucp` (o la que corresponda) existe y contiene las tablas de ESX (`players`, `owned_vehicles`, etc.)
- Las credenciales de acceso a la base de datos son conocidas

---

## 5. CONFIGURACIÓN DE LA BASE DE DATOS

### 5.1 Importar el Schema SQL

El repositorio incluye un archivo SQL con la estructura de base de datos necesaria para el panel UCP.

1. Acceda a su servidor MariaDB:

```bash
mysql -u root -p
```

2. Cree la base de datos si no existe:

```sql
CREATE DATABASE IF NOT EXISTS ucp CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ucp;
```

3. Salga del cliente MySQL y ejecute el script SQL incluido en el repositorio:

```bash
mysql -u root -p ucp < sql/bd.sql
```

> **[IMAGEN 6 — Importación correcta del SQL]**
> *Tipo: Captura de pantalla de la terminal mostrando la ejecución exitosa del script SQL, o captura de phpMyAdmin/HeidiSQL mostrando las tablas importadas correctamente.*

4. Verifique que las tablas se han creado correctamente:

```sql
USE ucp;
SHOW TABLES;
```

Debería aparecer una lista de tablas como `players`, `owned_vehicles`, `users`, `fine_types`, entre otras.

---

## 6. CONFIGURACIÓN DE LA APLICACIÓN DISCORD OAUTH2

La autenticación del panel utiliza Discord como proveedor de identidad. Es necesario crear una aplicación en el portal de desarrolladores de Discord.

### 6.1 Crear una Aplicación en Discord

1. Acceda al [Portal de Desarrolladores de Discord](https://discord.com/developers/applications).
2. Haga clic en **"New Application"**.

> **[IMAGEN 7 — Botón New Application en Discord Developer Portal]**
> *Tipo: Captura de pantalla del portal de Discord mostrando el botón "New Application" en la esquina superior derecha.*

3. Asigne un nombre a la aplicación (por ejemplo, `FiveM Panel UCP`) y haga clic en **"Create"**.

### 6.2 Configurar OAuth2

1. En el menú lateral, seleccione **OAuth2 → General**.
2. En la sección **"Redirects"**, haga clic en **"Add Redirect"** y añada la siguiente URL:

```
http://localhost:8080/login/oauth2/code/discord
```

> **[IMAGEN 8 — Configuración de Redirect URI en Discord]**
> *Tipo: Captura de pantalla de la sección OAuth2 de la aplicación de Discord, mostrando la URL de redirección añadida.*

3. Haga clic en **"Save Changes"**.

### 6.3 Obtener Credenciales

1. En la sección **OAuth2 → General**, copie:
   - **Client ID**
   - **Client Secret** (haga clic en "Reset Secret" si no es visible)

> **[IMAGEN 9 — Client ID y Client Secret de Discord]**
> *Tipo: Captura de pantalla mostrando la sección con el Client ID y el botón para revelar/copiar el Client Secret. Difuminar o tapar los valores reales antes de incluir la imagen.*

Guarde estos valores, serán necesarios en el paso siguiente.

---

## 7. CLONADO Y CONFIGURACIÓN DEL REPOSITORIO

### 7.1 Clonar el Repositorio

Abra una terminal en el directorio donde desea instalar la aplicación y ejecute:

```bash
git clone https://github.com/ddaannii71/fivem-panel-ucp.git
cd fivem-panel-ucp
```

### 7.2 Configurar el Archivo de Variables de Entorno

En la raíz del repositorio existe un archivo `.env` que contiene toda la configuración de la aplicación. Edite este archivo con un editor de texto:

```bash
# En Windows
notepad .env

# En Linux/macOS
nano .env
```

El contenido del archivo `.env` es el siguiente. Reemplace los valores con su configuración real:

```env
# Clave secreta para firmar los tokens JWT
# Debe ser una cadena larga y aleatoria. NO comparta esta clave.
JWT_SECRET=CambieEsteValorPorUnaClaveLargaYSegura

# Credenciales de la aplicación Discord OAuth2
DISCORD_CLIENT_ID=su_client_id_de_discord
DISCORD_CLIENT_SECRET=su_client_secret_de_discord

# URL y credenciales de txAdmin
# Asegúrese de que txAdmin esté activo antes de continuar
TXADMIN_URL=http://localhost:40120
TXADMIN_USER=su_usuario_txadmin
TXADMIN_PASSWORD=su_contraseña_txadmin

# Configuración de la base de datos MariaDB
DB_HOST=localhost
DB_NAME=ucp
DB_USER=root
DB_PASSWORD=su_contraseña_bd
```

> **IMPORTANTE sobre TXADMIN_URL:** Si txAdmin corre en una máquina diferente o en un puerto distinto al por defecto (40120), modifique esta URL en consecuencia. El panel UCP **requiere** que txAdmin esté accesible para las funciones de gestión del servidor.

> **[IMAGEN 10 — Archivo .env editado con los valores correctos]**
> *Tipo: Captura de pantalla del archivo .env abierto en un editor de texto (Notepad++, VS Code, etc.) con los valores configurados. Asegúrese de tapar o difuminar los valores sensibles como contraseñas y secrets antes de incluir la imagen.*

---

## 8. DESPLIEGUE CON DOCKER

### 8.1 Verificar que Docker Desktop está en Ejecución

Antes de continuar, asegúrese de que Docker Desktop está abierto y activo (icono verde en la barra de tareas).

### 8.2 Construir e Iniciar los Servicios

Desde la raíz del repositorio, ejecute el siguiente comando para construir las imágenes Docker e iniciar todos los servicios:

```bash
docker compose up --build
```

> **NOTA:** La primera vez que ejecute este comando, Docker descargará las imágenes base y compilará el código Java con Maven. Este proceso puede tardar entre **5 y 15 minutos** dependiendo de la velocidad de conexión y el hardware.

> **[IMAGEN 11 — Terminal durante la construcción de Docker]**
> *Tipo: Captura de pantalla de la terminal mostrando la salida del proceso `docker compose up --build`, idealmente cuando todos los servicios han arrancado y muestran mensajes como "Started Application" o "Eureka registered".*

### 8.3 Verificar que los Servicios están en Ejecución

Una vez completado el proceso, abra Docker Desktop y compruebe que los 5 contenedores están activos (estado verde):

- `eureka-server`
- `api-gateway`
- `auth-service`
- `player-service`
- `mgmt-service`

> **[IMAGEN 12 — Docker Desktop con los 5 contenedores activos]**
> *Tipo: Captura de pantalla de Docker Desktop mostrando el grupo de contenedores del proyecto con todos en estado "Running" (indicador verde). Preferiblemente la vista de "Containers" expandida para ver todos los servicios.*

También puede verificar desde la terminal:

```bash
docker compose ps
```

La salida debe mostrar todos los servicios con estado `running`.

### 8.4 Verificar el Eureka Server

Abra un navegador y acceda a `http://localhost:8761`. Debería ver el panel de Eureka con los servicios registrados.

> **[IMAGEN 13 — Panel de Eureka con servicios registrados]**
> *Tipo: Captura de pantalla del dashboard de Eureka Server en el navegador, mostrando los servicios AUTH-SERVICE, PLAYER-SERVICE, MGMT-SERVICE y API-GATEWAY registrados y en estado UP.*

---

## 9. INSTALACIÓN Y EJECUCIÓN DEL FRONTEND

### 9.1 Instalar Dependencias

Abra una nueva terminal, navegue a la carpeta del frontend e instale las dependencias:

```bash
cd frontend
npm install
```

> **[IMAGEN 14 — Terminal con npm install completado]**
> *Tipo: Captura de pantalla de la terminal mostrando la finalización de `npm install` con el mensaje de paquetes instalados (por ejemplo "added 287 packages").*

### 9.2 Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La terminal mostrará una salida similar a:

```
  VITE v8.x.x  ready in 500 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

> **[IMAGEN 15 — Terminal con Vite en ejecución]**
> *Tipo: Captura de pantalla de la terminal mostrando el mensaje de Vite con la URL local del servidor de desarrollo.*

### 9.3 Acceder al Panel

Abra un navegador y acceda a:

```
http://localhost:3000
```

Debería aparecer la página de inicio del panel con la opción de iniciar sesión con Discord.

> **[IMAGEN 16 — Página de inicio del panel (Landing Page)]**
> *Tipo: Captura de pantalla completa del navegador mostrando la página de bienvenida del panel UCP con el botón de login con Discord.*

### 9.4 Proceso de Login

1. Haga clic en **"Iniciar sesión con Discord"**.
2. Se abrirá una ventana de Discord solicitando autorización.
3. Haga clic en **"Autorizar"**.

> **[IMAGEN 17 — Ventana de autorización de Discord]**
> *Tipo: Captura de pantalla de la ventana de autorización de Discord mostrando los permisos que solicita la aplicación y los botones "Cancelar" / "Autorizar".*

4. Tras autorizar, será redirigido al panel de administración.

> **[IMAGEN 18 — Dashboard del panel tras el login]**
> *Tipo: Captura de pantalla completa del panel de administración una vez autenticado, mostrando el menú lateral, las estadísticas del servidor y la información de jugadores conectados.*

---

## 10. VERIFICACIÓN DEL SISTEMA

Tras completar la instalación, realice las siguientes comprobaciones para confirmar que todo funciona correctamente:

### 10.1 Lista de Verificación Final

| Componente | URL de Acceso | Estado Esperado |
|---|---|---|
| Frontend (Panel UCP) | `http://localhost:3000` | Muestra la página de inicio |
| API Gateway | `http://localhost:8080` | Responde a peticiones HTTP |
| Eureka Server | `http://localhost:8761` | Muestra servicios registrados |
| txAdmin | `http://localhost:40120` | Muestra el dashboard del servidor |

### 10.2 Prueba de Funcionalidades Principales

- [ ] Login con Discord funciona correctamente
- [ ] El panel muestra la lista de jugadores del servidor
- [ ] El estado del servidor FiveM se muestra en el dashboard
- [ ] Las funciones de gestión (kick, ban) responden correctamente
- [ ] El editor de economía carga los datos de los jugadores

---

## 11. SOLUCIÓN DE PROBLEMAS COMUNES

### Error: "Cannot connect to Docker daemon"

**Causa:** Docker Desktop no está en ejecución.  
**Solución:** Abra Docker Desktop y espere a que arranque completamente antes de ejecutar `docker compose up`.

### Error: "Connection refused" al acceder al panel

**Causa:** Los servicios backend no han terminado de arrancar.  
**Solución:** Espere 1-2 minutos tras ejecutar `docker compose up` y vuelva a intentarlo. Consulte los logs con `docker compose logs -f`.

### Error: "txAdmin no responde" o funciones de gestión no disponibles

**Causa:** txAdmin no está activo o la URL configurada en `.env` es incorrecta.  
**Solución:**
1. Verifique que el servidor FiveM y txAdmin están en ejecución.
2. Compruebe que la URL `TXADMIN_URL` en el archivo `.env` es correcta y accesible desde el navegador.
3. Reinicie los servicios con `docker compose restart mgmt-service`.

### Error al hacer login con Discord: "redirect_uri_mismatch"

**Causa:** La URL de redirección configurada en Discord no coincide.  
**Solución:** Acceda al Portal de Desarrolladores de Discord, vaya a su aplicación → OAuth2 → General y asegúrese de que la URL `http://localhost:8080/login/oauth2/code/discord` está añadida en la lista de Redirects.

### La base de datos no conecta

**Causa:** Las credenciales de `DB_HOST`, `DB_USER` o `DB_PASSWORD` en `.env` son incorrectas, o MariaDB no está en ejecución.  
**Solución:** Verifique las credenciales e intente conectarse manualmente con `mysql -u root -p` para confirmar que el servidor de base de datos está activo.

### El frontend no muestra datos de jugadores

**Causa:** El servidor FiveM con ESX Legacy no está activo, o la base de datos de ESX no tiene datos.  
**Solución:** Confirme que el servidor FiveM está encendido y que la base de datos contiene registros de jugadores en la tabla `players`.

---

*Fin del Manual de Instalación*
