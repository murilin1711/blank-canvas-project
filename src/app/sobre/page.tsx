import { Award, Users, Clock, MapPin, CheckCircle, ArrowRight } from "lucide-react";
import Footer from "@/components/sections/footer";
import { Link } from "react-router-dom";

export default function SobrePage() {
  const stats = [
    { value: "40+", label: "Anos de Tradição", icon: Clock },
    { value: "500+", label: "Escolas Atendidas", icon: Award },
    { value: "50k+", label: "Uniformes Entregues", icon: Users },
    { value: "GO/MG", label: "Região de Atuação", icon: MapPin },
  ];

  const values = [
    {
      title: "Qualidade Superior",
      description: "Tecidos selecionados e acabamento impecável em cada peça",
    },
    {
      title: "Compromisso com Prazos",
      description: "Entrega pontual garantida para todas as instituições",
    },
    {
      title: "Atendimento Personalizado",
      description: "Consultoria especializada para cada projeto de uniforme",
    },
    {
      title: "Tradição e Confiança",
      description: "Mais de 4 décadas construindo relações duradouras",
    },
  ];

  return (
    <main className="bg-background pt-[100px]">
      {/* Hero Section */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#2e3091]/5 via-transparent to-[#2e3091]/10" />
        <div className="max-w-6xl mx-auto px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="inline-block text-[#2e3091] text-caption font-medium tracking-wider uppercase mb-4">
                Nossa História
              </span>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-text-primary leading-tight mb-6">
                Vestindo o futuro desde{" "}
                <span className="text-[#2e3091]">1984</span>
              </h1>
              <p className="text-text-tertiary text-body-lg leading-relaxed mb-8">
                Há mais de 40 anos, a Goiás Minas Uniformes constrói uma história 
                sólida no mercado de confecção de uniformes profissionais e escolares, 
                sendo hoje uma das empresas mais conceituadas do Centro-Oeste.
              </p>
              <Link
                to="/escolas/colegio-militar"
                className="inline-flex items-center gap-2 bg-[#2e3091] text-white px-6 py-3 rounded-full text-btn font-medium hover:bg-[#252a7a] transition-colors"
              >
                Conheça nossos produtos
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <div className="relative">
              <div className="absolute -top-6 -left-6 w-24 h-24 bg-[#2e3091]/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#2e3091]/10 rounded-full blur-3xl" />
              <div className="relative rounded-3xl overflow-hidden shadow-2xl">
                <img
                  src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=1600&auto=format&fit=crop"
                  alt="Goiás Minas Uniformes - Equipe"
                  className="w-full h-[400px] md:h-[500px] object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 md:py-16 bg-background-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="text-center p-6 bg-background rounded-2xl shadow-sm hover:shadow-md transition-shadow"
              >
                <stat.icon className="w-8 h-8 text-[#2e3091] mx-auto mb-3" />
                <div className="text-3xl md:text-4xl font-medium text-[#2e3091] mb-1">
                  {stat.value}
                </div>
                <div className="text-text-muted text-body-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="rounded-2xl overflow-hidden h-48 md:h-56">
                    <img
                      src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=800&auto=format&fit=crop"
                      alt="Produção de uniformes"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="rounded-2xl overflow-hidden h-32 md:h-40 bg-[#2e3091] flex items-center justify-center p-6">
                    <p className="text-white text-center font-medium text-body-lg">
                      "Excelência em cada costura"
                    </p>
                  </div>
                </div>
                <div className="space-y-4 pt-8">
                  <div className="rounded-2xl overflow-hidden h-32 md:h-40 bg-background-secondary flex items-center justify-center p-6">
                    <div className="text-center">
                      <div className="text-4xl font-medium text-[#2e3091]">40+</div>
                      <div className="text-text-muted text-body-sm">Anos de história</div>
                    </div>
                  </div>
                  <div className="rounded-2xl overflow-hidden h-48 md:h-56">
                    <img
                      src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=800&auto=format&fit=crop"
                      alt="Equipe Goiás Minas"
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="order-1 lg:order-2">
              <span className="inline-block text-[#2e3091] text-caption font-medium tracking-wider uppercase mb-4">
                Quem Somos
              </span>
              <h2 className="text-3xl md:text-4xl font-medium text-text-primary mb-6">
                Uma empresa que entrega exatamente o que promete
              </h2>
              <div className="space-y-4 text-text-tertiary text-body-regular leading-relaxed">
                <p>
                  Fundada em <strong className="text-text-primary">Anápolis (GO)</strong>, 
                  nossa empresa nasceu com um propósito claro: entregar qualidade superior, 
                  compromisso absoluto com o cliente e produtos que representem com orgulho 
                  cada instituição que vestimos.
                </p>
                <p>
                  Ao longo de quatro décadas, evoluímos constantemente, investindo em 
                  estrutura, tecnologia e qualificação profissional, o que nos permite 
                  atender demandas de diferentes portes com padronização e acabamento impecável.
                </p>
                <p>
                  As excelentes avaliações, a confiança de clientes de longa data e a 
                  forte presença regional refletem uma empresa consolidada, que constrói 
                  relações duradouras baseadas em credibilidade.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 md:py-24 bg-background-secondary">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="inline-block text-[#2e3091] text-caption font-medium tracking-wider uppercase mb-4">
              Nossos Valores
            </span>
            <h2 className="text-3xl md:text-4xl font-medium text-text-primary">
              O que nos diferencia
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {values.map((value, index) => (
              <div
                key={index}
                className="flex gap-4 p-6 bg-background rounded-2xl hover:shadow-lg transition-shadow"
              >
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-[#2e3091]/10 rounded-xl flex items-center justify-center">
                    <CheckCircle className="w-6 h-6 text-[#2e3091]" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-text-primary mb-2">
                    {value.title}
                  </h3>
                  <p className="text-text-muted text-body-sm">
                    {value.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="bg-gradient-to-br from-[#2e3091] to-[#1e2061] rounded-3xl p-10 md:p-16 text-white">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium mb-4">
              Pronto para vestir sua instituição com qualidade?
            </h2>
            <p className="text-white/80 text-body-lg mb-8 max-w-2xl mx-auto">
              Entre em contato conosco e descubra como podemos criar uniformes 
              que representem a excelência da sua escola ou empresa.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/5562999999999"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white text-[#2e3091] px-8 py-4 rounded-full text-btn font-medium hover:bg-white/90 transition-colors"
              >
                Falar com um consultor
              </a>
              <Link
                to="/escolas/colegio-militar"
                className="inline-flex items-center justify-center gap-2 bg-white/10 text-white border border-white/20 px-8 py-4 rounded-full text-btn font-medium hover:bg-white/20 transition-colors"
              >
                Ver produtos
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
