import React, { useMemo } from 'react';
import './StatisticData.css';

function StatisticData({ trades }) {
  const statistics = useMemo(() => {
    if (trades.length === 0) {
      return null;
    }

    // คำนวณสถิติพื้นฐาน
    const closedTrades = trades.filter(t => t.status === 'CLOSED' && t.profitLoss !== 0);
    const winningTrades = closedTrades.filter(t => t.profitLoss > 0);
    const losingTrades = closedTrades.filter(t => t.profitLoss < 0);

    const totalProfit = winningTrades.reduce((sum, t) => sum + t.profitLoss, 0);
    const totalLoss = Math.abs(losingTrades.reduce((sum, t) => sum + t.profitLoss, 0));
    const averageWin = winningTrades.length > 0 ? totalProfit / winningTrades.length : 0;
    const averageLoss = losingTrades.length > 0 ? totalLoss / losingTrades.length : 0;
    const profitFactor = totalLoss > 0 ? totalProfit / totalLoss : 0;

    // สถิติตามคู่เทรด
    const pairStats = {};
    trades.forEach(trade => {
      if (trade.pair && trade.pair !== '-') {
        if (!pairStats[trade.pair]) {
          pairStats[trade.pair] = {
            pair: trade.pair,
            totalTrades: 0,
            wins: 0,
            losses: 0,
            totalProfit: 0,
            openPositions: 0
          };
        }
        pairStats[trade.pair].totalTrades++;
        if (trade.profitLoss > 0) {
          pairStats[trade.pair].wins++;
          pairStats[trade.pair].totalProfit += trade.profitLoss;
        } else if (trade.profitLoss < 0) {
          pairStats[trade.pair].losses++;
          pairStats[trade.pair].totalProfit += trade.profitLoss;
        }
        if (trade.status === 'OPEN') {
          pairStats[trade.pair].openPositions++;
        }
      }
    });

    // สถิติรายเดือน
    const monthlyStats = {};
    trades.forEach(trade => {
      if (trade.date) {
        const month = trade.date.substring(0, 7); // YYYY-MM
        if (!monthlyStats[month]) {
          monthlyStats[month] = {
            month: month,
            trades: 0,
            profit: 0,
            deposits: 0,
            withdraws: 0
          };
        }
        monthlyStats[month].trades++;
        monthlyStats[month].profit += trade.profitLoss;
        if (trade.type === 'DEPOSIT') {
          monthlyStats[month].deposits += trade.totalValue;
        } else if (trade.type === 'WITHDRAW') {
          monthlyStats[month].withdraws += trade.totalValue;
        }
      }
    });

    return {
      closedTrades: closedTrades.length,
      winningTrades: winningTrades.length,
      losingTrades: losingTrades.length,
      winRate: closedTrades.length > 0 ? (winningTrades.length / closedTrades.length) * 100 : 0,
      totalProfit,
      totalLoss,
      averageWin,
      averageLoss,
      profitFactor,
      pairStats: Object.values(pairStats).sort((a, b) => b.totalProfit - a.totalProfit),
      monthlyStats: Object.values(monthlyStats).sort((a, b) => b.month.localeCompare(a.month))
    };
  }, [trades]);

  if (!statistics) {
    return (
      <div className="statistic-data">
        <h2>📊 Statistic Data</h2>
        <div className="empty-state">
          <div className="empty-icon">📉</div>
          <h3>ยังไม่มีข้อมูลสถิติ</h3>
          <p>เริ่มต้นเทรดเพื่อดูสถิติโดยละเอียด</p>
        </div>
      </div>
    );
  }

  return (
    <div className="statistic-data">
      <h2>📊 Statistic Data (สถิติโดยละเอียด)</h2>

      <div className="stats-overview">
        <div className="overview-card">
          <h3>📈 Trading Performance</h3>
          <div className="performance-grid">
            <div className="perf-item">
              <span className="perf-label">ธุรกรรมที่ปิดแล้ว:</span>
              <span className="perf-value">{statistics.closedTrades}</span>
            </div>
            <div className="perf-item">
              <span className="perf-label">ชนะ:</span>
              <span className="perf-value win">{statistics.winningTrades}</span>
            </div>
            <div className="perf-item">
              <span className="perf-label">แพ้:</span>
              <span className="perf-value lose">{statistics.losingTrades}</span>
            </div>
            <div className="perf-item">
              <span className="perf-label">อัตราชนะ:</span>
              <span className="perf-value">{statistics.winRate.toFixed(2)}%</span>
            </div>
          </div>
        </div>

        <div className="overview-card">
          <h3>💰 Profit & Loss Analysis</h3>
          <div className="performance-grid">
            <div className="perf-item">
              <span className="perf-label">กำไรรวม:</span>
              <span className="perf-value win">
                ฿{statistics.totalProfit.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="perf-item">
              <span className="perf-label">ขาดทุนรวม:</span>
              <span className="perf-value lose">
                ฿{statistics.totalLoss.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="perf-item">
              <span className="perf-label">กำไรเฉลี่ย/ครั้ง:</span>
              <span className="perf-value">
                ฿{statistics.averageWin.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="perf-item">
              <span className="perf-label">ขาดทุนเฉลี่ย/ครั้ง:</span>
              <span className="perf-value">
                ฿{statistics.averageLoss.toLocaleString(undefined, {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}
              </span>
            </div>
            <div className="perf-item">
              <span className="perf-label">Profit Factor:</span>
              <span className={`perf-value ${statistics.profitFactor > 1 ? 'win' : 'lose'}`}>
                {statistics.profitFactor.toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-tables">
        <div className="table-card">
          <h3>🎯 สถิติตามคู่เทรด</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>คู่เทรด</th>
                  <th>ธุรกรรมทั้งหมด</th>
                  <th>ชนะ</th>
                  <th>แพ้</th>
                  <th>อัตราชนะ</th>
                  <th>กำไร/ขาดทุน</th>
                  <th>Open Positions</th>
                </tr>
              </thead>
              <tbody>
                {statistics.pairStats.length > 0 ? (
                  statistics.pairStats.map((pair, index) => {
                    const winRate = pair.wins + pair.losses > 0 
                      ? (pair.wins / (pair.wins + pair.losses)) * 100 
                      : 0;
                    
                    return (
                      <tr key={index}>
                        <td><strong>{pair.pair}</strong></td>
                        <td>{pair.totalTrades}</td>
                        <td className="win">{pair.wins}</td>
                        <td className="lose">{pair.losses}</td>
                        <td>{winRate.toFixed(1)}%</td>
                        <td className={pair.totalProfit >= 0 ? 'win' : 'lose'}>
                          {pair.totalProfit >= 0 ? '+' : ''}
                          ฿{pair.totalProfit.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                        <td>
                          {pair.openPositions > 0 && (
                            <span className="badge badge-orange">
                              {pair.openPositions}
                            </span>
                          )}
                          {pair.openPositions === 0 && '-'}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="7" style={{textAlign: 'center', padding: '20px'}}>
                      ยังไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="table-card">
          <h3>📅 สถิติรายเดือน</h3>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>เดือน</th>
                  <th>จำนวนธุรกรรม</th>
                  <th>กำไร/ขาดทุน</th>
                  <th>เงินฝาก</th>
                  <th>เงินถอน</th>
                  <th>Net Flow</th>
                </tr>
              </thead>
              <tbody>
                {statistics.monthlyStats.length > 0 ? (
                  statistics.monthlyStats.map((month, index) => {
                    const netFlow = month.deposits - month.withdraws;
                    
                    return (
                      <tr key={index}>
                        <td><strong>{month.month}</strong></td>
                        <td>{month.trades}</td>
                        <td className={month.profit >= 0 ? 'win' : 'lose'}>
                          {month.profit >= 0 ? '+' : ''}
                          ฿{month.profit.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                        <td className="win">
                          {month.deposits > 0 ? (
                            `+฿${month.deposits.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`
                          ) : '-'}
                        </td>
                        <td className="lose">
                          {month.withdraws > 0 ? (
                            `-฿${month.withdraws.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2
                            })}`
                          ) : '-'}
                        </td>
                        <td className={netFlow >= 0 ? 'win' : 'lose'}>
                          {netFlow >= 0 ? '+' : ''}
                          ฿{netFlow.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                          })}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" style={{textAlign: 'center', padding: '20px'}}>
                      ยังไม่มีข้อมูล
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="insights-section">
        <h3>💡 Insights & Recommendations</h3>
        <div className="insights-grid">
          {statistics.profitFactor > 2 && (
            <div className="insight-card success">
              <div className="insight-icon">🎉</div>
              <div className="insight-content">
                <h4>ยอดเยี่ยม!</h4>
                <p>Profit Factor ของคุณอยู่ที่ {statistics.profitFactor.toFixed(2)} ซึ่งถือว่าดีมาก แสดงว่ากลยุทธ์ของคุณมีประสิทธิภาพ</p>
              </div>
            </div>
          )}

          {statistics.winRate > 60 && (
            <div className="insight-card success">
              <div className="insight-icon">🏆</div>
              <div className="insight-content">
                <h4>อัตราชนะสูง</h4>
                <p>อัตราชนะของคุณอยู่ที่ {statistics.winRate.toFixed(1)}% ซึ่งสูงกว่าค่าเฉลี่ย รักษาระดับนี้ไว้!</p>
              </div>
            </div>
          )}

          {statistics.winRate < 40 && statistics.closedTrades > 10 && (
            <div className="insight-card warning">
              <div className="insight-icon">⚠️</div>
              <div className="insight-content">
                <h4>ควรปรับปรุง</h4>
                <p>อัตราชนะของคุณอยู่ที่ {statistics.winRate.toFixed(1)}% ลองทบทวนกลยุทธ์การเทรดของคุณ</p>
              </div>
            </div>
          )}

          {statistics.averageLoss > statistics.averageWin && statistics.closedTrades > 5 && (
            <div className="insight-card warning">
              <div className="insight-icon">📊</div>
              <div className="insight-content">
                <h4>Risk/Reward ไม่เหมาะสม</h4>
                <p>ขาดทุนเฉลี่ยสูงกว่ากำไรเฉลี่ย ลองตั้ง Stop Loss ที่แน่นขึ้น หรือเพิ่ม Take Profit</p>
              </div>
            </div>
          )}

          {statistics.closedTrades < 5 && (
            <div className="insight-card info">
              <div className="insight-icon">📈</div>
              <div className="insight-content">
                <h4>ข้อมูลยังไม่เพียงพอ</h4>
                <p>ควรมีธุรกรรมที่ปิดแล้วอย่างน้อย 20-30 รายการ เพื่อให้สถิติมีความน่าเชื่อถือมากขึ้น</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default StatisticData;