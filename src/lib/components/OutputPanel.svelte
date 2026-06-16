<script lang="ts">
  import GenerationCard from './GenerationCard.svelte';
  import type { GeneratedAsset } from '$lib/types/generation';

  type Props = {
    assets: GeneratedAsset[];
    usedRag: boolean;
    ondownload: () => Promise<void> | void;
  };

  let { assets, usedRag, ondownload }: Props = $props();

  async function copyAll() {
    const text = assets
      .map((asset) => `${asset.title}\n${asset.hook}\n${asset.body}\n${asset.cta}\n${asset.hashtags.join(' ')}`)
      .join('\n\n');
    await navigator.clipboard.writeText(text);
  }
</script>

<section class="card panel">
  <div class="panel-header">
    <div>
      <h2>Your Content Pack</h2>
      <p>{usedRag ? 'Lightweight retrieval applied for long content.' : 'Direct transformation pipeline used.'}</p>
    </div>
    <div class="actions">
      <button type="button" class="chip" onclick={copyAll}>Copy All</button>
      <button type="button" class="chip active" onclick={ondownload}>Download TXT</button>
    </div>
  </div>

  <div class="grid">
    {#each assets as asset}
      <GenerationCard {asset} />
    {/each}
  </div>
</section>

<style>
  .panel {
    padding: 1.25rem;
  }

  .panel-header {
    display: flex;
    justify-content: space-between;
    gap: 1rem;
    align-items: center;
    margin-bottom: 1rem;
  }

  .panel-header h2 {
    margin: 0;
    font-size: 1.6rem;
  }

  .panel-header p {
    margin: 0.3rem 0 0;
    color: #5f5a79;
  }

  .actions {
    display: flex;
    gap: 0.6rem;
    flex-wrap: wrap;
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1rem;
  }

  @media (max-width: 700px) {
    .panel-header {
      flex-direction: column;
      align-items: stretch;
    }
  }
</style>
