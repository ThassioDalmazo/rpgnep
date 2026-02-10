
import React from 'react';
import { X, Shield, Lock, Eye, FileText, Server } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicy: React.FC<Props> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-200">
      <div className="bg-stone-900 border border-stone-700 w-full max-w-4xl h-[90vh] rounded-2xl shadow-2xl flex flex-col relative overflow-hidden">
        {/* Header */}
        <div className="p-6 bg-stone-950 border-b border-stone-800 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-900/20 rounded-lg border border-amber-700/50">
              <Shield size={24} className="text-amber-500" />
            </div>
            <div>
              <h2 className="text-2xl font-cinzel font-bold text-stone-100">Política de Privacidade</h2>
              <p className="text-xs text-stone-500 uppercase tracking-widest font-bold">Em conformidade com a LGPD (Lei nº 13.709/2018)</p>
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
              <FileText size={18} className="text-blue-500"/> 1. Introdução
            </h3>
            <p>
              O <strong>RPGNEP</strong> (rpgnep.com.br) respeita a sua privacidade e está comprometido em proteger os dados pessoais que você compartilha conosco. Esta política descreve como coletamos, usamos e protegemos suas informações ao utilizar nossa plataforma de Virtual Tabletop (VTT).
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Eye size={18} className="text-green-500"/> 2. Coleta de Dados
            </h3>
            <p className="mb-2">Para fornecer nossos serviços, coletamos as seguintes informações:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 text-stone-400">
              <li><strong>Dados de Autenticação:</strong> Utilizamos o <em>Google Firebase Authentication</em>. Coletamos seu nome, endereço de e-mail e foto de perfil fornecidos pelo Google para criar e identificar sua conta.</li>
              <li><strong>Conteúdo Gerado pelo Usuário:</strong> Armazenamos mapas, fichas de personagens, tokens, logs de chat e notas de campanha no <em>Google Cloud Firestore</em>.</li>
              <li><strong>Logs de Acesso:</strong> Registros técnicos automáticos para segurança e monitoramento de estabilidade.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Server size={18} className="text-purple-500"/> 3. Uso e Armazenamento
            </h3>
            <p>
              Seus dados são armazenados em servidores seguros do Google (Cloud Firestore e Realtime Database). Utilizamos essas informações exclusivamente para:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-2 mt-2 text-stone-400">
              <li>Permitir o funcionamento das mecânicas de jogo (sincronização de dados em tempo real).</li>
              <li>Salvar o progresso das suas campanhas e personagens.</li>
              <li>Personalizar sua experiência de usuário.</li>
            </ul>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
              <Lock size={18} className="text-red-500"/> 4. Cookies e Publicidade
            </h3>
            <p className="mb-2">
              Utilizamos tecnologias de rastreamento para melhorar a experiência e manter o serviço gratuito:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-2 text-stone-400">
              <li><strong>Armazenamento Local (LocalStorage):</strong> Usado para salvar suas preferências de tema, áudio e configurações de interface.</li>
              <li><strong>Google AdSense e DoubleClick:</strong> Terceiros, incluindo o Google, usam cookies para veicular anúncios com base em suas visitas anteriores ao nosso website ou a outros websites. O uso de cookies de publicidade pelo Google permite que ele e seus parceiros veiculem anúncios com base nas suas visitas.</li>
            </ul>
            <p className="mt-2 text-xs bg-stone-800 p-2 rounded border border-stone-700">
              Você pode desativar a publicidade personalizada acessando as <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">Configurações de Anúncios</a> ou visitando o site <a href="http://www.aboutads.info/choices/" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">www.aboutads.info</a>.
            </p>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3">5. Seus Direitos (LGPD)</h3>
            <p>
              Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você tem direito a:
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
              <div className="bg-stone-800/50 p-2 rounded border border-stone-800">✅ Acesso facilitado aos seus dados.</div>
              <div className="bg-stone-800/50 p-2 rounded border border-stone-800">✅ Correção de dados incompletos ou desatualizados.</div>
              <div className="bg-stone-800/50 p-2 rounded border border-stone-800">✅ Exclusão de dados (via exclusão de conta).</div>
              <div className="bg-stone-800/50 p-2 rounded border border-stone-800">✅ Revogação do consentimento.</div>
            </div>
          </section>

          <section>
            <h3 className="text-lg font-bold text-white mb-3">6. Contato</h3>
            <p>
              Para exercer seus direitos ou tirar dúvidas sobre esta política, entre em contato através do e-mail:
              <br />
              <span className="text-amber-500 font-mono font-bold select-all">suporte@rpgnep.com.br</span>
            </p>
          </section>
          
          <div className="pt-8 border-t border-stone-800 text-center text-stone-600 text-xs">
            Última atualização: Outubro de 2023. RPGNEP © Todos os direitos reservados.
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-950 border-t border-stone-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-stone-800 hover:bg-stone-700 text-white rounded-lg font-bold transition-all"
          >
            Entendido
          </button>
        </div>
      </div>
    </div>
  );
};