<script lang="ts">
  import { page } from '$app/state';
  import BackButton from '$lib/components/BackButton.svelte';

  const hiddenOn = new Set(['/']);
</script>

{#if !hiddenOn.has(page.url.pathname)}
  <div class="global-backbar">
    <BackButton fallback="/" />
  </div>
{/if}

<slot />

<style>
  .global-backbar {
    position: sticky;
    top: 0;
    z-index: 50;
    padding: 1rem 1rem 0;
    pointer-events: none;
  }

  .global-backbar :global(.back-btn) {
    pointer-events: auto;
  }

  @media (min-width: 721px) {
    .global-backbar {
      padding: 1.25rem 2rem 0;
    }
  }
</style>