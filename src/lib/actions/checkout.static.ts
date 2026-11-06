/** Static-preview stand-ins for ./checkout.ts. Checkout never runs on the static preview. */
export type CheckoutState = { error?: string };

export async function beginCheckout(_: CheckoutState, _fd: FormData): Promise<CheckoutState> {
  return { error: "Checkout is available on the full COURTSCAPE site, not this static preview." };
}

export async function finishTestCheckout(_fd: FormData): Promise<void> {}
