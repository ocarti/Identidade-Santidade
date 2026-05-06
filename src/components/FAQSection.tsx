import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "Quando e onde acontecerá o congresso Identidade e Santidade?",
    answer:
      "O Congresso Identidade & Santidade acontecerá nos dias 31 de Julho, 01 e 02 de Agosto de 2026, na Igreja Batista Betel em Dois Vizinhos, PR.",
  },
  {
    question: "Para quem é o Congresso Identidade & Santidade?",
    answer: `Para todos aqueles que querem uma experiência única de avivamento dentro de atmosferas cheias da presença de Deus provando de intensos momentos de adoração, louvor e revelação da Palavra.\n\nE também para aqueles que:\n• Estão inconformados com a realidade atual da sociedade\n• Buscam viver um estilo de vida sobrenatural\n• Querem fazer história com Deus\n• Querem proclamar o evangelho\n• Buscam investir em coisas eternas`,
  },
  {
    question: "Como funcionam as sessões do evento?",
    answer:
      "1° dia — início a partir das 20:00h\n2° dia — início às 08:00h com programação durante todo o dia e noite\n3° e último dia — início às 19:00h",
  },
  {
    question: "Os ingressos dão direito a todas as sessões do evento?",
    answer: "Sim. O ingresso dá direito a todas as sessões.",
  },
  {
    question: "Os ingressos dão direito à hospedagem e alimentação?",
    answer:
      "Não. A hospedagem e alimentação não estão inclusos no valor do ingresso. Esses são de responsabilidade de cada participante. O ingresso dá somente acesso ao congresso.",
  },
  {
    question: "Quais documentos eu apresento na hora do Check-in?",
    answer:
      "Você precisa apresentar documento com foto e o ingresso impresso ou apresentar o QR Code em seu smartphone.",
  },
  {
    question: "Quais as formas de pagamento?",
    answer:
      "Existem várias opções de pagamento como cartão de crédito (parcelamento com e sem juros, variando de acordo com a quantidade de parcelas), PIX ou boleto bancário.",
  },
  {
    question: "Posso alterar as informações do meu ingresso?",
    answer:
      "Para editar as informações em seu ingresso você deverá entrar no link do seu ingresso, efetuar login com o e-mail utilizado na compra e atualizar os dados do participante. Cada ingresso é individual e pode ser alterado apenas uma vez.",
  },
  {
    question: "Meu ingresso é transferível?",
    answer:
      "Para a transferência do ingresso você deverá entrar no link que recebeu junto com seu ingresso, efetuar login com o mesmo e-mail que sua compra foi realizada e atualizar os dados para a pessoa que você gostaria de transferir o ingresso. Isso poderá ser feito apenas uma vez.\n\nIMPORTANTE: Não realizaremos troca de informações do ingresso na entrada do evento, portanto fique atento a isso.",
  },
  {
    question: "Posso comprar mais de um ingresso com o mesmo CPF?",
    answer:
      "Sim, porém é necessário colocar os dados completos da pessoa que irá usar o ingresso para não ter problemas na entrada do evento.",
  },
  {
    question: "Reembolso",
    answer:
      "Os ingressos poderão ser cancelados no prazo de 7 (sete) dias a contar da data de sua compra conforme estipulado no código de defesa do consumidor.\n\nApós os 7 (sete) dias, não haverá reembolso. Você poderá transferir o ingresso para outra pessoa, caso não possa comparecer ao evento.\n\nObservação: O não comparecimento ao evento não dá direito a reembolso da inscrição.",
  },
  {
    question: "Qual a classificação etária?",
    answer:
      "Não recomendamos a participação de crianças de 0-12 anos, porém caso elas participem deverão estar acompanhadas de seus pais e crianças acima de 8 anos pagam ingresso integral.\n\nOBS: Menores de 18 anos podem participar do evento, porém não nos responsabilizamos pelos mesmos.",
  },
  {
    question: "Meia Entrada",
    answer:
      "Não existe meia entrada para este evento.\n\nO Congresso Identidade e Santidade esclarece que não se enquadra na Lei 12933/2013 (Lei Federal da Meia Entrada), pelo fato de promover cultos de ministração religiosa e conferências de cunho religioso. O Art. 1° da referida lei prevê a meia entrada a estudantes somente em cinemas, teatros, espetáculos musicais, esportivos, de lazer e entretenimento.",
  },
  {
    question: "Existe um estacionamento no local do evento?",
    answer:
      "Não possuímos um estacionamento exclusivo, apenas os das vias da cidade.",
  },
  {
    question: "Existem hotéis próximos ao evento?",
    answer: "Sim.",
  },
  {
    question: "Onde almoçar ou fazer um lanche durante os intervalos?",
    answer:
      "Próximo ao evento em um raio de 300 metros existem várias opções para alimentação. Durante o congresso no período da noite (durante os 3 dias, apenas no período da noite) teremos venda de alimentos no subsolo do local do evento.",
  },
  {
    question: "Qual e-mail para contato em casos de dúvidas?",
    answer:
      "Você pode enviar suas dúvidas para secretariabeteldv@gmail.com",
  },
];

export function FAQSection() {
  return (
    <section className="py-24">
      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <p className="font-body text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
            Tire Suas Dúvidas
          </p>
          <h2 className="font-display text-5xl md:text-6xl">
            Perguntas Frequentes
          </h2>
        </motion.div>

        <Accordion type="single" collapsible className="w-full">
          {faqItems.map((item, i) => (
            <AccordionItem key={i} value={`faq-${i}`}>
              <AccordionTrigger className="font-body text-left text-base font-semibold">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="font-body text-muted-foreground leading-relaxed whitespace-pre-line">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
