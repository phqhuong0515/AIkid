import os
import re

def find_details(filepath):
    if not os.path.exists(filepath):
        print(f"File {filepath} not found.")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"\n=== Inspecting {os.path.basename(filepath)} ===")
    
    # Check for metadata, titles, or text elements
    text_elements = re.findall(r'<text[^>]*>(.*?)</text>', content)
    print(f"Found {len(text_elements)} text elements.")
    if text_elements:
        print("Sample text elements:")
        for t in text_elements[:15]:
            print(f"  - {t}")
            
    # Check for group labels or IDs
    ids = re.findall(r'id="([^"]+)"', content)
    print(f"Found {len(ids)} ID values.")
    unique_ids = set(ids)
    print(f"Unique IDs count: {len(unique_ids)}")
    
    # Print some interesting IDs (those with letters or descriptive names)
    descriptive_ids = [i for i in unique_ids if not i.startswith('linear-gradient') and not i.startswith('clip-path') and not i.startswith('cls-') and not re.match(r'^uuid-[0-9a-f-]+$', i)]
    print(f"Found {len(descriptive_ids)} descriptive IDs.")
    print("Sample descriptive IDs:")
    for i in descriptive_ids[:20]:
        print(f"  - {i}")

if __name__ == "__main__":
    find_details(r"d:\StoryMee\SVG\SVG\Artboard 1 copy 2.svg")
    find_details(r"d:\StoryMee\SVG\SVG\Artboard 1 copy 3.svg")
