import xml.etree.ElementTree as ET

def print_all_elements(filepath):
    tree = ET.parse(filepath)
    root = tree.getroot()
    print("Root tag:", root.tag)
    
    for elem in root.iter():
        tag = elem.tag.split('}')[-1]
        print("Found tag:", tag, elem.attrib)

print_all_elements(r"d:\StoryMee\SVG\facial\positioning.svg")
