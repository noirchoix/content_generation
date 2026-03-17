<script lang="ts">
  import { goto } from '$app/navigation';

  export let fallback = '/'; // where to go if no history

  function handleBack() {
    if (history.length > 1) {
      history.back();
    } else {
      goto(fallback);
    }
  }
</script>

<button class="back-btn" onclick={handleBack}>
  ← Back
</button>

<style>
  .back-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    height: 38px;
    padding: 0 0.9rem;
    border-radius: 10px;
    border: 1px solid #e2d9f0;
    background: #fff;
    color: #5b4c7d;
    font-size: 0.85rem;
    font-weight: 700;
    cursor: pointer;
    transition: transform 0.15s ease, box-shadow 0.15s ease;
  }

  .back-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 6px 14px rgba(73, 49, 125, 0.12);
  }
</style>