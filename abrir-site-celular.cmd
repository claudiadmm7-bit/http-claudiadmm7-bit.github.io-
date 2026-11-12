@echo off
rem Liga o site da Clau para ser aberto no CELULAR pela mesma rede Wi-Fi.
rem Deixe esta janela aberta enquanto estiver vendo o site. Para desligar, feche-a.
title Site da Clau no celular - deixe esta janela aberta
cd /d "%~dp0"
set "PY=python"
if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" set "PY=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
echo.
echo  ============================================================
echo   No celular (conectado no mesmo Wi-Fi), abra o navegador e digite:
echo.
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch 'VPN|Loopback|vEthernet' -and $_.IPAddress -notmatch '^(127|169\.254)' } | Select-Object -First 1).IPAddress"`) do echo      http://%%i:8001
echo.
echo   Se o Windows perguntar sobre o firewall, marque as redes
echo   e clique em "Permitir acesso".
echo   Se nao abrir no celular, desligue o ProtonVPN e tente de novo.
echo  ============================================================
echo.
"%PY%" -m http.server 8001 --bind 0.0.0.0 --directory docs
