import { apiFetch } from "@/lib/api-client";

export interface ContactMessage {
  name: string;
  email: string;
  /** Folio the message is about — leave it out when there is none. */
  orderNumber?: string;
  message: string;
  /** Spam trap: a hidden field a person never fills. Always sent empty by the form. */
  website?: string;
}

/**
 * The contact form (`POST /store/contact`, public). The API emails the team's
 * attention inbox with the shopper as Reply-To, and — unlike the automatic order
 * emails — waits for the email provider: `send` resolves only when the message
 * was really handed over, and rejects (`ApiError`, 503 / 429 / 400) otherwise,
 * so the form can tell the shopper instead of pretending it worked.
 */
export interface ContactService {
  send(message: ContactMessage): Promise<void>;
}

export class RestContactService implements ContactService {
  async send(message: ContactMessage): Promise<void> {
    await apiFetch<boolean>("/store/contact", {
      method: "POST",
      body: JSON.stringify(message),
    });
  }
}

export const contactService: ContactService = new RestContactService();
