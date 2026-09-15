#!/bin/bash
set -e

# Heroku pre-compile hook - builds frontend before Go embeds it
if [ -d "web" ]; then
  echo "Building React frontend..."
  cd web
  npm install
  npm run build
  cd ..
fi
