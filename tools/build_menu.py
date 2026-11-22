"""Membuat lib/catalog.js dari satu daftar menu.
Jalankan: python tools/build_menu.py

Kalau public/img/menu/<slug>.jpg ada, menu itu memakai foto tersebut dan
kredit fotonya diambil dari tools/photo_credits.json. Kalau belum ada foto,
skrip membuat ilustrasi SVG sebagai pengganti sementara.
"""
import html, json, math, os, re

ROOT = os.path.join(os.path.dirname(__file__), "..")
BG, P, CREAM, DARK, COFFEE, MILK = "#1b140e", "#b6895b", "#f3e6d0", "#3a2313", "#6b3f1d", "#e8d2b0"

def slugify(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower().replace("&", "and")).strip("-")

def wrap(title, body):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 300" role="img" aria-label="{html.escape(title)}">\n'
            f'<rect width="400" height="300" fill="{BG}"/>\n'
            f'<ellipse cx="200" cy="258" rx="120" ry="12" fill="#000" opacity=".35"/>\n{body}\n</svg>\n')

def steam(x, y):
    return f'<path d="M{x} {y} q-10 -14 0 -28 q10 -14 0 -28" fill="none" stroke="{CREAM}" stroke-width="5" stroke-linecap="round" opacity=".55"/>'

SAUCER = f'<ellipse cx="200" cy="246" rx="105" ry="13" fill="{CREAM}"/><ellipse cx="200" cy="243" rx="70" ry="7" fill="#d9c7a8"/>'

def cup(x0, x1, top, bottom, liquid, body=CREAM):
    cx, w = (x0 + x1) / 2, x1 - x0
    return (f'<path d="M{x1-6} {top+18} q52 4 44 40 q-8 30 -52 30" fill="none" stroke="{body}" stroke-width="13" stroke-linecap="round"/>'
            f'<path d="M{x0} {top} L{x1} {top} L{x1-18} {bottom-18} Q{x1-22} {bottom} {x1-44} {bottom} L{x0+44} {bottom} Q{x0+22} {bottom} {x0+18} {bottom-18} Z" fill="{body}"/>'
            f'<ellipse cx="{cx}" cy="{top}" rx="{w/2}" ry="13" fill="{body}"/><ellipse cx="{cx}" cy="{top}" rx="{w/2-9}" ry="9" fill="{liquid}"/>')

def hot(liquid, body=CREAM, art="", small=False, steams=True):
    c = cup(150, 250, 170, 240, liquid, body) if small else cup(125, 275, 140, 240, liquid, body)
    top = 170 if small else 140
    s = (steam(185, top - 22) + steam(215, top - 22)) if steams else ""
    marks = {
        "heart": f'<path d="M200 {top-7} c-16 -14 -34 6 0 22 c34 -16 16 -36 0 -22z" fill="{COFFEE}"/>',
        "leaf": f'<path d="M165 {top} q35 -14 70 0" fill="none" stroke="#fff8ea" stroke-width="5" stroke-linecap="round"/><path d="M178 {top+6} q22 -9 44 0" fill="none" stroke="#fff8ea" stroke-width="4" stroke-linecap="round"/>',
        "drizzle": f'<path d="M150 {top} q12 -8 25 0 t25 0 t25 0 t25 0" fill="none" stroke="#c9822f" stroke-width="4" stroke-linecap="round"/>',
        "crema": f'<ellipse cx="200" cy="{top}" rx="30" ry="5" fill="{P}" opacity=".8"/>',
        "marshmallow": f'<rect x="170" y="{top-15}" width="26" height="22" rx="7" fill="#fff8ea"/><rect x="204" y="{top-11}" width="24" height="20" rx="7" fill="#fff8ea"/>',
        "": "",
    }[art]
    return SAUCER + c + marks + ("" if art in ("heart", "leaf", "drizzle") else s)

GLASS = 'M140 70 L260 70 L246 240 Q245 250 234 250 L166 250 Q155 250 154 240 Z'

def ice(x, y, r=0):
    return f'<rect x="{x}" y="{y}" width="26" height="26" rx="5" fill="#fff" opacity=".35" transform="rotate({r} {x+13} {y+13})"/>'

def glass(layers, iced=True, straw=None, garnish=""):
    """layers: daftar (y_atas, warna) dari atas ke bawah; tiap lapis mengisi sampai lapis berikutnya."""
    out = f'<path d="{GLASS}" fill="#ffffff" opacity=".12"/><clipPath id="g"><path d="{GLASS}"/></clipPath><g clip-path="url(#g)">'
    for i, (y, color) in enumerate(layers):
        y2 = layers[i + 1][0] if i + 1 < len(layers) else 252
        out += f'<rect x="130" y="{y}" width="140" height="{y2 - y + 1}" fill="{color}"/>'
    out += "</g>"
    if iced:
        out += ice(160, 104, 12) + ice(205, 118, -10) + ice(180, 158, 25)
    out += f'<path d="{GLASS}" fill="none" stroke="{CREAM}" stroke-width="4" opacity=".8"/>'
    if straw:
        out += f'<rect x="222" y="30" width="10" height="200" rx="5" fill="{straw}" transform="rotate(8 227 130)"/>'
    return out + garnish

def fruit(color, inner, x=262, y=74):
    return (f'<circle cx="{x}" cy="{y}" r="34" fill="{color}"/><circle cx="{x}" cy="{y}" r="26" fill="{inner}"/>'
            f'<g stroke="{color}" stroke-width="3"><line x1="{x}" y1="{y-26}" x2="{x}" y2="{y+26}"/><line x1="{x-26}" y1="{y}" x2="{x+26}" y2="{y}"/>'
            f'<line x1="{x-18}" y1="{y-18}" x2="{x+18}" y2="{y+18}"/><line x1="{x+18}" y1="{y-18}" x2="{x-18}" y2="{y+18}"/></g>')

def frappe(drink, drizzle=None, chips=None, straw=P):
    cupd = 'M138 96 L262 96 L244 244 Q243 252 234 252 L166 252 Q157 252 156 244 Z'
    out = f'<path d="{cupd}" fill="{drink}"/>'
    if chips:
        for x, y in [(170, 140), (215, 165), (188, 200), (228, 215), (200, 128), (176, 228)]:
            out += f'<circle cx="{x}" cy="{y}" r="5" fill="{chips}"/>'
    out += f'<path d="{cupd}" fill="none" stroke="{CREAM}" stroke-width="4" opacity=".75"/>'
    # krim kocok dan tutup kubah
    out += ('<path d="M146 96 Q150 70 176 70 Q180 50 200 50 Q220 50 224 70 Q250 70 254 96 Z" fill="#fff8ea"/>'
            '<path d="M168 84 q32 -18 64 0" fill="none" stroke="#e6d6bb" stroke-width="4" stroke-linecap="round"/>')
    if drizzle:
        out += f'<path d="M160 88 q14 -16 28 -2 t28 -4 t26 6" fill="none" stroke="{drizzle}" stroke-width="5" stroke-linecap="round"/>'
    out += f'<path d="M134 98 Q134 34 200 34 Q266 34 266 98 Z" fill="#fff" opacity=".10" stroke="{CREAM}" stroke-width="3"/>'
    out += f'<rect x="194" y="6" width="11" height="120" rx="5" fill="{straw}"/>'
    out += f'<rect x="130" y="92" width="140" height="9" rx="4" fill="{CREAM}"/>'
    return out

PLATE = f'<ellipse cx="200" cy="232" rx="150" ry="28" fill="{CREAM}"/><ellipse cx="200" cy="227" rx="116" ry="18" fill="#e3d3b5"/>'

def dots(color, pts, r=5):
    return "".join(f'<circle cx="{x}" cy="{y}" r="{r}" fill="{color}"/>' for x, y in pts)

def shrimp(x, y, r=0):
    return f'<path d="M{x} {y} q18 -22 36 0 q-6 14 -18 12" fill="none" stroke="#f08a6a" stroke-width="9" stroke-linecap="round" transform="rotate({r} {x+18} {y})"/>'

def chunk(x, y, color, w=30, h=20, r=0):
    return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="8" fill="{color}" transform="rotate({r} {x+w/2} {y+h/2})"/>'

EGG = '<ellipse cx="258" cy="196" rx="36" ry="20" fill="#fffaf0"/><circle cx="258" cy="192" r="12" fill="#f4b53c"/>'
CUCUMBER = "".join(f'<circle cx="{x}" cy="{y}" r="13" fill="#9cc56a"/><circle cx="{x}" cy="{y}" r="8" fill="#d6ecb0"/>' for x, y in [(112, 214), (132, 224)])

def rice(color, toppings="", egg=True):
    mound = f'<path d="M120 216 Q124 130 200 126 Q276 130 280 216 Q200 240 120 216 Z" fill="{color}"/>'
    grains = dots("#ffffff", [(160, 160), (190, 146), (220, 158), (240, 182), (150, 190), (205, 180), (176, 204)], 3)
    return PLATE + mound + f'<g opacity=".35">{grains}</g>' + toppings + (EGG if egg else "") + CUCUMBER

def noodles(color, toppings="", wide=False, sauce=None):
    sw = 13 if wide else 7
    strokes = ""
    for i in range(7 if not wide else 5):
        y = 150 + i * (11 if not wide else 16)
        strokes += f'<path d="M126 {y} q25 -22 50 0 t50 0 t48 0" fill="none" stroke="{color}" stroke-width="{sw}" stroke-linecap="round"/>'
    base = f'<path d="M118 214 Q124 136 200 132 Q276 136 282 214 Q200 240 118 214 Z" fill="{sauce or color}" opacity=".55"/>'
    return PLATE + base + strokes + toppings

GREENS = dots("#6fae4e", [(150, 170), (236, 160), (200, 200), (170, 210)], 7)

def rice_side(main):
    # nasi putih di kiri, lauk di kanan
    return (PLATE + '<path d="M96 214 Q100 150 150 148 Q200 150 204 214 Q150 232 96 214 Z" fill="#fffaf0"/>' + main)

def saucy(color, sauce, n=6):
    pts = [(214, 176), (246, 168), (232, 196), (268, 190), (286, 208), (212, 208)][:n]
    out = f'<path d="M196 216 Q200 156 250 152 Q304 158 306 214 Q250 234 196 216 Z" fill="{sauce}"/>'
    for i, (x, y) in enumerate(pts):
        out += chunk(x, y, color, 28, 18, (i * 37) % 60 - 30)
    return out

def cake(body, layers, top=None, garnish=""):
    out = '<ellipse cx="200" cy="244" rx="120" ry="14" fill="%s"/>' % CREAM
    out += f'<path d="M110 236 L110 150 L290 110 L290 236 Z" fill="{body}"/>'
    for i, color in enumerate(layers):
        y1 = 176 + i * 22
        out += f'<path d="M110 {y1} L290 {y1 - 40 + 0} L290 {y1 - 30} L110 {y1 + 10} Z" fill="{color}"/>'
    out += f'<path d="M110 150 L290 110 L290 124 L110 164 Z" fill="{top or body}"/>'
    return out + garnish

def art(kind, **k):
    if kind == "hot": return hot(**k)
    if kind == "glass": return glass(**k)
    if kind == "frappe": return frappe(**k)
    if kind == "rice": return rice(**k)
    if kind == "noodles": return noodles(**k)
    if kind == "raw": return k["svg"]
    raise ValueError(kind)

SEAFOOD = shrimp(150, 168, -10) + shrimp(196, 150, 15) + dots("#f6e7d0", [(236, 176), (170, 198)], 9)
CHICKEN = chunk(150, 156, "#c98a4b", r=-12) + chunk(196, 146, "#c98a4b", r=10) + chunk(226, 172, "#b9783d", r=-20)
BEEF = chunk(150, 158, "#7a3f24", r=-12) + chunk(198, 148, "#7a3f24", r=14) + chunk(228, 176, "#8c4a2b", r=-18)
CHILI = "".join(f'<rect x="{x}" y="{y}" width="20" height="7" rx="3" fill="#4f9a3a" transform="rotate({r} {x} {y})"/>' for x, y, r in [(150, 160, 20), (200, 148, -25), (230, 176, 40), (176, 196, -10), (214, 204, 15)])

CROISSANT = (f'<path d="M88 210 Q96 130 200 118 Q304 130 312 210 Q292 228 268 214 Q240 232 200 222 Q160 232 132 214 Q108 228 88 210 Z" fill="#d99a4e"/>'
             '<g fill="none" stroke="#a9652a" stroke-width="6" stroke-linecap="round"><path d="M150 140 Q138 180 136 212"/><path d="M200 122 Q198 170 200 220"/><path d="M250 140 Q262 180 264 212"/></g>'
             '<path d="M110 196 Q124 150 176 132" fill="none" stroke="#f1c27a" stroke-width="7" stroke-linecap="round" opacity=".8"/>')
FRIES = "".join(f'<rect x="{x}" y="{y}" width="15" height="{h}" rx="5" fill="{c}" transform="rotate({r} {x+7} {y+h})"/>' for x, y, h, r, c in
                [(136, 70, 110, -14, "#f2c14e"), (156, 52, 128, -8, "#f6d274"), (178, 60, 120, -3, "#f2c14e"), (198, 44, 136, 2, "#f6d274"), (220, 58, 122, 7, "#f2c14e"), (242, 66, 114, 13, "#f6d274"), (166, 84, 96, 4, "#e7ae35"), (210, 80, 100, -5, "#e7ae35")])

def spiral():
    pts = []
    for i in range(0, 200):
        t = i / 200 * 5 * math.pi
        r = 6 + t * 5.2
        pts.append(f"{200 + math.cos(t) * r:.1f},{186 + math.sin(t) * r * 0.62:.1f}")
    return f'<ellipse cx="200" cy="190" rx="96" ry="60" fill="#d99a4e"/><polyline points="{" ".join(pts)}" fill="none" stroke="#8a4f22" stroke-width="7" stroke-linecap="round"/><path d="M130 170 q40 -30 90 -22 q40 6 52 30" fill="none" stroke="#fff8ea" stroke-width="9" stroke-linecap="round" opacity=".9"/>'

RAW = {
    "v60": (f'<path d="M150 150 L250 150 L240 232 Q238 246 224 246 L176 246 Q162 246 160 232 Z" fill="#ffffff" opacity=".14" stroke="{CREAM}" stroke-width="4"/>'
            f'<path d="M156 200 L244 200 L240 232 Q238 246 224 246 L176 246 Q162 246 160 232 Z" fill="{COFFEE}"/>'
            f'<path d="M120 62 L280 62 L222 138 L178 138 Z" fill="{CREAM}"/><path d="M134 62 L266 62 L214 128 L186 128 Z" fill="{DARK}"/>'
            f'<rect x="150" y="138" width="100" height="10" rx="5" fill="{CREAM}"/><path d="M278 70 q40 6 30 36 q-6 16 -36 14" fill="none" stroke="{CREAM}" stroke-width="10" stroke-linecap="round"/>'
            f'<line x1="200" y1="150" x2="200" y2="196" stroke="{COFFEE}" stroke-width="4" stroke-dasharray="6 8" stroke-linecap="round"/>'),
    "affogato": (f'<path d="M140 120 L260 120 Q262 210 200 214 Q138 210 140 120 Z" fill="#ffffff" opacity=".14" stroke="{CREAM}" stroke-width="4"/>'
                 f'<path d="M146 170 L254 170 Q250 208 200 210 Q150 208 146 170 Z" fill="{DARK}"/><circle cx="200" cy="150" r="42" fill="#fff8ea"/>'
                 f'<path d="M168 138 q30 -26 62 0 q-6 26 -20 44 q-22 4 -34 -8 z" fill="{COFFEE}" opacity=".85"/>'
                 f'<rect x="192" y="212" width="16" height="28" fill="{CREAM}" opacity=".8"/><ellipse cx="200" cy="244" rx="48" ry="8" fill="{CREAM}" opacity=".8"/>'),
    "croissant": PLATE + CROISSANT,
    "almond-croissant": PLATE + CROISSANT + "".join(f'<ellipse cx="{x}" cy="{y}" rx="13" ry="6" fill="#fff3d6" transform="rotate({r} {x} {y})"/>' for x, y, r in [(150, 170, -30), (190, 150, 10), (230, 160, 35), (255, 190, -15), (170, 195, 20), (212, 186, -40)]),
    "cinnamon-roll": PLATE + spiral(),
    "muffin": (f'<path d="M140 170 L260 170 L246 246 Q245 252 238 252 L162 252 Q155 252 154 246 Z" fill="#c9a06a"/>'
               '<g stroke="#a47c48" stroke-width="4">' + "".join(f'<line x1="{x}" y1="174" x2="{x + (200 - x) * 0.12:.0f}" y2="250"/>' for x in (160, 180, 200, 220, 240)) + '</g>'
               '<path d="M126 172 Q120 100 200 96 Q280 100 274 172 Q200 190 126 172 Z" fill="#d9a35a"/>' + dots("#3d3f8f", [(160, 140), (200, 120), (236, 142), (180, 160), (222, 164)], 8)),
    "cookie": PLATE + '<ellipse cx="200" cy="196" rx="92" ry="56" fill="#c98f4f"/><ellipse cx="200" cy="190" rx="92" ry="54" fill="#dba864"/>' + dots("#4a2a12", [(160, 176), (196, 160), (236, 178), (176, 206), (220, 208), (248, 196), (150, 196)], 9),
    "donut": PLATE + ('<ellipse cx="200" cy="194" rx="100" ry="58" fill="#d9a35a"/><ellipse cx="200" cy="184" rx="96" ry="50" fill="#4a2a12"/>'
                     '<ellipse cx="200" cy="186" rx="30" ry="14" fill="#e3d3b5"/>' + "".join(f'<rect x="{x}" y="{y}" width="14" height="5" rx="2" fill="{c}" transform="rotate({r} {x} {y})"/>' for x, y, r, c in
                     [(140, 170, 20, "#f4d23c"), (170, 152, -30, "#fff"), (220, 150, 40, "#f08a6a"), (252, 172, -10, "#fff"), (150, 200, -40, "#f08a6a"), (240, 206, 25, "#f4d23c"), (196, 214, 0, "#fff")])),
    "cheesecake": cake("#f6e3a8", ["#f9ecc4"], top="#fbf1cf", garnish='<path d="M110 222 L290 222 L290 236 L110 236 Z" fill="#b8742f"/><circle cx="230" cy="112" r="13" fill="#c0392b"/>'),
    "chocolate-cake": cake("#4a2a12", ["#6b3f1d", "#3a2313"], top="#2d1a0c", garnish='<circle cx="230" cy="112" r="13" fill="#c0392b"/>'),
    "tiramisu": cake("#f3e6d0", ["#6b3f1d", "#f3e6d0"], top="#5a341a"),
    "sandwich": PLATE + ('<path d="M96 222 L200 96 L304 222 Z" fill="#e9c98f"/><path d="M110 222 L200 112 L290 222 Z" fill="#fff3d6"/>'
                        '<path d="M124 206 L276 206 L290 222 L110 222 Z" fill="#7fb24f"/><path d="M134 192 L266 192 L276 206 L124 206 Z" fill="#b54a3a"/><path d="M146 178 L254 178 L266 192 L134 192 Z" fill="#f4c542"/>'),
    "toast": PLATE + ('<path d="M110 150 Q110 128 132 128 L268 128 Q290 128 290 150 L290 218 Q290 228 280 228 L120 228 Q110 228 110 218 Z" fill="#b8742f"/>'
                     '<path d="M124 150 Q124 140 136 140 L264 140 Q276 140 276 150 L276 208 Q276 216 268 216 L132 216 Q124 216 124 208 Z" fill="#f0c98a"/>'
                     '<path d="M130 196 Q160 150 200 178 Q240 206 270 160 L270 208 Q270 212 266 212 L134 212 Q130 212 130 208 Z" fill="#4a2a12"/>'
                     '<g stroke="#f4d23c" stroke-width="5" stroke-linecap="round"><line x1="150" y1="160" x2="168" y2="154"/><line x1="190" y1="158" x2="206" y2="166"/><line x1="226" y1="152" x2="244" y2="160"/><line x1="170" y1="174" x2="184" y2="168"/><line x1="212" y1="182" x2="228" y2="176"/></g>'),
    "fries": FRIES + f'<path d="M122 150 Q200 176 278 150 L262 244 Q260 252 250 252 L150 252 Q140 252 138 244 Z" fill="#c2452d"/><path d="M160 196 q40 16 80 0" fill="none" stroke="{CREAM}" stroke-width="6" stroke-linecap="round"/>',
    "wings": PLATE + "".join(f'<g transform="rotate({r} {x} {y})"><ellipse cx="{x}" cy="{y}" rx="40" ry="24" fill="#b5532a"/><rect x="{x+30}" y="{y-6}" width="40" height="12" rx="6" fill="#f3e6d0"/><circle cx="{x+72}" cy="{y}" r="9" fill="#f3e6d0"/></g>' for x, y, r in [(150, 190, -20), (200, 160, 10), (190, 212, 25)]),
    "onion-rings": PLATE + "".join(f'<ellipse cx="{x}" cy="{y}" rx="52" ry="26" fill="none" stroke="#d99a3e" stroke-width="18"/><ellipse cx="{x}" cy="{y}" rx="52" ry="26" fill="none" stroke="#f0c27a" stroke-width="6"/>' for x, y in [(170, 204), (232, 196), (200, 170), (196, 140)]),
    "pisang": PLATE + "".join(f'<path d="M{x} {y} q50 -34 104 0 q-8 30 -52 28 q-44 2 -52 -28z" fill="#d99a3e" transform="rotate({r} {x+52} {y})"/>' for x, y, r in [(120, 196, -8), (176, 176, 6), (150, 214, 4)])
              + "".join(f'<rect x="{x}" y="{y}" width="22" height="5" rx="2" fill="#f7dc6f" transform="rotate({r} {x} {y})"/>' for x, y, r in [(160, 172, 20), (196, 160, -30), (230, 172, 40), (180, 190, -10), (214, 196, 15), (244, 188, -45)]),
    "ayam-mentega": rice_side(saucy("#c98a4b", "#e6b24a")),
    "ayam-lada": rice_side(saucy("#b9783d", "#3a2313") + dots("#6fae4e", [(228, 160), (270, 176)], 7)),
    "sapi-lada": rice_side(saucy("#7a3f24", "#2d1a0c") + dots("#c0392b", [(228, 160), (270, 176)], 7)),
    "cordon-bleu": PLATE + ('<ellipse cx="170" cy="190" rx="78" ry="44" fill="#d99a3e"/><ellipse cx="170" cy="186" rx="70" ry="38" fill="#e7b25a"/>'
                           '<path d="M150 150 L186 150 L196 222 L160 222 Z" fill="#f4c542" opacity=".9"/><path d="M158 150 L176 150 L186 222 L168 222 Z" fill="#e58a8a"/>')
                   + "".join(f'<rect x="{x}" y="{y}" width="12" height="52" rx="5" fill="#f2c14e" transform="rotate({r} {x} {y})"/>' for x, y, r in [(258, 160, 20), (272, 166, -10), (288, 160, 30), (246, 172, -25)])
                   + dots("#6fae4e", [(262, 216), (284, 212), (246, 210)], 10),
    "capcay": rice_side('<path d="M196 216 Q200 156 250 152 Q304 158 306 214 Q250 234 196 216 Z" fill="#e9dcc0"/>'
                        + dots("#6fae4e", [(220, 176), (262, 168), (286, 196)], 12) + dots("#e8873a", [(240, 196), (268, 210), (214, 204)], 9) + dots("#fff8ea", [(244, 172), (232, 212)], 8) + shrimp(246, 182, 10)),
    "sapo-tahu": ('<path d="M96 170 L304 170 L288 240 Q286 250 274 250 L126 250 Q114 250 112 240 Z" fill="#5a3a26"/><ellipse cx="200" cy="170" rx="104" ry="22" fill="#7a4f33"/><ellipse cx="200" cy="170" rx="90" ry="16" fill="#c9822f"/>'
                  + "".join(chunk(x, y, "#fff3d6", 26, 18, r) for x, y, r in [(150, 158, -10), (190, 150, 8), (228, 160, -14), (172, 172, 12)]) + shrimp(210, 174, 20) + dots("#6fae4e", [(160, 176), (246, 168)], 7)
                  + '<rect x="76" y="176" width="28" height="12" rx="6" fill="#5a3a26"/><rect x="296" y="176" width="28" height="12" rx="6" fill="#5a3a26"/>'),
    "fuyunghai": rice_side('<ellipse cx="252" cy="192" rx="56" ry="34" fill="#e7b25a"/><ellipse cx="252" cy="188" rx="50" ry="28" fill="#f2cf7a"/>'
                           '<path d="M210 186 q20 -22 44 -8 q24 -16 44 6 q-10 22 -44 20 q-34 4 -44 -18z" fill="#d1492f" opacity=".9"/>' + dots("#6fae4e", [(236, 184), (262, 190), (280, 184)], 5)),
}

# (id, kategori, nama, harga, deskripsi, jenis gambar, argumen)
M = [
 (105, "signature", "Kopi Susu Gula Aren", 25000, "Kopi susu dengan gula aren.", "glass", dict(layers=[(92, COFFEE), (142, MILK), (192, "#4a2a12")], straw=P)),
 (501, "signature", "Kopi Susu Jahe", 28000, "Kopi susu dengan sirup jahe.", "hot", dict(liquid="#c9a070", art="leaf")),
 (502, "signature", "Butterscotch Latte", 34000, "Latte dengan saus butterscotch.", "hot", dict(liquid="#d9b06a", art="drizzle")),
 (503, "signature", "Aren Oat Latte", 32000, "Espresso, susu oat, dan gula aren.", "glass", dict(layers=[(92, COFFEE), (142, "#efe3cc"), (192, "#4a2a12")], straw=P)),
 (504, "signature", "Dalgona Kopi Susu", 32000, "Susu dingin dengan krim kopi kocok di atasnya.", "glass", dict(layers=[(84, "#c98a4b"), (130, "#fff8ea")], straw=None)),
 (505, "signature", "Kopi Susu Rum", 30000, "Kopi susu dengan sirup rasa rum, tanpa alkohol.", "hot", dict(liquid="#b07a46", art="heart")),

 (101, "black-coffee", "Espresso", 18000, "Satu shot, pekat dan singkat.", "hot", dict(liquid=DARK, small=True, art="crema")),
 (102, "black-coffee", "Americano", 25000, "Espresso dengan air.", "hot", dict(liquid="#22130a")),
 (103, "coffee", "Cappuccino", 32000, "Espresso, susu, dan busa tebal.", "hot", dict(liquid=MILK, art="heart")),
 (104, "coffee", "Caffe Latte", 32000, "Espresso dengan susu lembut.", "hot", dict(liquid="#d9b88a", art="leaf")),
 (107, "coffee", "Flat White", 34000, "Dua shot ristretto dengan susu tipis.", "hot", dict(liquid="#c9a070", art="leaf", small=True)),
 (108, "coffee", "Caramel Macchiato", 38000, "Susu vanila, espresso, dan saus karamel.", "hot", dict(liquid=MILK, art="drizzle")),
 (109, "coffee", "Caffe Mocha", 38000, "Espresso, cokelat, dan susu.", "hot", dict(liquid="#5a341a", art="heart")),
 (110, "coffee", "Vanilla Latte", 36000, "Latte dengan sirup vanila.", "glass", dict(layers=[(84, "#fff8ea"), (108, COFFEE), (136, MILK)], iced=False)),
 (111, "coffee", "Hazelnut Latte", 36000, "Latte dengan sirup hazelnut.", "glass", dict(layers=[(90, COFFEE), (140, "#d9b88a")], straw=P)),
 (112, "black-coffee", "Cold Brew", 30000, "Kopi seduh dingin 12 jam.", "glass", dict(layers=[(90, "#22130a")], straw="#fff8ea")),
 (106, "black-coffee", "V60 Aceh Gayo", 30000, "Seduh manual dengan V60.", "raw", dict(svg=RAW["v60"])),
 (113, "dessert", "Affogato", 32000, "Es krim vanila disiram espresso.", "raw", dict(svg=RAW["affogato"])),
 (114, "black-coffee", "Kopi Tubruk", 18000, "Kopi bubuk diseduh langsung di cangkir, gaya tradisional.", "hot", dict(liquid="#22130a")),
 (115, "black-coffee", "Japanese Iced Coffee", 30000, "Kopi seduh manual langsung di atas es.", "glass", dict(layers=[(90, "#22130a")], straw=None)),

 (151, "frappe", "Caramel Frappe", 42000, "Kopi blended dengan karamel dan krim kocok.", "frappe", dict(drink="#c9a070", drizzle="#c9822f")),
 (152, "frappe", "Mocha Frappe", 42000, "Kopi blended dengan cokelat.", "frappe", dict(drink="#7a4a2a", drizzle="#3a2313")),
 (153, "frappe", "Java Chip Frappe", 45000, "Mocha blended dengan kepingan cokelat.", "frappe", dict(drink="#8a5a36", drizzle="#3a2313", chips="#2d1a0c")),
 (154, "frappe", "Matcha Frappe", 45000, "Matcha blended tanpa kopi.", "frappe", dict(drink="#9cc56a")),
 (155, "frappe", "Cookies & Cream Frappe", 45000, "Vanila blended dengan remahan biskuit cokelat.", "frappe", dict(drink="#ece3d2", chips="#2d1a0c")),
 (156, "frappe", "Strawberry Cream Frappe", 42000, "Stroberi dan susu blended dengan krim kocok, tanpa kopi.", "frappe", dict(drink="#f2a7b5", drizzle="#d1344f")),

 (201, "non-coffee", "Matcha Latte", 35000, "Matcha dengan susu.", "hot", dict(liquid="#8fae5a", art="leaf")),
 (202, "non-coffee", "Signature Chocolate", 35000, "Cokelat pekat dengan marshmallow.", "hot", dict(liquid="#3b1d10", body="#c96f4a", art="marshmallow")),
 (204, "non-coffee", "Red Velvet Latte", 35000, "Red velvet dengan susu.", "hot", dict(liquid="#c0475a", art="leaf")),
 (205, "non-coffee", "Taro Latte", 33000, "Taro dengan susu.", "glass", dict(layers=[(90, "#b79ad6"), (170, "#e9dcf4")], straw="#fff8ea")),
 (206, "non-coffee", "Chai Tea Latte", 33000, "Teh rempah dengan susu.", "hot", dict(liquid="#c98f5a", art="drizzle")),
 (203, "non-coffee", "Teh Lemon", 22000, "Teh hitam dengan perasan lemon.", "glass", dict(layers=[(100, "#c9722a")], straw=CREAM, garnish=fruit("#f4d23c", "#fbe98a"))),
 (207, "non-coffee", "Lychee Tea", 28000, "Teh dingin dengan buah leci.", "glass", dict(layers=[(100, "#e8b27a")], straw=CREAM, garnish=dots("#fff8ea", [(176, 214), (208, 226), (228, 206)], 12))),
 (208, "non-coffee", "Peach Tea", 28000, "Teh dingin dengan potongan persik.", "glass", dict(layers=[(100, "#e89a52")], straw=CREAM, garnish=fruit("#f2a03c", "#f9c98a"))),
 (209, "non-coffee", "Strawberry Smoothie", 36000, "Stroberi, yoghurt, dan susu.", "glass", dict(layers=[(90, "#e8607a")], iced=False, straw="#fff8ea", garnish='<circle cx="258" cy="76" r="24" fill="#d1344f"/><path d="M246 56 l12 -12 l12 12 z" fill="#6fae4e"/>')),
 (210, "non-coffee", "Mango Smoothie", 36000, "Mangga, yoghurt, dan susu.", "glass", dict(layers=[(90, "#f4b53c")], iced=False, straw="#fff8ea", garnish=fruit("#f29a1f", "#f9d27a"))),

 (301, "pastry", "Croissant Butter", 24000, "Dipanggang ulang sebelum disajikan.", "raw", dict(svg=RAW["croissant"])),
 (304, "pastry", "Almond Croissant", 30000, "Croissant isi krim almon.", "raw", dict(svg=RAW["almond-croissant"])),
 (305, "pastry", "Cinnamon Roll", 28000, "Roti gulung kayu manis dengan glasir.", "raw", dict(svg=RAW["cinnamon-roll"])),
 (306, "dessert", "Blueberry Muffin", 26000, "Muffin dengan blueberry.", "raw", dict(svg=RAW["muffin"])),
 (307, "dessert", "Chocolate Chip Cookie", 18000, "Kukis besar dengan kepingan cokelat.", "raw", dict(svg=RAW["cookie"])),
 (308, "pastry", "Donat Cokelat", 18000, "Donat dengan glasir cokelat.", "raw", dict(svg=RAW["donut"])),
 (309, "dessert", "Cheesecake", 38000, "Satu potong, dengan dasar biskuit.", "raw", dict(svg=RAW["cheesecake"])),
 (310, "dessert", "Chocolate Cake", 36000, "Satu potong kue cokelat berlapis.", "raw", dict(svg=RAW["chocolate-cake"])),
 (311, "dessert", "Tiramisu", 38000, "Satu potong, dengan taburan kakao.", "raw", dict(svg=RAW["tiramisu"])),
 (312, "pastry", "Smoked Beef & Cheese Sandwich", 38000, "Roti panggang isi daging asap dan keju.", "raw", dict(svg=RAW["sandwich"])),
 (302, "pastry", "Roti Bakar Cokelat Keju", 22000, "Dua tangkup, potong empat.", "raw", dict(svg=RAW["toast"])),

 (401, "main", "Nasi Goreng Seafood", 38000, "Nasi goreng dengan udang, cumi, dan telur.", "rice", dict(color="#c9822f", toppings=SEAFOOD)),
 (402, "main", "Nasi Goreng Ayam", 32000, "Nasi goreng dengan ayam suwir dan telur.", "rice", dict(color="#c9822f", toppings=CHICKEN)),
 (403, "main", "Nasi Goreng Cabe Hijau", 35000, "Nasi goreng pedas dengan cabai hijau.", "rice", dict(color="#b9a04a", toppings=CHILI)),
 (404, "noodles", "Mie Goreng Seafood", 36000, "Mi goreng dengan udang dan cumi.", "noodles", dict(color="#d9a04a", toppings=SEAFOOD + GREENS)),
 (405, "noodles", "Mie Goreng Ayam", 32000, "Mi goreng dengan ayam dan sayuran.", "noodles", dict(color="#d9a04a", toppings=CHICKEN + GREENS)),
 (406, "noodles", "Kwetiau Goreng Sapi", 38000, "Kwetiau goreng dengan irisan sapi.", "noodles", dict(color="#e6c79a", wide=True, sauce="#8a5a2b", toppings=BEEF + GREENS)),
 (407, "noodles", "Kwetiau Siram Seafood", 38000, "Kwetiau dengan kuah kental seafood.", "noodles", dict(color="#f3e6d0", wide=True, sauce="#d9b06a", toppings=SEAFOOD + GREENS)),
 (408, "main", "Nasi Ayam Mentega", 40000, "Ayam goreng saus mentega dengan nasi.", "raw", dict(svg=RAW["ayam-mentega"])),
 (409, "main", "Nasi Ayam Lada Hitam", 40000, "Ayam saus lada hitam dengan nasi.", "raw", dict(svg=RAW["ayam-lada"])),
 (410, "main", "Nasi Sapi Lada Hitam", 45000, "Sapi saus lada hitam dengan nasi.", "raw", dict(svg=RAW["sapi-lada"])),
 (411, "main", "Chicken Cordon Bleu", 48000, "Ayam isi keju dan daging asap, dengan kentang.", "raw", dict(svg=RAW["cordon-bleu"])),
 (412, "main", "Nasi Cap Cay Seafood", 38000, "Tumis sayuran dan seafood dengan nasi.", "raw", dict(svg=RAW["capcay"])),
 (413, "main", "Sapo Tahu Seafood", 40000, "Tahu dan seafood dalam kuah kental, disajikan di claypot.", "raw", dict(svg=RAW["sapo-tahu"])),
 (414, "main", "Nasi Fuyunghai", 35000, "Telur dadar isi dengan saus asam manis.", "raw", dict(svg=RAW["fuyunghai"])),
 (415, "noodles", "Spaghetti Bolognese", 42000, "Spaghetti dengan saus daging sapi dan tomat.", "noodles", dict(color="#e6c06a", sauce="#b5432a", toppings=BEEF)),
 (416, "noodles", "Spaghetti Carbonara", 45000, "Spaghetti dengan saus krim, keju, dan daging asap.", "noodles", dict(color="#f1d98a", sauce="#f6ecd0", toppings=GREENS)),

 (303, "snack", "Kentang Goreng", 22000, "Dengan saus sambal dan mayones.", "raw", dict(svg=RAW["fries"])),
 (351, "snack", "Chicken Wings", 32000, "Enam potong sayap ayam pedas manis.", "raw", dict(svg=RAW["wings"])),
 (352, "snack", "Onion Rings", 24000, "Bawang bombai goreng tepung.", "raw", dict(svg=RAW["onion-rings"])),
 (353, "snack", "Pisang Goreng Keju", 22000, "Pisang goreng dengan parutan keju.", "raw", dict(svg=RAW["pisang"])),
 (354, "snack", "Bola Singkong Keju", 22000, "Singkong isi keju, digoreng renyah.", "raw", dict(svg=RAW["pisang"])),
 (355, "snack", "Tahu Goreng", 20000, "Tahu goreng renyah dengan sambal kecap.", "raw", dict(svg=RAW["fries"])),
]

# Rating bintang (skala 5) setiap menu, per id. Biji kopi memakai rating di BEANS.
RATINGS = {
    105: 4.7, 501: 4.7, 502: 4.6, 503: 4.8, 504: 4.2, 505: 4.3, 101: 4.7, 102: 4.3, 103: 4.7, 104: 4.8,
    107: 4.2, 108: 4.7, 109: 4.5, 110: 4.2, 111: 4.3, 112: 4.6, 106: 4.6, 113: 4.3, 114: 4.5, 115: 4.3,
    151: 4.7, 152: 4.6, 153: 4.2, 154: 4.8, 155: 4.3, 156: 4.5, 201: 4.8, 202: 4.8, 204: 4.8, 205: 4.2,
    206: 4.8, 203: 4.8, 207: 4.6, 208: 4.2, 209: 4.5, 210: 4.2, 301: 4.7, 304: 4.4, 305: 4.5, 306: 4.6,
    307: 4.4, 308: 4.7, 309: 4.3, 310: 4.8, 311: 4.5, 312: 4.7, 302: 4.8, 401: 4.4, 402: 4.3, 403: 4.8,
    404: 4.8, 405: 4.8, 406: 4.5, 407: 4.6, 408: 4.3, 409: 4.7, 410: 4.9, 411: 4.3, 412: 4.8, 413: 4.2,
    414: 4.8, 415: 4.5, 416: 4.7, 303: 4.8, 351: 4.7, 352: 4.6, 353: 4.6, 354: 4.7, 355: 4.8,
}

CATEGORIES = [("signature", "Signature"), ("coffee", "Kopi Susu"), ("black-coffee", "Kopi Hitam"), ("frappe", "Frappe"), ("non-coffee", "Non-kopi"), ("pastry", "Roti & Pastry"), ("dessert", "Kue & Dessert"), ("main", "Nasi & Lauk"), ("noodles", "Mie & Pasta"), ("snack", "Camilan"), ("beans", "Biji Kopi")]

# Kategori minuman: menunya punya pilihan suhu, ukuran, dan tingkat gula.
DRINK_CATEGORIES = {"signature", "coffee", "black-coffee", "frappe", "non-coffee"}
# Suhu yang tersedia kalau bukan panas dan es. Frappe selalu es.
TEMPERATURES = {101: ["hot"], 106: ["hot"], 114: ["hot"], 112: ["iced"], 115: ["iced"], 504: ["iced"],
                207: ["iced"], 208: ["iced"], 209: ["iced"], 210: ["iced"]}

def temperatures_for(pid, cat):
    if cat not in DRINK_CATEGORIES:
        return None
    if cat == "frappe":
        return ["iced"]
    return TEMPERATURES.get(pid, ["hot", "iced"])
# Biji kopi 200 g: (id, nama, harga, rating).
BEANS = [
    (1, "Robusta Brazil", 45000, 4.5),
    (2, "America Blend", 75000, 5.0),
    (3, "Primo Passo", 100000, 4.6),
    (4, "Aceh Gayo", 150000, 4.7),
    (5, "Sumatra Mandailing", 90000, 4.3),
    (6, "Toraja Sapan", 120000, 4.6),
    (7, "Kintamani Bali", 115000, 4.6),
    (8, "Flores Bajawa", 105000, 4.5),
    (9, "Java Preanger", 95000, 4.4),
    (10, "Wamena Papua", 140000, 4.8),
]

MENU_IMG_DIR = os.path.join(ROOT, "public", "img", "menu")

with open(os.path.join(ROOT, "tools", "photo_credits.json"), encoding="utf-8") as f:
    CREDITS = json.load(f)

def image_for(slug, name, svg=None):
    """Path gambar di dalam public/img/ dan kredit fotonya (None untuk ilustrasi)."""
    if os.path.exists(os.path.join(MENU_IMG_DIR, slug + ".jpg")):
        if slug not in CREDITS:
            raise SystemExit(f"foto {slug}.jpg belum punya kredit di tools/photo_credits.json")
        return f"menu/{slug}.jpg", CREDITS[slug]
    if svg is None:
        raise SystemExit(f"foto public/img/menu/{slug}.jpg tidak ditemukan")
    os.makedirs(MENU_IMG_DIR, exist_ok=True)
    with open(os.path.join(MENU_IMG_DIR, slug + ".svg"), "w", encoding="utf-8", newline="\n") as f:
        f.write(wrap(name, svg()))
    return f"menu/{slug}.svg", None

def credit_js(credit):
    if not credit:
        return ""
    fields = ", ".join(f"{k}: {json.dumps(credit[k], ensure_ascii=False)}" for k in ("author", "source", "url", "license"))
    return f", credit: {{ {fields} }}"

def main():
    lines = []
    for pid, cat, name, price, desc, kind, args in M:
        slug = slugify(name)
        img, credit = image_for(slug, name, lambda: art(kind, **args))
        temps = temperatures_for(pid, cat)
        opts = f", options: {{ temperature: {json.dumps(temps)} }}" if temps else ""
        if pid not in RATINGS:
            raise SystemExit(f"menu {pid} ({name}) belum punya rating di RATINGS")
        lines.append(f'  {{ id: {pid}, category: "{cat}", name: {json.dumps(name)}, img: "{img}", price: {price}, rating: {RATINGS[pid]}, description: {json.dumps(desc, ensure_ascii=False)}{opts}{credit_js(credit)} }},')
    for pid, name, price, rating in BEANS:
        img, credit = image_for("beans-" + slugify(name), name)
        lines.append(f'  {{ id: {pid}, category: "beans", name: "{name}", img: "{img}", price: {price}, rating: {rating}, description: "Biji kopi 200 g."{credit_js(credit)} }},')
    cats = "\n".join(f'  {{ id: "{c}", name: "{n}" }},' for c, n in CATEGORIES)
    js = f"""// Katalog menu FJ Coffee. Ini satu-satunya sumber harga: browser hanya
// mengirim id, jumlah, dan pilihan minuman, lalu server menghitung total dari
// daftar ini.
//
// File ini dibuat oleh tools/build_menu.py. Untuk mengubah menu, ubah daftar
// di skrip itu lalu jalankan ulang, atau sunting langsung di sini kalau hanya
// mengganti harga. img adalah path di dalam public/img/; credit berisi
// pemilik foto dan sumbernya (ditampilkan di bagian Kredit Foto); rating
// adalah nilai bintang 1-5 yang tampil di kartu menu. Menu minuman punya
// options.temperature: suhu yang bisa dipilih.
const categories = [
{cats}
];

const products = [
{chr(10).join(lines)}
];

// Pilihan untuk menu minuman. Pilihan pertama adalah bawaan, kecuali suhu:
// bawaannya es kalau tersedia. price adalah tambahan harga per gelas.
const drinkOptions = {{
  temperature: {{
    label: "Suhu",
    choices: [
      {{ id: "hot", name: "Panas" }},
      {{ id: "iced", name: "Es" }},
    ],
  }},
  size: {{
    label: "Ukuran",
    choices: [
      {{ id: "regular", name: "Regular", price: 0 }},
      {{ id: "large", name: "Large", price: 5000 }},
    ],
  }},
  sugar: {{
    label: "Tingkat gula",
    choices: [
      {{ id: "normal", name: "Gula normal" }},
      {{ id: "less", name: "Kurang manis" }},
      {{ id: "none", name: "Tanpa gula" }},
    ],
  }},
}};

// Pajak restoran yang ditambahkan ke setiap pesanan.
const fees = {{ taxRate: 0.1 }};

const MAX_QUANTITY_PER_ITEM = 20;
// Satu menu dengan pilihan berbeda menjadi baris terpisah di keranjang.
const MAX_CART_LINES = 40;
const MAX_TABLE_NUMBER = 30;

module.exports = {{
  categories,
  products,
  drinkOptions,
  fees,
  MAX_QUANTITY_PER_ITEM,
  MAX_CART_LINES,
  MAX_TABLE_NUMBER,
}};
"""
    with open(os.path.join(ROOT, "lib", "catalog.js"), "w", encoding="utf-8", newline="\n") as f:
        f.write(js)
    print(len(M), "menu,", len(BEANS), "biji kopi")

if __name__ == "__main__":
    main()
