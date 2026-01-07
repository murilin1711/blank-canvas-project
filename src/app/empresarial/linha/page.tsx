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
  "fire-eletrica": {
    name: "Linha Fire - Elétrica",
    title: "Proteção máxima para profissionais",
    description: "Uniformes especializados para profissionais que trabalham com risco elétrico e combate a incêndios",
    longDescription: [
      "Nossa Linha Fire - Elétrica é desenvolvida com materiais de alta tecnologia que oferecem proteção contra arcos elétricos, chamas e altas temperaturas.",
      "Cada peça passa por rigorosos testes de qualidade para garantir conformidade com as normas NR-10 e NR-23, assegurando a segurança dos profissionais em campo.",
      "Combinamos proteção com conforto, utilizando tecidos respiráveis e ergonômicos que permitem mobilidade total durante as atividades laborais."
    ],
    image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?q=80&w=1600&auto=format&fit=crop",
    features: [
      "Tecidos antichamas certificados",
      "Proteção contra arco elétrico",
      "Faixas refletivas de alta visibilidade",
      "Costuras reforçadas",
      "Bolsos funcionais",
      "Conformidade com NR-10 e NR-23"
    ]
  },
  "industrial": {
    name: "Linha Industrial / Construção Civil",
    title: "Resistência para o dia a dia intenso",
    description: "Vestuário resistente e seguro para ambientes industriais e obras",
    longDescription: [
      "A Linha Industrial foi projetada para suportar as condições mais exigentes do ambiente de trabalho, oferecendo durabilidade excepcional.",
      "Utilizamos tecidos resistentes a rasgos e abrasões, com tratamentos especiais que prolongam a vida útil de cada peça.",
      "Nossos uniformes industriais combinam funcionalidade com proteção, incluindo elementos de segurança como faixas refletivas e reforços em áreas de maior desgaste."
    ],
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=1600&auto=format&fit=crop",
    features: [
      "Tecidos de alta resistência",
      "Tratamento anti-manchas",
      "Bolsos para ferramentas",
      "Joelheiras e cotoveleiras",
      "Faixas refletivas",
      "Costuras triplas em pontos de estresse"
    ]
  },
  "social-administrativo": {
    name: "Linha Social / Administrativo",
    title: "Elegância que transmite profissionalismo",
    description: "Elegância e profissionalismo para escritórios e ambientes corporativos",
    longDescription: [
      "Nossa Linha Social é pensada para profissionais que precisam transmitir credibilidade e sofisticação no ambiente corporativo.",
      "Trabalhamos com tecidos nobres e acabamentos refinados, garantindo que cada peça mantenha sua aparência impecável mesmo após muitas lavagens.",
      "O corte é estudado para proporcionar conforto durante longas jornadas, sem comprometer a elegância e o caimento perfeito."
    ],
    image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=1600&auto=format&fit=crop",
    features: [
      "Tecidos nobres e confortáveis",
      "Corte alfaiataria",
      "Fácil manutenção",
      "Opções de personalização",
      "Variedade de cores",
      "Acabamento premium"
    ]
  },
  "militar-seguranca": {
    name: "Linha Militar / Segurança / Trânsito",
    title: "Uniformes táticos de alta performance",
    description: "Uniformes táticos e de alta visibilidade para forças de segurança",
    longDescription: [
      "A Linha Militar e Segurança é desenvolvida para atender às demandas específicas de profissionais que atuam na proteção e ordem pública.",
      "Nossos uniformes táticos oferecem funcionalidade máxima com bolsos estratégicos, reforços em áreas de impacto e tecidos que resistem ao uso intenso.",
      "Para agentes de trânsito, oferecemos opções de alta visibilidade que garantem segurança em qualquer condição de iluminação."
    ],
    image: "https://images.unsplash.com/photo-1541123603104-512919d6a96c?q=80&w=1600&auto=format&fit=crop",
    features: [
      "Tecidos táticos resistentes",
      "Bolsos multiuso",
      "Alta visibilidade",
      "Reforços balísticos opcionais",
      "Secagem rápida",
      "Compatível com equipamentos"
    ]
  },
  "hospitalar-clinica": {
    name: "Linha Hospitalar / Clínica",
    title: "Higiene e conforto para a saúde",
    description: "Vestimentas práticas e higiênicas para profissionais da saúde",
    longDescription: [
      "Nossa Linha Hospitalar é desenvolvida pensando nas necessidades específicas dos profissionais de saúde, que precisam de conforto para longas jornadas.",
      "Os tecidos utilizados permitem lavagens em altas temperaturas, garantindo a desinfecção adequada sem comprometer a durabilidade das peças.",
      "O design funcional inclui bolsos práticos e modelagem que permite movimentos livres durante procedimentos e atendimentos."
    ],
    image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?q=80&w=1600&auto=format&fit=crop",
    features: [
      "Tecidos antimicrobianos",
      "Fácil higienização",
      "Confortáveis para longas jornadas",
      "Bolsos funcionais",
      "Variedade de cores",
      "Resistente a fluidos"
    ]
  },
  "restaurante-hotelaria": {
    name: "Linha Restaurante / Hotelaria",
    title: "Sofisticação para encantar clientes",
    description: "Uniformes sofisticados para gastronomia e hospitalidade",
    longDescription: [
      "A Linha Restaurante e Hotelaria foi criada para refletir a excelência do atendimento em estabelecimentos gastronômicos e hoteleiros.",
      "Cada peça é desenhada para combinar elegância com praticidade, permitindo que os profissionais desempenhem suas funções com conforto e estilo.",
      "Oferecemos uma ampla gama de opções, desde aventais e dolmãs para cozinha até ternos e vestidos para recepção e atendimento."
    ],
    image: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?q=80&w=1600&auto=format&fit=crop",
    features: [
      "Design elegante",
      "Tecidos respiráveis",
      "Resistente a manchas",
      "Confortável para longas jornadas",
      "Opções de personalização",
      "Fácil manutenção"
    ]
  }
};

export default function LinhaEmpresarialPage() {
  const { linhaId } = useParams<{ linhaId: string }>();
  const linha = linhaId ? linhasData[linhaId] : null;

  if (!linha) {
    return (
      <main className="bg-background pt-[100px] min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-medium text-text-primary mb-4">Linha não encontrada</h1>
          <Link to="/empresarial" className="text-[#2e3091] underline">
            Voltar para Uniformes Empresariais
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
              to="/empresarial" 
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
                Características
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
            Interessado na {linha.name}?
          </h2>
          <p className="text-text-tertiary text-body-lg mb-8">
            Entre em contato para solicitar um orçamento personalizado
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
