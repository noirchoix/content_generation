# AI Social Content Engine

A SvelteKit/TypeScript content-transformation product that ingests uploaded text or web articles, extracts and bounds source content, streams platform-specific generation over SSE, and routes between LLM providers with explicit timeouts and fallback behavior.

## Engineering profile

This repository demonstrates:

- SvelteKit/Svelte 5 + TypeScript full-stack implementation
- Uploaded-document and article-URL input modes
- Server-side article extraction using Readability/JSDOM/Cheerio-style parsing
- DeepSeek primary provider with OpenRouter fallback, timeout/abort behavior, and provider logging
- Server-sent event streaming for generation status/output
- Platform-specific prompt contracts for Instagram, LinkedIn, X, TikTok, and multiple content formats
- Brand-memory/product workflow and explicit unsupported-claim constraints

## Reliability and scope

The lightweight retrieval/brand-memory path should not be advertised as production vector RAG. Server-side URL fetching also needs stronger SSRF/private-network protections for production use.

## Features

### Core generation
- Generate content for:
  - Instagram
  - LinkedIn
  - X
  - TikTok
- Generate formats:
  - Caption
  - Carousel
  - Video Script
  - Hook List

### Input modes
- **Document mode**
  - Upload `.txt`, `.md`, `.html`, `.json`, `.csv`, and other text-like files
- **Article URL mode**
  - Extract readable article text from a URL
  - Direct fetch first
  - Readable fallback for blocked or JavaScript-heavy pages

### UX
- Streaming generation status and preview
- Per-platform output tabs
- Copy-to-clipboard for publish-ready text
- TXT download
- Notes shown in UI but excluded from copy flow
- Closable content pack on landing page
- Clear file / clear link support
- Mode-based source selection to avoid conflicting inputs

---

## Tech Stack

### Frontend
- Svelte 5
- SvelteKit

### Backend
- SvelteKit server routes

### LLM providers
- DeepSeek as primary provider
- OpenRouter as fallback provider

### Extraction and preprocessing
- Native `fetch`
- `@mozilla/readability`
- `jsdom`
- `cheerio`
- LangChain text splitting / context preparation

---

## Project Structure

```txt
src/
  lib/
    config/
      formats.ts
      platforms.ts

    helpers/
      cleanText.ts
      chunkText.ts
      extractPlainText.ts
      formatOutput.ts
      normalizeUrl.ts
      validateInput.ts

    server/
      extract/
        extractArticle.ts
        fetchReadableUrl.ts
        fetchUrl.ts
        prepareContext.ts

      langchain/
        loaders.ts
        splitter.ts

      llm/
        buildPrompt.ts
        openrouter.ts
        prompts.ts
        systemPrompt.ts

    types/
      brand.ts
      content.ts
      platform.ts

  routes/
    +page.svelte
    dashboard/+page.svelte

    api/
      download/+server.ts
      generate/+server.ts
      scrape/+server.ts
      upload/+server.ts

static/
  hero_social.png
  upload_svg.svg
  task_svg.svg
  post.svg
  instagram_svg.svg
  linkedin_svg.svg
  tiktok_svg.svg
  x_svg.webp
```
