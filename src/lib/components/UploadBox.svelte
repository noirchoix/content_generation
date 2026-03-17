<script lang="ts">
  type Props = {
    onpicked: (file: File) => Promise<void> | void;
  };

  let { onpicked }: Props = $props();

  async function handleChange(event: Event) {
    const input = event.currentTarget as HTMLInputElement;
    const file = input.files?.[0];
    if (file) await onpicked(file);
  }
</script>

<label class="upload glass">
  <input type="file" accept=".txt,.md,.json,.csv,text/*" onchange={handleChange} />
  <span>Upload File</span>
</label>

<style>
  .upload {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    min-height: 50px;
    padding: 0 1rem;
    border-radius: 14px;
    cursor: pointer;
    font-weight: 700;
    color: #31284d;
  }

  input {
    display: none;
  }
</style>
