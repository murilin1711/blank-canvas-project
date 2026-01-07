import { Link } from 'react-router-dom';
import camisetasPersonalizadas from '@/assets/camisetas-personalizadas.png';
import uniformesEmpresariais from '@/assets/uniformes-empresariais.png';

const CategoryShowcase = () => {
  return (
    <section className="px-4 md:px-6 lg:px-8 py-10 md:py-14 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-14 lg:mb-16">
          <h2 className="text-3xl font-medium text-[#2e3091] mb-3 md:mb-4">
            Conheça Nossos Ramos
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Soluções especializadas em uniformes para diferentes necessidades
          </p>
        </div>

        {/* Grid de categorias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Seção Empresarial */}
          <Link to="/empresarial" className="block group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 hover:border-blue-200 transition-all duration-300 hover:shadow-xl h-[400px] md:h-[450px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${uniformesEmpresariais})`
                }}
                aria-label="Uniforme empresarial para empresas" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
              
              {/* Conteúdo sobreposto */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 md:p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#2e3091]">
                      Uniformes Empresariais
                    </h3>
                    <div className="w-10 h-10 flex items-center justify-center bg-[#2e3091] text-white rounded-full group-hover:bg-[#252a7a] transition-colors">
                      <svg
                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm md:text-base">
                    Uniformes corporativos de alta qualidade para empresas que valorizam profissionalismo
                  </p>
                  <div className="flex items-center mt-4 text-[#2e3091] text-sm font-medium">
                    <span className="underline">Ver linhas empresariais</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* Seção Personalização */}
          <Link to="/personalizacao" className="block group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-100 hover:border-purple-200 transition-all duration-300 hover:shadow-xl h-[400px] md:h-[450px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: `url(${camisetasPersonalizadas})`
                }}
                aria-label="Personalização de uniformes" />

              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/20 to-transparent" />
              
              {/* Conteúdo sobreposto */}
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <div className="bg-white/90 backdrop-blur-sm rounded-xl p-5 md:p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xl md:text-2xl lg:text-3xl font-semibold text-[#2e3091]">
                      Camisetas Personalizadas
                    </h3>
                    <div className="w-10 h-10 flex items-center justify-center bg-[#2e3091] text-white rounded-full group-hover:bg-[#252a7a] transition-colors">
                      <svg
                        className="w-5 h-5 transform group-hover:translate-x-1 transition-transform"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24">

                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-gray-700 text-sm md:text-base">
                    Camisetas personalizadas para diferentes funcionalidades, com estampas e bordados de alta qualidade
                  </p>
                  <div className="flex items-center mt-4 text-[#2e3091] text-sm font-medium">
                    <span className="underline">Ver tipos de camisetas</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-10 md:mt-14 max-w-2xl mx-auto">
          <div className="p-8 md:p-12 lg:p-16 flex flex-col items-center justify-between bg-background-secondary rounded-2xl">
            <p className="text-text-secondary text-body-lg md:text-xl leading-relaxed mb-6">
              Independente do seu segmento, temos a solução ideal para uniformes.
            </p>
            <a 
              href="https://wa.me/5562991121586?text=Ol%C3%A1!%20Tudo%20bem%3F%0AGostaria%20de%20solicitar%20um%20or%C3%A7amento.%0A%0AO%20que%20voc%C3%AA%20procura%20no%20momento%3F%0A(%20)%20Uniformes%20personalizados%0A(%20)%20Camisetas%20personalizadas%0A(%20)%20Ainda%20n%C3%A3o%20tenho%20certeza%2C%20preciso%20de%20orienta%C3%A7%C3%A3o%0A%0A%F0%9F%91%89%F0%9F%8F%BBPara%20qual%20finalidade%3F%20(empresa%2Cescola%2Cevento%2Ctime%2Cigreja%2C%20outro)%3A%0A%F0%9F%91%89%F0%9F%8F%BBQuantidade%20aproximada%3A%0A%F0%9F%91%89%F0%9F%8F%BBVoc%C3%AA%20j%C3%A1%20possui%20logo%2Farte%3F%20%0A(%20)%20Sim%20(%20)N%C3%A3o"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#2e3091] text-white px-8 py-3 rounded-full text-btn font-medium hover:bg-[#252a7a] hover:scale-105 transition-all duration-300"
            >
              Falar com um consultor
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
