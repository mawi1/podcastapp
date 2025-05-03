<script lang="ts">
  import type { HTMLAnchorAttributes, HTMLButtonAttributes } from "svelte/elements";
  import { twMerge } from "tailwind-merge";

  import { ButtonSize, ButtonType } from ".";

  type Props =
    | (Omit<HTMLAnchorAttributes, "href" | "type"> & {
        href: string;
        size?: ButtonSize;
        btnType?: ButtonType;
        disabled?: undefined;
      })
    | (HTMLButtonAttributes & { size?: ButtonSize; btnType?: ButtonType });

  const {
    children,
    size = ButtonSize.L,
    btnType = ButtonType.Secondary,
    class: className,
    disabled = false,
    ...rest
  }: Props = $props();

  const btnClass = twMerge(
    `${size === ButtonSize.S ? "text-xs px-3" : "text-base px-4"} \
    ${btnType === ButtonType.Primary ? "bg-emerald-500 hover:bg-emerald-600" : "bg-zinc-500 hover:bg-zinc-600"} \
    py-2 inline-block rounded font-bold text-white disabled:cursor-not-allowed disabled:bg-zinc-400 disabled:text-neutral-200`,
    className
  );
</script>

{#if "href" in rest}
  <a {...rest} class={btnClass}>{@render children?.()}</a>
{:else}
  <button {disabled} {...rest} class={btnClass}>{@render children?.()}</button>
{/if}
