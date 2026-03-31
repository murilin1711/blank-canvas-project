"use client";

import { AnimatedLink as Link } from '@/components/AnimatedLink';
import { useState } from "react";
import { MessageCircle, Mail, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

// ─── Conteúdo das Políticas ───────────────────────────────────────────────────

const POLICY_CONTENT: Record<string, { title: string; sections: { heading: string; items: string[] }[] }> = {
  termos: {
    title: "Termos de Uso",
    sections: [
      {
        heading: "1. ACEITAÇÃO E CAPACIDADE CIVIL",
        items: [
          "1.1. Maioridade: O acesso e a realização de compras neste ambiente virtual são restritos a pessoas físicas com idade igual ou superior a 18 (dezoito) anos e plena capacidade civil. Ao realizar o cadastro, o usuário declara sob as penas da lei possuir tais requisitos.",
          "1.2. Cadastro: O usuário é responsável pela veracidade de todos os dados informados, bem como pela guarda e sigilo de sua senha de acesso.",
        ],
      },
      {
        heading: "2. FORMAS DE PAGAMENTO E SEGURANÇA FINANCEIRA",
        items: [
          "2.1. Modalidades: Aceitamos Cartão de Crédito/Débito, Pix, Boleto Bancário e o benefício BOLSA UNIFORME DO ESTADO DE GOIÁS.",
          "2.2. Consentimento Bolsa Uniforme: Ao inserir os dados do cartão Bolsa Uniforme e respectivas senhas/tokens, o usuário concede autorização expressa para o processamento do pagamento. A Goiás Minas não armazena senhas, sendo estas transacionadas diretamente em ambiente criptografado SSL.",
          "2.3. Responsabilidade do Benefício: O uso do benefício estadual é de responsabilidade exclusiva do titular. A empresa não se responsabiliza por saldos insuficientes ou cartões bloqueados pelo Governo do Estado.",
        ],
      },
      {
        heading: "6. DISPOSIÇÕES GERAIS E FORO",
        items: [
          "6.1. Variação de Cores: Pequenas divergências de tom podem ocorrer devido à calibração de cada tela/monitor.",
          "6.2. Foro: Fica eleito o Foro da Comarca de Anápolis-GO para dirimir quaisquer conflitos, com renúncia expressa a qualquer outro.",
        ],
      },
    ],
  },
  entrega: {
    title: "Políticas de Entrega",
    sections: [
      {
        heading: "3. PRAZOS DE PRODUÇÃO E LOGÍSTICA DE ENTREGA",
        items: [
          "3.1. Prazo Estimado: O prazo total varia de 2 a 60 dias. A contagem dos 30 dias úteis de produção inicia-se apenas após a Confirmação de Dados Técnicos (liquidação do pagamento, validação de tamanhos e endereço).",
          "3.2. Isenção de Responsabilidade (Greves e Eventos): A Goiás Minas NÃO será responsabilizada por atrasos decorrentes de serviços de terceiros (Correios/Transportadoras), incluindo: Greves, paralisações de caminhoneiros, bloqueios de rodovias, desastres climáticos, áreas de risco ou retenção fiscal. O prazo será automaticamente prorrogado durante tais eventos, sem dever de indenização por parte da empresa.",
          "3.3. Tentativas de Entrega: Ocorrem 2 (DUAS) tentativas. Caso o produto retorne por 'Destinatário Ausente' ou 'Endereço Incorreto', o custo do novo frete será repassado integralmente ao cliente.",
        ],
      },
    ],
  },
  trocas: {
    title: "Trocas e Privacidade",
    sections: [
      {
        heading: "4. POLÍTICA DE TROCAS, DEVOLUÇÕES E TOLERÂNCIA",
        items: [
          "4.1. Responsabilidade de Tamanho: Tabelas e Provadores Virtuais são guias auxiliares. A decisão de tamanho é um ato de vontade exclusivo do cliente. Não realizamos trocas gratuitas por erro de escolha do usuário.",
          "4.2. Tolerância Técnica: O cliente aceita uma variação de até 4 (quatro) centímetros nas medidas finais da peça, para mais ou para menos, inerente ao processo industrial têxtil. Variações neste limite não constituem defeito.",
          "4.3. Custos de Frete: Em trocas por conveniência, tamanho ou desistência, todos os custos de frete (ida e volta) são por conta do cliente. A empresa arcará com o frete apenas em defeitos de fabricação comprovados.",
          "4.4. Condições do Produto: O item deve retornar na embalagem personalizada original, com etiquetas intactas e sem qualquer sinal de uso ou lavagem.",
        ],
      },
      {
        heading: "5. POLÍTICA DE PRIVACIDADE E SEGURANÇA",
        items: [
          "5.1. Uso de Dados: Dados coletados são usados para faturamento, logística e marketing. O usuário consente com o uso de cookies e pixels de rastreamento (Meta/Google) ao navegar no site.",
          "5.2. Propriedade Intelectual: Todo o conteúdo (fotos ultra-realistas, modelos, logos) é de propriedade da Goiás Minas. A reprodução sem autorização é crime sujeito a processo judicial.",
        ],
      },
    ],
  },
};

// ─── Modal de Política ────────────────────────────────────────────────────────

function PolicyModal({
  policyKey,
  onClose,
}: {
  policyKey: keyof typeof POLICY_CONTENT | null;
  onClose: () => void;
}) {
  const policy = policyKey ? POLICY_CONTENT[policyKey] : null;

  return (
    <Dialog open={!!policyKey} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {policy?.title}
          </DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground mb-4">
          GOIÁS MINAS UNIFORMES — Este documento estabelece as regras contratuais entre a
          GOIÁS MINAS UNIFORMES e seus Usuários/Clientes. Ao navegar ou comprar neste site,
          você concorda integralmente com estes termos.
        </p>
        {policy?.sections.map((section) => (
          <div key={section.heading} className="mb-5">
            <h4 className="text-sm font-semibold text-foreground mb-2">{section.heading}</h4>
            <ul className="space-y-2">
              {section.items.map((item) => (
                <li key={item} className="text-sm text-muted-foreground leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

interface FooterLink {
  label: string;
  href: string;
  isInternal?: boolean;
  isExternal?: boolean;
  policyKey?: keyof typeof POLICY_CONTENT;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

const WHATSAPP_CONTACT = "https://wa.me/5562991121586?text=Ol%C3%A1!%20Gostaria%20de%20entrar%20em%20contato%20com%20a%20GM%20Minas.";
const EMAIL_CONTACT = "mailto:suporte@goiasminas.com";

const Footer = () => {
  const [openPolicy, setOpenPolicy] = useState<keyof typeof POLICY_CONTENT | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);

  const footerSections: FooterSection[] = [
    {
      title: "Políticas",
      links: [
        { label: "Termos de Uso", href: "#", policyKey: "termos" },
        { label: "Políticas de Entrega", href: "#", policyKey: "entrega" },
        { label: "Trocas e Privacidade", href: "#", policyKey: "trocas" },
      ],
    },
    {
      title: "Minha conta",
      links: [
        { label: "Meus pedidos", href: "/meus-pedidos", isInternal: true },
        { label: "Meus dados", href: "/auth", isInternal: true },
        { label: "Meu perfil", href: "/auth", isInternal: true },
      ],
    },
    {
      title: "Fale conosco",
      links: [
        { label: "Fale conosco", href: "#" },
      ],
    },
    {
      title: "Redes sociais",
      links: [
        { label: "Instagram", href: "https://www.instagram.com/goiasminas/", isExternal: true },
        { label: "Email", href: "mailto:suporte@goiasminas.com", isExternal: true },
      ],
    },
  ];

  const linkClassName = "inline-block text-foreground text-sm bg-white px-4 py-2 rounded-full shadow-sm hover:shadow-md transition-shadow";

  return (
    <>
      <footer className="bg-[#e8e8e8] font-suisse">
        <div className="max-w-7xl mx-auto px-6 lg:px-10 py-14 lg:py-20">
          <div className="space-y-12">
            {/* Primeira linha: Políticas e Redes sociais */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Políticas */}
              <div>
                <h3 className="text-foreground font-semibold text-base mb-4">
                  Políticas
                </h3>
                <div className="flex flex-wrap gap-2">
                  {footerSections[0].links.map((link) => (
                    <button
                      key={link.label}
                      onClick={() => link.policyKey && setOpenPolicy(link.policyKey)}
                      className={linkClassName}
                    >
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Redes sociais */}
              <div>
                <h3 className="text-foreground font-semibold text-base mb-4">
                  Redes sociais
                </h3>
                <div className="flex flex-wrap gap-2">
                  {footerSections[3].links.map((link) => (
                    <a
                      key={link.label}
                      href={link.href}
                      target={link.isExternal ? "_blank" : undefined}
                      rel={link.isExternal ? "noopener noreferrer" : undefined}
                      className={linkClassName}
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>

            {/* Segunda linha: Minha conta e Fale conosco */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Minha conta */}
              <div>
                <h3 className="text-foreground font-semibold text-base mb-4">
                  Minha conta
                </h3>
                <div className="flex flex-wrap gap-2">
                  {footerSections[1].links.map((link) =>
                    link.isInternal ? (
                      <Link key={link.label} to={link.href} className={linkClassName}>
                        {link.label}
                      </Link>
                    ) : (
                      <a key={link.label} href={link.href} className={linkClassName}>
                        {link.label}
                      </a>
                    )
                  )}
                </div>
              </div>

              {/* Fale conosco */}
              <div>
                <h3 className="text-foreground font-semibold text-base mb-4">
                  Fale conosco
                </h3>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setShowContactModal(true)}
                    className={linkClassName}
                  >
                    Fale conosco
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Barra inferior */}
        <div className="bg-[#d4d4d4] rounded-t-2xl shadow-[0_-4px_20px_rgba(0,0,0,0.1)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
            <p className="text-muted-foreground text-xs md:text-sm text-center leading-relaxed">
              Goiás Minas Uniformes Ind. e Com.de Unif. Esc. e Emp. S/A CNPJ 01.184.449/0001-10 Rua Guimarães Natal, 50. Setor Central. GO Brasil. CEP 75040030.
            </p>
          </div>
        </div>
      </footer>

      <PolicyModal policyKey={openPolicy} onClose={() => setOpenPolicy(null)} />

      {/* Modal Fale Conosco */}
      {showContactModal && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setShowContactModal(false)}
        >
          <div
            className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-gray-900">Fale Conosco</h2>
              <button
                onClick={() => setShowContactModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mb-5">Escolha como prefere entrar em contato:</p>
            <div className="flex flex-col gap-3">
              <a
                href={WHATSAPP_CONTACT}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowContactModal(false)}
                className="flex items-center gap-3 px-4 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                <MessageCircle className="w-5 h-5" />
                WhatsApp
              </a>
              <a
                href={EMAIL_CONTACT}
                onClick={() => setShowContactModal(false)}
                className="flex items-center gap-3 px-4 py-3 bg-gray-100 text-gray-800 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                <Mail className="w-5 h-5" />
                suporte@goiasminas.com
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Footer;
