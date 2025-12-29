"use client";

import { MapPin, Clock, Phone, Shield, Sparkles, Navigation } from 'lucide-react';
import { useState } from 'react';

const WHATSAPP_LINK = "https://wa.me/5562991121586?text=Ol%C3%A1!%20Tudo%20bem%3F%0AGostaria%20de%20solicitar%20um%20or%C3%A7amento.%0A%0AO%20que%20voc%C3%AA%20procura%20no%20momento%3F%0A(%20)%20Uniformes%20personalizados%0A(%20)%20Camisetas%20personalizadas%0A(%20)%20Ainda%20n%C3%A3o%20tenho%20certeza%2C%20preciso%20de%20orienta%C3%A7%C3%A3o%0A%0A%F0%9F%91%89%F0%9F%8F%BBPara%20qual%20finalidade%3F%20(empresa%2Cescola%2Cevento%2Ctime%2Cigreja%2C%20outro)%3A%0A%F0%9F%91%89%F0%9F%8F%BBQuantidade%20aproximada%3A%0A%F0%9F%91%89%F0%9F%8F%BBVoc%C3%AA%20j%C3%A1%20possui%20logo%2Farte%3F%20%0A(%20)%20Sim%20(%20)N%C3%A3o";
const GOOGLE_MAPS_LINK = "https://maps.app.goo.gl/NRJPnMXutQCrPiGa9?g_st=ic";
const APPLE_MAPS_LINK = "https://maps.apple/p/MH0IoV0C.S.vEI";

const StoreLocator = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);

  const openMapChoice = () => setShowMapModal(true);

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Cabeçalho da seção */}
        <div className="text-center mb-12 lg:mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#2e3091]/10 rounded-full mb-4">
            <MapPin className="w-8 h-8 text-[#2e3091]" />
          </div>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#2e3091] mb-4">
            Visite Nossa Loja Física
          </h2>
          <p className="text-gray-600 text-lg md:text-xl max-w-3xl mx-auto">
            Conheça nosso espaço, experimente os uniformes e receba atendimento personalizado
          </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-shadow duration-500">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Left Column: Informações */}
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-between bg-gradient-to-br from-gray-50 to-gray-100">

              <div>
                {/* Badge de tradição */}
                <div className="inline-flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm mb-6">
                  <Sparkles className="w-4 h-4 text-yellow-500" />
                  <span className="text-sm font-medium text-[#2e3091]">
                    40+ anos de tradição
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">
                  GM - Goiás Minas Uniformes
                </h3>

                {/* Informações principais */}
                <div className="space-y-6 mb-8">
                  <div className="flex items-start gap-4">
                    <button
                      onClick={openMapChoice}
                      className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0 hover:bg-[#2e3091] hover:text-white transition-colors cursor-pointer group"
                    >
                      <MapPin className="w-5 h-5 text-[#2e3091] group-hover:text-white" />
                    </button>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Endereço</h4>
                      <p className="text-gray-600">
                        R. Guimarães Natal, 51 - Centro<br />
                        Anápolis - GO, 75040-030
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      <Clock className="w-5 h-5 text-[#2e3091]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Horário de Funcionamento</h4>
                      <p className="text-gray-600">
                        Segunda a Sexta: 8h às 18h<br />
                        Sábado: 8h às 12h<br />
                        Domingo: Fechado
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      <Phone className="w-5 h-5 text-[#2e3091]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Telefone</h4>
                      <p className="text-gray-600">
                        (62) 3324-9150<br />
                        <a 
                          href={WHATSAPP_LINK}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2e3091] underline hover:text-[#252a7a]"
                        >
                          WhatsApp
                        </a>: (62) 99112-1586
                      </p>
                    </div>
                  </div>
                </div>

                {/* Destaques */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <button 
                    onClick={openMapChoice}
                    className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100 hover:border-[#2e3091] hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <MapPin className="w-4 h-4 text-[#2e3091]" />
                    </div>
                    <p className="text-sm text-gray-700 !whitespace-pre-line">Fácil Localização</p>
                  </button>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Clock className="w-4 h-4 text-[#2e3091]" />
                    </div>
                    <p className="text-sm text-gray-700 !whitespace-pre-line">Atendimento de Qualidade</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Mapa */}
            <div
              className="relative h-[400px] lg:h-auto"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}>

              <div className="absolute inset-0 bg-gradient-to-r from-blue-50/20 to-transparent z-10 pointer-events-none" />
              
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15315.143794758427!2d-48.97124885617734!3d-16.333877800151164!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x935ea473e20aa08d%3A0xd12ceb94de43fa2e!2sGM%20-%20Goi%C3%A1s%20Minas!5e0!3m2!1spt-BR!2sbr!4v1765249333479!5m2!1spt-BR!2sbr"
                className={`w-full h-full transition-transform duration-700 ${
                isHovered ? 'scale-105' : 'scale-100'}`
                }
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Localização da Goiás Minas Uniformes" />
            </div>
          </div>
        </div>
        {/* Texto adicional */}
        <div className="text-center mt-12 max-w-3xl mx-auto">
          <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-between 
                bg-gradient-to-br from-gray-50 to-gray-100 
                rounded-2xl 
                shadow-[0_10px_30px_rgba(0,0,0,0.08)]">


            <h4 className="text-xl font-semibold text-[#2e3091] mb-4">
              Por que visitar nossa loja física?
            </h4>
            <p className="text-gray-700 mb-6">
              Na nossa loja você pode experimentar os uniformes, sentir a qualidade dos tecidos, 
              tirar todas as suas dúvidas com nossos especialistas e receber um atendimento 
              personalizado para encontrar a solução perfeita para sua necessidade.
            </p>
            
            {/* Botão para abrir mapa */}
            <button
              onClick={openMapChoice}
              className="mx-auto mb-6 inline-flex items-center gap-2 bg-[#2e3091] text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-[#252a7a] hover:scale-105 transition-all duration-300"
            >
              <Navigation className="w-4 h-4" />
              Como chegar
            </button>
            
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Ambiente seguro e climatizado para sua melhor experiência</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de escolha de mapa */}
      {showMapModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowMapModal(false)}
          />
          <div className="relative bg-white rounded-2xl shadow-2xl p-6 max-w-sm w-full">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Escolha o aplicativo de mapas
            </h3>
            <div className="flex flex-col gap-3">
              <a
                href={GOOGLE_MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-[#4285F4] text-white px-6 py-3 rounded-xl font-medium hover:bg-[#3574d4] transition-colors"
                onClick={() => setShowMapModal(false)}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Google Maps
              </a>
              <a
                href={APPLE_MAPS_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-3 bg-gray-900 text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition-colors"
                onClick={() => setShowMapModal(false)}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                </svg>
                Mapas Apple
              </a>
            </div>
            <button
              onClick={() => setShowMapModal(false)}
              className="mt-4 w-full text-gray-500 text-sm hover:text-gray-700"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default StoreLocator;