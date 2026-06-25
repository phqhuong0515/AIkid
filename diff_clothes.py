import os
import re

def main():
    f_clothes = r"d:\StoryMee\SVG\Skin tone (clothes)\male.svg"
    f_noclothes = r"d:\StoryMee\SVG\Skin tone (no clothes)\male.svg"
    
    with open(f_clothes, 'r', encoding='utf-8') as f:
        c_content = f.read()
    with open(f_noclothes, 'r', encoding='utf-8') as f:
        nc_content = f.read()
        
    print(f"Clothes Male SVG length: {len(c_content)}")
    print(f"No-clothes Male SVG length: {len(nc_content)}")
    
    style_c = re.search(r'<style>(.*?)</style>', c_content, re.DOTALL)
    style_nc = re.search(r'<style>(.*?)</style>', nc_content, re.DOTALL)
    
    print("\nStyle found in clothes:", style_c is not None)
    print("Style found in no-clothes:", style_nc is not None)
    
    paths_c = re.findall(r'<path\s+([^>]+)>', c_content)
    paths_nc = re.findall(r'<path\s+([^>]+)>', nc_content)
    print(f"\nPaths in clothes: {len(paths_c)}")
    print(f"Paths in no-clothes: {len(paths_nc)}")
    
    # Print first 600 characters of no-clothes SVG
    print("\nFirst 600 characters of no-clothes SVG:")
    print(nc_content[:600])

if __name__ == "__main__":
    main()
