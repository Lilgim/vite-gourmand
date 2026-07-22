"use server";

import { sendMail } from "@/lib/mailer";
import { rateLimit } from "@/lib/rate-limit";
import { contactSchema, type FormState } from "@/lib/validation";

export const sendContactRequest = async (
  _prev: FormState,
  formData: FormData,
): Promise<FormState> => {
  if (!(await rateLimit("contact", 5, 60 * 60 * 1000))) {
    return {
      status: "error",
      message: "Trop de demandes. Merci de réessayer dans quelques minutes.",
    };
  }

  if (String(formData.get("website") ?? "")) {
    return { status: "success", message: "Votre demande a bien été envoyée." };
  }

  const parsed = contactSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    email: formData.get("email"),
  });
  if (!parsed.success) {
    const errors: Record<string, string[]> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      errors[key] = [...(errors[key] ?? []), issue.message];
    }
    return { status: "error", errors };
  }

  const { title, description, email } = parsed.data;
  await sendMail({
    to: process.env.CONTACT_EMAIL ?? "contact@vite-gourmand.example",
    subject: `[Contact site] ${title}`,
    text: `Email du visiteur : ${email}\n\n${description}`,
  });
  return { status: "success", message: "Votre demande a bien été envoyée." };
};
