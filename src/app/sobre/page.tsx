export default function SobrePage() {
  return (
    <main className="bg-background">
      {/* Hero Section */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-background to-muted/30">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-h1 text-primary mb-6">
            Sobre a Goiás Minas
          </h1>
          <p className="text-body-lg text-muted-foreground max-w-3xl mx-auto">
            Tradição, confiança e excelência que vestem gerações
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            <img
              src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=1600&auto=format&fit=crop"
              alt="Goiás Minas Uniformes"
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col gap-6 text-foreground/80 leading-relaxed text-body-regular">
            <p>
              Há mais de <strong className="text-foreground">40 anos</strong>, a <strong className="text-foreground">Goiás Minas Uniformes</strong> constrói
              uma história sólida no mercado de confecção de uniformes profissionais e escolares,
              sendo hoje uma das empresas mais conceituadas e respeitadas do Centro-Oeste.
            </p>
            <p>
              Fundada em <strong className="text-foreground">Anápolis (GO)</strong>, nossa empresa nasceu com um propósito claro:
              entregar qualidade superior, compromisso absoluto com o cliente e produtos que
              representem com orgulho cada instituição que vestimos.
            </p>
            <p>
              Ao longo de quatro décadas, evoluímos constantemente, investindo em estrutura,
              tecnologia e qualificação profissional, o que nos permite atender demandas de
              diferentes portes com padronização, acabamento impecável e rigor no cumprimento de
              prazos.
            </p>
            <p>
              As excelentes avaliações, a confiança de clientes de longa data e a forte presença
              regional refletem uma empresa consolidada, que entrega exatamente o que promete e
              constrói relações duradouras baseadas em credibilidade.
            </p>
            <p className="font-medium text-foreground">
              Escolher a Goiás Minas Uniformes é optar por segurança, tradição e autoridade no setor.
              <br />
              Há mais de 40 anos, vestimos empresas e instituições que exigem o melhor.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
