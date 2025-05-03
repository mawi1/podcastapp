<script lang="ts">
  import { onMount } from "svelte";

  import { formatTime } from "$lib/datetime";

  import { PlayerState } from "./Player.svelte";

  type Props = {
    currentTime?: number;
    duration?: number;
    playerState: PlayerState;
  };

  let windowWidth: number | undefined = $state();

  let { currentTime = $bindable(), duration, playerState }: Props = $props();

  let progressBarElement: HTMLDivElement;
  let thumbElement: HTMLDivElement;

  let jumpToIndicator: undefined | { xPos: number; timeDisplay: string } = $state(undefined);

  let width: number | undefined = $state();
  let isDragging = $state(false);
  let thumbPosition = $state(0);

  let isTouchDevice = $state(false);

  onMount(() => {
    isTouchDevice = "ontouchstart" in window || navigator.maxTouchPoints > 0;
  });

  $effect(() => {
    if (
      currentTime !== undefined &&
      duration !== undefined &&
      !isNaN(duration) &&
      width !== undefined &&
      !isDragging
    ) {
      thumbPosition = (currentTime / duration) * width;
    }
  });

  function pointerXToProgressBarX(e: PointerEvent): number {
    const left = progressBarElement.getBoundingClientRect().left + window.scrollX;
    const right = progressBarElement.getBoundingClientRect().right + window.scrollX;
    if (e.pageX < left) {
      return 0;
    } else if (e.pageX > right) {
      return progressBarElement.getBoundingClientRect().width;
    } else {
      return e.pageX - left;
    }
  }

  function pointerXToTime(e: PointerEvent): number {
    const left = progressBarElement.getBoundingClientRect().left + window.scrollX;
    let p = (e.pageX - left) / progressBarElement.getBoundingClientRect().width;
    if (p < 0) p = 0;
    if (p > 1) p = 1;
    return p * duration!;
  }

  function startDragging(e: PointerEvent) {
    if (duration !== undefined && !isNaN(duration)) {
      thumbPosition = pointerXToProgressBarX(e);
      isDragging = true;
      thumbElement.onpointermove = (me: PointerEvent) => {
        thumbPosition = pointerXToProgressBarX(me);
      };
      thumbElement.setPointerCapture(e.pointerId);
      e.stopPropagation();
    }
  }

  function stopDragging(e: PointerEvent) {
    if (isDragging) {
      thumbElement.onpointermove = null;
      thumbElement.releasePointerCapture(e.pointerId);
      currentTime = pointerXToTime(e);
      isDragging = false;
    }
  }

  function showJumpToIndicator(e: PointerEvent) {
    if (duration !== undefined && !isNaN(duration)) {
      const xPos = pointerXToProgressBarX(e);
      const time = pointerXToTime(e);
      jumpToIndicator = {
        timeDisplay: formatTime(time, duration >= 3600),
        xPos,
      };
    }
  }
</script>

<svelte:window bind:innerWidth={windowWidth} />

<div
  bind:this={progressBarElement}
  bind:clientWidth={width}
  class="relative my-2 h-2 w-full bg-zinc-300"
  class:cursor-pointer={playerState === PlayerState.CanPlay}
  onpointerdown={(e: PointerEvent) => {
    currentTime = pointerXToTime(e);
  }}
  onpointerout={() => (jumpToIndicator = undefined)}
  onblur={() => (jumpToIndicator = undefined)}
  onpointermove={showJumpToIndicator}
>
  <!-- thumb -->
  <div
    bind:this={thumbElement}
    class="absolute top-1 left-0 size-[1.125rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-emerald-600 touch-none"
    style={`left: ${thumbPosition}px`}
    onpointerdown={startDragging}
    onpointerup={stopDragging}
    onpointercancel={stopDragging}
    ontouchstart={(e) => e.preventDefault()}
  >
    {#if isTouchDevice}
      <!-- bigger touchable area for thumb -->
      <div class="bg-transparent size-[2.25rem] -translate-x-1/4 -translate-y-1/4"></div>
    {/if}
  </div>
  <!-- progress bar -->
  <div class="h-2 bg-emerald-500" style={`width: ${thumbPosition}px`}></div>
  {#if jumpToIndicator !== undefined}
    <div
      class="absolute -translate-x-1/2 -translate-y-full rounded-md border border-zinc-600 bg-zinc-100 px-2 text-[#383838]"
      class:-top-4.5={isTouchDevice}
      class:-top-2={!isTouchDevice}
      style={windowWidth !== undefined && windowWidth >= 750
        ? `left: ${jumpToIndicator.xPos}px;`
        : "left: 50%"}
    >
      {jumpToIndicator.timeDisplay}
    </div>
  {/if}
</div>
<!--  -->

<!--style="left: 50%;"-->
