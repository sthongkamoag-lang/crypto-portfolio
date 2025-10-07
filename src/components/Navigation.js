import React from 'react';
import './Navigation.css';
import { exportToExcel, exportToCSV } from '../utils/exportUtils';

function Navigation({ currentPage, setCurrentPage, onClearData, tradesCount }) {
  
  const handleExportExcel = () => {
    const trades = JSON.parse(localStorage.getItem('cryptoTrades') || '[]');
    if (trades.length === 0) {
      alert('⚠️ ไม่มีข้อมูลให้ Export');
      return;
    }
    exportToExcel(trades);
  };

  const handleExportCSV = () => {
    const trades = JSON.parse(localStorage.getItem('cryptoTrades') || '[]');
    if (trades.length === 0) {
      alert('⚠️ ไม่มีข้อมูลให้ Export');
      return;
    }
    exportToCSV(trades);
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <div className="nav-buttons">
          <button
            className={`nav-btn ${currentPage === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentPage('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-btn ${currentPage === 'ledger' ? 'active' : ''}`}
            onClick={() => setCurrentPage('ledger')}
          >
            📝 Trade Ledger
            {tradesCount > 0 && <span className="badge">{tradesCount}</span>}
          </button>
          <button
            className={`nav-btn ${currentPage === 'statistics' ? 'active' : ''}`}
            onClick={() => setCurrentPage('statistics')}
          >
            📈 Statistics
          </button>
        </div>

        <div className="nav-actions">
          <button className="action-btn export-excel" onClick={handleExportExcel}>
            📥 Export Excel
          </button>
          <button className="action-btn export-csv" onClick={handleExportCSV}>
            📄 Export CSV
          </button>
          <button className="action-btn clear-data" onClick={onClearData}>
            🗑️ Clear All
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigation;