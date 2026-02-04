import os
import urllib.request
from pathlib import Path

# Create directories
base_path = r"c:\Users\Swaraj\OneDrive\Desktop\Mern Marketplace Project\frontend\public\images\products"
os.makedirs(base_path, exist_ok=True)

# Product images to download
products = {
    "headphones-001.jpg": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800",
    "cable-001.jpg": "https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800",
    "phone-case-001.jpg": "https://images.unsplash.com/photo-1556656793-08538906a9f8?w=800",
    "handbag-001.jpg": "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800",
    "shoes-001.jpg": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800",
    # Toys
    "lego-set-001.jpg": "https://images.unsplash.com/photo-1461151304318-e6dafb5b0c78?w=800",
    "toy-robot-001.jpg": "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800",
    # Home
    "desk-lamp-001.jpg": "https://images.unsplash.com/photo-1565636192335-14f9652f8e0c?w=800",
    "pillow-001.jpg": "https://images.unsplash.com/photo-1595429676963-aa181de4cd6f?w=800",
    # Other/Books
    "book-001.jpg": "https://images.unsplash.com/photo-1507842072343-583f20270319?w=800",
    "watch-001.jpg": "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800",
}

print("Downloading images...")
for filename, url in products.items():
    filepath = os.path.join(base_path, filename)
    try:
        urllib.request.urlretrieve(url, filepath)
        print(f"✅ Downloaded: {filename}")
    except Exception as e:
        print(f"❌ Error downloading {filename}: {e}")

print("\n✅ All images downloaded successfully!")
print(f"Location: {base_path}")
