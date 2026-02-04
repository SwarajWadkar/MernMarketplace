from PIL import Image, ImageDraw, ImageFont
import os

base_path = r"c:\Users\Swaraj\OneDrive\Desktop\Mern Marketplace Project\frontend\public\images\products"

# Create placeholder images for missing ones
placeholders = {
    "lego-set-001.jpg": ("LEGO Set", "#FF6B00"),
    "desk-lamp-001.jpg": ("Desk Lamp", "#FFC700"),
    "pillow-001.jpg": ("Pillow", "#E8B4F8"),
    "book-001.jpg": ("Book", "#8B7355"),
}

for filename, (text, color) in placeholders.items():
    filepath = os.path.join(base_path, filename)
    
    # Create a colorful image
    img = Image.new('RGB', (800, 800), color=color)
    draw = ImageDraw.Draw(img)
    
    # Add text in center
    try:
        font = ImageFont.truetype("arial.ttf", 100)
    except:
        font = ImageFont.load_default()
    
    # Draw text centered
    bbox = draw.textbbox((0, 0), text, font=font)
    text_width = bbox[2] - bbox[0]
    text_height = bbox[3] - bbox[1]
    x = (800 - text_width) // 2
    y = (800 - text_height) // 2
    
    draw.text((x, y), text, fill="white", font=font)
    
    # Save
    img.save(filepath)
    print(f"✅ Created placeholder: {filename}")

print("✅ All placeholder images created!")
