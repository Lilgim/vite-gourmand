import "server-only";
import nodemailer from "nodemailer";

// Emails transactionnels.
// - SMTP configuré (SMTP_HOST renseignée) : envoi réel via nodemailer.
// - Sinon : MODE TEST documenté — l'email est journalisé sur la sortie
//   standard au format lisible, aucune tentative d'envoi. C'est le mode
//   utilisé en développement et en démonstration (voir README).
// L'envoi est toujours best-effort : un échec d'email ne doit jamais
// faire échouer l'action métier qui l'a déclenché.

type Mail = {
  to: string;
  subject: string;
  text: string;
};

const smtpConfigured = (): boolean => Boolean(process.env.SMTP_HOST);

const transporter = smtpConfigured()
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      auth: process.env.SMTP_USER
        ? {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASSWORD,
          }
        : undefined,
    })
  : null;

export const sendMail = async ({ to, subject, text }: Mail): Promise<void> => {
  const from = process.env.EMAIL_FROM ?? "no-reply@vite-gourmand.example";
  try {
    if (transporter) {
      await transporter.sendMail({ from, to, subject, text });
      return;
    }
    console.log(
      [
        "═══ EMAIL (mode test — SMTP non configuré) ═══",
        `De      : ${from}`,
        `À       : ${to}`,
        `Objet   : ${subject}`,
        "───",
        text,
        "══════════════════════════════════════════════",
      ].join("\n"),
    );
  } catch (error) {
    console.error("Envoi d'email impossible :", error);
  }
};

export const orderConfirmationMail = (
  to: string,
  firstName: string,
  orderId: number,
  menuTitle: string,
  totalPrice: number,
): Mail => ({
  to,
  subject: `Vite & Gourmand — commande n° ${orderId} bien reçue`,
  text: [
    `Bonjour ${firstName},`,
    "",
    `Nous avons bien reçu votre commande n° ${orderId} (${menuTitle})`,
    `pour un montant total de ${totalPrice.toLocaleString("fr-FR", { minimumFractionDigits: 2 })} €.`,
    "",
    "Notre équipe va l'étudier : vous serez informé dès son acceptation.",
    "Vous pouvez suivre son avancement à tout moment depuis votre compte.",
    "",
    "À très vite,",
    "L'équipe Vite & Gourmand",
  ].join("\n"),
});

export const statusChangeMail = (
  to: string,
  firstName: string,
  orderId: number,
  statusLabel: string,
): Mail => ({
  to,
  subject: `Vite & Gourmand — commande n° ${orderId} : ${statusLabel}`,
  text: [
    `Bonjour ${firstName},`,
    "",
    `Votre commande n° ${orderId} vient de passer au statut : ${statusLabel}.`,
    "Retrouvez le détail et l'historique complet depuis votre compte.",
    "",
    "À très vite,",
    "L'équipe Vite & Gourmand",
  ].join("\n"),
});

export const welcomeMail = (to: string, firstName: string): Mail => ({
  to,
  subject: "Bienvenue chez Vite & Gourmand",
  text: `Bonjour ${firstName},\n\nVotre compte a bien été créé. Vous pouvez désormais commander nos menus et suivre vos commandes depuis votre espace.\n\nL'équipe Vite & Gourmand`,
});

export const employeeAccountMail = (to: string, firstName: string): Mail => ({
  to,
  subject: "Votre compte employé Vite & Gourmand",
  text: `Bonjour ${firstName},\n\nUn compte employé a été créé pour vous. Pour des raisons de sécurité, le mot de passe n'est pas communiqué par email : rapprochez-vous de l'administrateur pour l'obtenir.\n\nL'équipe Vite & Gourmand`,
});

export const passwordResetMail = (to: string, resetUrl: string): Mail => ({
  to,
  subject: "Réinitialisation de votre mot de passe",
  text: `Une réinitialisation de mot de passe a été demandée pour votre compte.\n\nUtilisez ce lien dans les 30 minutes : ${resetUrl}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
});

export const equipmentReturnMail = (
  to: string,
  firstName: string,
  orderId: number,
): Mail => ({
  to,
  subject: `Commande n° ${orderId} — retour du matériel`,
  text: `Bonjour ${firstName},\n\nVotre commande n° ${orderId} est en attente du retour du matériel. Merci de contacter Vite & Gourmand pour organiser sa restitution. Conformément aux conditions générales de vente, si le matériel n'est pas restitué sous 10 jours ouvrés, 600 € de frais seront dus.\n\nL'équipe Vite & Gourmand`,
});
