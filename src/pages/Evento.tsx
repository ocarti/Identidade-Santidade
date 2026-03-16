import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MarqueeBanner } from "@/components/MarqueeBanner";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CalendarDays, MapPin, Clock, Gift, Mail } from "lucide-react";
import gallery1 from "@/assets/gallery-1.jpg";

const faqItems = [
  {
    question: "Quando e onde acontecerá o congresso Identidade e Santidade?",
    answer:
      "O Congresso Identidade & Santidade acontecerá nos dias 25 a 27 de Julho de 2025, na Igreja Batista Betel em Dois Vizinhos, PR.",
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
    question: "Os ingressos dão direito a brindes? Quais?",
    answer:
      "Sim. Ao adquirir o ingresso do evento você ganha também uma Bíblia de brochura + adesivo holográfico personalizado + pulseira de acesso (comum, em material de papel).",
  },
  {
    question: "Os ingressos dão direito à hospedagem e alimentação?",
    answer:
      "Não. A hospedagem e alimentação não estão inclusos no valor do ingresso. Esses são de responsabilidade de cada participante. O ingresso dá somente acesso ao congresso.",
  },
  {
    question: "Quais documentos eu apresento na hora do Check-in?",
    answer:
      "Você precisa levar somente o ingresso impresso ou apresentar o QR Code em seu smartphone.",
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
      "Os ingressos poderão ser cancelados no prazo de 7 (sete) dias a contar da data de sua compra conforme estipulado no código de defesa do consumidor.\n\nApós os 7 (sete) dias, não haverá reembolso. Você poderá transferir o ingresso para outra pessoa, caso não puder comparecer ao evento.\n\nObservação: O não comparecimento ao evento não dá direito a reembolso da inscrição.",
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

export default function Evento() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        {/* Hero banner */}
        <section className="relative h-[60vh] flex items-end overflow-hidden">
          <img
            src={gallery1}
            alt="Congresso Identidade Santidade"
            className="absolute inset-0 w-full h-full object-cover grayscale"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/60 to-transparent" />
          <div className="relative container pb-12 text-primary-foreground">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="font-display text-6xl md:text-8xl">O Evento</h1>
            </motion.div>
          </div>
        </section>

        {/* Introdução */}
        <section className="py-24">
          <div className="container max-w-4xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <p className="font-body text-sm uppercase tracking-[0.3em] text-muted-foreground mb-2">
                4ª Edição
              </p>
              <h2 className="font-display text-5xl md:text-6xl mb-8">
                Congresso Identidade & Santidade
              </h2>
              <div className="space-y-6 font-body text-muted-foreground leading-relaxed text-lg">
                <p>
                  O Congresso Identidade & Santidade é um de nossos principais
                  eventos durante o ano. Essa será nossa 4ª edição onde nos
                  juntaremos para buscar a presença de Deus, receber direções e
                  até mesmo fazer conexões com outras pessoas.
                </p>
                <p>
                  Serão 3 dias de evento com sessões e preletores diferentes
                  contando também com momentos de adoração e oração que são
                  simplesmente incríveis...
                </p>
                <p className="font-display text-foreground text-2xl md:text-3xl leading-snug">
                  Cremos que Deus tem algo específico reservado para 2025 e
                  queremos você nessa com a gente!
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Informações rápidas */}
        <section className="py-24 bg-primary text-primary-foreground">
          <div className="container">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <p className="font-body text-sm uppercase tracking-[0.3em] text-primary-foreground/60 mb-2">
                Informações
              </p>
              <h2 className="font-display text-5xl md:text-6xl">
                Detalhes do Evento
              </h2>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: CalendarDays,
                  title: "Data",
                  desc: "25, 26 e 27 de Julho de 2025",
                },
                {
                  icon: MapPin,
                  title: "Local",
                  desc: "Igreja Batista Betel — Dois Vizinhos, PR",
                },
                {
                  icon: Gift,
                  title: "Brindes Inclusos",
                  desc: "Bíblia + Adesivo holográfico + Pulseira de acesso",
                },
                {
                  icon: Mail,
                  title: "Contato",
                  desc: "secretariabeteldv@gmail.com",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="text-center space-y-3"
                >
                  <item.icon className="mx-auto h-8 w-8 text-primary-foreground/60" />
                  <h3 className="font-display text-2xl">{item.title}</h3>
                  <p className="font-body text-sm text-primary-foreground/70">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Programação resumida */}
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
                Programação
              </p>
              <h2 className="font-display text-5xl md:text-6xl">
                Cronograma
              </h2>
            </motion.div>

            <div className="space-y-8">
              {[
                {
                  day: "Dia 1 — Sexta, 25/07",
                  time: "Início às 20:00h",
                  detail: "Abertura do congresso com sessão noturna",
                },
                {
                  day: "Dia 2 — Sábado, 26/07",
                  time: "Início às 08:00h",
                  detail:
                    "Programação durante todo o dia e noite com sessões e preletores",
                },
                {
                  day: "Dia 3 — Domingo, 27/07",
                  time: "Início às 19:00h",
                  detail: "Encerramento com sessão especial",
                },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.15 }}
                  className="border-l-2 border-foreground/20 pl-8"
                >
                  <h3 className="font-display text-3xl md:text-4xl mb-1">
                    {item.day}
                  </h3>
                  <div className="flex items-center gap-2 text-muted-foreground font-body text-sm mb-2">
                    <Clock className="h-4 w-4" />
                    {item.time}
                  </div>
                  <p className="font-body text-muted-foreground">
                    {item.detail}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24 bg-secondary">
          <div className="container text-center max-w-3xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="space-y-6"
            >
              <p className="font-display text-4xl md:text-5xl leading-tight">
                Reserve em sua agenda e garanta seu ingresso.
              </p>
              <p className="font-body text-muted-foreground text-lg">
                Nossas vagas são limitadas!
              </p>
              <a
                href="/inscricao"
                className="inline-block bg-primary text-primary-foreground px-10 py-4 font-body text-sm font-semibold uppercase tracking-widest hover:opacity-80 transition-opacity mt-4"
              >
                Inscreva-se Agora
              </a>
            </motion.div>
          </div>
        </section>

        {/* FAQ */}
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
      </main>
      <Footer />
      <MarqueeBanner />
    </div>
  );
}
