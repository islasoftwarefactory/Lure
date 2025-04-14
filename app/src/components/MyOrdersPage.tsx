'use client'

import React, { useState, useEffect } from 'react'; // Adicionado useState, useEffect
import { useLocation, useNavigate, Link } from 'react-router-dom'; // Adicionado useLocation
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import { SideCart } from "./SideCart";
import { useCart } from '../context/CartContext'; // Still needed for SideCart state
import { useAuth } from '../context/AuthContext'; // Potentially needed for user context/logout in future
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import api from '../services/api'; // Adicionada importação da API

// Interface para os dados do endereço que esperamos da API
interface FetchedAddress {
    id: number;
    user_id: number;
    street: string;
    number: number;
    city: string;
    state: string;
    zip_code: string;
    created_at: string;
    updated_at: string;
}

// Interface para o tipo de dados que *seriam* exibidos (opcional, mas bom para clareza)
interface OrderDetailsData {
  order_number: string;
  created_at: string; // Ou Date
  customerEmail: string;
  shippingAddress: {
    name: string;
    address1: string;
    address2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  paymentMethod: string;
  estimatedDelivery: string;
  items: Array<{
    id: string; // Ou number
    cart_item_id?: number; // ID do item no carrinho original
    name: string;
    size: string;
    quantity: number;
    price: number;
    image?: string; // Imagem é opcional aqui
  }>;
  subtotal: number;
  shippingCost: number;
  taxes: number;
  totalPaid: number;
}

// Renomeando para refletir o propósito de exibir detalhes de UM pedido
export function OrderDetailsDisplay() { // Renomeado de MyOrdersPage
  const location = useLocation(); // Hook para acessar o estado da navegação
  const navigate = useNavigate();
  // Obtém estado do SideCart apenas para passá-lo
  const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();
  const auth = useAuth(); // Mantido caso precise de info do usuário ou logout

  // --- NOVOS ESTADOS ---
  const [shippingAddressDetails, setShippingAddressDetails] = useState<FetchedAddress | null>(null);
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  const [addressError, setAddressError] = useState<string | null>(null);

  const orderDetailsFromState = location.state?.orderDetails;

  // --- NOVO useEffect PARA BUSCAR ENDEREÇO ---
  useEffect(() => {
    const addressId = orderDetailsFromState?.addressId;

    if (addressId) {
      setIsLoadingAddress(true);
      setAddressError(null);
      setShippingAddressDetails(null);

      api.get<any, { data: { data: FetchedAddress } }>(`/address/read/${addressId}`)
        .then(response => {
          if (response.data && response.data.data) {
            setShippingAddressDetails(response.data.data);
          } else {
             throw new Error("Invalid data structure received for address.");
          }
        })
        .catch(error => {
          const message = error.response?.data?.error || error.message || "Failed to load shipping address details.";
          setAddressError(message);
        })
        .finally(() => {
          setIsLoadingAddress(false);
        });
    } else {
      setAddressError("Could not retrieve address details (ID missing).");
    }
  }, [orderDetailsFromState?.addressId]);

  // --- ESTRUTURA VISUAL SEM DADOS HARDCODED ---
  // Os dados viriam de props ou de um fetch específico para esta página no futuro

  return (
    <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-grow container mx-auto px-4 py-8 pt-[120px] flex flex-col items-center">
         {/* Título da Página (pode ser dinâmico no futuro) */}
         <h1 className="text-3xl md:text-4xl font-extrabold font-aleo mb-8 text-center">Order Details</h1>

        <Card className="w-full max-w-3xl bg-white rounded-lg shadow-md mb-8">
          {/* Cabeçalho com Status (pode ser opcional dependendo da página) */}
          <CardHeader className="text-center border-b pb-4">
            {/* Ícone de sucesso pode ser exibido condicionalmente */}
            {/* <svg>...</svg> */}
            <CardTitle className="text-2xl md:text-3xl font-extrabold font-aleo">Order Confirmed</CardTitle>
            <CardDescription className="text-gray-600">Details for your order:</CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Seção de Informações do Pedido */}
            <div className="text-sm text-gray-700 space-y-1">
              <p><strong>Order Number:</strong> <span className="text-gray-500">[Order Number Placeholder]</span></p>
              <p><strong>Order Date:</strong> <span className="text-gray-500">[Order Date Placeholder]</span></p>
              {/* Email pode vir do auth context ou dos dados do pedido */}
              <p>Confirmation sent to: <strong>[Email Placeholder]</strong></p>
            </div>

            {/* Seção de Itens do Pedido */}
            <div>
              <h3 className="text-lg font-semibold mb-3 border-b pb-2">Items Ordered</h3>
              <div className="space-y-3">
                {/* Bloco de Layout para UM item - seria mapeado no futuro */}
                <div className="flex justify-between items-center text-sm border-b pb-3">
                  <div className="flex items-center">
                    {/* Placeholder para Imagem */}
                    <div className="w-12 h-12 bg-gray-200 rounded mr-3 flex items-center justify-center text-gray-400 text-xs">IMG</div>
                    <div>
                      <p className="font-medium">[Item Name Placeholder]</p>
                      <p className="text-xs text-gray-500">Size: [Size] | Qty: [Qty]</p>
                    </div>
                  </div>
                  <span className="font-medium">[Item Total Price Placeholder]</span>
                </div>
                {/* Repetir o bloco acima para mais itens ou indicar que é uma lista */}
                 <p className="text-xs text-center text-gray-400 pt-2">(List of items will appear here)</p>
              </div>
            </div>

            {/* Seção de Totais */}
            <div className="border-t pt-4 space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Subtotal:</span>
                <span>[Subtotal Placeholder]</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping:</span>
                <span>[Shipping Placeholder]</span>
              </div>
              <div className="flex justify-between">
                <span>Taxes:</span>
                <span>[Taxes Placeholder]</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                <span>Total Paid:</span>
                <span>[Total Paid Placeholder]</span>
              </div>
            </div>

             {/* Seção de Detalhes Adicionais */}
             <div className="grid md:grid-cols-2 gap-6 text-sm border-t pt-4">
                <div>
                    <h4 className="font-semibold mb-1">Shipping Address:</h4>
                    {/* Condicional para Loading */}
                    {isLoadingAddress && (
                         <p className="text-gray-500 italic">Loading address details...</p>
                    )}
                    {/* Condicional para Erro */}
                    {addressError && !isLoadingAddress && (
                        <p className="text-red-600 italic">{addressError}</p>
                    )}
                    {/* Condicional para Dados Carregados */}
                    {shippingAddressDetails && !isLoadingAddress && !addressError && (
                        <address className="not-italic text-gray-600">
                            {/* Nome ainda vem do estado da navegação */}
                            {orderDetailsFromState?.shippingAddress?.name || '[Name Placeholder]'}<br />
                            {/* Dados do endereço vêm da API */}
                            {shippingAddressDetails.street}, {shippingAddressDetails.number}<br />
                            {shippingAddressDetails.city}, {shippingAddressDetails.state} {shippingAddressDetails.zip_code}<br />
                            {/* País ainda vem do estado da navegação */}
                            {orderDetailsFromState?.shippingAddress?.country || '[Country Placeholder]'}
                        </address>
                    )}
                     {/* Fallback se nada carregar */}
                     {!isLoadingAddress && !addressError && !shippingAddressDetails && (
                          <p className="text-gray-500 italic">Address details unavailable.</p>
                     )}
                </div>
                 <div>
                    <h4 className="font-semibold mb-1">Payment Method:</h4>
                    <p className="text-gray-600">[Payment Method Placeholder]</p>

                    <h4 className="font-semibold mb-1 mt-3">Estimated Delivery:</h4>
                    <p className="text-gray-600">[Estimated Delivery Placeholder]</p>
                </div>
             </div>

          </CardContent>

           {/* Footer com Links (pode ser ajustado) */}
           <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 border-t">
                <Link to="/">
                    <Button variant="outline">Continue Shopping</Button>
                </Link>
                {/* Link para a página que lista TODOS os pedidos */}
                <Link to="/my-orders-list">
                    <Button variant="outline">Back to My Orders</Button>
                </Link>
           </CardFooter>
        </Card>
      </main>

      <Footer />

      {/* SideCart incluído para consistência da UI geral */}
      <SideCart
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        setItems={setCartItems}
      />
    </div>
  );
} 