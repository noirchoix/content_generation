<script lang="ts">
  import { PLATFORM_OPTIONS } from '$lib/config/platforms';
  import { FORMAT_OPTIONS } from '$lib/config/formats';
  import type { GenerateSuccessResponse, GeneratedAsset } from '$lib/types/content';

  type PlatformKey = 'instagram' | 'linkedin' | 'x' | 'tiktok';
  type InputMode = 'document' | 'url';

  let inputMode = $state<InputMode>('document');
  let uploadedFileName = $state('');
  let extractedIntoEditor = $state(false);

  let text = $state('');
  let url = $state('');
  let platform = $state<PlatformKey>('instagram');
  let format = $state<'caption' | 'carousel' | 'video-script' | 'hook-list'>('caption');
  let brandVoice = $state('');
  let loading = $state(false);
  let scraping = $state(false);
  let result = $state<GenerateSuccessResponse | null>(null);
  let error = $state('');
  let copied = $state(false);

  let streamPreview = $state('');
  let streamStatus = $state('');
  let activeTab = $state<PlatformKey>('instagram');

  let outputsByPlatform = $state<Partial<Record<PlatformKey, GeneratedAsset>>>({});

  function switchMode(nextMode: InputMode) {
    if (inputMode === nextMode) return;

    inputMode = nextMode;
    error = '';
    copied = false;
    extractedIntoEditor = false;
    clearStreamingState();

    if (nextMode === 'document') {
      url = '';
    } else {
      uploadedFileName = '';
      const input = document.getElementById('file-upload') as HTMLInputElement | null;
      if (input) input.value = '';
    }
  }

  function clearUploadedFile() {
    uploadedFileName = '';
    text = '';
    error = '';
    copied = false;
    extractedIntoEditor = false;

    const input = document.getElementById('file-upload') as HTMLInputElement | null;
    if (input) input.value = '';
  }

  function clearExtractedLink() {
    url = '';
    text = '';
    error = '';
    copied = false;
    extractedIntoEditor = false;
  }

  function setPlatformOutput(output: GeneratedAsset) {
    outputsByPlatform = {
      ...outputsByPlatform,
      [output.platform]: output
    };
    activeTab = output.platform;
  }

  function clearStreamingState() {
    streamPreview = '';
    streamStatus = '';
  }

  async function handleUpload(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    error = '';
    copied = false;
    extractedIntoEditor = false;
    uploadedFileName = file.name;

    const form = new FormData();
    form.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: form
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed.');
      }

      text = data.text ?? '';
    } catch (err) {
      error = err instanceof Error ? err.message : 'Upload failed.';
      uploadedFileName = '';
    }
  }

  async function handleScrape() {
    if (!url.trim()) return;

    error = '';
    copied = false;
    scraping = true;
    extractedIntoEditor = false;

    try {
      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Scrape failed.');
      }

      text = data.text ?? '';
      url = data.url ?? url;
      extractedIntoEditor = true;
    } catch (err) {
      error = err instanceof Error ? err.message : 'Scrape failed.';
      extractedIntoEditor = false;
    } finally {
      scraping = false;
    }
  }

  async function handleGenerate() {
    error = '';
    copied = false;
    loading = true;
    result = null;
    clearStreamingState();

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: text.trim() || undefined,
          url: url.trim() || undefined,
          platform,
          format,
          brandVoice: brandVoice.trim() || undefined
        })
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming generation failed.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });

        const events = buffer.split('\n\n');
        buffer = events.pop() ?? '';

        for (const rawEvent of events) {
          const lines = rawEvent.split('\n');
          const eventLine = lines.find((line) => line.startsWith('event: '));
          const dataLine = lines.find((line) => line.startsWith('data: '));

          if (!eventLine || !dataLine) continue;

          const eventName = eventLine.replace('event: ', '').trim();
          const payload = JSON.parse(dataLine.replace('data: ', ''));

          if (eventName === 'status') {
            streamStatus = payload.message;
          } else if (eventName === 'chunk') {
            streamPreview += payload.text;
          } else if (eventName === 'done') {
            result = {
              ok: true,
              output: payload.output,
              meta: payload.meta
            };
            setPlatformOutput(payload.output);
            streamStatus = 'Done';
          } else if (eventName === 'error') {
            throw new Error(payload.message || 'Streaming failed.');
          }
        }
      }
    } catch (err) {
      error = err instanceof Error ? err.message : 'Generation failed.';
    } finally {
      loading = false;
    }
  }

  function buildCopyText(output: GeneratedAsset) {
    return [
      output.title ?? '',
      output.hook ?? '',
      output.body ?? '',
      output.cta ?? '',
      (output.hashtags ?? []).join(' ')
    ]
      .map((part) => part.trim())
      .filter(Boolean)
      .join('\n\n');
  }

  async function handleCopy() {
    const output = outputsByPlatform[activeTab];
    if (!output) return;

    try {
      await navigator.clipboard.writeText(buildCopyText(output));
      copied = true;
      setTimeout(() => (copied = false), 1800);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Copy failed.';
    }
  }

  async function handleDownload() {
    const output = outputsByPlatform[activeTab];
    if (!output) return;

    const response = await fetch('/api/download', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ output })
    });

    if (!response.ok) {
      const data = await response.json();
      error = data.error || 'Download failed.';
      return;
    }

    const blob = await response.blob();
    const href = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = href;
    link.download = `${activeTab}-content-pack.txt`;
    link.click();
    URL.revokeObjectURL(href);
  }

  function selectTab(next: PlatformKey) {
    activeTab = next;
    platform = next;
  }
</script>

<svelte:head>
  <title>Dashboard · AI Social Content Engine</title>
  <meta name="description" content="Generate social posts from pasted content or article URLs." />
</svelte:head>

<section class="dashboard-shell">
  <div class="dashboard-page">
    <header class="page-header">
      <div>
        <p class="eyebrow">Phase 1 + Phase 2 MVP</p>
        <h1>Generate platform-ready content</h1>
        <p class="subtext">
          Paste text or extract from a link, then generate structured social assets through your selected LLM provider.
        </p>
      </div>
    </header>

    <div class="dashboard-grid">
      <section class="panel form-panel">
        <div class="panel-title-row">
          <div>
            <h2>Input workspace</h2>
            <p>Choose a source mode, prepare the content, and generate.</p>
          </div>
        </div>

        <div class="form-stack">
          <div class="mode-switch">
            <button
              type="button"
              class:active-mode={inputMode === 'document'}
              onclick={() => switchMode('document')}
            >
              Document
            </button>

            <button
              type="button"
              class:active-mode={inputMode === 'url'}
              onclick={() => switchMode('url')}
            >
              Article URL
            </button>
          </div>

          {#if inputMode === 'document'}
            <div class="field-group upload-group">
              <label for="file-upload">Upload document</label>
              <div class="upload-box">
                <input
                  id="file-upload"
                  type="file"
                  accept=".txt,.md,.html,.json,.csv,text/*"
                  onchange={handleUpload}
                />
              </div>

              {#if uploadedFileName}
                <div class="source-meta-row">
                  <span class="source-pill">{uploadedFileName}</span>
                  <button type="button" class="clear-btn" onclick={clearUploadedFile}>
                    Clear file
                  </button>
                </div>
              {/if}
            </div>
          {:else}
            <div class="field-group">
              <label for="url">Article URL</label>
              <div class="inline-row">
                <input
                  id="url"
                  bind:value={url}
                  placeholder="https://example.com/article"
                />
                <button
                  class="secondary-btn"
                  type="button"
                  onclick={handleScrape}
                  disabled={scraping || !url.trim()}
                >
                  {scraping ? 'Extracting...' : 'Extract Link'}
                </button>
              </div>

              {#if url}
                <div class="source-meta-row">
                  <span class="source-pill truncate">{url}</span>
                  <button type="button" class="clear-btn" onclick={clearExtractedLink}>
                    Clear link
                  </button>
                </div>
              {/if}
            </div>
          {/if}

          {#if extractedIntoEditor}
            <div class="info-box">
              Extracted content loaded into the editor. Generation will use the editor content first.
            </div>
          {/if}

          <div class="field-group">
            <label for="text">Content</label>
            <textarea
              id="text"
              bind:value={text}
              placeholder="Paste or review source material here..."
              oninput={() => {
                if (extractedIntoEditor) extractedIntoEditor = false;
              }}
            ></textarea>
          </div>

          <div class="grid-two">
            <div class="field-group">
              <label for="platform">Select platform</label>
              <select id="platform" bind:value={platform}>
                {#each PLATFORM_OPTIONS as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </div>

            <div class="field-group">
              <label for="format">Choose format</label>
              <select id="format" bind:value={format}>
                {#each FORMAT_OPTIONS as option}
                  <option value={option.value}>{option.label}</option>
                {/each}
              </select>
            </div>
          </div>

          <div class="field-group">
            <label for="brandVoice">Brand voice</label>
            <textarea
              id="brandVoice"
              bind:value={brandVoice}
              rows="5"
              placeholder="Optional voice rules, audience, CTA style, phrases to avoid..."
            ></textarea>
          </div>

          {#if error}
            <div class="error-box">{error}</div>
          {/if}

          <button
            class="primary-btn generate-btn"
            type="button"
            onclick={handleGenerate}
            disabled={loading}
          >
            {loading ? 'Generating...' : 'Generate Content'}
          </button>
        </div>
      </section>

      <section class="panel result-panel">
        <div class="result-header">
          <div>
            <h2>Your content pack</h2>
            <p>
              {#if loading}
                {streamStatus || 'Generating...'}
              {:else if result}
                Generated with {result.meta.model}.
              {:else}
                Your output will appear here after generation.
              {/if}
            </p>
          </div>

          <div class="result-actions">
            <button
              class="secondary-btn"
              type="button"
              onclick={handleCopy}
              disabled={!outputsByPlatform[activeTab]}
            >
              {copied ? 'Copied' : 'Copy'}
            </button>
            <button
              class="secondary-btn"
              type="button"
              onclick={handleDownload}
              disabled={!outputsByPlatform[activeTab]}
            >
              Download TXT
            </button>
          </div>
        </div>

        <div class="tabs">
          {#each PLATFORM_OPTIONS as option}
            <button
              type="button"
              class:active-tab={activeTab === option.value}
              onclick={() => selectTab(option.value as PlatformKey)}
            >
              {option.label}
            </button>
          {/each}
        </div>

        {#if loading && streamPreview}
          <div class="stream-box">
            <div class="stream-label">Live preview</div>
            <pre>{streamPreview}</pre>
          </div>
        {/if}

        {#if outputsByPlatform[activeTab]}
          <div class="result-card">
            <div class="result-badge-row">
              <span class="result-chip">{outputsByPlatform[activeTab]?.platform}</span>
              <span class="result-chip alt">{outputsByPlatform[activeTab]?.format}</span>
            </div>

            <h3>{outputsByPlatform[activeTab]?.title}</h3>

            {#if outputsByPlatform[activeTab]?.hook}
              <div class="result-block">
                <h4>Hook</h4>
                <p>{outputsByPlatform[activeTab]?.hook}</p>
              </div>
            {/if}

            <div class="result-block">
              <h4>Body</h4>
              <pre class="body-text">{outputsByPlatform[activeTab]?.body}</pre>
            </div>

            {#if outputsByPlatform[activeTab]?.cta}
              <div class="result-block">
                <h4>CTA</h4>
                <p>{outputsByPlatform[activeTab]?.cta}</p>
              </div>
            {/if}

            {#if outputsByPlatform[activeTab]?.hashtags?.length}
              <div class="result-block">
                <h4>Hashtags</h4>
                <div class="tag-row">
                  {#each outputsByPlatform[activeTab]?.hashtags ?? [] as tag}
                    <span class="tag">{tag}</span>
                  {/each}
                </div>
              </div>
            {/if}

            {#if outputsByPlatform[activeTab]?.notes}
              <div class="result-block notes-block">
                <h4>Notes for you</h4>
                <p>{outputsByPlatform[activeTab]?.notes}</p>
                <small class="notes-hint">Notes are not included when copying content.</small>
              </div>
            {/if}
          </div>
        {:else if !loading}
          <div class="empty-state">
            <p>No content generated for this platform yet.</p>
          </div>
        {/if}
      </section>
    </div>
  </div>
</section>

<style>
:global(body) {
  margin: 0;
  background: linear-gradient(180deg, #f6f3ff 0%, #fff9fb 100%);
  font-family:
    Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI',
    sans-serif;
  color: #2a2340;
}

/* Generated content typography */
.result-card,
.result-block p,
.body-text {
  font-family: 'Inter', ui-sans-serif, system-ui, sans-serif;
  font-size: 0.97rem;
  line-height: 1.75;
  letter-spacing: -0.01em;
  color: #2f2747;
}

/* Improve readability of long outputs */
.result-block p {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Headings inside result */
.result-card h3 {
  font-weight: 800;
  letter-spacing: -0.02em;
}

.result-block h4 {
  font-weight: 700;
  letter-spacing: 0.04em;
}

/* Layout */
.dashboard-shell {
  min-height: 100vh;
  padding: 2rem;
}

.dashboard-page {
  max-width: 1320px;
  margin: 0 auto;
}

.dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 460px) minmax(0, 1fr);
  gap: 1.25rem;
  position: relative;
}

/* Panels */
.panel {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #ebe4f5;
  border-radius: 22px;
  padding: 1.25rem;
  box-shadow: 0 16px 36px rgba(73, 49, 125, 0.08);
  min-width: 0;
}

.form-panel {
  position: relative;
  z-index: 2;
}

.result-panel {
  position: relative;
  z-index: 1;
}

/* Header */
.page-header {
  margin-bottom: 1.5rem;
}

.eyebrow {
  margin: 0 0 0.3rem;
  color: #7b61c8;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 0.78rem;
}

h1 {
  margin: 0;
  font-size: clamp(2rem, 4vw, 3.4rem);
  line-height: 1.05;
}

.subtext {
  max-width: 720px;
  color: #675b84;
  line-height: 1.6;
}

/* Form */
.form-stack {
  display: grid;
  gap: 1rem;
  margin-top: 1rem;
  min-width: 0;
}

.field-group {
  display: grid;
  gap: 0.45rem;
  min-width: 0;
}

label {
  font-size: 0.92rem;
  font-weight: 700;
  color: #41365e;
}

input,
select,
textarea {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid #ddd5ea;
  border-radius: 14px;
  background: #fff;
  padding: 0.95rem 1rem;
  font: inherit;
  color: #2e2447;
}

textarea {
  min-height: 170px;
  resize: vertical;
}

/* Mode Switch */
.mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
}

.mode-switch button {
  height: 46px;
  border-radius: 14px;
  border: 1px solid #e2d9f0;
  background: #f5f1fb;
  color: #4b4065;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.mode-switch button:hover {
  transform: translateY(-1px);
}

.mode-switch button.active-mode {
  background: linear-gradient(90deg, #5d64f5 0%, #d64db4 100%);
  color: #fff;
  border-color: transparent;
  box-shadow: 0 12px 24px rgba(87, 77, 204, 0.16);
}

/* Upload */
.upload-box {
  border: 1px dashed #cdbfe9;
  border-radius: 14px;
  background: #faf7ff;
  padding: 1rem;
}

/* Inline row (URL + button) */
.inline-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 0.75rem;
  min-width: 0;
}

/* Two column grid */
.grid-two {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 0.85rem;
}

/* Source meta */
.source-meta-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin-top: 0.7rem;
  flex-wrap: nowrap;
  min-width: 0;
}

.source-meta-row > * {
  min-width: 0;
}

.source-pill {
  display: block;
  min-height: 34px;
  padding: 0.45rem 0.8rem;
  border-radius: 999px;
  background: #f5f1fb;
  border: 1px solid #e2d9f0;
  color: #4b4065;
  font-size: 0.88rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* Buttons */
.primary-btn,
.secondary-btn,
.tabs button {
  border: 0;
  border-radius: 14px;
  font-weight: 800;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.primary-btn:hover,
.secondary-btn:hover,
.tabs button:hover {
  transform: translateY(-1px);
}

.primary-btn {
  height: 54px;
  color: #fff;
  background: linear-gradient(90deg, #5d64f5 0%, #d64db4 100%);
  box-shadow: 0 14px 28px rgba(87, 77, 204, 0.18);
}

.secondary-btn {
  height: 46px;
  padding: 0 1rem;
  background: #f5f1fb;
  color: #43385d;
  border: 1px solid #e2d9f0;
}

.generate-btn {
  width: 100%;
}

.clear-btn {
  flex: 0 0 auto;
  height: 34px;
  padding: 0 0.9rem;
  border-radius: 10px;
  border: 1px solid #e2d9f0;
  background: #fff;
  color: #7c5b7d;
  font-size: 0.88rem;
  font-weight: 700;
  cursor: pointer;
}

/* Info & error */
.info-box {
  border: 1px solid #ddd9f7;
  background: #f7f5ff;
  color: #52457a;
  border-radius: 12px;
  padding: 0.85rem 1rem;
  font-size: 0.92rem;
}

.error-box {
  border-radius: 14px;
  border: 1px solid #f1c1c7;
  background: #fff2f4;
  color: #a33d4e;
  padding: 0.9rem 1rem;
}

/* Result section */
.result-header {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1rem;
}

.result-actions {
  display: flex;
  gap: 0.65rem;
}

.tabs {
  display: flex;
  gap: 0.65rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.tabs button {
  height: 40px;
  padding: 0 1rem;
  background: #f5f1fb;
  color: #4b4065;
  border: 1px solid #e2d9f0;
}

.tabs button.active-tab {
  background: linear-gradient(90deg, #5d64f5 0%, #d64db4 100%);
  color: #fff;
}

/* Streaming */
.stream-box {
  border: 1px solid #e5dcf4;
  background: #fbf8ff;
  border-radius: 18px;
  padding: 1rem;
}

.stream-box pre {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Result card */
.result-card {
  border: 1px solid #ebe4f5;
  background: #fff;
  border-radius: 22px;
  padding: 1.2rem;
}

.body-text {
  white-space: pre-wrap;
  word-break: break-word;
}

/* Responsive */
@media (max-width: 980px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .dashboard-shell {
    padding: 1rem;
  }

  .grid-two,
  .inline-row {
    grid-template-columns: 1fr;
  }

  .result-actions {
    flex-wrap: wrap;
  }
}
</style>