@echo off
REM B.Sc. Counselling Portal — Auto-run script for Windows

echo.
echo ==========================================
echo B.Sc. Counselling Portal - Auto Run
echo ==========================================
echo.

REM Check if Python 3 is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo Error: Python 3 is not installed or not in PATH.
    echo Please install Python 3.8+ from https://www.python.org/
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('python --version') do set PYTHON_VERSION=%%i
echo. Python found: %PYTHON_VERSION%
echo.

REM Install requirements
echo Installing dependencies from requirements.txt...
pip install -r requirements.txt

if errorlevel 1 (
    echo Error: Failed to install dependencies.
    pause
    exit /b 1
)

echo.
echo Dependencies installed successfully
echo.

REM Run the Flask app
echo Starting Flask application...
echo.
echo ==========================================
echo Portal is running at: http://localhost:5000
echo Admin dashboard: http://localhost:5000/admin
echo Admin password: amu@2026
echo Health check: http://localhost:5000/healthz
echo ==========================================
echo.
echo Press Ctrl+C to stop the server.
echo.

python app.py
pause
