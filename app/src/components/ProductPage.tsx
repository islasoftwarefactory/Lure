'use client'

import { useParams } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import hoodieImage from '../assets/icons/pieces/hoodie_black.jpeg';
import { useState, useRef } from 'react';
import { Plus } from 'lucide-react';

interface AccordionProps {
  title: string;
  children: React.ReactNode;
}

const Accordion = ({ title, children, isExpanded, onToggle }: AccordionProps & { isExpanded: boolean; onToggle: () => void }) => {
  return (
    <div className="w-full max-w-3xl bg-white rounded-[20px] overflow-hidden shadow-lg border border-black/10">
      <div
        onClick={onToggle}
        className="p-6 flex justify-between items-center cursor-pointer"
      >
        <span className="text-xl font-extrabold font-aleo">{title}</span>
        <Plus
          className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''}`}
          size={24}
        />
      </div>
      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-6 pb-6 border-t border-gray-100">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

export function ProductPage() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('M');
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const shippingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>, section: string) => {
    if (ref.current) {
      // 1. Primeiro expande a seção
      setExpandedSection(section);
      
      // 2. Aguarda a expansão e ajusta o scroll 
      requestAnimationFrame(() => {
        setTimeout(() => {
          const headerOffset = 120;
          const elementPosition = ref.current?.getBoundingClientRect().top || 0;
          const offsetPosition = window.scrollY + elementPosition - headerOffset;
   
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 300); // Tempo suficiente para a animação de expansão
      });
    }
   };

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header />
      
      <main className="container mx-auto px-4 py-8 pt-[120px]">
        <div className="flex justify-start items-center pl-[px]">
          {/* Imagem principal */}
          <div className="w-[600px] h-[600px] flex items-center justify-center">
            <img 
              src={hoodieImage} 
              alt="Produto"
              className="w-full h-full object-contain"
            />
          </div>

          {/* Bloco de informações */}
          <div className="w-[600px] h-[550px] bg-white rounded-[30px] shadow-lg p-8 ml-[250px]">
            <div>
              <div className="flex justify-between items-center">
                <h1 className="text-4xl font-extrabold font-aleo">The Flower</h1>
                <span className="text-3xl font-extrabold">$199.99</span>
              </div>
              
              {/* Avaliações */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-black"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <span className="text-black">(459 reviews)</span>
              </div>

              {/* Seleção de Tamanho */}
              <div className="mt-8">
                <h2 className="text-lg font-extrabold mb-3">Size</h2>
                <div className="flex gap-2">
                  {['S', 'M', 'L', 'XL'].map((size) => (
                    <div key={size} className="relative">
                      <div className="absolute inset-0 bg-[#f2f2f2] rounded-full" />
                      <button
                        onClick={() => setSelectedSize(size)}
                        className={`relative w-12 h-12 rounded-full border ${
                          selectedSize === size
                            ? 'bg-black text-white border-black'
                            : 'bg-white text-black border-gray-300'
                        } flex items-center justify-center font-medium transition-colors`}
                      >
                        {size}
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quantidade */}
              <div className="mt-8">
                <h2 className="text-lg font-extrabold mb-3">Quantity</h2>
                <div className="flex items-center border-2 border-black rounded-full w-[120px]">
                  <button className="w-10 h-10 flex items-center justify-center text-black">-</button>
                  <span className="flex-1 text-center">1</span>
                  <button className="w-10 h-10 flex items-center justify-center text-black">+</button>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="mt-8 space-y-3 px-5">
                {/* Botão Comprar Agora */}
                <button className="w-full py-3 rounded-full bg-black text-white font-medium border border-black hover:bg-gray-900 transition-colors">
                  <span>BUY NOW</span>
                </button>

                {/* Botão Adicionar ao Carrinho */}
                <button className="w-full py-3 rounded-full bg-black text-white font-medium border border-black hover:bg-gray-900 transition-colors">
                  <span>ADD TO CART</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Navegação */}
        <div className="flex justify-center mt-6">
          <div className="bg-[#e4e4e4] rounded-[15px] p-[2px]">
            <div className="bg-[#e4e4e4] rounded-[13px] px-3 py-1.5 flex gap-3">
              <button
                onClick={() => scrollToSection(historyRef, 'history')}
                className="bg-white text-black px-8 py-1.5 rounded-[12px] font-extrabold hover:bg-gray-100 transition-colors font-aleo shadow-md text-sm"
              >
                History
              </button>
              <button
                onClick={() => scrollToSection(shippingRef, 'shipping')}
                className="bg-white text-black px-8 py-1.5 rounded-[12px] font-extrabold hover:bg-gray-100 transition-colors font-aleo shadow-md text-sm"
              >
                Shipping
              </button>
              <button
                onClick={() => scrollToSection(faqRef, 'faq')}
                className="bg-white text-black px-8 py-1.5 rounded-[12px] font-extrabold hover:bg-gray-100 transition-colors font-aleo shadow-md text-sm"
              >
                FAQ
              </button>
            </div>
          </div>
        </div>

        {/* Seções Expansíveis */}
        <div className="mt-16 space-y-12 flex flex-col items-center pb-16">
          <div ref={historyRef} className="w-full max-w-3xl">
            <Accordion 
              title="History" 
              isExpanded={expandedSection === 'history'}
              onToggle={() => setExpandedSection(expandedSection === 'history' ? null : 'history')}
            >
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold">
                    <li>Matte fingerprint-resistant PET backplate</li>
                    <li>Polycarbonate frame</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold">
                    <li>TPU bumpers and camera ring</li>
                    <li>Microfiber interior</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold">
                    <li>Fortified corner bumpers</li>
                    <li>Anodized aluminum buttons</li>
                  </ul>
                </div>
              </div>
            </Accordion>
          </div>

          <div ref={shippingRef} className="w-full max-w-3xl">
            <Accordion 
              title="Shipping"
              isExpanded={expandedSection === 'shipping'}
              onToggle={() => setExpandedSection(expandedSection === 'shipping' ? null : 'shipping')}
            >
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold">
                    <li>15ft drop protection</li>
                    <li>Raised edges to protect screen and camera</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold">
                    <li>Height above screen at bottom: 1.11mm</li>
                    <li>Height above screen sides/top: 1.85mm</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold">
                    <li>Bumper thickness: 3.3mm</li>
                    <li>Precise Camera Control button cutout</li>
                  </ul>
                </div>
              </div>
            </Accordion>
          </div>

          <div ref={faqRef} className="w-full max-w-3xl">
            <Accordion 
              title="FAQ"
              isExpanded={expandedSection === 'faq'}
              onToggle={() => setExpandedSection(expandedSection === 'faq' ? null : 'faq')}
            >
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold">
                    <li>Nickel-plated Neodymium magnets</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold">
                    <li>800-1100gf magnetic force with Apple-certified accessories</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold">
                    <li>Alignment magnet for orientation-specific accessories</li>
                    <li>5G compatible</li>
                  </ul>
                </div>
              </div>
            </Accordion>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}