"use client";

import { MapPin, Clock, Phone, Car, Shield, Sparkles } from 'lucide-react';
import { useState } from 'react';

const StoreLocator = () => {
  const [isHovered, setIsHovered] = useState(false);

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
            <div className="p-8 md:p-12 lg:p-16 flex flex-col justify-between bg-gradient-to-br from-blue-50/50 to-indigo-50/50">
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
                    <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                      <MapPin className="w-5 h-5 text-[#2e3091]" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900 mb-1">Endereço</h4>
                      <p className="text-gray-600">
                        Rua Exemplo, 123 - Centro<br />
                        Goiânia - GO, 74000-000
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
                        (62) 3222-0000<br />
                        WhatsApp: (62) 99999-0000
                      </p>
                    </div>
                  </div>
                </div>

                {/* Destaques */}
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <MapPin className="w-4 h-4 text-[#2e3091]" />
                    </div>
                    <p className="text-sm text-gray-700 !whitespace-pre-line">Fácil Localização</p>
                  </div>
                  <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-gray-100">
                    <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <Car className="w-4 h-4 text-[#2e3091]" />
                    </div>
                    <p className="text-sm text-gray-700">Facilidade de Acesso</p>
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

        {/* Informações adicionais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
                <MapPin className="w-6 h-6 text-[#2e3091]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Fácil Localização</h4>
                <p className="text-sm text-gray-600 !whitespace-pre-line">Centro de Anápolis, perto dos principais pontos</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center">
                <Car className="w-6 h-6 text-[#2e3091]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Estacionamento</h4>
                <p className="text-sm text-gray-600">Vagas exclusivas para clientes</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-[#2e3091]" />
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">Atendimento</h4>
                <p className="text-sm text-gray-600">Profissionais especializados para te ajudar</p>
              </div>
            </div>
          </div>
        </div>

        {/* Texto adicional */}
        <div className="text-center mt-12 max-w-3xl mx-auto">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-gray-100">
            <h4 className="text-xl font-semibold text-[#2e3091] mb-4">
              Por que visitar nossa loja física?
            </h4>
            <p className="text-gray-700 mb-6">
              Na nossa loja você pode experimentar os uniformes, sentir a qualidade dos tecidos, 
              tirar todas as suas dúvidas com nossos especialistas e receber um atendimento 
              personalizado para encontrar a solução perfeita para sua necessidade.
            </p>
            <div className="inline-flex items-center gap-2 text-sm text-gray-600">
              <Shield className="w-4 h-4" />
              <span>Ambiente seguro e climatizado para sua melhor experiência</span>
            </div>
          </div>
        </div>
      </div>
    </section>);

};

export default StoreLocator;