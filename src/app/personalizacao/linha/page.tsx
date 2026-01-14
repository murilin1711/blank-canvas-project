import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Clock } from "lucide-react";
import Footer from "@/components/sections/footer";

// Import images for each line
import religiosaImage from "@/assets/linhas/religiosa.jpeg";
import esportivaImage from "@/assets/linhas/esportiva.jpeg";
import eventosEscolaresImage from "@/assets/linhas/eventos-escolares.jpeg";
import eventosCorporativosImage from "@/assets/linhas/eventos-corporativos.png";

const linhasData: Record<string, {
  name: string;
  title: string;
  description: string;
  readingTime: string;
  longDescription: string[];
  image: string;
  features: string[];
}> = {
  "religiosa": {
    name: "Linha Religiosa",
    title: "Fé expressa em cada estampa",
    description: "Camisetas personalizadas com temas religiosos para crisma, catequese, retiros e eventos religiosos",
    readingTime: "35 segundos",
    longDescription: [
      "A linha religiosa é composta por camisetas personalizadas com temas religiosos, desenvolvidas para transmitir fé, identidade e pertencimento. Indicadas para crisma, catequese, encontros, retiros e eventos religiosos, unem significado e conforto.",
      "As peças oferecem estampas personalizadas, mantendo um visual respeitoso e adequado ao contexto, além de conforto para uso prolongado em atividades e celebrações."
    ],
    image: religiosaImage,
    features: [
      "Estampas com temas religiosos personalizados",
      "Ideal para crisma, catequese e eventos religiosos",
      "Tecidos leves e confortáveis",
      "Visual discreto e respeitoso",
      "Boa durabilidade e fácil manutenção",
      "Opções de personalização conforme a necessidade do grupo"
    ]
  },
  "esportiva": {
    name: "Linha Esportiva",
    title: "Performance que faz a diferença",
    description: "Camisetas para equipes, times e eventos esportivos",
    readingTime: "45 segundos",
    longDescription: [
      "A linha esportiva é desenvolvida para atender equipes, times e eventos esportivos, oferecendo conforto, mobilidade e identidade visual. Inclui camisetas para times, coletes esportivos e peças voltadas para atividades físicas e competições.",
      "Com tecidos leves e respiráveis, essa linha garante melhor desempenho durante a prática esportiva, além de permitir personalização com cores, nomes e números."
    ],
    image: esportivaImage,
    features: [
      "Indicada para times, treinamentos e eventos esportivos",
      "Tecidos leves e respiráveis",
      "Liberdade total de movimentos",
      "Personalização com cores, nomes e numeração",
      "Alta resistência ao uso intenso",
      "Opções de coletes e camisetas esportivas"
    ]
  },
  "eventos-escolares": {
    name: "Linha para Eventos Escolares",
    title: "Momentos inesquecíveis eternizados",
    description: "Camisetas para formaturas, datas comemorativas e eventos institucionais",
    readingTime: "50 segundos",
    longDescription: [
      "A linha para eventos escolares é ideal para momentos especiais, como formaturas de turma, datas comemorativas e eventos institucionais. As camisetas ajudam a marcar essas ocasiões, promovendo integração e identidade entre alunos e equipes.",
      "As peças são personalizadas conforme o tema do evento, oferecendo conforto e um visual padronizado para registros e celebrações."
    ],
    image: eventosEscolaresImage,
    features: [
      "Ideal para formaturas e eventos escolares",
      "Personalização conforme tema e série",
      "Tecidos confortáveis para uso prolongado",
      "Visual padronizado e marcante",
      "Ótima opção para lembrança do evento",
      "Fácil manutenção e boa durabilidade"
    ]
  },
  "eventos-corporativos": {
    name: "Linha para Eventos Corporativos",
    title: "Identidade visual que impacta",
    description: "Camisetas para ações promocionais, eventos internos e datas comemorativas empresariais",
    readingTime: "55 segundos",
    longDescription: [
      "A linha para eventos corporativos é desenvolvida para fortalecer a identidade visual da empresa em ações promocionais, eventos internos e datas comemorativas. As camisetas oferecem padronização, profissionalismo e conforto para colaboradores e participantes.",
      "Com personalização alinhada à marca, essa linha contribui para uma imagem corporativa forte e organizada durante eventos e campanhas."
    ],
    image: eventosCorporativosImage,
    features: [
      "Ideal para eventos, ações e datas comemorativas",
      "Reforço da identidade visual da empresa",
      "Personalização com logotipo e cores institucionais",
      "Conforto para uso durante eventos prolongados",
      "Visual profissional e organizado",
      "Excelente custo-benefício"
    ]
  }
};

export default function LinhaPersonalizacaoPage() {
  const { linhaId } = useParams<{ linhaId: string }>();
  const linha = linhaId ? linhasData[linhaId] : null;

  if (!linha) {
    return (
      <main className="bg-background pt-[100px] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-text-primary mb-4">Linha não encontrada</h1>
          <Link to="/personalizacao" className="text-[#2e3091] underline">
            Voltar para Camisetas Personalizadas
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-background pt-[100px]">
      {/* Hero Banner */}
      <section className="relative h-[50vh] md:h-[60vh] overflow-hidden">
        <img
          src={linha.image}
          alt={linha.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
        <div className="absolute inset-0 flex items-end">
          <div className="max-w-6xl mx-auto px-6 pb-12 md:pb-16 w-full">
            <Link 
              to="/personalizacao" 
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Voltar para Linhas</span>
            </Link>
            <h1 className="text-3xl md:text-5xl font-medium text-white mb-3">
              {linha.name}
            </h1>
            <p className="text-white/80 text-lg md:text-xl max-w-2xl">
              {linha.title}
            </p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          {/* Reading Time Badge */}
          <div className="flex items-center gap-2 text-text-tertiary mb-8">
            <Clock className="w-4 h-4" />
            <span className="text-body-sm">Tempo de leitura: aproximadamente {linha.readingTime}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Description */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-text-primary mb-6">
                Sobre esta linha
              </h2>
              <div className="space-y-4 text-text-tertiary text-body-regular leading-relaxed">
                {linha.longDescription.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <h2 className="text-2xl md:text-3xl font-medium text-text-primary mb-6">
                Características da {linha.name}
              </h2>
              <ul className="space-y-4">
                {linha.features.map((feature, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#2e3091] mt-2 flex-shrink-0" />
                    <span className="text-text-secondary">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-background-secondary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-text-primary mb-4">
            Pronto para criar sua camiseta?
          </h2>
          <p className="text-text-tertiary text-body-lg mb-8">
            Entre em contato e transforme sua ideia em realidade
          </p>
          <a
            href={`https://wa.me/5562991121586?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20a%20${encodeURIComponent(linha.name)}.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 bg-[#2e3091] text-white px-8 py-4 rounded-full text-btn font-medium hover:bg-[#252a7a] transition-colors"
          >
            <MessageCircle className="w-5 h-5" />
            Falar pelo WhatsApp
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
