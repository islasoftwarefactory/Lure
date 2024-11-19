docker run \
    -it --rm \
    -p 5173:5173 \
    -v $(pwd):/app \
    -w /app \
    node:lts \
    sh -c "npm install && npm run dev -- --host 0.0.0.0"