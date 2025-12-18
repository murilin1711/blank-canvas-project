import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const CategoryShowcase = () => {
  return (
    <section className="px-4 md:px-6 lg:px-8 py-10 md:py-14 lg:py-20 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 md:mb-14 lg:mb-16">
          <h2 className="text-h2 text-primary mb-3 md:mb-4">
            Conheça Nossos Ramos
          </h2>
          <p className="text-muted-foreground text-body-lg max-w-2xl mx-auto">
            Soluções especializadas em uniformes para diferentes necessidades
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          <Link to="/empresarial" className="block group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/10 hover:border-primary/20 transition-all duration-300 hover:shadow-xl h-[400px] md:h-[450px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: 'url(https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/grupo-de-homens-confiantes-em-uniformes-azuis-posando-em-um-cenario-de-fabrica-1765251165935.jpg?width=8000&height=8000&resize=contain)'
                }}
                aria-label="Uniforme empresarial para empresas" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-foreground/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <div className="bg-background/90 backdrop-blur-sm rounded-xl p-5 md:p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-h3 text-primary">
                      Empresarial
                    </h3>
                    <div className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full group-hover:bg-primary/90 transition-colors">
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-foreground/80 text-body-regular">
                    Uniformes corporativos de alta qualidade para empresas que valorizam profissionalismo
                  </p>
                  <div className="flex items-center mt-4 text-primary text-sm font-medium">
                    <span>Ver soluções empresariais</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>

          <Link to="/personalizacao" className="block group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-secondary/30 to-secondary/50 border border-secondary/20 hover:border-secondary/30 transition-all duration-300 hover:shadow-xl h-[400px] md:h-[450px]">
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{
                  backgroundImage: 'url(https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/document-uploads/medio-tiro-jovem-camisa-dobravel-1765251332163.jpg?width=8000&height=8000&resize=contain)'
                }}
                aria-label="Personalização de uniformes" />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/40 via-foreground/20 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
                <div className="bg-background/90 backdrop-blur-sm rounded-xl p-5 md:p-6 shadow-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-h3 text-primary">
                      Personalização
                    </h3>
                    <div className="w-10 h-10 flex items-center justify-center bg-primary text-primary-foreground rounded-full group-hover:bg-primary/90 transition-colors">
                      <svg className="w-5 h-5 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-foreground/80 text-body-regular">
                    Criação de uniformes exclusivos com bordados, estampas e designs personalizados
                  </p>
                  <div className="flex items-center mt-4 text-primary text-sm font-medium">
                    <span>Criar projeto personalizado</span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center mt-10 md:mt-14 max-w-2xl mx-auto">
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-between bg-gradient-to-br from-muted/50 to-muted rounded-2xl shadow-[0_10px_30px_rgba(0,0,0,0.08)]">
            <p className="text-foreground/80 text-body-lg mb-4 !whitespace-pre-line">
              Independente do seu segmento, temos a solução ideal para uniformes.
            </p>
            <Button className="mx-auto">
              Falar com um consultor
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CategoryShowcase;
