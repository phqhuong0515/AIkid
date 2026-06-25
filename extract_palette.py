import os
from PIL import Image

def main():
    img_path = r"d:\StoryMee\SVG\Color palette (down skin, up shadow).png"
    if not os.path.exists(img_path):
        print("Palette file not found!")
        return
    
    with Image.open(img_path) as img:
        print(f"Image Size: {img.size}")
        print(f"Image Mode: {img.mode}")
        
        # Get pixels
        width, height = img.size
        # Print a grid of color hex values
        for y in range(height):
            row_hex = []
            for x in range(width):
                pixel = img.getpixel((x, y))
                if len(pixel) >= 3:
                    r, g, b = pixel[:3]
                    hex_color = f"#{r:02x}{g:02x}{b:02x}"
                    row_hex.append(hex_color)
                else:
                    row_hex.append(str(pixel))
            print(f"Row {y} (y={y}): {', '.join(row_hex)}")

if __name__ == "__main__":
    main()
