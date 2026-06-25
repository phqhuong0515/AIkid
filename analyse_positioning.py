import xml.etree.ElementTree as ET
import re
import math
import sys

sys.path.append(r"C:\Users\ADMIN\.gemini\antigravity-ide\brain\481f2c06-b2fb-43cc-8965-f4fbc7d9da06\scratch")
from parse_facial_features import parse_transforms, apply_transforms, get_element_points

def main():
    filepath = r"d:\StoryMee\SVG\facial\positioning.svg"
    tree = ET.parse(filepath)
    root = tree.getroot()
    
    # We want to collect elements by category
    # Eyebrows: paths with d starting with M58 or M106
    # Eyes: rects with width=14.45
    # Nose: rect/path representing the nose. In positioning.svg it's the rect with class="cls-7"
    # Mouth: path starting with M78.16 or similar
    # Head: ellipse class="cls-6"
    
    head_pts = []
    eyebrow_pts = []
    eye_pts = []
    nose_pts = []
    mouth_pts = []
    
    def recurse(node, parent_ops=[]):
        tag_local = node.tag.split('}')[-1]
        transform = node.attrib.get('transform', '')
        local_ops = parent_ops
        if transform:
            local_ops = parent_ops + parse_transforms(transform)
            
        if tag_local in ['rect', 'circle', 'ellipse', 'path', 'polyline', 'polygon']:
            pts = get_element_points(node, local_ops)
            if pts:
                cl = node.attrib.get('class', '')
                id_ = node.attrib.get('id', '')
                d = node.attrib.get('d', '')
                w = node.attrib.get('width', '')
                
                if tag_local == 'ellipse' and cl == 'cls-6':
                    head_pts.extend(pts)
                elif tag_local == 'path' and d.startswith('M58') or d.startswith('M106') or d.startswith('M55') or d.startswith('M101'):
                    # Eyebrow paths
                    eyebrow_pts.extend(pts)
                elif tag_local == 'rect' and w == '14.45':
                    # Eye rects
                    eye_pts.extend(pts)
                elif tag_local == 'rect' and cl == 'cls-7':
                    # Nose rect
                    nose_pts.extend(pts)
                elif tag_local == 'path' and d.startswith('M78.16') or d.startswith('M78'):
                    # Mouth path
                    mouth_pts.extend(pts)
                    
        for child in node:
            recurse(child, local_ops)
            
    recurse(root)
    
    def get_info(name, pts):
        if not pts:
            return f"{name}: None"
        xs = [p[0] for p in pts]
        ys = [p[1] for p in pts]
        min_x, max_x = min(xs), max(xs)
        min_y, max_y = min(ys), max(ys)
        cx = (min_x + max_x) / 2.0
        cy = (min_y + max_y) / 2.0
        return {
            'name': name,
            'min_x': min_x,
            'max_x': max_x,
            'min_y': min_y,
            'max_y': max_y,
            'cx': cx,
            'cy': cy
        }
        
    head = get_info('Head', head_pts)
    eyebrows = get_info('Eyebrows', eyebrow_pts)
    eyes = get_info('Eyes', eye_pts)
    nose = get_info('Nose', nose_pts)
    mouth = get_info('Mouth', mouth_pts)
    
    print("RESULTS:")
    print("Head:", head)
    print("Eyebrows:", eyebrows)
    print("Eyes:", eyes)
    print("Nose:", nose)
    print("Mouth:", mouth)
    
    if head and eyebrows:
        print(f"Eyebrow Y offset from Head Center: {eyebrows['cy'] - head['cy']:.4f}")
    if head and eyes:
        print(f"Eyes Y offset from Head Center: {eyes['cy'] - head['cy']:.4f}")
    if head and nose:
        print(f"Nose Y offset from Head Center: {nose['cy'] - head['cy']:.4f}")
    if head and mouth:
        print(f"Mouth Y offset from Head Center: {mouth['cy'] - head['cy']:.4f}")

if __name__ == '__main__':
    main()
