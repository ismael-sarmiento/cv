# Articles

Articles are standalone bilingual HTML pages, published from day one in both languages:

- Spanish: `articles/<slug>/index.html` → `https://ismael-sarmiento.github.io/cv/articles/<slug>/`
- English: `articles/<slug>/en.html` → `https://ismael-sarmiento.github.io/cv/articles/<slug>/en.html` (no `/en/` folder,
  as everywhere else; the English CV is `/cv/?lang=en`)

## Workflow

1. Copy `articles/_template/index.html` (Spanish) and `articles/_template/index_en.html` (English) to the two paths above.
2. Replace every `{{…}}` placeholder (title, description, date, canonical URLs, body).
3. Register the article in `articles/manifest.json` (slug, titles, dates, LinkedIn URL when it exists).
4. Add both URLs to the sitemap in `tools/build.py` and rebuild.
5. An article may go live before its LinkedIn post exists; leave the LinkedIn reference empty and fill it later.

The article listing is not linked from the CV until there is at least one real article.
