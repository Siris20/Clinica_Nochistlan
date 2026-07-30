#!/bin/bash

# Esperar a que MariaDB este disponible
echo "Esperando a que MariaDB este disponible..."
until mysql -h "$MARIADB_HOST" -u "$MARIADB_USER" -p"$MARIADB_PASSWORD" -e "SELECT 1" >/dev/null 2>&1; do
  echo "MariaDB no esta disponible aun, esperando..."
  sleep 2
done
echo "MariaDB esta disponible!"

# Aplicar migraciones si alembic.ini existe
if [ -f alembic.ini ]; then
  echo "Aplicando migraciones..."
  alembic upgrade head || echo "Advertencia: Error al aplicar migraciones"
else
  echo "Advertencia: No se encontro alembic.ini, saltando migraciones"
fi

# Iniciar la aplicacion
exec uvicorn app.main:app --host 0.0.0.0 --port 8000
