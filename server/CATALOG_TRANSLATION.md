# Catalog Translation Pipeline

Kemalreis uses prepared catalog translations instead of translating during page requests.

## Architecture

1. The source product is stored in English.
2. A SHA-256 `sourceHash` is calculated from the title, description, category, brand, features and details.
3. The translation worker creates Turkish, Russian, Arabic and Simplified Chinese translations.
4. Valid translations are stored under `product.translations.<language>`.
5. Status, provider, attempts and the source hash are stored under `product.translationMeta.<language>`.
6. The product API serves a translation only when its status is `ready`, its schema version is current and its source hash matches the current product.
7. Missing, failed or stale translations safely fall back to English. Page requests never call the translation provider.

## Configuration

Copy the translation settings from `server/.env.example` into `server/.env` and set:

```env
TRANSLATION_PROVIDER=deepl
DEEPL_API_KEY=your-api-key
```

DeepL Free API keys ending in `:fx` automatically use the free API endpoint. Paid keys automatically use the production endpoint.

Optional glossary IDs can be configured separately:

```env
DEEPL_GLOSSARY_ID_TR=
DEEPL_GLOSSARY_ID_RU=
DEEPL_GLOSSARY_ID_AR=
DEEPL_GLOSSARY_ID_ZH=
```

Glossaries should preserve brand names, product families and approved e-commerce terminology.

## Commands

Check translation coverage:

```powershell
npm run server:translate:status
```

Translate one product into Turkish:

```powershell
npm run server:translate -- --product=amazon-PRODUCTKEY --languages=tr
```

Translate the 10 most popular products into all supported catalog languages:

```powershell
npm run server:translate -- --limit=10
```

Translate a larger batch:

```powershell
npm run server:translate -- --limit=250 --concurrency=1
```

Force a translation refresh after changing a glossary or quality rules:

```powershell
npm run server:translate -- --limit=25 --force
```

## Quality rules

- Brand names, model numbers, units and technical codes are protected.
- Product fields are translated as a structured batch, not as one uncontrolled paragraph.
- Empty results, incomplete batches, unchanged English output and invalid Russian/Arabic/Chinese script output are rejected.
- Failed output is recorded in metadata but is never published as a ready translation.
- Existing translations automatically become stale when source content changes.
- `reviewed: false` is stored for future native-speaker review and admin approval workflows.
