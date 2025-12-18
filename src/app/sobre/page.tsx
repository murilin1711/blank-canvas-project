export default function SobrePage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="relative py-20 md:py-28 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#2e3091] mb-6">
            Sobre a Goiás Minas
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Tradição, confiança e excelência que vestem gerações
          </p>
        </div>
      </section>

      {/* CONTEÚDO */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* IMAGEM */}
          <div className="relative w-full h-[420px] rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.08)]">
            <img
              src="https://images.unsplash.com/photo-1600880292089-90a7e086ee0c?q=80&w=1600&auto=format&fit=crop"
              alt="Goiás Minas Uniformes"
              className="object-cover w-full h-full"
            />
          </div>

          {/* TEXTO */}
          <div className="flex flex-col gap-6 text-gray-700 leading-relaxed">
            <p>
              Há mais de <strong>40 anos</strong>, a <strong>Goiás Minas Uniformes</strong> constrói
              uma história sólida no mercado de confecção de uniformes profissionais e escolares,
              sendo hoje uma das empresas mais conceituadas e respeitadas do Centro-Oeste.
            </p>

            <p>
              Fundada em <strong>Anápolis (GO)</strong>, nossa empresa nasceu com um propósito claro:
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

            <p className="font-medium text-gray-900">
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
