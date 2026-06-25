import xml.etree.ElementTree as ET
import os
import re
import math
import json

def parse_transforms(transform_str):
    ops = []
    if not transform_str:
        return ops
    pattern = r'([a-zA-Z]+)\(([^)]+)\)'
    matches = re.findall(pattern, transform_str)
    for op_name, op_args in matches:
        args = [float(x) for x in re.findall(r'[-+]?\d*\.\d+|[-+]?\d+', op_args)]
        ops.append((op_name.lower(), args))
    return ops

def apply_transforms(x, y, ops):
    for op_name, args in reversed(ops):
        if op_name == 'translate':
            tx = args[0]
            ty = args[1] if len(args) > 1 else 0.0
            x += tx
            y += ty
        elif op_name == 'rotate':
            angle = args[0]
            cx = args[1] if len(args) > 1 else 0.0
            cy = args[2] if len(args) > 2 else 0.0
            rad = math.radians(angle)
            cos_a = math.cos(rad)
            sin_a = math.sin(rad)
            px = x - cx
            py = y - cy
            rx = px * cos_a - py * sin_a
            ry = px * sin_a + py * cos_a
            x = rx + cx
            y = ry + cy
        elif op_name == 'matrix':
            if len(args) == 6:
                a, b, c, d, e, f = args
                nx = a * x + c * y + e
                ny = b * x + d * y + f
                x = nx
                y = ny
        elif op_name == 'scale':
            sx = args[0]
            sy = args[1] if len(args) > 1 else sx
            x *= sx
            y *= sy
    return x, y

def parse_path_points(d_string):
    tokens = re.findall(r'([A-Za-z])|([-+]?\d*\.\d+|[-+]?\d+)', d_string)
    current_x, current_y = 0.0, 0.0
    start_x, start_y = 0.0, 0.0
    points = []
    cmd = None
    coords = []
    for t_type, t_val in tokens:
        if t_type:
            if cmd is not None:
                current_x, current_y, start_x, start_y = process_cmd(cmd, coords, current_x, current_y, start_x, start_y, points)
                coords = []
            cmd = t_type
        else:
            coords.append(float(t_val))
    if cmd is not None:
        process_cmd(cmd, coords, current_x, current_y, start_x, start_y, points)
    return points

def process_cmd(cmd, coords, cur_x, cur_y, start_x, start_y, points):
    cmd_lower = cmd.lower()
    i = 0
    n = len(coords)
    def add_pt(x, y):
        points.append((x, y))

    if cmd_lower == 'm':
        while i < n - 1:
            x, y = coords[i], coords[i+1]
            if cmd == 'm' and points:
                cur_x += x
                cur_y += y
            else:
                if cmd == 'm':
                    cur_x += x
                    cur_y += y
                else:
                    cur_x = x
                    cur_y = y
                start_x, start_y = cur_x, cur_y
            add_pt(cur_x, cur_y)
            i += 2
    elif cmd_lower == 'l':
        while i < n - 1:
            x, y = coords[i], coords[i+1]
            if cmd == 'l':
                cur_x += x
                cur_y += y
            else:
                cur_x = x
                cur_y = y
            add_pt(cur_x, cur_y)
            i += 2
    elif cmd_lower == 'h':
        for x in coords:
            if cmd == 'h':
                cur_x += x
            else:
                cur_x = x
            add_pt(cur_x, cur_y)
    elif cmd_lower == 'v':
        for y in coords:
            if cmd == 'v':
                cur_y += y
            else:
                cur_y = y
            add_pt(cur_x, cur_y)
    elif cmd_lower == 'c':
        while i < n - 5:
            dx1, dy1, dx2, dy2, dx, dy = coords[i:i+6]
            if cmd == 'c':
                p1_x, p1_y = cur_x + dx1, cur_y + dy1
                p2_x, p2_y = cur_x + dx2, cur_y + dy2
                cur_x += dx
                cur_y += dy
            else:
                p1_x, p1_y = dx1, dy1
                p2_x, p2_y = dx2, dy2
                cur_x, cur_y = dx, dy
            add_pt(p1_x, p1_y)
            add_pt(p2_x, p2_y)
            add_pt(cur_x, cur_y)
            i += 6
    elif cmd_lower == 's':
        while i < n - 3:
            dx2, dy2, dx, dy = coords[i:i+4]
            if cmd == 's':
                p2_x, p2_y = cur_x + dx2, cur_y + dy2
                cur_x += dx
                cur_y += dy
            else:
                p2_x, p2_y = dx2, dy2
                cur_x, cur_y = dx, dy
            add_pt(p2_x, p2_y)
            add_pt(cur_x, cur_y)
            i += 4
    elif cmd_lower == 'q':
        while i < n - 3:
            dx1, dy1, dx, dy = coords[i:i+4]
            if cmd == 'q':
                p1_x, p1_y = cur_x + dx1, cur_y + dy1
                cur_x += dx
                cur_y += dy
            else:
                p1_x, p1_y = dx1, dy1
                cur_x, cur_y = dx, dy
            add_pt(p1_x, p1_y)
            add_pt(cur_x, cur_y)
            i += 4
    elif cmd_lower == 't':
        while i < n - 1:
            dx, dy = coords[i:i+2]
            if cmd == 't':
                cur_x += dx
                cur_y += dy
            else:
                cur_x, cur_y = dx, dy
            add_pt(cur_x, cur_y)
            i += 2
    elif cmd_lower == 'a':
        while i < n - 6:
            rx, ry, x_rot, large_arc, sweep, dx, dy = coords[i:i+7]
            if cmd == 'a':
                cur_x += dx
                cur_y += dy
            else:
                cur_x, cur_y = dx, dy
            add_pt(cur_x, cur_y)
            i += 7
    elif cmd_lower == 'z':
        cur_x, cur_y = start_x, start_y
        add_pt(cur_x, cur_y)
    return cur_x, cur_y, start_x, start_y

def get_element_points(el, ops):
    tag = el.tag.split('}')[-1]
    pts = []
    if tag == 'rect':
        x = float(el.attrib.get('x', 0))
        y = float(el.attrib.get('y', 0))
        w = float(el.attrib.get('width', 0))
        h = float(el.attrib.get('height', 0))
        raw_pts = [(x, y), (x + w, y), (x, y + h), (x + w, y + h)]
        pts = [apply_transforms(px, py, ops) for px, py in raw_pts]
    elif tag in ['circle', 'ellipse']:
        cx = float(el.attrib.get('cx', 0))
        cy = float(el.attrib.get('cy', 0))
        rx = float(el.attrib.get('r', el.attrib.get('rx', 0)))
        ry = float(el.attrib.get('r', el.attrib.get('ry', 0)))
        raw_pts = [(cx - rx, cy), (cx + rx, cy), (cx, cy - ry), (cx, cy + ry)]
        pts = [apply_transforms(px, py, ops) for px, py in raw_pts]
    elif tag == 'path':
        d = el.attrib.get('d', '')
        raw_pts = parse_path_points(d)
        pts = [apply_transforms(px, py, ops) for px, py in raw_pts]
    elif tag in ['polyline', 'polygon']:
        pts_str = el.attrib.get('points', '')
        nums = [float(val) for val in re.findall(r'[-+]?\d*\.\d+|[-+]?\d+', pts_str)]
        raw_pts = list(zip(nums[0::2], nums[1::2]))
        pts = [apply_transforms(px, py, ops) for px, py in raw_pts]
    return pts

def element_to_str(el):
    return ET.tostring(el, encoding='utf-8').decode('utf-8')

def parse_single_file(filepath, index):
    if not os.path.exists(filepath):
        print(f"File not found: {filepath}")
        return None
    tree = ET.parse(filepath)
    root = tree.getroot()
    ET.register_namespace('', 'http://www.w3.org/2000/svg')
    
    elements_info = []
    
    def recurse(node, parent_ops=[]):
        tag_local = node.tag.split('}')[-1]
        transform = node.attrib.get('transform', '')
        local_ops = parent_ops
        if transform:
            local_ops = parent_ops + parse_transforms(transform)
            
        if tag_local in ['rect', 'circle', 'ellipse', 'path', 'polyline', 'polygon']:
            pts = get_element_points(node, local_ops)
            if pts:
                xs = [p[0] for p in pts]
                ys = [p[1] for p in pts]
                x_center = sum(xs) / len(xs)
                elements_info.append({
                    'element': node,
                    'x': x_center,
                    'min_x': min(xs),
                    'max_x': max(xs),
                    'min_y': min(ys),
                    'max_y': max(ys),
                    'str': element_to_str(node)
                })
        for child in node:
            recurse(child, local_ops)
            
    recurse(root)
    if not elements_info:
        return None
        
    left_items = [x for x in elements_info if x['x'] < 38.01]
    right_items = [x for x in elements_info if x['x'] >= 38.01]
    
    global_min_y = min(x['min_y'] for x in elements_info)
    global_max_y = max(x['max_y'] for x in elements_info)
    global_min_x = min(x['min_x'] for x in elements_info)
    global_max_x = max(x['max_x'] for x in elements_info)
    x_center = (global_min_x + global_max_x) / 2.0

    height = global_max_y - global_min_y
    y_center = global_min_y + height / 2.0
    
    # Calculate separate left and right centers
    left_min_x = min(x['min_x'] for x in left_items) if left_items else 0.0
    left_max_x = max(x['max_x'] for x in left_items) if left_items else 0.0
    left_x_center = (left_min_x + left_max_x) / 2.0
    
    left_min_y = min(x['min_y'] for x in left_items) if left_items else 0.0
    left_max_y = max(x['max_y'] for x in left_items) if left_items else 0.0
    left_y_center = (left_min_y + left_max_y) / 2.0
    
    right_min_x = min(x['min_x'] for x in right_items) if right_items else 0.0
    right_max_x = max(x['max_x'] for x in right_items) if right_items else 0.0
    right_x_center = (right_min_x + right_max_x) / 2.0
    
    right_min_y = min(x['min_y'] for x in right_items) if right_items else 0.0
    right_max_y = max(x['max_y'] for x in right_items) if right_items else 0.0
    right_y_center = (right_min_y + right_max_y) / 2.0
    
    return {
        'id': index,
        'y_base': global_min_y,
        'y_center': y_center,
        'x_center': x_center,
        'height': height,
        'left': [x['str'] for x in left_items],
        'right': [x['str'] for x in right_items],
        'left_x_center': left_x_center,
        'right_x_center': right_x_center,
        'left_y_center': left_y_center,
        'right_y_center': right_y_center
    }

def main():
    facial_dir = r"d:\StoryMee\SVG\facial"
    
    # 1. Eyes
    eyes_data = []
    for i in range(1, 12):
        path = os.path.join(facial_dir, f"eyes_{i}.svg")
        data = parse_single_file(path, i)
        if data:
            eyes_data.append(data)
            
    # 2. Eyebrows
    eyebrow_data = []
    for i in range(1, 8):
        path = os.path.join(facial_dir, f"eyebrow_{i}.svg")
        data = parse_single_file(path, i)
        if data:
            eyebrow_data.append(data)

    # 3. Noses
    nose_data = []
    for i in range(1, 8):
        path = os.path.join(facial_dir, f"nose_{i}.svg")
        data = parse_single_file(path, i)
        if data:
            nose_data.append(data)

    # 4. Mouths
    mouth_data = []
    for i in range(1, 15):
        path = os.path.join(facial_dir, f"mouth_{i}.svg")
        data = parse_single_file(path, i)
        if data:
            mouth_data.append(data)
            
    out_db = {
        "eyes": eyes_data,
        "eyebrows": eyebrow_data,
        "noses": nose_data,
        "mouths": mouth_data
    }
    
    with open(r"d:\StoryMee\SVG\facial_features.json", 'w', encoding='utf-8') as f:
        json.dump(out_db, f, indent=2)
    print("Saved facial_features.json with all facial components!")

if __name__ == '__main__':
    main()
