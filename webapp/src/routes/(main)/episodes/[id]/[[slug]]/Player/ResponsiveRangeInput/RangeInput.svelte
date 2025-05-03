<script lang="ts">
  type Props = {
    value: number;
    min?: number;
    max?: number;
    step?: string;
    onchange?: () => void;
  };

  let { value = $bindable(), min = 0, max = 1, step, onchange }: Props = $props();
  let percentage = $derived(((value - min) * 100) / (max - min));
</script>

<input
  bind:value
  style={`background: linear-gradient(to right, rgb(113 113 122) 0%, rgb(113 113 122) ${percentage}%, \
    rgb(212 212 216) ${percentage}%, rgb(212 212 216) 100%)`}
  type="range"
  class="mt-1"
  {min}
  {max}
  {step}
  {onchange}
/>

<style>
  @reference "tailwindcss";

  input {
    appearance: none;
    width: 100%;
    height: 0.313rem;
    border-radius: 0.188rem;
  }

  input::-webkit-slider-thumb {
    appearance: none;
    @apply bg-zinc-500;
    width: 0.875rem;
    height: 0.875rem;
    border-radius: 50%;
    cursor: pointer;
  }

  input[type="range"]::-moz-range-thumb {
    appearance: none;
    @apply bg-zinc-500;
    width: 0.875rem;
    height: 0.875rem;
    border-radius: 50%;
    cursor: pointer;
    border: none;
  }
</style>
