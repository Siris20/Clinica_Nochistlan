@echo off
echo Construyendo imagenes Docker...
docker-compose build

echo Exportando imagenes Docker...
docker save tadimex-backend:latest tadimex-frontend:latest -o tadimex-images.tar

echo Copiando nginx.conf al directorio actual...
copy Tadimex-frontend\nginx\nginx.conf nginx.conf

echo Comprimiendo archivos del proyecto...
"C:\Users\Dell\Desktop\Izcaltia\Tadimex" a -tzip tadimex-deploy.zip ^
    tadimex-images.tar ^
    docker-compose.yml ^
    nginx.conf ^
    .env ^
    init-scripts\ ^
    install.bat

echo Limpiando archivos temporales...
del nginx.conf

echo ¡Listo!