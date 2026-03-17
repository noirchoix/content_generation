<script lang="ts">
  import type { OutputType, Platform } from '$lib/types/platform';

  type Props = {
    label: string;
    options: readonly string[];
    value: string;
    onselect: (value: string) => void;
  };

  let { label, options, value, onselect }: Props = $props();
</script>

<div>
  <div class="label">{label}</div>
  <div class="chips">
    {#each options as option}
      <button type="button" class:active={value === option} class="chip" onclick={() => onselect(option)}>
        {option}
      </button>
    {/each}
  </div>
</div>

<style>
  .label {
    font-size: 0.95rem;
    font-weight: 700;
    margin-bottom: 0.75rem;
  }

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 0.65rem;
  }
</style>
