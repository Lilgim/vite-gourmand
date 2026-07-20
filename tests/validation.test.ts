import { describe, expect, test } from "bun:test";
import {
  contactSchema,
  employeeAccountSchema,
  registerSchema,
} from "../src/lib/validation";

const validRegistration = {
  email: "client@example.fr",
  password: "MotDePasse2026!",
  first_name: "Camille",
  last_name: "Client",
  phone: "0611223344",
  address: "12 rue Sainte-Catherine",
  postal_code: "33000",
  city: "Bordeaux",
};

describe("validation des formulaires exposés", () => {
  test("l'inscription accepte toutes les informations exigées", () => {
    expect(registerSchema.safeParse(validRegistration).success).toBe(true);
  });

  test("l'inscription refuse une adresse ou un GSM absent", () => {
    expect(registerSchema.safeParse({ ...validRegistration, phone: "" }).success).toBe(
      false,
    );
    expect(
      registerSchema.safeParse({ ...validRegistration, address: "" }).success,
    ).toBe(false);
  });

  test("le mot de passe impose majuscule, minuscule, chiffre et spécial", () => {
    for (const password of [
      "motdepasse2026!",
      "MOTDEPASSE2026!",
      "MotDePasse!!!!",
      "MotDePasse2026",
    ]) {
      expect(registerSchema.safeParse({ ...validRegistration, password }).success).toBe(
        false,
      );
    }
  });

  test("la création d'un employé ne demande pas d'adresse postale", () => {
    const employee = {
      email: validRegistration.email,
      password: validRegistration.password,
      first_name: validRegistration.first_name,
      last_name: validRegistration.last_name,
      phone: validRegistration.phone,
    };
    expect(employeeAccountSchema.safeParse(employee).success).toBe(true);
  });

  test("le formulaire de contact valide les longueurs et l'email", () => {
    expect(
      contactSchema.safeParse({
        title: "Demande de devis",
        description: "Je souhaite organiser une réception pour vingt personnes.",
        email: "visiteur@example.fr",
      }).success,
    ).toBe(true);
    expect(
      contactSchema.safeParse({
        title: "A",
        description: "Trop court",
        email: "invalide",
      }).success,
    ).toBe(false);
  });
});
