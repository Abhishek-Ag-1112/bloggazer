import os
import sys

try:
    from PIL import Image
except ImportError:
    print("Python Pillow library is not installed. Please run: pip install Pillow")
    sys.exit(1)

# List of assets to compress
images_to_compress = [
    'Bloggs.png',
    'avater.png',
    'avater1.PNG',
    'gok.PNG',
    'image.png',
    'logo.png',
    'logo2.png'
]

src_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
dest_dir = os.path.join(src_dir, 'public')

if not os.path.exists(dest_dir):
    os.makedirs(dest_dir, exist_ok=True)

print("Starting image optimization & WebP conversion...")

for filename in images_to_compress:
    src_path = os.path.join(src_dir, filename)
    if os.path.exists(src_path):
        name_without_ext = os.path.splitext(filename)[0]
        dest_path = os.path.join(dest_dir, f"{name_without_ext}.webp")
        
        try:
            with Image.open(src_path) as img:
                # Convert to RGB if image is in RGBA mode and saving as JPEG or if converting to WebP
                if img.mode in ('RGBA', 'LA') and filename.lower().endswith(('.jpg', '.jpeg')):
                    img = img.convert('RGB')
                
                # Save as WebP with compression
                img.save(dest_path, 'WEBP', quality=80)
                
                # Check file sizes
                orig_size = os.path.getsize(src_path) / (1024 * 1024)
                new_size = os.path.getsize(dest_path) / (1024 * 1024)
                reduction = (1 - (new_size / orig_size)) * 100
                
                print(f"Optimized {filename} -> {name_without_ext}.webp")
                print(f"  Size: {orig_size:.2f} MB -> {new_size:.2f} MB ({reduction:.1f}% reduction)")
        except Exception as e:
            print(f"Failed to optimize {filename}: {e}")
    else:
        print(f"Asset not found: {filename}")

print("Image optimization completed.")
