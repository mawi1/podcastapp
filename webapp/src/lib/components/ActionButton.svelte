<script lang="ts">
  import type { HTMLButtonAttributes } from "svelte/elements";

  import { goto } from "$app/navigation";

  import Button, { ButtonSize, ButtonType } from "./Button";

  type Props = HTMLButtonAttributes & {
    action: () => Promise<void>;
    onSuccess: () => void;
    btnType?: ButtonType;
  };

  let { children, action, onSuccess, btnType = ButtonType.Secondary, ...rest }: Props = $props();

  // eslint-disable-next-line svelte/valid-compile
  enum State {
    Idle,
    Loading,
    Error,
  }
  let btnState = $state(State.Idle);

  async function handleClick() {
    btnState = State.Loading;
    try {
      await action();
    } catch (error) {
      if (error instanceof Error && error.message === "UNAUTHORIZED") {
        goto("/login");
      } else {
        console.error("An Unexpected Error Occurred:");
        console.error(error);
        btnState = State.Error;
        setTimeout(() => {
          btnState = State.Idle;
        }, 5000);
        return;
      }
    }
    btnState = State.Idle;
    onSuccess();
  }
</script>

<div class="relative inline-block z-100">
  <Button {...rest} onclick={handleClick} size={ButtonSize.S} {btnType}>
    {@render children?.()}
  </Button>
  <div
    class:hidden={btnState === State.Idle}
    class:bg-neutral-800={btnState === State.Loading}
    class:bg-opacity-30={btnState === State.Loading}
    class:bg-red-600={btnState === State.Error}
    class="z-200 absolute left-0 top-0 flex h-full w-full items-center justify-center rounded"
  >
    <span class="text-white">
      {#if btnState === State.Loading}
        <i class="fa-solid fa-spinner animate-spin text-white"></i>
      {:else}
        <i class="fa-solid fa-exclamation"></i> Error <i class="fa-solid fa-exclamation"></i>
      {/if}
    </span>
  </div>
</div>
