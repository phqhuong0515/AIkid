import os
import re

def inspect_svg_regex(filepath):
    if not os.path.exists(filepath):
        print(f"File {filepath} not found.")
        return
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"\n--- Regex Inspecting {os.path.basename(filepath)} ---")
    print(f"File size: {len(content)} chars")
    
    # Let's find <g id="..." or data-name="..." or class="..."
    g_matches = re.findall(r'<g\s+([^>]+)>', content)
    print(f"Found {len(g_matches)} <g> tags.")
    
    print("First 30 <g> attributes:")
    for idx, attribs in enumerate(g_matches[:30]):
        print(f"  {idx+1}: {attribs}")
        
    # Let's also check for <image> tags
    image_matches = re.findall(r'<image\s+([^>]+)>', content)
    print(f"Found {len(image_matches)} <image> tags.")
    for idx, attribs in enumerate(image_matches[:10]):
        # truncate xlink:href or href to avoid too long print
        short_attribs = re.sub(r'xlink:href="data:image/[^"]+"', 'xlink:href="data:image/..."', attribs)
        short_attribs = re.sub(r'href="data:image/[^"]+"', 'href="data:image/..."', short_attribs)
        print(f"  Image {idx+1}: {short_attribs}")

def main():
    files = [
        r"d:\StoryMee\SVG\Artboard 1.svg",
        r"d:\StoryMee\SVG\Artboard 1 copy.svg",
        r"d:\StoryMee\SVG\SVG\Artboard 1 copy 2.svg",
        r"d:\StoryMee\SVG\SVG\Artboard 1 copy 3.svg"
    ]
    for f in files:
        inspect_svg_regex(f)

if __name__ == "__main__":
    main()
