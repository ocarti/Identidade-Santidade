import { z } from "zod";

const cpfRegex = /^\d{3}\.\d{3}\.\d{3}-\d{2}$/;
const cepRegex = /^\d{5}-?\d{3}$/;

export const registrationSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome deve ter no máximo 100 caracteres"),
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
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail muito longo"),
});

export const saleCheckoutSchema = z.object({
  nome: z.string().trim().min(3, "Nome deve ter pelo menos 3 caracteres").max(100, "Nome deve ter no máximo 100 caracteres"),
  email: z.string().trim().email("E-mail inválido").max(255, "E-mail muito longo"),
  cpf: z.string().regex(cpfRegex, "CPF inválido. Use o formato 000.000.000-00"),
});

export type RegistrationForm = z.infer<typeof registrationSchema>;
export type SaleCheckoutForm = z.infer<typeof saleCheckoutSchema>;
