#!/usr/bin/env python3
import subprocess
import sys
import os

def start_comfyui_server():
    """Start ComfyUI image generation server"""
    try:
        # Change to server directory
        os.chdir('server')
        
        # Start the server
        print("Starting image generation server...")
        subprocess.run([sys.executable, 'comfyui_api.py'], check=True)
        
    except Exception as e:
        print(f"Error starting server: {e}")
        sys.exit(1)

if __name__ == "__main__":
    start_comfyui_server()