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

// Interface mínima para moeda na lista
interface CurrencyDetailsStub { code: string; }

// Interface mínima para transação na lista
interface TransactionSummaryStub { currency?: CurrencyDetailsStub; }

// Interface principal para a lista de pedidos
interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status_name?: string | null;
  shipping_address: OrderShippingAddress;
  estimated_delivery_date?: string | null;
  transactions?: TransactionSummaryStub[];
}

interface AddressDetails { street: string; number: number; city: string; state: string; zip_code: string; }
interface ProductDetails { name: string; image_url?: string; }
interface SizeDetails { name: string; }
interface PurchaseItemDetails { id: number; product_id: number; size_id: number; quantity: number; unit_price_at_purchase: number; product: ProductDetails; size: SizeDetails;}
interface TransactionMethodDetails { name: string; }
interface PaymentStatusDetails { name: string; }
interface TransactionDetails { id: number; method_id: number; status_id: number; amount: number; currency_id: number; created_at: string; method: TransactionMethodDetails; status: PaymentStatusDetails; currency?: CurrencyDetailsStub;}
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

      const apiUrl = `/purchase/${justCompletedOrderId}?include_items=true&include_address=true&include_transactions=true`;
      // --- Log 5: URL da API a ser chamada ---
      console.log(`MyOrdersPage: Calling API GET ${apiUrl}`);
      // --- Fim Log 5 ---

      api.get<{ data: DetailedPurchase }>(apiUrl)
        .then((response: { data: { data: DetailedPurchase } }) => { // Explicit type for response
          // --- Log 6: Resposta da API ---
          console.log(`MyOrdersPage: Response received for order ${justCompletedOrderId}:`, response);
          // --- Fim Log 6 ---
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
  const [orderTransactionsMap, setOrderTransactionsMap] = useState<{ [orderId: string]: TransactionSummaryStub[] }>({});

  // 1. Mantemos o estado para armazenar as URLs das imagens
  const [productImages, setProductImages] = useState<{[key: number]: string}>({});

  // 2. Novo useEffect com carregamento em lote
  useEffect(() => {
    // Função para buscar uma única imagem
    const fetchSingleImage = async (imageId: number) => {
      try {
        const response = await api.get(`/image-category/read/${imageId}`);
        if (response.data && response.data.data) {
          setProductImages(prev => ({
            ...prev,
            [imageId]: response.data.data.url
          }));
          console.log(`MyOrdersPage: Image URL fetched for ID ${imageId}:`, response.data.data.url);
        }
      } catch (error) {
        console.error(`MyOrdersPage: Error fetching image ${imageId}:`, error);
      }
    };

    // Função para coletar todos os IDs de imagem únicos e carregá-los
    const loadAllUniqueImages = () => {
      // Conjunto para armazenar IDs únicos
      const uniqueImageIds = new Set<number>();
      
      // Percorre todos os pedidos e seus itens para coletar IDs únicos
      Object.values(orderItemsMap).forEach(items => {
        if (items && items.length > 0) {
          items.forEach(item => {
            if (item.product && item.product.image_category_id) {
              // Só adiciona ao conjunto se ainda não temos esta imagem carregada
              if (!productImages[item.product.image_category_id]) {
                uniqueImageIds.add(item.product.image_category_id);
              }
            }
          });
        }
      });
      
      // Exibe log de quantas imagens serão carregadas
      console.log(`MyOrdersPage: Loading ${uniqueImageIds.size} unique images in batch`);
      
      // Carrega cada imagem única
      uniqueImageIds.forEach(imageId => {
        fetchSingleImage(imageId);
      });
    };

    // Se temos dados de pedidos, inicia o carregamento em lote
    if (Object.keys(orderItemsMap).length > 0) {
      loadAllUniqueImages();
    }
  }, [orderItemsMap, productImages]); // Dependências mantidas

  // useEffect for justCompletedOrderId logic (remains unchanged)
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoadingList(true)
        console.log("MyOrdersPage (fetchOrders): Iniciando busca de pedidos em /purchase/user/me");
        const response = await api.get("/purchase/user/me?include_transactions=true")
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
    setLoadingItemsState(prev => new Set(prev).add(orderId));
    console.log(`MyOrdersPage (fetchItems): Fetching details for Order ID ${orderId} with include_transactions=true...`);
    try {
        const response = await api.get<{ data: { items: PurchaseItemDetails[], transactions?: TransactionSummaryStub[], shipping_status?: ShippingStatus } }>(
            `/purchase/${orderId}?include_items=true&include_address=false&include_transactions=true&include_shipping=true`
        );

        const data = response.data?.data;
        const items = data?.items;
        const transactions = data?.transactions;
        const shippingStatus = data?.shipping_status;

        console.log(`MyOrdersPage (fetchItems): TRANSACTION DATA STRUCTURE for ${orderId}:`, JSON.stringify(transactions, null, 2));
        
        // NOVO LOG: Verificar se há moeda e extrair o código
        if (transactions && transactions.length > 0) {
            console.log(`MyOrdersPage (fetchItems): Currency object:`, transactions[0].currency);
            if (transactions[0].currency) {
                console.log(`MyOrdersPage (fetchItems): Currency CODE extracted: ${transactions[0].currency.code}`);
                
                // ADICIONANDO: Salvar as transações no estado
                setOrderTransactionsMap(prevMap => ({ ...prevMap, [orderId]: transactions }));
                console.log(`MyOrdersPage (fetchItems): Transactions saved to state for order ${orderId}`);
            } else {
                console.log(`MyOrdersPage (fetchItems): No currency object found in transaction`);
            }
        }

        if (items) {
            console.log(`MyOrdersPage (fetchItems): Items received for ${orderId}:`, items.length);
            setOrderItemsMap(prevMap => ({ ...prevMap, [orderId]: items }));
        } else {
            console.warn(`MyOrdersPage (fetchItems): Invalid or empty items structure for ${orderId}.`);
            setOrderItemsMap(prevMap => ({ ...prevMap, [orderId]: [] }));
        }

        // Map the shipping status
        if (shippingStatus) {
            setOrderShippingStatusMap(prevMap => ({ ...prevMap, [orderId]: shippingStatus }));
        }

    } catch (error: any) {
        console.error(`MyOrdersPage (fetchItems): Error fetching details for ${orderId}:`, error);
        setOrderItemsMap(prevMap => ({ ...prevMap, [orderId]: [] }));
    } finally {
        setLoadingItemsState(prev => {
            const next = new Set(prev);
            next.delete(orderId);
            return next;
        });
    }
}, []);

  // --- useEffect 1: Buscar APENAS a lista de pedidos ---
  useEffect(() => {
    // Só busca a lista se não veio do checkout
    if (!justCompletedOrderId) {
        console.log("MyOrdersPage: useEffect [list] triggered. Fetching order list including transactions...");
        setLoadingList(true);
        setListError(null);
        setOrderItemsMap({});
        setLoadingItemsState(new Set());

        api.get<{ data: Order[] }>("/purchase/user/me?include_transactions=true")
          .then(response => {
            const ordersData = response.data?.data || [];
            console.log("MyOrdersPage (fetchOrders List): Dados recebidos da lista (com transactions):", JSON.stringify(ordersData[0], null, 2));
            setOrders(ordersData);
            console.log(`MyOrdersPage: Lista de ${ordersData.length} pedidos recebida.`);
          })
          .catch(error => {
            const message = error.response?.data?.error || error.message || "Failed to load order list.";
            console.error("MyOrdersPage: Erro ao buscar lista de pedidos:", error);
            console.error("Error details:", error.response?.data);
            setListError(message);
            setOrders([]);
          })
          .finally(() => {
            setLoadingList(false);
          });
    } else {
        setLoadingList(false);
    }
  }, [justCompletedOrderId]);

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
    console.log(`MyOrdersPage: Redirecting to OrderPage for order ID ${orderId}`);
    
    // Obtenha os dados do pedido do estado atual de orderItemsMap e orderTransactionsMap
    const orderItems = orderItemsMap[orderId] || [];
    const orderTransactions = orderTransactionsMap[orderId] || [];
    
    // Encontre o objeto do pedido completo no array de orders
    const orderDetails = orders.find(order => order.id === orderId);
    
    if (!orderDetails) {
      console.error(`MyOrdersPage: Order with ID ${orderId} not found in orders array.`);
      // Navegue mesmo sem dados completos - OrderPage buscará os dados pelo ID
      navigate(`/order-page/${orderId}`);
      return;
    }
    
    // Construa um objeto simplificado do pedido para passar via state
    // Semelhante à estrutura que vem após o checkout
    const orderData = {
      id: orderId,
      items: orderItems,
      transactions: orderTransactions,
      // Adicione outros campos que possam ser úteis
      created_at: orderDetails.created_at,
      total_amount: orderDetails.total_amount,
      shipping_address: orderDetails.shipping_address
    };
    
    // Navegue para OrderPage com os dados disponíveis
    navigate(`/order-page/${orderId}`, {
      state: { 
        justCompletedOrder: orderData,
        // Flag para indicar que viemos da lista de pedidos, não do checkout
        fromOrdersList: true
      }
    });
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
            {filteredOrders.map((order: Order) => {
              const itemsForThisOrder = orderItemsMap[order.id];
              const transactionsForThisOrder = orderTransactionsMap[order.id];
              const isLoadingItemsForThisOrder = loadingItemsState.has(order.id);

              // Acesso à moeda da transação a partir do novo estado
              let currencyCode = null;
              let paymentStatus = null; // Nova variável para armazenar o status do pagamento
              
              console.log(`MyOrdersPage (Render): Order ID ${order.id.substring(0,8)}... | Local Transactions:`, transactionsForThisOrder);
              
              if (transactionsForThisOrder && transactionsForThisOrder.length > 0) {
                // Extrair o código da moeda, se disponível
                if (transactionsForThisOrder[0].currency) {
                  currencyCode = transactionsForThisOrder[0].currency.code;
                  console.log(`MyOrdersPage (Render): SUCCESS! Currency code from state: ${currencyCode}`);
                }
                
                // Extrair o status de pagamento, se disponível
                if (transactionsForThisOrder[0].status) {
                  paymentStatus = transactionsForThisOrder[0].status.name;
                  // Capitalize a primeira letra para exibição
                  paymentStatus = paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);
                  console.log(`MyOrdersPage (Render): Payment status from transaction: ${paymentStatus}`);
                }
              } else {
                console.log(`MyOrdersPage (Render): No transaction data in state for this order`);
              }

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
                      <span className={`inline-block mt-1 px-3 py-1 ${
                        paymentStatus 
                          ? (paymentStatus === 'Paid' ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600') 
                          : 'bg-gray-100 text-gray-500'
                      } rounded-full text-sm`}>
                        {paymentStatus || "Processing"}
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
                                    src={productImages[item.product?.image_category_id] || 'default_product_image.png'}
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
                      <span className="font-medium">
                        {currencyCode ? (
                          <>
                            <span className="text-gray-700">{currencyCode}</span>{' '}
                          </>
                        ) : ''}
                        {order.total_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      {itemsForThisOrder && (
                        <span className="text-gray-500 text-sm ml-1">
                          ({itemsForThisOrder.length} Items)
                        </span>
                      )}
                    </div>
                    <Button onClick={() => handleViewDetailsClick(order.id)} className="px-4 py-2 text-sm">
                      Details
                    </Button>
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
