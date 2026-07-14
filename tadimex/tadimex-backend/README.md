# Hospital Nochistlán - ERP/CRM Backend

Bienvenido al repositorio del Backend para el sistema integral ERP/CRM del Hospital Privado Nochistlán. Este proyecto está basado en una arquitectura modular enfocada en la gestión de pacientes, agenda de citas médicas, expedientes clínicos y administración de inventarios/farmacia.

## Requisitos Previos

Para ejecutar y desarrollar en este proyecto de manera local, solo necesitas tener instalado:

- **Git:** [https://git-scm.com/downloads](https://git-scm.com/downloads)
- **Visual Studio Code:** [https://code.visualstudio.com/](https://code.visualstudio.com/)
- **Docker Desktop:** [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop) (Incluye Docker Compose)
- **Gestor de Base de Datos (A elección):** 
  - **HeidiSQL:** [https://www.heidisql.com/](https://www.heidisql.com/) (Excelente opción si usas Windows, es súper ligero y rápido para MariaDB).
  - **DBeaver Community:** [https://dbeaver.io/](https://dbeaver.io/) (Ideal si usas Mac/Linux o si prefieres una herramienta visual que genere diagramas de las tablas automáticamente).
## Guía de Instalación

### Clonar el Repositorio
Crear una carpeta Tadimex en el equipo.
Abrir la carpeta tadimex desde la terminal y ejecutar el siguiente comando para clonar el repositorio:

```bash
git clone https://github.com/Siris20/Clinica_Nochistlan.git
```
Si no tienes un usuario autenticado, autenticarse con tu usuario de Github

### Agregar variables de Entorno al Sistema

Para que el repositorio funcione correctamente es necesario configurar variables de Entorno, es decir
MariaDB y Git se encuentren en la variable del sistema $PATH.

Generalmente esto se configura automaticamente durante la instalación, sin embargo si no funciona realizar lo siguiente. 

- Utilizar el atajo Windows+R, para abrir la ventana de ejecución.
- Dentro de ejecutar escribir sysdm.cpl
- En el menu de opciones superior, ir a 'Opciones Avanzadas'
- Dar clic en variables de entorno
- En la tabla de variables del sistema, buscar Path y hacer doble clic
- Buscar en la lista el directorio de MariaDB, Git , si están presentes cerrar todo, ya que el sistema deberia funcionar.
EJEMPLO DE COMO SE VERÍA GIT EN PATH (Esto variara dependiendo de la versión instalada y donde se instala).

```bash
C:\Program Files\MariaDB 11.7\bin
```
En caso de no ver MariaDB o Git en Path ir a la carpeta donde estan instalados los ejecutables copiar la ruta de acceso y
pegarlas como nuevas variables.

En el caso de MariaDB es la carpeta bin y en el caso de Git es la carpeta cmd.

### Configurar el .env (Environment)

- Crear un archivo .env en la carpeta raiz del proyecto o duplicar el .env.example y renombrarlo a .env
- Llenar las variables importantes como:
 Configuración General del Proyecto.
 Configuración del Servidor.
 Configuración de API y Seguridad
 Configuracion autenticacion
 Configuración de CORS para el frontend
 Configuración de MariaDB
 Configuración de Archivos y Almacenamiento

Llenar el resto de secciones con datos al azar, de momento no son utilizados

### Configurar el Entorno Virtual
Una vez que las variables de entorno estén en Path, abrir una terminal y ejecutar los siguientes comandos. 

Navegar al repositorio clonado

```bash
cd tadimex-backend
```
Crea el entorno virtual:

```bash
python -m venv venv
```
Activa un entorno virtual para gestionar las dependencias de manera aislada:

```bash
# Para Linux/macOS:
source venv/bin/activate
# Para Windows:
venv\Scripts\activate
```

### Instalar Dependencias

Una vez el entorno virtual este activado, escribir el siguiente comando en la terminal de Visual Studio Code.

```bash
pip install -r requirements.txt
```
### Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto.

Copia las variables del archivo .env.example

y llena la información adecuadamente, especial atención a las configuraciones de las bases de datos.

### Migraciones de Base de Datos

Inicializa y actualiza la base de datos:

Asegúrate que MariaDB se encuentra en PATH.

Posteriormente:

En una terminal, inicia sesión en MariaDB con el siguiente comando:

```bash
mysql -u root -p
```
Después pedirá ingresar contraseña.

Una vez dentro, crear la base de datos tadimex_db con el comando:

```bash
create database tadimex_db;
```
Aplicar las migraciones a la base de datos con el siguiente comando: 

```bash
# Aplicar migraciones
alembic upgrade head
```
### Servidor de Desarrollo

Inicia el servidor de desarrollo:

```bash
uvicorn app.main:app --reload
```
La API estará disponible en `http://localhost:8000`. Accede a la documentación interactiva de la API en `http://localhost:8000/docs`.

## Contribuciones

1. Haz un fork del repositorio
2. Crea tu rama de funcionalidad:git checkout -b feature/nombre-de-tu-funcionalidad
3. Realiza tus cambios y haz commit:git commit -m "Descripción de tu funcionalidad"
4. Sube tus cambios a tu rama para ser revisadogit push

## Mantener el repositorio actualizado

Para asegurarnos que el sistema siempre funcione correctamente, se recomienda ejecutar los siguientes comandos siempre. 

```bash
git pull
```
Seguir los pasos de: 

- Activar el entorno virtual (Linea 86).
- Migraciones de bases de datos (Linea 110).
