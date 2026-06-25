import xml.etree.ElementTree as ET
import os

def check_face_structure():
    facial_dir = r"d:\StoryMee\SVG\facial"
    for i in range(1, 7):
        path = os.path.join(facial_dir, f"face_{i}.svg")
        if not os.path.exists(path):
            print(f"File not found: {path}")
            continue
        tree = ET.parse(path)
        root = tree.getroot()
        # Find the main group (Layer_2)
        layer2 = None
        for elem in root.iter():
            if elem.attrib.get('id') == 'Layer_2':
                layer2 = elem
                break
        
        if layer2 is not None:
            children = list(layer2)
            print(f"Face {i}: Layer_2 children count={len(children)}")
            for idx, child in enumerate(children):
                tag = child.tag.split('}')[-1]
                fill = child.attrib.get('fill', '')
                d = child.attrib.get('d', '')
                print(f"  Child {idx}: tag={tag}, fill={fill}, d_len={len(d)}")
        else:
            print(f"Face {i}: Layer_2 not found!")

if __name__ == '__main__':
    check_face_structure()
