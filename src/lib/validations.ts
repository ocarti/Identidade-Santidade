import { z } from "zod";

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const cepRegex = /^\d{5}-?\d{3}$/;

/** Strip HTML tags and trim to prevent XSS injection */
function sanitize(val: string): string {
  return val.replace(/<[^>]*>/g, "").trim();
}

const sanitizedString = (min: number, max: number, label: string) =>
  z.string()
    .transform(sanitize)
    .pipe(
      z.string()
        .min(min, `${label} deve ter pelo menos ${min} caracteres`)
        .max(max, `${label} deve ter no máximo ${max} caracteres`)
    );

export const registrationSchema = z.object({
  nome: sanitizedString(3, 100, "Nome"),
  cpf: z.string().regex(cpfRegex, "CPF inválido. Use o formato 000.000.000-00"),
  nascimento: z.string().min(1, "Data de nascimento é obrigatória").refine((val) => {
    if (!val) return false;
    const birth = new Date(val);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age >= 8;
  }, "Inscrições online são apenas para maiores de 8 anos. Menores de 8 anos têm entrada gratuita e não precisam de inscrição prévia"),
  cep: z.string().regex(cepRegex, "CEP inválido. Use o formato 00000-000"),
  email: z.string().transform(sanitize).pipe(z.string().email("E-mail inválido").max(255, "E-mail muito longo")),
});

export const customerSignUpSchema = z.object({
  nome: sanitizedString(3, 100, "Nome"),
  email: z.string().transform(sanitize).pipe(z.string().email("E-mail inválido").max(255, "E-mail muito longo")),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres").max(128, "Senha muito longa"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

export const customerLoginSchema = z.object({
  email: z.string().transform(sanitize).pipe(z.string().email("E-mail inválido")),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const customerProfileSchema = z.object({
  nome: sanitizedString(3, 100, "Nome"),
  cpf: z.string().regex(cpfRegex, "CPF inválido. Use o formato 000.000.000-00").optional().or(z.literal("")),
  telefone: z.string().max(20, "Telefone muito longo").optional().or(z.literal("")),
});

export type RegistrationForm = z.infer<typeof registrationSchema>;
export type CustomerSignUpForm = z.infer<typeof customerSignUpSchema>;
export type CustomerLoginForm = z.infer<typeof customerLoginSchema>;
export type CustomerProfileForm = z.infer<typeof customerProfileSchema>;
