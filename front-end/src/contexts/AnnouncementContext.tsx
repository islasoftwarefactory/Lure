import React, { createContext, useState, useContext, useRef, useCallback, useEffect } from 'react';

interface AnnouncementContextType {
  posicao: number;
  containerRef: React.RefObject<HTMLDivElement>;
  conteudoRef: React.RefObject<HTMLDivElement>;
}

const AnnouncementContext = createContext<AnnouncementContextType | undefined>(undefined);

export const useAnnouncementContext = () => {
  const context = useContext(AnnouncementContext);
  if (!context) {
    throw new Error('useAnnouncementContext must be used within an AnnouncementProvider');
  }
  return context;
};

export const AnnouncementProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [posicao, setPosicao] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const conteudoRef = useRef<HTMLDivElement>(null);
  const animacaoRef = useRef<number>();

  const animarBanner = useCallback(() => {
    setPosicao((posicaoAnterior) => {
      if (containerRef.current && conteudoRef.current) {
        const larguraConteudo = conteudoRef.current.offsetWidth;
        const novaPosicao = posicaoAnterior + 1;

        if (novaPosicao >= 0) {
          return -larguraConteudo / 2;
        }

        return novaPosicao;
      }
      return posicaoAnterior;
    });
    animacaoRef.current = requestAnimationFrame(animarBanner);
  }, []);

  useEffect(() => {
    animacaoRef.current = requestAnimationFrame(animarBanner);
    return () => {
      if (animacaoRef.current) {
        cancelAnimationFrame(animacaoRef.current);
      }
    };
  }, [animarBanner]);

  return (
    <AnnouncementContext.Provider value={{ posicao, containerRef, conteudoRef }}>
      {children}
    </AnnouncementContext.Provider>
  );
};