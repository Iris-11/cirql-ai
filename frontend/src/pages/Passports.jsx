import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FileText, 
  Search, 
  Filter, 
  X, 
  ChevronRight, 
  CheckCircle2,
  Clock,
  Globe, 
  ShieldCheck, 
  History, 
  User, 
  Calendar,
  ExternalLink,
  QrCode,
  MapPin,
  TrendingUp,
  BarChart3
} from 'lucide-react';

// Side Drawer Component
const PassportDrawer = ({ passport, isOpen, onClose }) => {
    if (!passport) return null;

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="drawer-overlay"
                    />
                )}
            </AnimatePresence>

            <motion.div
                initial={{ x: '100%' }}
                animate={{ x: isOpen ? 0 : '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="drawer-content"
            >
                <div className="drawer-header">
                    <div className="header-titles">
                        <h2 className="text-xl font-bold text-slate-800">Passport Inspection</h2>
                        <p className="text-slate-500 text-xs">ID: {passport.id}</p>
                    </div>
                    <button onClick={onClose} className="btn-close">
                        <X size={20} />
                    </button>
                </div>

                <div className="drawer-body">
                    {/* 1. Identity & Visuals */}
                    <div className="drawer-section">
                        <div className="product-hero card-glass">
                            <div className="hero-img">
                                <img src={passport.skus?.reference_images?.front || 'https://placehold.co/400x300?text=Product+Image'} alt="Product" />
                            </div>
                            <div className="hero-details">
                                <span className={`brand-tag ${passport.skus?.brands?.code?.toLowerCase()}`}>{passport.skus?.brands?.name}</span>
                                <h3 className="text-lg font-bold mt-4">{passport.skus?.name}</h3>
                                <p className="text-sm text-slate-500">SKU: {passport.skus?.sku_code}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Operational Metrics */}
                    <div className="drawer-section grid-2">
                        <div className="mini-stat card-glass">
                            <span className="lab">Condition Tier</span>
                            <span className="val text-emerald-600">{passport.condition_tier || 'Excellent'}</span>
                        </div>
                        <div className="mini-stat card-glass">
                            <span className="lab">Sustainability Score</span>
                            <div className="flex-gap-8 mt-4">
                                <span className="val-lg">{passport.sustainability_score}</span>
                                <span className="text-xs text-slate-400">/ 100</span>
                            </div>
                        </div>
                    </div>

                    {/* 3. Passport Metadata */}
                    <div className="drawer-section">
                        <h4 className="section-title">Ownership & History</h4>
                        <div className="metadata-table card-glass">
                            <div className="meta-row">
                                <div className="meta-left">
                                    <User size={14} className="text-slate-400" />
                                    <span>Current Owner</span>
                                </div>
                                <span className="meta-val">{passport.customers?.name || '1st Owner'}</span>
                            </div>
                            <div className="meta-row">
                                <div className="meta-left">
                                    <History size={14} className="text-slate-400" />
                                    <span>Ownership Count</span>
                                </div>
                                <span className="meta-val">{passport.ownership_count} transfers</span>
                            </div>
                            <div className="meta-row">
                                <div className="meta-left">
                                    <Calendar size={14} className="text-slate-400" />
                                    <span>Created At</span>
                                </div>
                                <span className="meta-val">{new Date(passport.created_at).toLocaleDateString()}</span>
                            </div>
                        </div>
                    </div>

                    {/* 4. EU DPP Compliance status */}
                    <div className="drawer-section">
                        <h4 className="section-title">Compliance Audit</h4>
                        <div className={`compliance-status card-glass ${passport.dpp_compliant ? 'pass' : 'pending'}`}>
                            <div className="comp-left">
                                <ShieldCheck size={24} />
                                <div>
                                    <p className="font-bold">EU DPP Ready</p>
                                    <p className="text-xs opacity-80">Ecodesign for Sustainable Products Regulation</p>
                                </div>
                            </div>
                            {passport.dpp_compliant && <span className="badge-pass">Verified</span>}
                        </div>
                    </div>

                    {/* 5. QR & Direct Access */}
                    <div className="drawer-section">
                        <div className="qr-container card-glass">
                            <div className="qr-box">
                                <QrCode size={120} className="text-slate-800" />
                            </div>
                            <div className="qr-info">
                                <p className="font-semibold text-sm">Public Passport Access</p>
                                <p className="text-xs text-slate-500 mb-8">Scan to verify authenticity of circular assets.</p>
                                <button className="btn-outline-emerald text-xs py-4 px-8">Download PDF Passport</button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.div>

            <style jsx="true">{`
                .drawer-overlay {
                    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
                    background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
                    z-index: 1000;
                }
                .drawer-content {
                    position: fixed; top: 0; right: 0; bottom: 0;
                    width: 500px; background: #F8FAFC;
                    box-shadow: -10px 0 40px rgba(0,0,0,0.1);
                    z-index: 1001; display: flex; flex-direction: column;
                }
                .drawer-header {
                    padding: 24px; display: flex; justify-content: space-between; align-items: flex-start;
                    border-bottom: 1px solid #E2E8F0; background: white;
                }
                .btn-close {
                    background: #F1F5F9; border: none; padding: 8px; border-radius: 8px;
                    cursor: pointer; color: #64748B; transition: 0.2s;
                }
                .btn-close:hover { background: #E2E8F0; color: #1E293B; }
                
                .drawer-body { flex: 1; overflow-y: auto; padding: 24px; display: flex; flex-direction: column; gap: 24px; }
                .section-title { font-size: 0.75rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; }
                
                .product-hero { display: flex; gap: 20px; padding: 16px; border-radius: 12px; align-items: center; }
                .hero-img { width: 100px; height: 100px; border-radius: 8px; overflow: hidden; background: white; border: 1px solid #E2E8F0; flex-shrink: 0; }
                .hero-img img { width: 100%; height: 100%; object-fit: cover; }
                
                .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
                .mini-stat { padding: 16px; border-radius: 12px; display: flex; flex-direction: column; }
                .mini-stat .lab { font-size: 0.7rem; color: #64748B; font-weight: 600; }
                .mini-stat .val { font-size: 1.1rem; font-weight: 700; margin-top: 4px; }
                .mini-stat .val-lg { font-size: 2rem; font-weight: 800; color: #1E293B; }

                .metadata-table { border-radius: 12px; overflow: hidden; }
                .meta-row { display: flex; justify-content: space-between; padding: 12px 16px; border-bottom: 1px solid rgba(0,0,0,0.03); }
                .meta-row:last-child { border-bottom: none; }
                .meta-left { display: flex; align-items: center; gap: 10px; font-size: 0.85rem; color: #64748B; }
                .meta-val { font-size: 0.85rem; font-weight: 600; color: #1E293B; }

                .compliance-status { padding: 20px; border-radius: 12px; display: flex; justify-content: space-between; align-items: center; }
                .compliance-status.pass { background: #E6F7EF; color: #10B981; border: 1.5px solid rgba(16, 185, 129, 0.2); }
                .compliance-status.pending { background: #FFF7ED; color: #F59E0B; border: 1.5px solid rgba(245, 158, 11, 0.2); }
                .comp-left { display: flex; align-items: center; gap: 12px; }
                .badge-pass { background: #10B981; color: white; font-size: 0.65rem; font-weight: 800; padding: 2px 8px; border-radius: 4px; text-transform: uppercase; }

                .qr-container { padding: 20px; border-radius: 12px; display: flex; gap: 24px; align-items: center; }
                .qr-box { padding: 12px; background: white; border-radius: 8px; border: 1.5px solid #E2E8F0; }
                .qr-info { flex: 1; }
            `}</style>
        </>
    );
};

const Passports = () => {
    const [passports, setPassports] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedPassport, setSelectedPassport] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('http://localhost:8000/api/v1/passports');
                if (!res.ok) throw new Error('Failed to fetch passports');
                const data = await res.json();
                setPassports(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredPassports = useMemo(() => {
        return passports.filter(p => 
            p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.skus?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.status.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [passports, searchTerm]);

    if (loading) return <div className="p-40 text-center opacity-60">Initializing Passport Registry...</div>;
    if (error) return <div className="p-40 text-center text-red-500">Registry Error: {error}</div>;

    return (
        <div className="passports-view">
            <header className="view-header">
                <div className="title-area">
                    <div className="icon-badge">
                        <FileText size={24} className="text-emerald-500" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">Passport Registry</h1>
                        <p className="text-slate-500 text-sm">Managing {passports.length} unique digital product twins</p>
                    </div>
                </div>
                
                <div className="header-actions">
                    <div className="search-bar card-glass">
                        <Search size={18} className="text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Passport ID or Product..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>
            </header>

            <div className="registry-table card card-glass overflow-hidden">
                <table className="table-sleek">
                    <thead>
                        <tr>
                            <th>Passport ID</th>
                            <th>Product</th>
                            <th>Status</th>
                            <th>Score</th>
                            <th>Owners</th>
                            <th>Compliant</th>
                            <th></th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredPassports.map((p) => (
                            <tr 
                                key={p.id} 
                                className="row-hover cursor-pointer"
                                onClick={() => setSelectedPassport(p)}
                            >
                                <td className="font-mono text-xs opacity-60">{p.id.split('-')[0]}...</td>
                                <td>
                                    <div className="prod-cell">
                                        <span className="font-bold text-slate-700">{p.skus?.name}</span>
                                        <span className="text-xs opacity-50">{p.skus?.brands?.name}</span>
                                    </div>
                                </td>
                                <td>
                                    <span className={`status-badge ${p.status}`}>{p.status}</span>
                                </td>
                                <td>
                                    <div className="flex-gap-8">
                                        <div className="mini-score-bar">
                                            <div className="fill" style={{ width: `${p.sustainability_score}%`, background: p.sustainability_score > 80 ? '#10B981' : '#F59E0B' }} />
                                        </div>
                                        <span className="text-xs font-bold">{p.sustainability_score}</span>
                                    </div>
                                </td>
                                <td className="text-sm font-semibold">{p.ownership_count}x</td>
                                <td>
                                    {p.dpp_compliant ? 
                                        <CheckCircle2 size={16} className="text-emerald-500" /> : 
                                        <Clock size={16} className="text-slate-300" />
                                    }
                                </td>
                                <td>
                                    <ChevronRight size={18} className="text-slate-300" />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <PassportDrawer 
                passport={selectedPassport} 
                isOpen={!!selectedPassport} 
                onClose={() => setSelectedPassport(null)} 
            />

            <style jsx="true">{`
                .passports-view { padding: 32px; display: flex; flex-direction: column; gap: 32px; }
                .view-header { display: flex; justify-content: space-between; align-items: center; }
                .title-area { display: flex; align-items: center; gap: 16px; }
                .icon-badge { background: #E6F7EF; padding: 12px; border-radius: 12px; }
                
                .search-bar { display: flex; align-items: center; gap: 12px; padding: 10px 16px; border-radius: 10px; width: 320px; }
                .search-bar input { background: transparent; border: none; outline: none; font-size: 0.85rem; width: 100%; }

                .table-sleek { width: 100%; border-collapse: collapse; text-align: left; }
                .table-sleek th { padding: 16px 24px; font-size: 0.7rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; border-bottom: 1px solid rgba(0,0,0,0.05); }
                .table-sleek td { padding: 16px 24px; border-bottom: 1px solid rgba(0,0,0,0.02); }
                .row-hover:hover { background: rgba(45, 180, 109, 0.04); }

                .prod-cell { display: flex; flex-direction: column; }
                .status-badge { padding: 4px 10px; border-radius: 100px; font-size: 0.65rem; font-weight: 700; text-transform: capitalize; }
                .status-badge.active { background: #E6F7EF; color: #10B981; }
                .status-badge.transferred { background: #EFF6FF; color: #3B82F6; }
                .status-badge.listed { background: #FEF3C7; color: #D97706; }
                .status-badge.recycled { background: #F1F5F9; color: #64748B; }

                .mini-score-bar { width: 60px; height: 4px; background: rgba(0,0,0,0.05); border-radius: 4px; overflow: hidden; }
                .mini-score-bar .fill { height: 100%; }

                .btn-outline-emerald {
                    background: transparent; border: 1.5px solid #10B981; color: #10B981;
                    font-weight: 700; border-radius: 6px; cursor: pointer; transition: 0.2s;
                }
                .btn-outline-emerald:hover { background: #10B981; color: white; }
                .flex-gap-8 { display: flex; gap: 8px; align-items: center; }
            `}</style>
        </div>
    );
};

export default Passports;
