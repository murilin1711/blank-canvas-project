import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/sections/footer";

const linhas = [
  {
    id: "religiosa",
    name: "Linha Religiosa",
    description: "Camisetas personalizadas para igrejas, grupos de jovens, eventos religiosos e comunidades de fé",
    image: "https://images.unsplash.com/photo-1507692049790-de58290a4334?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "esportiva",
    name: "Linha Esportiva",
    description: "Uniformes para times, academias, corridas e eventos esportivos com tecidos de alta performance",
    image: "https://images.unsplash.com/photo-1461896836934- voices?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "eventos-escolares",
    name: "Linha Eventos Escolares",
    description: "Camisetas para formaturas, excursões, gincanas e celebrações escolares memoráveis",
    image: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?q=80&w=800&auto=format&fit=crop",
  },
  {
    id: "eventos-corporativos",
    name: "Linha Eventos Corporativos",
    description: "Camisetas para convenções, treinamentos, feiras e eventos empresariais de impacto",
    image: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=800&auto=format&fit=crop",
  },
];

export default function PersonalizacaoPage() {
  return (
    <main className="bg-background pt-[100px]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2e3091]/5 via-transparent to-[#2e3091]/10" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="text-center max-w-3xl mx-auto">
            <span className="inline-block text-[#2e3091] text-caption font-medium tracking-wider uppercase mb-4">
              Personalização Criativa
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-text-primary leading-tight mb-6">
              Camisetas <span className="text-[#2e3091]">Personalizadas</span>
            </h1>
            <p className="text-text-tertiary text-body-lg leading-relaxed">
              Transforme suas ideias em camisetas únicas. Oferecemos soluções personalizadas 
              para todos os tipos de eventos e ocasiões especiais.
            </p>
          </div>
        </div>
      </section>

      {/* Lines Grid */}
      <section className="py-12 md:py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {linhas.map((linha) => (
              <Link
                key={linha.id}
                to={`/personalizacao/${linha.id}`}
                className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 hover:border-[#2e3091]/20 transition-all duration-300 hover:shadow-xl"
              >
                <div className="aspect-[16/10] overflow-hidden">
                  <img
                    src={linha.image}
                    alt={linha.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2e3091]/95 via-[#2e3091]/60 to-transparent" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
                  <div className="bg-[#2e3091]/90 backdrop-blur-sm rounded-xl p-4 border border-white/10">
                    <h3 className="text-xl md:text-2xl font-bold text-white mb-1 drop-shadow-lg">
                      {linha.name}
                    </h3>
                    <p className="text-white/90 text-sm md:text-base mb-3 line-clamp-2 drop-shadow">
                      {linha.description}
                    </p>
                    <div className="flex items-center gap-2 text-white text-sm font-semibold">
                      <span>Ver mais</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
            Tem um projeto em mente?
          </h2>
          <p className="text-text-tertiary text-body-lg mb-8">
            Conte-nos sua ideia e criaremos a camiseta perfeita para você
          </p>
          <a
            href="https://wa.me/5562991121586?text=Ol%C3%A1!%20Gostaria%20de%20saber%20mais%20sobre%20camisetas%20personalizadas."
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
