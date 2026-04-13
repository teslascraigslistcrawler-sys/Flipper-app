#!/bin/bash

cd ~/flipper/frontend-web
npm run build
sudo systemctl reload nginx
