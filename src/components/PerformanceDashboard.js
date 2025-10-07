import React, { useMemo } from 'react';
import './PerformanceDashboard.css';

function PerformanceDashboard({ trades }) {
  const dashboardData = useMemo(() => {
    if (trades.length === 0) {
      return {
        totalCapital: 0,
        currentCash: 0,
        totalProfit: 0,
        portfolioValue: 0,
        totalTrades: 0,
        winningTrades: 0,
        losingTrades: 0,
        winRate: 0,
        totalFees: 0,
        roi: 0,
        openPositions: 0,
        closedPositions: 0
      };
    }

    const lastTrade = trades[trades.length - 1];
    const winningTrades = trades.filter(t => t.profitLoss > 0).length;
    const losingTrades = trades.filter(t => t.profitLoss < 0).length;
    const totalFees = trades.reduce((sum, t) => sum + t.fee, 0);
    const openPositions = trades.filter(t => t.status === 'OPEN').length;
    const closedPositions = trades.filter(t => t.status === 'CLOSED').length;

    const totalCapital = lastTrade.capitalBalance;
    const roi = totalCapital > 0 ? (lastTrade.profitBalance / totalCapital) * 100 : 0;

    return {
      totalCapital: totalCapital,
      currentCash: lastTrade.cashBalance,
      totalProfit: lastTrade.profitBalance,
      portfolioValue: lastTrade.portfolioValue,
      totalTrades: trades.length,
      winningTrades: winningTrades,
      losingTrades: losingTrades,
      winRate: winningTrades + losingTrades > 0 
        ? (winningTrades / (winningTrades + losingTrades)) * 100 
        : 0,
      totalFees: totalFees,
      roi: roi,
      openPositions: openPositions,
      closedPositions: closedPositions
    };
  }, [trades]);

  const getRecentTrades = () => {
    return [...trades].reverse().slice(0, 5);
  };

  const getTopPerformers = () => {
    const pairPerformance = {};
    
    trades.forEach(trade => {
      if (trade.type === 'SELL' && trade.status === 'CLOSED') {
        if (!pairPerformance[trade.pair]) {
          pairPerformance[trade.pair] = {
            pair: trade.pair,
            totalProfit: 0,
            trades: 0
          };
        }
        pairPerformance[trade.pair].totalProfit += trade.profitLoss;
        pairPerformance[trade.pair].trades += 1;
      }
    });

    return Object.values(pairPerformance)
      .sort((a, b) => b.totalProfit - a.totalProfit)
      .slice(0, 5);
  };

  return (
    <div className="performance-dashboard">
      <h2>📊 Performance Dashboard</h2>
      
      {trades.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📈</div>
          <h3>ยังไม่มีข้อมูล</h3>
          <p>เริ่มต้นโดยการเพิ่มธุรกรรมแรกของคุณใน Trade Ledger</p>
        </div>
      ) : (
        <>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <h3>มูลค่าพอร์ตทั้งหมด</h3>
                <p className="stat-value">
                  ฿{dashboardData.portfolioValue.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
            </div>

            <div className="stat-card success">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <h3>กำไร/ขาดทุนสะสม</h3>
                <p className={`stat-value ${dashboardData.totalProfit >= 0 ? 'profit' : 'loss'}`}>
                  {dashboardData.totalProfit >= 0 ? '+' : ''}
                  ฿{dashboardData.totalProfit.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
                <p className="stat-sub">
                  ROI: {dashboardData.roi >= 0 ? '+' : ''}{dashboardData.roi.toFixed(2)}%
                </p>
              </div>
            </div>

            <div className="stat-card info">
              <div className="stat-icon">💵</div>
              <div className="stat-content">
                <h3>เงินสดคงเหลือ</h3>
                <p className="stat-value">
                  ฿{dashboardData.currentCash.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
            </div>

            <div className="stat-card warning">
              <div className="stat-icon">💼</div>
              <div className="stat-content">
                <h3>เงินทุนสุทธิ</h3>
                <p className="stat-value">
                  ฿{dashboardData.totalCapital.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })}
                </p>
              </div>
            </div>
          </div>

          <div className="stats-row">
            <div className="stat-box">
              <h4>📊 จำนวนธุรกรรม</h4>
              <p className="big-number">{dashboardData.totalTrades}</p>
              <div className="stat-details">
                <span>🟠 Open: {dashboardData.openPositions}</span>
                <span>🟢 Closed: {dashboardData.closedPositions}</span>
              </div>
            </div>

            <div className="stat-box">
              <h4>🎯 อัตราชนะ</h4>
              <p className="big-number">{dashboardData.winRate.toFixed(1)}%</p>
              <div className="stat-details">
                <span className="win">✅ ชนะ: {dashboardData.winningTrades}</span>
                <span className="lose">❌ แพ้: {dashboardData.losingTrades}</span>
              </div>
            </div>

            <div className="stat-box">
              <h4>💸 ค่าธรรมเนียมรวม</h4>
              <p className="big-number loss">
                ฿{dashboardData.totalFees.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </p>
            </div>
          </div>

          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h3>🔥 Top Performers</h3>
              <div className="performers-list">
                {getTopPerformers().length > 0 ? (
                  getTopPerformers().map((performer, index) => (
                    <div key={index} className="performer-item">
                      <div className="performer-rank">#{index + 1}</div>
                      <div className="performer-info">
                        <strong>{performer.pair}</strong>
                        <span>{performer.trades} trades</span>
                      </div>
                      <div className={`performer-profit ${performer.totalProfit >= 0 ? 'profit' : 'loss'}`}>
                        {performer.totalProfit >= 0 ? '+' : ''}
                        ฿{performer.totalProfit.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="no-data">ยังไม่มีข้อมูล Closed Trades</p>
                )}
              </div>
            </div>

            <div className="dashboard-card">
              <h3>⏱️ ธุรกรรมล่าสุด</h3>
              <div className="recent-trades-list">
                {getRecentTrades().map((trade) => (
                  <div key={trade.id} className="recent-trade-item">
                    <div className="trade-date">{trade.date}</div>
                    <div className="trade-info">
                      <span className={`trade-type ${trade.type.toLowerCase()}`}>
                        {trade.type}
                      </span>
                      <strong>{trade.pair}</strong>
                    </div>
                    <div className={`trade-value ${trade.profitLoss > 0 ? 'profit' : trade.profitLoss < 0 ? 'loss' : ''}`}>
                      {trade.profitLoss !== 0 ? (
                        <>
                          {trade.profitLoss > 0 ? '+' : ''}
                          ฿{trade.profitLoss.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </>
                      ) : (
                        `฿${trade.totalValue.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2
                        })}`
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default PerformanceDashboard;