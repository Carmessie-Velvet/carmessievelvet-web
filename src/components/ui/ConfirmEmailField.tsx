"use client";

import { useEffect, useRef, useState } from "react";
import { FormField } from "@/components/ui/FormField";
import { EMAIL_MISMATCH_MESSAGE, emailsMatch } from "@/lib/emails-match";

// What the browser reports in `InputEvent.inputType` when text arrives by
// something other than typing. Some mobile keyboards (a clipboard suggestion
// strip, "paste" from the long-press menu) insert text without firing a
// `paste` event, so the paste handler alone isn't enough.
const NOT_TYPED = new Set([
  "insertFromPaste",
  "insertFromPasteAsQuotation",
  "insertFromDrop",
  "insertFromYank",
]);

/**
 * The second "type your email again" field. The point of asking twice is that
 * the person types the address a second time instead of copying it, so a typo
 * can't survive both times — which is why **pasting and dropping text into it
 * is refused**, and it opts out of browser/password-manager autofill (which
 * would fill both boxes with the same wrong value).
 *
 * It blocks submitting the form while the two don't match through the
 * browser's own validation (`setCustomValidity`), so the surrounding form needs
 * no extra submit logic — it only has to keep `confirmValue` out of whatever it
 * sends to the API, which doesn't know this field.
 */
export function ConfirmEmailField({
  id,
  email,
  value,
  onChange,
  label = "Confirma tu correo",
}: {
  id: string;
  /** The address typed in the first field — what this one is compared to. */
  email: string;
  value: string;
  onChange: (value: string) => void;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [touched, setTouched] = useState(false);
  const [pasteRefused, setPasteRefused] = useState(false);

  const mismatch = !emailsMatch(value, email);

  // Re-evaluated whenever either box changes, so editing the first email after
  // confirming it invalidates the second again.
  useEffect(() => {
    inputRef.current?.setCustomValidity(mismatch ? EMAIL_MISMATCH_MESSAGE : "");
  }, [mismatch]);

  function refuse(event: React.SyntheticEvent) {
    event.preventDefault();
    setPasteRefused(true);
  }

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const inputType = (event.nativeEvent as InputEvent).inputType;
    if (inputType && NOT_TYPED.has(inputType)) {
      // Not applied: the field is controlled, so React puts the old value back.
      setPasteRefused(true);
      return;
    }
    onChange(event.target.value);
  }

  const showMismatch = touched && value.trim() !== "" && mismatch;

  return (
    <div className="flex flex-col gap-1.5">
      <FormField
        id={id}
        inputRef={inputRef}
        label={label}
        // Text + inputMode rather than type="email": browsers and password
        // managers key their autofill on the email type, and this box must
        // stay empty until the person types it. The first field already
        // validates the format.
        type="text"
        inputMode="email"
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        data-1p-ignore
        data-lpignore="true"
        placeholder="Escríbelo de nuevo"
        required
        value={value}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        onPaste={refuse}
        onDrop={refuse}
        error={showMismatch ? EMAIL_MISMATCH_MESSAGE : undefined}
      />
      {pasteRefused && !showMismatch && (
        <p className="text-xs text-ink-muted">
          Escríbelo a mano: así nos aseguramos de que no tenga errores.
        </p>
      )}
    </div>
  );
}
