import React, { useState, useEffect } from 'react';
import './App.css';
import Navigation from './components/Navigation';
import TradeLedger from './components/TradeLedger';
import PerformanceDashboard from './components/PerformanceDashboard';
import StatisticData from './components/StatisticData';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [trades, setTrades] = useState([]);

  useEffect(() => {
    const savedTrades = localStorage.getItem('cryptoTrades');
    if (savedTrades) {
      try {
        const parsedTrades = JSON.parse(savedTrades);
        setTrades(parsedTrades);
      } catch (error) {
        console.error('Error loading trades:', error);
      }
    }
  }, []);

  useEffect(() => {
    if (trades.length > 0) {
      localStorage.setItem('cryptoTrades', JSON.stringify(trades));
    }
  }, [trades]);

  const handleClearAllData = () => {
    const confirmMessage = 
      '⚠️ คำเตือน!\n\n' +
      'คุณต้องการลบข้อมูลทั้งหมดใช่หรือไม่?\n' +
      `จำนวนธุรกรรมทั้งหมด: ${trades.length} รายการ\n\n` +
      'การกระทำนี้ไม่สามารถย้อนกลับได้!';

    if (window.confirm(confirmMessage)) {
      const doubleConfirm = window.confirm(
        '🔴 ยืนยันอีกครั้ง!\n\nคุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลทั้งหมด?'
      );
      
      if (doubleConfirm) {
        setTrades([]);
        localStorage.removeItem('cryptoTrades');
        alert('✅ ลบข้อมูลทั้งหมดเรียบร้อยแล้ว!');
      }
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <PerformanceDashboard trades={trades} />;
      case 'ledger':
        return <TradeLedger trades={trades} setTrades={setTrades} />;
      case 'statistics':
        return <StatisticData trades={trades} />;
      default:
        return <PerformanceDashboard trades={trades} />;
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <div className="header-content">
          <h1>💰 Crypto Portfolio Manager</h1>
          <p>จัดการพอร์ตโฟลิโอคริปโตของคุณอย่างมืออาชีพ</p>
        </div>
      </header>

      <Navigation 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage}
        onClearData={handleClearAllData}
        tradesCount={trades.length}
      />

      <main className="app-main">
        {renderPage()}
      </main>

      <footer className="app-footer">
        <p>© 2025 Crypto Portfolio Manager | Made with ❤️ by You</p>
        <p>เวอร์ชัน 1.0.0 | สร้างด้วย React</p>
      </footer>
    </div>
  );
}

export default App;