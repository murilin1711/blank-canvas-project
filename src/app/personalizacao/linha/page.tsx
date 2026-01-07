import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle } from "lucide-react";
import Footer from "@/components/sections/footer";

const linhasData: Record<string, {
  name: string;
  title: string;
  description: string;
  longDescription: string[];
  image: string;
  features: string[];
}> = {
  "religiosa": {
    name: "Linha Religiosa",
    title: "Fé expressa em cada estampa",
    description: "Camisetas personalizadas para igrejas, grupos de jovens e eventos religiosos",
    longDescription: [
      "Nossa Linha Religiosa é desenvolvida com carinho e respeito para comunidades de fé que desejam expressar suas crenças através de camisetas personalizadas.",
      "Trabalhamos com pastores, padres, líderes de grupos jovens e organizadores de eventos para criar designs que transmitam mensagens de esperança e união.",
      "Oferecemos uma variedade de opções de personalização, desde estampas simples com versículos até designs elaborados para retiros e congressos religiosos."
    ],
    image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=1600&auto=format&fit=crop",
    features: [
      "Estampas com versículos e símbolos religiosos",
      "Tecidos confortáveis para eventos longos",
      "Opções para todas as idades",
      "Personalização com nome do grupo",
      "Cores variadas",
      "Entrega para todo Brasil"
    ]
  },
  "esportiva": {
    name: "Linha Esportiva",
    title: "Performance que faz a diferença",
    description: "Uniformes para times, academias e eventos esportivos",
    longDescription: [
      "A Linha Esportiva foi criada para atletas amadores e profissionais que buscam qualidade e conforto durante suas atividades físicas.",
      "Utilizamos tecidos de alta tecnologia como dry-fit e UV protection, garantindo performance e proteção em qualquer modalidade esportiva.",
      "Personalizamos uniformes completos para times de futebol, vôlei, basquete, além de camisetas para corridas, academias e eventos esportivos."
    ],
    image: "https://images.unsplash.com/photo-1517466787929-bc90951d0974?q=80&w=1600&auto=format&fit=crop",
    features: [
      "Tecidos dry-fit e respiráveis",
      "Proteção UV",
      "Sublimação de alta definição",
      "Números e nomes personalizados",
      "Resistência a lavagens",
      "Modelagem para esportes específicos"
    ]
  },
  "eventos-escolares": {
    name: "Linha Eventos Escolares",
    title: "Momentos inesquecíveis eternizados",
    description: "Camisetas para formaturas, excursões e celebrações escolares",
    longDescription: [
      "A Linha Eventos Escolares celebra os momentos mais especiais da vida estudantil, criando recordações que durarão para sempre.",
      "Desenvolvemos camisetas personalizadas para formaturas de todos os níveis, desde a educação infantil até o ensino superior.",
      "Também atendemos excursões escolares, semanas culturais, gincanas, festas juninas e todas as celebrações que marcam a trajetória dos estudantes."
    ],
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=1600&auto=format&fit=crop",
    features: [
      "Designs exclusivos para cada turma",
      "Nomes de todos os formandos",
      "Opções para diferentes orçamentos",
      "Entrega pontual garantida",
      "Diversos modelos e cores",
      "Assessoria de design incluída"
    ]
  },
  "eventos-corporativos": {
    name: "Linha Eventos Corporativos",
    title: "Identidade visual que impacta",
    description: "Camisetas para convenções, treinamentos e eventos empresariais",
    longDescription: [
      "Nossa Linha Eventos Corporativos ajuda empresas a fortalecerem sua marca e criarem experiências memoráveis para colaboradores e clientes.",
      "Produzimos camisetas para convenções de vendas, treinamentos de equipe, feiras e exposições, lançamentos de produtos e confraternizações.",
      "Trabalhamos em parceria com sua equipe de marketing para garantir que cada peça esteja alinhada com a identidade visual da empresa."
    ],
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1600&auto=format&fit=crop",
    features: [
      "Aplicação fiel da marca",
      "Tecidos de qualidade premium",
      "Grandes quantidades com prazo reduzido",
      "Embalagens personalizadas",
      "Opções sustentáveis",
      "Kits completos para eventos"
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
                O que oferecemos
              </h2>
              <ul className="space-y-4">
                {linha.features.map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#2e3091]" />
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
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://wa.me/5562991121586?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20a%20{linha.name}."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-[#2e3091] text-white px-8 py-4 rounded-full text-btn font-medium hover:bg-[#252a7a] transition-colors"
            >
              <MessageCircle className="w-5 h-5" />
              Falar pelo WhatsApp
            </a>
            <a
              href="tel:+5562991121586"
              className="inline-flex items-center justify-center gap-2 border-2 border-[#2e3091] text-[#2e3091] px-8 py-4 rounded-full text-btn font-medium hover:bg-[#2e3091] hover:text-white transition-colors"
            >
              <Phone className="w-5 h-5" />
              Ligar agora
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
