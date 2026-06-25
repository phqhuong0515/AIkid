import os
import re
import json

def extract_svg_styles(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the <style> tag content
    style_match = re.search(r'<style>(.*?)</style>', content, re.DOTALL)
    styles = style_match.group(1) if style_match else ""
    
    # Find linearGradient tags
    gradients = []
    gradient_matches = re.finditer(r'<linearGradient id="([^"]+)"[^>]*>(.*?)</linearGradient>', content, re.DOTALL)
    for m in gradient_matches:
        g_id = m.group(1)
        g_content = m.group(2)
        stops = []
        stop_matches = re.finditer(r'<stop offset="([^"]+)" stop-color="([^"]+)"(?: stop-opacity="([^"]+)")?/>', g_content)
        for sm in stop_matches:
            stops.append({
                "offset": sm.group(1),
                "stop-color": sm.group(2),
                "stop-opacity": sm.group(3) if sm.group(3) else "1"
            })
        gradients.append({
            "id": g_id,
            "stops": stops
        })
        
    return {
        "styles": styles.strip(),
        "gradients": gradients
    }

def main():
    base_dir = r"d:\StoryMee\SVG\Skin tone (clothes)"
    data = {"female": {}, "male": {}}
    
    for gender in ["female", "male"]:
        for i in range(1, 11):
            filename = f"{gender}_skin_{i}.svg"
            filepath = os.path.join(base_dir, filename)
            if os.path.exists(filepath):
                data[gender][i] = extract_svg_styles(filepath)
            else:
                print(f"File not found: {filepath}")
                
    # Save output to a JSON file
    with open("colors_extracted.json", "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2)
    print("Colors extracted successfully to colors_extracted.json")

if __name__ == "__main__":
    main()
