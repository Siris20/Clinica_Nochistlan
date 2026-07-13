# Manual de Despliegue (Docker Compose) - Tadimex

Este manual sirve para montar Tadimex desde cero en una maquina nueva (Windows + PowerShell), restaurando:

- Base de datos desde `tadimex_db.sql`
- Archivos estaticos (imagenes) en `static\\logos` y `static\\uploads`

## Requisitos

- Docker Desktop instalado y funcionando (modo Linux containers).
- Proyecto con `docker-compose.yml` en la carpeta `tadimex`.
- Carpeta de respaldo (recomendado):
  - `deploy_assets\\tadimex_db.sql`
  - `deploy_assets\\static\\logos\\`
  - `deploy_assets\\static\\uploads\\`

## Variables que debes ajustar

En los comandos de abajo reemplaza:

- `REPO_DIR` por la ruta donde esta el repo `tadimex` (donde esta `docker-compose.yml`)
- `ASSETS_DIR` por la ruta donde guardaste `deploy_assets`

Ejemplo:

- `REPO_DIR=C:\\Users\\tu_usuario\\Desktop\\tadimex_project\\tadimex`
- `ASSETS_DIR=C:\\Users\\tu_usuario\\Desktop\\tadimex_project\\deploy_assets`

## Flujo "Desde Cero" (borra TODO y restaura)

Abre PowerShell y ejecuta:\

```powershell
$REPO_DIR = "C:\RUTA\A\tadimex"
$ASSETS_DIR = "C:\RUTA\A\deploy_assets"

Set-Location $REPO_DIR

# 0) Parar y borrar contenedores + volúmenes (BD + estáticos)
docker compose down -v --remove-orphans

# 1) Levantar solo MariaDB
docker compose up -d mariadb

# 2) Importar la BD (IMPORTANTE: no uses Get-Content para no romper encoding)
docker cp "$ASSETS_DIR\tadimex_db.sql" tadimex-mariadb:/tmp/tadimex_db.sql
docker compose exec mariadb sh -c "mariadb --default-character-set=latin1 -uadmin -pH8cf708NQ9o73jU2ggQ4 < /tmp/tadimex_db.sql"

# 3) Levantar el resto
docker compose up -d --build

# 4) Copiar estáticos al volumen del backend
docker cp "$ASSETS_DIR\static\logos" tadimex-backend:/app/static/
docker cp "$ASSETS_DIR\static\uploads" tadimex-backend:/app/static/

# 5) Reiniciar servicios que sirven archivos
docker compose restart backend nginx
```

## Verificacion rapida

```powershell
Set-Location $REPO_DIR
docker compose ps
docker compose logs backend --tail=50
```

URLs:

- Frontend: `http://localhost/`
- Backend docs: `http://localhost:8000/docs`

## Conectar HeidiSQL (opcional)

Si tu `docker-compose.yml` expone el puerto:

- Host: `127.0.0.1`
- Puerto: `3306` (lo cambia por 3307 porque ese estaba en uso)
- Usuario: `admin`
- Password: `H8cf708NQ9o73jU2ggQ4`
- DB: `tadimex_db`

## Problemas comunes

- Backend reinicia con `"$'\r': command not found"`:
  - Algún `.sh` se guardo con CRLF. Convierte a LF.
- Importacion rompe acentos / enums (sale `??`):
  - No importes el `.sql` con `Get-Content | ...`.
  - Usa `docker cp` + `mariadb --default-character-set=latin1 < file.sql`.
- No aparecen imagenes:
  - Confirma que copiaste `logos` y `uploads` a `tadimex-backend:/app/static/`.
  - Reinicia `backend` y `nginx`.

