import React from 'react';
import { useAnnouncementContext } from '../contexts/AnnouncementContext';

// Array de mensagens para o banner de anúncios
const anunciosMensagens = [
  "𝗙𝗿𝗲𝗲 𝘀𝗵𝗶𝗽𝗽𝗶𝗻𝗴 𝗼𝗻 𝗼𝗿𝗱𝗲𝗿𝘀 𝗼𝘃𝗲𝗿 $𝟮𝟬𝟬",
  "𝗡𝗲𝘄 𝘀𝘂𝗺𝗺𝗲𝗿 𝗰𝗼𝗹𝗹𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲",
  "𝟮𝟬% 𝗼𝗳𝗳 𝗼𝗻 𝘀𝗲𝗹𝗲𝗰𝘁𝗲𝗱 𝗶𝘁𝗲𝗺𝘀",
  "𝗙𝗿𝗲𝗲 𝘀𝗵𝗶𝗽𝗽𝗶𝗻𝗴 𝗼𝗻 𝗼𝗿𝗱𝗲𝗿𝘀 𝗼𝘃𝗲𝗿 $𝟮𝟬𝟬",
  "𝗡𝗲𝘄 𝘀𝘂𝗺𝗺𝗲𝗿 𝗰𝗼𝗹𝗹𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲",
  "𝟮𝟬% 𝗼𝗳𝗳 𝗼𝗻 𝘀𝗲𝗹𝗲𝗰𝘁𝗲𝗱 𝗶𝘁𝗲𝗺𝘀"
];

const estilosAnuncioBar = {
  container: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 40,
    backgroundColor: '#000000',
    color: '#f2f2f2',
    padding: '8px 0',
    overflow: 'hidden',
  } as React.CSSProperties,
  conteudo: {
    whiteSpace: 'nowrap',
    display: 'inline-block',
  } as React.CSSProperties,
};

export const AnnouncementBar: React.FC = () => {
  const { posicao, containerRef, conteudoRef, setSlowMotion } = useAnnouncementContext();

  const renderizarMensagens = () => {
    return anunciosMensagens.map((mensagem, indice) => (
      <React.Fragment key={indice}>
        <span style={{ margin: '0 24px', fontSize: '10px', fontWeight: 'bold' }}>
          {mensagem}
        </span>
        <span
          style={{
            width: '4px',
            height: '4px',
            backgroundColor: '#f2f2f2',
            borderRadius: '50%',
            display: 'inline-block',
            margin: 'auto 24px',
            verticalAlign: 'middle',
          }}
        />
      </React.Fragment>
    ));
  };

  return (
    <div 
      style={estilosAnuncioBar.container} 
      ref={containerRef}
      onMouseEnter={() => setSlowMotion(true)}
      onMouseLeave={() => setSlowMotion(false)}
    >
      <div
        ref={conteudoRef}
        style={{
          ...estilosAnuncioBar.conteudo,
          transform: `translateX(${posicao}px)`,
        }}
      >
        {renderizarMensagens()}
        {renderizarMensagens()}
      </div>
    </div>
  );
};

export default AnnouncementBar;