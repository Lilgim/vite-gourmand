from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4, landscape
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import cm
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    Image,
    Flowable,
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

ROOT = Path(__file__).resolve().parents[1]
DOCS = ROOT / "docs"
AUDIT = ROOT / "test-results" / "audit"
DOCS.mkdir(exist_ok=True)

FONT_DIR = Path("C:/Windows/Fonts")
pdfmetrics.registerFont(TTFont("Arial", FONT_DIR / "arial.ttf"))
pdfmetrics.registerFont(TTFont("Arial-Bold", FONT_DIR / "arialbd.ttf"))
pdfmetrics.registerFont(TTFont("Georgia", FONT_DIR / "georgia.ttf"))
pdfmetrics.registerFont(TTFont("Georgia-Bold", FONT_DIR / "georgiab.ttf"))

BURGUNDY = colors.HexColor("#7A2E3B")
CREAM = colors.HexColor("#F5F1E8")
SURFACE = colors.HexColor("#FFFDF8")
INK = colors.HexColor("#2B2620")
MUTED = colors.HexColor("#6E675C")
BRONZE = colors.HexColor("#8A7A3E")
LINE = colors.HexColor("#E5DDCB")

styles = getSampleStyleSheet()
styles.add(
    ParagraphStyle(
        name="VGTitle",
        fontName="Georgia-Bold",
        fontSize=25,
        leading=30,
        textColor=BURGUNDY,
        alignment=TA_CENTER,
        spaceAfter=16,
    )
)
styles.add(
    ParagraphStyle(
        name="VGH1",
        fontName="Georgia-Bold",
        fontSize=18,
        leading=22,
        textColor=BURGUNDY,
        spaceBefore=10,
        spaceAfter=8,
    )
)
styles.add(
    ParagraphStyle(
        name="VGH2",
        fontName="Arial-Bold",
        fontSize=12,
        leading=15,
        textColor=INK,
        spaceBefore=8,
        spaceAfter=5,
    )
)
styles.add(
    ParagraphStyle(
        name="VGBody",
        fontName="Arial",
        fontSize=10,
        leading=14,
        textColor=INK,
        spaceAfter=7,
    )
)
styles.add(
    ParagraphStyle(
        name="VGSmall",
        fontName="Arial",
        fontSize=8,
        leading=11,
        textColor=MUTED,
        spaceAfter=4,
    )
)


def footer(canvas, doc):
    canvas.saveState()
    canvas.setStrokeColor(LINE)
    canvas.line(2 * cm, 1.35 * cm, A4[0] - 2 * cm, 1.35 * cm)
    canvas.setFont("Arial", 8)
    canvas.setFillColor(MUTED)
    canvas.drawString(2 * cm, 0.9 * cm, "Vite & Gourmand — ECF DWWM — Lucas Gimenez")
    canvas.drawRightString(A4[0] - 2 * cm, 0.9 * cm, f"Page {doc.page}")
    canvas.restoreState()


def bullet(text):
    return Paragraph(f"• {text}", styles["VGBody"])


def screenshot(path, width=15.3 * cm, max_height=18 * cm):
    image = Image(str(path))
    ratio = min(width / image.imageWidth, max_height / image.imageHeight)
    image.drawWidth = image.imageWidth * ratio
    image.drawHeight = image.imageHeight * ratio
    image.hAlign = "CENTER"
    return image


def build_manual():
    output = DOCS / "MANUEL_UTILISATEUR.pdf"
    doc = SimpleDocTemplate(
        str(output),
        pagesize=A4,
        rightMargin=2 * cm,
        leftMargin=2 * cm,
        topMargin=1.8 * cm,
        bottomMargin=1.8 * cm,
        title="Manuel utilisateur Vite & Gourmand",
        author="Lucas Gimenez",
    )
    story = [
        Spacer(1, 2 * cm),
        Paragraph("Vite & Gourmand", styles["VGTitle"]),
        Paragraph("Manuel utilisateur", styles["VGH1"]),
        Paragraph(
            "Application de consultation et de commande de menus pour un traiteur bordelais.",
            styles["VGBody"],
        ),
        Spacer(1, 1 * cm),
        Table(
            [
                ["Version", "19 juillet 2026"],
                ["Auteur", "Lucas Gimenez"],
                ["Public", "Visiteur, client, employé, administrateur"],
            ],
            colWidths=[4 * cm, 10 * cm],
            style=TableStyle(
                [
                    ("FONTNAME", (0, 0), (-1, -1), "Arial"),
                    ("FONTNAME", (0, 0), (0, -1), "Arial-Bold"),
                    ("BACKGROUND", (0, 0), (0, -1), CREAM),
                    ("GRID", (0, 0), (-1, -1), 0.5, LINE),
                    ("PADDING", (0, 0), (-1, -1), 8),
                ]
            ),
        ),
        PageBreak(),
        Paragraph("1. Comptes de démonstration", styles["VGH1"]),
        Paragraph(
            "Ces comptes sont réservés à l'évaluation. Ils ne contiennent aucune donnée réelle.",
            styles["VGBody"],
        ),
        Table(
            [
                ["Rôle", "Email", "Mot de passe"],
                ["Client", "client@demo.vite-gourmand.fr", "ClientDemo2026!"],
                ["Employé", "employe@demo.vite-gourmand.fr", "EmployeDemo2026!"],
                ["Administrateur", "admin@demo.vite-gourmand.fr", "AdminDemo2026!"],
            ],
            colWidths=[3.2 * cm, 7.8 * cm, 5 * cm],
            repeatRows=1,
            style=TableStyle(
                [
                    ("FONTNAME", (0, 0), (-1, -1), "Arial"),
                    ("FONTNAME", (0, 0), (-1, 0), "Arial-Bold"),
                    ("BACKGROUND", (0, 0), (-1, 0), BURGUNDY),
                    ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                    ("GRID", (0, 0), (-1, -1), 0.5, LINE),
                    ("PADDING", (0, 0), (-1, -1), 7),
                ]
            ),
        ),
        Paragraph("2. Parcours visiteur", styles["VGH1"]),
        bullet("Consulter l'accueil, les horaires, les avis et la présentation de l'entreprise."),
        bullet("Ouvrir Nos menus et combiner les filtres prix, thème, régime et convives."),
        bullet("Ouvrir une fiche menu pour voir plats, allergènes, conditions, galerie et stock."),
        bullet("Utiliser Contact pour envoyer un titre, une description et une adresse email."),
        bullet("Créer un compte ou demander un nouveau mot de passe depuis Connexion."),
        screenshot(AUDIT / "01-accueil-desktop.png", max_height=9.5 * cm),
        PageBreak(),
        Paragraph("3. Parcours client", styles["VGH1"]),
        bullet("Se connecter puis sélectionner Commander depuis la fiche d'un menu."),
        bullet("Renseigner date, heure, adresse, GSM, convives et distance hors Bordeaux."),
        bullet("Vérifier le prix de base, la réduction, la livraison et le total avant validation."),
        bullet("Retrouver la commande dans Mon compte et consulter son historique horodaté."),
        bullet("Avant acceptation : modifier la prestation ou annuler. Le menu reste verrouillé."),
        bullet("Après terminaison : publier une note de 1 à 5 et un commentaire."),
        screenshot(AUDIT / "11-commander-desktop.png", max_height=10.5 * cm),
        PageBreak(),
        Paragraph("4. Parcours employé", styles["VGH1"]),
        bullet("Se connecter avec le compte employé puis ouvrir Espace employé."),
        bullet("Filtrer les commandes par statut ou client, puis ouvrir leur détail."),
        bullet("Faire progresser les statuts dans l'ordre proposé par l'interface."),
        bullet("Pour annuler, saisir le mode de contact et le motif."),
        bullet("Gérer les menus, plats, allergènes et horaires, puis modérer les avis."),
        screenshot(AUDIT / "20-employe-commandes-desktop.png", max_height=11 * cm),
        PageBreak(),
        Paragraph("5. Parcours administrateur", styles["VGH1"]),
        bullet("L'administrateur dispose aussi de toutes les fonctions employé."),
        bullet("Dans Statistiques, filtrer par menu et période, comparer les volumes et le chiffre d'affaires."),
        bullet("Dans Comptes employés, créer un compte, puis le désactiver ou le réactiver."),
        bullet("Le mot de passe initial est transmis directement, jamais dans l'email automatique."),
        screenshot(AUDIT / "30-admin-stats-desktop.png", max_height=11 * cm),
        Paragraph("6. Aide et sécurité", styles["VGH1"]),
        bullet("Ne jamais partager les identifiants d'administration hors contexte d'évaluation."),
        bullet("Après trois tentatives infructueuses, vérifier l'email et utiliser Mot de passe oublié."),
        bullet("Pour une commande acceptée ou du matériel à restituer, contacter directement l'entreprise."),
    ]
    doc.build(story, onFirstPage=footer, onLaterPages=footer)


def draw_phone(canvas, x, y, w, h, screen):
    canvas.setFillColor(colors.HexColor("#1D1B18"))
    canvas.roundRect(x, y, w, h, 12, fill=1, stroke=0)
    inset = 8
    canvas.setFillColor(CREAM)
    canvas.roundRect(x + inset, y + inset, w - 2 * inset, h - 2 * inset, 8, fill=1, stroke=0)
    canvas.setFillColor(BURGUNDY)
    canvas.rect(x + inset, y + h - 58, w - 2 * inset, 50, fill=1, stroke=0)
    canvas.setFillColor(colors.white)
    canvas.setFont("Georgia-Bold", 11)
    canvas.drawString(x + 18, y + h - 38, "Vite & Gourmand")
    canvas.setFillColor(INK)
    canvas.setFont("Georgia-Bold", 16)
    canvas.drawString(x + 18, y + h - 92, screen)
    top = y + h - 118
    if screen == "Accueil":
        canvas.setFillColor(colors.HexColor("#E7DFCC"))
        canvas.roundRect(x + 18, top - 100, w - 36, 90, 7, fill=1, stroke=0)
        canvas.setFillColor(BRONZE)
        canvas.setFont("Arial-Bold", 8)
        canvas.drawString(x + 28, top - 30, "TRAITEUR BORDELAIS")
        canvas.setFillColor(INK)
        canvas.setFont("Georgia", 12)
        canvas.drawString(x + 28, top - 52, "Des menus pour vos moments")
        canvas.setFillColor(BURGUNDY)
        canvas.roundRect(x + 28, top - 85, 100, 23, 5, fill=1, stroke=0)
    elif screen == "Nos menus":
        for i in range(3):
            yy = top - 78 * (i + 1)
            canvas.setFillColor(SURFACE)
            canvas.roundRect(x + 18, yy, w - 36, 64, 6, fill=1, stroke=1)
            canvas.setFillColor(BURGUNDY if i == 0 else BRONZE)
            canvas.rect(x + 26, yy + 10, 52, 44, fill=1, stroke=0)
            canvas.setFillColor(INK)
            canvas.setFont("Arial-Bold", 8)
            canvas.drawString(x + 88, yy + 42, ["Mariage", "Anniversaire", "Végan"][i])
    else:
        labels = ["Date et heure", "Adresse", "Nombre de convives", "Total"]
        for i, label in enumerate(labels):
            yy = top - 58 * (i + 1)
            canvas.setFillColor(MUTED)
            canvas.setFont("Arial", 7)
            canvas.drawString(x + 20, yy + 32, label)
            canvas.setFillColor(colors.white)
            canvas.roundRect(x + 20, yy, w - 40, 25, 4, fill=1, stroke=1)
        canvas.setFillColor(BURGUNDY)
        canvas.roundRect(x + 20, y + 28, w - 40, 28, 5, fill=1, stroke=0)


def build_charter():
    output = DOCS / "CHARTE_GRAPHIQUE.pdf"
    page = landscape(A4)
    doc = SimpleDocTemplate(
        str(output),
        pagesize=page,
        rightMargin=1.5 * cm,
        leftMargin=1.5 * cm,
        topMargin=1.3 * cm,
        bottomMargin=1.3 * cm,
        title="Charte graphique Vite & Gourmand",
        author="Lucas Gimenez",
    )
    story = [
        Paragraph("Vite & Gourmand — Charte graphique", styles["VGTitle"]),
        Paragraph(
            "Direction artistique « Crème & Bordeaux » : une identité chaleureuse, élégante et lisible, inspirée du patrimoine gastronomique bordelais.",
            styles["VGBody"],
        ),
        Paragraph("Palette", styles["VGH1"]),
    ]
    palette = [
        ("Crème", "#F5F1E8", CREAM),
        ("Surface", "#FFFDF8", SURFACE),
        ("Bordeaux", "#7A2E3B", BURGUNDY),
        ("Bordeaux profond", "#402028", colors.HexColor("#402028")),
        ("Bronze", "#8A7A3E", BRONZE),
        ("Encre", "#2B2620", INK),
    ]
    row = []
    for name, value, color in palette:
        row.append(
            Table(
                [[""], [name], [value]],
                colWidths=[3.7 * cm],
                rowHeights=[1.3 * cm, 0.7 * cm, 0.6 * cm],
                style=TableStyle(
                    [
                        ("BACKGROUND", (0, 0), (0, 0), color),
                        ("FONTNAME", (0, 1), (0, 1), "Arial-Bold"),
                        ("FONTNAME", (0, 2), (0, 2), "Arial"),
                        ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                        ("BOX", (0, 0), (-1, -1), 0.5, LINE),
                    ]
                ),
            )
        )
    story.extend(
        [
            Table([row], colWidths=[4 * cm] * 6),
            Paragraph("Typographies", styles["VGH1"]),
            Paragraph(
                "Playfair Display pour les titres et la dimension éditoriale ; Inter pour les interfaces et les textes. Des fallbacks Georgia et Segoe UI assurent un rendu reproductible hors ligne.",
                styles["VGBody"],
            ),
            Paragraph("Principes d'interface", styles["VGH1"]),
            bullet("Hiérarchie nette : sourcils bronze, titres éditoriaux, contenu fonctionnel compact."),
            bullet("Boutons bordeaux, contrastes élevés, focus visible et libellés explicites."),
            bullet("Cartes crème, bordures discrètes et rayons de 8 à 10 pixels."),
            bullet("Responsive mobile-first, sans débordement horizontal."),
        ]
    )
    desktop = [
        ("Maquette desktop 1 — Accueil", AUDIT / "01-accueil-desktop.png"),
        ("Maquette desktop 2 — Catalogue", AUDIT / "02-menus-desktop.png"),
        ("Maquette desktop 3 — Administration", AUDIT / "30-admin-stats-desktop.png"),
    ]
    for title, path in desktop:
        story.extend([PageBreak(), Paragraph(title, styles["VGH1"]), screenshot(path, width=24 * cm, max_height=15.5 * cm)])

    class PhonePage(Flowable):
        def __init__(self, title):
            super().__init__()
            self.title = title

        def wrap(self, avail_width, avail_height):
            return avail_width, 15.5 * cm

        def drawOn(self, canvas, x, y, _sW=0):
            draw_phone(canvas, x + 8 * cm, y, 8.2 * cm, 15.5 * cm, self.title)

    for index, title in enumerate(["Accueil", "Nos menus", "Commander"], 1):
        story.extend(
            [
                PageBreak(),
                Paragraph(f"Maquette mobile {index} — {title}", styles["VGH1"]),
                Paragraph("Wireframe haute fidélité — largeur cible 412 px.", styles["VGSmall"]),
                PhonePage(title),
            ]
        )

    def landscape_footer(canvas, doc):
        canvas.saveState()
        canvas.setFont("Arial", 8)
        canvas.setFillColor(MUTED)
        canvas.drawString(1.5 * cm, 0.7 * cm, "Vite & Gourmand — Charte graphique")
        canvas.drawRightString(page[0] - 1.5 * cm, 0.7 * cm, f"Page {doc.page}")
        canvas.restoreState()

    doc.build(story, onFirstPage=landscape_footer, onLaterPages=landscape_footer)


if __name__ == "__main__":
    build_manual()
    build_charter()
    print(DOCS / "MANUEL_UTILISATEUR.pdf")
    print(DOCS / "CHARTE_GRAPHIQUE.pdf")
