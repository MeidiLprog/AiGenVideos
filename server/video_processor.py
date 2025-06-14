#!/usr/bin/env python3
"""
Professional video processing with FFmpeg via Python
Handles complex video editing, transitions, and effects
"""

import subprocess
import json
import os
import sys
from pathlib import Path
import tempfile

def create_professional_video(config_file_path):
    """
    Creates a professional video with advanced FFmpeg features
    Config should contain: segments, images, audio, output_path, dimensions
    """
    try:
        # Load configuration
        with open(config_file_path, 'r') as f:
            config = json.load(f)
        
        segments = config['segments']
        images = config['images']
        audio_file = config.get('audio_file')
        output_path = config['output_path']
        width = config.get('width', 1080)
        height = config.get('height', 1920)
        segment_duration = config.get('segment_duration', 6)
        
        temp_dir = Path(config['temp_dir'])
        temp_dir.mkdir(exist_ok=True)
        
        print(f"Processing {len(segments)} segments for professional video...")
        
        # Create individual clips with professional effects
        clip_files = []
        for i, (segment, image_file) in enumerate(zip(segments, images)):
            clip_file = temp_dir / f"professional_clip_{i}.mp4"
            
            # Extract quote text and number
            display_text = segment.replace('"', '').replace("'", "'")
            number_text = str(i + 1)
            
            # Clean text for quotes - extract quote part if format is "Quote one: text"
            if ':' in display_text:
                parts = display_text.split(':', 1)
                if len(parts) > 1:
                    display_text = parts[1].strip()
            
            # Limit text length for readability
            if len(display_text) > 120:
                display_text = display_text[:120] + '...'
            
            # Professional FFmpeg command with advanced effects
            ffmpeg_cmd = [
                'ffmpeg', '-y',
                '-loop', '1', '-i', str(image_file),
                '-t', str(segment_duration),
                '-vf', (
                    f"scale={width*1.1}:{height*1.1}:force_original_aspect_ratio=increase,"
                    f"crop={width}:{height}:(iw-ow)/2:(ih-oh)/2,"
                    f"drawtext=text='{number_text}':fontsize=140:fontcolor=white:borderw=8:bordercolor=black@0.9:"
                    f"x=(w-text_w)/2:y=h*0.12:enable='gte(t,0.3)':alpha='min(1\\,max(0\\,(t-0.3)*4))':"
                    f"fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf,"
                    f"drawtext=text='{display_text}':fontsize=68:fontcolor=white:borderw=5:bordercolor=black@0.85:"
                    f"x=(w-text_w)/2:y=(h-text_h)/2+20:enable='gte(t,0.8)':alpha='min(1\\,max(0\\,(t-0.8)*3))':"
                    f"fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf,"
                    f"drawtext=text='{display_text}':fontsize=68:fontcolor=black@0.4:"
                    f"x=(w-text_w)/2+4:y=(h-text_h)/2+24:enable='gte(t,0.85)':alpha='min(0.7\\,max(0\\,(t-0.85)*4))':"
                    f"fontfile=/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
                ),
                '-c:v', 'libx264',
                '-preset', 'medium',
                '-crf', '18',  # High quality
                '-pix_fmt', 'yuv420p',
                '-r', '30',
                str(clip_file)
            ]
            
            result = subprocess.run(ffmpeg_cmd, capture_output=True, text=True)
            if result.returncode != 0:
                print(f"Error creating clip {i}: {result.stderr}")
                continue
                
            clip_files.append(str(clip_file))
            print(f"Created professional clip {i+1}/{len(segments)}")
        
        if not clip_files:
            raise Exception("No clips were created successfully")
        
        # Create concat file for smooth merging
        concat_file = temp_dir / "concat_list.txt"
        with open(concat_file, 'w') as f:
            for clip_file in clip_files:
                f.write(f"file '{clip_file}'\n")
        
        # Final assembly with professional encoding
        final_cmd = [
            'ffmpeg', '-y',
            '-f', 'concat',
            '-safe', '0',
            '-i', str(concat_file)
        ]
        
        # Add audio if provided
        if audio_file and os.path.exists(audio_file):
            final_cmd.extend(['-i', audio_file])
            final_cmd.extend(['-c:a', 'aac', '-b:a', '128k', '-shortest'])
        
        # Professional video encoding settings
        final_cmd.extend([
            '-c:v', 'libx264',
            '-preset', 'medium',
            '-crf', '18',  # High quality
            '-pix_fmt', 'yuv420p',
            '-movflags', '+faststart',  # Optimize for web streaming
            '-r', '30',
            str(output_path)
        ])
        
        print("Assembling final professional video...")
        result = subprocess.run(final_cmd, capture_output=True, text=True)
        
        if result.returncode != 0:
            raise Exception(f"Final assembly failed: {result.stderr}")
        
        # Cleanup temporary files
        for clip_file in clip_files:
            try:
                os.remove(clip_file)
            except:
                pass
        
        try:
            os.remove(concat_file)
        except:
            pass
        
        print(f"Professional video created successfully: {output_path}")
        return True
        
    except Exception as e:
        print(f"Error in professional video creation: {str(e)}")
        return False

def create_smooth_transitions(input_files, output_path, transition_duration=0.5):
    """
    Creates smooth transitions between video segments
    """
    if len(input_files) < 2:
        return input_files[0] if input_files else None
    
    # Complex filter for smooth crossfade transitions
    filter_complex = []
    inputs = []
    
    for i, file_path in enumerate(input_files):
        inputs.extend(['-i', file_path])
    
    # Build crossfade chain
    last_output = '0:v'
    for i in range(1, len(input_files)):
        fade_output = f'fade{i}'
        filter_complex.append(
            f'{last_output}[{i}:v]xfade=transition=fade:duration={transition_duration}:offset={i*6-transition_duration}[{fade_output}]'
        )
        last_output = f'[{fade_output}]'
    
    cmd = ['ffmpeg', '-y'] + inputs + [
        '-filter_complex', ';'.join(filter_complex),
        '-map', last_output,
        '-c:v', 'libx264',
        '-preset', 'medium',
        '-crf', '18',
        '-pix_fmt', 'yuv420p',
        str(output_path)
    ]
    
    result = subprocess.run(cmd, capture_output=True, text=True)
    return result.returncode == 0

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python video_processor.py <config_file>")
        sys.exit(1)
    
    config_file = sys.argv[1]
    success = create_professional_video(config_file)
    sys.exit(0 if success else 1)