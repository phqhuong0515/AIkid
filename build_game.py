import os
import json
import re

def clean_svg(svg_content):
    # Remove XML declarations or comments if present to keep string clean
    svg_content = re.sub(r'<\?xml[^>]*\?>', '', svg_content)
    svg_content = re.sub(r'<!--.*?-->', '', svg_content, flags=re.DOTALL)
    return svg_content.strip()

def rename_facial_classes(svg_str):
    # Avoid class collision with base SVG styles
    svg_str = svg_str.replace('class="cls-1"', 'class="facial-cls-1"')
    svg_str = svg_str.replace('class="cls-2"', 'class="facial-cls-2"')
    return svg_str

def main():
    base_dir = r"d:\StoryMee\SVG"
    svg_db = {
        "presets": {
            "male": {},
            "female": {}
        },
        "base": {
            "male": "",
            "female": ""
        },
        "faces": {}
    }
    
    clothes_dir = os.path.join(base_dir, "Skin tone (clothes)")
    
    # Load Base SVGs
    male_base_path = os.path.join(clothes_dir, "male.svg")
    if os.path.exists(male_base_path):
        with open(male_base_path, 'r', encoding='utf-8') as f:
            svg_db["base"]["male"] = clean_svg(f.read())
            
    female_base_path = os.path.join(clothes_dir, "female.svg")
    if os.path.exists(female_base_path):
        with open(female_base_path, 'r', encoding='utf-8') as f:
            svg_db["base"]["female"] = clean_svg(f.read())

    # Load 10 Presets SVGs (clothed only)
    for i in range(1, 11):
        # Male
        m_path = os.path.join(clothes_dir, f"male_skin_{i}.svg")
        if os.path.exists(m_path):
            with open(m_path, 'r', encoding='utf-8') as f:
                svg_db["presets"]["male"][i] = clean_svg(f.read())
        # Female
        f_path = os.path.join(clothes_dir, f"female_skin_{i}.svg")
        if os.path.exists(f_path):
            with open(f_path, 'r', encoding='utf-8') as f:
                svg_db["presets"]["female"][i] = clean_svg(f.read())

    # Load 6 Faces SVGs
    for i in range(1, 7):
        face_path = os.path.join(base_dir, "facial", f"face_{i}.svg")
        if os.path.exists(face_path):
            with open(face_path, 'r', encoding='utf-8') as f:
                svg_db["faces"][i] = clean_svg(f.read())

    # Load Facial features database and rename conflicting classes
    facial_db = {"eyes": [], "eyebrows": [], "noses": [], "mouths": []}
    facial_path = os.path.join(base_dir, "facial_features.json")
    if os.path.exists(facial_path):
        with open(facial_path, 'r', encoding='utf-8') as f:
            raw_facial = json.load(f)
            
            # Clean and isolate classes in eyes
            for eye in raw_facial.get("eyes", []):
                facial_db["eyes"].append({
                    "id": eye["id"],
                    "y_base": eye["y_base"],
                    "y_center": eye["y_center"],
                    "x_center": eye.get("x_center", 38.02),
                    "height": eye["height"],
                    "left": [rename_facial_classes(s) for s in eye["left"]],
                    "right": [rename_facial_classes(s) for s in eye["right"]]
                })
                
            # Eyebrows usually have no classes, but we process them for consistency
            for eb in raw_facial.get("eyebrows", []):
                facial_db["eyebrows"].append({
                    "id": eb["id"],
                    "y_base": eb["y_base"],
                    "y_center": eb["y_center"],
                    "x_center": eb.get("x_center", 38.01),
                    "height": eb["height"],
                    "left": [rename_facial_classes(s) for s in eb["left"]],
                    "right": [rename_facial_classes(s) for s in eb["right"]]
                })

            # Noses
            for ns in raw_facial.get("noses", []):
                facial_db["noses"].append({
                    "id": ns["id"],
                    "y_base": ns["y_base"],
                    "y_center": ns["y_center"],
                    "x_center": ns.get("x_center", 38.01),
                    "height": ns["height"],
                    "left": [rename_facial_classes(s) for s in ns["left"]],
                    "right": [rename_facial_classes(s) for s in ns["right"]]
                })

            # Mouths
            for mt in raw_facial.get("mouths", []):
                facial_db["mouths"].append({
                    "id": mt["id"],
                    "y_base": mt["y_base"],
                    "y_center": mt["y_center"],
                    "x_center": mt.get("x_center", 38.01),
                    "height": mt["height"],
                    "left": [rename_facial_classes(s) for s in mt["left"]],
                    "right": [rename_facial_classes(s) for s in mt["right"]]
                })

    # HTML Template
    html_template = """<!DOCTYPE html>
<html lang="vi">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mee Character Customizer - Trình Thiết Kế Nhân Vật</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    
    <style>
        :root {
            --bg-color: #080a11;
            --panel-bg: rgba(16, 22, 38, 0.65);
            --panel-border: rgba(255, 255, 255, 0.08);
            --panel-hover-border: rgba(99, 102, 241, 0.25);
            --primary: #6366f1;
            --primary-glow: rgba(99, 102, 241, 0.35);
            --primary-hover: #4f46e5;
            --text-color: #f8fafc;
            --text-muted: #94a3b8;
            --active-glow: rgba(255, 255, 255, 0.2);
            --card-radius: 20px;
            --skin-glow-color: rgba(99, 102, 241, 0.15);
        }

        * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
            user-select: none;
            -webkit-user-drag: none;
        }

        body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            background-color: var(--bg-color);
            color: var(--text-color);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
            background-image: 
                radial-gradient(circle at 15% 15%, rgba(99, 102, 241, 0.08) 0%, transparent 45%),
                radial-gradient(circle at 85% 85%, rgba(244, 63, 94, 0.06) 0%, transparent 45%);
        }

        header {
            padding: 1.25rem 2.5rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1px solid var(--panel-border);
            background: rgba(8, 10, 17, 0.8);
            backdrop-filter: blur(16px);
            z-index: 10;
        }

        .header-title-container {
            display: flex;
            flex-direction: column;
            gap: 0.15rem;
        }

        .logo {
            font-family: 'Outfit', sans-serif;
            font-size: 1.75rem;
            font-weight: 800;
            background: linear-gradient(135deg, #c7d2fe 0%, #6366f1 50%, #4338ca 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            letter-spacing: -0.03em;
        }

        .logo span {
            color: #818cf8;
            font-size: 0.75rem;
            font-weight: 600;
            background: rgba(99, 102, 241, 0.15);
            border: 1px solid rgba(99, 102, 241, 0.25);
            padding: 0.15rem 0.5rem;
            border-radius: 6px;
            letter-spacing: 0.05em;
            text-transform: uppercase;
        }

        .subtitle {
            font-size: 0.85rem;
            color: var(--text-muted);
            font-weight: 400;
        }

        .header-status {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.8rem;
            color: var(--text-muted);
            border: 1px solid var(--panel-border);
            padding: 0.4rem 0.8rem;
            border-radius: 10px;
            background: rgba(255, 255, 255, 0.02);
        }

        .status-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #10b981;
            box-shadow: 0 0 10px #10b981;
        }

        main {
            flex: 1;
            display: flex;
            padding: 2rem 2.5rem;
            gap: 2rem;
            max-width: 1500px;
            width: 100%;
            margin: 0 auto;
            height: calc(100vh - 84px);
            overflow: hidden;
        }

        /* Viewport Canvas container */
        .viewport-container {
            flex: 1.4;
            background: var(--panel-bg);
            border: 1px solid var(--panel-border);
            border-radius: 28px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            backdrop-filter: blur(20px);
            box-shadow: 0 12px 40px 0 rgba(0, 0, 0, 0.4);
            transition: border-color 0.3s ease;
        }

        /* SVG Viewport grid and background glow */
        .viewport-canvas {
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            position: relative;
            cursor: grab;
            background-size: 30px 30px;
            background-image: 
                linear-gradient(to right, rgba(255, 255, 255, 0.015) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255, 255, 255, 0.015) 1px, transparent 1px);
        }

        .viewport-canvas:active {
            cursor: grabbing;
        }

        .ambient-glow {
            position: absolute;
            width: 45%;
            height: 55%;
            border-radius: 50%;
            background: var(--skin-glow-color);
            filter: blur(90px);
            opacity: 0.55;
            transition: background 0.4s ease;
            z-index: 1;
            pointer-events: none;
        }

        .character-wrapper {
            position: relative;
            z-index: 2;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            transform-origin: center center;
            transition: transform 0.1s ease-out;
        }

        .character-wrapper svg {
            max-width: 82%;
            max-height: 82%;
            width: auto;
            height: auto;
            filter: drop-shadow(0 15px 30px rgba(0, 0, 0, 0.6));
            pointer-events: none;
        }

        /* Styling for dynamic eyes/eyebrows inside SVG DOM */
        #custom-eyebrows *, #custom-eyes * {
            fill: #1a202c !important; /* Premium dark slate */
        }
        #custom-eyebrows .facial-cls-1, #custom-eyes .facial-cls-1 {
            fill: #ffffff !important; /* Sparkles white */
        }
        #custom-eyebrows .facial-cls-2, #custom-eyes .facial-cls-2 {
            fill: none !important;
            stroke: #1a202c !important;
            stroke-width: 1.17px !important;
            stroke-miterlimit: 10 !important;
        }

        /* Custom Nose and Mouth styling */
        #custom-nose .facial-cls-1, .nose-preview .facial-cls-1 {
            fill: var(--shading-color) !important;
        }
        #custom-mouth *, .mouth-preview * {
            fill: #1a202c !important; /* Default premium slate */
        }
        #custom-mouth .facial-cls-1, .mouth-preview .facial-cls-1 {
            fill: #f44d4d !important; /* Mouth inside / tongue red */
        }
        #custom-mouth .facial-cls-2, .mouth-preview .facial-cls-2 {
            fill: #ffffff !important; /* Teeth white */
        }

        /* Canvas HUD Overlay Controls */
        .hud-controls {
            position: absolute;
            bottom: 1.5rem;
            left: 50%;
            transform: translateX(-50%);
            display: flex;
            gap: 0.6rem;
            z-index: 5;
            background: rgba(10, 12, 22, 0.7);
            backdrop-filter: blur(12px);
            padding: 0.5rem;
            border-radius: 18px;
            border: 1px solid var(--panel-border);
        }

        .hud-btn {
            background: transparent;
            border: none;
            width: 2.75rem;
            height: 2.75rem;
            border-radius: 12px;
            color: var(--text-color);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hud-btn:hover {
            background: rgba(255, 255, 255, 0.08);
            color: #a5b4fc;
            transform: translateY(-2px);
        }

        .hud-btn:active {
            transform: translateY(0);
        }

        .hud-btn svg {
            width: 1.35rem;
            height: 1.35rem;
            fill: currentColor;
        }

        /* Controls sidebar */
        .controls-sidebar {
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: 1.5rem;
            overflow-y: auto;
            padding-right: 0.5rem;
        }

        /* Glassmorphic control cards */
        .control-card {
            background: var(--panel-bg);
            border: 1px solid var(--panel-border);
            border-radius: var(--card-radius);
            padding: 1.5rem;
            backdrop-filter: blur(20px);
            box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25);
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .control-card:hover {
            border-color: var(--panel-hover-border);
        }

        .card-title {
            font-family: 'Outfit', sans-serif;
            font-size: 1.15rem;
            font-weight: 700;
            margin-bottom: 1.25rem;
            display: flex;
            align-items: center;
            gap: 0.6rem;
            color: var(--text-color);
            letter-spacing: -0.01em;
        }

        .card-title svg {
            width: 1.3rem;
            height: 1.3rem;
            fill: var(--primary);
        }

        /* Segmented Option Control */
        .segmented-control {
            display: flex;
            background: rgba(4, 5, 10, 0.6);
            border-radius: 14px;
            padding: 0.3rem;
            border: 1px solid var(--panel-border);
            gap: 0.3rem;
        }

        .segment-btn {
            flex: 1;
            background: transparent;
            border: none;
            padding: 0.8rem 1.2rem;
            border-radius: 10px;
            font-family: 'Plus Jakarta Sans', sans-serif;
            font-size: 0.9rem;
            font-weight: 600;
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
        }

        .segment-btn:hover {
            color: var(--text-color);
            background: rgba(255, 255, 255, 0.02);
        }

        .segment-btn.active {
            color: #fff;
            background: var(--primary);
            box-shadow: 0 4px 16px var(--primary-glow);
        }

        .segment-btn svg {
            width: 1.15rem;
            height: 1.15rem;
            fill: currentColor;
        }

        /* Palette grid styling */
        .palette-grid {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 0.8rem;
        }

        .palette-item {
            aspect-ratio: 1;
            border-radius: 14px;
            border: 2px solid transparent;
            cursor: pointer;
            overflow: hidden;
            position: relative;
            display: flex;
            flex-direction: column;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.35);
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .palette-item:hover {
            transform: scale(1.1) translateY(-3px);
            z-index: 3;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.5);
            border-color: rgba(255, 255, 255, 0.3);
        }

        .palette-item.active {
            border-color: #fff;
            transform: scale(1.05);
            box-shadow: 0 0 20px var(--primary-glow), 0 4px 12px rgba(0, 0, 0, 0.4);
            z-index: 2;
        }

        .palette-color {
            flex: 1;
            width: 100%;
        }

        .palette-color.shading {
            height: 50%;
        }

        .palette-color.skin {
            height: 50%;
        }

        .palette-indicator {
            position: absolute;
            inset: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            background: rgba(0, 0, 0, 0.5);
            color: #fff;
            font-size: 0.85rem;
            font-weight: 700;
            opacity: 0;
            transition: opacity 0.2s ease;
        }

        .palette-item:hover .palette-indicator,
        .palette-item.active .palette-indicator {
            opacity: 1;
        }

        .palette-item.active .palette-indicator {
            background: rgba(0, 0, 0, 0.2);
            font-size: 1rem;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.6);
        }

        /* Color info section */
        .color-info {
            margin-top: 1.25rem;
            background: rgba(4, 5, 10, 0.4);
            padding: 0.9rem 1.2rem;
            border-radius: 12px;
            font-size: 0.85rem;
            color: var(--text-muted);
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            border: 1px solid var(--panel-border);
        }

        .color-row {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .color-badge {
            display: inline-flex;
            align-items: center;
            gap: 0.4rem;
            font-family: monospace;
            color: var(--text-color);
            background: rgba(255, 255, 255, 0.05);
            padding: 0.2rem 0.5rem;
            border-radius: 6px;
            font-size: 0.85rem;
            border: 1px solid rgba(255, 255, 255, 0.05);
        }

        .color-badge-dot {
            width: 10px;
            height: 10px;
            border-radius: 50%;
            display: inline-block;
            border: 1px solid rgba(255, 255, 255, 0.2);
        }

        /* Custom selector styling */
        .custom-panel-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1rem;
        }

        .custom-toggle-container {
            display: flex;
            align-items: center;
            gap: 0.6rem;
            cursor: pointer;
        }

        /* Switch styling */
        .switch {
            position: relative;
            display: inline-block;
            width: 44px;
            height: 24px;
        }

        .switch input {
            opacity: 0;
            width: 0;
            height: 0;
        }

        .slider {
            position: absolute;
            cursor: pointer;
            inset: 0;
            background-color: rgba(255, 255, 255, 0.1);
            transition: .3s;
            border-radius: 24px;
            border: 1px solid var(--panel-border);
        }

        .slider:before {
            position: absolute;
            content: "";
            height: 16px;
            width: 16px;
            left: 3px;
            bottom: 3px;
            background-color: var(--text-color);
            transition: .3s;
            border-radius: 50%;
        }

        input:checked + .slider {
            background-color: var(--primary);
            border-color: rgba(99, 102, 241, 0.4);
        }

        input:checked + .slider:before {
            transform: translateX(20px);
        }

        .custom-pickers-container {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
            opacity: 0.4;
            pointer-events: none;
            transition: opacity 0.3s ease;
        }

        .custom-pickers-container.active {
            opacity: 1;
            pointer-events: all;
        }

        .picker-group {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
        }

        .picker-group label {
            font-size: 0.8rem;
            color: var(--text-muted);
            font-weight: 500;
        }

        .color-picker-wrapper {
            position: relative;
            height: 48px;
            background: rgba(4, 5, 10, 0.6);
            border-radius: 12px;
            border: 1px solid var(--panel-border);
            display: flex;
            align-items: center;
            padding: 0 0.8rem;
            gap: 0.8rem;
            cursor: pointer;
            transition: border-color 0.2s;
        }

        .color-picker-wrapper:hover {
            border-color: rgba(255, 255, 255, 0.15);
        }

        .color-picker-input {
            position: absolute;
            inset: 0;
            opacity: 0;
            width: 100%;
            height: 100%;
            cursor: pointer;
        }

        .color-picker-preview {
            width: 24px;
            height: 24px;
            border-radius: 50%;
            border: 1px solid rgba(255, 255, 255, 0.25);
            flex-shrink: 0;
        }

        .color-picker-hex {
            font-family: monospace;
            font-size: 0.85rem;
            color: var(--text-color);
        }

        .auto-shadow-container {
            margin-top: 1rem;
            display: flex;
            justify-content: flex-end;
        }

        .btn-small-link {
            background: transparent;
            border: none;
            color: #818cf8;
            font-size: 0.8rem;
            font-weight: 500;
            cursor: pointer;
            display: inline-flex;
            align-items: center;
            gap: 0.3rem;
            transition: color 0.2s;
        }

        .btn-small-link:hover {
            color: #a5b4fc;
            text-decoration: underline;
        }

        /* Customizer Tabs & Panel */
        .customizer-panel {
            padding: 1.5rem;
        }

        .customizer-tabs {
            display: flex;
            background: rgba(4, 5, 10, 0.6);
            border-radius: 14px;
            padding: 0.35rem;
            border: 1px solid var(--panel-border);
            gap: 0.35rem;
            margin-bottom: 1.25rem;
        }

        .tab-btn {
            flex: 1;
            background: transparent;
            border: none;
            padding: 0.75rem 0.5rem;
            border-radius: 10px;
            font-family: 'Outfit', sans-serif;
            font-size: 0.85rem;
            font-weight: 600;
            color: var(--text-muted);
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.4rem;
        }

        .tab-btn:hover {
            color: var(--text-color);
            background: rgba(255, 255, 255, 0.02);
        }

        .tab-btn.active {
            color: #fff;
            background: var(--primary);
            box-shadow: 0 4px 16px var(--primary-glow);
        }

        .tab-btn svg {
            width: 1.1rem;
            height: 1.1rem;
            fill: currentColor;
        }

        .tab-content {
            display: none;
            animation: tabFadeIn 0.3s ease-out;
        }

        .tab-content.active {
            display: block;
            display: flex;
            flex-direction: column;
            gap: 1.25rem;
        }

        @keyframes tabFadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
        }

        .sub-panel {
            width: 100%;
        }

        /* Facial selectors style */
        .facial-select-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.5rem;
        }

        .facial-select-btn {
            background: rgba(4, 5, 10, 0.4);
            border: 1px solid var(--panel-border);
            border-radius: 12px;
            padding: 0.5rem;
            cursor: pointer;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: space-between;
            height: 48px;
            gap: 0.2rem;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .facial-select-btn:hover {
            border-color: var(--panel-hover-border);
            background: rgba(255, 255, 255, 0.02);
            transform: translateY(-2px);
        }

        .facial-select-btn.active {
            border-color: var(--primary);
            background: rgba(99, 102, 241, 0.12);
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.15);
        }

        .facial-btn-label {
            font-size: 0.65rem;
            font-weight: 600;
            color: var(--text-muted);
            transition: color 0.2s;
        }

        .facial-select-btn.active .facial-btn-label {
            color: #818cf8;
        }

        .facial-btn-preview {
            width: 100%;
            height: 18px;
            pointer-events: none;
            overflow: visible;
        }

        .facial-btn-preview * {
            fill: var(--text-muted);
            transition: fill 0.2s, stroke 0.2s;
        }

        .facial-btn-preview .facial-cls-1 {
            fill: #ffffff !important;
        }

        .facial-btn-preview .facial-cls-2 {
            fill: none !important;
            stroke: var(--text-muted) !important;
            stroke-width: 1.17px;
            stroke-miterlimit: 10;
        }

        .facial-select-btn:hover .facial-btn-preview * {
            fill: var(--text-color);
        }
        .facial-select-btn:hover .facial-btn-preview .facial-cls-2 {
            stroke: var(--text-color) !important;
        }

        .facial-select-btn.active .facial-btn-preview * {
            fill: #818cf8;
        }
        
        .facial-select-btn.active .facial-btn-preview .facial-cls-2 {
            stroke: #818cf8 !important;
        }

        /* Download card buttons */
        .actions-card {
            display: flex;
            flex-direction: column;
            gap: 0.8rem;
        }

        .btn {
            background: var(--primary);
            color: #fff;
            border: none;
            padding: 1.1rem 1.5rem;
            border-radius: 14px;
            font-family: 'Outfit', sans-serif;
            font-size: 1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
            box-shadow: 0 4px 16px var(--primary-glow);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.6rem;
        }

        .btn:hover {
            background: var(--primary-hover);
            transform: translateY(-2px);
            box-shadow: 0 6px 22px var(--primary-glow);
        }

        .btn:active {
            transform: translateY(0);
        }

        .btn-outline {
            background: transparent;
            border: 1px solid rgba(255, 255, 255, 0.12);
            color: var(--text-color);
            box-shadow: none;
        }

        .btn-outline:hover {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(255, 255, 255, 0.25);
            transform: translateY(-2px);
            box-shadow: none;
        }

        .btn svg {
            width: 1.35rem;
            height: 1.35rem;
            fill: currentColor;
        }

        /* Footer info */
        footer {
            padding: 1.25rem 2rem;
            text-align: center;
            font-size: 0.8rem;
            color: var(--text-muted);
            border-top: 1px solid var(--panel-border);
            background: rgba(8, 10, 17, 0.6);
            backdrop-filter: blur(12px);
            z-index: 10;
        }

        /* Scrollbar styling */
        .controls-sidebar::-webkit-scrollbar {
            width: 6px;
        }

        .controls-sidebar::-webkit-scrollbar-track {
            background: transparent;
        }

        .controls-sidebar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 3px;
        }

        .controls-sidebar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.15);
        }

        /* Toast notifications */
        .toast {
            position: fixed;
            top: 2rem;
            right: 2rem;
            background: rgba(16, 22, 38, 0.95);
            border: 1px solid rgba(99, 102, 241, 0.4);
            border-radius: 14px;
            padding: 1.1rem 1.6rem;
            display: flex;
            align-items: center;
            gap: 0.8rem;
            box-shadow: 0 16px 40px rgba(0, 0, 0, 0.6);
            transform: translateY(-40px);
            opacity: 0;
            transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            z-index: 999;
            pointer-events: none;
        }

        .toast.show {
            transform: translateY(0);
            opacity: 1;
        }

        .toast-icon {
            color: #10b981;
        }

        .toast-icon svg {
            width: 1.35rem;
            height: 1.35rem;
            fill: currentColor;
        }

        .toast-content {
            font-size: 0.9rem;
            font-weight: 600;
        }

        /* Mobile adaptation */
        @media (max-width: 950px) {
            main {
                flex-direction: column;
                overflow-y: auto;
                height: auto;
                padding: 1rem;
            }
            .viewport-container {
                height: 480px;
                flex: none;
            }
            .controls-sidebar {
                overflow-y: visible;
            }
        }
    </style>
</head>
<body>

    <header>
        <div class="header-title-container">
            <h1 class="logo">Mee Character Creator <span>Dressing Up</span></h1>
            <p class="subtitle">Tùy biến tông màu da và các bộ phận khuôn mặt cho mô hình nhân vật nam và nữ</p>
        </div>
        <div>
            <div class="header-status">
                <span class="status-dot"></span>
                <span>Chế độ thiết kế</span>
            </div>
        </div>
    </header>

    <main>
        <!-- Left: Canvas Viewport -->
        <div class="viewport-container">
            <div class="viewport-canvas" id="viewportCanvas">
                <div class="ambient-glow" id="ambientGlow"></div>
                <div class="character-wrapper" id="characterWrapper">
                    <!-- SVG gets inserted here dynamically -->
                </div>
            </div>
            
            <!-- Canvas Camera Controls Overlay -->
            <div class="hud-controls">
                <button class="hud-btn" id="zoomInBtn" title="Phóng to">
                    <svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>
                </button>
                <button class="hud-btn" id="zoomOutBtn" title="Thu nhỏ">
                    <svg viewBox="0 0 24 24"><path d="M19 13H5v-2h14v2z"/></svg>
                </button>
                <button class="hud-btn" id="zoomResetBtn" title="Đặt lại góc nhìn">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H7c0-2.76 2.24-5 5-5s5 2.24 5 5c0 1.04-.42 1.99-1.07 2.75z"/></svg>
                </button>
            </div>
        </div>

        <!-- Right: Control Panel Sidebar -->
        <div class="controls-sidebar">
            
            <!-- Gender Selector -->
            <div class="control-card">
                <h2 class="card-title">
                    <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/></svg>
                    Giới tính (Gender)
                </h2>
                <div class="segmented-control">
                    <button class="segment-btn active" id="genderMaleBtn">
                        <svg viewBox="0 0 24 24"><path d="M9 9c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm12-3h-2.59l3.29-3.29-1.41-1.41L17 4.59V2h-2v6h6V6zm-9 8c-3.31 0-6 2.69-6 6h12c0-3.31-2.69-6-6-6z"/></svg>
                        Nam (Male)
                    </button>
                    <button class="segment-btn" id="genderFemaleBtn">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-12c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        Nữ (Female)
                    </button>
                </div>
            </div>

            <!-- Tab Selection Bar for Character Customization Features -->
            <div class="control-card customizer-panel">
                <div class="customizer-tabs">
                    <button class="tab-btn active" data-tab="skin-tone">
                        <svg viewBox="0 0 24 24"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.22 19.58 10.57 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
                        Màu da
                    </button>
                    <button class="tab-btn" data-tab="faces">
                        <svg viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                        Dáng mặt
                    </button>
                    <button class="tab-btn" data-tab="eyes">
                        <svg viewBox="0 0 24 24"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                        Mắt
                    </button>
                    <button class="tab-btn" data-tab="eyebrows">
                        <svg viewBox="0 0 24 24"><path d="M12 2c-.96 0-1.88.4-2.53 1.1L3.11 9.47c-.72.76-.68 1.98.08 2.7.76.72 1.98.68 2.7-.08l6.11-6.47 6.11 6.47c.72.76 1.94.8 2.7.08.76-.72.8-1.94.08-2.7l-6.36-6.37C13.88 2.4 12.96 2 12 2z"/></svg>
                        Lông mày
                    </button>
                    <button class="tab-btn" data-tab="noses">
                        <svg viewBox="0 0 24 24"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                        Mũi
                    </button>
                    <button class="tab-btn" data-tab="mouths">
                        <svg viewBox="0 0 24 24"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6c0 2.76 2.24 5 5 5s5-2.24 5-5H7z"/></svg>
                        Miệng
                    </button>
                </div>

                <!-- Tab 1: Skin Tone Content -->
                <div class="tab-content active" id="tab-skin-tone">
                    <!-- Skin Tone Palette (Presets) -->
                    <div class="sub-panel">
                        <h3 class="card-title" style="font-size: 1rem; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--primary)"><path d="M12 3c-4.97 0-9 4.03-9 9 0 2.12.74 4.07 1.97 5.61L4.35 19.4c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0l1.9-1.9C9.22 19.58 10.57 20 12 20c4.97 0 9-4.03 9-9s-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/></svg>
                            Bảng màu da mẫu (Preset Palette)
                        </h3>
                        <div class="palette-grid" id="paletteGrid">
                            <!-- Palette items will be generated dynamically -->
                        </div>
                        
                        <div class="color-info" id="colorInfo">
                            <div class="color-row">
                                <span>Đang chọn mẫu:</span>
                                <strong style="color: var(--text-color);" id="activeSkinLabel">Mẫu #1</strong>
                            </div>
                            <div class="color-row">
                                <span>Màu da chính (Skin):</span>
                                <span class="color-badge" id="hexSkinLabel">
                                    <span class="color-badge-dot" id="skinBadgeDot"></span>
                                    <span>#ffffff</span>
                                </span>
                            </div>
                            <div class="color-row">
                                <span>Màu bóng (Shading):</span>
                                <span class="color-badge" id="hexShadingLabel">
                                    <span class="color-badge-dot" id="shadingBadgeDot"></span>
                                    <span>#ffffff</span>
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- Custom Skin Tone Selector -->
                    <div class="sub-panel" style="border-top: 1px solid var(--panel-border); padding-top: 1.25rem; margin-top: 0.25rem;">
                        <div class="custom-panel-header">
                            <h3 class="card-title" style="font-size: 1rem; margin-bottom: 0; display: flex; align-items: center; gap: 0.5rem;">
                                <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--primary)"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
                                Tự chọn màu da (Custom Color)
                            </h3>
                            <label class="custom-toggle-container">
                                <span class="switch">
                                    <input type="checkbox" id="customModeToggle">
                                    <span class="slider"></span>
                                </span>
                            </label>
                        </div>

                        <div class="custom-pickers-container" id="customPickersContainer" style="margin-top: 0.8rem;">
                            <div class="picker-group">
                                <label>Màu da chính</label>
                                <div class="color-picker-wrapper">
                                    <input type="color" class="color-picker-input" id="customSkinPicker" value="#ffe7e6">
                                    <div class="color-picker-preview" id="customSkinPreview" style="background-color: #ffe7e6;"></div>
                                    <span class="color-picker-hex" id="customSkinHex">#ffe7e6</span>
                                </div>
                            </div>

                            <div class="picker-group">
                                <label>Màu bóng da</label>
                                <div class="color-picker-wrapper">
                                    <input type="color" class="color-picker-input" id="customShadingPicker" value="#ffcccc">
                                    <div class="color-picker-preview" id="customShadingPreview" style="background-color: #ffcccc;"></div>
                                    <span class="color-picker-hex" id="customShadingHex">#ffcccc</span>
                                </div>
                            </div>
                        </div>

                        <div class="auto-shadow-container">
                            <button class="btn-small-link" id="autoShadowBtn" title="Tự động tạo màu bóng da phù hợp dựa trên màu da chính">
                                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor"><path d="M19.07 4.93l-1.41 1.41C19.1 7.79 20 9.79 20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8c0-2.21.9-4.21 2.34-5.66L4.93 4.93C3.12 6.74 2 9.24 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-2.76-1.12-5.26-2.93-7.07zM12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6z"/></svg>
                                Tự động tính màu bóng
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Tab 1.5: Faces Content -->
                <div class="tab-content" id="tab-faces">
                    <h3 class="card-title" style="font-size: 1rem; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--primary)"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/></svg>
                        Chọn dáng khuôn mặt (Face Shape)
                    </h3>
                    <div class="facial-select-grid" id="facesGrid">
                        <!-- Face buttons will be generated dynamically -->
                    </div>
                </div>

                <!-- Tab 2: Eyes Content -->
                <div class="tab-content" id="tab-eyes">
                    <h3 class="card-title" style="font-size: 1rem; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--primary)"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                        Chọn kiểu mắt (Eyes Style)
                    </h3>
                    <div class="facial-select-grid" id="eyesGrid">
                        <!-- Eye buttons will be generated dynamically -->
                    </div>
                </div>

                <!-- Tab 3: Eyebrows Content -->
                <div class="tab-content" id="tab-eyebrows">
                    <h3 class="card-title" style="font-size: 1rem; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--primary)"><path d="M12 2c-.96 0-1.88.4-2.53 1.1L3.11 9.47c-.72.76-.68 1.98.08 2.7.76.72 1.98.68 2.7-.08l6.11-6.47 6.11 6.47c.72.76 1.94.8 2.7.08.76-.72.8-1.94.08-2.7l-6.36-6.37C13.88 2.4 12.96 2 12 2z"/></svg>
                        Chọn kiểu lông mày (Eyebrows Style)
                    </h3>
                    <div class="facial-select-grid" id="eyebrowsGrid">
                        <!-- Eyebrow buttons will be generated dynamically -->
                    </div>
                </div>

                <!-- Tab 4: Noses Content -->
                <div class="tab-content" id="tab-noses">
                    <h3 class="card-title" style="font-size: 1rem; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--primary)"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>
                        Chọn kiểu mũi (Nose Style)
                    </h3>
                    <div class="facial-select-grid" id="nosesGrid">
                        <!-- Nose buttons will be generated dynamically -->
                    </div>
                </div>

                <!-- Tab 5: Mouths Content -->
                <div class="tab-content" id="tab-mouths">
                    <h3 class="card-title" style="font-size: 1rem; margin-bottom: 0.8rem; display: flex; align-items: center; gap: 0.5rem;">
                        <svg viewBox="0 0 24 24" width="16" height="16" fill="var(--primary)"><path d="M12 2c-5.52 0-10 4.48-10 10s4.48 10 10 10 10-4.48 10-10-4.48-10-10-10zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-6c0 2.76 2.24 5 5 5s5-2.24 5-5H7z"/></svg>
                        Chọn kiểu miệng (Mouth Style)
                    </h3>
                    <div class="facial-select-grid" id="mouthsGrid">
                        <!-- Mouth buttons will be generated dynamically -->
                    </div>
                </div>
            </div>

            <!-- Download & Save Actions -->
            <div class="control-card actions-card">
                <button class="btn" id="downloadBtn">
                    <svg viewBox="0 0 24 24"><path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/></svg>
                    Tải về file SVG
                </button>
                <button class="btn btn-outline" id="downloadPngBtn">
                    <svg viewBox="0 0 24 24" width="24" height="24"><path d="M5 4h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm0 2v8.59l3.29-3.29a1 1 0 0 1 1.41 0l3.8 3.8 2.29-2.29a1 1 0 0 1 1.41 0L19 15.59V6H5zm0 12h14v-1.59l-3.29-3.29-2.29 2.29a1 1 0 0 1-1.41 0l-3.8-3.8L5 13.59V18zm10-7a1.5 1.5 0 1 1 0-3 1.5 1.5 0 0 1 0 3z"/></svg>
                    Tải về file ảnh PNG
                </button>
                <button class="btn btn-outline" id="resetBtn">
                    Đặt lại mặc định
                </button>
            </div>
            
        </div>
    </main>

    <footer>
        Mee Character Design &copy; 2026. Một thiết kế trò chơi tự chọn màu da khép chỉnh hoàn chỉnh.
    </footer>

    <!-- Toast Notification -->
    <div class="toast" id="toast">
        <div class="toast-icon">
            <svg viewBox="0 0 24 24"><path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/></svg>
        </div>
        <div class="toast-content" id="toastContent">Đã tải về thành công!</div>
    </div>

    <!-- Hidden Canvas for PNG render -->
    <canvas id="renderCanvas" style="display: none;"></canvas>

    <!-- JS database compiled from local files -->
    <script>
        const SVG_DATABASE = %s;
        const FACIAL_DATABASE = %s;
        
        // Color palette database directly extracted from image
        const PALETTE_DATA = [
            { id: 1, shading: "#ffcccc", skin: "#ffe7e6" },
            { id: 2, shading: "#ffc7b3", skin: "#ffe3d7" },
            { id: 3, shading: "#f4b28e", skin: "#ffd6ab" },
            { id: 4, shading: "#ea976e", skin: "#ffb98a" },
            { id: 5, shading: "#ea8c88", skin: "#ffb7b3" },
            { id: 6, shading: "#c6584f", skin: "#de816e" },
            { id: 7, shading: "#8e3b35", skin: "#ac584b" },
            { id: 8, shading: "#4f1f1f", skin: "#663531" },
            { id: 9, shading: "#9bb3c9", skin: "#c3cfdf" },
            { id: 10, shading: "#a89e74", skin: "#c4be9c" }
        ];

        // Synthesize Sound Effects using Web Audio API
        let audioCtx = null;
        function playSound(type) {
            try {
                if (!audioCtx) {
                    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
                }
                if (audioCtx.state === 'suspended') {
                    audioCtx.resume();
                }
                
                const now = audioCtx.currentTime;
                
                if (type === 'click') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'triangle';
                    osc.frequency.setValueAtTime(500, now);
                    osc.frequency.exponentialRampToValueAtTime(100, now + 0.08);
                    gain.gain.setValueAtTime(0.12, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now);
                    osc.stop(now + 0.08);
                } 
                else if (type === 'select') {
                    const osc = audioCtx.createOscillator();
                    const gain = audioCtx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(350, now);
                    osc.frequency.exponentialRampToValueAtTime(550, now + 0.12);
                    gain.gain.setValueAtTime(0.08, now);
                    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
                    osc.connect(gain);
                    gain.connect(audioCtx.destination);
                    osc.start(now);
                    osc.stop(now + 0.12);
                }
                else if (type === 'download') {
                    const notes = [261.63, 329.63, 392.00, 523.25]; // C Major
                    notes.forEach((freq, idx) => {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'sine';
                        osc.frequency.setValueAtTime(freq, now + idx * 0.07);
                        gain.gain.setValueAtTime(0.08, now + idx * 0.07);
                        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.07 + 0.2);
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.start(now + idx * 0.07);
                        osc.stop(now + idx * 0.07 + 0.2);
                    });
                }
            } catch (e) {
                console.log("Audio API blocked or not supported: ", e);
            }
        }

        // Color Math Helper: Lerp hex colors
        function lerpColor(color1, color2, factor) {
            const r1 = parseInt(color1.substring(1, 3), 16);
            const g1 = parseInt(color1.substring(3, 5), 16);
            const b1 = parseInt(color1.substring(5, 7), 16);

            const r2 = parseInt(color2.substring(1, 3), 16);
            const g2 = parseInt(color2.substring(3, 5), 16);
            const b2 = parseInt(color2.substring(5, 7), 16);

            const r = Math.round(r1 + factor * (r2 - r1));
            const g = Math.round(g1 + factor * (g2 - g1));
            const b = Math.round(b1 + factor * (b2 - b1));

            return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
        }

        // Auto shadow generator based on skin color HSL darkening
        function autoShadow(hexColor) {
            let r = parseInt(hexColor.substring(1, 3), 16) / 255;
            let g = parseInt(hexColor.substring(3, 5), 16) / 255;
            let b = parseInt(hexColor.substring(5, 7), 16) / 255;
            
            let max = Math.max(r, g, b), min = Math.min(r, g, b);
            let h, s, l = (max + min) / 2;
            
            if (max === min) {
                h = s = 0;
            } else {
                let d = max - min;
                s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
                switch (max) {
                    case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                    case g: h = (b - r) / d + 2; break;
                    case b: h = (r - g) / d + 4; break;
                }
                h /= 6;
            }
            
            // Darken L by 12% (limit to min 8%)
            l = Math.max(0.08, l - 0.12);
            // Slightly saturate shadow by 5% to look warmer
            s = Math.min(1.0, s + 0.05);
            
            let rOut, gOut, bOut;
            if (s === 0) {
                rOut = gOut = bOut = l;
            } else {
                function hue2rgb(p, q, t) {
                    if (t < 0) t += 1;
                    if (t > 1) t -= 1;
                    if (t < 1/6) return p + (q - p) * 6 * t;
                    if (t < 1/2) return q;
                    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
                    return p;
                }
                let q = l < 0.5 ? l * (1 + s) : l + s - l * s;
                let p = 2 * l - q;
                rOut = hue2rgb(p, q, h + 1/3);
                gOut = hue2rgb(p, q, h);
                bOut = hue2rgb(p, q, h - 1/3);
            }
            
            const rHex = Math.round(rOut * 255).toString(16).padStart(2, '0');
            const gHex = Math.round(gOut * 255).toString(16).padStart(2, '0');
            const bHex = Math.round(bOut * 255).toString(16).padStart(2, '0');
            return `#${rHex}${gHex}${bHex}`;
        }

        // State variables
        let state = {
            gender: "male", // male or female
            skinToneIndex: 1, // 1 to 10
            customMode: false,
            customSkin: "#ffe7e6",
            customShading: "#ffcccc",
            faceIndex: 1, // 1 to 6
            eyeIndex: 1, // 1 to 11
            eyebrowIndex: 1, // 1 to 7
            noseIndex: 1, // 1 to 7
            mouthIndex: 1 // 1 to 13
        };

        // UI References
        const characterWrapper = document.getElementById("characterWrapper");
        const ambientGlow = document.getElementById("ambientGlow");
        const paletteGrid = document.getElementById("paletteGrid");
        const activeSkinLabel = document.getElementById("activeSkinLabel");
        const hexSkinLabel = document.getElementById("hexSkinLabel").querySelector("span:last-child");
        const hexShadingLabel = document.getElementById("hexShadingLabel").querySelector("span:last-child");
        const skinBadgeDot = document.getElementById("skinBadgeDot");
        const shadingBadgeDot = document.getElementById("shadingBadgeDot");
        
        // Custom pickers DOM
        const customModeToggle = document.getElementById("customModeToggle");
        const customPickersContainer = document.getElementById("customPickersContainer");
        const customSkinPicker = document.getElementById("customSkinPicker");
        const customShadingPicker = document.getElementById("customShadingPicker");
        const customSkinPreview = document.getElementById("customSkinPreview");
        const customShadingPreview = document.getElementById("customShadingPreview");
        const customSkinHex = document.getElementById("customSkinHex");
        const customShadingHex = document.getElementById("customShadingHex");
        const autoShadowBtn = document.getElementById("autoShadowBtn");

        // Facial grids DOM
        const facesGrid = document.getElementById("facesGrid");
        const eyesGrid = document.getElementById("eyesGrid");
        const eyebrowsGrid = document.getElementById("eyebrowsGrid");
        const nosesGrid = document.getElementById("nosesGrid");
        const mouthsGrid = document.getElementById("mouthsGrid");

        // Buttons
        const maleBtn = document.getElementById("genderMaleBtn");
        const femaleBtn = document.getElementById("genderFemaleBtn");
        const downloadBtn = document.getElementById("downloadBtn");
        const downloadPngBtn = document.getElementById("downloadPngBtn");
        const resetBtn = document.getElementById("resetBtn");
        
        // Camera Variables
        const viewportCanvas = document.getElementById("viewportCanvas");
        let zoom = 1.0;
        let panX = 0;
        let panY = 0;
        let isDragging = false;
        let startX, startY;

        // Initialize state from localStorage if available
        function loadState() {
            const savedState = localStorage.getItem("mee_dressing_facial_state");
            if (savedState) {
                try {
                    const parsed = JSON.parse(savedState);
                    if (["male", "female"].includes(parsed.gender)) state.gender = parsed.gender;
                    if (parsed.skinToneIndex >= 1 && parsed.skinToneIndex <= 10) state.skinToneIndex = parsed.skinToneIndex;
                    if (typeof parsed.customMode === 'boolean') state.customMode = parsed.customMode;
                    if (parsed.customSkin) state.customSkin = parsed.customSkin;
                    if (parsed.customShading) state.customShading = parsed.customShading;
                    if (parsed.faceIndex >= 1 && parsed.faceIndex <= 6) state.faceIndex = parsed.faceIndex;
                    if (parsed.eyeIndex >= 1 && parsed.eyeIndex <= 11) state.eyeIndex = parsed.eyeIndex;
                    if (parsed.eyebrowIndex >= 1 && parsed.eyebrowIndex <= 7) state.eyebrowIndex = parsed.eyebrowIndex;
                    if (parsed.noseIndex >= 1 && parsed.noseIndex <= 7) state.noseIndex = parsed.noseIndex;
                    if (parsed.mouthIndex >= 1 && parsed.mouthIndex <= 13) state.mouthIndex = parsed.mouthIndex;
                } catch(e) {}
            }
            buildFacialUI();
            updateUI();
        }

        function saveState() {
            localStorage.setItem("mee_dressing_facial_state", JSON.stringify(state));
        }

        // Inject component transfer filter for ear shading
        function updateEarFilter(svgElement, skinColor, shadingColor) {
            let defs = svgElement.querySelector("defs");
            if (!defs) {
                defs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                svgElement.insertBefore(defs, svgElement.firstChild);
            }

            let filter = defs.querySelector("#custom-ear-filter");
            if (!filter) {
                filter = document.createElementNS("http://www.w3.org/2000/svg", "filter");
                filter.setAttribute("id", "custom-ear-filter");
                
                const feGray = document.createElementNS("http://www.w3.org/2000/svg", "feColorMatrix");
                feGray.setAttribute("type", "matrix");
                feGray.setAttribute("values", "0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0.2126 0.7152 0.0722 0 0  0 0 0 1 0");
                feGray.setAttribute("result", "gray");
                filter.appendChild(feGray);
                
                const feTransfer = document.createElementNS("http://www.w3.org/2000/svg", "feComponentTransfer");
                feTransfer.setAttribute("in", "gray");
                
                const feFuncR = document.createElementNS("http://www.w3.org/2000/svg", "feFuncR");
                feFuncR.setAttribute("type", "linear");
                feFuncR.setAttribute("id", "custom-ear-funcR");
                feTransfer.appendChild(feFuncR);
                
                const feFuncG = document.createElementNS("http://www.w3.org/2000/svg", "feFuncG");
                feFuncG.setAttribute("type", "linear");
                feFuncG.setAttribute("id", "custom-ear-funcG");
                feTransfer.appendChild(feFuncG);
                
                const feFuncB = document.createElementNS("http://www.w3.org/2000/svg", "feFuncB");
                feFuncB.setAttribute("type", "linear");
                feFuncB.setAttribute("id", "custom-ear-funcB");
                feTransfer.appendChild(feFuncB);
                
                filter.appendChild(feTransfer);
                defs.appendChild(filter);
            }

            const funcR = filter.querySelector("#custom-ear-funcR");
            const funcG = filter.querySelector("#custom-ear-funcG");
            const funcB = filter.querySelector("#custom-ear-funcB");

            if (funcR && funcG && funcB) {
                const r_skin = parseInt(skinColor.substring(1, 3), 16) / 255;
                const g_skin = parseInt(skinColor.substring(3, 5), 16) / 255;
                const b_skin = parseInt(skinColor.substring(5, 7), 16) / 255;

                const r_shadow = parseInt(shadingColor.substring(1, 3), 16) / 255;
                const g_shadow = parseInt(shadingColor.substring(3, 5), 16) / 255;
                const b_shadow = parseInt(shadingColor.substring(5, 7), 16) / 255;

                // component transfer: output = (skin - shadow) * gray + shadow
                funcR.setAttribute("slope", r_skin - r_shadow);
                funcR.setAttribute("intercept", r_shadow);
                
                funcG.setAttribute("slope", g_skin - g_shadow);
                funcG.setAttribute("intercept", g_shadow);
                
                funcB.setAttribute("slope", b_skin - b_shadow);
                funcB.setAttribute("intercept", b_shadow);
            }
        }

        // Apply custom colors onto base SVG elements dynamically
        function applyCustomColorsToSVG(svgElement) {
            const skinColor = state.customSkin;
            const shadingColor = state.customShading;

            // 1. Update fills for cls-6 (skin) and cls-7 (shadow)
            svgElement.querySelectorAll(".cls-6").forEach(el => el.style.fill = skinColor);
            svgElement.querySelectorAll(".cls-7").forEach(el => el.style.fill = shadingColor);

            // 2. Interpolate linear-gradient for legs/body shading transition
            const linearGrad = svgElement.querySelector("#linear-gradient");
            if (linearGrad) {
                const stops = linearGrad.querySelectorAll("stop");
                if (stops.length >= 5) {
                    stops[0].setAttribute("stop-color", skinColor);
                    stops[1].setAttribute("stop-color", lerpColor(skinColor, shadingColor, 0.59));
                    stops[2].setAttribute("stop-color", lerpColor(skinColor, shadingColor, 0.8));
                    stops[3].setAttribute("stop-color", lerpColor(skinColor, shadingColor, 0.95));
                    stops[4].setAttribute("stop-color", shadingColor);
                }
            }

            // 3. Update all stop-colors in linear-gradient-3 to shadingColor
            const linearGrad3 = svgElement.querySelector("#linear-gradient-3");
            if (linearGrad3) {
                linearGrad3.querySelectorAll("stop").forEach(stop => {
                    stop.setAttribute("stop-color", shadingColor);
                });
            }
        }

        // Update active SVG model display
        function updateCharacter() {
            let svgContent = "";
            
            if (state.customMode) {
                svgContent = SVG_DATABASE["base"][state.gender];
            } else {
                svgContent = SVG_DATABASE["presets"][state.gender][state.skinToneIndex];
            }
            
            if (svgContent) {
                // Parse to SVG element DOM
                const parser = new DOMParser();
                const doc = parser.parseFromString(svgContent, "image/svg+xml");
                const svgElement = doc.documentElement;
                
                // Determine active skin and shading colors
                let skinColor = "#ffe7e6";
                let shadingColor = "#ffcccc";
                if (state.customMode) {
                    skinColor = state.customSkin;
                    shadingColor = state.customShading;
                } else {
                    const activeColor = PALETTE_DATA[state.skinToneIndex - 1];
                    if (activeColor) {
                        skinColor = activeColor.skin;
                        shadingColor = activeColor.shading;
                    }
                }

                // Set CSS variables on the SVG element so CSS styles can access them
                svgElement.style.setProperty('--skin-color', skinColor);
                svgElement.style.setProperty('--shading-color', shadingColor);
                
                // Always ensure ear filter is present and configured
                updateEarFilter(svgElement, skinColor, shadingColor);

                // Colorize vector parts and ears if custom mode is enabled
                if (state.customMode) {
                    applyCustomColorsToSVG(svgElement);
                }

                // 1. Inject Face Shape (which includes ears)
                if (state.faceIndex > 0) {
                    const faceSvgStr = SVG_DATABASE.faces[state.faceIndex];
                    if (faceSvgStr) {
                        const faceDoc = parser.parseFromString(faceSvgStr, "image/svg+xml");
                        const faceGroup = faceDoc.getElementById("Layer_2").cloneNode(true);
                        faceGroup.setAttribute("id", "custom-face");
                        
                        // Copy defs patterns/images to main SVG
                        const faceDefs = faceDoc.querySelector("defs");
                        if (faceDefs) {
                            let mainDefs = svgElement.querySelector("defs");
                            if (!mainDefs) {
                                mainDefs = document.createElementNS("http://www.w3.org/2000/svg", "defs");
                                svgElement.insertBefore(mainDefs, svgElement.firstChild);
                            }
                            faceDefs.childNodes.forEach(child => {
                                if (child.nodeType === 1) {
                                    const id = child.getAttribute("id");
                                    if (!id || !mainDefs.querySelector(`#${id}`)) {
                                        mainDefs.appendChild(child.cloneNode(true));
                                    }
                                }
                            });
                        }
                        
                        // Colorize the face path (Child 4)
                        let headPath = faceGroup.querySelector("path[fill='#FFE7E6']") || 
                                       faceGroup.querySelector("path[fill='#ffe7e6']");
                        if (!headPath) {
                            const paths = faceGroup.querySelectorAll("path");
                            for (let p of paths) {
                                const fillAttr = p.getAttribute("fill");
                                if (fillAttr && fillAttr.toUpperCase() === "#FFE7E6") {
                                    headPath = p;
                                    break;
                                }
                            }
                        }
                        if (headPath) {
                            headPath.style.fill = skinColor;
                        }
                        
                        // Apply ear filter to images in face group
                        faceGroup.querySelectorAll("image").forEach(img => {
                            img.setAttribute("filter", "url(#custom-ear-filter)");
                        });
                        
                        // Insert face group and remove old head/ears
                        const head = svgElement.querySelector("ellipse.cls-6");
                        if (head) {
                            head.parentNode.insertBefore(faceGroup, head);
                            head.remove();
                            const rightEar = svgElement.querySelector(".cls-2");
                            if (rightEar) rightEar.remove();
                            const leftEar = svgElement.querySelector(".cls-4");
                            if (leftEar) leftEar.remove();
                        }
                    }
                }

                // Head coordinates for features placement (always center on 90.32, 66.73)
                const cx = 90.32;
                const cy = 66.73;

                // 2. Inject Eyebrows
                if (state.eyebrowIndex > 0) {
                    const eyebrowItem = FACIAL_DATABASE.eyebrows[state.eyebrowIndex - 1];
                    const eyebrowsGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    eyebrowsGroup.setAttribute("id", "custom-eyebrows");
                    
                    const dx = cx - eyebrowItem.x_center;
                    const dy = (cy + 2.48) - eyebrowItem.y_center;
                    eyebrowsGroup.setAttribute("transform", `translate(${dx}, ${dy})`);
                    eyebrowsGroup.innerHTML = eyebrowItem.left.join("") + eyebrowItem.right.join("");
                    
                    const faceEl = svgElement.querySelector("#custom-face");
                    if (faceEl) {
                        faceEl.insertAdjacentElement('afterend', eyebrowsGroup);
                    } else {
                        const firstGroup = svgElement.querySelector("g#Layer_1-2") || svgElement;
                        firstGroup.appendChild(eyebrowsGroup);
                    }
                }
                
                // 3. Inject Eyes
                if (state.eyeIndex > 0) {
                    const eyeItem = FACIAL_DATABASE.eyes[state.eyeIndex - 1];
                    const eyesGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    eyesGroup.setAttribute("id", "custom-eyes");
                    
                    const dx = cx - eyeItem.x_center;
                    const dy = (cy + 20.64) - eyeItem.y_center;
                    eyesGroup.setAttribute("transform", `translate(${dx}, ${dy})`);
                    eyesGroup.innerHTML = eyeItem.left.join("") + eyeItem.right.join("");
                    
                    const eyebrowsEl = svgElement.querySelector("#custom-eyebrows");
                    if (eyebrowsEl) {
                        eyebrowsEl.insertAdjacentElement('afterend', eyesGroup);
                    } else {
                        const faceEl = svgElement.querySelector("#custom-face");
                        if (faceEl) {
                            faceEl.insertAdjacentElement('afterend', eyesGroup);
                        } else {
                            const firstGroup = svgElement.querySelector("g#Layer_1-2") || svgElement;
                            firstGroup.appendChild(eyesGroup);
                        }
                    }
                }

                // 4. Inject Nose
                if (state.noseIndex > 0) {
                    const noseItem = FACIAL_DATABASE.noses[state.noseIndex - 1];
                    const noseGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    noseGroup.setAttribute("id", "custom-nose");
                    
                    const dx = cx - noseItem.x_center;
                    const dy = (cy + 34.72) - noseItem.y_center;
                    noseGroup.setAttribute("transform", `translate(${dx}, ${dy})`);
                    noseGroup.innerHTML = noseItem.left.join("") + noseItem.right.join("");
                    
                    const eyesEl = svgElement.querySelector("#custom-eyes");
                    if (eyesEl) {
                        eyesEl.insertAdjacentElement('afterend', noseGroup);
                    } else {
                        const eyebrowsEl = svgElement.querySelector("#custom-eyebrows");
                        if (eyebrowsEl) {
                            eyebrowsEl.insertAdjacentElement('afterend', noseGroup);
                        } else {
                            const faceEl = svgElement.querySelector("#custom-face");
                            if (faceEl) {
                                faceEl.insertAdjacentElement('afterend', noseGroup);
                            }
                        }
                    }
                }

                // 5. Inject Mouth
                if (state.mouthIndex > 0) {
                    const mouthItem = FACIAL_DATABASE.mouths[state.mouthIndex - 1];
                    const mouthGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
                    mouthGroup.setAttribute("id", "custom-mouth");
                    
                    const dx = cx - mouthItem.x_center;
                    const dy = (cy + 45.43) - mouthItem.y_center;
                    mouthGroup.setAttribute("transform", `translate(${dx}, ${dy})`);
                    mouthGroup.innerHTML = mouthItem.left.join("") + mouthItem.right.join("");
                    
                    const noseEl = svgElement.querySelector("#custom-nose");
                    if (noseEl) {
                        noseEl.insertAdjacentElement('afterend', mouthGroup);
                    } else {
                        const eyesEl = svgElement.querySelector("#custom-eyes");
                        if (eyesEl) {
                            eyesEl.insertAdjacentElement('afterend', mouthGroup);
                        } else {
                            const eyebrowsEl = svgElement.querySelector("#custom-eyebrows");
                            if (eyebrowsEl) {
                                eyebrowsEl.insertAdjacentElement('afterend', mouthGroup);
                            } else {
                                const faceEl = svgElement.querySelector("#custom-face");
                                if (faceEl) {
                                    faceEl.insertAdjacentElement('afterend', mouthGroup);
                                }
                            }
                        }
                    }
                }

                // Write SVG back into DOM
                characterWrapper.innerHTML = "";
                characterWrapper.appendChild(svgElement);
            } else {
                characterWrapper.innerHTML = "<p style='color: red; padding: 2rem;'>Lỗi: Không tìm thấy tệp SVG</p>";
            }

            // Update dynamic ambient glow color behind character
            const activeSkinColor = state.customMode ? state.customSkin : PALETTE_DATA[state.skinToneIndex - 1].skin;
            document.documentElement.style.setProperty('--skin-glow-color', activeSkinColor + "25");
        }

        // Draw and update Palette UI grid
        function buildPaletteUI() {
            paletteGrid.innerHTML = "";
            PALETTE_DATA.forEach(item => {
                const button = document.createElement("div");
                button.className = "palette-item";
                
                if (!state.customMode && item.id === state.skinToneIndex) {
                    button.classList.add("active");
                }
                
                button.dataset.id = item.id;
                button.title = `Tông màu da #${item.id}`;

                const shadingDiv = document.createElement("div");
                shadingDiv.className = "palette-color shading";
                shadingDiv.style.backgroundColor = item.shading;

                const skinDiv = document.createElement("div");
                skinDiv.className = "palette-color skin";
                skinDiv.style.backgroundColor = item.skin;

                const indicator = document.createElement("div");
                indicator.className = "palette-indicator";
                indicator.innerText = `#${item.id}`;

                button.appendChild(shadingDiv);
                button.appendChild(skinDiv);
                button.appendChild(indicator);

                button.addEventListener("click", () => {
                    state.customMode = false;
                    state.skinToneIndex = item.id;
                    
                    state.customSkin = item.skin;
                    state.customShading = item.shading;
                    
                    playSound('select');
                    updateUI();
                    saveState();
                });

                paletteGrid.appendChild(button);
            });

            if (state.customMode) {
                activeSkinLabel.innerText = "Tự chọn (Custom)";
                hexSkinLabel.innerText = state.customSkin;
                skinBadgeDot.style.backgroundColor = state.customSkin;
                hexShadingLabel.innerText = state.customShading;
                shadingBadgeDot.style.backgroundColor = state.customShading;
            } else {
                const activeColor = PALETTE_DATA[state.skinToneIndex - 1];
                activeSkinLabel.innerText = `Mẫu #${activeColor.id}`;
                hexSkinLabel.innerText = activeColor.skin.toUpperCase();
                skinBadgeDot.style.backgroundColor = activeColor.skin;
                hexShadingLabel.innerText = activeColor.shading.toUpperCase();
                shadingBadgeDot.style.backgroundColor = activeColor.shading;
            }
        }

        // Build facial eyebrows/eyes grids with preview SVGs
        function buildFacialUI() {
            // 1. Eyebrows selection grid
            eyebrowsGrid.innerHTML = "";
            FACIAL_DATABASE.eyebrows.forEach(item => {
                const btn = document.createElement("button");
                btn.className = "facial-select-btn";
                if (item.id === state.eyebrowIndex) {
                    btn.classList.add("active");
                }
                
                // Eyebrow preview aligned at center Y (svg height 18, so center is 9)
                const dy = 9 - item.y_center;
                btn.innerHTML = `
                    <span class="facial-btn-label">Kiểu #${item.id}</span>
                    <svg viewBox="0 0 76.02 18" class="facial-btn-preview">
                        <g transform="translate(0, ${dy})">
                            ${item.left.join("")} ${item.right.join("")}
                        </g>
                    </svg>
                `;
                
                btn.addEventListener("click", () => {
                    if (state.eyebrowIndex !== item.id) {
                        state.eyebrowIndex = item.id;
                        playSound('click');
                        syncFacialActiveState(eyebrowsGrid, item.id);
                        updateCharacter();
                        saveState();
                    }
                });
                eyebrowsGrid.appendChild(btn);
            });

            // 2. Eyes selection grid
            eyesGrid.innerHTML = "";
            FACIAL_DATABASE.eyes.forEach(item => {
                const btn = document.createElement("button");
                btn.className = "facial-select-btn";
                if (item.id === state.eyeIndex) {
                    btn.classList.add("active");
                }
                
                // Eye preview aligned at center Y (svg height 22, so center is 11)
                const dy = 11 - item.y_center;
                btn.innerHTML = `
                    <span class="facial-btn-label">Kiểu #${item.id}</span>
                    <svg viewBox="0 0 76.04 22" class="facial-btn-preview">
                        <g transform="translate(0, ${dy})">
                            ${item.left.join("")} ${item.right.join("")}
                        </g>
                    </svg>
                `;
                
                btn.addEventListener("click", () => {
                    if (state.eyeIndex !== item.id) {
                        state.eyeIndex = item.id;
                        playSound('click');
                        syncFacialActiveState(eyesGrid, item.id);
                        updateCharacter();
                        saveState();
                    }
                });
                eyesGrid.appendChild(btn);
            });

            // 3. Faces selection grid
            facesGrid.innerHTML = "";
            for (let i = 1; i <= 6; i++) {
                const faceSvgStr = SVG_DATABASE.faces[i];
                if (!faceSvgStr) continue;
                
                const btn = document.createElement("button");
                btn.className = "facial-select-btn";
                if (i === state.faceIndex) {
                    btn.classList.add("active");
                }
                
                const parser = new DOMParser();
                const faceDoc = parser.parseFromString(faceSvgStr, "image/svg+xml");
                const svgEl = faceDoc.documentElement;
                
                svgEl.removeAttribute("width");
                svgEl.removeAttribute("height");
                svgEl.setAttribute("class", "facial-btn-preview");
                
                let headPath = svgEl.querySelector("path[fill='#FFE7E6']") || 
                               svgEl.querySelector("path[fill='#ffe7e6']");
                if (!headPath) {
                    const paths = svgEl.querySelectorAll("path");
                    for (let p of paths) {
                        const fillAttr = p.getAttribute("fill");
                        if (fillAttr && fillAttr.toUpperCase() === "#FFE7E6") {
                            headPath = p;
                            break;
                        }
                    }
                }
                if (headPath) {
                    headPath.style.fill = "#ffe7e6";
                }
                
                btn.innerHTML = `<span class="facial-btn-label">Dáng #${i}</span>`;
                btn.appendChild(svgEl);
                
                btn.addEventListener("click", () => {
                    if (state.faceIndex !== i) {
                        state.faceIndex = i;
                        playSound('click');
                        syncFacialActiveState(facesGrid, i);
                        updateCharacter();
                        saveState();
                    }
                });
                facesGrid.appendChild(btn);
            }

            // 4. Noses selection grid
            nosesGrid.innerHTML = "";
            FACIAL_DATABASE.noses.forEach(item => {
                const btn = document.createElement("button");
                btn.className = "facial-select-btn";
                if (item.id === state.noseIndex) {
                    btn.classList.add("active");
                }
                
                const dx = 25 - item.x_center;
                const dy = 12 - item.y_center;
                btn.innerHTML = `
                    <span class="facial-btn-label">Kiểu #${item.id}</span>
                    <svg viewBox="0 0 50 24" class="facial-btn-preview">
                        <g class="nose-preview" transform="translate(${dx}, ${dy})">
                            ${item.left.join("")} ${item.right.join("")}
                        </g>
                    </svg>
                `;
                
                btn.addEventListener("click", () => {
                    if (state.noseIndex !== item.id) {
                        state.noseIndex = item.id;
                        playSound('click');
                        syncFacialActiveState(nosesGrid, item.id);
                        updateCharacter();
                        saveState();
                    }
                });
                nosesGrid.appendChild(btn);
            });

            // 5. Mouths selection grid
            mouthsGrid.innerHTML = "";
            FACIAL_DATABASE.mouths.forEach(item => {
                const btn = document.createElement("button");
                btn.className = "facial-select-btn";
                if (item.id === state.mouthIndex) {
                    btn.classList.add("active");
                }
                
                const dx = 25 - item.x_center;
                const dy = 12 - item.y_center;
                btn.innerHTML = `
                    <span class="facial-btn-label">Kiểu #${item.id}</span>
                    <svg viewBox="0 0 50 24" class="facial-btn-preview">
                        <g class="mouth-preview" transform="translate(${dx}, ${dy})">
                            ${item.left.join("")} ${item.right.join("")}
                        </g>
                    </svg>
                `;
                
                btn.addEventListener("click", () => {
                    if (state.mouthIndex !== item.id) {
                        state.mouthIndex = item.id;
                        playSound('click');
                        syncFacialActiveState(mouthsGrid, item.id);
                        updateCharacter();
                        saveState();
                    }
                });
                mouthsGrid.appendChild(btn);
            });
        }

        // Helper to update active classes inside grid
        function syncFacialActiveState(gridContainer, activeId) {
            const buttons = gridContainer.querySelectorAll(".facial-select-btn");
            buttons.forEach((btn, idx) => {
                if (idx + 1 === activeId) {
                    btn.classList.add("active");
                } else {
                    btn.classList.remove("active");
                }
            });
        }

        // Sync UI state
        function updateUI() {
            if (state.gender === "male") {
                maleBtn.classList.add("active");
                femaleBtn.classList.remove("active");
            } else {
                maleBtn.classList.remove("active");
                femaleBtn.classList.add("active");
            }

            customModeToggle.checked = state.customMode;
            if (state.customMode) {
                customPickersContainer.classList.add("active");
            } else {
                customPickersContainer.classList.remove("active");
            }

            customSkinPicker.value = state.customSkin;
            customShadingPicker.value = state.customShading;
            customSkinPreview.style.backgroundColor = state.customSkin;
            customShadingPreview.style.backgroundColor = state.customShading;
            customSkinHex.innerText = state.customSkin.toUpperCase();
            customShadingHex.innerText = state.customShading.toUpperCase();

            updateCharacter();
            buildPaletteUI();
            
            // Sync facial selections
            syncFacialActiveState(facesGrid, state.faceIndex);
            syncFacialActiveState(eyebrowsGrid, state.eyebrowIndex);
            syncFacialActiveState(eyesGrid, state.eyeIndex);
            syncFacialActiveState(nosesGrid, state.noseIndex);
            syncFacialActiveState(mouthsGrid, state.mouthIndex);
        }

        function showToast(message) {
            const toast = document.getElementById("toast");
            const toastContent = toast.querySelector("#toastContent");
            toastContent.innerText = message;
            toast.classList.add("show");
            setTimeout(() => {
                toast.classList.remove("show");
            }, 3000);
        }

        function applyCameraTransform() {
            characterWrapper.style.transform = `translate(${panX}px, ${panY}px) scale(${zoom})`;
        }

        function resetCamera() {
            zoom = 1.0;
            panX = 0;
            panY = 0;
            applyCameraTransform();
        }

        viewportCanvas.addEventListener("mousedown", (e) => {
            isDragging = true;
            startX = e.clientX - panX;
            startY = e.clientY - panY;
            viewportCanvas.style.cursor = "grabbing";
        });

        window.addEventListener("mousemove", (e) => {
            if (!isDragging) return;
            panX = e.clientX - startX;
            panY = e.clientY - startY;
            applyCameraTransform();
        });

        window.addEventListener("mouseup", () => {
            isDragging = false;
            viewportCanvas.style.cursor = "grab";
        });

        viewportCanvas.addEventListener("wheel", (e) => {
            e.preventDefault();
            const zoomFactor = 0.06;
            if (e.deltaY < 0) {
                zoom = Math.min(zoom + zoomFactor, 3.5);
            } else {
                zoom = Math.max(zoom - zoomFactor, 0.4);
            }
            applyCameraTransform();
        }, { passive: false });

        document.getElementById("zoomInBtn").addEventListener("click", () => {
            playSound('click');
            zoom = Math.min(zoom + 0.2, 3.5);
            applyCameraTransform();
        });

        document.getElementById("zoomOutBtn").addEventListener("click", () => {
            playSound('click');
            zoom = Math.max(zoom - 0.2, 0.4);
            applyCameraTransform();
        });

        document.getElementById("zoomResetBtn").addEventListener("click", () => {
            playSound('click');
            resetCamera();
        });

        maleBtn.addEventListener("click", () => {
            if (state.gender !== "male") {
                state.gender = "male";
                playSound('select');
                updateUI();
                saveState();
            }
        });

        femaleBtn.addEventListener("click", () => {
            if (state.gender !== "female") {
                state.gender = "female";
                playSound('select');
                updateUI();
                saveState();
            }
        });

        customModeToggle.addEventListener("change", (e) => {
            state.customMode = e.target.checked;
            if (state.customMode) {
                if (!state.customSkin) {
                    const activeColor = PALETTE_DATA[state.skinToneIndex - 1];
                    state.customSkin = activeColor.skin;
                    state.customShading = activeColor.shading;
                }
            }
            playSound('click');
            updateUI();
            saveState();
        });

        customSkinPicker.addEventListener("input", (e) => {
            state.customSkin = e.target.value;
            customSkinPreview.style.backgroundColor = state.customSkin;
            customSkinHex.innerText = state.customSkin.toUpperCase();
            updateCharacter();
        });

        customSkinPicker.addEventListener("change", () => {
            saveState();
            buildPaletteUI();
        });

        customShadingPicker.addEventListener("input", (e) => {
            state.customShading = e.target.value;
            customShadingPreview.style.backgroundColor = state.customShading;
            customShadingHex.innerText = state.customShading.toUpperCase();
            updateCharacter();
        });

        customShadingPicker.addEventListener("change", () => {
            saveState();
            buildPaletteUI();
        });

        autoShadowBtn.addEventListener("click", () => {
            const shadow = autoShadow(state.customSkin);
            state.customShading = shadow;
            customShadingPicker.value = shadow;
            customShadingPreview.style.backgroundColor = shadow;
            customShadingHex.innerText = shadow.toUpperCase();
            playSound('click');
            updateCharacter();
            saveState();
            buildPaletteUI();
            showToast("Đã tự động tính màu bóng da tương thích!");
        });

        resetBtn.addEventListener("click", () => {
            playSound('click');
            state = {
                gender: "male",
                skinToneIndex: 1,
                customMode: false,
                customSkin: "#ffe7e6",
                customShading: "#ffcccc",
                faceIndex: 1,
                eyeIndex: 1,
                eyebrowIndex: 1,
                noseIndex: 1,
                mouthIndex: 1
            };
            resetCamera();
            updateUI();
            saveState();
            showToast("Đã thiết lập lại mặc định!");
        });

        downloadBtn.addEventListener("click", () => {
            const svgElement = characterWrapper.querySelector("svg");
            if (!svgElement) return;

            playSound('download');
            
            const serializer = new XMLSerializer();
            let source = serializer.serializeToString(svgElement);
            
            if(!source.match(/^<svg[^>]+xmlns="http\\:\\/\\/www\\.w3\\.org\\/2000\\/svg"/)){
                source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
            }
            if(!source.match(/^<svg[^>]+xmlns\\:xlink="http\\:\\/\\/www\\.w3\\.org\\/1999\\/xlink"/)){
                source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
            }

            const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(source);
            const downloadLink = document.createElement("a");
            downloadLink.href = url;
            
            const modeName = state.customMode ? "custom" : `preset_${state.skinToneIndex}`;
            const filename = `mee_${state.gender}_skin_${modeName}_face_${state.faceIndex}_eye_${state.eyeIndex}_eb_${state.eyebrowIndex}_nose_${state.noseIndex}_mouth_${state.mouthIndex}.svg`;
            downloadLink.download = filename;
            
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            
            showToast(`Đã tải về thành công file SVG: ${filename}`);
        });

        downloadPngBtn.addEventListener("click", () => {
            const svgElement = characterWrapper.querySelector("svg");
            if (!svgElement) return;

            playSound('download');
            showToast("Đang kết xuất ảnh PNG, vui lòng đợi...");

            const canvas = document.getElementById("renderCanvas");
            const ctx = canvas.getContext("2d");

            const viewBox = svgElement.viewBox.baseVal;
            const width = viewBox.width || 180;
            const height = viewBox.height || 440;

            const scaleFactor = 3;
            canvas.width = width * scaleFactor;
            canvas.height = height * scaleFactor;

            const serializer = new XMLSerializer();
            const svgString = serializer.serializeToString(svgElement);
            
            const svgBlob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
            const URL = window.URL || window.webkitURL || window;
            const blobURL = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = function() {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                const pngURL = canvas.toDataURL("image/png");
                const downloadLink = document.createElement("a");
                downloadLink.href = pngURL;
                
                const modeName = state.customMode ? "custom" : `preset_${state.skinToneIndex}`;
                downloadLink.download = `mee_${state.gender}_skin_${modeName}_face_${state.faceIndex}_eye_${state.eyeIndex}_eb_${state.eyebrowIndex}_nose_${state.noseIndex}_mouth_${state.mouthIndex}.png`;
                
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
                
                URL.revokeObjectURL(blobURL);
                showToast("Đã tải ảnh PNG thành công!");
            };
            img.onerror = function(err) {
                console.error("Canvas draw failure: ", err);
                showToast("Lỗi khi kết xuất ảnh PNG!");
            };
            img.src = blobURL;
        });

        // Tab switching logic
        const tabBtns = document.querySelectorAll(".tab-btn");
        const tabContents = document.querySelectorAll(".tab-content");

        tabBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                const targetTab = btn.dataset.tab;
                
                // Set active class on buttons
                tabBtns.forEach(b => b.classList.remove("active"));
                btn.classList.add("active");
                
                // Show/hide content panels
                tabContents.forEach(content => {
                    if (content.id === `tab-${targetTab}`) {
                        content.classList.add("active");
                    } else {
                        content.classList.remove("active");
                    }
                });
                
                playSound('click');
            });
        });

        // Start App
        loadState();
    </script>
</body>
</html>
""".replace("%s", json.dumps(svg_db), 1).replace("%s", json.dumps(facial_db), 1)

    # Write self-contained index.html
    dest_path = os.path.join(base_dir, "index.html")
    with open(dest_path, "w", encoding="utf-8") as f:
        f.write(html_template)
        
    print(f"Self-contained game created successfully at: {dest_path}")

    # Auto sync to GitHub
    try:
        import subprocess
        print("Auto syncing to GitHub...")
        git_path = os.path.join(base_dir, "git-portable", "cmd", "git.exe")
        subprocess.run([git_path, "add", "."], check=True)
        # Check if there are changes before committing
        status_res = subprocess.run([git_path, "status", "--porcelain"], capture_output=True, text=True)
        if status_res.stdout.strip():
            subprocess.run([git_path, "commit", "-m", "Auto sync: Mee Character Customizer update"], check=True)
        else:
            print("No changes to commit.")
        
        token_path = os.path.join(base_dir, "github_token.txt")
        if os.path.exists(token_path):
            with open(token_path, "r", encoding="utf-8") as f:
                token = f.read().strip()
        else:
            raise FileNotFoundError("github_token.txt not found. Please create it with your GitHub Personal Access Token.")
        
        remote_url = f"https://{token}@github.com/storymee-dev/mee-character.git"
        subprocess.run([git_path, "push", remote_url, "main", "--force"], check=True)
        print("Successfully synced to GitHub!")
    except Exception as e:
        print(f"Failed to auto sync: {e}")

if __name__ == "__main__":
    main()
