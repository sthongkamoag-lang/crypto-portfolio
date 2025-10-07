import React, { useState } from 'react';
import './TradeLedger.css';

function TradeLedger({ trades, setTrades }) {
  const [formData, setFormData] = useState({
    date: '',
    type: 'BUY',
    pair: '',
    price: '',
    amount: '',
    fee: '',
    status: 'OPEN',
    note: ''
  });

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 2000);
  };

  const handleTypeChange = (e) => {
    const newType = e.target.value;
    let newStatus = formData.status;
    
    if (newType === 'DEPOSIT' || newType === 'WITHDRAW') {
      newStatus = 'COMPLETED';
    } else if (newType === 'BUY') {
      newStatus = 'OPEN';
    } else if (newType === 'SELL') {
      newStatus = 'CLOSED';
    }
    
    setFormData({
      ...formData,
      type: newType,
      status: newStatus,
      pair: (newType === 'DEPOSIT' || newType === 'WITHDRAW') ? '' : formData.pair,
      price: (newType === 'DEPOSIT' || newType === 'WITHDRAW') ? '' : formData.price,
      amount: (newType === 'DEPOSIT' || newType === 'WITHDRAW') ? '' : formData.amount
    });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const calculateTotal = () => {
    if (formData.type === 'BUY' || formData.type === 'SELL') {
      return parseFloat(formData.price || 0) * parseFloat(formData.amount || 0);
    }
    return parseFloat(formData.price || 0);
  };

  const calculateCashFlow = (total, fee, type) => {
    if (type === 'BUY') {
      return -(total + fee);
    } else if (type === 'SELL') {
      return total - fee;
    } else if (type === 'DEPOSIT') {
      return total;
    } else if (type === 'WITHDRAW') {
      return -total;
    }
    return 0;
  };

  const calculateCapital = (total, type) => {
    if (type === 'DEPOSIT') {
      return total;
    } else if (type === 'WITHDRAW') {
      return -total;
    }
    return 0;
  };

  const calculateProfitLoss = (pair, total, fee, type, status, currentTrades) => {
    if (type === 'SELL' && status === 'CLOSED') {
      const buyTrades = currentTrades.filter(t => t.pair === pair && t.type === 'BUY');
      if (buyTrades.length > 0) {
        const lastBuy = buyTrades[buyTrades.length - 1];
        return total - fee - lastBuy.totalValue - lastBuy.fee;
      }
    }
    return 0;
  };

  const recalculateBalances = (tradesList) => {
    let cashBalance = 0;
    let capitalBalance = 0;
    let profitBalance = 0;

    return tradesList.map((trade, index) => {
      cashBalance += trade.cashFlow;
      capitalBalance += trade.capitalFlow;
      profitBalance += trade.profitFlow;

      return {
        ...trade,
        id: index + 1,
        cashBalance: cashBalance,
        capitalBalance: capitalBalance,
        profitBalance: profitBalance,
        portfolioValue: cashBalance + capitalBalance + profitBalance
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (formData.type === 'DEPOSIT' || formData.type === 'WITHDRAW') {
      if (!formData.date || !formData.price) {
        alert('⚠️ กรุณากรอกวันที่และจำนวนเงิน');
        return;
      }
    } else {
      if (!formData.date || !formData.pair || !formData.price || !formData.amount) {
        alert('⚠️ กรุณากรอกข้อมูลให้ครบถ้วน');
        return;
      }
    }

    const total = calculateTotal();
    const fee = parseFloat(formData.fee || 0);
    const cashFlow = calculateCashFlow(total, fee, formData.type);
    const capital = calculateCapital(total, formData.type);
    
    const newTrade = {
      id: trades.length + 1,
      date: formData.date,
      type: formData.type,
      pair: formData.pair || '-',
      price: parseFloat(formData.price || 0),
      amount: parseFloat(formData.amount || 0),
      totalValue: total,
      fee: fee,
      profitLoss: 0,
      status: formData.status,
      note: formData.note,
      cashFlow: cashFlow,
      capitalFlow: capital,
      profitFlow: 0,
      cashBalance: 0,
      capitalBalance: 0,
      profitBalance: 0,
      portfolioValue: 0
    };

    const profitLoss = calculateProfitLoss(
      newTrade.pair, 
      newTrade.totalValue, 
      newTrade.fee, 
      newTrade.type, 
      newTrade.status,
      trades
    );
    
    newTrade.profitLoss = profitLoss;
    newTrade.profitFlow = newTrade.status === 'CLOSED' ? profitLoss : 0;

    const updatedTrades = recalculateBalances([...trades, newTrade]);
    setTrades(updatedTrades);

    setFormData({
      date: '',
      type: 'BUY',
      pair: '',
      price: '',
      amount: '',
      fee: '',
      status: 'OPEN',
      note: ''
    });

    showNotification('✅ บันทึกธุรกรรมสำเร็จ!', 'success');
  };

  const handleDelete = (trade) => {
    const confirmMessage = `คุณต้องการลบธุรกรรมนี้ใช่หรือไม่?\n\n` +
      `ID: ${trade.id}\n` +
      `วันที่: ${trade.date}\n` +
      `ประเภท: ${trade.type}\n` +
      `คู่เทรด: ${trade.pair}\n` +
      `มูลค่า: ${trade.totalValue.toLocaleString()} บาท`;

    if (window.confirm(confirmMessage)) {
      const filteredTrades = trades.filter(t => t.id !== trade.id);
      const updatedTrades = recalculateBalances(filteredTrades);
      setTrades(updatedTrades);
      
      showNotification('✅ ลบสำเร็จ!', 'success');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'OPEN': { icon: '🟠', color: 'orange', text: 'OPEN' },
      'CLOSED': { icon: '🟢', color: 'green', text: 'CLOSED' },
      'COMPLETED': { icon: '🔵', color: 'blue', text: 'COMPLETED' }
    };

    const config = statusConfig[status] || statusConfig['OPEN'];
    
    return (
      <span className={`badge badge-${config.color}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  const getTypeBadge = (type) => {
    const typeConfig = {
      'BUY': { icon: '🟦', color: 'buy', text: 'BUY' },
      'SELL': { icon: '🟧', color: 'sell', text: 'SELL' },
      'DEPOSIT': { icon: '🟩', color: 'deposit', text: 'DEPOSIT' },
      'WITHDRAW': { icon: '🟥', color: 'withdraw', text: 'WITHDRAW' }
    };

    const config = typeConfig[type] || typeConfig['BUY'];
    
    return (
      <span className={`badge badge-${config.color}`}>
        {config.icon} {config.text}
      </span>
    );
  };

  return (
    <div className="trade-ledger">
      {notification.show && (
        <div className={`notification notification-${notification.type}`}>
          {notification.message}
        </div>
      )}

      <h2>📊 Trade Ledger (สมุดบันทึกการเทรด)</h2>
      
      <div className="form-container">
        <h3>เพิ่มธุรกรรมใหม่</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>วันที่: <span className="required">*</span></label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>ประเภท: <span className="required">*</span></label>
              <select
                name="type"
                value={formData.type}
                onChange={handleTypeChange}
                required
              >
                <option value="BUY">🟦 BUY (ซื้อ)</option>
                <option value="SELL">🟧 SELL (ขาย)</option>
                <option value="DEPOSIT">🟩 DEPOSIT (ฝากเงิน)</option>
                <option value="WITHDRAW">🟥 WITHDRAW (ถอนเงิน)</option>
              </select>
            </div>

            <div className="form-group">
              <label>
                {formData.type === 'DEPOSIT' || formData.type === 'WITHDRAW' 
                  ? 'จำนวนเงิน:' 
                  : 'คู่เทรด:'}
                <span className="required"> *</span>
              </label>
              {formData.type === 'DEPOSIT' || formData.type === 'WITHDRAW' ? (
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              ) : (
                <input
                  type="text"
                  name="pair"
                  value={formData.pair}
                  onChange={handleChange}
                  placeholder="เช่น BTC/USDT"
                  required
                />
              )}
            </div>
          </div>

          <div className="form-row">
            {formData.type !== 'DEPOSIT' && formData.type !== 'WITHDRAW' && (
              <>
                <div className="form-group">
                  <label>ราคา: <span className="required">*</span></label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.01"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>จำนวน: <span className="required">*</span></label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="0.00"
                    step="0.00000001"
                    required
                  />
                </div>
              </>
            )}

            <div className="form-group">
              <label>ค่าธรรมเนียม:</label>
              <input
                type="number"
                name="fee"
                value={formData.fee}
                onChange={handleChange}
                placeholder="0.00"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-row">
            {formData.type !== 'DEPOSIT' && formData.type !== 'WITHDRAW' && (
              <div className="form-group">
                <label>สถานะ: <span className="required">*</span></label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                >
                  <option value="OPEN">🟠 OPEN (ยังถืออยู่)</option>
                  <option value="CLOSED">🟢 CLOSED (ปิดสถานะแล้ว)</option>
                </select>
              </div>
            )}

            <div className="form-group full-width">
              <label>หมายเหตุ/กลยุทธ์:</label>
              <input
                type="text"
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="เช่น Breakout Strategy, Scalping, etc."
              />
            </div>
          </div>

          <button type="submit" className="btn-submit">
            ➕ เพิ่มธุรกรรม
          </button>
        </form>
      </div>

      <div className="status-legend">
        <h4>📌 คำอธิบายสถานะ:</h4>
        <div className="legend-items">
          <div className="legend-item">
            <span className="badge badge-orange">🟠 OPEN</span>
            <span>= ยังถือสินทรัพย์อยู่ (ยังไม่ขาย)</span>
          </div>
          <div className="legend-item">
            <span className="badge badge-green">🟢 CLOSED</span>
            <span>= ปิดสถานะแล้ว (ขายไปแล้ว)</span>
          </div>
          <div className="legend-item">
            <span className="badge badge-blue">🔵 COMPLETED</span>
            <span>= ฝาก/ถอนเสร็จแล้ว (อัตโนมัติ)</span>
          </div>
        </div>
      </div>

      <div className="table-container">
        <h3>รายการธุรกรรมทั้งหมด ({trades.length} รายการ)</h3>
        <div className="table-scroll">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>วันที่</th>
                <th>ประเภท</th>
                <th>คู่เทรด</th>
                <th>ราคา</th>
                <th>จำนวน</th>
                <th>มูลค่ารวม</th>
                <th>ค่าธรรมเนียม</th>
                <th>กำไร/ขาดทุน</th>
                <th>สถานะ</th>
                <th>เงินสดคงเหลือ</th>
                <th>มูลค่าพอร์ต</th>
                <th>หมายเหตุ</th>
                <th>จัดการ</th>
              </tr>
            </thead>
            <tbody>
              {trades.length === 0 ? (
                <tr>
                  <td colSpan="14" style={{textAlign: 'center', padding: '20px'}}>
                    ยังไม่มีธุรกรรม กรุณาเพิ่มธุรกรรมใหม่
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <tr key={trade.id}>
                    <td><strong>{trade.id}</strong></td>
                    <td>{trade.date}</td>
                    <td>{getTypeBadge(trade.type)}</td>
                    <td>{trade.pair || '-'}</td>
                    <td>{trade.price ? trade.price.toLocaleString() : '-'}</td>
                    <td>{trade.amount ? trade.amount.toFixed(8) : '-'}</td>
                    <td>{trade.totalValue.toLocaleString()}</td>
                    <td>{trade.fee.toLocaleString()}</td>
                    <td className={trade.profitLoss > 0 ? 'profit' : trade.profitLoss < 0 ? 'loss' : ''}>
                      {trade.profitLoss !== 0 ? trade.profitLoss.toLocaleString() : '-'}
                    </td>
                    <td>{getStatusBadge(trade.status)}</td>
                    <td className={trade.cashBalance >= 0 ? 'profit' : 'loss'}>
                      {trade.cashBalance.toLocaleString()}
                    </td>
                    <td><strong>{trade.portfolioValue.toLocaleString()}</strong></td>
                    <td>{trade.note || '-'}</td>
                    <td>
                      <button 
                        className="btn-delete"
                        onClick={() => handleDelete(trade)}
                        title="ลบธุรกรรมนี้"
                      >
                        🗑️ ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default TradeLedger;