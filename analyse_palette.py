import os
from PIL import Image

def main():
    img_path = r"d:\StoryMee\SVG\Color palette (down skin, up shadow).png"
    if not os.path.exists(img_path):
        print("Palette file not found!")
        return
    
    with Image.open(img_path) as img:
        width, height = img.size
        print(f"Palette size: {width}x{height}")
        
        # Sample colors along the X-axis (say 10 sample points)
        # Let's also see what distinct colors we get at the top (shading) and bottom (skin tone)
        # Let's say top is y = height // 4 (shading) and bottom is y = 3 * height // 4 (skin tone)
        y_top = height // 4
        y_bottom = 3 * height // 4
        
        samples = []
        for i in range(10):
            # calculate x coordinate at the center of 10 equal columns
            x = int((i + 0.5) * (width / 10.0))
            
            p_top = img.getpixel((x, y_top))[:3]
            p_bottom = img.getpixel((x, y_bottom))[:3]
            
            hex_top = f"#{p_top[0]:02x}{p_top[1]:02x}{p_top[2]:02x}"
            hex_bottom = f"#{p_bottom[0]:02x}{p_bottom[1]:02x}{p_bottom[2]:02x}"
            
            samples.append((x, hex_top, hex_bottom))
            
        print("10 sampled columns:")
        for idx, (x, top, bottom) in enumerate(samples):
            print(f"Col {idx+1} (x={x}): Shading={top}, Skin={bottom}")

if __name__ == "__main__":
    main()
