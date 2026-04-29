@echo off
echo Demarrage du serveur de developpement Angular...
echo.

REM Verification de Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Node.js n'est pas installe ou n'est pas dans le PATH
    echo Veuillez installer Node.js depuis https://nodejs.org/
    pause
    exit /b 1
)

REM Verification de npm
npm --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: npm n'est pas disponible
    pause
    exit /b 1
)

echo Node.js et npm sont disponibles
echo.

REM Installation des dependances si necessaire
if not exist "node_modules" (
    echo Installation des dependances...
    npm install
    if errorlevel 1 (
        echo ERREUR: Echec de l'installation des dependances
        pause
        exit /b 1
    )
)

echo Demarrage du serveur Angular sur http://localhost:4200
echo Appuyez sur Ctrl+C pour arreter le serveur
echo.

REM Demarrage du serveur de developpement
npm start

pause
