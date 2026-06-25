import os

def main():
    base_dir = r"d:\StoryMee\SVG"
    facial_dir = os.path.join(base_dir, "facial")

    # Define exact styles for the elements stylesheet in eyes and mouths
    defs_style = """  <defs>
    <style>
      .cls-1{fill:#f44d4d;}
      .cls-2{fill:#fff;}
    </style>
  </defs>"""

    # 1. PROCESS NOSES (7 styles)
    # Standard viewBox: 0 0 30 18
    # Center each nose at x=15, y=9
    print("Processing noses...")
    noses_details = [
        # Nose 1 (xmin=0.43, ymin=13.0, xmax=13.0, ymax=17.0) -> center X=6.715, Y=15
        {
            "tx": 15 - 6.715, "ty": 9 - 15,
            "elements": [
                '<path class="cls-1" d="M9,17l3.8-2.47A.91.91,0,0,0,13,13.28h0a1,1,0,0,0-1.3-.25L7.94,15.5a.91.91,0,0,0-.28,1.27h0A.93.93,0,0,0,9,17Z"/>',
                '<path class="cls-1" d="M4.22,17,.43,14.55a.91.91,0,0,1-.28-1.27h0A1,1,0,0,1,1.45,13L5.24,15.5a.91.91,0,0,1,.28,1.27h0A.94.94,0,0,1,4.22,17Z"/>'
            ]
        },
        # Nose 2 (xmin=16.2, ymin=13.16, xmax=29.53, ymax=17.04) -> center X=22.865, Y=15.1
        {
            "tx": 15 - 22.865, "ty": 9 - 15.1,
            "elements": [
                '<line class="cls-2" x1="25.09" y1="17.04" x2="25.09"/>',
                '<path class="cls-1" d="M29.53,13.16a1,1,0,0,1-.26.71c-2,2.24-4.22,3.33-6.49,3.24-3.55-.14-6-3.17-6.05-3.3a1.07,1.07,0,0,1,.09-1.41.85.85,0,0,1,1.28.11h0s2,2.5,4.76,2.6c1.75.07,3.47-.83,5.13-2.66a.85.85,0,0,1,1.28,0A1.06,1.06,0,0,1,29.53,13.16Z"/>'
            ]
        },
        # Nose 3 (xmin=34.56, ymin=13.52, xmax=38.16, ymax=17.16) -> center X=36.36, Y=15.34
        {
            "tx": 15 - 36.36, "ty": 9 - 15.34,
            "elements": [
                '<rect class="cls-1" x="34.56" y="13.52" width="3.6" height="3.64" rx="1.8" transform="translate(51.7 -21.02) rotate(90)"/>'
            ]
        },
        # Nose 4 (xmin=43.41, ymin=5.88, xmax=56.3, ymax=17.04) -> center X=49.855, Y=11.46
        {
            "tx": 15 - 49.855, "ty": 9 - 11.46,
            "elements": [
                '<polygon class="cls-1" points="49.85 5.88 53.08 11.46 56.3 17.04 49.85 17.04 43.41 17.04 46.63 11.46 49.85 5.88"/>'
            ]
        },
        # Nose 5 (xmin=61.44, ymin=6.81, xmax=75.2, ymax=17.13) -> center X=68.32, Y=11.97
        {
            "tx": 15 - 68.32, "ty": 9 - 11.97,
            "elements": [
                '<rect class="cls-1" x="61.44" y="6.81" width="13.76" height="10.32" rx="5.16"/>'
            ]
        },
        # Nose 6 (xmin=80.82, ymin=0.14, xmax=87.93, ymax=17.12) -> center X=84.375, Y=8.63
        {
            "tx": 15 - 84.375, "ty": 9 - 8.63,
            "elements": [
                '<rect class="cls-1" x="80.82" y="0.14" width="7.11" height="16.98" rx="3.55"/>'
            ]
        },
        # Nose 7 (xmin=96.88, ymin=0.02, xmax=105.01, ymax=17.0) -> center X=100.945, Y=8.51
        {
            "tx": 15 - 100.945, "ty": 9 - 8.51,
            "elements": [
                '<rect class="cls-1" x="100.22" y="0.02" width="1.61" height="16.98" rx="0.8"/>',
                '<rect class="cls-1" x="96.88" y="2.21" width="1.61" height="12.6" rx="0.8"/>',
                '<rect class="cls-1" x="103.4" y="2.21" width="1.61" height="12.6" rx="0.8"/>'
            ]
        }
    ]

    for idx, nose in enumerate(noses_details):
        nose_id = idx + 1
        tx = nose["tx"]
        ty = nose["ty"]
        elements_str = "\n".join([f'      {e}' for e in nose["elements"]])
        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 18">
  <defs>
    <style>.cls-1{{fill:#f4b28e;}}.cls-2{{fill:none;}}</style>
  </defs>
  <g id="Layer_2" data-name="Layer 2">
    <g id="Layer_1-2" data-name="Layer 1" transform="translate({tx}, {ty})">
{elements_str}
    </g>
  </g>
</svg>
'''
        out_path = os.path.join(facial_dir, f"nose_{nose_id}.svg")
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        print(f"  Saved {out_path}")

    # 2. PROCESS MOUTHS (13 styles)
    # Standard viewBox: 0 0 50 25
    # Center each mouth at x=25, y=12.5
    print("Processing mouths...")
    mouths = [
        # ID 1 (Mouth D: x ~ 3.71 to 21.55, y ~ 3.5 to 7.8) -> center X=12.63, Y=5.65
        {
            "tx": 25 - 12.63, "ty": 12.5 - 5.65,
            "elements": [
                '<path d="M21.55,3.73a.58.58,0,0,0-1,0c-1.24,1.6-2.53,2.38-3.84,2.32C14.69,6,13.2,3.8,13.18,3.78l0,0a0,0,0,0,0,0,0s-.05,0-.08-.07a1.06,1.06,0,0,0-.12-.1l-.12,0-.13,0-.13,0-.13,0-.13,0-.12.09-.09.07v0l0,0C11,5.33,9.66,6.11,8.36,6.05,6.29,6,4.8,3.8,4.79,3.78a.58.58,0,0,0-1-.09,1.05,1.05,0,0,0-.08,1.23C3.84,5,5.64,7.67,8.29,7.8a5.56,5.56,0,0,0,4.37-2.25,6.09,6.09,0,0,0,4,2.25c1.7.08,3.33-.87,4.86-2.83a1,1,0,0,0,.19-.62A1,1,0,0,0,21.55,3.73Z"/>'
            ]
        },
        # ID 2 (Mouth C: x ~ 24.19 to 37.00, y ~ 0.5 to 8.5) -> center X=30.595, Y=4.5
        {
            "tx": 25 - 30.595, "ty": 12.5 - 4.5,
            "elements": [
                '<path d="M37,3.83a1,1,0,0,1-.27.71c-2,2.25-4.21,3.34-6.48,3.24-3.56-.14-6-3.16-6.06-3.29a1.08,1.08,0,0,1,.1-1.41.84.84,0,0,1,1.27.1s2,2.5,4.77,2.61C32,5.85,33.76,5,35.42,3.13a.85.85,0,0,1,1.28,0A1,1,0,0,1,37,3.83Z"/>'
            ]
        },
        # ID 3 (Mouth E: x ~ 39.53 to 52.33, y ~ 2.8 to 8.2) -> center X=45.93, Y=5.5
        {
            "tx": 25 - 45.93, "ty": 12.5 - 5.5,
            "elements": [
                '<path d="M52.33,6.79a1.09,1.09,0,0,0-.26-.71c-2-2.24-4.22-3.33-6.49-3.24C42,3,39.63,6,39.53,6.14a1.07,1.07,0,0,0,.09,1.41.85.85,0,0,0,1.28-.11h0s2-2.5,4.76-2.6c1.74-.07,3.47.83,5.13,2.66a.85.85,0,0,0,1.28,0A1.09,1.09,0,0,0,52.33,6.79Z"/>'
            ]
        },
        # ID 4 (Mouth B: x ~ 56.26 to 77.55, y ~ 0 to 15.96) -> center X=66.905, Y=7.98
        {
            "tx": 25 - 66.905, "ty": 12.5 - 7.98,
            "elements": [
                '<rect class="cls-1" x="56.26" width="21.29" height="15.96" rx="7.98"/>'
            ]
        },
        # ID 5 (Mouth F: x ~ 81.44 to 102.73, y ~ 4.93 to 12.06) -> center X=92.085, Y=8.495
        {
            "tx": 25 - 92.085, "ty": 12.5 - 8.495,
            "elements": [
                '<path class="cls-1" d="M102.73,7.75a2.82,2.82,0,0,0-2.82-2.82H84.27a2.83,2.83,0,0,0,0,5.65H94.92l0,1.06a1.88,1.88,0,0,0,.21,1,1.85,1.85,0,0,0,.52.8,1.82,1.82,0,0,0,.8.52,1.9,1.9,0,0,0,1,.22l.66-.09a2.55,2.55,0,0,0,1.11-.65l.39-.5a2.53,2.53,0,0,0,.34-1.26l0-1.06A2.82,2.82,0,0,0,102.73,7.75Z"/>'
            ]
        },
        # ID 6 (Mouth G: x ~ 105.41 to 128.35, y ~ 3.23 to 14.06) -> center X=116.88, Y=8.645
        {
            "tx": 25 - 116.88, "ty": 12.5 - 8.645,
            "elements": [
                '<path class="cls-1" d="M126.74,3.23a1.63,1.63,0,0,1,1.61,1.9,10.83,10.83,0,0,1-21.33,0,1.63,1.63,0,0,1,1.61-1.9Z"/>'
            ]
        },
        # ID 7 (Mouth A: x ~ 6.47 to 17.21, y ~ 17.18 to 26.48) -> center X=11.84, Y=21.83
        {
            "tx": 25 - 11.84, "ty": 12.5 - 21.83,
            "elements": [
                '<polygon class="cls-1" points="11.84 26.48 9.16 21.84 6.47 17.18 11.84 17.18 17.21 17.18 14.53 21.84 11.84 26.48"/>'
            ]
        },
        # ID 8 (Mouth H: x ~ 22.69 to 39.42, y ~ 19.38 to 21.64) -> center X=31.055, Y=20.51
        {
            "tx": 25 - 31.055, "ty": 12.5 - 20.51,
            "elements": [
                '<path d="M38.28,21.64H23.83a1.14,1.14,0,0,1,0-2.26H38.28a1.14,1.14,0,0,1,0,2.26Z"/>'
            ]
        },
        # ID 9 (Mouth I: x ~ 44.26 to 65.55, y ~ 19.49 to 27.31) -> center X=54.905, Y=23.4
        {
            "tx": 25 - 54.905, "ty": 12.5 - 23.4,
            "elements": [
                '<path class="cls-1" d="M65.55,23.45a3.86,3.86,0,0,1-3.86,3.86H48.12a3.86,3.86,0,0,1-3.86-3.86,3.81,3.81,0,0,1,1.13-2.72,3.88,3.88,0,0,1,2.73-1.13H61.69a3.91,3.91,0,0,1,.91.11A3.84,3.84,0,0,1,65.55,23.45Z"/>',
                '<path class="cls-2" d="M62.6,19.71l-1,2.06L61,23.05a.48.48,0,0,1-.89,0l-.63-1.28L58.36,19.6h3.33A3.91,3.91,0,0,1,62.6,19.71Z"/>',
                '<path class="cls-2" d="M51.45,19.6l-1.07,2.17-.63,1.28a.48.48,0,0,1-.88,0l-.63-1.28-1-2.06a3.91,3.91,0,0,1,.91-.11Z"/>'
            ]
        },
        # ID 10 (Mouth J: x ~ 72.26 to 93.00, y ~ 20.25 to 27.00) -> center X=82.63, Y=23.625
        {
            "tx": 25 - 82.63, "ty": 12.5 - 23.625,
            "elements": [
                '<path d="M92.51,23.58c-.43.15-.86.3-1.28.43a26.66,26.66,0,0,1-3.08.77,28.82,28.82,0,0,1-5.58.53,28.18,28.18,0,0,1-10.08-1.75.84.84,0,0,1-.46-1.1A.81.81,0,0,1,73.1,22,28.62,28.62,0,0,0,92,22a.81.81,0,0,1,1,.52A.85.85,0,0,1,92.51,23.58Z"/>',
                '<path class="cls-2" d="M91.23,24l-.29,1.53-.22,1.19a.4.4,0,0,1-.71.21L89.22,26l-1.07-1.25A26.66,26.66,0,0,0,91.23,24Z"/>'
            ]
        },
        # ID 11 (Mouth K: x ~ 101.27 to 128.65, y ~ 18.06 to 30.12) -> center X=114.96, Y=24.09
        {
            "tx": 25 - 114.96, "ty": 12.5 - 24.09,
            "elements": [
                '<path d="M128.65,28.8a4,4,0,0,1-5.49,1.32c-.4-.24-9-5.25-17.89,0a4,4,0,1,1-4.08-6.88,26.41,26.41,0,0,1,4.29-2,24.46,24.46,0,0,1,8.43-1.49,27.38,27.38,0,0,1,8.54,1.4,24.37,24.37,0,0,1,4.89,2.17A4,4,0,0,1,128.65,28.8Z"/>',
                '<path class="cls-2" d="M122.45,21.13c-7.55,4.83-13.72,2.29-17,.09a24.46,24.46,0,0,1,8.43-1.49A27.38,27.38,0,0,1,122.45,21.13Z"/>'
            ]
        },
        # ID 12 (Mouth L: x ~ 1.76 to 28.05, y ~ 35.60 to 45.65) -> center X=14.905, Y=40.625
        {
            "tx": 25 - 14.905, "ty": 12.5 - 40.625,
            "elements": [
                '<path class="cls-2" d="M28.05,42.42a24.93,24.93,0,0,1-4.3,2l-.72.25a24.19,24.19,0,0,1-7.65,1.23h-.75a27.44,27.44,0,0,1-7.41-1.26l-.72-.23a24.74,24.74,0,0,1-4.6-2.06,4,4,0,0,1,4.19-6.82,14,14,0,0,0,1.68.82c.22.1.45.2.71.29a19.68,19.68,0,0,0,6.15,1.26h.75a16.57,16.57,0,0,0,6.48-1.34c.24-.1.47-.2.71-.32q.7-.33,1.41-.75a4,4,0,1,1,4.07,6.89Z"/>',
                '<path d="M15.38,37.94v8h-.75v-8Z"/>',
                '<path d="M8.48,36.67l-1.26,8-.72-.23,1.27-8.06C8,36.48,8.22,36.58,8.48,36.67Z"/>',
                '<path d="M23.75,44.46l-.72.25L21.86,36.6c.24-.1.47-.2.71-.32Z"/>'
            ]
        },
        # ID 13 (Mouth M: x ~ 33.24 to 63.07, y ~ 36.38 to 42.14) -> center X=48.155, Y=39.26
        {
            "tx": 25 - 48.155, "ty": 12.5 - 39.26,
            "elements": [
                '<path d="M33.37,36.38a1,1,0,0,0-.13,2c.06,0,5.36.37,8.85,3.12a1,1,0,0,0,.62.21,1,1,0,0,0,.78-.38,1,1,0,0,0-.16-1.41C39.34,36.78,33.61,36.39,33.37,36.38Z"/>',
                '<path d="M63.07,38.77a1,1,0,0,0-1.13-1.65s-4.45,3-8.88,3a1,1,0,0,0-1,1,1,1,0,0,0,1,1C58.12,42.14,62.87,38.9,63.07,38.77Z"/>'
            ]
        }
    ]

    for idx, mouth in enumerate(mouths):
        mouth_id = idx + 1
        tx = mouth["tx"]
        ty = mouth["ty"]
        elements_str = "\n".join([f'      {e}' for e in mouth["elements"]])
        
        # Determine if defs stylesheet is needed (any elements use class cls-1 or cls-2)
        has_classes = any('class=' in e for e in mouth["elements"])
        defs_part = f"\n{defs_style}\n" if has_classes else "\n"

        svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 50 25">{defs_part}  <g id="Layer_2" data-name="Layer 2">
    <g id="Layer_1-2" data-name="Layer 1" transform="translate({tx}, {ty})">
{elements_str}
    </g>
  </g>
</svg>
'''
        out_path = os.path.join(facial_dir, f"mouth_{mouth_id}.svg")
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        print(f"  Saved {out_path}")

    # 3. PROCESS FACES (6 styles)
    # Bounding boxes inside columns of width 162. Let's load the full face.svg to copy base64 data and details!
    print("Processing faces...")
    face_src_path = os.path.join(facial_dir, "face.svg")
    if not os.path.exists(face_src_path):
        print(f"Error: {face_src_path} not found.")
        return
        
    with open(face_src_path, 'r', encoding='utf-8') as f:
        face_svg_text = f.read()

    # We will extract masks, rects, paths for each column
    # 6 columns, each of width 162. Let's map which elements go to which columns:
    # Column X offsets: 0*162=0, 1*162=162, 2*162=324, 3*162=486, 4*162=648, 5*162=810
    # Let's map Face ID -> column index `col_idx` -> center X.
    # Sorted order of Face IDs (from left to right in face.svg):
    # col_idx = 0: Face 3 (center 76.93)   -> ID 1
    # col_idx = 1: Face 1 (center 233.58)  -> ID 2
    # col_idx = 2: Face 2 (center 385.65)  -> ID 3
    # col_idx = 3: Face 4 (center 547.79)  -> ID 4
    # col_idx = 4: Face 5 (center 717.06)  -> ID 5
    # col_idx = 5: Face 6 (center 888.33)  -> ID 6
    
    # We can extract the patterns and images from face_svg_text using regex.
    # Let's write them statically since we have them in the file!
    # Pattern i uses image i.
    # Face 3 (col_idx = 0): pattern4, pattern5, image4, image5.
    # Face 1 (col_idx = 1): pattern0, pattern1, image0, image1.
    # Face 2 (col_idx = 2): pattern2, pattern3, image2, image3.
    # Face 4 (col_idx = 3): pattern6, pattern7, image6, image7.
    # Face 5 (col_idx = 4): pattern8, pattern9, image8, image9.
    # Face 6 (col_idx = 5): pattern10, pattern11, image10, image11.
    
    # Let's extract the exact pattern and image elements using python string search.
    def get_pattern_str(pat_num):
        pattern_id = f'id="pattern{pat_num}_25_1723"'
        start_idx = face_svg_text.find(f'<pattern {pattern_id}')
        if start_idx == -1:
            start_idx = face_svg_text.find(f'<pattern id="pattern{pat_num}_25_1723"')
        if start_idx == -1:
            return ""
        end_idx = face_svg_text.find('</pattern>', start_idx) + 10
        return face_svg_text[start_idx:end_idx]

    def get_image_str(img_num):
        image_id = f'id="image{img_num}_25_1723"'
        start_idx = face_svg_text.find(f'<image {image_id}')
        if start_idx == -1:
            start_idx = face_svg_text.find(f'<image id="image{img_num}_25_1723"')
        if start_idx == -1:
            return ""
        end_idx = face_svg_text.find('/>', start_idx) + 2
        return face_svg_text[start_idx:end_idx]

    # Let's map Face ID to their data details (masks, rects, paths) directly from face.svg:
    faces_details = [
        # Face 1 (original Face 3, col_idx = 0, x offset 0)
        {
            "col_idx": 0,
            "patterns": [4, 5],
            "body": """<mask id="mask8_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="122" y="72" width="27" height="36">
<path d="M142.95 96.43L126.67 107.1C126.218 107.4 125.688 107.558 125.146 107.555C124.604 107.552 124.075 107.388 123.627 107.083C123.178 106.779 122.831 106.347 122.628 105.845C122.426 105.342 122.378 104.79 122.49 104.26L128.64 74.62C131.531 72.7237 135.057 72.0535 138.442 72.7567C141.827 73.46 144.794 75.4791 146.69 78.37C148.586 81.2609 149.257 84.7866 148.553 88.1717C147.85 91.5567 145.831 94.5237 142.94 96.42L142.95 96.43Z" fill="white"/>
</mask>
<g mask="url(#mask8_25_1723)">
<mask id="mask9_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="117" y="67" width="37" height="46">
<path d="M153.65 67.6H117.43V112.57H153.65V67.6Z" fill="white"/>
</mask>
<g mask="url(#mask9_25_1723)">
<rect x="117.12" y="67.41" width="36.96" height="45.6" fill="url(#pattern4_25_1723)"/>
</g>
</g>
<mask id="mask10_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="5" y="72" width="27" height="36">
<path d="M11.05 96.43L27.33 107.11C27.7825 107.408 28.3132 107.565 28.8548 107.561C29.3965 107.557 29.9249 107.393 30.3733 107.089C30.8217 106.785 31.1699 106.355 31.374 105.853C31.5781 105.352 31.6289 104.801 31.52 104.27L25.33 74.63C22.4391 72.7337 18.9134 72.0635 15.5284 72.7667C12.1433 73.47 9.1763 75.4891 7.28 78.38C5.3837 81.2709 4.71346 84.7966 5.41672 88.1817C6.11999 91.5667 8.13914 94.5337 11.03 96.43H11.05Z" fill="white"/>
</mask>
<g mask="url(#mask10_25_1723)">
<mask id="mask11_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="0" y="67" width="37" height="46">
<path d="M36.58 67.6H0.360001V112.57H36.58V67.6Z" fill="white"/>
</mask>
<g mask="url(#mask11_25_1723)">
<rect y="67.41" width="36.96" height="45.6" fill="url(#pattern5_25_1723)"/>
</g>
</g>
<path d="M76.93 134.07C109.222 134.07 135.4 104.194 135.4 67.34C135.4 30.486 109.222 0.609985 76.93 0.609985C44.6379 0.609985 18.46 30.486 18.46 67.34C18.46 104.194 44.6379 134.07 76.93 134.07Z" fill="#FFE7E6"/>"""
        },
        # Face 2 (original Face 1, col_idx = 1, x offset 162)
        {
            "col_idx": 1,
            "patterns": [0, 1],
            "body": """<mask id="mask0_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="277" y="72" width="27" height="36">
<path d="M297.79 96.42L281.51 107.1C281.058 107.4 280.528 107.558 279.986 107.555C279.444 107.552 278.915 107.388 278.467 107.083C278.018 106.779 277.671 106.347 277.468 105.845C277.266 105.342 277.218 104.79 277.33 104.26L283.48 74.62C286.371 72.7237 289.897 72.0535 293.282 72.7567C296.667 73.46 299.634 75.4791 301.53 78.37C303.426 81.2609 304.097 84.7866 303.393 88.1717C302.69 91.5567 300.671 94.5237 297.78 96.42H297.79Z" fill="white"/>
</mask>
<g mask="url(#mask0_25_1723)">
<mask id="mask1_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="272" y="67" width="37" height="46">
<path d="M308.49 67.59H272.27V112.56H308.49V67.59Z" fill="white"/>
</mask>
<g mask="url(#mask1_25_1723)">
<rect x="272.16" y="67.41" width="36.48" height="45.6" fill="url(#pattern0_25_1723)"/>
</g>
</g>
<mask id="mask2_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="163" y="72" width="27" height="36">
<path d="M169.41 96.42L185.7 107.09C186.152 107.39 186.682 107.548 187.224 107.545C187.766 107.542 188.295 107.378 188.743 107.073C189.192 106.769 189.539 106.337 189.742 105.835C189.944 105.332 189.992 104.78 189.88 104.25L183.72 74.61C180.829 72.7137 177.303 72.0434 173.918 72.7467C170.533 73.45 167.566 75.4691 165.67 78.36C163.774 81.2509 163.103 84.7766 163.807 88.1616C164.51 91.5467 166.529 94.5137 169.42 96.41L169.41 96.42Z" fill="white"/>
</mask>
<g mask="url(#mask2_25_1723)">
<mask id="mask3_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="158" y="67" width="37" height="46">
<path d="M194.93 67.59H158.71V112.56H194.93V67.59Z" fill="white"/>
</mask>
<g mask="url(#mask3_25_1723)">
<rect x="158.4" y="67.41" width="36.96" height="45.6" fill="url(#pattern1_25_1723)"/>
</g>
</g>
<path d="M292.04 67.34C292.04 30.49 265.86 0.609985 233.58 0.609985C201.29 0.609985 175.12 30.49 175.12 67.34C175.12 104.19 203.33 122.6 233.55 134.07C263.76 122.6 292.04 104.19 292.04 67.34Z" fill="#FFE7E6"/>"""
        },
        # Face 3 (original Face 2, col_idx = 2, x offset 324)
        {
            "col_idx": 2,
            "patterns": [2, 3],
            "body": """<mask id="mask4_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="426" y="72" width="27" height="36">
<path d="M446.93 96.42L430.65 107.1C430.198 107.4 429.668 107.558 429.126 107.555C428.584 107.552 428.055 107.388 427.607 107.083C427.158 106.779 426.811 106.347 426.608 105.845C426.406 105.342 426.358 104.79 426.47 104.26L432.63 74.62C435.521 72.7237 439.047 72.0535 442.432 72.7567C445.817 73.46 448.784 75.4791 450.68 78.37C452.576 81.2609 453.247 84.7866 452.543 88.1717C451.84 91.5567 449.821 94.5237 446.93 96.42Z" fill="white"/>
</mask>
<g mask="url(#mask4_25_1723)">
<mask id="mask5_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="421" y="67" width="37" height="46">
<path d="M457.63 67.59H421.41V112.56H457.63V67.59Z" fill="white"/>
</mask>
<g mask="url(#mask5_25_1723)">
<rect x="420.96" y="67.41" width="36.96" height="45.6" fill="url(#pattern2_25_1723)"/>
</g>
</g>
<mask id="mask6_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="319" y="72" width="27" height="36">
<path d="M325.33 96.42L341.61 107.09C342.063 107.388 342.593 107.545 343.135 107.541C343.676 107.537 344.205 107.373 344.653 107.069C345.102 106.765 345.45 106.335 345.654 105.833C345.858 105.332 345.909 104.781 345.8 104.25L339.64 74.61C336.748 72.7124 333.22 72.0414 329.833 72.7447C326.446 73.4479 323.478 75.4678 321.58 78.36C319.682 81.2522 319.011 84.7798 319.715 88.1667C320.418 91.5536 322.438 94.5224 325.33 96.42Z" fill="white"/>
</mask>
<g mask="url(#mask6_25_1723)">
<mask id="mask7_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="314" y="67" width="37" height="46">
<path d="M350.8 67.59H314.58V112.56H350.8V67.59Z" fill="white"/>
</mask>
<g mask="url(#mask7_25_1723)">
<rect x="314.4" y="67.41" width="36.48" height="45.6" fill="url(#pattern3_25_1723)"/>
</g>
</g>
<path d="M439.81 60.35C437.33 97.15 415.58 136.35 385.65 136.35C355.72 136.35 333.55 96.54 331.43 60.35C329.31 24.16 355.69 0.609985 385.62 0.609985C415.55 0.609985 442.24 24.1 439.81 60.35Z" fill="#FFE7E6"/>"""
        },
        # Face 4 (original Face 4, col_idx = 3, x offset 486)
        {
            "col_idx": 3,
            "patterns": [6, 7],
            "body": """<mask id="mask12_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="469" y="72" width="24" height="38">
<path d="M473.71 94.8L487.4 108.64C487.781 109.026 488.268 109.29 488.799 109.399C489.33 109.508 489.881 109.457 490.383 109.253C490.886 109.048 491.316 108.699 491.62 108.25C491.923 107.801 492.087 107.272 492.09 106.73L492.26 76.47C491.056 75.252 489.625 74.283 488.047 73.6182C486.469 72.9535 484.775 72.6061 483.063 72.5959C479.605 72.5753 476.28 73.9293 473.82 76.36C471.36 78.7907 469.967 82.099 469.946 85.5572C469.936 87.2695 470.263 88.9671 470.909 90.553C471.555 92.1388 472.506 93.582 473.71 94.8Z" fill="white"/>
</mask>
<g mask="url(#mask12_25_1723)">
<mask id="mask13_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="465" y="67" width="33" height="48">
<path d="M497.25 67.75H465.11V114.48H497.25V67.75Z" fill="white"/>
</mask>
<g mask="url(#mask13_25_1723)">
<rect x="464.64" y="67.41" width="32.64" height="47.52" fill="url(#pattern6_25_1723)"/>
</g>
</g>
<mask id="mask14_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="603" y="72" width="23" height="38">
<path d="M621.62 94.8L607.93 108.64C607.549 109.026 607.062 109.29 606.531 109.399C606 109.508 605.449 109.457 604.947 109.253C604.444 109.048 604.014 108.699 603.71 108.25C603.407 107.801 603.243 107.272 603.24 106.73L603.06 76.47C605.491 74.0088 608.8 72.614 612.259 72.5924C615.718 72.5709 619.044 73.9243 621.505 76.355C623.966 78.7857 625.361 82.0946 625.383 85.5537C625.404 89.0128 624.051 92.3388 621.62 94.8Z" fill="white"/>
</mask>
<g mask="url(#mask14_25_1723)">
<mask id="mask15_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="598" y="67" width="33" height="48">
<path d="M630.22 67.75H598.07V114.48H630.22V67.75Z" fill="white"/>
</mask>
<g mask="url(#mask15_25_1723)">
<rect x="597.6" y="67.41" width="32.64" height="47.52" fill="url(#pattern7_25_1723)"/>
</g>
</g>
<path d="M547.79 0.380005C563.232 0.390609 578.038 6.53233 588.953 17.4552C599.868 28.378 606 43.1881 606 58.63V102.63C606 110.939 602.699 118.908 596.824 124.784C590.948 130.659 582.979 133.96 574.67 133.96H520.87C512.561 133.96 504.592 130.659 498.716 124.784C492.841 118.908 489.54 110.939 489.54 102.63V58.63C489.54 43.1811 495.677 28.365 506.601 17.441C517.525 6.51704 532.341 0.380005 547.79 0.380005Z" fill="#FFE7E6"/>"""
        },
        # Face 5 (original Face 5, col_idx = 4, x offset 648)
        {
            "col_idx": 4,
            "patterns": [8, 9],
            "body": """<mask id="mask16_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="766" y="72" width="27" height="36">
<path d="M786.77 96.73L770.49 107.4C770.037 107.699 769.505 107.856 768.962 107.852C768.419 107.849 767.89 107.683 767.441 107.378C766.992 107.073 766.644 106.641 766.441 106.137C766.238 105.634 766.189 105.081 766.3 104.55L772.46 74.92C775.351 73.0237 778.877 72.3534 782.262 73.0567C785.647 73.76 788.614 75.7791 790.51 78.67C792.406 81.5608 793.077 85.0866 792.373 88.4716C791.67 91.8567 789.651 94.8237 786.76 96.72L786.77 96.73Z" fill="white"/>
</mask>
<g mask="url(#mask16_25_1723)">
<mask id="mask17_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="761" y="67" width="37" height="46">
<path d="M797.47 67.9H761.25V112.87H797.47V67.9Z" fill="white"/>
</mask>
<g mask="url(#mask17_25_1723)">
<rect x="760.8" y="67.89" width="36.96" height="45.12" fill="url(#pattern8_25_1723)"/>
</g>
</g>
<mask id="mask18_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="641" y="72" width="28" height="36">
<path d="M647.54 96.73L663.82 107.4C664.273 107.696 664.804 107.85 665.345 107.845C665.886 107.839 666.413 107.674 666.86 107.369C667.307 107.064 667.654 106.634 667.857 106.132C668.06 105.63 668.11 105.08 668 104.55L661.84 74.92C658.949 73.0237 655.423 72.3534 652.038 73.0567C648.653 73.76 645.686 75.7791 643.79 78.67C641.894 81.5608 641.224 85.0866 641.927 88.4716C642.63 91.8567 644.649 94.8237 647.54 96.72V96.73Z" fill="white"/>
</mask>
<g mask="url(#mask18_25_1723)">
<mask id="mask19_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="636" y="67" width="38" height="46">
<path d="M673.06 67.9H636.84V112.87H673.06V67.9Z" fill="white"/>
</mask>
<g mask="url(#mask19_25_1723)">
<rect x="636.48" y="67.89" width="36.96" height="45.12" fill="url(#pattern9_25_1723)"/>
</g>
</g>
<path d="M717.06 0.549988C684.74 0.549988 658.59 27.45 658.59 59.99L665.67 107.91C665.669 109.307 665.945 110.691 666.48 111.981C667.015 113.272 667.801 114.444 668.79 115.43L692.52 131.12C694.517 133.117 697.226 134.24 700.05 134.24H734.05C736.874 134.24 739.583 133.117 741.58 131.12L765.33 115.43C766.32 114.444 767.105 113.272 767.64 111.981C768.175 110.691 768.451 109.307 768.45 107.91L775.53 60C775.53 27.45 749.38 0.579988 717.06 0.549988Z" fill="#FFE7E6"/>"""
        },
        # Face 6 (original Face 6, col_idx = 5, x offset 810)
        {
            "col_idx": 5,
            "patterns": [10, 11],
            "body": """<mask id="mask20_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="810" y="70" width="23" height="38">
<path d="M814.19 92.36L827.88 106.21C828.261 106.592 828.747 106.854 829.277 106.961C829.806 107.068 830.355 107.016 830.856 106.812C831.356 106.608 831.784 106.261 832.088 105.814C832.391 105.367 832.555 104.84 832.56 104.3L832.74 74C830.309 71.5401 827.001 70.1466 823.543 70.126C820.085 70.1053 816.76 71.4593 814.3 73.89C811.84 76.3207 810.447 79.6291 810.426 83.0872C810.405 86.5454 811.759 89.8701 814.19 92.33V92.36Z" fill="white"/>
</mask>
<g mask="url(#mask20_25_1723)">
<mask id="mask21_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="805" y="65" width="33" height="48">
<path d="M837.74 65.3H805.6V112.03H837.74V65.3Z" fill="white"/>
</mask>
<g mask="url(#mask21_25_1723)">
<rect x="805.44" y="65.01" width="32.64" height="47.04" fill="url(#pattern10_25_1723)"/>
</g>
</g>
<mask id="mask22_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="943" y="70" width="23" height="38">
<path d="M962.11 92.36L948.43 106.21C948.049 106.596 947.562 106.86 947.031 106.969C946.5 107.078 945.949 107.027 945.447 106.823C944.944 106.618 944.514 106.269 944.211 105.82C943.907 105.371 943.743 104.842 943.74 104.3L943.56 74C944.764 72.7826 946.195 71.8143 947.773 71.1502C949.351 70.4861 951.044 70.1392 952.756 70.1295C954.468 70.1197 956.165 70.4473 957.75 71.0933C959.335 71.7394 960.778 72.6914 961.995 73.895C963.212 75.0986 964.181 76.5301 964.845 78.1079C965.509 79.6857 965.856 81.3789 965.866 83.0907C965.875 84.8026 965.548 86.4996 964.902 88.0849C964.256 89.6701 963.304 91.1126 962.1 92.33L962.11 92.36Z" fill="white"/>
</mask>
<g mask="url(#mask22_25_1723)">
<mask id="mask23_25_1723" style="mask-type:luminance" maskUnits="userSpaceOnUse" x="938" y="65" width="33" height="48">
<path d="M970.71 65.3H938.56V112.03H970.71V65.3Z" fill="white"/>
</mask>
<g mask="url(#mask23_25_1723)">
<rect x="938.4" y="65.01" width="32.64" height="47.04" fill="url(#pattern11_25_1723)"/>
</g>
</g>
<path d="M946.81 85.27V58.47C946.81 50.7908 945.297 43.1867 942.358 36.0922C939.419 28.9976 935.112 22.5515 929.681 17.1219C924.251 11.6924 917.804 7.3857 910.709 4.44789C903.614 1.51009 896.009 -0.00131251 888.33 8.55218e-07C872.823 8.55218e-07 857.951 6.16022 846.985 17.1255C836.02 28.0907 829.86 42.9628 829.86 58.47V85.27C825.164 90.4153 822.566 97.1337 822.58 104.1V105.48C822.58 109.157 823.304 112.798 824.711 116.195C826.118 119.592 828.181 122.679 830.781 125.279C836.032 130.53 843.154 133.48 850.58 133.48H926.15C929.827 133.48 933.468 132.756 936.865 131.349C940.262 129.942 943.349 127.879 945.949 125.279C948.549 122.679 950.611 119.592 952.019 116.195C953.426 112.798 954.15 109.157 954.15 105.48V104.1C954.143 97.1266 951.524 90.4088 946.81 85.27Z" fill="#FFE7E6"/>"""
        }
    ]

    centers = [76.93, 233.58, 385.65, 547.79, 717.06, 888.33]

    for idx, face in enumerate(faces_details):
        face_id = idx + 1
        cx = centers[idx]
        tx = 90 - cx
        
        # Build defs block with relevant patterns and images
        defs_list = []
        for pat in face["patterns"]:
            defs_list.append(get_pattern_str(pat))
        for img in face["patterns"]:
            defs_list.append(get_image_str(img))
            
        defs_str = "\n".join(defs_list)
        
        svg_content = f'''<svg width="180" height="137" viewBox="0 0 180 137" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <g clip-path="url(#clip0_25_1723)">
    <g id="Layer_2" data-name="Layer 2" transform="translate({tx}, 0)">
{face["body"]}
    </g>
  </g>
  <defs>
{defs_str}
    <clipPath id="clip0_25_1723">
      <rect width="180" height="137" fill="white"/>
    </clipPath>
  </defs>
</svg>
'''
        out_path = os.path.join(facial_dir, f"face_{face_id}.svg")
        with open(out_path, 'w', encoding='utf-8') as f:
            f.write(svg_content)
        print(f"  Saved {out_path}")

    print("All tasks completed successfully!")

if __name__ == "__main__":
    main()
