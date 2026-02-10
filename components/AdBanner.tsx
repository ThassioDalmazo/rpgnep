
import React, { useEffect } from 'react';

interface AdBannerProps {
  slotId: string; // O ID do bloco de anúncio criado no AdSense
  format?: 'auto' | 'fluid' | 'rectangle';
  className?: string;
}

export const AdBanner: React.FC<AdBannerProps> = ({ slotId, format = 'auto', className = '' }) => {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      console.error("AdSense error", e);
    }
  }, []);

  // Enquanto você não tem o AdSense aprovado, mostramos um placeholder visual
  // Em produção, remova a div de placeholder e deixe apenas o <ins>
  const isProduction = false; 

  if (!isProduction) {
      return (
          <div className={`bg-stone-200 dark:bg-stone-800 border-2 border-dashed border-stone-400 p-4 flex items-center justify-center text-stone-500 text-xs uppercase font-bold tracking-widest ${className}`}>
              Espaço para Anúncio (AdSense)
          </div>
      );
  }

  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client="ca-pub-SEU_CLIENT_ID_AQUI" // Coloque seu ID de Publicador aqui
        data-ad-slot={slotId}
        data-ad-format={format}
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
};
