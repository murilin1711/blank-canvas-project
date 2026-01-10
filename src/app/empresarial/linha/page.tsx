import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Phone, MessageCircle, Clock } from "lucide-react";
import Footer from "@/components/sections/footer";

// Import images for each line
import socialImage from "@/assets/linhas/social.jpeg";
import restauranteHotelImage from "@/assets/linhas/restaurante-hotel.jpeg";
import militarImage from "@/assets/linhas/militar.jpeg";
import hospitalarImage from "@/assets/linhas/hospitalar.jpeg";
import fireImage from "@/assets/linhas/fire.jpeg";
import construcaoCivilImage from "@/assets/linhas/construcao-civil.jpeg";

const linhasData: Record<string, {
  name: string;
  title: string;
  description: string;
  readingTime: string;
  longDescription: string[];
  image: string;
  features: string[];
}> = {
  "fire-eletrica": {
    name: "Linha Fire - Elétrica",
    title: "Proteção máxima para profissionais",
    description: "Uniformes especializados para profissionais que trabalham com risco elétrico e combate a incêndios",
    readingTime: "1 min 30 seg",
    longDescription: [
      "Os uniformes FR (Flame Resistant) são vestimentas de proteção desenvolvidas para oferecer segurança contra agentes térmicos provenientes do fogo repentino e do arco elétrico, sendo indicados para atividades que envolvem instalações e serviços elétricos.",
      "Esse tipo de uniforme é essencial para profissionais que trabalham diretamente com equipamentos energizados ou em áreas próximas, ajudando a reduzir riscos e possíveis lesões em situações de acidente.",
      "As vestimentas de proteção contra arco elétrico atendem às normas nacionais e internacionais, incluindo a NR10, e atuam como uma barreira térmica, diminuindo a transferência de calor para o corpo humano.",
      "O Uniforme Risco 2 é indicado para ambientes com média tensão, oferecendo proteção adequada por meio de tecidos especiais e retardantes de chamas, garantindo mais segurança no dia a dia operacional.",
      "A NR10 estabelece critérios de segurança para trabalhos com eletricidade e classifica os riscos elétricos, sendo o Risco 2 fundamental para definir o nível correto de proteção em atividades de instalação, operação e manutenção.",
      "O ATPV (Arc Thermal Performance Value) indica o nível de proteção térmica do tecido contra o arco elétrico, medido em cal/cm². Quanto maior esse índice, maior é a capacidade do uniforme de proteger o trabalhador contra a energia térmica gerada."
    ],
    image: fireImage,
    features: [
      "Proteção contra fogo repentino e arco elétrico",
      "Indicado para trabalhos com eletricidade",
      "Classificação Risco 2 (média tensão)",
      "Tecidos retardantes de chamas",
      "Atende à norma NR10",
      "Redução da transferência de calor para o corpo",
      "Índice ATPV que garante proteção térmica adequada",
      "Mais segurança em ambientes de risco elétrico"
    ]
  },
  "industrial": {
    name: "Linha Industrial / Construção Civil",
    title: "Resistência para o dia a dia intenso",
    description: "Vestuário resistente e seguro para ambientes industriais e obras",
    readingTime: "1 min",
    longDescription: [
      "O uniforme para a construção civil é um equipamento de trabalho essencial, desenvolvido para proteger o trabalhador, aumentar a visibilidade e oferecer conforto durante longas jornadas em ambientes variados.",
      "Um uniforme operacional deve unir praticidade, segurança e conforto, atendendo às exigências do dia a dia em obras e áreas industriais. Ele precisa permitir liberdade de movimento, facilitar o acesso a ferramentas e contribuir para a segurança do profissional, especialmente em locais com circulação de máquinas e condições climáticas diversas.",
      "Além disso, os uniformes para esse segmento são produzidos com materiais resistentes, cores de alta visibilidade e opções que auxiliam na proteção contra intempéries, garantindo mais eficiência e bem-estar durante o trabalho."
    ],
    image: construcaoCivilImage,
    features: [
      "Tecidos resistentes a rasgos e desgaste, como algodão e misturas com poliéster",
      "Reforços estratégicos em áreas de maior esforço, como joelhos e cotovelos",
      "Cores de alta visibilidade para ambientes com máquinas e tráfego intenso",
      "Modelagem confortável que permite liberdade de movimentos",
      "Tecidos respiráveis para maior conforto térmico",
      "Bolsos funcionais para ferramentas e itens essenciais",
      "Opções com proteção contra chuva e vento para uso externo",
      "Identificação visual da empresa para organização e segurança",
      "Compatível com o uso de acessórios de segurança, como capacete, luvas e calçados de proteção"
    ]
  },
  "social-administrativo": {
    name: "Linha Social / Administrativo",
    title: "Elegância que transmite profissionalismo",
    description: "Elegância e profissionalismo para escritórios e ambientes corporativos",
    readingTime: "45 seg",
    longDescription: [
      "Os uniformes da linha social e administrativa são desenvolvidos para equilibrar elegância, conforto e funcionalidade, transmitindo uma imagem profissional e alinhada à identidade da empresa. Eles contribuem para um visual padronizado, reforçando os valores corporativos e a credibilidade no ambiente de trabalho.",
      "Essas vestimentas são ideais para escritórios, áreas administrativas, recepção e atendimento ao público, oferecendo conforto durante toda a jornada, sem abrir mão da apresentação profissional. O uso de cores sóbrias, tecidos de qualidade e acabamentos discretos garante um visual adequado ao ambiente corporativo."
    ],
    image: socialImage,
    features: [
      "Estilo elegante e profissional",
      "Peças como camisas sociais, polos, calças, saias ou vestidos",
      "Cores neutras e sóbrias, como preto, cinza e azul-marinho",
      "Tecidos confortáveis e duráveis, como algodão e poliéster",
      "Fácil manutenção para o uso diário",
      "Opção de bordado discreto para identificação da empresa",
      "Uso de acessórios que complementam o visual com sobriedade",
      "Modelos adaptáveis para diferentes estações do ano",
      "Reforço da identidade visual e da imagem corporativa"
    ]
  },
  "militar-seguranca": {
    name: "Linha Militar / Segurança / Trânsito",
    title: "Uniformes táticos de alta performance",
    description: "Uniformes táticos e de alta visibilidade para forças de segurança",
    readingTime: "1 min 15 seg",
    longDescription: [
      "Os uniformes da linha militar, segurança e trânsito são parte fundamental do equipamento operacional, indo além da vestimenta e representando identidade, autoridade e preparo profissional. Eles são desenvolvidos para oferecer segurança, funcionalidade e identificação clara em diferentes situações operacionais.",
      "Projetados para atender às exigências de cada ambiente de atuação, esses uniformes combinam resistência, conforto e mobilidade, garantindo desempenho adequado em rotinas intensas, ações táticas e atividades em ambientes urbanos ou externos, sob diferentes condições climáticas."
    ],
    image: militarImage,
    features: [
      "Tecidos resistentes e duráveis, indicados para uso intenso",
      "Alta resistência ao desgaste diário e às condições adversas",
      "Cores funcionais e distintivas para fácil identificação e visibilidade",
      "Identificação clara por meio de emblemas, faixas ou distintivos",
      "Elementos de proteção, como reforços em joelhos e cotovelos",
      "Possibilidade de uso com equipamentos de proteção adicionais",
      "Modelagem que permite ampla liberdade de movimento",
      "Bolsos e compartimentos estratégicos para equipamentos operacionais",
      "Opções adaptadas para diferentes climas e ambientes",
      "Conformidade com padrões e regulamentos específicos de cada função"
    ]
  },
  "hospitalar-clinica": {
    name: "Linha Hospitalar / Clínica",
    title: "Higiene e conforto para a saúde",
    description: "Vestimentas práticas e higiênicas para profissionais da saúde",
    readingTime: "1 min 10 seg",
    longDescription: [
      "Os uniformes da linha hospitalar e para clínicas são desenvolvidos para garantir higiene, segurança e conforto, além de transmitir uma imagem profissional adequada ao ambiente da saúde. Mais do que vestimentas, eles são parte essencial da rotina de trabalho de médicos, enfermeiros e demais profissionais da área.",
      "Projetados para uso contínuo, esses uniformes utilizam tecidos resistentes à lavagem frequente, permitem ampla mobilidade e facilitam a identificação dos profissionais, contribuindo para um ambiente organizado, seguro e funcional."
    ],
    image: hospitalarImage,
    features: [
      "Tecidos adequados para lavagens frequentes em altas temperaturas",
      "Opções com propriedades antimicrobianas",
      "Conforto para longas jornadas de trabalho",
      "Tecidos leves e respiráveis",
      "Identificação clara do profissional e da função",
      "Modelagem que permite liberdade total de movimentos",
      "Cores sólidas e profissionais, como branco, azul e verde",
      "Bolsos funcionais para pequenos instrumentos e acessórios",
      "Design que respeita a esterilidade do ambiente",
      "Conformidade com normas e regulamentos hospitalares"
    ]
  },
  "restaurante-hotelaria": {
    name: "Linha Restaurante / Hotelaria",
    title: "Sofisticação para encantar clientes",
    description: "Uniformes sofisticados para gastronomia e hospitalidade",
    readingTime: "55 seg",
    longDescription: [
      "Os uniformes da linha restaurante e hotelaria são desenvolvidos para reforçar a identidade visual do estabelecimento, ao mesmo tempo em que garantem conforto, praticidade e funcionalidade no dia a dia operacional.",
      "Indicados para restaurantes, hotéis, bares e áreas de atendimento, esses uniformes aliam estética profissional, facilidade de manutenção e adequação às normas de higiene e segurança, contribuindo para uma experiência positiva tanto para os colaboradores quanto para os clientes."
    ],
    image: restauranteHotelImage,
    features: [
      "Estilo alinhado à identidade visual do restaurante ou hotel",
      "Visual elegante e profissional para atendimento ao público",
      "Conforto para uso prolongado e liberdade de movimento",
      "Tecidos respiráveis e de fácil manutenção",
      "Diferenciação de cargos por cores, modelos ou identificações",
      "Alta resistência à lavagem e facilidade de limpeza",
      "Opção de acessórios funcionais, como aventais e crachás",
      "Modelos adaptáveis para diferentes estações do ano",
      "Elementos de segurança para áreas operacionais, como solados antiderrapantes",
      "Conformidade com normas de higiene e segurança alimentar"
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
          {/* Reading Time Badge */}
          <div className="flex items-center gap-2 text-text-tertiary mb-8">
            <Clock className="w-4 h-4" />
            <span className="text-body-sm">Tempo de leitura: {linha.readingTime}</span>
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
                Características
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
            Interessado na {linha.name}?
          </h2>
          <p className="text-text-tertiary text-body-lg mb-8">
            Entre em contato para solicitar um orçamento personalizado
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href={`https://wa.me/5562991121586?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20a%20${encodeURIComponent(linha.name)}.`}
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
