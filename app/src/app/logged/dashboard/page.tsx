'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '../../../components/Header';
import { Footer } from '../../../components/Footer';
import { AnnouncementBar } from '../../../components/AnnouncementBar';
import { SideCart } from "../../../components/SideCart";
import { useCart } from '../../../context/CartContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import api from '../../../services/api';
import { DollarSign, ShoppingCart, Package, List } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Interfaces for the data
interface Purchase {
  id: string;
  total_amount: number;
  created_at: string;
  user_id: number;
}

interface Transaction {
  id: number;
  amount: number;
  created_at: string;
  user_id: number;
  status: { name: string };
}

const DashboardPage: React.FC = () => {
  const { isCartOpen, setIsCartOpen, cartItems } = useCart();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch all purchases
        const purchasesResponse = await api.get('/purchase/');
        setPurchases(purchasesResponse.data || []);

        // Fetch all transactions
        const transactionsResponse = await api.get('/transaction/payment/');
        setTransactions(transactionsResponse.data || []);
        
        setError(null);
      } catch (err: any) {
        setError(err.response?.data?.error || err.message || "Failed to fetch data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const totalRevenue = purchases.reduce((acc: number, p: Purchase) => acc + Number(p.total_amount), 0);
  const totalSales = purchases.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      <AnnouncementBar />
      <Header />
      <SideCart isOpen={isCartOpen} onOpenChange={setIsCartOpen} items={cartItems} />

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="w-full max-w-6xl mx-auto space-y-8">
          <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
            <h1 className="text-3xl md:text-4xl font-extrabold font-aleo text-gray-900">
              Sales Dashboard
            </h1>
          </div>

          {loading && <div className="text-center py-10">Loading dashboard...</div>}
          {error && <div className="text-center text-red-500 py-10">Error: {error}</div>}

          {!loading && !error && (
            <>
              {/* Summary Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
                    <p className="text-xs text-muted-foreground">From all sales</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+{totalSales}</div>
                    <p className="text-xs text-muted-foreground">Total number of sales</p>
                  </CardContent>
                </Card>
                 <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Transactions</CardTitle>
                    <List className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+{transactions.length}</div>
                    <p className="text-xs text-muted-foreground">Total transactions processed</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Purchases Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Purchases</CardTitle>
                  <CardDescription>A list of the most recent purchases.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Purchase ID</TableHead>
                        <TableHead>User ID</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {purchases.slice(0, 5).map((purchase) => (
                        <TableRow key={purchase.id}>
                          <TableCell className="font-mono">{purchase.id.substring(0, 8)}...</TableCell>
                          <TableCell>{purchase.user_id}</TableCell>
                          <TableCell>{formatCurrency(purchase.total_amount)}</TableCell>
                          <TableCell>{new Date(purchase.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Recent Transactions Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Transactions</CardTitle>
                  <CardDescription>A list of the most recent transactions.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Transaction ID</TableHead>
                        <TableHead>User ID</TableHead>
                         <TableHead>Status</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transactions.slice(0, 5).map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>{transaction.id}</TableCell>
                          <TableCell>{transaction.user_id}</TableCell>
                           <TableCell>{transaction.status?.name || 'N/A'}</TableCell>
                          <TableCell>{formatCurrency(transaction.amount)}</TableCell>
                          <TableCell>{new Date(transaction.created_at).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default DashboardPage; 