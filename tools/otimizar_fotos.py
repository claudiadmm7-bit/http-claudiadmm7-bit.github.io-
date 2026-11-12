"""Gera as versões otimizadas das fotos em docs/assets/images/.

Uso (na pasta do projeto):
    uv run --with pillow python tools/otimizar_fotos.py

Lê os originais em materials/photos/ (que não são publicados), aplica a
rotação EXIF, converte para sRGB, remove metadados (incluindo GPS) e grava:
  - <nome>-240.webp, <nome>-480.webp, <nome>-960.webp
  - <nome>-960.jpg (reserva para navegadores antigos)
No fim, imprime largura/altura de cada foto para conferir o site.json.
"""
import io
import json
import sys
from pathlib import Path

from PIL import Image, ImageCms, ImageDraw, ImageFont, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "materials" / "photos"
OUT = ROOT / "docs" / "assets" / "images"

# Uma foto por marca (a que aparece no cartão do cupom). Para trocar,
# mude o nome aqui, rode o script e atualize o site.json.
CARD_PHOTOS = ("ysy/ysy-04", "avvi/avvi-04", "gloss-vyllage/gloss-01", "pr-team/pr-team-logo")
CARD_WIDTHS = (240, 480)
AVATAR_WIDTHS = (240, 480)
SRGB = ImageCms.createProfile("sRGB")


def load(path: Path) -> Image.Image:
    im = Image.open(path)
    im = ImageOps.exif_transpose(im)
    icc = im.info.get("icc_profile")
    if icc:
        src_profile = ImageCms.ImageCmsProfile(io.BytesIO(icc))
        im = ImageCms.profileToProfile(im, src_profile, SRGB, outputMode="RGB")
    return im.convert("RGB")


def resized(im: Image.Image, width: int) -> Image.Image:
    if im.width <= width:
        return im.copy()
    height = round(im.height * width / im.width)
    return im.resize((width, height), Image.Resampling.LANCZOS)


def save_set(im: Image.Image, dest_base: Path, widths, jpg_width: int) -> dict:
    dest_base.parent.mkdir(parents=True, exist_ok=True)
    sizes = {}
    for w in widths:
        r = resized(im, w)
        r.save(f"{dest_base}-{w}.webp", "WEBP", quality=78, method=6)
        sizes[w] = r.size
    r = resized(im, jpg_width)
    r.save(f"{dest_base}-{jpg_width}.jpg", "JPEG", quality=80, optimize=True, progressive=True)
    return sizes


def font(name: str, size: int):
    # Georgia vem com o Windows; em outro sistema usa a fonte padrão do Pillow.
    try:
        return ImageFont.truetype(name, size)
    except OSError:
        return ImageFont.load_default(size)


def save_share_image(portrait: Image.Image) -> None:
    ivory, espresso, burgundy = (241, 234, 224), (48, 38, 34), (117, 59, 73)
    canvas = Image.new("RGB", (1200, 630), ivory)
    photo = portrait.resize((504, 630), Image.Resampling.LANCZOS)
    canvas.paste(photo, (1200 - 504 - 60, 0))
    draw = ImageDraw.Draw(canvas)
    draw.text((80, 170), "Clau", font=font("georgia.ttf", 150), fill=espresso)
    draw.text((84, 360), "@DIASDACLAUDIA", font=font("georgiab.ttf", 30), fill=burgundy)
    draw.text((84, 420), "Lifestyle, fitness e beleza.", font=font("georgiai.ttf", 38), fill=espresso)
    draw.line((84, 500, 300, 500), fill=(216, 185, 177), width=2)
    canvas.save(OUT / "compartilhamento.jpg", "JPEG", quality=82, optimize=True, progressive=True)


def main() -> int:
    report = {}
    for name in CARD_PHOTOS:
        im = load(SRC / f"{name}.jpg")
        sizes = save_set(im, OUT / name, CARD_WIDTHS, 480)
        report[name] = {"width": sizes[480][0], "height": sizes[480][1]}

    portrait = load(SRC / "perfil" / "clau-perfil-2.jpg")

    # Foto redonda do topo: recorte quadrado com o rosto no centro.
    avatar = portrait.crop((440, 560, 2500, 2620))
    sizes = save_set(avatar, OUT / "perfil" / "clau-perfil", AVATAR_WIDTHS, 480)
    report["perfil/clau-perfil"] = {"width": sizes[480][0], "height": sizes[480][1]}

    # Retrato vertical (4:5) usado na imagem de compartilhamento.
    hero = portrait.crop((0, 300, portrait.width, 300 + round(portrait.width * 5 / 4)))

    # Imagem de compartilhamento (1200x630): retrato à direita, nome à esquerda.
    save_share_image(hero)

    print(json.dumps(report, indent=2))
    return 0


if __name__ == "__main__":
    sys.exit(main())
