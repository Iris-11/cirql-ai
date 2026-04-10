import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shirt, 
  Search, 
  Filter, 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  History, 
  ArrowUpRight,
  MoreVertical,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/products');
      if (!response.ok) throw new Error('Failed to fetch product catalog');
      const data = await response.json();
      setProducts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const skuName = p.skus?.name?.toLowerCase() || '';
      const skuCode = p.skus?.sku_code?.toLowerCase() || '';
      const matchesSearch = skuName.includes(searchQuery.toLowerCase()) || skuCode.includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: products.length,
      active: products.filter(p => p.status === 'active').length,
      listed: products.filter(p => p.status === 'listed').length,
      dpp: products.filter(p => p.dpp_compliant).length
    };
  }, [products]);

  if (loading) return <div className="p-40 text-center color-slate-500">Loading Product Catalog...</div>;
  if (error) return <div className="p-40 text-center text-red-500">Error: {error}</div>;

  return (
    <div className="products-page">
      <header className="page-header">
        <div className="header-left">
          <Shirt className="text-emerald-500" size={32} />
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Product Portfolio</h1>
            <p className="text-slate-500 text-sm">Comprehensive catalog of all digital product passports</p>
          </div>
        </div>
        
        <div className="portfolio-stats">
          <div className="stat-pill">
            <span className="val">{stats.total}</span>
            <span className="lab">Total Passports</span>
          </div>
          <div className="stat-pill">
            <span className="val">{stats.active}</span>
            <span className="lab">Active</span>
          </div>
          <div className="stat-pill">
            <span className="val">{stats.dpp}</span>
            <span className="lab">EU DPP Ready</span>
          </div>
        </div>
      </header>

      <div className="controls-row card-glass">
        <div className="search-wrap">
          <Search size={18} className="text-slate-400" />
          <input 
            type="text" 
            placeholder="Search by product name or SKU code..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filters-wrap">
          <div className="filter-group">
            <Filter size={16} className="text-slate-400" />
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="listed">Listed</option>
              <option value="transferred">Transferred</option>
              <option value="recycled">Recycled</option>
            </select>
          </div>
        </div>
      </div>

      <div className="table-container card card-glass">
        <table className="products-table">
          <thead>
            <tr>
              <th>Product Information</th>
              <th>Status</th>
              <th>Brand</th>
              <th>Impact Score</th>
              <th>Owners</th>
              <th>DPP Compliance</th>
              <th>Created</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredProducts.map((product, i) => (
                <motion.tr 
                  key={product.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="product-row"
                >
                  <td className="product-cell">
                    <div className="sku-info">
                      <span className="sku-name">{product.skus?.name}</span>
                      <span className="sku-code">{product.skus?.sku_code}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`status-badge ${product.status}`}>
                      {product.status}
                    </span>
                  </td>
                  <td>
                    <span className={`brand-tag ${product.skus?.brands?.code?.toLowerCase()}`}>
                      {product.skus?.brands?.name}
                    </span>
                  </td>
                  <td>
                    <div className="score-wrap">
                      <div className="score-bar">
                        <div 
                          className="fill" 
                          style={{ 
                            width: `${product.sustainability_score}%`,
                            background: product.sustainability_score > 80 ? '#10B981' : '#F59E0B'
                          }} 
                        />
                      </div>
                      <span className="score-val">{product.sustainability_score}</span>
                    </div>
                  </td>
                  <td>
                    <div className="owner-badge">
                      <History size={12} />
                      <span>{product.ownership_count}</span>
                    </div>
                  </td>
                  <td>
                    {product.dpp_compliant ? (
                      <div className="compliance-tag pass">
                        <ShieldCheck size={14} />
                        <span>Ready</span>
                      </div>
                    ) : (
                      <div className="compliance-tag pending">
                        <AlertCircle size={14} />
                        <span>In Audit</span>
                      </div>
                    )}
                  </td>
                  <td className="date-cell">
                    {new Date(product.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn-action">
                      <ChevronRight size={18} />
                    </button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filteredProducts.length === 0 && (
          <div className="empty-results">
            <p>No products match your search or filter criteria.</p>
          </div>
        )}
      </div>

      <style jsx="true">{`
        .products-page {
          padding: 32px;
          max-width: 1600px;
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

        .portfolio-stats {
          display: flex;
          gap: 24px;
        }

        .stat-pill {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
        }

        .stat-pill .val {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1E293B;
        }

        .stat-pill .lab {
          font-size: 0.75rem;
          color: #64748B;
          font-weight: 500;
        }

        .controls-row {
          display: flex;
          justify-content: space-between;
          padding: 16px 24px;
          margin-bottom: 24px;
          border-radius: 12px;
        }

        .search-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          max-width: 500px;
        }

        .search-wrap input {
          border: none;
          background: transparent;
          width: 100%;
          font-size: 0.875rem;
          color: #1E293B;
          outline: none;
        }

        .filters-wrap {
          display: flex;
          gap: 16px;
        }

        .filter-group {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px;
          background: rgba(255, 255, 255, 0.5);
          border-radius: 6px;
          border: 1px solid #E2E8F0;
        }

        .filter-group select {
          border: none;
          background: transparent;
          font-size: 0.8125rem;
          font-weight: 600;
          color: #475569;
          outline: none;
          cursor: pointer;
        }

        .table-container {
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.04);
        }

        .products-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .products-table th {
          padding: 16px 24px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #94A3B8;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          border-bottom: 1px solid #F1F5F9;
        }

        .product-row {
          border-bottom: 1px solid #F8FAFC;
          transition: background 0.2s;
        }

        .product-row:hover {
          background: rgba(45, 180, 109, 0.02);
        }

        .product-row td {
          padding: 16px 24px;
          vertical-align: middle;
        }

        .sku-info {
          display: flex;
          flex-direction: column;
        }

        .sku-name {
          font-weight: 600;
          color: #1E293B;
          font-size: 0.875rem;
        }

        .sku-code {
          font-size: 0.75rem;
          color: #94A3B8;
        }

        .status-badge {
          padding: 4px 10px;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: capitalize;
        }

        .status-badge.active { background: #ECFDF5; color: #10B981; }
        .status-badge.listed { background: #EFF6FF; color: #3B82F6; }
        .status-badge.transferred { background: #FEF3C7; color: #D97706; }
        .status-badge.recycled { background: #F1F5F9; color: #64748B; }

        .brand-tag {
          font-size: 0.75rem;
          font-weight: 600;
          color: #475569;
          background: #F8FAFC;
          padding: 2px 8px;
          border-radius: 4px;
          border: 1px solid #E2E8F0;
        }

        .score-wrap {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 100px;
        }

        .score-bar {
          flex: 1;
          height: 6px;
          background: #E2E8F0;
          border-radius: 100px;
          overflow: hidden;
        }

        .score-bar .fill {
          height: 100%;
          border-radius: 100px;
        }

        .score-val {
          font-size: 0.8125rem;
          font-weight: 700;
          color: #1E293B;
          width: 24px;
        }

        .owner-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.8125rem;
          color: #64748B;
          font-weight: 500;
        }

        .compliance-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .compliance-tag.pass { color: #10B981; }
        .compliance-tag.pending { color: #F59E0B; }

        .date-cell {
          font-size: 0.8125rem;
          color: #94A3B8;
        }

        .btn-action {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          border: 1px solid #E2E8F0;
          background: white;
          color: #64748B;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-action:hover {
          border-color: #10B981;
          color: #10B981;
          background: #ECFDF5;
        }

        .empty-results {
          padding: 60px;
          text-align: center;
          color: #94A3B8;
        }
      `}</style>
    </div>
  );
};

export default Products;
