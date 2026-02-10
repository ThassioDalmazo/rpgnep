
import React from 'react';
import { X, Scale, Scroll, Gavel, AlertTriangle, Copyright, Coins, Ban } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const TermsOfService: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-stone-950 border-b border-stone-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-stone-800 rounded-lg border border-stone-700">
              <Scale size={24} className="text-stone-300" />
            </div>
            <div>
              <h2 className="text-2xl font-cinzel font-bold text-stone-100">Termos de Uso</h2>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Acordo Legal de Utilização</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-stone-500 hover:text-white hover:bg-stone-800 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-8 text-stone-300 text-sm leading-relaxed custom-scrollbar bg-[#0f0f10]">
          
          <section>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Scroll size={18} className="text-amber-500"/> 1. Aceitação e Natureza do Serviço
            </h3>
            <p>
              Ao acessar o <strong>RPGNEP</strong>, você concorda com estes termos. O RPGNEP é uma ferramenta de "Virtual Tabletop" (VTT) fornecida <strong>"no estado em que se encontra" (as is)</strong>.
            </p>
            <div className="mt-2 bg-amber-900/10 border border-amber-800/30 p-3 rounded text-amber-200/80 text-xs">
              <strong>Isenção de Garantias:</strong> Não garantimos que o serviço será ininterrupto, livre de erros ou que seus dados (mapas, fichas) serão preservados indefinidamente. Recomendamos que você mantenha backups locais de suas informações críticas (exportação de JSON).
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Copyright size={18} className="text-blue-500"/> 2. Propriedade Intelectual e OGL
            </h3>
            <ul className="list-disc list-inside space-y-2 ml-2 text-stone-400">
              <li><strong>Plataforma:</strong> O código-fonte, design, logotipo e infraestrutura do RPGNEP são propriedade exclusiva de seus criadores.</li>
              <li>
                <strong>Conteúdo de Jogo (SRD 5.1):</strong> As mecânicas de jogo, nomes de classes, raças e magias utilizados na plataforma estão em conformidade com a <em>Open Game License (OGL) v1.0a</em> e o <em>System Reference Document (SRD) 5.1</em> da Wizards of the Coast. O RPGNEP não reivindica propriedade sobre essas mecânicas.
              </li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Gavel size={18} className="text-red-500"/> 3. Conteúdo Gerado pelo Usuário (UGC)
            </h3>
            <p className="mb-2">Você mantém os direitos autorais sobre os mapas, histórias e personagens que criar. No entanto, ao usar a plataforma, você concorda com as seguintes regras estritas:</p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-stone-400">
              <li><strong>Responsabilidade:</strong> O RPGNEP atua apenas como um hospedeiro passivo. Não monitoramos ativamente e não nos responsabilizamos pelo conteúdo desenhado no grid, imagens carregadas (tokens) ou textos no chat.</li>
              <li><strong>Proibições:</strong> É estritamente <strong>PROIBIDO</strong> carregar ou criar conteúdo que seja: ilegal, discurso de ódio, pornográfico, ou que viole direitos autorais de terceiros (pirataria de livros oficiais, assets pagos sem licença, etc).</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Coins size={18} className="text-green-500"/> 4. Monetização e Publicidade
            </h3>
            <p>
              Para manter o serviço acessível, o RPGNEP pode exibir anúncios fornecidos por terceiros (como Google AdSense). Ao utilizar o serviço, você concorda com a exibição razoável dessa publicidade e reconhece que o uso de bloqueadores de anúncios pode impactar a sustentabilidade da plataforma.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Ban size={18} className="text-purple-500"/> 5. Cancelamento e Suspensão
            </h3>
            <p>
              Reservamo-nos o direito de suspender ou banir, sem aviso prévio, qualquer conta que viole estes Termos de Uso, especialmente em casos de:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2 text-stone-400">
              <li>Uso de automação/bots não autorizados (scraping).</li>
              <li>Tentativas de explorar vulnerabilidades técnicas (hacking).</li>
              <li>Upload de conteúdo ilegal ou ofensivo denunciado.</li>
            </ul>
          </section>

          <div className="pt-8 border-t border-stone-800 text-center text-stone-600 text-xs">
            Última atualização: Outubro de 2023. Foro de eleição: São Paulo/SP, Brasil.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg font-bold transition-all"
          >
            Concordo
          </button>
        </div>
      </div>
    </div>
  );
};
