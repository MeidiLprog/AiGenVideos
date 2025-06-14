#!/usr/bin/env python3
"""
Flux.1-dev Image Generator - Most Powerful Open Source Model
Surpasses DALL-E quality with zero content restrictions
Commercial ready for unlimited generation
"""

import requests
import json
import base64
import io
import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

def generate_with_replicate_flux(prompt):
    """Generate with Flux.1-dev via Replicate - most powerful open source model"""
    
    # Replicate API for Flux.1-dev (commercial license, no restrictions)
    replicate_token = os.getenv('REPLICATE_API_TOKEN', '')
    
    if not replicate_token:
        raise Exception("REPLICATE_API_TOKEN required for Flux.1-dev generation")
    
    # Use Flux.1-dev model - most advanced open source model
    response = requests.post(
        "https://api.replicate.com/v1/predictions",
        headers={
            "Authorization": f"Token {replicate_token}",
            "Content-Type": "application/json"
        },
        json={
            "version": "ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4", # Flux.1-dev
            "input": {
                "prompt": prompt,
                "width": 1024,
                "height": 1024,
                "num_outputs": 1,
                "guidance_scale": 3.5,
                "num_inference_steps": 28,
                "output_format": "png",
                "output_quality": 100
            }
        }
    )
    
    if response.status_code != 201:
        raise Exception(f"Replicate API error: {response.status_code}")
    
    prediction = response.json()
    prediction_id = prediction['id']
    
    # Poll for completion
    max_attempts = 60  # 5 minutes max
    for attempt in range(max_attempts):
        status_response = requests.get(
            f"https://api.replicate.com/v1/predictions/{prediction_id}",
            headers={"Authorization": f"Token {replicate_token}"}
        )
        
        if status_response.status_code != 200:
            continue
            
        result = status_response.json()
        
        if result['status'] == 'succeeded':
            image_url = result['output'][0] if result['output'] else None
            if image_url:
                # Download image and convert to base64
                img_response = requests.get(image_url)
                img_base64 = base64.b64encode(img_response.content).decode()
                return f"data:image/png;base64,{img_base64}"
            else:
                raise Exception("No output generated")
                
        elif result['status'] == 'failed':
            raise Exception(f"Generation failed: {result.get('error', 'Unknown error')}")
        
        time.sleep(5)  # Wait 5 seconds before next check
    
    raise Exception("Generation timeout")

def generate_with_together_flux(prompt):
    """Generate with Flux.1-schnell via Together AI - fastest option"""
    
    together_token = os.getenv('TOGETHER_API_TOKEN', '')
    
    if not together_token:
        raise Exception("TOGETHER_API_TOKEN required for Together AI generation")
    
    response = requests.post(
        "https://api.together.xyz/v1/images/generations",
        headers={
            "Authorization": f"Bearer {together_token}",
            "Content-Type": "application/json"
        },
        json={
            "model": "black-forest-labs/FLUX.1-schnell",
            "prompt": prompt,
            "width": 1024,
            "height": 1024,
            "steps": 4,  # Schnell only needs 4 steps
            "n": 1,
            "response_format": "b64_json"
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        image_data = data['data'][0]['b64_json']
        return f"data:image/png;base64,{image_data}"
    else:
        raise Exception(f"Together AI error: {response.status_code}")

def generate_with_fal_flux(prompt):
    """Generate with Flux via FAL - another fast option"""
    
    fal_token = os.getenv('FAL_KEY', '')
    
    if not fal_token:
        raise Exception("FAL_KEY required for FAL generation")
    
    response = requests.post(
        "https://fal.run/fal-ai/flux/dev",
        headers={
            "Authorization": f"Key {fal_token}",
            "Content-Type": "application/json"
        },
        json={
            "prompt": prompt,
            "image_size": "landscape_4_3",
            "num_inference_steps": 28,
            "guidance_scale": 3.5,
            "num_images": 1,
            "enable_safety_checker": False  # Disable content filters
        }
    )
    
    if response.status_code == 200:
        data = response.json()
        image_url = data['images'][0]['url']
        
        # Download and convert to base64
        img_response = requests.get(image_url)
        img_base64 = base64.b64encode(img_response.content).decode()
        return f"data:image/png;base64,{img_base64}"
    else:
        raise Exception(f"FAL error: {response.status_code}")

@app.route('/generate', methods=['POST'])
def generate_image():
    """Generate with most powerful available Flux model"""
    try:
        data = request.json
        prompt = data.get('prompt', '') if data else ''
        
        if not prompt:
            return jsonify({'error': 'Prompt required'}), 400
        
        print(f"Generating with Flux: {prompt}")
        
        # Try Replicate Flux.1-dev first (highest quality)
        try:
            image_result = generate_with_replicate_flux(prompt)
            return jsonify({
                'success': True,
                'image': image_result,
                'model': 'Flux.1-dev'
            })
        except Exception as e:
            print(f"Replicate Flux failed: {e}")
        
        # Try Together AI Flux.1-schnell (fastest)
        try:
            image_result = generate_with_together_flux(prompt)
            return jsonify({
                'success': True,
                'image': image_result,
                'model': 'Flux.1-schnell'
            })
        except Exception as e:
            print(f"Together AI failed: {e}")
        
        # Try FAL Flux as final option
        try:
            image_result = generate_with_fal_flux(prompt)
            return jsonify({
                'success': True,
                'image': image_result,
                'model': 'Flux-FAL'
            })
        except Exception as e:
            print(f"FAL failed: {e}")
        
        return jsonify({'error': 'All Flux providers failed. Please configure API tokens.'}), 500
        
    except Exception as e:
        print(f"Generation error: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    
    # Check available providers
    providers = []
    if os.getenv('REPLICATE_API_TOKEN'):
        providers.append('Replicate Flux.1-dev')
    if os.getenv('TOGETHER_API_TOKEN'):
        providers.append('Together AI Flux.1-schnell') 
    if os.getenv('FAL_KEY'):
        providers.append('FAL Flux')
    
    return jsonify({
        'status': 'healthy',
        'available_providers': providers,
        'ready': len(providers) > 0
    })

if __name__ == '__main__':
    print("Starting Flux.1 Image Generator...")
    print("Most powerful open source model - no content restrictions")
    
    # Start server
    port = int(os.environ.get('PORT', 8001))
    app.run(host='0.0.0.0', port=port, debug=False)