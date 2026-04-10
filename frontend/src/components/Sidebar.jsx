import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Shirt, 
  FileText, 
  Repeat, 
  Recycle, 
  Users, 
  BarChart3, 
  Settings,
  Circle,
  ShieldCheck
} from 'lucide-react';

const Sidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
    { name: 'Approvals', icon: ShieldCheck, path: '/approvals' },
    { name: 'Products', icon: Shirt, path: '/products' },
    { name: 'Passports', icon: FileText, path: '/passports' },
    { name: 'Resale', icon: Repeat, path: '/resale' },
    { name: 'Recycling', icon: Recycle, path: '/recycling' },
    { name: 'Customers', icon: Users, path: '/customers' },
    { name: 'ESG Reports', icon: BarChart3, path: '/reports' },
    { name: 'Settings', icon: Settings, path: '/settings' },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="logo-container">
          <div className="logo-icon">
            {/* Simple representation of the CIRQL logo from image */}
            <div className="circles">
              <Circle className="outer" size={32} />
              <Circle className="inner" size={16} />
              <div className="dollar">$</div>
            </div>
          </div>
          <div className="logo-text">
            <span className="brand-name">CIRQL</span>
            <span className="brand-sub">Brand Portal</span>
          </div>
        </div>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink 
            key={item.name}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <item.icon size={20} className="nav-icon" />
            <span className="nav-label">{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="user-profile">
          <div className="user-avatar">WS</div>
          <div className="user-info">
            <span className="user-name">Williams Sonoma</span>
            <span className="user-role">Brand Admin</span>
          </div>
        </div>
      </div>

      <style jsx="true">{`
        .sidebar {
          width: 260px;
          height: 100vh;
          background-color: var(--color-brand-primary);
          color: white;
          display: flex;
          flex-direction: column;
          padding: 24px 0;
          position: fixed;
          left: 0;
          top: 0;
          z-index: 100;
        }

        .sidebar-header {
          padding: 0 24px 32px;
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .circles {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2DB46D;
        }

        .dollar {
          position: absolute;
          font-weight: 800;
          font-size: 14px;
        }

        .logo-text {
          display: flex;
          flex-direction: column;
        }

        .brand-name {
          font-size: 1.25rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .brand-sub {
          font-size: 0.75rem;
          opacity: 0.6;
        }

        .sidebar-nav {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 24px;
          color: rgba(255, 255, 255, 0.6);
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: var(--transition-fast);
          border-left: 3px solid transparent;
        }

        .nav-item:hover {
          color: white;
          background: rgba(255, 255, 255, 0.05);
        }

        .nav-item.active {
          color: white;
          background: rgba(255, 255, 255, 0.1);
          border-left-color: #2DB46D;
        }

        .nav-icon {
          opacity: 0.8;
        }

        .sidebar-footer {
          padding: 24px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .user-profile {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          padding: 12px;
          border-radius: var(--radius-md);
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: #2DB46D;
          border-radius: var(--radius-sm);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 0.75rem;
        }

        .user-info {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.8125rem;
          font-weight: 600;
        }

        .user-role {
          font-size: 0.75rem;
          opacity: 0.6;
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
