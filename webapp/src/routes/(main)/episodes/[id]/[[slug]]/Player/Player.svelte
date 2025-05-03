<script module lang="ts">
  // eslint-disable-next-line svelte/valid-compile
  export enum PlayerState {
    Loading,
    CanPlay,
    Seeking,
    Error,
  }
</script>

<script lang="ts">
  import { onMount } from "svelte";

  import Error from "$lib/components/Error.svelte";
  import { formatTime } from "$lib/datetime";

  import ProgressBar from "./ProgressBar.svelte";
  import ResponsiveRangeInput from "./ResponsiveRangeInput/ResponsiveRangeInput.svelte";

  let { audioUrl, autoplay }: { audioUrl: string; autoplay?: boolean } = $props();

  let audio: HTMLAudioElement;

  let playerState = $state(PlayerState.Loading);
  let paused = $state(true);

  let duration: undefined | number = $state(undefined);
  let durationDisplay: string = $derived(duration !== undefined ? formatTime(duration) : "--:--");

  let currentTime: undefined | number = $state(undefined);
  let currentTimeDisplay: undefined | string = $derived(
    currentTime !== undefined && duration !== undefined && !isNaN(duration)
      ? formatTime(currentTime, duration >= 3600)
      : "--:--"
  );

  let playbackRate = $state(1);
  let volume = $state(0.5);

  onMount(() => {
    audio.addEventListener("error", () => {
      playerState = PlayerState.Error;
    });
    audio.addEventListener("canplay", async () => {
      if (playerState === PlayerState.Loading) {
        if (autoplay) {
          await audio.play();
        }
      }
      playerState = PlayerState.CanPlay;
    });
    audio.addEventListener("seeking", () => {
      playerState = PlayerState.Seeking;
    });

    volume = parseFloat(localStorage.getItem("volume") || "0.5");
    audio.src = audioUrl;
  });
</script>

<audio bind:this={audio} bind:duration bind:currentTime bind:playbackRate bind:volume bind:paused
></audio>

{#if playerState === PlayerState.Error}
  <Error text="Could not load audio file." />
{:else}
  <div
    class="min-[672px]:mx-4 min-[704px]:mx-0 relative min-[672px]:rounded-[0.250rem] bg-zinc-700 px-4 py-4.5 text-white"
  >
    <div class="flex w-full flex-col items-center">
      <div class="leading-none mb-1">{currentTimeDisplay} | <span>{durationDisplay}</span></div>
      <ProgressBar bind:currentTime {duration} {playerState} />
    </div>
    <div class="@container w-full flex justify-around items-center mt-1.5">
      <!-- playbackRate -->
      <ResponsiveRangeInput bind:value={playbackRate} min={1} max={2} step="0.1"
        >{`${playbackRate}x`}</ResponsiveRangeInput
      >

      <div class="flex items-center justify-center">
        <button
          class:invisible={playerState !== PlayerState.CanPlay}
          onpointerdown={() => {
            audio.currentTime -= 10;
          }}
          class="mr-2 size-10 rounded-full bg-zinc-500">-10</button
        >
        {#if playerState === PlayerState.CanPlay}
          {#if paused}
            <button
              aria-label="play"
              onclick={() => {
                audio.play();
              }}
              class="size-14 rounded-full bg-emerald-500"><i class="fa-solid fa-play"></i></button
            >
          {:else}
            <button
              aria-label="pause"
              onclick={() => {
                audio.pause();
              }}
              class="size-14 rounded-full bg-emerald-500"><i class="fa-solid fa-pause"></i></button
            >
          {/if}
        {:else if playerState === PlayerState.Loading || playerState === PlayerState.Seeking}
          <div class="flex size-14 items-center justify-center rounded-full bg-zinc-500">
            <i class="fa-solid fa-spinner fa-spin text-2xl"></i>
          </div>
        {/if}
        <button
          class:invisible={playerState !== PlayerState.CanPlay}
          onpointerdown={() => {
            audio.currentTime += 10;
          }}
          class="ml-2 size-10 rounded-full bg-zinc-500">+10</button
        >
      </div>

      <!-- volume -->
      <ResponsiveRangeInput
        bind:value={volume}
        step="0.05"
        onchange={() => {
          localStorage.setItem("volume", volume.toString());
        }}
      >
        {#if volume === 0}
          <i class="fa-solid fa-volume-xmark"></i>
        {:else}
          <i class="fa-solid fa-volume-high"></i>
        {/if}
      </ResponsiveRangeInput>
    </div>
  </div>
{/if}
