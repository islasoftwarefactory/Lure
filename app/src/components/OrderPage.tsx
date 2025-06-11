// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import { SideCart } from "./SideCart";
import { useCart } from '../context/CartContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import api from '../services/api';
import { ShoppingCart, Package, DollarSign, MapPin, CreditCard, CheckCircle, ChevronRight, Clock } from 'lucide-react';

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
    const { id: purchaseIdParam } = useParams<{ id: string }>();
    const purchaseId = purchaseIdParam || location.state?.justCompletedOrder?.id;
    const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();

    // --- Log 1: Estado inicial da localização ---
    console.log("MyOrdersPage: Component rendered. Initial location.state:", location.state);
    // --- Fim Log 1 ---

    // --- ESTADOS PARA OS DADOS DO PEDIDO ESPECÍFICO ---
    const [orderDetails, setOrderDetails] = useState<DetailedPurchase | null>(null);
    const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
    const [orderDetailsError, setOrderDetailsError] = useState<string | null>(null);
    const [productImages, setProductImages] = useState<{[key: number]: string}>({});
    // --- FIM ESTADOS ---

    // Use purchaseId for fetching order details
    const justCompletedOrderId = purchaseId;

    // --- Log 2: purchaseId detectado antes do useEffect ---
    console.log("MyOrdersPage: purchaseId before useEffect:", justCompletedOrderId);

    // --- useEffect PARA BUSCAR DETALHES DO PEDIDO ---
    useEffect(() => {
        // --- Log 3: useEffect foi acionado? ---
        console.log("MyOrdersPage: useEffect triggered. Value of justCompletedOrderId:", justCompletedOrderId);
        // --- Fim Log 3 ---

        if (justCompletedOrderId) {
            // --- Log 4: Condição 'if (justCompletedOrderId)' is TRUE ---
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
            console.log("MyOrdersPage: Acessado sem purchaseId (URL ou state). Você pode exibir lista de pedidos ou mensagem.");
        }
        // Reexecuta quando purchaseId mudar
    }, [justCompletedOrderId]);
    // --- FIM useEffect ---

    // Adicione esta função de busca de imagem no componente OrderPage
    useEffect(() => {
        // Função para buscar imagem de um produto pelo seu image_category_id
        const fetchProductImage = async (imageId: number) => {
            try {
                const response = await api.get(`/image-category/read/${imageId}`);
                if (response.data && response.data.data) {
                    setProductImages(prev => ({
                        ...prev,
                        [imageId]: response.data.data.url
                    }));
                    console.log(`Image URL fetched for ID ${imageId}:`, response.data.data.url);
                }
            } catch (error) {
                console.error(`Error fetching image ${imageId}:`, error);
            }
        };

        // Quando os detalhes do pedido são carregados, buscamos imagens para todos os produtos
        if (orderDetails && orderDetails.items) {
            orderDetails.items.forEach(item => {
                if (item.product && item.product.image_category_id) {
                    fetchProductImage(item.product.image_category_id);
                }
            });
        }
    }, [orderDetails]); // Executar quando orderDetails mudar

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
                <div className="w-full max-w-4xl mx-auto space-y-8">
                    {/* Page Title */}
                    <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                        <h1 className="text-3xl md:text-4xl font-extrabold font-aleo text-gray-900">
                            Order Details
                        </h1>
                    </div>
                    
                    {/* Order Summary Card */}
                    <Card className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        <CardHeader className="bg-gray-50/80 p-6 border-b">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-blue-100 rounded-xl">
                                    <Package size={28} className="text-blue-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-bold text-gray-900">Order Confirmed!</CardTitle>
                                    <CardDescription className="text-gray-500 mt-1">Thank you for your purchase. Here are the details.</CardDescription>
                                </div>
                            </div>
                    </CardHeader>
                        <CardContent className="p-6 md:p-8 space-y-8">
                            {/* Order Info Section */}
                            <div className="grid md:grid-cols-2 gap-6 text-base">
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <strong className="font-semibold text-gray-600">Order #:</strong>
                                    <span className="font-mono text-gray-800 bg-gray-200/60 px-2 py-1 rounded-md">{orderDetails.id}</span>
                                </div>
                                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
                                    <strong className="font-semibold text-gray-600">Order Date:</strong>
                                    <span className="text-gray-800">{new Date(orderDetails.created_at).toLocaleDateString()}</span>
                                </div>
                        </div>

                            {/* Items Section */}
                        <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3"><ShoppingCart size={22}/> Items Ordered</h3>
                                <div className="space-y-4">
                                    {orderDetails.items?.map(item => (
                                        <div key={item.id} className="flex items-center justify-between p-4 bg-white border border-gray-200/80 rounded-xl shadow-sm">
                                            <div className="flex items-center gap-4">
                                                    <img
                                                        src={productImages[item.product?.image_category_id] || 'default_product_image.png'}
                                                        alt={item.product?.name || 'Product'}
                                                    className="w-16 h-16 rounded-lg object-cover bg-gray-100"
                                                    />
                                                <div>
                                                    <p className="font-semibold text-gray-900">{item.product?.name || 'N/A'}</p>
                                                    <p className="text-sm text-gray-500">Size: {item.size?.name || 'N/A'} | Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                            <p className="font-bold text-lg text-gray-900">${(item.quantity * item.unit_price_at_purchase).toFixed(2)}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Financials Section */}
                            <div>
                                <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3"><DollarSign size={22}/> Financial Summary</h3>
                                <div className="bg-gray-50/80 p-5 rounded-xl border space-y-3">
                                    <div className="flex justify-between items-center text-gray-700">
                                        <p>Subtotal</p>
                                        <p className="font-medium">${orderDetails.items.reduce((sum, item) => sum + item.quantity * item.unit_price_at_purchase, 0).toFixed(2)}</p>
                                    </div>
                                    <div className="flex justify-between items-center text-gray-700">
                                        <p>Shipping</p>
                                        <p className="font-medium">${orderDetails.shipping_cost?.toFixed(2) ?? '0.00'}</p>
                        </div>
                                    <div className="flex justify-between items-center text-gray-700">
                                        <p>Taxes</p>
                                        <p className="font-medium">${orderDetails.taxes?.toFixed(2) ?? '0.00'}</p>
                            </div>
                                    <div className="flex justify-between items-center text-black font-bold text-xl pt-3 border-t mt-3">
                                        <p>Total Paid</p>
                                        <p>${transaction ? transaction.amount?.toFixed(2) : 'N/A'}</p>
                            </div>
                            </div>
                        </div>

                            {/* Shipping & Payment Details */}
                            <div className="grid md:grid-cols-2 gap-8">
                            <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3"><MapPin size={22}/> Shipping Address</h3>
                                {orderDetails.address ? (
                                        <div className="p-4 bg-gray-50/80 rounded-xl border">
                                            <address className="not-italic text-gray-700 leading-relaxed">
                                        {orderDetails.address.street}, {orderDetails.address.number}<br />
                                                {orderDetails.address.city}, {orderDetails.address.state} {orderDetails.address.zip_code}
                                    </address>
                                        </div>
                                ) : (
                                    <p className="text-gray-500 italic">Address not available.</p>
                                )}
                            </div>
                            <div>
                                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-3"><CreditCard size={22}/> Payment Details</h3>
                                    <div className="p-4 bg-gray-50/80 rounded-xl border space-y-3">
                                        <div className="flex justify-between">
                                            <p className="text-gray-600 font-medium">Method:</p>
                                            <p className="font-semibold text-gray-800">{transaction?.method?.name || 'N/A'}</p>
                                        </div>
                                        <div className="flex justify-between">
                                            <p className="text-gray-600 font-medium">Status:</p>
                                            
                                            {transaction?.status?.name === 'Paid' && (
                                                <p className="font-semibold text-green-600 flex items-center gap-2">
                                                    <CheckCircle size={18}/>
                                                    Paid
                                                </p>
                                            )}
                                            {transaction?.status?.name === 'Pending' && (
                                                <p className="font-semibold text-blue-600 flex items-center gap-2">
                                                    <Clock size={18}/>
                                                    Pending
                                                </p>
                                            )}
                                            {/* Fallback for other statuses */}
                                            {!['Paid', 'Pending'].includes(transaction?.status?.name) && (
                                                <p className="font-semibold text-gray-600">
                                                    {transaction?.status?.name || 'N/A'}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                            </div>
                        </div>
                    </CardContent>
                        <CardFooter className="bg-gray-50/80 p-6 flex justify-center">
                        <Link to="/">
                                <Button size="lg" className="bg-black hover:bg-gray-800 text-white font-bold text-lg py-3 px-8 rounded-full flex items-center gap-2">
                                    Continue Shopping
                                    <ChevronRight size={20}/>
                                </Button>
                        </Link>
                    </CardFooter>
                </Card>
                </div>
            );
        }

        // Prioridade 4: Estado padrão se não veio do checkout e não está carregando/erro
        // (Aqui entraria a futura lista de pedidos - F1)
        return (
            <div className="w-full max-w-4xl mx-auto space-y-8">
                {/* Page Title */}
                <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold font-aleo text-gray-900">
                        My Orders
                    </h1>
                </div>
                <div className="text-center py-16 bg-white rounded-2xl shadow-lg">
                    <p className="text-gray-600">Your order history will be displayed here.</p>
                 {/* Futuramente: <OrderList /> */}
                </div>
            </div>
        );
    };

    // --- JSX PRINCIPAL DO COMPONENTE ---
    return (
        <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
            <AnnouncementBar />
            <Header onCartClick={() => setIsCartOpen(true)} />

            <main className="flex-grow container mx-auto px-4 pt-32 sm:pt-36 pb-24 sm:pb-32 flex flex-col items-center">
                {/* O título agora é renderizado dentro de renderPageContent para um melhor contexto */}
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