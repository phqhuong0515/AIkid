import os
import json
import re

def clean_element(element_str):
    # Remove xmlns attributes from child tags so that the XML remains clean and valid
    cleaned = re.sub(r'\s+xmlns="http://www\.w3\.org/2000/svg"', '', element_str)
    # Ensure there's proper indentation and line breaks
    return "      " + cleaned.strip()

def main():
    base_dir = r"d:\StoryMee\SVG"
    facial_dir = os.path.join(base_dir, "facial")
    json_path = os.path.join(base_dir, "facial_features.json")
    
    if not os.path.exists(json_path):
        print(f"Error: {json_path} not found.")
        return

    with open(json_path, 'r', encoding='utf-8') as f:
        data = json.load(f)

    # 1. Process eyebrows (7 pairs)
    print("Processing eyebrows...")
    for item in data.get("eyebrows", []):
        eb_id = item["id"]
        left_elements = [clean_element(e) for e in item["left"]]
        right_elements = [clean_element(e) for e in item["right"]]
        
        all_elements_str = "\n".join(left_elements + right_elements)
        
        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.02 116.33">
  <g id="Layer_2" data-name="Layer 2">
    <g id="Layer_1-2" data-name="Layer 1">
{all_elements_str}
    </g>
  </g>
</svg>
'''
        out_path = os.path.join(facial_dir, f"eyebrow_{eb_id}.svg")
        with open(out_path, 'w', encoding='utf-8') as out_f:
            out_f.write(svg_content)
        print(f"  Saved {out_path}")

    # 2. Process eyes (11 pairs)
    print("Processing eyes...")
    for item in data.get("eyes", []):
        eye_id = item["id"]
        left_elements = [clean_element(e) for e in item["left"]]
        if eye_id == 11 and len(left_elements) == 3:
            # Reorder left eye elements: [white path, black pupil, polyline outline]
            left_elements = [left_elements[2], left_elements[1], left_elements[0]]
        right_elements = [clean_element(e) for e in item["right"]]
        
        all_elements_str = "\n".join(left_elements + right_elements)
        
        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 76.04 259.05">
  <defs>
    <style>
      .cls-1{{fill:#fff;}}
      .cls-2{{fill:none;stroke:#000;stroke-miterlimit:10;stroke-width:1.17px;}}
    </style>
  </defs>
  <g id="Layer_2" data-name="Layer 2">
    <g id="Layer_1-2" data-name="Layer 1">
{all_elements_str}
    </g>
  </g>
</svg>
'''
        out_path = os.path.join(facial_dir, f"eyes_{eye_id}.svg")
        with open(out_path, 'w', encoding='utf-8') as out_f:
            out_f.write(svg_content)
        print(f"  Saved {out_path}")

    print("Done!")

if __name__ == "__main__":
    main()
