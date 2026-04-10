import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  XCircle, 
  User, 
  MapPin, 
  Mail,
  Camera,
  Image as ImageIcon,
  Clock,
  ArrowRight
} from 'lucide-react';

const Approvals = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  useEffect(() => {
    fetchPendingApprovals();
  }, []);

  const fetchPendingApprovals = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/listing/pending-approvals');
      if (!response.ok) throw new Error('Failed to fetch pending approvals');
      const data = await response.json();
      setListings(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id, action) => {
    setProcessingId(id);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/listing/${id}/${action}`, {
        method: 'PATCH',
      });
      if (!response.ok) throw new Error(`Failed to ${action} listing`);
      
      // Remove from list
      setListings(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      alert(err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const getSeverity = (e1) => {
    if (!e1) return 'info';
    if (e1.authenticity_score < 0.6 || e1.missing_angles?.length > 0) return 'critical';
    if (e1.authenticity_score < 0.85 || e1.flags?.length > 1) return 'warning';
    return 'info';
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) return <div className="p-40 text-center color-slate-500">Loading pending approvals...</div>;
  if (error) return <div className="p-40 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="approvals-page">
      <header className="page-header">
        <div className="header-left">
          <ShieldCheck className="text-emerald-500" size={28} />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Review Approvals</h1>
            <p className="text-slate-500 text-sm">Flagged listings requiring manual verification</p>
          </div>
        </div>
        <div className="stats-badge">
          <span className="count">{listings.length}</span>
          <span className="label">Pending</span>
        </div>
      </header>

      {listings.length === 0 ? (
        <div className="empty-state">
          <CheckCircle2 size={48} className="text-emerald-500 mb-16" />
          <h3>All Clear!</h3>
          <p>There are no listings pending approval at this time.</p>
        </div>
      ) : (
        <motion.div 
          className="approvals-grid"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {listings.map(listing => (
              <ApprovalCard 
                key={listing.id} 
                listing={listing} 
                severity={getSeverity(listing.e1_result)}
                onAction={handleAction}
                isProcessing={processingId === listing.id}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      <style jsx="true">{`
        .approvals-page {
          padding: 32px;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
        }

        .header-left {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stats-badge {
          background: white;
          padding: 8px 16px;
          border-radius: 100px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .stats-badge .count {
          font-weight: 700;
          color: var(--color-brand-primary);
        }

        .stats-badge .label {
          font-size: 0.8125rem;
          color: #64748B;
        }

        .approvals-grid {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .empty-state {
          text-align: center;
          padding: 80px 0;
          background: white;
          border-radius: 16px;
          border: 2px dashed #E2E8F0;
        }

        .empty-state h3 {
          font-size: 1.25rem;
          font-weight: 600;
          color: #1E293B;
          margin-bottom: 8px;
        }
      `}</style>
    </div>
  );
};

const ApprovalCard = ({ listing, severity, onAction, isProcessing }) => {
  const { passports, customers, photo_urls, e1_result, e2_result, created_at, confidence_score } = listing;
  const product = passports?.skus;
  const brand = product?.brands;

  const daysPending = Math.floor((new Date() - new Date(created_at)) / (1000 * 60 * 60 * 24));

  const severityConfig = {
    critical: { icon: AlertTriangle, color: '#EF4444', bg: '#FEF2F2', label: 'CRITICAL' },
    warning: { icon: AlertTriangle, color: '#F59E0B', bg: '#FFFBEB', label: 'WARNING' },
    info: { icon: Info, color: '#3B82F6', bg: '#EFF6FF', label: 'INFO' }
  };

  const config = severityConfig[severity];

  return (
    <motion.div 
      layout
      variants={{ hidden: { opacity: 0, scale: 0.95 }, visible: { opacity: 1, scale: 1 } }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
      className="approval-card"
    >
      <div className="card-side-info" style={{ backgroundColor: config.color }}>
        <config.icon size={20} color="white" />
        <span className="severity-text">{config.label}</span>
      </div>

      <div className="card-main-content">
        {/* Header Section */}
        <div className="card-section header-section">
          <div className="product-title">
            <h2>{product?.name || 'Unknown Product'}</h2>
            <span className="brand-tag">{brand?.name || 'General'}</span>
          </div>
          <div className="pending-timer">
            <Clock size={14} />
            <span>{daysPending > 0 ? `${daysPending} days pending` : 'Submitted today'}</span>
          </div>
        </div>

        {/* Photos Section */}
        <div className="card-section photos-section">
          <div className="photo-column">
            <div className="label-group">
              <Camera size={14} />
              <label>Submitted Photos</label>
            </div>
            <div className="photo-grid">
              {photo_urls?.slice(0, 4).map((url, i) => (
                <div key={i} className="photo-wrap">
                  <img src={url} alt={`Submitted ${i}`} />
                </div>
              ))}
            </div>
          </div>
          <div className="photo-divider">
            <ArrowRight size={20} className="text-slate-300" />
          </div>
          <div className="photo-column">
            <div className="label-group">
              <ImageIcon size={14} />
              <label>Reference Standard</label>
            </div>
            <div className="photo-grid">
              {product?.reference_images && Object.values(product.reference_images).slice(0, 4).map((url, i) => (
                <div key={i} className="photo-wrap reference">
                  <img src={url} alt={`Reference ${i}`} />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Results Section */}
        <div className="results-grid">
          <div className="result-panel e1-panel">
            <h3>E1: Authenticity & Flags</h3>
            <div className="score-row">
              <div className="score-value">
                <span className="val">{Math.round((e1_result?.authenticity_score || 0) * 100)}%</span>
                <span className="lab">Authenticity</span>
              </div>
              <div className="score-value">
                <span className="val">{Math.round((confidence_score || 0) * 100)}%</span>
                <span className="lab">Confidence</span>
              </div>
            </div>
            <div className="flags-list">
              {e1_result?.flags?.length > 0 ? (
                e1_result.flags.map((flag, i) => (
                  <div key={i} className={`flag-item ${severity}`}>
                    <AlertTriangle size={12} />
                    <span>{flag}</span>
                  </div>
                ))
              ) : (
                <div className="flag-item success">
                  <CheckCircle2 size={12} />
                  <span>No flags detected</span>
                </div>
              )}
              {e1_result?.missing_angles?.map((angle, i) => (
                <div key={`m-${i}`} className="flag-item critical">
                  <XCircle size={12} />
                  <span>Missing angle: {angle}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="result-panel e2-panel">
            <h3>E2: Condition Analysis</h3>
            <div className="tier-badge" data-tier={e2_result?.tier}>
              {e2_result?.tier || 'Unscored'}
            </div>
            <p className="report-text">{e2_result?.report_text}</p>
            <div className="price-tag">
              <label>Suggested Price</label>
              <div className="val">{e2_result?.suggested_price ? `$${e2_result.suggested_price}` : 'N/A'}</div>
            </div>
          </div>

          <div className="result-panel seller-panel">
            <h3>Seller Information</h3>
            <div className="seller-card">
              <div className="seller-row">
                <User size={14} />
                <span>{customers?.name}</span>
              </div>
              <div className="seller-row">
                <MapPin size={14} />
                <span>{customers?.city || 'Location unknown'}</span>
              </div>
              <div className="seller-row">
                <Mail size={14} />
                <span className="email">{customers?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="card-footer">
          <button 
            className="btn btn-reject"
            onClick={() => onAction(listing.id, 'reject')}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing' : 'Reject Listing'}
          </button>
          <button 
            className="btn btn-approve"
            onClick={() => onAction(listing.id, 'approve')}
            disabled={isProcessing}
          >
            {isProcessing ? 'Processing' : 'Approve & Release'}
          </button>
        </div>
      </div>

      <style jsx="true">{`
        .approval-card {
          background: white;
          border-radius: 16px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.06);
          border: 1px solid #F1F5F9;
        }

        .card-side-info {
          width: 48px;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 24px;
          gap: 20px;
        }

        .severity-text {
          writing-mode: vertical-rl;
          transform: rotate(180deg);
          color: white;
          font-weight: 800;
          font-size: 0.65rem;
          letter-spacing: 0.1em;
        }

        .card-main-content {
          flex: 1;
          padding: 24px;
        }

        .card-section {
          margin-bottom: 24px;
        }

        .header-section {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .product-title h2 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1E293B;
          margin-bottom: 4px;
        }

        .brand-tag {
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--color-brand-primary);
          background: rgba(45, 180, 109, 0.1);
          padding: 2px 8px;
          border-radius: 4px;
        }

        .pending-timer {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          color: #94A3B8;
          font-weight: 500;
        }

        .photos-section {
          display: flex;
          gap: 20px;
          align-items: center;
          background: #F8FAFC;
          padding: 16px;
          border-radius: 12px;
        }

        .photo-column {
          flex: 1;
        }

        .label-group {
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          color: #64748B;
        }

        .label-group label {
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .photo-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 8px;
        }

        .photo-wrap {
          aspect-ratio: 1;
          border-radius: 6px;
          overflow: hidden;
          background: #E2E8F0;
          border: 1px solid #E2E8F0;
        }

        .photo-wrap img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .photo-wrap.reference {
          border-color: #CBD5E1;
        }

        .results-grid {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 24px;
          margin-bottom: 32px;
        }

        .result-panel h3 {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 16px;
        }

        .score-row {
          display: flex;
          gap: 24px;
          margin-bottom: 16px;
        }

        .score-value {
          display: flex;
          flex-direction: column;
        }

        .score-value .val {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1E293B;
        }

        .score-value .lab {
          font-size: 0.65rem;
          color: #64748B;
          font-weight: 600;
        }

        .flags-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .flag-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 6px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .flag-item.critical { background: #FEF2F2; color: #EF4444; }
        .flag-item.warning { background: #FFFBEB; color: #F59E0B; }
        .flag-item.info { background: #EFF6FF; color: #3B82F6; }
        .flag-item.success { background: #F0FDF4; color: #22C55E; }

        .tier-badge {
          display: inline-block;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 700;
          margin-bottom: 12px;
        }

        .tier-badge[data-tier="Excellent"] { background: #F0FDF4; color: #22C55E; }
        .tier-badge[data-tier="Good"] { background: #F0F9FF; color: #0EA5E9; }
        .tier-badge[data-tier="Fair"] { background: #FFFBEB; color: #F59E0B; }

        .report-text {
          font-size: 0.8125rem;
          line-height: 1.5;
          color: #475569;
          margin-bottom: 16px;
        }

        .price-tag label {
          font-size: 0.65rem;
          font-weight: 600;
          color: #94A3B8;
        }

        .price-tag .val {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1E293B;
        }

        .seller-card {
          background: #F8FAFC;
          padding: 16px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .seller-row {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 0.8125rem;
          color: #475569;
          font-weight: 500;
        }

        .seller-row .email {
          color: #64748B;
          font-size: 0.75rem;
        }

        .card-footer {
          display: flex;
          justify-content: flex-end;
          gap: 12px;
          padding-top: 24px;
          border-top: 1px solid #F1F5F9;
        }

        .btn {
          padding: 10px 24px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          transition: all 0.2s;
          cursor: pointer;
        }

        .btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .btn-reject {
          background: white;
          border: 1px solid #E2E8F0;
          color: #64748B;
        }

        .btn-reject:hover:not(:disabled) {
          background: #FEF2F2;
          border-color: #F87171;
          color: #EF4444;
        }

        .btn-approve {
          background: var(--color-brand-primary);
          border: 1px solid var(--color-brand-primary);
          color: white;
          box-shadow: 0 4px 12px rgba(45, 180, 109, 0.2);
        }

        .btn-approve:hover:not(:disabled) {
          background: #25965A;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(45, 180, 109, 0.3);
        }
      `}</style>
    </motion.div>
  );
};

export default Approvals;
