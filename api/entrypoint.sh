#!/bin/bash

# Ajuste o PYTHONPATH para incluir o diretório pai do api
cd /
export PYTHONPATH="/:/api:${PYTHONPATH}"

# Configurações do Gunicorn
export GUNICORN_OPTS="--bind=0.0.0.0:${FLASK_PORT:-5000} \
                      --workers=9 \
                      --worker-class=sync \
                      --reload \
                      --log-level=debug \
                      --forwarded-allow-ips=* \
                      --proxy-allow-from=* \
                      --timeout=120"

# Inicia o Gunicorn
cd /api && exec gunicorn ${GUNICORN_OPTS} "app:application"
