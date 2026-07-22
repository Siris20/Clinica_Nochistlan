# Tadimex Frontend
Bienvenido al repositorio de Tadimex Frontend. Este proyecto está enfocado en el desarrollo de la capa de frontend para la plataforma Tadimex, que incluye la gestión almacenes, productos, clientes, personal, cotizaciones y con servicios de scraping y envío de whatsapp.

## Requisitos Previos
Antes de empezar a trabajar con este proyecto, asegúrate de tener instalado:

- Git: [https://git-scm.com/downloads/win](https://git-scm.com/downloads/win) 
- Visual Studio Code: [https://code.visualstudio.com/](https://code.visualstudio.com/) 
- Node: [https://nodejs.org/es](https://nodejs.org/es) 
## Guía de Instalación
### Clonar el Repositorio
Crear una carpeta Tadimex en el equipo. 

Abrir la carpeta tadimex desde la terminal y ejecutar el siguiente comando para clonar el repositorio:

```bash
git clone https://github.com/Joulxd/Tadimex-frontend.git
```
Si no tienes un usuario autenticado, autenticarse con tu usuario de Github

### Agregar variables de Entorno al Sistema
Para que el repositorio funcione correctamente es necesario configurar variables de Entorno, es decir
Node y Git se encuentren en la variable del sistema $PATH.

Generalmente esto se configura automaticamente durante la instalación, sin embargo si no funciona realizar lo siguiente. 

- Utilizar el atajo Windows+R, para abrir la ventana de ejecución.
- Dentro de ejecutar escribir sysdm.cpl
- En el menu de opciones superior, ir a 'Opciones Avanzadas'
- Dar clic en variables de entorno
- En la tabla de variables del sistema, buscar Path y hacer doble clic
- Buscar en la lista el directorio de Node, Git , si están presentes cerrar todo, ya que el sistema deberia funcionar.
EJEMPLO DE COMO SE VERÍA GIT EN PATH (Esto variara dependiendo de la versión instalada y donde se instala).

```bash
C:\Program Files\MariaDB 11.7\bin
```
En caso de no ver Node o Git en Path ir a la carpeta donde estan instalados los ejecutables copiar la ruta de acceso y
pegarlas como nuevas variables.

En el caso de MariaDB es la carpeta raiz de instalación y en el caso de Git es la carpeta cmd.

### Instalar las dependencias de desarrollo
Navegar al directorio clonado, y desde una terminal ejecutar el siguiente comando

```bash
npm install
```
### Configurar el environment
Crear un archivo .env o duplicar .env.example y renombrar a .env

Ingresar la url del server en la variable de entorno. (VITE_API_SERVER=)

### Ejecutar el servidor con el siguiente comando
```bash
npm run dev
```
