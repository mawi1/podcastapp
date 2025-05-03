import type { HTMLInputAttributes } from "svelte/elements";

export { default } from "./FormInput.svelte";

export type FormInputProps = {
  valid?: boolean;
  isLoading?: boolean;
  helperText?: string;
} & HTMLInputAttributes;
