
import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { FileText, Settings } from 'lucide-react';
import { useCompanyData } from '../hooks/useCompanyData';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const { companyData } = useCompanyData();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="layout">
      <header className="top-navbar">
        <div className="logo-container">
          {companyData.logoUrl && (
            <img src={companyData.logoUrl} alt="Logo" className="nav-logo-img" />
          )}
          <div className="logo-content">
            <div className="logo-text">DLKom</div>
            <div className="logo-subtext">Proyectos</div>
          </div>
        </div>

        <nav className="nav-menu">
          <Link to="/budgets" className={`nav-item ${isActive('/budgets') ? 'active' : ''}`}>
            <FileText size={20} />
            <span>Proyectos</span>
          </Link>
          <Link to="/settings" className={`nav-item ${isActive('/settings') ? 'active' : ''}`}>
            <Settings size={20} />
            <span>Configuración</span>
          </Link>
        </nav>
      </header>

      <main className="content">
        <div className="page-content">
          <Outlet />
        </div>
      </main>

      <style>{`
        .layout {
          display: flex;
          flex-direction: column;
          width: 100%;
          min-height: 100vh;
          background-color: #f9fafb;
        }

        .top-navbar {
          background-color: white;
          border-bottom: 1px solid #e5e7eb;
          display: flex;
          align-items: center;
          justify-content: center; /* Centering for desktop */
          padding: 0 40px;
          height: 70px;
          position: sticky;
          top: 0;
          z-index: 100;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          gap: 60px; /* Space between logo and menu */
        }

        .logo-container {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .nav-logo-img {
          height: 45px;
          width: auto;
          object-fit: contain;
        }

        .logo-content {
          display: flex;
          flex-direction: column;
        }

        .logo-text {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--primary-color);
          line-height: 1;
        }

        .logo-subtext {
          font-size: 0.7rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 2px;
          font-weight: 600;
        }

        .nav-menu {
          display: flex;
          gap: 24px;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 20px;
          border-radius: 10px;
          color: #64748b;
          text-decoration: none;
          font-size: 0.95rem;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .nav-item:hover {
          background-color: #f1f5f9;
          color: var(--primary-color);
          transform: translateY(-1px);
        }

        .nav-item.active {
          background-color: #eff6ff;
          color: var(--primary-color);
          box-shadow: 0 2px 4px rgba(37, 99, 235, 0.1);
        }

        .content {
          flex: 1;
          display: flex;
          flex-direction: column;
        }

        .page-content {
          padding: 32px;
          max-width: 1200px;
          margin: 0 auto;
          width: 100%;
        }

        @media (max-width: 768px) {
          .top-navbar {
            padding: 16px;
            height: auto;
            flex-direction: column;
            gap: 16px;
            justify-content: center;
          }
          
          .nav-menu {
            width: 100%;
            gap: 8px;
          }

          .nav-item {
            flex: 1;
            justify-content: center;
            padding: 12px 8px;
            font-size: 0.85rem;
          }

          .page-content {
            padding: 16px;
          }
        }
      `}</style>
    </div>
  );
};

export default AppLayout;
