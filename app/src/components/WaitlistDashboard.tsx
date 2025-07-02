// @ts-nocheck
'use client'

import React, { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AnnouncementBar } from './AnnouncementBar';
import { SideCart } from "./SideCart";
import { useCart } from '../context/CartContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Mail, Calendar, Clock } from 'lucide-react';
import api from '../services/api';

// --- INTERFACES FOR WAITLIST DATA ---
interface WaitlistEntry {
    id: number;
    first_name: string;
    last_name: string | null;
    contact_value: string;
    contact_type_id: number;
    accessed_at: string | null;
    created_at: string;
    updated_at: string;
}

interface WaitlistMetrics {
    totalEntries: number;
    accessedEntries: number;
    pendingEntries: number;
    recentEntries: number; // Last 7 days
}

interface ContactType {
    id: number;
    name: string;
}

export function WaitlistDashboard() {
    const { isCartOpen, setIsCartOpen, cartItems, setCartItems } = useCart();
    const [metrics, setMetrics] = useState<WaitlistMetrics | null>(null);
    const [waitlistEntries, setWaitlistEntries] = useState<WaitlistEntry[]>([]);
    const [contactTypes, setContactTypes] = useState<ContactType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const entriesPerPage = 10;

    // Fetch data from the backend API
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // Fetch waitlist entries and contact types in parallel
                const [entriesResponse, contactTypesResponse] = await Promise.all([
                    api.get<{ data: WaitlistEntry[] }>('/scraping/read/all'),
                    api.get<{ data: ContactType[] }>('/scraping/contact-types')
                ]);

                const entries = entriesResponse.data.data;
                const types = contactTypesResponse.data.data;

                setWaitlistEntries(entries);
                setContactTypes(types);

                // Calculate metrics
                const totalEntries = entries.length;
                const accessedEntries = entries.filter((entry: WaitlistEntry) => entry.accessed_at !== null).length;
                const pendingEntries = totalEntries - accessedEntries;
                
                // Recent entries (last 7 days)
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                const recentEntries = entries.filter((entry: WaitlistEntry) => 
                    new Date(entry.created_at) >= sevenDaysAgo
                ).length;

                setMetrics({
                    totalEntries,
                    accessedEntries,
                    pendingEntries,
                    recentEntries
                });

            } catch (err) {
                console.error("Failed to fetch waitlist data:", err);
                setError("Failed to load waitlist data. Please try again later.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    // Get contact type name by ID
    const getContactTypeName = (typeId: number): string => {
        const type = contactTypes.find((t: ContactType) => t.id === typeId);
        return type?.name || 'Unknown';
    };

    // Pagination logic
    const totalPages = Math.ceil(waitlistEntries.length / entriesPerPage);
    const startIndex = (currentPage - 1) * entriesPerPage;
    const endIndex = startIndex + entriesPerPage;
    const currentEntries = waitlistEntries.slice(startIndex, endIndex);

    const renderStatusBadge = (accessedAt: string | null) => {
        const baseClasses = "px-2 py-1 text-xs font-semibold rounded-full";
        if (accessedAt) {
            return <span className={`${baseClasses} bg-green-100 text-green-800`}>Accessed</span>;
        } else {
            return <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>Pending</span>;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderPageContent = () => {
        if (isLoading) {
            return <div className="text-center py-10">Loading waitlist dashboard...</div>;
        }
        
        if (error) {
            return <div className="text-center text-red-500 py-10">{error}</div>;
        }

        if (!metrics) {
            return <div className="text-center text-gray-500 py-10">No waitlist data available.</div>;
        }

        return (
            <div className="w-full max-w-7xl mx-auto space-y-8">
                {/* Page Title */}
                <div className="bg-white rounded-2xl shadow-lg p-5 text-center">
                    <h1 className="text-3xl md:text-4xl font-extrabold font-aleo text-gray-900">
                        Waitlist Dashboard
                    </h1>
                    <p className="text-gray-600 mt-2">Manage and monitor waitlist registrations</p>
                </div>

                {/* Metrics Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="bg-white rounded-2xl shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Total Entries</CardTitle>
                            <Users className="h-5 w-5 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.totalEntries.toLocaleString()}</div>
                            <p className="text-xs text-gray-500">Total waitlist registrations</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-white rounded-2xl shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Accessed</CardTitle>
                            <Mail className="h-5 w-5 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.accessedEntries.toLocaleString()}</div>
                            <p className="text-xs text-gray-500">Users who have accessed</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-white rounded-2xl shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Pending</CardTitle>
                            <Clock className="h-5 w-5 text-yellow-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.pendingEntries.toLocaleString()}</div>
                            <p className="text-xs text-gray-500">Awaiting first access</p>
                        </CardContent>
                    </Card>
                    
                    <Card className="bg-white rounded-2xl shadow-lg">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium text-gray-500">Recent (7 days)</CardTitle>
                            <Calendar className="h-5 w-5 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.recentEntries.toLocaleString()}</div>
                            <p className="text-xs text-gray-500">New registrations</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Waitlist Entries Table */}
                <Card className="bg-white rounded-2xl shadow-lg">
                    <CardHeader>
                        <CardTitle>Waitlist Entries</CardTitle>
                        <CardDescription>
                            All registered users in the waitlist system.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {waitlistEntries.length > 0 ? (
                            <>
                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full text-sm">
                                        <thead>
                                            <tr className="border-b border-gray-200">
                                                <th className="text-left py-3 px-2 font-semibold text-gray-600">ID</th>
                                                <th className="text-left py-3 px-2 font-semibold text-gray-600">Name</th>
                                                <th className="text-left py-3 px-2 font-semibold text-gray-600">Contact</th>
                                                <th className="text-left py-3 px-2 font-semibold text-gray-600">Type</th>
                                                <th className="text-left py-3 px-2 font-semibold text-gray-600">Status</th>
                                                <th className="text-left py-3 px-2 font-semibold text-gray-600">Created</th>
                                                <th className="text-left py-3 px-2 font-semibold text-gray-600">Last Access</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {currentEntries.map(entry => (
                                                <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50">
                                                    <td className="py-3 px-2 font-mono text-gray-600">#{entry.id}</td>
                                                    <td className="py-3 px-2">
                                                        <div className="font-medium text-gray-900">
                                                            {entry.first_name} {entry.last_name || ''}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <div className="text-gray-700 break-all">
                                                            {entry.contact_value}
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                            {getContactTypeName(entry.contact_type_id)}
                                                        </span>
                                                    </td>
                                                    <td className="py-3 px-2">
                                                        {renderStatusBadge(entry.accessed_at)}
                                                    </td>
                                                    <td className="py-3 px-2 text-gray-600">
                                                        {formatDate(entry.created_at)}
                                                    </td>
                                                    <td className="py-3 px-2 text-gray-600">
                                                        {entry.accessed_at ? formatDate(entry.accessed_at) : '-'}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-6">
                                        <div className="text-sm text-gray-500">
                                            Showing {startIndex + 1} to {Math.min(endIndex, waitlistEntries.length)} of {waitlistEntries.length} entries
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <button
                                                onClick={() => setCurrentPage(currentPage - 1)}
                                                disabled={currentPage === 1}
                                                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Previous
                                            </button>
                                            <span className="text-sm text-gray-600">
                                                Page {currentPage} of {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(currentPage + 1)}
                                                disabled={currentPage === totalPages}
                                                className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            <p className='text-sm text-gray-500'>No waitlist entries found.</p>
                        )}
                    </CardContent>
                </Card>
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