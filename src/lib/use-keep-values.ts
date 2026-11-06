"use client";

import { startTransition, type FormEvent } from "react";

/**
 * React 19 resets uncontrolled forms after a form action completes — which wipes the
 * user's input when server-side validation fails. Submitting via a transition keeps
 * the values; `action={...}` remains as the no-JavaScript fallback.
 */
export function keepValuesOnSubmit(dispatch: (fd: FormData) => void, before?: () => void) {
  return (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    before?.();
    const fd = new FormData(e.currentTarget, (e.nativeEvent as SubmitEvent).submitter);
    startTransition(() => dispatch(fd));
  };
}
