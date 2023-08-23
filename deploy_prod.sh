#!/bin/bash

npx prisma migrate deploy
npx prisma generate


npx pm2 startOrRestart ecosystem.prod.config.js --env production --update-env
