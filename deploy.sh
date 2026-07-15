#!/bin/bash
set -e
cd /root/node-apps/NagibProd

echo '── Atualizando código...'
git pull origin main

echo '── Instalando dependências...'
pnpm install

echo '── Build frontend...'
cd artifacts/nagibe
PORT=8087 BASE_PATH=/ pnpm run build
cd /root/node-apps/NagibProd

echo '── Build backend...'
cd artifacts/api-server
pnpm run build
cd /root/node-apps/NagibProd

echo '── Reiniciando serviço...'
pm2 restart nagibprod

echo '✓ Deploy concluído!'
