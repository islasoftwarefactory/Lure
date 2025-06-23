// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import { SideCart } from "./SideCart";
import { useCart } from '../context/CartContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DollarSign, ShoppingCart, Users, BarChart2 } from 'lucide-react';
import api from '../services/api'; // Import the api service

// --- INTERFACES FOR DASHBOARD DATA (matching backend) ---
// Matches the Purchase object from the backend
interface Purchase {
    id: string;
    user_id: number;
    total_amount: number;
    created_at: string;
    transactions: Transaction[];
    // Include user details if the serializer provides them
    user?: {
        name: string;
        email: string;
    }
}

// Matches the Transaction object from the backend
interface Transaction {
    id: number;
    status: {
        name: 'Paid' | 'Pending' | 'Failed' | string; // Allow for other statuses
    };
    amount: number;
    created_at: string;
}

interface SalesMetrics {
    totalRevenue: number;
    salesCount: number;
    newCustomers: number;
    avgOrderValue: number;
}

// This will be derived from the Purchase data
interface RecentOrder {
    id: string;
    customerName: string;
    date: string;
    amount: number;
    status: 'Paid' | 'Pending' | 'Failed' | 'Unknown';
}

export function SalesDashboard() {
    const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();
    const [metrics, setMetrics] = useState<SalesMetrics | null>(null);
    const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Fetch data from the backend API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch all purchases, including their transactions and addresses
                const response = await api.get<{ data: Purchase[] }>('/purchase/?include_transactions=true&include_address=true');
                const purchases = response.data.data;

                // 1. Calculate Metrics
                const totalRevenue = purchases.reduce((sum, p) => sum + p.total_amount, 0);
                const salesCount = purchases.length;
                const customerIds = new Set(purchases.map(p => p.user_id));
                const newCustomers = customerIds.size;
                const avgOrderValue = salesCount > 0 ? totalRevenue / salesCount : 0;

                setMetrics({
                    totalRevenue,
                    salesCount,
                    newCustomers,
                    avgOrderValue,
                });

                // 2. Process Recent Orders
                const processedOrders: RecentOrder[] = purchases
                    .slice(0, 5) // Get the 5 most recent purchases
                    .map(purchase => {
                        // Determine status from the first transaction
                        const mainTransaction = purchase.transactions?.[0];
                        let status: RecentOrder['status'] = 'Unknown';
                        if (mainTransaction?.status?.name) {
                            const s = mainTransaction.status.name;
                            if (s === 'Paid' || s === 'Pending' || s === 'Failed') {
                                status = s;
                            }
                        }
                        
                        return {
                            id: purchase.id.substring(0, 8).toUpperCase(), // Shortened ID
                            // Backend doesn't provide user name, so we use ID.
                            // A future improvement would be to include user details in the purchase serializer.
                            customerName: `User ID: ${purchase.user_id}`,
                            date: new Date(purchase.created_at).toLocaleDateString(),
                            amount: purchase.total_amount,
                            status: status,
                        };
                    });
                
                setRecentOrders(processedOrders);

            } catch (err) {
                console.error("Failed to fetch dashboard data:", err);
                setError("Failed to load dashboard data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const renderStatusBadge = (status: RecentOrder['status']) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
        switch (status) {
            case 'Paid':
                return <span className={`${baseClasses} bg-green-100 text-green-800`}>Paid</span>;
            case 'Pending':
                return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
            case 'Failed':
                return <span className={`${baseClasses} bg-red-100 text-red-800`}>Failed</span>;
            default:
                return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>Unknown</span>;
        }
    };

    const renderPageContent = () => {
        if (isLoading) {
            return <div className="text-center py-10">Loading dashboard...</div>;
        }
        
        if (error) {
            return <div className="text-center text-red-500 py-10">{error}</div>;
        }

        if (!metrics) {
            return <div className="text-center text-gray-500 py-10">No sales data available.</div>;
        }

        return (
            <div className="w-full max-w-7xl mx-auto space-y-8">
                {/* Page Title */}
                <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold font-aleo text-gray-900">
                        Sales Dashboard
                    </h1>
                </div>

                {/* Metrics Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-white rounded-2xl shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                            <DollarSign className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${metrics.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                            {/* Static text for now, can be dynamic later */}
                            <p className="text-xs text-gray-500">All-time revenue</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white rounded-2xl shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Sales</CardTitle>
                            <ShoppingCart className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{metrics.salesCount.toLocaleString()}</div>
                            <p className="text-xs text-gray-500">All-time sales count</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white rounded-2xl shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Customers</CardTitle>
                            <Users className="h-5 w-5 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">+{metrics.newCustomers.toLocaleString()}</div>
                            <p className="text-xs text-gray-500">Unique customers</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-white rounded-2xl shadow-lg">
                         <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Avg. Order Value</CardTitle>
                            <DollarSign className="h-5 w-5 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">${metrics.avgOrderValue.toFixed(2)}</div>
                            <p className="text-xs text-gray-500">All-time average</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Orders and Chart Placeholders */}
                <div className="grid gap-8 lg:grid-cols-3">
                    <Card className="lg:col-span-2 bg-white rounded-2xl shadow-lg">
                        <CardHeader>
                            <CardTitle>Recent Orders</CardTitle>
                            <CardDescription>A list of the 5 most recent sales.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentOrders.length > 0 ? recentOrders.map(order => (
                                    <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div>
                                                <p className="font-semibold text-gray-800">{order.customerName}</p>
                                                <p className="text-sm text-gray-500">ID: {order.id} · {order.date}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                             <p className="font-bold text-gray-900">${order.amount.toFixed(2)}</p>
                                             {renderStatusBadge(order.status)}
                                        </div>
                                    </div>
                                )) : <p className='text-sm text-gray-500'>No recent orders found.</p>}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white rounded-2xl shadow-lg">
                        <CardHeader>
                            <CardTitle>Sales Chart</CardTitle>
                            <CardDescription>Visual representation of sales over time.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex items-center justify-center h-full text-gray-400">
                             <div className="text-center">
                                <BarChart2 size={64} className="mx-auto" />
                                <p className="mt-4">Chart will be displayed here.</p>
                             </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        );
    };

    return (
        <div className="flex flex-col min-h-screen bg-[#f2f2f2]">
            <AnnouncementBar />
            <Header onCartClick={() => setIsCartOpen(true)} />

            <main className="flex-grow container mx-auto px-4 pt-32 sm:pt-36 pb-24 sm:pb-32 flex flex-col items-center">
                {renderPageContent()}
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