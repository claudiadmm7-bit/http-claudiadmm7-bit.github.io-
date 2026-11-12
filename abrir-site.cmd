@echo off
rem Liga o site da Clau em http://localhost:8000 e abre no navegador.
rem Deixe esta janela aberta enquanto estiver vendo o site. Para desligar, feche-a.
title Site da Clau - deixe esta janela aberta
cd /d "%~dp0"
set "PY=python"
if exist "%LOCALAPPDATA%\Programs\Python\Python313\python.exe" set "PY=%LOCALAPPDATA%\Programs\Python\Python313\python.exe"
if not "%1"=="semnavegador" start "" cmd /c "timeout /t 2 >nul & start http://localhost:8000"
"%PY%" -m http.server 8000 --bind 127.0.0.1 --directory docs
