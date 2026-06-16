<script lang="ts">
  import type { GeneratedAsset } from '$lib/types/generation';
  let { asset }: { asset: GeneratedAsset } = $props();
</script>

<article class="card asset-card">
  <div class="meta">{asset.platform} · {asset.type}</div>
  <h3>{asset.title}</h3>
  <p><strong>Hook:</strong> {asset.hook}</p>
  <p><strong>Body:</strong> {asset.body}</p>
  <p><strong>CTA:</strong> {asset.cta}</p>
  {#if asset.hashtags.length}
    <p><strong>Hashtags:</strong> {asset.hashtags.join(' ')}</p>
  {/if}
  {#if asset.notes}
    <p><strong>Notes:</strong> {asset.notes}</p>
  {/if}
</article>

<style>
  .asset-card {
    padding: 1rem;
    border-radius: 18px;
  }

  h3 {
    margin: 0.25rem 0 0.75rem;
    font-size: 1.05rem;
  }

  p {
    margin: 0.45rem 0;
    line-height: 1.5;
    color: #2c2740;
  }

  .meta {
    color: #5c5681;
    font-weight: 700;
    font-size: 0.85rem;
  }
</style>
