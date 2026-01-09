@echo off
cd backend
start cmd /k "node src/index.js"
cd ..
cd frontend
start cmd /k "npm start"
timeout /t 5
start http://localhost:3000
