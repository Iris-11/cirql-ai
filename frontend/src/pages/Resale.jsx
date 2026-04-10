import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Repeat, 
  Search, 
  Filter, 
  User, 
  ArrowRight, 
  TrendingUp, 
  History, 
  Calendar,
  DollarSign,
  Leaf,
  ChevronRight
} from 'lucide-react';

const Resale = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/resale');
                if (!res.ok) throw new Error('Failed to fetch resale history');
                const data = await res.json();
                setTransactions(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredTransactions = useMemo(() => {
        return transactions.filter(t => 
            t.passports?.skus?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.seller?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.buyer?.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [transactions, searchTerm]);

    if (loading) return <div className="p-40 text-center opacity-60">Syncing Resale Ledger...</div>;
    if (error) return <div className="p-40 text-center text-red-500">Ledger Error: {error}</div>;

    return (
        <div className="resale-ledger-view">
            <header className="view-header">
                <div className="title-area">
                    <div className="icon-badge">
                        <Repeat size={24} className="text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Resale History</h1>
                        <p className="text-slate-500 text-sm">Tracking ownership transfers and circular lifecycle events</p>
                    </div>
                </div>
                
                <div className="header-actions">
                    <div className="search-bar card-glass">
                        <Search size={18} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Product or Owner..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="stats-row grid-4">
                <div className="stat-card card-glass">
                    <span className="lab">Total Resales</span>
                    <span className="val">{transactions.length}</span>
                </div>
                <div className="stat-card card-glass">
                    <span className="lab">Avg Sold Price</span>
                    <span className="val">${(transactions.reduce((acc, curr) => acc + (curr.sold_price_usd || 0), 0) / (transactions.length || 1)).toFixed(2)}</span>
                </div>
                <div className="stat-card card-glass">
                    <span className="lab">Circular Reach</span>
                    <span className="val">{new Set(transactions.map(t => t.buyer_id)).size} Buyers</span>
                </div>
                <div className="stat-card card-glass">
                    <span className="lab">CO2 Avoided</span>
                    <span className="val text-emerald-600">{transactions.reduce((acc, curr) => acc + (curr.e3_result?.impact?.co2_avoided_kg || 0), 0).toFixed(1)}kg</span>
                </div>
            </div>

            <div className="ledger-table card card-glass overflow-hidden">
                <table className="table-sleek">
                    <thead>
                        <tr>
                            <th>Product Information</th>
                            <th>Primary Owner (Seller)</th>
                            <th></th>
                            <th>Secondary Owner (Buyer)</th>
                            <th>Sold Price</th>
                            <th>Impact</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredTransactions.map((t, i) => (
                            <motion.tr 
                                key={t.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                                className="row-hover"
                            >
                                <td>
                                    <div className="prod-cell">
                                        <span className="font-bold text-slate-700">{t.passports?.skus?.name}</span>
                                        <span className="text-xs opacity-50">{t.passports?.skus?.brands?.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <div className="user-cell">
                                        <div className="avatar-mini">{t.seller?.name.split(' ').map(n=>n[0]).join('')}</div>
                                        <span>{t.seller?.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <ArrowRight size={14} className="text-slate-300" />
                                </td>
                                <td>
                                    <div className="user-cell">
                                        <div className="avatar-mini blue">{t.buyer?.name.split(' ').map(n=>n[0]).join('')}</div>
                                        <span>{t.buyer?.name}</span>
                                    </div>
                                </td>
                                <td className="font-bold text-slate-800">
                                    ${t.sold_price_usd?.toFixed(2)}
                                </td>
                                <td>
                                    <div className="impact-tag">
                                        <Leaf size={12} className="text-emerald-500" />
                                        <span>{t.e3_result?.impact?.co2_avoided_kg}kg CO2</span>
                                    </div>
                                </td>
                                <td className="text-sm opacity-50">
                                    {new Date(t.sold_at).toLocaleDateString()}
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
                {filteredTransactions.length === 0 && (
                  <div className="empty-state p-40 text-center text-slate-400">
                    No resale transactions found matching your criteria.
                  </div>
                )}
            </div>

            <style jsx="true">{`
                .resale-ledger-view { padding: 32px; display: flex; flex-direction: column; gap: 32px; }
                .view-header { display: flex; justify-content: space-between; align-items: center; }
                .title-area { display: flex; align-items: center; gap: 16px; }
                .icon-badge { background: #E6F7EF; padding: 12px; border-radius: 12px; }
                
                .search-bar { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 10px; width: 320px; }
                .search-bar input { background: transparent; border: none; outline: none; font-size: 0.85rem; width: 100%; }

                .grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; }
                .stat-card { padding: 20px; border-radius: 16px; display: flex; flex-direction: column; gap: 4px; }
                .stat-card .lab { font-size: 0.75rem; color: #64748B; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; }
                .stat-card .val { font-size: 1.5rem; font-weight: 800; color: #1E293B; }

                .table-sleek { width: 100%; border-collapse: collapse; text-align: left; }
                .table-sleek th { padding: 16px 24px; font-size: 0.7rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; border-bottom: 1px solid rgba(0,0,0,0.05); }
                .table-sleek td { padding: 16px 24px; border-bottom: 1px solid rgba(0,0,0,0.02); }
                .row-hover:hover { background: rgba(45, 180, 109, 0.04); }

                .prod-cell { display: flex; flex-direction: column; }
                .user-cell { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; font-weight: 600; color: #475569; }
                .avatar-mini { width: 24px; height: 24px; border-radius: 6px; background: #E6F7EF; color: #10B981; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; font-weight: 800; }
                .avatar-mini.blue { background: #EFF6FF; color: #3B82F6; }

                .impact-tag { display: flex; align-items: center; gap: 6px; font-size: 0.75rem; font-weight: 700; color: #059669; background: #ECFDF5; padding: 4px 10px; border-radius: 100px; width: fit-content; }
            `}</style>
        </div>
    );
};

export default Resale;
