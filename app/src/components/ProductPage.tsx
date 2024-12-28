'use client'

import { useParams } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import hoodieImage from '../assets/icons/pieces/hoodie_black.jpeg';
import { useState } from 'react';

export function ProductPage() {
  const { id } = useParams();
  const [selectedSize, setSelectedSize] = useState('M');

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
          <div className="w-[600px] h-[500px] bg-white rounded-[30px] shadow-lg p-8 ml-[150px]">
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
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-12 h-10 rounded-xl border ${
                        selectedSize === size
                          ? 'bg-black text-white border-black'
                          : 'bg-white text-black border-gray-300'
                      } flex items-center justify-center font-medium transition-colors`}
                    >
                      {size}
                    </button>
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
      </main>

      <Footer />
    </div>
  );
}