# Inicia el backend en una ventana nueva
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'F:\16_proyectos\traccar\code\traccar-master'; java -jar target\tracker-server.jar setup\traccar.xml"

# Espera unos segundos a que el backend levante antes de arrancar el frontend
Start-Sleep -Seconds 5

# Inicia el frontend en otra ventana nueva
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'F:\16_proyectos\traccar\code\traccar-master\traccar-web'; npm start"

Write-Host "Backend y frontend iniciados en ventanas separadas."
Write-Host "Backend: http://localhost:8082"
Write-Host "Frontend: http://localhost:3000"
