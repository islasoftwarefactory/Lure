import React, { useEffect, useState, useRef } from 'react';

const messages = [
  "𝗙𝗿𝗲𝗲 𝘀𝗵𝗶𝗽𝗽𝗶𝗻𝗴 𝗼𝗻 𝗼𝗿𝗱𝗲𝗿𝘀 𝗼𝘃𝗲𝗿 $𝟮𝟬𝟬",
  "𝗡𝗲𝘄 𝘀𝘂𝗺𝗺𝗲𝗿 𝗰𝗼𝗹𝗹𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲",
  "𝟮𝟬% 𝗼𝗳𝗳 𝗼𝗻 𝘀𝗲𝗹𝗲𝗰𝘁𝗲𝗱 𝗶𝘁𝗲𝗺𝘀",
  "𝗙𝗿𝗲𝗲 𝘀𝗵𝗶𝗽𝗽𝗶𝗻𝗴 𝗼𝗻 𝗼𝗿𝗱𝗲𝗿𝘀 𝗼𝘃𝗲𝗿 $𝟮𝟬𝟬",
  "𝗡𝗲𝘄 𝘀𝘂𝗺𝗺𝗲𝗿 𝗰𝗼𝗹𝗹𝗲𝗰𝘁𝗶𝗼𝗻 𝗮𝘃𝗮𝗶𝗹𝗮𝗯𝗹𝗲",
  "𝟮𝟬% 𝗼𝗳𝗳 𝗼𝗻 𝘀𝗲𝗹𝗲𝗰𝘁𝗲𝗱 𝗶𝘁𝗲𝗺𝘀"
];

export const AnnouncementBar: React.FC = () => {
  const [position, setPosition] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const animate = () => {
      setPosition((prevPosition) => {
        const newPosition = prevPosition + 0.5;
        if (containerRef.current) {
          const containerWidth = containerRef.current.offsetWidth;
          const contentWidth = containerRef.current.scrollWidth;
          // Reinicia quando o conteúdo sair completamente da tela
          return newPosition > contentWidth ? -containerWidth : newPosition;
        }
        return newPosition;
      });
      requestAnimationFrame(animate);
    };

    const animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, []);

  return (
    <div className="bg-black text-[#f2f2f2] py-2 overflow-hidden">
      <div
        ref={containerRef}
        className="whitespace-nowrap"
        style={{ transform: `translateX(${position}px)` }}
      >
        {messages.concat(messages).map((message, index) => (
          <React.Fragment key={index}>
            <span className="mx-6 text-[10px]">{message}</span>
            <span className="w-1 h-1 bg-[#f2f2f2] rounded-full inline-block my-auto mx-6"></span>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};