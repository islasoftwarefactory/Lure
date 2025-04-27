"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Truck, MapPin, Loader2 } from "lucide-react"
import api from "./services/api"

// Definindo a interface para os dados da API
interface Order {
  id: string
  created_at: string
  total_amount: number
  status_name?: string
  // Outros campos que podem vir da API mas não serão usados agora
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("shipping")

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true)
        const response = await api.get("/purchase/user/me")
        setOrders(response.data.data.data || [])
      } catch (error) {
        console.error("Erro ao buscar pedidos:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  // Filtrar pedidos com base na aba ativa (simulação, já que a API não retorna esse dado ainda)
  const filteredOrders = orders.filter((order, index) => {
    if (activeTab === "shipping") return index % 3 === 0 || index % 3 === 1 // Simulando pedidos em trânsito
    if (activeTab === "arrived") return index % 3 === 2 // Simulando pedidos entregues
    return false // Cancelados (não temos nenhum neste exemplo)
  })

  // Contagem de pedidos por status (simulação)
  const shippingCount = orders.filter((_, index) => index % 3 === 0 || index % 3 === 1).length
  const arrivedCount = orders.filter((_, index) => index % 3 === 2).length

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Orders</h1>

      {/* Tabs */}
      <div className="bg-gray-100 rounded-full p-2 mb-8 flex">
        <button
          className={`flex-1 py-3 px-4 rounded-full text-center font-medium ${activeTab === "shipping" ? "bg-white shadow-sm" : "text-gray-500"}`}
          onClick={() => setActiveTab("shipping")}
        >
          On Shipping{" "}
          <span
            className={`inline-flex items-center justify-center ml-1 w-5 h-5 ${activeTab === "shipping" ? "bg-black text-white" : "bg-gray-200 text-gray-500"} text-xs rounded-full`}
          >
            {shippingCount}
          </span>
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-full text-center font-medium ${activeTab === "arrived" ? "bg-white shadow-sm" : "text-gray-500"}`}
          onClick={() => setActiveTab("arrived")}
        >
          Arrived{" "}
          <span
            className={`inline-flex items-center justify-center ml-1 w-5 h-5 ${activeTab === "arrived" ? "bg-black text-white" : "bg-gray-200 text-gray-500"} text-xs rounded-full`}
          >
            {arrivedCount}
          </span>
        </button>
        <button
          className={`flex-1 py-3 px-4 rounded-full text-center font-medium ${activeTab === "canceled" ? "bg-white shadow-sm" : "text-gray-500"}`}
          onClick={() => setActiveTab("canceled")}
        >
          Canceled
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-gray-500" />
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="text-center py-20 text-gray-500">No orders found in this category.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredOrders.map((order, index) => (
            <div key={order.id} className="border rounded-xl p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="text-sm text-gray-500">Order ID</div>
                  <div className="text-xl font-bold">#{order.id.substring(0, 7)}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500">
                    {/* Aqui futuramente será exibida a data estimada de entrega; integrar rota específica para buscar previsão de entrega. */}
                    Estimated arrival: {index % 2 === 0 ? "28 May 2024" : "9 Jul 2024"}
                  </div>
                  <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                    {order.status_name || "On Deliver"}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  <span className="text-sm">
                    {/* Aqui futuramente será exibido o endereço do pedido; integrar rota específica para buscar o endereço. */}
                    {index % 2 === 0 ? "Malang, Indonesia" : "Berlin, UK"}
                  </span>
                </div>
                <div className="flex-1 mx-2 border-t border-dashed border-gray-300 relative">
                  <div className="absolute left-0 top-1/2 w-2 h-2 bg-black rounded-full -translate-y-1/2"></div>
                  <div className="absolute right-0 top-1/2 w-2 h-2 bg-black rounded-full -translate-y-1/2"></div>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  <span className="text-sm">
                    {/* Aqui futuramente será exibido o endereço de entrega; integrar rota específica para buscar o endereço. */}
                    {index % 2 === 0 ? "Emir's House, Indonesia" : "Darla's Home, Indonesia"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                {/* Aqui futuramente será exibida a lista de produtos e características do pedido; integrar rota específica para buscar detalhes dos produtos. */}
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src="https://hourscollection.com/cdn/shop/files/DropShoulderHoodie-Grey-productphoto_1_800x.png?v=1739305890"
                      alt="Product"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{index % 2 === 0 ? "Nike Air Max SYSTM" : "Nike Gamma Force"}</h3>
                    <p className="font-medium">
                      Rp{(order.total_amount / 2).toLocaleString()} <span className="text-gray-500 text-sm">x1</span>
                    </p>
                    <p className="text-sm text-gray-500">Size: 24</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                    <Image
                      src="https://hourscollection.com/cdn/shop/files/DropShoulderHoodie-Grey-productphoto_1_800x.png?v=1739305890"
                      alt="Product"
                      width={80}
                      height={80}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <h3 className="font-medium">{index % 2 === 0 ? "Nike Air Rift" : "Nike Cortez"}</h3>
                    <p className="font-medium">
                      Rp{(order.total_amount / 2).toLocaleString()} <span className="text-gray-500 text-sm">x1</span>
                    </p>
                    <p className="text-sm text-gray-500">Size: 24</p>
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <span className="font-medium">Rp{order.total_amount.toLocaleString()}</span>
                  <span className="text-gray-500 text-sm ml-1">({index % 2 === 0 ? "6" : "2"} Items)</span>
                </div>
                <button className="px-6 py-2 bg-black text-white rounded-full">Details</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
