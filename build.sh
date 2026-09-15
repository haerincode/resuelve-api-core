#!/bin/bash
set -e

echo "Building React frontend..."
cd web
npm install
npm run build
cd ..

echo "Building Go backend..."
go build -o bin/new-api .

echo "Build complete!"
