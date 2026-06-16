<script lang="ts">
  import UploadBox from './UploadBox.svelte';
  import PlatformSelector from './PlatformSelector.svelte';
  import LoadingSpinner from './LoadingSpinner.svelte';
  import { outputTypes, platforms } from '$lib/types/platform';
  import type { BrandProfile } from '$lib/types/brand';
  import type { GenerationResponse } from '$lib/types/generation';

  type Props = {
    brandProfiles: BrandProfile[];
    ongenerated: (response: GenerationResponse) => void;
  };

  let { brandProfiles, ongenerated }: Props = $props();

  let text = $state('');
  let url = $state('');
  let platform = $state<typeof platforms[number]>('Instagram');
  let type = $state<typeof outputTypes[number]>('Caption');
  let selectedBrand = $state('');
  let variations = $state(3);
  let busy = $state(false);
  let error = $state('');

  async function uploadFile(file: File) {
    error = '';
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/upload', { method: 'POST', body: formData });
    const data = await response.json();
    if (!response.ok) {
      error = data.error || 'Upload failed.';
      return;
    }
    text = data.text;
  }

  async function scrapeUrl() {
    error = '';
    if (!url.trim()) return;
    const response = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await response.json();
    if (!response.ok) {
      error = data.error || 'Could not scrape the URL.';
      return;
    }
    text = data.text;
  }

  async function generate() {
    error = '';
    busy = true;
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          platform,
          type,
          brandName: selectedBrand || null,
          variations
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Generation failed.');
      ongenerated(data);
    } catch (err) {
      error = err instanceof Error ? err.message : 'Generation failed.';
    } finally {
      busy = false;
    }
  }
</script>

<section class="card panel">
  <div class="top-row">
    <h2>Upload Content</h2>
    <UploadBox onpicked={uploadFile} />
  </div>

  <div class="field-row">
    <input bind:value={url} placeholder="Paste article URL for scraping" />
    <button type="button" class="chip" onclick={scrapeUrl}>Scrape URL</button>
  </div>

  <textarea bind:value={text} placeholder="Paste your long-form content here..."></textarea>

  <div class="selectors">
    <PlatformSelector label="Select Platform" options={platforms} value={platform} onselect={(value) => (platform = value as typeof platform)} />
    <PlatformSelector label="Choose Format" options={outputTypes} value={type} onselect={(value) => (type = value as typeof type)} />
  </div>

  <div class="grid-two">
    <label>
      <span>Brand Voice Preset</span>
      <select bind:value={selectedBrand}>
        <option value="">None</option>
        {#each brandProfiles as profile}
          <option value={profile.brand_name}>{profile.brand_name}</option>
        {/each}
      </select>
    </label>

    <label>
      <span>Variations</span>
      <input bind:value={variations} type="number" min="1" max="6" />
    </label>
  </div>

  {#if error}
    <p class="error">{error}</p>
  {/if}

  <button class="btn primary generate" type="button" onclick={generate} disabled={busy || !text.trim()}>
    {#if busy}
      <LoadingSpinner />
      <span>Generating...</span>
    {:else}
      <span>Generate Content</span>
    {/if}
  </button>
</section>

<style>
  .panel {
    padding: 1.5rem;
  }

  h2 {
    margin: 0;
  }

  .top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .field-row {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  input,
  textarea,
  select {
    width: 100%;
    border: 1px solid #dfdaf4;
    border-radius: 14px;
    background: rgba(255,255,255,0.72);
    padding: 0.95rem 1rem;
    color: #27203f;
  }

  textarea {
    min-height: 180px;
    resize: vertical;
    margin-bottom: 1rem;
  }

  .selectors {
    display: grid;
    gap: 1rem;
    margin-bottom: 1rem;
  }

  .grid-two {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
    margin-bottom: 1rem;
  }

  label span {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  .generate {
    width: 100%;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.6rem;
    min-height: 54px;
  }

  .error {
    color: #b42318;
    font-weight: 700;
  }

  @media (max-width: 700px) {
    .top-row,
    .field-row,
    .grid-two {
      grid-template-columns: 1fr;
      display: grid;
    }
  }
</style>
