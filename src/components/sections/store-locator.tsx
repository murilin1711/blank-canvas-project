"use client";

const StoreLocator = () => {
  return (
    <section className="bg-background-secondary py-10 lg:py-[75px]">
      <div className="max-w-[1440px] mx-auto px-4 md:px-8">
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-5">
            {/* Left Column: Content */}
            <div className="lg:col-span-2 p-10 lg:p-14 flex flex-col justify-between">
              <div className="bg-background-secondary rounded-lg p-6 lg:p-8">
                <h2 className="text-3xl lg:text-[40px] font-medium text-text-primary mb-6 leading-none tracking-[-0.02em]">Nossa loja</h2>
                <p className="text-base text-text-secondary leading-tight tracking-[-0.02em]">O local onde tradição e confiança se encontram há 40 anos

                </p>
              </div>

              <div>
                <p className="text-base text-text-secondary tracking-[-0.02em]">
                  82 lojas, 41 Cidades
                </p>
              </div>
            </div>

            {/* Right Column: Google Maps */}
            <div className="lg:col-span-3 relative h-[400px] lg:h-[600px]">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15315.143794758427!2d-48.97124885617734!3d-16.333877800151164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935ea473e20aa08d%3A0xd12ceb94de43fa2e!2sGM%20-%20Goi%C3%A1s%20Minas!5e0!3m2!1spt-BR!2sbr!4v1765249333479!5m2!1spt-BR!2sbr"
                className="w-full h-full rounded-xl"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade" />

            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default StoreLocator;