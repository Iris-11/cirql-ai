import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Leaf, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Calendar,
  Filter,
  BarChart3,
  Globe,
  ArrowRight,
  CheckCircle2,
  DollarSign,
  Smartphone
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';
import { 
  getDashboardStats, 
  resaleActivityData, 
  scoreDistribution,
  brandDistribution,
  lifecycleDataStats,
  rewardActivityData,
  Passports
} from '../data/mockData';

// Animation Variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
};

const itemVariants = {
  hidden: { opacity: 0, scale: 0.98, y: 10 },
  visible: { 
    opacity: 1, 
    scale: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] }
  }
};

// Sub-component: Metric Card (Sleek)
const MetricCard = ({ label, value, subtext, trend, isDown, color }) => (
  <motion.div 
    variants={itemVariants} 
    whileHover={{ y: -8, scale: 1.03, transition: { duration: 0.3, ease: "easeOut" } }}
    className="card card-glass metric-mini interactive-card"
  >
    <div className="metric-header">
      <span className="label-xs">{label}</span>
      <div className={`trend-mini ${isDown ? 'down' : 'up'}`}>
        {isDown ? <ArrowDownRight size={12} /> : <ArrowUpRight size={12} />}
      </div>
    </div>
    <div className="metric-body">
      <h3 className="value-md">{value}</h3>
      <p className="sub-xs">{subtext}</p>
    </div>
    <div className="card-shine" />
  </motion.div>
);

const Dashboard = () => {
  const stats = useMemo(() => getDashboardStats(), []);
  
  const handleDownloadReport = (type = 'full') => {
    const csvContent = [
      ['Digital Product Passport (DPP) - Executive Report'],
      ['Generated At', new Date().toLocaleString()],
      ['Compliance Rate', '98.4%'],
      ['Total DPP-Ready Passports', '1,284'],
      [''],
      ['Metric', 'Status', 'Verified By'],
      ['Material origin logged', 'Pass', 'AI Core'],
      ['Carbon footprint per SKU', 'Pass', 'AI Core'],
      ['Repairability score', 'Pass', 'AI Core'],
      ['End-of-life guidance', 'Pass', 'Manual Audit'],
      ['Ownership transfer records', 'Pass', 'Blockchain Node'],
      ['Recycler audit trail', 'Pending', 'Pending'],
    ].map(e => e.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `CIRQL_DPP_Report_${type === 'full' ? 'FULL' : 'QUICK'}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="dashboard-densities"
    >
      {/* 0. Top Navigation */}
      <motion.header variants={itemVariants} className="dashboard-header-sleek">
        <div className="header-titles">
          <h1 className="h-main">Brand Dashboard</h1>
          <p className="p-sub">Williams Sonoma — All brands overview</p>
        </div>
        <div className="header-actions">
          <div className="select-box glass">
            <span>Last 90 days</span>
            <ArrowRight size={14} className="rotate-90" />
          </div>
          <button 
            className="btn-brand-accent h-pop"
            onClick={() => handleDownloadReport('quick')}
          >
            Download EU DPP Report
          </button>
        </div>
      </motion.header>

      {/* 1. Metric Command Center (6 Units) */}
      <section className="grid-row-6">
        {stats.metrics.map(m => (
          <MetricCard key={m.id} {...m} />
        ))}
      </section>

      {/* 2. Primary Analytics Row */}
      <section className="grid-row-2-1">
        {/* Resale Activity Bar Chart */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -5, scale: 1.01 }}
          className="card card-glass p-24 interactive-card"
        >
          <div className="card-top">
            <h4 className="title-sm">Resale Activity — Last 90 Days</h4>
            <p className="label-xs opacity-60">Number of resale transactions per week</p>
          </div>
          <div className="chart-box mt-20">
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={resaleActivityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.03)" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748B' }} />
                <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                <Bar dataKey="value" fill="var(--color-brand-accent)" radius={[4, 4, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="card-shine" />
        </motion.div>

        {/* Sustainability Score Distribution */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -5, scale: 1.01 }}
          className="card card-glass p-24 interactive-card"
        >
          <div className="card-top">
            <h4 className="title-sm">Sustainability Score Distribution</h4>
            <p className="label-xs opacity-60">Products scored by AI engine across all brands</p>
          </div>
          <div className="dist-list mt-24">
            {scoreDistribution.map(item => (
              <div key={item.label} className="dist-item">
                <div className="dist-meta">
                  <span className="label-xs-bold">{item.label}</span>
                  <div className="flex-gap-8">
                    <span className="label-xs-bold emerald">{item.percentage}%</span>
                    <span className="label-xs opacity-40">{item.count} products</span>
                  </div>
                </div>
                <div className="progress-bg">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${item.percentage}%` }}
                    className="progress-bar"
                    style={{ background: item.color }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="card-shine" />
        </motion.div>
      </section>

      {/* 3. Operational & Compliance Row */}
      <section className="grid-row-2-1">
        {/* Passport Activity Table */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -5, scale: 1.01 }}
          className="card card-glass interactive-card overflow-hidden"
        >
          <div className="p-24 border-b">
            <h4 className="title-sm">Passport Activity</h4>
            <p className="label-xs opacity-60">Recent product passport events</p>
          </div>
          <table className="table-sleek">
            <thead>
              <tr>
                <th>Product</th>
                <th>Brand</th>
                <th>Event</th>
                <th>Owner</th>
                <th>Score</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {Passports.slice(0, 6).map((p, i) => (
                <tr key={p.id} className="row-hover">
                  <td className="font-semibold">{i % 2 === 0 ? 'Cast Iron Skillet' : 'Linen Sofa 2-Seat'}</td>
                  <td><span className={`brand-tag ${i % 3 === 0 ? 'ws' : i % 3 === 1 ? 'pb' : 'we'}`}>{i % 3 === 0 ? 'WS' : i % 3 === 1 ? 'PB' : 'WE'}</span></td>
                  <td><span className={`event-badge ${i % 2 === 0 ? 'resold' : 'claimed'}`}>{i % 2 === 0 ? 'Resold' : 'Claimed'}</span></td>
                  <td className="opacity-70">{i % 2 === 0 ? '2nd owner' : '1st owner'}</td>
                  <td className={`font-bold ${p.sustainability_score > 80 ? 'emerald' : 'gold'}`}>{p.sustainability_score}</td>
                  <td className="opacity-50 text-xs">Apr {6 - i}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="card-shine" />
        </motion.div>

        {/* EU DPP Compliance Status */}
        <motion.div 
          variants={itemVariants} 
          whileHover={{ y: -5, scale: 1.01 }}
          className="card card-glass p-24 interactive-card"
        >
          <div className="card-top">
            <h4 className="title-sm">EU DPP Compliance Status</h4>
            <p className="label-xs opacity-60">Ecodesign for Sustainable Products Regulation</p>
          </div>
          <div className="compliance-hero mt-20">
            <div className="comp-stat">
              <h2 className="emerald">1,284</h2>
              <p className="label-xs opacity-60">passports DPP-ready</p>
            </div>
            <div className="comp-stat text-right">
              <h2 className="emerald">98.4%</h2>
              <p className="label-xs opacity-60">compliance rate</p>
            </div>
          </div>
          <div className="checklist mt-20">
            {['Material origin logged', 'Carbon footprint per SKU', 'Repairability score', 'End-of-life guidance', 'Ownership transfer records'].map(item => (
              <div key={item} className="check-item">
                <span className="label-xs">{item}</span>
                <CheckCircle2 size={14} className="emerald" />
              </div>
            ))}
            <div className="check-item opacity-40">
              <span className="label-xs">Recycler audit trail</span>
              <span>—</span>
            </div>
          </div>
          <button 
            className="btn-outline-emerald mt-20 full-width h-pop"
            onClick={() => handleDownloadReport('full')}
          >
            Download Full EU DPP Report ↓
          </button>
          <div className="card-shine" />
        </motion.div>
      </section>

      {/* 4. Insight Bottom Tier (3 Units) */}
      <section className="grid-row-3">
        {/* Passports by Brand */}
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="card card-glass p-20 interactive-card">
          <h4 className="title-xs mb-16">Passports by Brand</h4>
          <div className="side-dist">
            {brandDistribution.map(b => (
              <div key={b.brand} className="side-row">
                <div className="side-label">
                  <span className="label-xs">{b.brand}</span>
                  <div className="flex-gap-8">
                    <span className="label-xs opacity-40">{b.count}</span>
                    <span className="label-xs-bold emerald">{b.percentage}%</span>
                  </div>
                </div>
                <div className="mini-progress"><div className="fill" style={{ width: `${b.percentage}%`, background: 'var(--color-brand-accent)' }} /></div>
              </div>
            ))}
          </div>
          <div className="card-shine" />
        </motion.div>

        {/* Products by Lifecycle Stage */}
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="card card-glass p-20 interactive-card">
          <h4 className="title-xs mb-16">Products by Lifecycle Stage</h4>
          <div className="side-dist">
            {lifecycleDataStats.map(l => (
              <div key={l.stage} className="side-row">
                <div className="side-label">
                  <span className="label-xs">{l.stage}</span>
                  <span className="label-xs opacity-40">{l.count} products</span>
                </div>
                <div className="mini-progress"><div className="fill" style={{ width: `${(l.count / 1284) * 100}%`, background: l.color }} /></div>
              </div>
            ))}
          </div>
          <div className="card-shine" />
        </motion.div>

        {/* Reward Activity */}
        <motion.div variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} className="card card-glass p-20 interactive-card">
          <h4 className="title-xs mb-16">Reward Activity</h4>
          <div className="metrics-list">
            {rewardActivityData.map(r => (
              <div key={r.label} className="list-item-row">
                <span className="label-xs opacity-60">{r.label}</span>
                <span className="label-xs-bold emerald">{r.value}</span>
              </div>
            ))}
          </div>
          <div className="card-shine" />
        </motion.div>
      </section>

      <style jsx="true">{`
        .dashboard-densities { display: flex; flex-direction: column; gap: 20px; padding: 10px 0 40px; }
        .dashboard-header-sleek { display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px; }
        .h-main { font-size: 1.5rem; font-weight: 700; margin: 0; color: #1E293B; }
        .p-sub { font-size: 0.85rem; color: #64748B; margin: 4px 0 0; }
        .header-actions { display: flex; gap: 12px; }
        .select-box { padding: 8px 16px; border-radius: 8px; font-size: 0.85rem; font-weight: 500; display: flex; align-items: center; gap: 10px; cursor: pointer; border: 1px solid rgba(0,0,0,0.05); }
        .btn-brand-accent { background: var(--color-brand-accent); color: white; border: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 0.85rem; cursor: pointer; transition: 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
        .h-pop:hover { transform: translateY(-4px) scale(1.05); box-shadow: var(--shadow-pop); }
        
        .grid-row-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 16px; }
        .metric-mini { padding: 16px; min-height: 100px; }
        .metric-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; }
        .label-xs { font-size: 0.75rem; color: #64748B; letter-spacing: -0.01em; }
        .trend-mini { padding: 2px; border-radius: 4px; }
        .trend-mini.up { color: var(--color-brand-accent); }
        .trend-mini.down { color: #EF4444; }
        .value-md { font-size: 1.5rem; font-weight: 700; margin: 0; color: #1E293B; }
        .sub-xs { font-size: 0.7rem; color: #94A3B8; margin: 4px 0 0; }

        .grid-row-2-1 { display: grid; grid-template-columns: 2fr 1fr; gap: 20px; }
        .grid-row-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
        .p-24 { padding: 24px; }
        .p-20 { padding: 20px; }
        .title-sm { font-size: 0.95rem; font-weight: 700; margin: 0; color: #1E293B; }
        .title-xs { font-size: 0.85rem; font-weight: 700; margin: 0; }
        
        .interactive-card { transition: all 0.4s cubic-bezier(0.22, 1, 0.36, 1); cursor: pointer; position: relative; overflow: hidden; }
        .interactive-card:hover { 
          border-color: var(--color-brand-accent); 
          box-shadow: var(--shadow-pop), var(--shadow-glow);
          background: rgba(255, 255, 255, 0.95);
          z-index: 10;
        }
        .interactive-card:hover .card-shine { opacity: 1; transform: translateX(150%); }

        .card-shine { 
          position: absolute; top: 0; left: -150%; width: 50%; height: 100%; 
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent); 
          transition: 0.7s; pointer-events: none; opacity: 0; 
        }

        .dist-list { display: flex; flex-direction: column; gap: 16px; }
        .dist-item { display: flex; flex-direction: column; gap: 8px; }
        .dist-meta { display: flex; justify-content: space-between; align-items: center; }
        .label-xs-bold { font-size: 0.75rem; font-weight: 700; color: #334155; }
        .progress-bg { height: 6px; background: rgba(0,0,0,0.04); border-radius: 100px; overflow: hidden; }
        .progress-bar { height: 100%; border-radius: 100px; }

        .table-sleek { width: 100%; border-collapse: collapse; text-align: left; }
        .table-sleek th { padding: 12px 24px; font-size: 0.7rem; font-weight: 700; color: #94A3B8; text-transform: uppercase; border-bottom: 1px solid rgba(0,0,0,0.04); }
        .table-sleek td { padding: 12px 24px; font-size: 0.8rem; border-bottom: 1px solid rgba(0,0,0,0.02); transition: 0.2s; }
        .row-hover:hover td { background: rgba(45, 180, 109, 0.04); color: var(--color-brand-primary); }
        .brand-tag { padding: 2px 6px; border-radius: 4px; font-size: 0.65rem; font-weight: 800; }
        .brand-tag.ws { background: #E6F7EF; color: #10B981; border: 1px solid rgba(16, 185, 129, 0.2); }
        .brand-tag.pb { background: #EFF6FF; color: #3B82F6; border: 1px solid rgba(59, 130, 246, 0.2); }
        .brand-tag.we { background: #FFF7ED; color: #F59E0B; border: 1px solid rgba(245, 158, 11, 0.2); }
        .event-badge { padding: 2px 8px; border-radius: 100px; font-size: 0.65rem; font-weight: 700; border: 1px solid transparent; }
        .event-badge.resold { background: #F1F5F9; color: #64748B; border-color: #E2E8F0; }
        .event-badge.claimed { background: #FEF3C7; color: #D97706; border-color: #FCD34D; }

        .compliance-hero { display: flex; justify-content: space-between; background: #E6F7EF; padding: 16px; border-radius: 10px; }
        .comp-stat h2 { margin: 0; font-size: 1.5rem; font-weight: 800; }
        .checklist { display: flex; flex-direction: column; gap: 12px; }
        .check-item { display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid rgba(0,0,0,0.02); padding-bottom: 8px; }
        .btn-outline-emerald { background: transparent; border: 1.5px solid var(--color-brand-accent); color: var(--color-brand-accent); padding: 10px; border-radius: 8px; font-weight: 700; font-size: 0.8rem; cursor: pointer; transition: 0.3s cubic-bezier(0.22, 1, 0.36, 1); }
        .btn-outline-emerald:hover { background: var(--color-brand-accent); color: white; }

        .side-dist { display: flex; flex-direction: column; gap: 12px; }
        .side-row { display: flex; flex-direction: column; gap: 6px; }
        .side-label { display: flex; justify-content: space-between; align-items: center; }
        .mini-progress { height: 4px; background: rgba(0,0,0,0.03); border-radius: 100px; }
        .mini-progress .fill { height: 100%; border-radius: 100px; }

        .list-item-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid rgba(0,0,0,0.02); }
        
        .emerald { color: var(--color-brand-accent); }
        .gold { color: #B4942D; }
        .rotate-90 { transform: rotate(90deg); }
        .flex-gap-8 { display: flex; gap: 8px; align-items: center; }
        .full-width { width: 100%; }
        .mt-20 { margin-top: 20px; }
        .mt-24 { margin-top: 24px; }
        .mb-16 { margin-bottom: 16px; }
        
        @media (max-width: 1400px) {
          .grid-row-6 { grid-template-columns: repeat(3, 1fr); }
          .grid-row-2-1, .grid-row-3 { grid-template-columns: 1fr; }
        }
      `}</style>
    </motion.div>
  );
};

export default Dashboard;
