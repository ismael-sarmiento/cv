#!/usr/bin/env python3
"""Builds CV Online from data/content.json, the same way IsAcademy works:

  index.html            the page, written in Spanish with data-i18n keys (one page; English is /cv/?lang=en)
  i18n/es.json, en.json  { "key": "text" } dictionaries for the shared i18n module (/assets/ds/i18n.js)
  sitemap.xml
  404.html               copy of the portada's 404 page (build the portada first)
  (the downloadable PDFs come from tools/pdf.py, run after this build with the site served locally)

Every text is in the HTML, so visitors and crawlers read the whole CV without JavaScript; js/ adds behaviour.
The page uses the shared design system of ismael-sarmiento.github.io (/assets/ds). Run it after any change:

    python3 tools/build.py 20261014a      # the argument is the asset version (cache busting)
"""
import base64
import hashlib
import html
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
VERSION = sys.argv[1] if len(sys.argv) > 1 else '20261014a'
D = json.loads((ROOT / 'data/content.json').read_text())
SITE = 'https://ismael-sarmiento.github.io'
BASE = f'{SITE}/cv/'
TODAY = '2026-10-14'
CF_TOKEN = '1af8978bb58b4f6cb3771790a71c784c'  # Cloudflare Web Analytics (shared with the portada)


def flatten(node):
    """{'hero': {'subtitle': {'es': 'a', 'en': 'b'}}} -> {'es': {'hero.subtitle': 'a'}, 'en': {...}}; lists get indexes."""
    out = {'es': {}, 'en': {}}

    def walk(n, p, lang):
        if isinstance(n, dict):
            for k, val in n.items():
                walk(val, f'{p}.{k}' if p else k, lang)
        elif isinstance(n, list):
            for i, val in enumerate(n):
                walk(val, f'{p}.{i}', lang)
        elif isinstance(n, str):
            out[lang][p] = n

    def split(n, p):
        if isinstance(n, dict) and set(n) == {'es', 'en'}:
            walk(n['es'], p, 'es')
            walk(n['en'], p, 'en')
        elif isinstance(n, dict):
            for k, val in n.items():
                split(val, f'{p}.{k}' if p else k)
        elif isinstance(n, list):
            for i, val in enumerate(n):
                split(val, f'{p}.{i}')
        elif isinstance(n, str):
            out['es'][p] = out['en'][p] = n

    split(node, '')
    return out


# only what the page shows is translated by i18n; Alan's knowledge (faq items and prompts) travels in the cv-data block
PAGE_TEXT = dict(D)
PAGE_TEXT['faq'] = {'heading': D['faq']['heading']}
DICT = flatten(PAGE_TEXT)
ES = DICT['es']
assert set(DICT['es']) == set(DICT['en']), 'Spanish and English must have the same keys: ' + str(set(DICT['es']) ^ set(DICT['en']))

sha = lambda s: base64.b64encode(hashlib.sha256(s.encode()).digest()).decode()
# applied before the first paint: shared theme choice + a flag that lets CSS show the intro only with JavaScript
BOOT = "document.documentElement.classList.add('js');try{var t=localStorage.getItem('isa-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t}catch(e){}"
DS_MODULES = ['/assets/ds/ds.js', '/assets/ds/i18n.js', '/assets/ds/signature.js', '/assets/ds/avatar.js', '/assets/ds/assistant.js']
MODULES = DS_MODULES + sorted(f'/cv/js/{f.name}' for f in (ROOT / 'js').glob('*.js'))
IMPORT_MAP = json.dumps({'imports': {m: f'{m}?v={VERSION}' for m in MODULES}}, separators=(',', ':'))
CSP = ("default-src 'self'; script-src 'self' https://static.cloudflareinsights.com "
       f"'sha256-{sha(BOOT)}' 'sha256-{sha(IMPORT_MAP)}'; style-src 'self'; img-src 'self' data:; font-src 'self'; "
       "connect-src 'self' https://cloudflareinsights.com; object-src 'none'; base-uri 'none'; form-action 'none'")

e = lambda s: html.escape(str(s), quote=True)
v = lambda path: f'{path}?v={VERSION}'


def T(key, tag='span', cls='', extra=''):
    """An element whose text is the Spanish value of `key`, translated by the i18n module."""
    c = f' class="{cls}"' if cls else ''
    return f'<{tag}{c} data-i18n="{key}"{extra}>{e(ES[key])}</{tag}>'


def A(attr, key):
    """An attribute translated by the i18n module (aria-label, placeholder, alt, href)."""
    data = {'aria-label': 'data-i18n-aria', 'placeholder': 'data-i18n-ph', 'alt': 'data-i18n-alt', 'href': 'data-i18n-href'}[attr]
    return f'{attr}="{e(ES[key])}" {data}="{key}"'


def count(prefix):
    """How many items a list has (the same in both languages, checked by the assert above)."""
    n = 0
    while any(k == f'{prefix}.{n}' or k.startswith(f'{prefix}.{n}.') for k in ES):
        n += 1
    return n


MOON = '<svg class="i-moon" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="currentColor" d="M20.7 14.4A8.5 8.5 0 0 1 9.6 3.3a.7.7 0 0 0-.8-.8A10.2 10.2 0 1 0 21.5 15a.7.7 0 0 0-.8-.6Z"/></svg>'
SUN = '<svg class="i-sun" viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><circle cx="12" cy="12" r="4" fill="currentColor"/><path stroke="currentColor" stroke-width="2" stroke-linecap="round" d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.3 5.3l1.4 1.4M17.3 17.3l1.4 1.4M5.3 18.7l1.4-1.4M17.3 6.7l1.4-1.4"/></svg>'
WORD, WX = 'mael Sarmiento', 296
SIG = f'''<svg class="sig" viewBox="0 0 {WX + len(WORD) * 78} 330" data-word="{WORD}" aria-hidden="true" focusable="false">
        <defs>
          <linearGradient id="is-edge" x1="0" x2="1"><stop offset="0" stop-color="#fff"/><stop offset=".9" stop-color="#fff"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>
          <mask id="is-ink" maskUnits="userSpaceOnUse" x="0" y="0" width="3000" height="330"><rect class="ink" x="0" y="0" width="3000" height="330" fill="url(#is-edge)"/></mask>
        </defs>
        <text class="is is-stroke" x="70" y="250">Is</text>
        <text class="is is-fill" x="70" y="250" mask="url(#is-ink)">Is</text>
        <text class="word" x="{WX}" y="245">{WORD}</text>
        <rect class="cursor" x="0" y="150" width="6" height="122" rx="3" opacity="0"/>
      </svg>'''


def toggles():
    """The same controls on every site: IsAcademy's language button and the moon/sun theme button."""
    return (f'<button class="btn btn-icon lang-btn" type="button" data-action="lang" {A("aria-label", "ui.cv.langLabel")}>'
            f'{T("ui.cv.langShort")}</button>'
            f'<button class="btn btn-icon theme-btn" type="button" data-action="theme" {A("aria-label", "ui.actions.theme")}>{MOON}{SUN}</button>')


def structured_data():
    """ProfilePage for this CV; the Person is the canonical one described on the portada."""
    m = D['meta']
    return {
        '@context': 'https://schema.org', '@type': 'ProfilePage', '@id': f'{BASE}#profile-page', 'url': BASE,
        'name': m['title']['es'], 'description': m['description']['es'], 'inLanguage': ['es', 'en'],
        'isPartOf': {'@id': f'{SITE}/#website'},
        'mainEntity': {
            '@type': 'Person', '@id': f'{SITE}/#person', 'name': 'Ismael Sarmiento', 'alternateName': 'Ismael A. Sarmiento',
            'url': f'{SITE}/', 'image': f'{SITE}/assets/brand/ismael.jpg', 'email': f"mailto:{m['email']}",
            'jobTitle': 'Head of Data Management',
            'hasOccupation': [{'@type': 'Occupation', 'name': n} for n in ('Head of Data Management', 'Lead Data Engineer')],
            'worksFor': {'@type': 'Organization', 'name': 'Savana', 'url': m['currentCompany']},
            'founder': {'@id': f'{SITE}/isacademy/#org'},
            'memberOf': {'@type': 'Organization', 'name': 'DAMA Spain', 'url': 'https://www.damaspain.org/'},
            'hasCredential': [
                {'@type': 'EducationalOccupationalCredential', 'name': 'CDMP Certification – Associate', 'credentialCategory': 'certification',
                 'recognizedBy': {'@type': 'Organization', 'name': 'DAMA International'}},
                {'@type': 'EducationalOccupationalCredential', 'name': 'FHIR Foundational Implementer', 'credentialCategory': 'certification'},
            ],
            'knowsAbout': ['Data Governance', 'Clinical Interoperability', 'Data Quality', 'Data Lifecycle Management', 'HL7 FHIR',
                           'OMOP CDM', 'DataHub', 'AWS', 'Apache Spark', 'Apache Airflow', 'Apache Superset'],
            'sameAs': [m['linkedin'], m['github'], 'https://github.com/kimera-tools'],
        },
    }


def client_data():
    """What js/ needs at runtime (Alan, intro) in both languages, as an inert JSON block."""
    out = {}
    for lang in ('es', 'en'):
        ui, cv = D['ui'][lang], D['ui'][lang]['cv']
        a, alan = ui['assistant'], cv['alan']
        out[lang] = {
            'assistant': {
                'name': alan['name'], 'badge': alan['badge'], 'subtitle': alan['subtitle'], 'open': alan['open'],
                'openLabel': alan['openLabel'], 'close': alan['close'], 'placeholder': a['inputPlaceholder'], 'send': a['send'],
                'typing': alan['typing'],
                # four suggestions, as in IsAcademy: focus, Savana, certifications and privacy (the rest are still answered)
                'suggestions': [D['faq']['prompts'][lang][i] for i in (0, 1, 9, 7)],
                'greeting': alan['greeting'],
                'fallback': {'answer': a['noMatch'], 'actions': [{'label': alan['contact'], 'href': '#contact'}]},
            },
            'faq': D['faq']['items'][lang],
            'steps': D['loader_milestones'][lang],
        }
    return out


def head():
    m = D['meta']
    data_block = json.dumps(client_data(), ensure_ascii=False).replace('</', '<\\/')  # never closes the tag early
    return f'''<head>
  <meta charset="utf-8">
  <meta http-equiv="Content-Security-Policy" content="{CSP}">
  <meta name="referrer" content="strict-origin-when-cross-origin">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <title>{e(m['title']['es'])}</title>
  <meta name="description" content="{e(m['description']['es'])}">
  <meta name="author" content="Ismael Sarmiento">
  <meta name="keywords" content="Ismael Sarmiento, Head of Data Management, Lead Data Engineer, Savana, CDMP, DAMA, GitHub, gobierno del dato, data governance, HL7 FHIR, OMOP CDM, DataHub">
  <meta name="theme-color" content="#0b1026">
  <link rel="canonical" href="{BASE}">
  <link rel="alternate" hreflang="es" href="{BASE}">
  <link rel="alternate" hreflang="en" href="{BASE}?lang=en">
  <link rel="alternate" hreflang="x-default" href="{BASE}">
  <link rel="me" href="{m['github']}">
  <link rel="me" href="{m['linkedin']}">
  <meta property="og:type" content="profile">
  <meta property="og:site_name" content="Ismael Sarmiento">
  <meta property="og:locale" content="es_ES">
  <meta property="og:locale:alternate" content="en_GB">
  <meta property="og:url" content="{BASE}">
  <meta property="og:title" content="{e(m['title']['es'])}">
  <meta property="og:description" content="{e(D['hero']['subtitle']['es'])}">
  <meta property="og:image" content="{SITE}/cv/assets/brand/og.png">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="{e(m['title']['es'])}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" href="/assets/brand/favicon-32.png" sizes="32x32" type="image/png">
  <link rel="apple-touch-icon" href="/assets/brand/apple-touch-icon.png">
  <script>{BOOT}</script>
  <link rel="preload" href="/assets/ds/fonts/space-grotesk-latin.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="{v('/assets/ds/tokens.css')}">
  <link rel="stylesheet" href="{v('/assets/ds/base.css')}">
  <link rel="stylesheet" href="{v('/assets/ds/assistant.css')}">
  <link rel="stylesheet" href="{v('/cv/css/cv.css')}">
  <link rel="stylesheet" href="{v('/cv/css/print.css')}" media="print">
  <script type="importmap">{IMPORT_MAP}</script>
  <script type="module" src="{v('/cv/js/app.js')}"></script>
  <script type="application/ld+json">{json.dumps(structured_data(), ensure_ascii=False)}</script>
  <script type="application/json" id="cv-data">{data_block}</script>
</head>'''

# the PDF / printed CV opens with the signature and the contact line (hidden on screen; css/print.css shows it)
PRINT_HEAD = ('<div class="print-head" aria-hidden="true">'
              + SIG.replace('is-edge', 'pr-edge').replace('is-ink', 'pr-ink')
              + '<p class="print-contact">ismaelantonio.professional@gmail.com<br>linkedin.com/in/ismael-sarmiento<br>ismael-sarmiento.github.io/cv/</p></div>')


def intro():
    n = count('loader_milestones')
    segs = ''.join('<span></span>' for _ in range(n))
    steps = ''.join(T(f'loader_milestones.{i}', 'li') for i in range(n))
    return f'''<div id="intro" role="dialog" aria-modal="true" aria-labelledby="intro-title">
    <div class="intro-top">{toggles()}<button class="btn" type="button" data-action="skip">{T('ui.cv.skip')}</button></div>
    <div class="intro-stage">
      <p class="sr-only" id="intro-title">Ismael Sarmiento · CV Online</p>
      <div class="intro-sig">{SIG}</div>
      <div class="intro-after">
        <p class="pill intro-tag">CV Online</p>
        {T('hero.subtitle', 'p', 'intro-hook')}
        <div class="intro-milestones" aria-hidden="true"><div class="intro-segs">{segs}</div><p class="intro-step"></p></div>
        <ol class="sr-only" {A('aria-label', 'ui.cv.introLabel')}>{steps}</ol>
      </div>
      <div class="intro-actions"><button class="btn btn-primary btn-lg btn-arrow" type="button" data-action="enter">{T('ui.cv.enter')}</button></div>
    </div>
  </div>'''


def topbar():
    return f'''<header class="topbar">
    <div class="container topbar-row">
      <a class="brand" href="/" data-i18n-href="ui.cv.homeHref" aria-label="Ismael Sarmiento"><span class="brand-is" aria-hidden="true">Is</span><span class="brand-name" aria-hidden="true">mael Sarmiento</span></a>
      <a class="pill brand-tag" href="#top">CV Online</a>
      <nav class="nav" {A('aria-label', 'ui.cv.primaryNav')}>
        <a href="#summary" data-nav="summary">{T('ui.navigation.summary')}</a>
        <a href="#story" data-nav="story">{T('ui.navigation.story')}</a>
        <a href="#cases" data-nav="cases">{T('ui.navigation.cases')}</a>
        <a href="#timeline" data-nav="timeline">{T('ui.navigation.timeline')}</a>
        <a href="#contact" data-nav="contact">{T('contact.heading')}</a>
      </nav>
      <div class="tools">
        <button class="btn view-btn" type="button" data-action="view" aria-pressed="false">{T('ui.actions.summaryMode', 'span', 'when-off')}{T('ui.actions.fullMode', 'span', 'when-on')}</button>
        {toggles()}
      </div>
    </div>
    <div class="read-progress"></div>
    <div class="summary-notice" role="status"><div class="container summary-notice-row">{T('ui.cv.summaryNotice', 'p')}<button class="btn btn-sm btn-arrow" type="button" data-action="view">{T('ui.actions.fullMode')}</button></div></div>
  </header>'''


def section_head(eyebrow, title, intro=None, hid=None):
    h = f' id="{hid}"' if hid else ''
    i = T(intro, 'p', 'lead') if intro else ''
    return f'<div class="section-head reveal">{T(eyebrow, "p", "eyebrow")}{T(title, "h2", extra=h)}{i}</div>'


def more(inner, label):
    """Long texts stay in the HTML (and in search engines) but open on demand, so blocks do not feel heavy."""
    return f'<details class="more"><summary>{T(label)}</summary><div class="more-body">{inner}</div></details>'


def ps(prefix, start=0, end=None):
    end = count(prefix) if end is None else end
    return ''.join(T(f'{prefix}.{i}', 'p') for i in range(start, end))


def li(prefix):
    return ''.join(T(f'{prefix}.{i}', 'li') for i in range(count(prefix)))


def main():
    def chip(g, j):
        item = D['ecosystem']['groups'][g]['items'][j]
        label = T(f'ecosystem.groups.{g}.items.{j}.label') if isinstance(item['label'], dict) else e(item['label'])
        return f'<li><a href="{e(item["href"])}" rel="noopener">{label}</a></li>' if item['href'] else f'<li>{label}</li>'
    eco = ''.join(f'<article class="card card--static eco reveal">{T(f"ecosystem.groups.{g}.title", "h3")}<ul class="chips">'
                  + ''.join(chip(g, j) for j in range(len(D['ecosystem']['groups'][g]['items']))) + '</ul></article>'
                  for g in range(len(D['ecosystem']['groups'])))
    universe = ''.join(f'<a class="contact-link" href="{href}"{extra}>{name}<strong>{shown}</strong></a>'
                       for name, href, extra, shown in (
                           (T('ui.cv.home'), '/', ' data-i18n-href="ui.cv.homeHref"', 'ismael-sarmiento.github.io'),
                           ('<span>IsAcademy</span>', '/isacademy/', '', 'ismael-sarmiento.github.io/isacademy'),
                           ('<span>Kimera Tools</span>', 'https://github.com/kimera-tools', ' rel="noopener"', 'github.com/kimera-tools')))
    layers = ''.join(f'<li class="layer"><span class="node" aria-hidden="true"></span><div>{T(f"hero.layers.{i}.title", "h3")}{T(f"hero.layers.{i}.text", "p")}</div></li>'
                     for i in range(count('hero.layers')))
    proofs = ''.join(f'<article class="card reveal">{T("ui.labels.keyValue", "p", "eyebrow")}{T(f"hero.proofPoints.{i}.title", "h3")}{T(f"hero.proofPoints.{i}.body", "p")}</article>'
                     for i in range(count('hero.proofPoints')))
    pillars = ''.join(f'<article class="pillar reveal">{T(f"summary.pillars.{i}.label", "h3")}{T(f"summary.pillars.{i}.text", "p")}</article>'
                      for i in range(count('summary.pillars')))
    stats = ''.join(f'<div class="stat">{T(f"ui.cv.stats.{i}.label", "strong")}{T(f"ui.cv.stats.{i}.text", "p")}</div>' for i in range(count('ui.cv.stats')))
    n_prog = count('experience.spotlight.progression')
    # the career ladder is read from the bottom (first role) to the top (current role); css/cv.css animates it upwards
    rungs = []
    for i in range(n_prog):
        now = i == n_prog - 1
        tag = T('ui.cv.current', 'span', 'rung-tag') if now else ''
        rungs.append(f'<li class="rung{" rung-now" if now else ""}" data-step="{i}"><span class="rung-dot" aria-hidden="true"></span>'
                     f'{T(f"experience.spotlight.progression.{i}", "span", "rung-name")}{tag}</li>')
    ladder = ''.join(rungs)
    cases = ''.join(f'''<article class="card case reveal" id="{e(D["case_studies"]["items"]["es"][i]["id"])}">{T(f"case_studies.items.{i}.kicker", "p", "eyebrow")}{T(f"case_studies.items.{i}.title", "h3")}
          {T(f"case_studies.items.{i}.summary", "p")}{more(f'<ul class="ticks">{li(f"case_studies.items.{i}.outcomes")}</ul>', 'ui.cv.outcomes')}</article>'''
                    for i in range(count('case_studies.items')))
    timeline = ''.join(f'''<li class="tl-item reveal"><div class="tl-head"><div>{T(f"experience.timeline.{i}.company", "h3")}{T(f"experience.timeline.{i}.role", "p", "tl-role")}</div>
          {T(f"experience.timeline.{i}.period", "span", "tl-period")}</div>{T(f"experience.timeline.{i}.text", "p")}</li>''' for i in range(count('experience.timeline')))
    creds = ''.join(f'<article class="card card--static reveal">{T(f"credentials.groups.{i}.title", "h3")}<ul class="ticks">{li(f"credentials.groups.{i}.items")}</ul></article>'
                    for i in range(count('credentials.groups')))
    contact = ''.join(f'''<a class="contact-link" href="{e(x["href"])}"{' rel="noopener"' if x["href"].startswith("http") else ''}>
            {T(f"contact.items.{i}.label")}<strong>{e(x["value"])}</strong></a>''' for i, x in enumerate(D['contact']['items']['es']))
    return f'''<main id="main">
    {PRINT_HEAD}
    <section class="hero" id="top" aria-labelledby="hero-title">
      <div class="container hero-grid">
        <div class="hero-copy stagger">
          <p class="eyebrow reveal">Ismael Sarmiento · CV Online</p>
          <h1 id="hero-title" class="reveal">{T('hero.headlinePrimary', 'span', 'h1-main')}{T('hero.headlineSecondary', 'span', 'h1-sub')}</h1>
          {T('hero.subtitle', 'p', 'lead reveal')}
          <ul class="ticks hero-facts reveal">{li('hero.quickFacts')}</ul>
          <div class="hero-cta reveal">
            <a class="btn btn-primary btn-lg btn-arrow" href="#summary">{T('ui.actions.summaryCta')}</a>
            <a class="btn btn-lg" href="#contact">{T('ui.actions.contactCta')}</a>
          </div>
        </div>
        <aside class="hero-panel reveal" {A('aria-label', 'ui.cv.careerLabel')}>
          <div class="card card--static">
            {T('ui.labels.overview', 'p', 'eyebrow')}
            {T('hero.trajectoryHeading', 'h2', 'panel-title')}
            {ps('hero.trajectoryIntro', 0, 1)}
            {more(ps('hero.trajectoryIntro', 1), 'ui.cv.more')}
          </div>
          {T('ui.labels.layers', 'h3', 'layers-title')}
          <ul class="layers">{layers}</ul>
        </aside>
      </div>
    </section>

    <section class="section alt" id="summary" data-section="summary">
      <div class="container">
        {section_head('ui.navigation.summary', 'summary.heading', 'summary.lead')}
        <div class="summary-grid stagger">
          <article class="summary-copy reveal">{ps('summary.paragraphs')}</article>
          {proofs}
        </div>
        <div class="pillars stagger">{pillars}</div>
      </div>
    </section>

    <section class="section detail" id="about">
      <div class="container about-grid">
        <div>{section_head('about.heading', 'about.heading')}<div class="reveal">{ps('about.paragraphs')}</div></div>
        <aside class="card card--static stats reveal">{stats}</aside>
      </div>
    </section>

    <section class="section alt detail" id="story" data-section="story">
      <div class="container">
        {section_head('experience.spotlight.chapter', 'experience.spotlight.heading', 'experience.spotlight.title')}
        <div class="story-grid">
          <article class="story-copy reveal">{ps('experience.spotlight.paragraphs', 0, 2)}{more(ps('experience.spotlight.paragraphs', 2), 'ui.cv.storyMore')}</article>
          <aside class="card card--static">
            {T('ui.labels.progression', 'p', 'eyebrow')}
            <ol class="ladder reveal">{ladder}</ol>
            {T('ui.labels.currentFocus', 'p', 'eyebrow focus-label')}
            <ul class="ticks">{li('experience.spotlight.focus')}</ul>
          </aside>
        </div>
      </div>
    </section>

    <section class="section detail" id="cases" data-section="cases">
      <div class="container">
        {section_head('case_studies.heading', 'case_studies.heading', 'case_studies.intro')}
        <div class="cases-grid stagger">{cases}</div>
      </div>
    </section>

    <section class="section alt detail" id="timeline" data-section="timeline">
      <div class="container">
        {section_head('ui.labels.timeline', 'experience.timelineHeading')}
        <ol class="timeline stagger">{timeline}</ol>
      </div>
    </section>

    <section class="section" id="credentials">
      <div class="container">
        {section_head('ui.labels.credentials', 'credentials.heading')}
        <div class="creds-grid stagger">{creds}</div>
      </div>
    </section>

    <section class="section alt detail" id="ecosystem">
      <div class="container">
        {section_head('ecosystem.heading', 'ecosystem.heading', 'ecosystem.intro')}
        <div class="eco-grid stagger">{eco}</div>
      </div>
    </section>

    <section class="section" id="contact" data-section="contact">
      <div class="container">
        {section_head('contact.heading', 'contact.heading', 'contact.intro')}
        <div class="contact-grid stagger">
          <div class="card card--static reveal">{T('ui.cv.contactLead', 'p')}<div class="contact-links">{contact}</div>
            <a class="btn btn-arrow pdf-btn" href="/cv/ismael-sarmiento-cv.pdf" data-i18n-href="ui.cv.pdfHref" download>{T('ui.cv.pdf')}</a></div>
          <div class="card card--static reveal">{T('ui.cv.elsewhere', 'p', 'eyebrow')}{T('ui.cv.linksNote', 'p')}<div class="contact-links">{universe}</div></div>
        </div>
      </div>
    </section>

    <section class="section alt" id="assistant" aria-labelledby="assistant-title">
      <div class="container">
        <div class="card card--static alan reveal">
          <span class="as-avatar alan-avatar" aria-hidden="true"></span>
          <div class="alan-body">
            <p class="eyebrow">{T('ui.labels.assistant')} <span class="as-badge">Beta</span></p>
            {T('faq.heading', 'h2', extra=' id="assistant-title"')}
            {T('ui.assistant.note', 'p')}
            <div class="alan-actions">
              <button class="btn btn-primary btn-arrow" type="button" data-action="open-alan">{T('ui.cv.talk')}</button>
            </div>
          </div>
        </div>
      </div>
    </section>
  </main>'''


def footer():
    return f'''<footer class="footer">
    <div class="container footer-row">
      <span>© <span data-year>2026</span> Ismael Sarmiento. {T('ui.cv.rights')}</span>
      <nav class="footer-links" aria-label="Ismael Sarmiento">
        <a href="/" data-i18n-href="ui.cv.homeHref">{T('ui.cv.home')}</a><a href="/isacademy/">IsAcademy</a><a href="https://github.com/kimera-tools" rel="noopener">Kimera Tools</a>
        <a href="{e(D['meta']['linkedin'])}" rel="noopener me">LinkedIn</a><a href="{e(D['meta']['github'])}" rel="noopener me">GitHub</a>
      </nav>
    </div>
  </footer>'''


def page():
    return f'''<!doctype html>
<html lang="es">
{head()}
<body>
  <a class="skip-link" href="#main">{T('ui.skipToContent')}</a>
  {intro()}
  {topbar()}
  {main()}
  {footer()}
  <!-- Cloudflare Web Analytics --><script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{{"token": "{CF_TOKEN}"}}'></script><!-- End Cloudflare Web Analytics -->
</body>
</html>
'''


SITEMAP = f'''<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>{BASE}</loc><lastmod>{TODAY}</lastmod>
    <xhtml:link rel="alternate" hreflang="es" href="{BASE}"/><xhtml:link rel="alternate" hreflang="en" href="{BASE}?lang=en"/>
  </url>
  <url>
    <loc>{BASE}?lang=en</loc><lastmod>{TODAY}</lastmod>
    <xhtml:link rel="alternate" hreflang="es" href="{BASE}"/><xhtml:link rel="alternate" hreflang="en" href="{BASE}?lang=en"/>
  </url>
</urlset>
'''

if __name__ == '__main__':
    (ROOT / 'index.html').write_text(page())
    (ROOT / 'i18n').mkdir(exist_ok=True)
    for lang in ('es', 'en'):
        (ROOT / f'i18n/{lang}.json').write_text(json.dumps(DICT[lang], ensure_ascii=False, indent=0))
    (ROOT / 'sitemap.xml').write_text(SITEMAP)
    # unknown /cv/... addresses get the portada's 404 (same origin, absolute paths); build the portada first
    hub_404 = ROOT.parent / 'ismael-sarmiento.github.io' / '404.html'
    if hub_404.exists():
        (ROOT / '404.html').write_text(hub_404.read_text())
    print(f'built /cv/ (es, i18n/en.json with {len(DICT["en"])} keys) and sitemap.xml (version {VERSION})')
