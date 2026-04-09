import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        {children}
      </main>

      <style jsx="true">{`
        .app-container {
          display: flex;
          min-height: 100vh;
          background-color: var(--color-background);
        }

        .main-content {
          flex: 1;
          margin-left: 260px;
          padding: 32px;
        }

        @media (max-width: 1024px) {
          .main-content {
            margin-left: 0;
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Layout;
