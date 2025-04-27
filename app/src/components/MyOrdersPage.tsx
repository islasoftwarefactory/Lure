import React, { useEffect, useState, useCallback } from 'react';
import { Truck, MapPin, Loader2 } from "lucide-react"
import api from '../services/api'
import { useLocation, useNavigate, Link } from "react-router-dom"
import { useCart } from '../context/CartContext'
import { Header } from './Header'
import { Footer } from './Footer'
import { AnnouncementBar } from './AnnouncementBar'
import { SideCart } from "./SideCart"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

// Interface para o endereço dentro do pedido da lista
interface OrderShippingAddress {
  city: string;
  state: string;
  // Outros campos do endereço não usados na lista
}

// Definindo a interface para os dados da API de LISTA
interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status_name?: string | null; // Pode ser null ou não existir
  shipping_address: OrderShippingAddress;
  estimated_delivery_date?: string | null; // Pode ser null ou não existir
}

// Definindo novas interfaces para DETALHES do pedido
interface AddressDetails { street: string; number: number; city: string; state: string; zip_code: string; }
interface ProductDetails { name: string; image_url?: string; }
interface SizeDetails { name: string; }
interface PurchaseItemDetails { id: number; product_id: number; size_id: number; quantity: number; unit_price_at_purchase: number; product: ProductDetails; size: SizeDetails;}
interface TransactionMethodDetails { name: string; }
interface PaymentStatusDetails { name: string; }
interface TransactionDetails { id: number; method_id: number; status_id: number; amount: number; currency_id: number; created_at: string; method: TransactionMethodDetails; status: PaymentStatusDetails;}
interface DetailedPurchase { id: string; user_id: number; shipping_address_id: number; shipping_cost: number; taxes: number; created_at: string; updated_at: string; address: AddressDetails; items: PurchaseItemDetails[]; transactions: TransactionDetails[];}

export function MyOrdersPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();

  // --- Log 1: Estado inicial da localização ---
  console.log("MyOrdersPage: Component rendered. Initial location.state:", location.state);
  // --- Fim Log 1 ---

  const [orderDetails, setOrderDetails] = useState<DetailedPurchase | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState<boolean>(false);
  const [orderDetailsError, setOrderDetailsError] = useState<string | null>(null);

  const justCompletedOrderId = location.state?.justCompletedOrder?.id;

  // --- Log 2: Valor do ID antes do useEffect ---
  console.log("MyOrdersPage: Value of justCompletedOrderId before useEffect:", justCompletedOrderId);
  // --- Fim Log 2 ---

  useEffect(() => {
    // --- Log 3: useEffect foi acionado? ---
    console.log("MyOrdersPage: useEffect triggered. Value of justCompletedOrderId:", justCompletedOrderId);
    // --- Fim Log 3 ---

    if (justCompletedOrderId) {
      // --- Log 4: Condição 'if' passou? ---
      console.log("MyOrdersPage: Condition 'if (justCompletedOrderId)' is TRUE. Attempting to fetch...");
      // --- Fim Log 4 ---

      setIsLoadingDetails(true);
      setOrderDetailsError(null);
      setOrderDetails(null);

      const apiUrl = `/purchase/${justCompletedOrderId}?include_items=true&include_transactions=true&include_address=true`;
      // --- Log 5: URL da API a ser chamada ---
      console.log(`MyOrdersPage: Calling API GET ${apiUrl}`);
      // --- Fim Log 5 ---

      api.get<{ data: DetailedPurchase }>(apiUrl)
        .then((response: { data: { data: DetailedPurchase } }) => { // Explicit type for response
          if (response.data?.data) {
            console.log("MyOrdersPage: Detalhes recebidos:", response.data.data);
            setOrderDetails(response.data.data);
          } else {
            throw new Error("Invalid data structure for order details.");
          }
        })
        .catch((err: any) => { // Explicit type for err
          const message = err.response?.data?.error || err.message || "Failed to load order details.";
          console.error(`MyOrdersPage: Erro ao buscar detalhes ${justCompletedOrderId}:`, message, err);
          setOrderDetailsError(message);
        })
        .finally(() => {
          setIsLoadingDetails(false);
        });
    } else {
      // --- Log 6: Condição 'if' FALHOU ---
      console.log("MyOrdersPage: Condition 'if (justCompletedOrderId)' is FALSE. No fetch initiated.");
      // --- Fim Log 6 ---
    }
  }, [justCompletedOrderId]);

  const [orders, setOrders] = useState<Order[]>([])
  const [isLoadingList, setLoadingList] = useState(true) // Renomeado loading -> isLoadingList
  const [listError, setListError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("shipping")
  // Novo estado para armazenar detalhes dos itens por ID do pedido
  const [orderItemsMap, setOrderItemsMap] = useState<{ [orderId: string]: PurchaseItemDetails[] }>({});
  const [loadingItemsState, setLoadingItemsState] = useState<Set<string>>(new Set()); // <<< NOVO: Conjunto de IDs de pedidos carregando itens

  // useEffect for justCompletedOrderId logic (remains unchanged)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingList(true)
        console.log("MyOrdersPage (fetchOrders): Iniciando busca de pedidos em /purchase/user/me");
        const response = await api.get("/purchase/user/me")
        // --- Log Detalhado da Resposta ---
        console.log("MyOrdersPage (fetchOrders): Resposta completa da API:", JSON.stringify(response.data, null, 2));
        // --- Fim Log Detalhado ---

        // Tentativa de acesso aos dados - CORRIGIDO com base no log
        const ordersData = response.data?.data; // Acesso CORRIGIDO
        console.log("MyOrdersPage (fetchOrders): Dados extraídos (response.data.data):", ordersData);

        // Verificação mais segura antes de setar o estado
        if (Array.isArray(ordersData)) {
          setOrders(ordersData);
          console.log(`MyOrdersPage (fetchOrders): ${ordersData.length} pedidos definidos no estado.`);
        } else {
          console.warn("MyOrdersPage (fetchOrders): A estrutura esperada (response.data.data.data) não é um array ou não existe. Definindo como vazio.");
          setOrders([]);
        }

      } catch (error: any) { // Tipando error como any para acessar propriedades
        console.error("MyOrdersPage (fetchOrders): Erro detalhado ao buscar pedidos:", {
          message: error.message,
          responseStatus: error.response?.status,
          responseData: error.response?.data,
          stack: error.stack // Opcional, pode ser muito verboso
        });
        setOrders([]); // Garante que orders seja um array vazio em caso de erro
      } finally {
        console.log("MyOrdersPage (fetchOrders): Finalizando busca (loading=false).");
        setLoadingList(false);
      }
    }

    fetchOrders()
  }, [])

  // --- Função para buscar itens de UM pedido específico ---
  const fetchOrderItems = useCallback(async (orderId: string) => {
    // Adiciona ao set de loading
    setLoadingItemsState(prev => new Set(prev).add(orderId));
    console.log(`MyOrdersPage (fetchItems): Buscando itens para pedido ${orderId}...`);
    try {
      const response = await api.get<{ data: { items: PurchaseItemDetails[] } }>(`/purchase/${orderId}?include_items=true&include_address=false&include_transactions=false`);
      const items = response.data?.data?.items; // Extrai os itens

      if (items) { // Verifica se os itens existem na resposta
        console.log(`MyOrdersPage (fetchItems): Itens recebidos para ${orderId}:`, items.length);
        // --- EDIT 2: Usar forma funcional de atualização de estado ---
        setOrderItemsMap(prevMap => ({ ...prevMap, [orderId]: items }));
        // --- FIM EDIT 2 ---
      } else {
        console.warn(`MyOrdersPage (fetchItems): Estrutura de itens inválida ou vazia para ${orderId}.`);
        // --- EDIT 3: Usar forma funcional aqui também ---
        setOrderItemsMap(prevMap => ({ ...prevMap, [orderId]: [] })); // Marca como vazio
        // --- FIM EDIT 3 ---
      }
    } catch (error: any) {
      console.error(`MyOrdersPage (fetchItems): Erro ao buscar itens para ${orderId}:`, error);
      // --- EDIT 4: Usar forma funcional aqui também ---
      setOrderItemsMap(prevMap => ({ ...prevMap, [orderId]: [] })); // Marca como vazio em erro
      // --- FIM EDIT 4 ---
    } finally {
      // Remove do set de loading
      setLoadingItemsState(prev => {
          const next = new Set(prev);
          next.delete(orderId);
          return next;
      });
    }
  }, []); // <<< Array de dependências VAZIO para useCallback

  // --- useEffect 1: Buscar APENAS a lista de pedidos ---
  useEffect(() => {
    // Só busca a lista se não veio do checkout
    if (!justCompletedOrderId) {
        console.log("MyOrdersPage: useEffect [list] triggered. Fetching order list...");
        setLoadingList(true);
        setListError(null);
        setOrderItemsMap({}); // Limpa itens ao buscar nova lista
        setLoadingItemsState(new Set()); // Limpa loading de itens

        api.get<{ data: Order[] }>("/purchase/user/me")
          .then(response => {
            const ordersData = response.data?.data || [];
            setOrders(ordersData);
            console.log(`MyOrdersPage: Lista de ${ordersData.length} pedidos recebida.`);
          })
          .catch(error => {
            const message = error.response?.data?.error || error.message || "Failed to load order list.";
            console.error("MyOrdersPage: Erro ao buscar lista de pedidos:", error);
            setListError(message);
            setOrders([]);
          })
          .finally(() => {
            setLoadingList(false);
          });
    } else {
        setLoadingList(false); // Garante que loading da lista é false se não buscamos
    }
  }, [justCompletedOrderId]); // Depende apenas de justCompletedOrderId

  // --- useEffect 2: Buscar ITENS quando a lista 'orders' mudar ---
  useEffect(() => {
    // Só busca itens se temos pedidos na lista e não estamos no modo de detalhe específico
    if (!justCompletedOrderId && orders.length > 0) {
        console.log(`MyOrdersPage: useEffect [items] triggered. ${orders.length} pedidos na lista. Verificando itens...`);
        orders.forEach(order => {
             // Só busca se NÃO temos os itens e NÃO estamos buscando atualmente
             if (orderItemsMap[order.id] === undefined && !loadingItemsState.has(order.id)) {
                 fetchOrderItems(order.id); // Dispara a busca para este pedido
             }
        });
    }
  // Depende da lista 'orders', do mapa de itens e da função (estável)
  }, [orders, orderItemsMap, fetchOrderItems, justCompletedOrderId, loadingItemsState]);

  // --- ATENÇÃO: A filtragem por aba ('shipping', 'arrived') ainda é uma SIMULAÇÃO ---
  // A API /purchase/user/me não retorna o status atualizado para fazer essa filtragem real.
  // Seria necessário ajustar a API ou buscar o status de cada pedido individualmente.
  const filteredOrders = orders.filter((order: Order, index: number) => { // Explicit types for order and index
    // Lógica de simulação mantida por enquanto
    if (activeTab === "shipping") return index % 3 === 0 || index % 3 === 1
    if (activeTab === "arrived") return index % 3 === 2
    return false
  })

  // Contagem de pedidos por status (simulação - reflete a lógica acima)
  const shippingCount = orders.filter((_: Order, index: number) => index % 3 === 0 || index % 3 === 1).length // Explicit types
  const arrivedCount = orders.filter((_: Order, index: number) => index % 3 === 2).length // Explicit types

  // --- Lógica para lidar com clique nos detalhes da lista ---
  const handleViewDetailsClick = (orderId: string) => {
    navigate(`/order-page/${orderId}`); // Navega para a página de detalhes específica
  }

  // --- RENDERIZAÇÃO ---
  // Decide se mostra detalhes do pedido recém-completado ou a lista geral
  const renderContent = () => {
    // Se viemos do checkout e estamos carregando os detalhes
    if (justCompletedOrderId && isLoadingDetails) {
      return <div className="text-center py-10"><Loader2 className="w-8 h-8 animate-spin text-gray-500 inline-block" /> Loading Order Details...</div>;
    }
    // Se houve erro ao carregar os detalhes específicos
    if (justCompletedOrderId && orderDetailsError) {
      return <div className="text-center text-red-500 py-10">Error loading order details: {orderDetailsError}</div>;
    }
    // Se temos os detalhes do pedido específico
    if (justCompletedOrderId && orderDetails) {
      return (
        <Card className="p-6 text-center">
          Displaying details for recently completed order: {orderDetails.id.substring(0,8)}...
          {/* Adicionar JSX detalhado aqui depois */}
        </Card>
      );
    }

    // --- Se não veio do checkout OU se não há detalhes específicos, mostra a LISTA ---
    return (
      <>
        {/* Tabs */}
        <div className="bg-gray-100 rounded-full p-2 mb-8 flex max-w-md mx-auto">
          <button
            className={`flex-1 py-2 px-3 rounded-full text-center text-sm font-medium transition-colors ${activeTab === "shipping" ? "bg-white shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
            onClick={() => setActiveTab("shipping")}
          >
            On Shipping{" "}
            <span className={`inline-flex items-center justify-center ml-1 w-5 h-5 ${activeTab === "shipping" ? "bg-black text-white" : "bg-gray-200 text-gray-500"} text-xs rounded-full`}>{shippingCount}</span>
          </button>
          <button
            className={`flex-1 py-2 px-3 rounded-full text-center text-sm font-medium transition-colors ${activeTab === "arrived" ? "bg-white shadow-sm" : "text-gray-500 hover:bg-gray-200"}`}
            onClick={() => setActiveTab("arrived")}
          >
            Arrived{" "}
            <span className={`inline-flex items-center justify-center ml-1 w-5 h-5 ${activeTab === "arrived" ? "bg-black text-white" : "bg-gray-200 text-gray-500"} text-xs rounded-full`}>{arrivedCount}</span>
          </button>
          {/* <button className={`...`} onClick={() => setActiveTab("canceled")}> Canceled </button> */}
        </div>

        {/* Conteúdo da Lista */}
        {isLoadingList ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
          </div>
        ) : listError ? (
          <div className="text-center py-20 text-red-500">Error loading orders: {listError}</div>
        ) : filteredOrders.length === 0 && !isLoadingList ? (
          <div className="text-center py-20 text-gray-500">No orders found in this category.</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredOrders.map((order: Order, index: number) => {
              // Pega os itens para este pedido específico do nosso mapa de estado
              const itemsForThisOrder = orderItemsMap[order.id];
              // Verifica se itens para ESTE pedido específico estão carregando
              const isLoadingItemsForThisOrder = loadingItemsState.has(order.id);

              return (
                <div key={order.id} className="border rounded-xl p-6 bg-white shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-gray-500">Order ID</div>
                      {/* Exibindo os primeiros 8 caracteres do ID real */}
                      <div className="text-lg font-bold">#{order.id.substring(0, 8)}...</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500">
                        {/* Exibindo data estimada real ou fallback */}
                        Estimated arrival: {order.estimated_delivery_date ? new Date(order.estimated_delivery_date).toLocaleDateString() : "Not available"}
                      </div>
                      {/* Exibindo status real ou fallback */}
                      <span className={`inline-block mt-1 px-3 py-1 ${order.status_name ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'} rounded-full text-sm`}>
                        {order.status_name || "Processing"}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mb-6">
                     {/* Endereço de Origem (Simulado/Fixo - API não fornece) */}
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5" />
                      <span className="text-sm">Warehouse</span> {/* Placeholder */}
                    </div>
                    <div className="flex-1 mx-2 border-t border-dashed border-gray-300 relative">
                      <div className="absolute left-0 top-1/2 w-2 h-2 bg-black rounded-full -translate-y-1/2"></div>
                      <div className="absolute right-0 top-1/2 w-2 h-2 bg-black rounded-full -translate-y-1/2"></div>
                    </div>
                     {/* Endereço de Destino (Real da API) */}
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span className="text-sm">
                        {order.shipping_address ? `${order.shipping_address.city}, ${order.shipping_address.state}` : "Address unavailable"}
                      </span>
                    </div>
                  </div>

                  {/* --- Seção de Produtos - AGORA COM DADOS REAIS (OU LOADING) --- */}
                  <div className="grid grid-cols-2 gap-4 mb-6 min-h-[100px]"> {/* min-h para evitar colapso durante loading */}
                    {isLoadingItemsForThisOrder ? (
                       <div className="col-span-2 flex justify-center items-center text-sm text-gray-400">
                           <Loader2 className="w-4 h-4 animate-spin mr-2"/> Loading items...
                       </div>
                    ) : itemsForThisOrder && itemsForThisOrder.length > 0 ? (
                       // Mostra os primeiros 2 itens (ou ajuste conforme necessário)
                       itemsForThisOrder.slice(0, 2).map(item => (
                         <div key={item.id} className="flex gap-3">
                            <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                <img
                                    src={item.product?.image_url || 'default_product_image.png'}
                                    alt={item.product?.name || 'Product'}
                                    width={80}
                                    height={80}
                                    className="w-full h-full object-cover"
                                    onError={(e) => (e.currentTarget.src = 'default_product_image.png')}
                                />
                            </div>
                            <div>
                               <h3 className="font-medium text-sm leading-tight">{item.product?.name || 'N/A'}</h3>
                               {/* Preço unitário da compra */}
                               <p className="font-medium text-sm">
                                   ${item.unit_price_at_purchase.toFixed(2)}
                                   <span className="text-gray-500 text-xs"> x{item.quantity}</span>
                               </p>
                               <p className="text-xs text-gray-500">Size: {item.size?.name || 'N/A'}</p>
                            </div>
                         </div>
                       ))
                    ) : (
                       // Só mostra 'No items' se NÃO estiver carregando e o array estiver definido (vazio ou não)
                       !isLoadingItemsForThisOrder && <div className="col-span-2 text-center text-sm text-gray-400">No items found.</div>
                    )}
                    {/* Poderia adicionar um indicador se houver mais de 2 itens */}
                    {itemsForThisOrder && itemsForThisOrder.length > 2 && (
                        <div className="col-span-2 text-center text-xs text-gray-400 mt-[-10px]">(+{itemsForThisOrder.length - 2} more items)</div>
                    )}
                  </div>
                  {/* --- Fim Seção de Produtos --- */}

                  <div className="flex justify-between items-center border-t pt-4 mt-4">
                    <div>
                      {/* Exibindo total real */}
                      <span className="font-medium">Rp{order.total_amount.toLocaleString()}</span>
                      {/* Contagem de itens (se disponível nos itens buscados) */}
                       {itemsForThisOrder && (
                           <span className="text-gray-500 text-sm ml-1">({itemsForThisOrder.length} Items)</span>
                       )}
                    </div>
                    <Button onClick={() => handleViewDetailsClick(order.id)} className="px-4 py-2 text-sm">Details</Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </>
    );
  }

  // --- Estrutura Principal com Layout ---
  return (
    <div className="flex flex-col min-h-screen bg-gray-50"> {/* Fundo ligeiramente cinza */}
      <AnnouncementBar />
      <Header onCartClick={() => setIsCartOpen(true)} />

      <main className="flex-grow container mx-auto px-4 py-8 pt-[100px] md:pt-[120px]"> {/* Padding top ajustado */}
        <h1 className="text-3xl font-bold mb-8 text-center md:text-left">My Orders</h1>
        {renderContent()} {/* Renderiza ou detalhes ou a lista */}
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
