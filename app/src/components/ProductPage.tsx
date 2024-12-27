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
            <h1 className="text-4xl font-bold font-aleo">The Flower</h1>
            
            {/* Seleção de Tamanho */}
            <div className="mt-8">
              <h2 className="text-sm font-bold mb-3">Size</h2>
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
              <h2 className="text-sm font-bold mb-3">Quantity</h2>
              <div className="flex items-center border-2 border-black rounded-full w-[120px]">
                <button className="w-10 h-10 flex items-center justify-center text-black">-</button>
                <span className="flex-1 text-center">1</span>
                <button className="w-10 h-10 flex items-center justify-center text-black">+</button>
              </div>
            </div>

            {/* Botão Adicionar ao Carrinho */}
            <button className="group w-full mt-8 py-4 rounded-full bg-black text-white font-medium border border-black relative overflow-hidden transition-all duration-300 transform hover:scale-105 active:scale-95">
              <span className="relative z-10">ADD TO CART</span>
              <div className="absolute inset-0 h-full w-0 bg-white group-hover:w-full transition-all duration-300 ease-out"></div>
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}