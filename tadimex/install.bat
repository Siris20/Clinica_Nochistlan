@echo off
echo Iniciando instalacion de Tadimex...

:: Verificar si Docker está instalado
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker no esta instalado. Por favor instala Docker Desktop primero.
    pause
    exit /b 1
)

echo Cargando imagenes Docker...
docker load -i tadimex-images.tar

echo Iniciando servicios con Docker Compose...
docker-compose up -d

echo.
echo ¡Modulo Tadimex desplegado correctamente!
echo La aplicacion estará disponible en http://localhost
echo.
echo Para detener el sistema: docker-compose down
echo Para ver los logs: docker-compose logs -f
echo.
pause