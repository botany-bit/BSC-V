#!/bin/bash
# B.Sc. Counselling Portal — Auto-run script

echo "=========================================="
echo "B.Sc. Counselling Portal — Auto Run"
echo "=========================================="
echo ""

# Check if Python 3 is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3.8+ and try again."
    exit 1
fi

echo "✓ Python 3 found: $(python3 --version)"
echo ""

# Check if pip is installed
if ! command -v pip &> /dev/null; then
    echo "❌ pip is not installed. Please install pip and try again."
    exit 1
fi

echo "✓ pip found"
echo ""

# Install requirements
echo "📦 Installing dependencies from requirements.txt..."
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies."
    exit 1
fi

echo "✓ Dependencies installed successfully"
echo ""

# Run the Flask app
echo "🚀 Starting Flask application..."
echo ""
echo "=========================================="
echo "Portal is running at: http://localhost:5000"
echo "Admin dashboard: http://localhost:5000/admin"
echo "Admin password: amu@2026"
echo "Health check: http://localhost:5000/healthz"
echo "=========================================="
echo ""
echo "Press Ctrl+C to stop the server."
echo ""

python3 app.py
