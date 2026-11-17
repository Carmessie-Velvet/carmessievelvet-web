"use client";

import { EmailVerificationNotice } from "@/components/account/EmailVerificationNotice";

/**
 * What a new account sees right after signing up. The API signs the person in
 * immediately, but they cannot buy until they confirm their email — so this
 * says so now, with the resend/re-check controls, instead of letting them
 * discover it at their next login (the only place it used to show up).
 */
export function SignupDone({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-tight text-ink">¡Cuenta creada!</h2>
        <p className="mt-2 text-sm text-ink-muted">
          Ya puedes explorar la tienda y armar tu carrito.
        </p>
      </div>
      <EmailVerificationNotice title="Falta un paso" />
      <div className="flex flex-wrap gap-3">{children}</div>
    </div>
  );
}
