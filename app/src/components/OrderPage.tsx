'use client'

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import { SideCart } from "./SideCart";
import { useCart } from '../context/CartContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import api from '../services/api';

// --- INTERFACES: AJUSTE CONFORME A RESPOSTA REAL DA SUA API ---
//   (GET /purchase/{id}?include_items=true&include_transactions=true&include_address=true)
interface AddressDetails {
    id?: number; // Opcional, pode não precisar exibir
    street: string;
    number: number;
    city: string;
    state: string;
    zip_code: string;
    // Adicione outros campos se necessário
}

interface ProductDetails {
    name: string;
    // A URL da imagem pode vir do PurchaseItem ou do Product aninhado
    // Ajuste conforme sua serialização
    image_url?: string;
}

interface SizeDetails {
    name: string; // Ex: 'M'
}

interface PurchaseItemDetails {
    id: number;
    product_id: number;
    size_id: number;
    quantity: number;
    unit_price_at_purchase: number;
    // Assumindo que a serialização do PurchaseItem inclui Product e Size
    product: ProductDetails;
    size: SizeDetails;
}

interface TransactionMethodDetails {
    name: string;
}

interface PaymentStatusDetails {
    name: string;
    description?: string;
}

interface TransactionDetails {
    id: number;
    method_id: number;
    status_id: number;
    amount: number;
    currency_id: number;
    gateway_transaction_id?: string;
    created_at: string;
    // Assumindo que a serialização da Transaction inclui Method e Status
    method: TransactionMethodDetails;
    status: PaymentStatusDetails;
}

interface DetailedPurchase {
    id: string; // UUID
    user_id: number;
    shipping_address_id: number;
    shipping_cost: number;
    taxes: number;
    created_at: string;
    updated_at: string;
    // Assumindo que a serialização do Purchase inclui Address, Items, Transactions
    address: AddressDetails;
    items: PurchaseItemDetails[];
    transactions: TransactionDetails[];
}
// --- FIM INTERFACES ---


// Mantém o nome do componente original
export function OrderPage() {
    const location = useLocation();
    const navigate = useNavigate();
    const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();

    // --- Log 1: Estado inicial da localização ---
    console.log("MyOrdersPage: Component rendered. Initial location.state:", location.state);
    // --- Fim Log 1 ---

    // --- ESTADOS PARA OS DADOS DO PEDIDO ESPECÍFICO ---
    const [orderDetails, setOrderDetails] = useState<DetailedPurchase | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
    const [orderDetailsError, setOrderDetailsError] = useState<string | null>(null);
    // --- FIM ESTADOS ---

    // Verifica se viemos do checkout com dados de um pedido recém-concluído
    const justCompletedOrderId = location.state?.justCompletedOrder?.id;

    // --- Log 2: Valor do ID antes do useEffect ---
    console.log("MyOrdersPage: Value of justCompletedOrderId before useEffect:", justCompletedOrderId);
    // --- Fim Log 2 ---

    // --- useEffect PARA BUSCAR DETALHES DO PEDIDO RECÉM-CONCLUÍDO ---
    useEffect(() => {
        // --- Log 3: useEffect foi acionado? ---
        console.log("MyOrdersPage: useEffect triggered. Value of justCompletedOrderId:", justCompletedOrderId);
        // --- Fim Log 3 ---

        if (justCompletedOrderId) {
            // --- Log 4: Condição 'if' passou? ---
            console.log("MyOrdersPage: Condition 'if (justCompletedOrderId)' is TRUE. Attempting to fetch...");
            // --- Fim Log 4 ---

            console.log(`MyOrdersPage: Detectado pedido recém-concluído ID: ${justCompletedOrderId}. Buscando detalhes...`);
            setIsLoadingDetails(true);
            setOrderDetailsError(null);
            setOrderDetails(null); // Limpa dados anteriores

            // Monta a URL da API com query parameters
            const apiUrl = `/purchase/${justCompletedOrderId}?include_items=true&include_transactions=true&include_address=true`;
            // --- Log 5: URL da API a ser chamada ---
            console.log(`MyOrdersPage: Chamando API GET ${apiUrl}`);
            // --- Fim Log 5 ---

            api.get<{ data: DetailedPurchase }>(apiUrl)
                .then(response => {
                    if (response.data?.data) {
                        console.log("MyOrdersPage: Detalhes completos do pedido recebidos:", response.data.data);
                        setOrderDetails(response.data.data);
                    } else {
                        throw new Error("Invalid or empty data structure received for order details.");
                    }
                })
                .catch(err => {
                    const message = err.response?.data?.error || err.message || "Failed to load order details.";
                    console.error(`MyOrdersPage: Erro ao buscar detalhes do pedido ${justCompletedOrderId}:`, message, err);
                    setOrderDetailsError(message);
                })
                .finally(() => {
                    setIsLoadingDetails(false);
                    // Limpa o estado da navegação para evitar re-buscar se o usuário navegar de volta e para frente
                    // É opcional, mas pode evitar comportamentos inesperados
                    // navigate(location.pathname, { replace: true, state: {} });
                });
        } else {
            // Lógica para quando o usuário acessa a página diretamente
            // (Ex: buscar a lista de todos os pedidos - F1 original)
             console.log("MyOrdersPage: Acessado diretamente ou sem estado 'justCompletedOrder'.");
             // Futuramente: setIsLoadingList(true); fetchOrderList();
        }
        // A dependência é apenas o ID do pedido recém-concluído
    }, [justCompletedOrderId, navigate]); // Adicionado navigate como dependência por causa do navigate opcional no finally
    // --- FIM useEffect ---


    // --- RENDERIZAÇÃO DO CONTEÚDO ---
    // Esta função decidirá o que mostrar: loading, erro, detalhes do pedido recente, ou a futura lista de pedidos.
    const renderPageContent = () => {
        // Prioridade 1: Mostrar detalhes se estiver carregando
        if (isLoadingDetails) {
            return <div className="text-center py-10">Loading order details...</div>;
        }

        // Prioridade 2: Mostrar erro se ocorreu ao buscar detalhes
        if (orderDetailsError) {
            return <div className="text-center text-red-500 py-10">Error loading order details: {orderDetailsError}</div>;
        }

        // Prioridade 3: Mostrar os detalhes do pedido se foram carregados com sucesso
        if (orderDetails) {
            const transaction = orderDetails.transactions?.[0]; // Pega a primeira (e geralmente única) transação
            return (
                // Utiliza a estrutura do Card existente
                <Card className="w-full max-w-3xl bg-white rounded-lg shadow-md mb-8">
                    <CardHeader className="text-center border-b pb-4">
                        <CardTitle className="text-2xl md:text-3xl font-extrabold font-aleo">Order Confirmed!</CardTitle>
                        <CardDescription className="text-gray-600">Details for your recent order:</CardDescription>
                    </CardHeader>

                    <CardContent className="p-6 space-y-6">
                        {/* Seção de Informações Gerais */}
                        <div className="text-sm text-gray-700 space-y-1">
                            <p><strong>Order Number:</strong> <span className="text-gray-500">{orderDetails.id}</span></p>
                            <p><strong>Order Date:</strong> <span className="text-gray-500">{new Date(orderDetails.created_at).toLocaleDateString()}</span></p>
                        </div>

                        {/* Seção de Itens */}
                        <div>
                            <h3 className="text-lg font-semibold mb-3 border-b pb-2">Items Ordered</h3>
                            <div className="space-y-3">
                                {orderDetails.items && orderDetails.items.length > 0 ? (
                                    orderDetails.items.map(item => {
                                        console.log("MyOrdersPage: Detalhes do item sendo renderizado:", item);
                                        return (
                                            <div key={item.id} className="flex justify-between items-center text-sm border-b pb-3">
                                                <div className="flex items-center">
                                                    <img
                                                        src={item.product?.image_url || 'default_product_image.png'}
                                                        alt={item.product?.name || 'Product'}
                                                        className="w-12 h-12 bg-gray-200 rounded mr-3 object-cover flex-shrink-0"
                                                        onError={(e) => (e.currentTarget.src = 'default_product_image.png')}
                                                    />
                                                    <div className="flex-grow"> {/* Permitir que o texto cresça */}
                                                        <p className="font-medium">{item.product?.name || 'N/A'}</p>
                                                        <p className="text-xs text-gray-500">Size: {item.size?.name || 'N/A'} | Qty: {item.quantity}</p>
                                                    </div>
                                                </div>
                                                {/* Calcular e formatar preço */}
                                                <span className="font-medium ml-2">${(item.quantity * item.unit_price_at_purchase).toFixed(2)}</span>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <p className="text-xs text-center text-gray-400 pt-2">No items found.</p>
                                )}
                            </div>
                        </div>

                        {/* Seção de Totais */}
                        <div className="border-t pt-4 space-y-1 text-sm">
                            <div className="flex justify-between">
                                <span>Subtotal:</span>
                                {/* Calcula subtotal dos itens */}
                                <span>${orderDetails.items.reduce((sum, item) => sum + item.quantity * item.unit_price_at_purchase, 0).toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping:</span>
                                <span>${orderDetails.shipping_cost?.toFixed(2) ?? '0.00'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Taxes:</span>
                                <span>${orderDetails.taxes?.toFixed(2) ?? '0.00'}</span>
                            </div>
                            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
                                <span>Total Paid:</span>
                                {/* Usa o valor da transação */}
                                <span>${transaction ? transaction.amount?.toFixed(2) : 'N/A'}</span>
                            </div>
                        </div>

                        {/* Seção de Detalhes Adicionais */}
                        <div className="grid md:grid-cols-2 gap-6 text-sm border-t pt-4">
                            <div>
                                <h4 className="font-semibold mb-1">Shipping Address:</h4>
                                {/* --- ACESSAR USANDO shipping_address --- */}
                                {orderDetails.shipping_address ? (
                                    <address className="not-italic text-gray-600">
                                        {orderDetails.shipping_address.street}, {orderDetails.shipping_address.number}<br />
                                        {orderDetails.shipping_address.city}, {orderDetails.shipping_address.state} {orderDetails.shipping_address.zip_code}<br />
                                    </address>
                                ) : (
                                    <p className="text-gray-500 italic">Address not available.</p>
                                )}
                                {/* --- FIM DA MUDANÇA --- */}
                            </div>
                            <div>
                                <h4 className="font-semibold mb-1">Payment Method:</h4>
                                <p className="text-gray-600">{transaction?.method?.name || 'N/A'}</p>

                                <h4 className="font-semibold mb-1 mt-3">Payment Status:</h4>
                                <p className="text-gray-600">{transaction?.status?.name || 'N/A'}</p>
                            </div>
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col sm:flex-row justify-center items-center gap-4 pt-6 border-t">
                        <Link to="/">
                            <Button variant="outline">Continue Shopping</Button>
                        </Link>
                        {/* Futuramente, botão para ver a lista de todos os pedidos */}
                        {/* <Link to="/my-orders-list"> <Button variant="outline">View All My Orders</Button> </Link> */}
                    </CardFooter>
                </Card>
            );
        }

        // Prioridade 4: Estado padrão se não veio do checkout e não está carregando/erro
        // (Aqui entraria a futura lista de pedidos - F1)
        return (
            <div className="text-center py-10">
                <p>View your order history here.</p>
                 {/* Futuramente: <OrderList /> */}
            </div>
        );
    };

    // --- JSX PRINCIPAL DO COMPONENTE ---
    return (
        <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
            <AnnouncementBar />
            <Header onCartClick={() => setIsCartOpen(true)} />

            <main className="flex-grow container mx-auto px-4 py-8 pt-[120px] flex flex-col items-center">
                <h1 className="text-3xl md:text-4xl font-extrabold font-aleo mb-8 text-center">
                    {/* Título muda se estamos vendo detalhes de um pedido específico */}
                    {orderDetails ? 'Order Details' : 'My Orders'}
                </h1>

                {/* Renderiza o conteúdo com base no estado */}
                {renderPageContent()}
            </main>

            <Footer />

            {/* SideCart continua funcionando independentemente */}
            <SideCart
                isOpen={isCartOpen}
                onClose={() => setIsCartOpen(false)}
                items={cartItems}
                setItems={setCartItems}
            />
        </div>
    );
} 