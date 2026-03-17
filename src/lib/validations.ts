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

export const saleCheckoutSchema = z.object({
  nome: sanitizedString(3, 100, "Nome"),
  email: z.string().transform(sanitize).pipe(z.string().email("E-mail inválido").max(255, "E-mail muito longo")),
  cpf: z.string().regex(cpfRegex, "CPF inválido. Use o formato 000.000.000-00"),
});

export type RegistrationForm = z.infer<typeof registrationSchema>;
export type SaleCheckoutForm = z.infer<typeof saleCheckoutSchema>;
