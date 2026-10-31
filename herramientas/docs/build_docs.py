#!/usr/bin/env python3
"""Construye PDF y DOCX corporativos a partir de los informes Markdown del repositorio."""
import re, subprocess, shutil, zipfile, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HERE = Path(__file__).resolve().parent
OUT = ROOT / "entregables"
BUILD = Path("/tmp/build")
OUT.mkdir(exist_ok=True); BUILD.mkdir(exist_ok=True)
DATE = "31 de octubre de 2026"
SLUG = "2026-10-31"
PD_FROM = "markdown-tex_math_dollars-raw_tex+pipe_tables+smart"

def run(cmd, **kw):
    subprocess.run(cmd, check=True, **kw)

def read(p): return (ROOT / p).read_text(encoding="utf-8")

def strip_title(md):
    lines = md.split("\n")
    if lines and lines[0].startswith("# "):
        lines = lines[1:]
    return "\n".join(lines).lstrip("\n")

def wrap_meta(md):
    """Envuelve el bloque inicial de líneas **Clave:** en un div .meta y los párrafos 'Advertencia' en .aviso."""
    lines = md.split("\n"); out = []; i = 0; meta = []
    while i < len(lines) and (lines[i].startswith("**") or lines[i].strip() == "") and not lines[i].startswith("**Advertencia"):
        if lines[i].strip(): meta.append(lines[i])
        i += 1
    if meta:
        out.append('<div class="meta">'); out.extend(l + "\n" for l in meta); out.append("</div>\n")
    rest = "\n".join(lines[i:])
    rest = re.sub(r"(?m)^(\*\*Advertencias?\.\*\*.*)$", r'<div class="aviso">\n\n\1\n\n</div>', rest)
    return "\n".join(out) + rest

def add_parte_I(md):
    return re.sub(r"(?m)^(## 1\. )", "# Parte I: investigación de base\n\n\\1", md, count=1)

def shift(md, n=1):
    return re.sub(r"(?m)^(#{1,5}) ", lambda m: "#" * (len(m.group(1)) + n) + " ", md)

def prep_docs():
    legal = wrap_meta(strip_title(read("informe_legal_cellgenic_argentina.md")))
    inf = wrap_meta(add_parte_I(strip_title(read("informe_cellgenic_rmtg.md"))))
    dossier = ("# Parte A: Dictamen jurídico preliminar\n\n" + legal +
               "\n\n# Parte B: Informe de investigación\n\n" + shift(inf, 1))
    return {
        "Dictamen_Legal_CellGenic_Argentina": dict(
            md=legal, toc=2,
            title="Dictamen jurídico preliminar",
            subtitle="Situación en Argentina de CellGenic / Global Stem Cells Group / RMTG y de los profesionales que adquieran o usen sus productos",
            short="Dictamen jurídico · CellGenic Argentina", kicker="Dictamen jurídico preliminar",
            scope="Calificación de los productos, situación de la empresa, esquema de «receta magistral», exposición del médico, prueba, vías de actuación y estrategia recomendada."),
        "Informe_Investigacion_CellGenic": dict(
            md=inf, toc=2,
            title="Informe de investigación",
            subtitle="CellGenic / Global Stem Cells Group / Regenerative Medical Technology Group (OTC: RMTG)",
            short="Informe de investigación · CellGenic / GSCG / RMTG", kicker="Informe de investigación",
            scope="Estructura corporativa, finanzas, personas, productos, historial regulatorio, domicilios, eventos, difusión, habilitaciones, documentos comerciales, audios del vendedor y autoevaluación."),
        "Dossier_CellGenic_Argentina": dict(
            md=dossier, toc=2,
            title="Dossier integral",
            subtitle="CellGenic / Global Stem Cells Group / RMTG: dictamen jurídico preliminar e informe de investigación",
            short="Dossier integral · CellGenic Argentina", kicker="Dossier integral",
            scope="Parte A: dictamen jurídico. Parte B: informe de investigación completo con documentos comerciales, audios y autoevaluación."),
    }

def build_pdf(name, d):
    md = BUILD / f"{name}.md"; md.write_text(d["md"], encoding="utf-8")
    html = BUILD / f"{name}.html"
    shutil.copy(HERE / "style.css", BUILD / "style.css")
    run(["pandoc", str(md), "-f", PD_FROM, "-t", "html5", "-s", "--template", str(HERE / "template.html"),
         "--toc", f"--toc-depth={d['toc']}", "--wrap=none",
         "-M", f"title={d['title']}", "-V", f"shorttitle={d['short']}", "-V", f"date={DATE}", "-o", str(html)])
    cover = (HERE / "cover.html").read_text(encoding="utf-8")
    for k, v in {"__TITLE__": d["title"], "__SUBTITLE__": d["subtitle"], "__DATE__": DATE,
                 "__SHORT__": d["short"], "__KICKER__": d["kicker"], "__SCOPE__": d["scope"]}.items():
        cover = cover.replace(k, v)
    cov = BUILD / f"{name}_cover.html"; cov.write_text(cover, encoding="utf-8")
    cpdf, bpdf = BUILD / f"{name}_cover.pdf", BUILD / f"{name}_body.pdf"
    run(["node", str(HERE / "render_pdf.js"), str(cov), str(cpdf), "cover"])
    run(["node", str(HERE / "render_pdf.js"), str(html), str(bpdf), "body", d["short"], DATE])
    out = OUT / f"{name}_{SLUG}.pdf"
    from pypdf import PdfReader, PdfWriter
    w = PdfWriter()
    for p in (cpdf, bpdf):
        for pg in PdfReader(str(p)).pages: w.add_page(pg)
    w.add_metadata({"/Title": f"{d['title']} · {d['subtitle']}", "/Author": "Claude Code para el Dr. Gabriel González",
                    "/Subject": d["scope"], "/Creator": "pandoc + Chromium"})
    with open(out, "wb") as f: w.write(f)
    return out

# ---------- DOCX ----------
def make_reference():
    ref = BUILD / "reference.docx"
    if ref.exists(): ref.unlink()
    run(["pandoc", "-o", str(ref), "--print-default-data-file", "reference.docx"])
    tmp = BUILD / "refx"; shutil.rmtree(tmp, ignore_errors=True)
    with zipfile.ZipFile(ref) as z: z.extractall(tmp)
    sp = tmp / "word" / "styles.xml"; s = sp.read_text(encoding="utf-8")
    fonts = '<w:rFonts w:ascii="Arial" w:hAnsi="Arial" w:cs="Arial" w:eastAsia="Arial"/>'
    s = re.sub(r"<w:rFonts [^>]*/>", fonts, s, count=1)  # docDefaults
    def set_style(sid, color=None, sz=None, bold=None, extra_ppr="", font=True):
        nonlocal s
        m = re.search(r'(<w:style [^>]*w:styleId="%s"[^>]*>)(.*?)(</w:style>)' % re.escape(sid), s, re.S)
        if not m: return
        body = m.group(2)
        rpr = ""
        if font: rpr += fonts
        if bold: rpr += "<w:b/><w:bCs/>"
        if color: rpr += f'<w:color w:val="{color}"/>'
        if sz: rpr += f'<w:sz w:val="{sz}"/><w:szCs w:val="{sz}"/>'
        if re.search(r"<w:rPr>.*?</w:rPr>", body, re.S):
            body = re.sub(r"<w:rPr>.*?</w:rPr>", f"<w:rPr>{rpr}</w:rPr>", body, count=1, flags=re.S)
        elif "<w:rPr/>" in body:
            body = body.replace("<w:rPr/>", f"<w:rPr>{rpr}</w:rPr>", 1)
        else:
            body = body + f"<w:rPr>{rpr}</w:rPr>"
        if extra_ppr:
            if re.search(r"<w:pPr>", body):
                body = re.sub(r"<w:pPr>", "<w:pPr>" + extra_ppr, body, count=1)
            else:
                body = f"<w:pPr>{extra_ppr}</w:pPr>" + body
        s = s[:m.start()] + m.group(1) + body + m.group(3) + s[m.end():]
    navy = "0C3A5F"
    set_style("Normal", sz="21")
    set_style("Title", color=navy, sz="48", bold=True)
    set_style("Subtitle", color="3BA9FF", sz="26")
    set_style("Author", color="5B6472", sz="20")
    set_style("Date", color="5B6472", sz="20")
    set_style("Heading1", color=navy, sz="34", bold=True, extra_ppr="<w:pageBreakBefore/>")
    set_style("Heading2", color=navy, sz="27", bold=True,
              extra_ppr='<w:pBdr><w:bottom w:val="single" w:sz="8" w:space="1" w:color="22D3A8"/></w:pBdr>')
    set_style("Heading3", color=navy, sz="23", bold=True)
    set_style("Heading4", color=navy, sz="21", bold=True)
    set_style("Hyperlink", color=navy, font=False)
    set_style("Compact", sz="18")
    set_style("BlockText", color="1F2937", sz="20")
    # Bordes de tabla
    tb = ('<w:tblBorders><w:top w:val="single" w:sz="4" w:color="D7DDE8"/><w:left w:val="single" w:sz="4" w:color="D7DDE8"/>'
          '<w:bottom w:val="single" w:sz="4" w:color="D7DDE8"/><w:right w:val="single" w:sz="4" w:color="D7DDE8"/>'
          '<w:insideH w:val="single" w:sz="4" w:color="D7DDE8"/><w:insideV w:val="single" w:sz="4" w:color="D7DDE8"/></w:tblBorders>')
    m = re.search(r'(<w:style [^>]*w:type="table"[^>]*w:styleId="Table"[^>]*>)(.*?)(</w:style>)', s, re.S)
    if m:
        body = m.group(2)
        body = re.sub(r"<w:tblBorders>.*?</w:tblBorders>", "", body, flags=re.S)
        body = re.sub(r"<w:tblPr>", "<w:tblPr>" + tb, body, count=1) if "<w:tblPr>" in body else body + f"<w:tblPr>{tb}</w:tblPr>"
        s = s[:m.start()] + m.group(1) + body + m.group(3) + s[m.end():]
    sp.write_text(s, encoding="utf-8")
    ref.unlink()
    with zipfile.ZipFile(ref, "w", zipfile.ZIP_DEFLATED) as z:
        for p in tmp.rglob("*"):
            if p.is_file(): z.write(p, p.relative_to(tmp).as_posix())
    return ref

HDR = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:hdr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
       'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:p><w:pPr><w:pBdr><w:bottom w:val="single" w:sz="4" w:space="1" w:color="D7DDE8"/></w:pBdr>'
       '<w:tabs><w:tab w:val="right" w:pos="9026"/></w:tabs></w:pPr><w:r><w:rPr><w:color w:val="5B6472"/><w:sz w:val="16"/></w:rPr><w:t xml:space="preserve">{short}</w:t></w:r>'
       '<w:r><w:rPr><w:color w:val="5B6472"/><w:sz w:val="16"/></w:rPr><w:tab/><w:t>Confidencial · Documento de trabajo</w:t></w:r></w:p></w:hdr>')
FLD = ('<w:r><w:rPr><w:color w:val="5B6472"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="begin"/></w:r><w:r><w:rPr><w:color w:val="5B6472"/><w:sz w:val="16"/></w:rPr><w:instrText xml:space="preserve"> {f} </w:instrText></w:r>'
       '<w:r><w:rPr><w:color w:val="5B6472"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="separate"/></w:r><w:r><w:rPr><w:color w:val="5B6472"/><w:sz w:val="16"/></w:rPr><w:t>1</w:t></w:r><w:r><w:rPr><w:color w:val="5B6472"/><w:sz w:val="16"/></w:rPr><w:fldChar w:fldCharType="end"/></w:r>')
FTR = ('<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:ftr xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" '
       'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><w:p><w:pPr><w:tabs><w:tab w:val="right" w:pos="9026"/></w:tabs></w:pPr>'
       '<w:r><w:rPr><w:color w:val="5B6472"/><w:sz w:val="16"/></w:rPr><w:t xml:space="preserve">{date}</w:t></w:r>'
       '<w:r><w:rPr><w:color w:val="5B6472"/><w:sz w:val="16"/></w:rPr><w:tab/><w:t xml:space="preserve">Página </w:t></w:r>' + FLD.format(f="PAGE") +
       '<w:r><w:rPr><w:color w:val="5B6472"/><w:sz w:val="16"/></w:rPr><w:t xml:space="preserve"> de </w:t></w:r>' + FLD.format(f="NUMPAGES") + '</w:p></w:ftr>')

def add_header_footer(docx, short):
    tmp = BUILD / ("hf_" + docx.stem); shutil.rmtree(tmp, ignore_errors=True)
    with zipfile.ZipFile(docx) as z: z.extractall(tmp)
    (tmp / "word" / "header1.xml").write_text(HDR.format(short=short), encoding="utf-8")
    (tmp / "word" / "footer1.xml").write_text(FTR.format(date=DATE), encoding="utf-8")
    rels = tmp / "word" / "_rels" / "document.xml.rels"; r = rels.read_text(encoding="utf-8")
    r = r.replace("</Relationships>",
        '<Relationship Id="rIdHdr1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/header" Target="header1.xml"/>'
        '<Relationship Id="rIdFtr1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/footer" Target="footer1.xml"/></Relationships>')
    rels.write_text(r, encoding="utf-8")
    ct = tmp / "[Content_Types].xml"; c = ct.read_text(encoding="utf-8")
    c = c.replace("</Types>",
        '<Override PartName="/word/header1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.header+xml"/>'
        '<Override PartName="/word/footer1.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.footer+xml"/></Types>')
    ct.write_text(c, encoding="utf-8")
    dp = tmp / "word" / "document.xml"; d = dp.read_text(encoding="utf-8")
    refs = '<w:headerReference w:type="default" r:id="rIdHdr1"/><w:footerReference w:type="default" r:id="rIdFtr1"/>'
    page = ('<w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="1440" w:right="1440" w:bottom="1440" w:left="1440" '
            'w:header="567" w:footer="567" w:gutter="0"/>')
    if re.search(r"<w:sectPr\s*/>", d):
        d = re.sub(r"<w:sectPr\s*/>", "<w:sectPr>" + refs + page + "</w:sectPr>", d, count=1)
    else:
        idx = d.rfind("<w:sectPr")
        if idx >= 0:
            end = d.find(">", idx) + 1
            d = d[:end] + refs + d[end:]
    dp.write_text(d, encoding="utf-8")
    st = tmp / "word" / "settings.xml"
    if st.exists():
        x = st.read_text(encoding="utf-8")
        if "updateFields" not in x:
            upd = '<w:updateFields w:val="true"/>'
            for anchor in ("<w:hdrShapeDefaults", "<w:footnotePr", "<w:endnotePr", "<w:compat", "<w:docVars", "<w:rsids"):
                if anchor in x:
                    x = x.replace(anchor, upd + anchor, 1); break
            else:
                x = x.replace("</w:settings>", upd + "</w:settings>")
            st.write_text(x, encoding="utf-8")
    docx.unlink()
    with zipfile.ZipFile(docx, "w", zipfile.ZIP_DEFLATED) as z:
        for p in tmp.rglob("*"):
            if p.is_file(): z.write(p, p.relative_to(tmp).as_posix())

def build_docx(name, d, ref):
    md = ('```{=openxml}\n<w:p><w:r><w:br w:type="page"/></w:r></w:p>\n```\n\n' + d["md"])
    md = re.sub(r"(?m)^\s*</?div[^>]*>\s*$", "", md)  # sin divs HTML en Word
    md = re.sub(r"\n{3,}", "\n\n", md)
    mdp = BUILD / f"{name}_docx.md"; mdp.write_text(md, encoding="utf-8")
    out = OUT / f"{name}_{SLUG}.docx"
    run(["pandoc", str(mdp), "-f", PD_FROM, "-t", "docx", "--reference-doc", str(ref),
         "--toc", f"--toc-depth={d['toc']}", "--wrap=none",
         "-M", f"title={d['title']}", "-M", f"subtitle={d['subtitle']}",
         "-M", "author=Preparado para el Dr. Gabriel González · Elaborado con asistencia de Claude Code · Confidencial, documento de trabajo",
         "-M", f"date={DATE}", "-M", "lang=es-AR", "-M", "toc-title=Índice", "-o", str(out)])
    add_header_footer(out, d["short"])
    return out

if __name__ == "__main__":
    docs = prep_docs()
    ref = make_reference()
    only = sys.argv[1:] or list(docs)
    for name in only:
        d = docs[name]
        p = build_pdf(name, d); print("PDF ", p, p.stat().st_size)
        w = build_docx(name, d, ref); print("DOCX", w, w.stat().st_size)
