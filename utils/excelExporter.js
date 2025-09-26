const ExcelJS = require('exceljs');

class ExcelExporter {
  constructor() {
    this.workbook = new ExcelJS.Workbook();
    this.setupStyles();
  }

  setupStyles() {
    // Header style
    this.headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFF' } },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: '366092' } },
      alignment: { horizontal: 'center', vertical: 'middle' },
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      }
    };

    // Data style
    this.dataStyle = {
      border: {
        top: { style: 'thin' },
        left: { style: 'thin' },
        bottom: { style: 'thin' },
        right: { style: 'thin' }
      },
      alignment: { vertical: 'middle' }
    };

    // Number style
    this.numberStyle = {
      ...this.dataStyle,
      numFmt: '#,##0.00'
    };

    // Date style
    this.dateStyle = {
      ...this.dataStyle,
      numFmt: 'dd-mm-yyyy'
    };
  }

  async exportStockStatement(items, summary) {
    const worksheet = this.workbook.addWorksheet('Stock Statement');

    // Add title
    worksheet.mergeCells('A1:L1');
    worksheet.getCell('A1').value = 'CURRENT STOCK STATEMENT';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Add summary
    worksheet.mergeCells('A3:L3');
    worksheet.getCell('A3').value = `Generated on: ${new Date().toLocaleDateString()} | Total Items: ${summary.totalItems} | Low Stock Items: ${summary.lowStockItems}`;
    worksheet.getCell('A3').font = { italic: true };
    worksheet.getCell('A3').alignment = { horizontal: 'center' };

    // Add headers
    const headers = [
      'S.No', 'Item Name', 'Category', 'Unit', 'Current Stock', 'Min Stock',
      'Total Inward', 'Total Outward', 'OK Qty', 'CR Qty', 'MR Qty', 'As Cast Qty'
    ];

    worksheet.addRow(headers);
    const headerRow = worksheet.lastRow;
    headerRow.eachCell((cell) => {
      cell.style = this.headerStyle;
    });

    // Add data rows
    items.forEach((item, index) => {
      const row = worksheet.addRow([
        index + 1,
        item.name,
        item.category,
        item.unit,
        item.currentStock,
        item.minimumStock,
        item.totalInward,
        item.totalOutward,
        item.totalOkQty,
        item.totalCrQty,
        item.totalMrQty,
        item.totalAsCastQty
      ]);

      row.eachCell((cell, colNumber) => {
        if (colNumber >= 5) { // Number columns
          cell.style = this.numberStyle;
        } else {
          cell.style = this.dataStyle;
        }
      });

      // Highlight low stock items
      if (item.isLowStock) {
        row.eachCell((cell) => {
          cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE6E6' } };
        });
      }
    });

    // Add summary row
    const summaryRow = worksheet.addRow([
      'TOTAL',
      '',
      '',
      '',
      summary.totalCurrentStock,
      '',
      summary.totalInward,
      summary.totalOutward,
      summary.totalOkQty,
      summary.totalCrQty,
      summary.totalMrQty,
      summary.totalAsCastQty
    ]);

    summaryRow.eachCell((cell, colNumber) => {
      if (colNumber >= 5) {
        cell.style = { ...this.numberStyle, font: { bold: true } };
      } else {
        cell.style = { ...this.dataStyle, font: { bold: true } };
      }
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = Math.max(column.width || 10, 15);
    });

    return this.workbook;
  }

  async exportMonthlyReport(monthlyData) {
    const worksheet = this.workbook.addWorksheet('Monthly Report');

    const { period, inward, outward, itemBreakdown } = monthlyData;

    // Add title
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = `MONTHLY REPORT - ${period.monthName} ${period.year}`;
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Add summary section
    worksheet.mergeCells('A3:H3');
    worksheet.getCell('A3').value = 'SUMMARY';
    worksheet.getCell('A3').font = { bold: true, size: 14 };
    worksheet.getCell('A3').fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E6E6FA' } };

    // Inward summary
    worksheet.addRow(['INWARD SUMMARY']);
    worksheet.addRow(['Total Entries', inward.totalEntries]);
    worksheet.addRow(['Total Quantity', inward.totalQuantity]);
    worksheet.addRow(['Total Amount', inward.totalAmount]);
    worksheet.addRow(['Unique Suppliers', inward.supplierCount]);
    worksheet.addRow(['Unique Items', inward.itemCount]);

    // Outward summary
    worksheet.addRow(['OUTWARD SUMMARY']);
    worksheet.addRow(['Total Entries', outward.totalEntries]);
    worksheet.addRow(['Total Quantity', outward.totalQuantity]);
    worksheet.addRow(['OK Quantity', outward.totalOkQty]);
    worksheet.addRow(['CR Quantity', outward.totalCrQty]);
    worksheet.addRow(['MR Quantity', outward.totalMrQty]);
    worksheet.addRow(['As Cast Quantity', outward.totalAsCastQty]);
    worksheet.addRow(['Total Amount', outward.totalAmount]);
    worksheet.addRow(['Unique Customers', outward.customerCount]);

    // Item breakdown
    worksheet.addRow(['ITEM-WISE BREAKDOWN']);
    const itemHeaders = [
      'Item Name', 'Category', 'Unit', 'Total Qty', 'OK Qty', 'CR Qty', 'MR Qty', 'As Cast Qty', 'Rejection Rate %'
    ];
    worksheet.addRow(itemHeaders);

    const itemHeaderRow = worksheet.lastRow;
    itemHeaderRow.eachCell((cell) => {
      cell.style = this.headerStyle;
    });

    itemBreakdown.forEach((item) => {
      const row = worksheet.addRow([
        item.itemName,
        item.itemCategory,
        item.itemUnit,
        item.totalQuantity,
        item.totalOkQty,
        item.totalCrQty,
        item.totalMrQty,
        item.totalAsCastQty,
        item.rejectionRate
      ]);

      row.eachCell((cell, colNumber) => {
        if (colNumber >= 4) { // Number columns
          cell.style = this.numberStyle;
        } else {
          cell.style = this.dataStyle;
        }
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = Math.max(column.width || 10, 15);
    });

    return this.workbook;
  }

  async exportItemHistory(itemData) {
    const worksheet = this.workbook.addWorksheet('Item History');

    const { item, inwardTransactions, outwardTransactions } = itemData;

    // Add title
    worksheet.mergeCells('A1:H1');
    worksheet.getCell('A1').value = `ITEM HISTORY - ${item.name}`;
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    // Add item details
    worksheet.addRow(['Item Details']);
    worksheet.addRow(['Name', item.name]);
    worksheet.addRow(['Category', item.category]);
    worksheet.addRow(['Unit', item.unit]);
    worksheet.addRow(['Current Stock', item.currentStock]);
    worksheet.addRow(['Minimum Stock', item.minimumStock]);

    // Inward transactions
    worksheet.addRow(['INWARD TRANSACTIONS']);
    const inwardHeaders = ['Date', 'Challan No', 'Supplier', 'Quantity', 'Rate', 'Amount', 'Remarks'];
    worksheet.addRow(inwardHeaders);

    const inwardHeaderRow = worksheet.lastRow;
    inwardHeaderRow.eachCell((cell) => {
      cell.style = this.headerStyle;
    });

    inwardTransactions.forEach((transaction) => {
      const row = worksheet.addRow([
        transaction.date,
        transaction.challanNo,
        transaction.supplier.name,
        transaction.quantityReceived,
        transaction.rate,
        transaction.totalAmount,
        transaction.remarks
      ]);

      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) { // Date column
          cell.style = this.dateStyle;
        } else if (colNumber >= 4) { // Number columns
          cell.style = this.numberStyle;
        } else {
          cell.style = this.dataStyle;
        }
      });
    });

    // Outward transactions
    worksheet.addRow(['OUTWARD TRANSACTIONS']);
    const outwardHeaders = ['Date', 'Challan No', 'Customer', 'OK Qty', 'CR Qty', 'MR Qty', 'As Cast Qty', 'Total Qty', 'Rate', 'Amount'];
    worksheet.addRow(outwardHeaders);

    const outwardHeaderRow = worksheet.lastRow;
    outwardHeaderRow.eachCell((cell) => {
      cell.style = this.headerStyle;
    });

    outwardTransactions.forEach((transaction) => {
      const row = worksheet.addRow([
        transaction.date,
        transaction.challanNo,
        transaction.customer.name,
        transaction.okQty,
        transaction.crQty,
        transaction.mrQty,
        transaction.asCastQty,
        transaction.totalQty,
        transaction.rate,
        transaction.totalAmount
      ]);

      row.eachCell((cell, colNumber) => {
        if (colNumber === 1) { // Date column
          cell.style = this.dateStyle;
        } else if (colNumber >= 4) { // Number columns
          cell.style = this.numberStyle;
        } else {
          cell.style = this.dataStyle;
        }
      });
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
      column.width = Math.max(column.width || 10, 15);
    });

    return this.workbook;
  }

  async exportToBuffer() {
    return await this.workbook.xlsx.writeBuffer();
  }
}

module.exports = ExcelExporter;
