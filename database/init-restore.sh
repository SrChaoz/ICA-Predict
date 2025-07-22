#!/bin/bash
set -e

echo "Restaurando la base de datos desde el archivo de respaldo..."
pg_restore --username=postgres --dbname=$POSTGRES_DB --no-owner /docker-entrypoint-initdb.d/CanalMesiasDB_26_03_2025.backup
echo "Restauración completada."