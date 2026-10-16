# Ismael Sarmiento · CV Online

> *Online CV of Ismael Sarmiento, Head of Data Management at Savana. Spanish and English.*

CV web de **Ismael Sarmiento**, Head of Data Management en Savana y antes Lead Data Engineer: gobierno del dato,
interoperabilidad clínica, calidad de datos de extremo a extremo y plataformas fiables.

- **Web:** https://ismael-sarmiento.github.io/cv/ (español) · [versión en inglés](https://ismael-sarmiento.github.io/cv/?lang=en)
- **Portada:** https://ismael-sarmiento.github.io/ · **Academia:** [IsAcademy](https://ismael-sarmiento.github.io/isacademy/)
- **Hosting:** GitHub Pages, sitio 100 % estático. Todo el texto está en el HTML; el JavaScript solo añade comportamiento.
- **Idiomas:** español por defecto e inglés con `?lang=en`, como IsAcademy · **Temas:** claro y oscuro (idioma y tema se
  comparten con la portada e IsAcademy).

## Qué incluye

- Intro con la firma de Ismael Sarmiento (la «Is» manuscrita y el nombre decodificado, como en IsAcademy) y los hitos de impacto.
- Resumen ejecutivo, trayectoria en Savana (escalera Senior → Lead → Head), casos destacados, trayectoria compacta,
  credenciales (CDMP de DAMA International, DAMA Spain, formación académica) y contacto.
- Modo resumen para una lectura rápida (`?view=summary`) y textos largos que se despliegan con «Leer más».
- CV en PDF descargable (español e inglés) con el mismo diseño que la web, generado con `tools/pdf.py`.
- **Alan**, el asistente compartido con IsAcademy: local y en beta, responde solo con el contenido público del CV.
- Ecosistema por temas: interoperabilidad clínica, gobierno del dato, calidad del dato (UNE 0081), plataforma y cloud, e IA.
- SEO técnico: `canonical` e `hreflang`, `sitemap.xml`, Open Graph y JSON-LD (`ProfilePage` + la `Person` de la portada).

## Estructura

```
data/content.json     Todo el contenido en español e inglés (única fuente de textos)
tools/build.py        Genera index.html (en español, con claves de traducción), i18n/es.json, i18n/en.json y sitemap.xml
tools/pdf.py          Genera ismael-sarmiento-cv.pdf y ismael-sarmiento-cv-en.pdf con Chrome (sitio servido en local)
tools/qa/flows.js     Comprueba en el navegador que cada botón hace lo que debe
i18n/                 Diccionarios generados para el cambio de idioma (/assets/ds/i18n.js)
js/                   app.js (entrada; la intro es la común de /assets/ds/intro.js) · view (modo resumen) · nav · assistant (Alan)
css/cv.css            Estilos propios, encima del sistema de diseño compartido
css/print.css         Diseño en papel: el PDF y la impresión desde el navegador
assets/brand/og.png   Imagen al compartir
articles/_template/   Plantilla de artículos bilingües (ver docs/ARTICLES.md)
docs/                 Arquitectura, artículos y tareas pendientes
```

El sistema de diseño compartido (tokens, componentes, idiomas, firma y Alan) vive en el repositorio de la portada,
[`ismael-sarmiento.github.io`](https://github.com/ismael-sarmiento/ismael-sarmiento.github.io), en `/assets/ds/`.

## Desarrollo local

1. Edita `data/content.json` (textos) o `js/` y `css/`.
2. Genera las páginas con una versión nueva, para que el navegador no mezcle ficheros en caché:

   ```bash
   python3 tools/build.py 20261014a
   ```

   Con el sitio servido en local, regenera los PDF: `python3 tools/pdf.py http://127.0.0.1:8777/`.

3. Sírvelo junto con la portada, que aporta `/assets/ds/`: una carpeta con la portada en la raíz y este repositorio en `cv/`.

## Despliegue

GitHub Pages publica la rama `main` en https://ismael-sarmiento.github.io/cv/ en cada cambio.

## Documentación

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): mapa técnico.
- [`docs/ARTICLES.md`](docs/ARTICLES.md): cómo publicar un artículo.
- [`docs/TODO.md`](docs/TODO.md): trabajo pendiente.

© Ismael Sarmiento. Todos los derechos reservados sobre el contenido del CV.
