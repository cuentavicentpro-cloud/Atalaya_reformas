@echo off
title Atalaya Reformas Murcia - Servidor Local
echo ========================================================
echo   Iniciando Servidor Web Local para Atalaya Reformas...
echo ========================================================
echo.
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1"
pause
