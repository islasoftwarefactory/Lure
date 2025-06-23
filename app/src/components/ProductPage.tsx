// @ts-nocheck
'use client'

import React, { useEffect, useState } from 'react';

// GA4 gtag declaration
declare global {
  function gtag(...args: any[]): void;
}
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import { useRef } from 'react';
import { Plus } from 'lucide-react';
import ProductCard from "@/components/ProductCard";
import { CartItem, addToCartAndShow } from '../utils/cartUtils';
import { useCart } from '../context/CartContext';
import { SideCart } from "./SideCart";
import { StickyCart } from "./StickyCart";
import { useAuth } from '../context/AuthContext';
import api from '@/services/api';

interface Product {
  id: number;
  name: string;
  price: number;
  inventory: number;
  category_id: number;
  gender_id: number;
  size_id: number | number[];
  sizes?: Size[];
  image_category_id: number;
  currency_code?: string;
  category_name?: string;
}

interface Size {
  id: number;
  name: string;
  long_name?: string;
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
        className="p-4 sm:p-6 flex justify-between items-center cursor-pointer min-h-[60px]"
      >
        <span className="text-lg sm:text-xl font-extrabold font-aleo">{title}</span>
        <Plus
          className={`transform transition-transform duration-300 ${isExpanded ? 'rotate-45' : ''} flex-shrink-0`}
          size={20}
        />
      </div>
      <div 
        className={`grid transition-all duration-300 ease-in-out ${
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        }`}
      >
        <div className="overflow-hidden">
          <div className="px-4 sm:px-6 pb-4 sm:pb-6 border-t border-gray-100">
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
  const [selectedSize, setSelectedSize] = useState<string>('');
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
  const [sizesList, setSizesList] = useState<Size[]>([]);
  const [simulatedStock, setSimulatedStock] = useState(0);
  const [simulatedUsers, setSimulatedUsers] = useState(0);
  const [isStickyCartVisible, setIsStickyCartVisible] = useState(false);
  const productSectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Simulate low stock
    const randomStock = Math.floor(Math.random() * (10 - 3 + 1)) + 3; // Random number between 3 and 10
    setSimulatedStock(randomStock);

    // Simulate active users
    const randomUsers = Math.floor(Math.random() * (20 - 5 + 1)) + 5; // Random number between 5 and 20
    setSimulatedUsers(randomUsers);
  }, []);

  // Sticky Cart scroll detection
  useEffect(() => {
    const handleScroll = () => {
      if (productSectionRef.current) {
        const productSectionBottom = productSectionRef.current.getBoundingClientRect().bottom;
        const shouldShowStickyCart = productSectionBottom < window.innerHeight / 2;
        setIsStickyCartVisible(shouldShowStickyCart);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

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
          const productData = response.data.data;
          setProduct(productData);
          if (productData.sizes && Array.isArray(productData.sizes)) {
            setSizesList(productData.sizes);
            if (productData.sizes.length > 0) {
              setSelectedSize(productData.sizes[0].name);
            }
          }
          
          // Fire GA4 view_item event
          if (typeof gtag !== 'undefined') {
            gtag('event', 'view_item', {
              currency: productData.currency_code,
              value: productData.price,
              items: [
                {
                  item_id: productData.id.toString(),
                  item_name: productData.name,
                  price: productData.price,
                  item_category: productData.category_name,
                  currency: productData.currency_code
                }
              ]
            });

            console.log('GA4 view_item event fired:', {
              item_id: productData.id.toString(),
              item_name: productData.name,
              price: productData.price
            });
          }
          
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

  if (isLoading) return <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center text-sm sm:text-base">Loading...</div>;
  if (error) return <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center text-sm sm:text-base text-red-600 px-4">Error: {error}</div>;
  if (!product) return <div className="min-h-screen bg-[#f2f2f2] flex items-center justify-center text-sm sm:text-base px-4">Product not found</div>;

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
    if (!product || !auth.token || !addToCart) {
      console.error("Não é possível adicionar ao carrinho: Produto, token ou função addToCart ausentes.");
      return;
    }

    console.log(`🛒 Tentando adicionar ao carrinho: Produto ID ${product.id}, Qtd: ${quantity}, Tamanho: ${selectedSize}`);

    // --- EDIT 1: Preparar dados para o Context (SEM sizeId aqui) ---
    // O CartContext agora só precisa dos dados que o frontend CONHECE
    const itemDataForContext: Omit<CartItem, 'cart_item_id' | 'sizeId'> & { productId: number } = {
        productId: product.id,
        name: product.name,
        price: product.price,
        quantity: quantity,
        size: selectedSize, // <<< ENVIAR O NOME DO TAMANHO
        image: productImage,
        currency_code: product.currency_code,
        category_name: product.category_name,
    };
    // --- FIM EDIT 1 ---

    try {
       // --- EDIT 2: Chamar addToCart do Context ---
       await addToCart(itemDataForContext); // Passa o objeto SEM sizeId inicial
       // --- FIM EDIT 2 ---
       
       // Fire GA4 add_to_cart event with all recommended parameters
       if (typeof gtag !== 'undefined') {
         const totalValue = product.price * quantity;
         
         gtag('event', 'add_to_cart', {
           currency: product?.currency_code,
           value: totalValue,
           items: [
             {
               item_id: product.id.toString(),
               item_name: product.name,
               price: product.price,
               quantity: quantity,
               item_variant: selectedSize,
               item_category: product.category_name,
               currency: product.currency_code
             }
           ]
         });

         console.log('GA4 add_to_cart event fired:', {
           currency: product?.currency_code,
           value: totalValue,
           item_id: product.id.toString(),
           item_name: product.name,
           price: product.price,
           quantity: quantity,
           item_variant: selectedSize
         });
       }
       
       console.log("🛒 Chamada para CartContext.addToCart concluída.");
       setIsCartOpen(true);

    } catch (error: any) {
      console.error('❌ Erro ao chamar CartContext.addToCart:', error);
      // Mostrar erro para o usuário se necessário
    }
  };

  const handleBuyNow = () => {
    if (!product) {
      console.error("Cannot buy now: Product data is missing.");
      return;
    }
    // --- GARANTIR QUE TEMOS O sizeId ---
    // Usar o size_id que veio com os dados do produto da API
    // Se você tiver uma seleção de tamanho que muda o ID, precisa buscar esse ID selecionado.
    const sizeIdToUse = product.size_id;
    if (sizeIdToUse === undefined || sizeIdToUse === null) {
        console.error("Cannot buy now: Product size ID is missing.");
        // Adicionar feedback para usuário se necessário
        return;
    }
    // --- FIM GARANTIR sizeId ---


    // --- AJUSTAR A CRIAÇÃO DO OBJETO ---
    // Usar a interface CartItem definida no Checkout para garantir consistência
    // Omitir 'cart_item_id' e 'id' (ID do carrinho) pois não são relevantes aqui
    const itemForCheckout: Omit<CartItem, 'cart_item_id' | 'id'> & {productId: number, sizeId: number} = {
      productId: product.id,
      sizeId: sizeIdToUse,
      name: product.name,
      price: product.price,
      quantity: quantity,
      size: selectedSize,
      image: productImage,
      currency_code: product.currency_code,
      category_name: product.category_name,
    };
    // --- FIM AJUSTE CRIAÇÃO ---

    console.log("Navigating to checkout with single item (Corrected Keys):", itemForCheckout);

    // Fire GA4 begin_checkout event before navigation
    const totalValue = product.price * quantity;
    
    // Check if gtag is available
    if (typeof gtag !== 'undefined') {
      gtag('event', 'begin_checkout', {
        currency: product?.currency_code,
        value: totalValue,
        items: [
          {
            item_id: product.id.toString(),
            item_name: product.name,
            price: product.price,
            quantity: quantity,
            item_variant: selectedSize,
            item_category: product.category_name,
            currency: product.currency_code
          }
        ]
      });
      
      console.log('GA4 begin_checkout event fired:', {
        currency: product?.currency_code,
        value: totalValue,
        item_id: product.id.toString(),
        item_name: product.name,
        price: product.price,
        quantity: quantity,
        item_variant: selectedSize
      });
    } else {
      console.warn('gtag is not available - GA4 event not fired');
    }

    // Navega para a página de checkout, passando o item formatado corretamente
    navigate('/checkout', { state: { items: [itemForCheckout] } });
  };

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />
      
      <main className="container mx-auto px-3 sm:px-4 py-6 sm:py-8 pt-32 sm:pt-36 lg:pt-[140px]">
        <div ref={productSectionRef} className="flex flex-col lg:flex-row lg:justify-start lg:items-center lg:pl-[px] gap-6 lg:gap-0">
          {/* Imagem principal */}
          <div className="w-full lg:w-[600px] h-auto flex items-center justify-center">
            <ProductCard
              productId={product.id.toString()}
              title={product.name}
              imageUrl={productImage}
              hideDetails={true}
            />
          </div>

          {/* Bloco de informações */}
          <div className="w-full lg:w-[600px] bg-white rounded-2xl lg:rounded-[30px] shadow-lg p-4 sm:p-6 lg:p-8 lg:ml-[250px]">
            <div>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between items-center gap-4">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-aleo leading-tight">{product.name}</h1>
                  <span className="text-2xl sm:text-3xl font-extrabold text-right flex-shrink-0">${product.price}</span>
                </div>
              </div>
              
              {/* Avaliações */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <svg
                        key={star}
                        className="w-4 h-4 sm:w-5 sm:h-5 text-black"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    ))}
                  </div>
                  <span className="text-black text-sm sm:text-base">(459 reviews)</span>
                </div>
              </div>

              {/* Simulated Urgency Section */}
              <div className="mt-4 bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-center text-sm sm:text-base">
                  <span className="relative flex h-3 w-3 mr-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                  </span>
                  <p className="text-black/80">
                    <span className="font-bold text-black">Only few left in stock!</span>
                  </p>
                </div>
                <div className="flex items-center text-sm sm:text-base">
                  <span className="relative flex h-3 w-3 mr-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                  </span>
                  <p className="text-black/80">
                    <span className="font-bold text-black">{simulatedUsers} people</span> are currently viewing this item.
                  </p>
                </div>
              </div>

              {/* Seleção de Tamanho e Quantidade */}
              <div className="mt-6 lg:mt-8 space-y-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-sm font-bold text-black/50">Size</span>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    {sizesList.map(sizeObj => (
                      <button
                        key={sizeObj.id}
                        onClick={() => setSelectedSize(sizeObj.name)}
                        className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center border-2 hover:bg-transparent transition-colors text-sm sm:text-base min-h-[44px]
                          ${selectedSize === sizeObj.name
                            ? 'border-black bg-black text-white'
                            : 'border-black/10 text-black'}`}
                      >
                        {sizeObj.name}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <span className="text-sm font-bold text-black/50">Quantity</span>
                  <div className="flex items-center border-2 border-black/10 rounded-full w-32 sm:w-[120px] mt-2">
                    <button 
                      onClick={() => handleQuantityChange(-1)}
                      className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-black hover:bg-transparent text-lg min-h-[44px]"
                    >
                      -
                    </button>
                    <span className="flex-1 text-center text-black text-sm sm:text-base">{quantity}</span>
                    <button 
                      onClick={() => handleQuantityChange(1)}
                      className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center text-black hover:bg-transparent text-lg min-h-[44px]"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="mt-6 lg:mt-8 space-y-3 lg:space-y-4 flex flex-col items-center">
                {/* Botão Comprar Agora - ATUALIZADO */}
                <button
                  onClick={handleBuyNow} // Chama a nova função
                  className="w-full sm:w-3/4 py-3 sm:py-4 rounded-full bg-black lg:bg-slate-800 text-white font-medium border border-black lg:border-slate-800 hover:bg-gray-900 lg:hover:bg-slate-700 transition-colors text-sm sm:text-base min-h-[48px]"
                  disabled={!product || !auth.token} // Desabilita se não houver produto ou token
                >
                  <span>BUY NOW</span>
                </button>
                {/* --- FIM DA ATUALIZAÇÃO --- */}

                {/* Botão Adicionar ao Carrinho (mantido como estava) */}
                <button
                  onClick={handleAddToCart}
                  className="w-full sm:w-3/4 py-3 sm:py-4 rounded-full bg-black text-white font-medium border border-black hover:bg-gray-900 transition-colors text-sm sm:text-base min-h-[48px]"
                  disabled={!product || !auth.token}
                >
                  <span>ADD TO CART</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Barra de Navegação */}
        <div className="flex justify-center mt-8 lg:mt-6">
          <div className="bg-[#e4e4e4] rounded-[15px] p-[2px] w-full max-w-lg lg:w-auto">
            <div className="bg-[#e4e4e4] rounded-[13px] px-2 sm:px-3 py-1.5 flex gap-2 sm:gap-3">
              <button
                onClick={() => scrollToSection(historyRef, 'history')}
                className="bg-white text-black px-4 sm:px-6 lg:px-8 py-1.5 rounded-[12px] font-extrabold hover:bg-gray-100 transition-colors font-aleo shadow-md text-xs sm:text-sm flex-1 lg:flex-initial min-h-[44px] flex items-center justify-center"
              >
                History
              </button>
              <button
                onClick={() => scrollToSection(shippingRef, 'shipping')}
                className="bg-white text-black px-4 sm:px-6 lg:px-8 py-1.5 rounded-[12px] font-extrabold hover:bg-gray-100 transition-colors font-aleo shadow-md text-xs sm:text-sm flex-1 lg:flex-initial min-h-[44px] flex items-center justify-center"
              >
                Shipping
              </button>
              <button
                onClick={() => scrollToSection(faqRef, 'faq')}
                className="bg-white text-black px-4 sm:px-6 lg:px-8 py-1.5 rounded-[12px] font-extrabold hover:bg-gray-100 transition-colors font-aleo shadow-md text-xs sm:text-sm flex-1 lg:flex-initial min-h-[44px] flex items-center justify-center"
              >
                FAQ
              </button>
            </div>
          </div>
        </div>

        {/* You May Also Like Section - ATUALIZADO */}
        <div className="mt-16 sm:mt-24 lg:mt-48 pb-12 sm:pb-16">
          <div className="relative">
            <h2 className="text-3xl sm:text-5xl lg:text-7xl font-extrabold text-center mb-6 sm:mb-8 tracking-wide lg:tracking-[0.15em] lg:absolute lg:w-full lg:top-[-38px] lg:left-1/2 lg:-translate-x-1/2 leading-tight" style={{ maxWidth: '900px' }}>
              You May Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 justify-items-center lg:pt-12">
              {recommendedProducts.map((recProduct) => (
                <ProductCard
                  key={recProduct.id}
                  title={recProduct.name}
                  imageUrl={recommendedImages[recProduct.image_category_id] || productImage}
                  price={recProduct.price}
                  onClick={() => handleProductClick(recProduct.id.toString())}
                  productId={recProduct.id.toString()}
                />
              ))}
              {recommendedProducts.length === 0 && (
                <p className="text-center text-gray-500 pt-8 sm:pt-12 col-span-full text-sm sm:text-base">No recommendations available.</p>
              )}
            </div>
          </div>
        </div>

        {/* Seções Expansíveis */}
        <div className="mt-12 sm:mt-16 space-y-6 sm:space-y-8 lg:space-y-12 flex flex-col items-center pb-12 sm:pb-16">
          <div ref={historyRef} className="w-full max-w-3xl">
            <Accordion 
              title="History" 
              isExpanded={expandedSection === 'history'}
              onToggle={() => setExpandedSection(expandedSection === 'history' ? null : 'history')}
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold text-sm sm:text-base">
                    <li>Matte fingerprint-resistant PET backplate</li>
                    <li>Polycarbonate frame</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold text-sm sm:text-base">
                    <li>TPU bumpers and camera ring</li>
                    <li>Microfiber interior</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold text-sm sm:text-base">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold text-sm sm:text-base">
                    <li>15ft drop protection</li>
                    <li>Raised edges to protect screen and camera</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold text-sm sm:text-base">
                    <li>Height above screen at bottom: 1.11mm</li>
                    <li>Height above screen sides/top: 1.85mm</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold text-sm sm:text-base">
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold text-sm sm:text-base">
                    <li>Nickel-plated Neodymium magnets</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold text-sm sm:text-base">
                    <li>800-1100gf magnetic force with Apple-certified accessories</li>
                  </ul>
                </div>
                <div>
                  <ul className="list-disc pl-4 space-y-2 text-gray-700 font-bold text-sm sm:text-base">
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

      {/* Sticky Cart */}
      {product && (
        <StickyCart
          product={{
            id: product.id,
            name: product.name,
            price: product.price,
            currency_code: product.currency_code,
            category_name: product.category_name
          }}
          selectedSize={selectedSize}
          productImage={productImage}
          isVisible={isStickyCartVisible}
          onAddToCart={handleAddToCart}
          onBuyNow={handleBuyNow}
        />
      )}
    </div>
  );
}