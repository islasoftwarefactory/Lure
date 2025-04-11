'use client'

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import hoodieImage from '../assets/icons/pieces/hoodie_black.jpeg';
import { useRef } from 'react';
import { Plus } from 'lucide-react';
import ProductCard from "@/components/ProductCard";
import { CartItem, addToCartAndShow } from '../utils/cartUtils';
import { useCart } from '../context/CartContext';
import { SideCart } from "./SideCart";
import { useAuth } from '../context/AuthContext';
import api from '@/services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  inventory: number;
  category_id: number;
  gender_id: number;
  size_id: number;
  image_category_id: number;
}

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
  const navigate = useNavigate();
  const { isCartOpen, setIsCartOpen, cartItems, setCartItems, addToCart } = useCart();
  const [selectedSize, setSelectedSize] = useState('M');
  const [quantity, setQuantity] = useState(1);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const historyRef = useRef<HTMLDivElement>(null);
  const shippingRef = useRef<HTMLDivElement>(null);
  const faqRef = useRef<HTMLDivElement>(null);
  const auth = useAuth();
  const [productImage, setProductImage] = useState<string>('');
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recommendedImages, setRecommendedImages] = useState<Record<number, string>>({});

  useEffect(() => {
    const fetchProductDetails = async () => {
      if (!auth.token || !id) {
        console.log('🚫 Request cancelled:', {
          token: auth.token ? 'Present' : 'Missing',
          id: id || 'Missing'
        });
        return;
      }

      try {
        console.log('🚀 Iniciando fetch do produto:', { id });
        
        setIsLoading(true);
        const response = await api.get(`/product/read/${id}`);

        console.log('📥 Resposta da API:', response.data);

        if (response.data && response.data.data) {
          setProduct(response.data.data);
          console.log('✅ Produto carregado com sucesso:', response.data.data);
        }
      } catch (error: any) {
        console.error('❌ Erro ao carregar produto:', error);
        setError(error.response?.data?.message || 'Erro ao carregar dados do produto');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductDetails();
  }, [id, auth.token]);

  useEffect(() => {
    const fetchProductImage = async () => {
      if (!product?.image_category_id) return;

      try {
        console.log('🖼️ Buscando imagem do produto:', { imageId: product.image_category_id });
        const response = await api.get(`/image-category/read/${product.image_category_id}`);
        
        if (response.data && response.data.data) {
          console.log('🎨 Imagem carregada:', response.data.data);
          setProductImage(response.data.data.url);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar imagem:', error);
      }
    };

    fetchProductImage();
  }, [product]);

  useEffect(() => {
    const fetchRecommendedProducts = async () => {
      if (!auth.token || !id) return;

      try {
        console.log('👍 Buscando produtos para recomendações...');
        const response = await api.get('/product/read/all');

        if (response.data && response.data.data) {
          const allProducts: Product[] = response.data.data;
          const filteredProducts = allProducts.filter(p => p.id !== Number(id));
          const randomProducts = filteredProducts
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

          console.log('✅ Produtos recomendados selecionados:', randomProducts);
          setRecommendedProducts(randomProducts);
        }
      } catch (error) {
        console.error('❌ Erro ao buscar produtos recomendados:', error);
      }
    };

    fetchRecommendedProducts();
  }, [auth.token, id]);

  useEffect(() => {
    const fetchProductImage = async (imageId: number) => {
      if (!imageId || recommendedImages[imageId]) return;

      try {
        console.log(`🖼️ Buscando imagem recomendada: ${imageId}`);
        const response = await api.get(`/image-category/read/${imageId}`);
        if (response.data && response.data.data) {
          setRecommendedImages(prev => ({
            ...prev,
            [imageId]: response.data.data.url
          }));
          console.log(`🎨 Imagem recomendada ${imageId} carregada.`);
        }
      } catch (error) {
        console.error(`❌ Erro ao buscar imagem recomendada ${imageId}:`, error);
      }
    };

    recommendedProducts.forEach(product => {
      if (product.image_category_id) {
        fetchProductImage(product.image_category_id);
      }
    });
  }, [recommendedProducts]);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!product) return <div>Product not found</div>;

  const handleProductClick = (productId: string) => {
    navigate(`/product/${productId}`);
  };

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

  const handleQuantityChange = (change: number) => {
    setQuantity(prev => Math.max(1, prev + change));
  };

  const handleAddToCart = async () => {
    // --- DEBUG LOGS ---
    console.log("handleAddToCart called. Checking values:");
    console.log("  - product:", product);
    console.log("  - auth.token:", auth.token);
    console.log("  - addToCart function:", addToCart);
    // --- END DEBUG LOGS ---

    if (!product || !auth.token || !addToCart) {
      console.error("Não é possível adicionar ao carrinho: Produto, token ou função addToCart ausentes.");
      return;
    }

    console.log(`🛒 Tentando adicionar ao carrinho: Produto ID ${product.id}, Qtd: ${quantity}, Tamanho: ${selectedSize}`);

    try {
      console.log("🚀 Enviando requisição para POST /cart/create");
      const response = await api.post('/cart/create', {
        product_id: product.id,
        quantity: quantity,
        size: selectedSize
      });

      console.log("✅ Resposta da API /cart/create:", response.data);

      if (response.status === 201 && response.data.data) {
        const newItem: CartItem = {
          id: product.id,
          name: product.name,
          price: product.price,
          quantity: quantity,
          size: selectedSize,
          image: productImage || hoodieImage
        };

        addToCart(newItem);
        console.log("🛒 Item adicionado ao estado do carrinho local.");

        setIsCartOpen(true);
      } else {
        console.error("Erro ao adicionar ao carrinho: Resposta da API inesperada.", response);
      }

    } catch (error: any) {
      console.error('❌ Erro ao adicionar ao carrinho via API:', error);
    }
  };

  const handleBuyNow = () => {
    if (!product) {
      console.error("Cannot buy now: Product data is missing.");
      // Pode exibir uma mensagem de erro para o usuário
      return;
    }

    // Cria um objeto 'CartItem' temporário para este item específico
    // Note: Não precisa de cart_item_id aqui, pois não vem do carrinho existente
    const itemToCheckout: Omit<CartItem, 'cart_item_id'> & { id: number } = {
      id: product.id,
      name: product.name,
      price: product.price,
      quantity: quantity, // Usa a quantidade selecionada
      size: selectedSize, // Usa o tamanho selecionado
      image: productImage || hoodieImage // Usa a imagem carregada ou fallback
    };

    console.log("Navigating to checkout with single item:", itemToCheckout);

    // Navega para a página de checkout, passando o item em um array no estado
    navigate('/checkout', { state: { items: [itemToCheckout] } });
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="container mx-auto px-4 py-8 pt-[120px]">
        <div className="flex justify-start items-center pl-[px]">
          {/* Imagem principal */}
          <div className="w-[600px] h-[600px] flex items-center justify-center">
            <img 
              src={productImage || hoodieImage} 
              alt={product?.name}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Bloco de informações */}
          <div className="w-[600px] h-[550px] bg-white rounded-[30px] shadow-lg p-8 ml-[250px]">
            <div>
              <div className="flex justify-between items-center">
                <h1 className="text-4xl font-extrabold font-aleo">{product.name}</h1>
                <span className="text-3xl font-extrabold">${product.price}</span>
              </div>
              
              {/* Descrição do produto */}
              <p className="mt-4 text-gray-700">{product.description}</p>

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
              <div className="mt-8 space-y-4">
                <div>
                  <span className="text-sm font-bold text-black/50">Size</span>
                  <div className="flex items-center gap-2 mt-2">
                    {['S', 'M', 'L', 'XL'].map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`w-10 h-10 rounded-full flex items-center justify-center border-2 hover:bg-transparent
                          ${selectedSize === size 
                            ? 'border-black bg-black text-white' 
                            : 'border-black/10 text-black'}`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-sm font-bold text-black/50">Quantity</span>
                  <div className="flex items-center border-2 border-black/10 rounded-full w-[120px] mt-2">
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      className="w-10 h-10 flex items-center justify-center text-black hover:bg-transparent"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-black">{quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      className="w-10 h-10 flex items-center justify-center text-black hover:bg-transparent"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="mt-8 space-y-3 px-5">
                {/* Botão Comprar Agora - ATUALIZADO */}
                <button
                  onClick={handleBuyNow} // Chama a nova função
                  className="w-full py-3 rounded-full bg-black text-white font-medium border border-black hover:bg-gray-900 transition-colors"
                  disabled={!product || !auth.token} // Desabilita se não houver produto ou token
                >
                  <span>BUY NOW</span>
                </button>
                {/* --- FIM DA ATUALIZAÇÃO --- */}

                {/* Botão Adicionar ao Carrinho (mantido como estava) */}
                <button
                  onClick={handleAddToCart}
                  className="w-full py-3 rounded-full bg-black text-white font-medium border border-black hover:bg-gray-900 transition-colors"
                  disabled={!product || !auth.token}
                >
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

        {/* You May Also Like Section - ATUALIZADO */}
        <div className="mt-48 pb-16">
          <div className="relative">
            <h2 className="text-7xl font-extrabold text-center mb-8 tracking-[0.15em] absolute w-full top-[-38px] left-1/2 -translate-x-1/2" style={{ maxWidth: '900px' }}>
              You May Also Like
            </h2>
            <div className="flex justify-center items-center gap-0 -mx-8 pt-12">
              {recommendedProducts.map((recProduct) => (
                <ProductCard
                  key={recProduct.id}
                  title={recProduct.name}
                  subtitle={recProduct.description || "Check it out!"}
                  imageUrl={recommendedImages[recProduct.image_category_id] || hoodieImage}
                  price={recProduct.price}
                  onClick={() => handleProductClick(recProduct.id.toString())}
                />
              ))}
              {recommendedProducts.length === 0 && (
                <p className="text-center text-gray-500 pt-12">No recommendations available.</p>
              )}
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

      <SideCart 
        isOpen={isCartOpen} 
        onClose={() => setIsCartOpen(false)} 
        items={cartItems}
        setItems={setCartItems}
      />
    </div>
  );
}