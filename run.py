#!/usr/bin/env python3
"""
B.Sc. Counselling Portal — Auto-run script (cross-platform)
Installs dependencies and starts the Flask application
"""

import subprocess
import sys
import os

def main():
    print("\n" + "="*50)
    print("B.Sc. Counselling Portal — Auto Run")
    print("="*50 + "\n")
    
    # Check Python version
    if sys.version_info < (3, 8):
        print("❌ Python 3.8+ is required.")
        print(f"   Current version: {sys.version}")
        sys.exit(1)
    
    print(f"✓ Python version: {sys.version.split()[0]}\n")
    
    # Install requirements
    print("📦 Installing dependencies from requirements.txt...")
    try:
        subprocess.check_call([sys.executable, "-m", "pip", "install", "-r", "requirements.txt"])
    except subprocess.CalledProcessError as e:
        print(f"\n❌ Failed to install dependencies: {e}")
        sys.exit(1)
    
    print("\n✓ Dependencies installed successfully\n")
    
    # Display startup info
    print("="*50)
    print("🚀 Starting Flask Application...")
    print("="*50)
    print("\nPortal is running at:  http://localhost:5000")
    print("Admin dashboard:       http://localhost:5000/admin")
    print("Admin password:        amu@2026")
    print("Health check:          http://localhost:5000/healthz")
    print("\nPress Ctrl+C to stop the server.\n")
    
    # Run Flask app
    try:
        subprocess.call([sys.executable, "app.py"])
    except KeyboardInterrupt:
        print("\n\n✓ Server stopped.")
        sys.exit(0)

if __name__ == "__main__":
    main()
