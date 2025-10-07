import * as XLSX from 'xlsx';

export const exportToExcel = (trades) => {
  try {
    const data = trades.map(trade => ({
      'ID': trade.id,
      'วันที่': trade.date,
      'ประเภท': trade.type,
      'คู่เทรด': trade.pair,
      'ราคา': trade.price,
      'จำนวน': trade.amount,
      'มูลค่ารวม': trade.totalValue,
      'ค่าธรรมเนียม': trade.fee,
      'กำไร/ขาดทุน': trade.profitLoss,
      'สถานะ': trade.status,
      'เงินสดคงเหลือ': trade.cashBalance,
      'เงินทุนสุทธิ': trade.capitalBalance,
      'กำไรสะสม': trade.profitBalance,
      'มูลค่าพอร์ต': trade.portfolioValue,
      'หมายเหตุ': trade.note
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Trade Ledger');

    const wscols = [
      { wch: 5 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 12 },
      { wch: 15 }, { wch: 15 }, { wch: 12 }, { wch: 15 }, { wch: 10 },
      { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 20 }
    ];
    ws['!cols'] = wscols;

    const fileName = `Crypto_Portfolio_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(wb, fileName);

    alert('✅ Export Excel สำเร็จ!');
  } catch (error) {
    console.error('Export Excel Error:', error);
    alert('❌ เกิดข้อผิดพลาดในการ Export Excel');
  }
};

export const exportToCSV = (trades) => {
  try {
    const headers = [
      'ID', 'วันที่', 'ประเภท', 'คู่เทรด', 'ราคา', 'จำนวน',
      'มูลค่ารวม', 'ค่าธรรมเนียม', 'กำไร/ขาดทุน', 'สถานะ',
      'เงินสดคงเหลือ', 'เงินทุนสุทธิ', 'กำไรสะสม', 'มูลค่าพอร์ต', 'หมายเหตุ'
    ];

    const rows = trades.map(trade => [
      trade.id, trade.date, trade.type, trade.pair, trade.price, trade.amount,
      trade.totalValue, trade.fee, trade.profitLoss, trade.status,
      trade.cashBalance, trade.capitalBalance, trade.profitBalance,
      trade.portfolioValue, trade.note
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    const fileName = `Crypto_Portfolio_${new Date().toISOString().split('T')[0]}.csv`;

    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    alert('✅ Export CSV สำเร็จ!');
  } catch (error) {
    console.error('Export CSV Error:', error);
    alert('❌ เกิดข้อผิดพลาดในการ Export CSV');
  }
};