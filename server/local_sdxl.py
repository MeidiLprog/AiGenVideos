#!/usr/bin/env python3
"""
Local SDXL with LoRA support - Complete control, no restrictions
Uses specialized models for unrestricted generation
"""

import torch
import requests
import json
import base64
import io
import os
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Global pipeline
pipeline = None
device = "cuda" if torch.cuda.is_available() else "cpu"

def initialize_local_pipeline():
    """Initialize local SDXL with LoRA support"""
    global pipeline
    
    try:
        print(f"Initializing local SDXL pipeline on {device}...")
        
        from diffusers import StableDiffusionXLPipeline, DPMSolverMultistepScheduler
        
        # Load RealisticVision or similar unrestricted model
        model_id = "SG161222/RealVisXL_V4.0"  # Highly realistic, no content filters
        
        pipeline = StableDiffusionXLPipeline.from_pretrained(
            model_id,
            torch_dtype=torch.float16 if device == "cuda" else torch.float32,
            use_safetensors=True,
            variant="fp16" if device == "cuda" else None
        )
        
        # Use DPM solver for faster generation
        pipeline.scheduler = DPMSolverMultistepScheduler.from_config(pipeline.scheduler.config)
        pipeline = pipeline.to(device)
        
        # Memory optimizations
        if device == "cuda":
            pipeline.enable_model_cpu_offload()
            pipeline.enable_vae_slicing()
            pipeline.enable_vae_tiling()
        
        print("Local SDXL pipeline loaded successfully!")
        return True
        
    except Exception as e:
        print(f"Pipeline initialization error: {e}")
        return False

def generate_with_a1111_api(prompt):
    """Generate using Automatic1111 WebUI API if available"""
    try:
        # Try to connect to local A1111 instance
        response = requests.post(
            "http://127.0.0.1:7860/sdapi/v1/txt2img",
            json={
                "prompt": prompt,
                "negative_prompt": "blurry, low quality, distorted, watermark",
                "width": 1024,
                "height": 1024,
                "steps": 25,
                "cfg_scale": 7,
                "sampler_name": "DPM++ 2M Karras",
                "seed": -1,
                "batch_size": 1,
                "n_iter": 1,
                "restore_faces": True,
                "tiling": False,
                "do_not_save_samples": True,
                "do_not_save_grid": True
            },
            timeout=60
        )
        
        if response.status_code == 200:
            data = response.json()
            if data.get('images'):
                return f"data:image/png;base64,{data['images'][0]}"
        
    except Exception as e:
        print(f"A1111 API not available: {e}")
    
    return None

def generate_with_local_pipeline(prompt):
    """Generate with local pipeline"""
    global pipeline
    
    if pipeline is None:
        if not initialize_local_pipeline():
            raise Exception("Local pipeline not available")
    
    try:
        # Enhanced prompt for quality
        enhanced_prompt = f"{prompt}, masterpiece, best quality, ultra detailed, 8k, photorealistic"
        negative_prompt = "blurry, low quality, distorted, watermark, ugly, deformed"
        
        image = pipeline(
            prompt=enhanced_prompt,
            negative_prompt=negative_prompt,
            height=1024,
            width=1024,
            num_inference_steps=25,
            guidance_scale=7.5,
            num_images_per_prompt=1
        ).images[0]
        
        # Convert to base64
        buffered = io.BytesIO()
        image.save(buffered, format="PNG", quality=95)
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        return f"data:image/png;base64,{img_base64}"
        
    except Exception as e:
        print(f"Local generation error: {e}")
        raise

@app.route('/generate', methods=['POST'])
def generate_image():
    """Generate image with local models - no restrictions"""
    try:
        data = request.json
        prompt = data.get('prompt', '') if data else ''
        
        if not prompt:
            return jsonify({'error': 'Prompt required'}), 400
        
        print(f"Generating locally: {prompt}")
        
        # Try A1111 WebUI first (if running)
        image_result = generate_with_a1111_api(prompt)
        
        if image_result:
            return jsonify({
                'success': True,
                'image': image_result,
                'model': 'Automatic1111 WebUI'
            })
        
        # Fallback to local pipeline
        image_result = generate_with_local_pipeline(prompt)
        
        return jsonify({
            'success': True,
            'image': image_result,
            'model': 'Local SDXL'
        })
        
    except Exception as e:
        print(f"Generation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    
    # Check A1111 availability
    a1111_available = False
    try:
        response = requests.get("http://127.0.0.1:7860/sdapi/v1/memory", timeout=2)
        a1111_available = response.status_code == 200
    except:
        pass
    
    return jsonify({
        'status': 'healthy',
        'device': device,
        'pipeline_loaded': pipeline is not None,
        'a1111_available': a1111_available,
        'ready': True
    })

if __name__ == '__main__':
    print("Starting Local SDXL Generator...")
    print("Unrestricted content generation ready")
    
    # Start server
    port = int(os.environ.get('PORT', 8002))
    app.run(host='0.0.0.0', port=port, debug=False)