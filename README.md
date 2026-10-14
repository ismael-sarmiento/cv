# Ismael Sarmiento · CV online

> *Online CV of Ismael Sarmiento, Lead Data Engineer focused on data governance. Spanish and English.*

CV web de **Ismael Sarmiento**, Lead Data Engineer especializado en gobierno del dato, interoperabilidad
clínica, calidad de datos de extremo a extremo y plataformas fiables.

- **Web:** https://ismael-sarmiento.github.io/ (español) · [versión en inglés](https://ismael-sarmiento.github.io/index_en.html)
- **Hosting:** GitHub Pages, sitio 100 % estático: sin backend ni paso de build.
- **Idiomas:** español e inglés · **Temas:** claro y oscuro.

## Qué incluye

- Pantalla de carga con los hitos de impacto más relevantes.
- Resumen ejecutivo y trayectoria profesional.
- Asistente local que responde sin modelos externos.
- Resumen en audio en español e inglés, con voz del navegador si el audio no está disponible.
- Base para artículos profesionales bilingües.
- SEO técnico: `canonical` e `hreflang` por idioma, `sitemap.xml`, Open Graph y JSON-LD (`ProfilePage` + `Person`).

## Estructura

```
index.html            Entrada en español
index_en.html         Entrada en inglés (página real, sin redirección)
assets/content.js     Todo el contenido en español e inglés
assets/app.js         Renderizado, cambio de idioma, asistente y audio
assets/app.css        Identidad visual, diseño adaptable y animaciones
assets/print.css      Estilos de impresión
assets/audio/         Resúmenes en audio
articles/             Artículos bilingües: plantilla en _template/ y registro en manifest.json
docs/                 Arquitectura, flujo de artículos y tareas pendientes
robots.txt            Reglas para buscadores; enlaza este sitemap y el de IsAcademy
sitemap.xml           Páginas públicas
```

## Desarrollo local

No necesita instalar nada: basta con servir la carpeta.

```bash
python3 -m http.server 8000
```

y abrir http://localhost:8000.

## Despliegue

GitHub Pages publica la rama `main` desde la raíz del repositorio en cada cambio.

## Documentación

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md): mapa técnico.
- [`docs/ARTICLES.md`](docs/ARTICLES.md): cómo publicar un artículo.
- [`docs/TODO.md`](docs/TODO.md): trabajo pendiente.

## Más

- Academia: [IsAcademy](https://ismael-sarmiento.github.io/isacademy/), clases online de programación, datos e IA.
- Código abierto: [kimera-tools](https://github.com/kimera-tools).
- LinkedIn: [in/ismael-sarmiento](https://www.linkedin.com/in/ismael-sarmiento/).

© Ismael Sarmiento. Todos los derechos reservados sobre el contenido del CV.
