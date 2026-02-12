import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/sections/footer";

// Import images for each line
import socialImage from "@/assets/linhas/social.jpeg";
import restauranteHotelImage from "@/assets/linhas/restaurante-hotel.jpeg";
import militarImage from "@/assets/linhas/militar.jpeg";
import hospitalarImage from "@/assets/linhas/hospitalar.jpeg";
import fireImage from "@/assets/linhas/fire.jpeg";
import construcaoCivilImage from "@/assets/linhas/construcao-civil.jpeg";

const linhas = [
  {
    id: "fire-eletrica",
    name: "Linha Fire - Elétrica",
    description: "Uniformes especializados para profissionais que trabalham com risco elétrico e combate a incêndios",
    image: fireImage,
  },
  {
    id: "industrial",
    name: "Linha Industrial / Construção Civil",
    description: "Vestuário resistente e seguro para ambientes industriais e obras",
    image: construcaoCivilImage,
  },
  {
    id: "social-administrativo",
    name: "Linha Social / Administrativo",
    description: "Elegância e profissionalismo para escritórios e ambientes corporativos",
    image: socialImage,
  },
  {
    id: "militar-seguranca",
    name: "Linha Militar / Segurança / Trânsito",
    description: "Uniformes táticos e de alta visibilidade para forças de segurança",
    image: militarImage,
  },
  {
    id: "hospitalar-clinica",
    name: "Linha Hospitalar / Clínica",
    description: "Vestimentas práticas e higiênicas para profissionais da saúde",
    image: hospitalarImage,
  },
  {
    id: "restaurante-hotelaria",
    name: "Linha Restaurante / Hotelaria",
    description: "Uniformes sofisticados para gastronomia e hospitalidade",
    image: restauranteHotelImage,
  },
];

export default function EmpresarialPage() {
  return (
    <main className="bg-background pt-[100px]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2e3091]/5 via-transparent to-[#2e3091]/10" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block text-[#2e3091] text-caption font-medium tracking-wider uppercase mb-4">
              Soluções Corporativas
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-text-primary leading-tight mb-6">
              Uniformes <span className="text-[#2e3091]">Empresariais</span>
            </h1>
            <p className="text-text-tertiary text-body-lg leading-relaxed">
              Desenvolvemos uniformes profissionais para todos os segmentos do mercado, 
              combinando conforto, durabilidade e identidade visual para sua empresa.
            </p>
          </div>
        </div>
      </section>

      {/* Lines Grid */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {linhas.map((linha) => (
              <Link
                key={linha.id}
                to={`/empresarial/${linha.id}`}
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 hover:border-[#2e3091]/20 transition-all duration-300 hover:shadow-xl"
              >
                <div className="aspect-[4/3] overflow-hidden">
                  <img
                    src={linha.image}
                    alt={linha.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  <div className="bg-accent-button/95 backdrop-blur-sm rounded-lg p-4">
                    <h3 className="text-base font-medium text-white mb-1 tracking-tight">
                      {linha.name}
                    </h3>
                    <p className="text-white/80 text-body-sm mb-3 line-clamp-2">
                      {linha.description}
                    </p>
                    <div className="flex items-center gap-2 text-white text-caption font-medium">
                      <span>Ver mais</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 md:py-24 bg-background-secondary">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-text-primary mb-4">
            Precisa de uniformes personalizados para sua empresa?
          </h2>
          <p className="text-text-tertiary text-body-lg mb-8">
            Entre em contato e solicite um orçamento sem compromisso
          </p>
          <a
            href="https://wa.me/5562991121586?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20uniformes%20empresariais."
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#2e3091] text-white px-8 py-4 rounded-full text-btn font-medium hover:bg-[#252a7a] transition-colors"
          >
            Falar com um consultor
          </a>
        </div>
      </section>

      <Footer />
    </main>
  );
}
