
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, FileText, Trash2 } from 'lucide-react';
import { budgetService } from '../services/budgetService';
import type { Budget } from '../types';

const BudgetList: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBudgets();
  }, []);

  const loadBudgets = async () => {
    const data = await budgetService.getAll();
    setBudgets(data);
    setLoading(false);
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('¿Estás seguro de que quieres eliminar este proyecto?')) {
      await budgetService.delete(id);
      loadBudgets();
    }
  };

  const filteredBudgets = budgets.filter(b =>
    (b.clientData?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (b.number || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="budget-list-container">
      <div className="list-header">
        <div className="search-bar">
          <input
            placeholder="Buscar por cliente o número..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
          <Search className="search-icon" size={20} />
        </div>
        <Link to="/budgets/new" className="btn-primary">
          <Plus size={20} /> Nuevo
        </Link>
      </div>

      {loading ? (
        <div className="loading">Cargando proyectos...</div>
      ) : filteredBudgets.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} color="#9ca3af" />
          <p>No hay proyectos guardados</p>
          <Link to="/budgets/new" className="btn-secondary">Crear el primero</Link>
        </div>
      ) : (
        <div className="budgets-grid">
          {filteredBudgets.map(budget => (
            <Link to={`/budgets/${budget.id}`} key={budget.id} className="budget-card">
              <div className="card-header" style={{ justifyContent: 'flex-end' }}>
                <span className={`status-badge ${budget.status}`}>
                  {budget.status === 'draft' ? 'Borrador' :
                    budget.status === 'pending' ? 'Pendiente' :
                      budget.status === 'accepted' ? 'Aceptado' : 'Rechazado'}
                </span>
              </div>
              <div className="card-body">
                <div className="project-client-info">
                  <span className="budget-number">{budget.number || 'Borrador'}</span>
                  <h3>{budget.clientData?.name || 'Sin Cliente'}</h3>
                </div>
                <p>{new Date(budget.date).toLocaleDateString()}</p>
                <div className="total-badge">
                  {budget.total.toFixed(2)} €
                </div>
              </div>
              <div className="card-actions">
                <button
                  className="icon-btn delete-btn"
                  onClick={(e) => handleDelete(e, budget.id)}
                  title="Eliminar"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}

      <style>{`
        .budget-list-container {
          max-width: 1200px;
          margin: 0 auto;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 16px;
        }

        .search-bar {
          position: relative;
          flex: 1;
          max-width: 400px;
        }

        .search-icon {
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #9ca3af;
        }

        .search-bar input {
          padding-left: 12px;
          padding-right: 40px;
          border-radius: 20px;
          border: 1px solid #e5e7eb;
          width: 100%;
          padding-top: 8px;
          padding-bottom: 8px;
        }

        .btn-primary {
          background-color: var(--primary-color);
          color: white;
          text-decoration: none;
          padding: 8px 16px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
          font-weight: 500;
        }
        
        .btn-secondary {
            display: inline-block;
            margin-top: 10px;
            padding: 8px 16px;
            border: 1px solid #d1d5db;
            border-radius: 6px;
            background: white;
            color: #374151;
            text-decoration: none;
        }

        .budgets-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 24px;
        }

        .budget-card {
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          text-decoration: none;
          color: inherit;
          transition: transform 0.2s, box-shadow 0.2s;
          min-height: 200px;
        }

        .budget-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border-color: var(--primary-color);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .project-client-info {
          display: flex;
          flex-direction: column;
          gap: 2px;
          margin-bottom: 8px;
        }

        .project-client-info .budget-number {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 700;
          letter-spacing: 0.05em;
        }

        .card-body h3 {
          font-size: 1.125rem;
          font-weight: 700;
          margin: 0;
          color: #1e293b;
        }

        .card-body p {
          font-size: 0.875rem;
          color: #6b7280;
          margin-bottom: 12px;
        }

        .total-badge {
          font-weight: 700;
          font-size: 1.25rem;
          color: var(--primary-color);
        }

        .card-actions {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid #f3f4f6;
          display: flex;
          justify-content: flex-end;
        }

        .icon-btn.delete-btn {
            background: transparent;
            border: none;
            cursor: pointer;
            color: #9ca3af;
            padding: 8px;
            border-radius: 4px;
        }

        .icon-btn.delete-btn:hover {
          color: #ef4444;
          background: #fef2f2; 
        }

        .empty-state {
          text-align: center;
          padding: 60px;
          color: #6b7280;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
        }

        @media (max-width: 600px) {
          .list-header {
            flex-direction: column;
            align-items: stretch;
          }
           .search-bar input {
             width: 100%;
           }
        }
      `}</style>
    </div>
  );
};

export default BudgetList;
