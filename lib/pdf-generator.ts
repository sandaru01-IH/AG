"use client";

import jsPDF from "jspdf";

interface ReportData {
  profitData: {
    totalIncome: number;
    totalExpenses: number;
    profit: number;
  };
  salaries: any[];
  user: any;
  month: number;
  year: number;
}

// Helper function to convert image to base64
async function getImageAsBase64(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        resolve(base64String);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error loading logo:", error);
    throw error;
  }
}

export async function generateMonthlyReportPDF(data: ReportData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Load and add logo
  try {
    const logoBase64 = await getImageAsBase64("/logo-placeholder.png");
    doc.addImage(logoBase64, "PNG", 20, 20, 30, 30);
  } catch (error) {
    // Fallback to placeholder if logo fails to load
    console.warn("Could not load logo, using placeholder:", error);
    doc.setFillColor(200, 200, 200);
    doc.rect(20, 20, 30, 30, "F");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Logo", 35, 37, { align: "center" });
  }

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text("AlphaGrid", 60, 30);
  doc.setFontSize(12);
  doc.text("Monthly Financial Report", 60, 40);
  doc.text(
    `${new Date(data.year, data.month - 1).toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })}`,
    60,
    50
  );

  // Financial Summary
  let yPos = 70;
  doc.setFontSize(16);
  doc.text("Financial Summary", 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`Total Income: $${data.profitData.totalIncome.toFixed(2)}`, 20, yPos);
  yPos += 10;
  doc.text(`Total Expenses: $${data.profitData.totalExpenses.toFixed(2)}`, 20, yPos);
  yPos += 10;
  doc.setTextColor(data.profitData.profit >= 0 ? 0 : 255, data.profitData.profit >= 0 ? 150 : 0, 0);
  doc.text(`Net Profit: $${data.profitData.profit.toFixed(2)}`, 20, yPos);
  yPos += 15;

  // Salaries
  if (data.salaries.length > 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.text("Salary Distribution", 20, yPos);
    yPos += 10;

    doc.setFontSize(12);
    data.salaries.forEach((salary: any) => {
      if (yPos > pageHeight - 30) {
        doc.addPage();
        yPos = 20;
      }
      doc.text(
        `${salary.users?.full_name || "Co-founder"}: $${Number(salary.amount).toFixed(2)}`,
        20,
        yPos
      );
      yPos += 10;
    });
  }

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    );
  }

  // Save the PDF
  doc.save(`alphagrid-report-${data.month}-${data.year}.pdf`);
}

// Annual Report PDF
export async function generateAnnualReportPDF(data: {
  year: number;
  monthlyData: any[];
  totals: {
    totalIncome: number;
    totalExpenses: number;
    totalProfit: number;
  };
}) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Load and add logo
  try {
    const logoBase64 = await getImageAsBase64("/logo-placeholder.png");
    doc.addImage(logoBase64, "PNG", 20, 20, 30, 30);
  } catch (error) {
    doc.setFillColor(200, 200, 200);
    doc.rect(20, 20, 30, 30, "F");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Logo", 35, 37, { align: "center" });
  }

  // Header
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text("AlphaGrid", 60, 30);
  doc.setFontSize(12);
  doc.text("Annual Financial Report", 60, 40);
  doc.text(`Year: ${data.year}`, 60, 50);

  let yPos = 70;

  // Annual Summary
  doc.setFontSize(16);
  doc.text("Annual Summary", 20, yPos);
  yPos += 10;

  doc.setFontSize(12);
  doc.text(`Total Income: $${data.totals.totalIncome.toFixed(2)}`, 20, yPos);
  yPos += 10;
  doc.text(`Total Expenses: $${data.totals.totalExpenses.toFixed(2)}`, 20, yPos);
  yPos += 10;
  doc.setTextColor(data.totals.totalProfit >= 0 ? 0 : 255, data.totals.totalProfit >= 0 ? 150 : 0, 0);
  doc.text(`Total Profit: $${data.totals.totalProfit.toFixed(2)}`, 20, yPos);
  yPos += 15;

  // Monthly Breakdown
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(16);
  doc.text("Monthly Breakdown", 20, yPos);
  yPos += 10;

  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  doc.setFontSize(10);
  data.monthlyData.forEach((month) => {
    if (yPos > pageHeight - 30) {
      doc.addPage();
      yPos = 20;
    }
    doc.text(
      `${monthNames[month.month - 1]}: Income $${month.totalIncome.toFixed(2)} | Expenses $${month.totalExpenses.toFixed(2)} | Profit $${month.profit.toFixed(2)}`,
      20,
      yPos
    );
    yPos += 7;
  });

  // Footer
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    );
    doc.text(
      `Generated on ${new Date().toLocaleDateString()}`,
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    );
  }

  doc.save(`alphagrid-annual-report-${data.year}.pdf`);
}

// New function to generate expense receipt/invoice
export async function generateExpenseReceipt(expense: any, companyName: string = "AlphaGrid") {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Load and add logo
  try {
    const logoBase64 = await getImageAsBase64("/logo-placeholder.png");
    doc.addImage(logoBase64, "PNG", 20, 20, 30, 30);
  } catch (error) {
    // Fallback placeholder
    doc.setFillColor(200, 200, 200);
    doc.rect(20, 20, 30, 30, "F");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Logo", 35, 37, { align: "center" });
  }

  // Company Header
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(companyName, 60, 30);
  doc.setFontSize(12);
  doc.text("Expense Receipt / Invoice", 60, 40);

  let yPos = 60;

  // Receipt Number
  doc.setFontSize(14);
  doc.text("Receipt Number:", 20, yPos);
  doc.setFontSize(12);
  doc.text(expense.receipt_number || `EXP-${expense.id.substring(0, 8).toUpperCase()}`, 80, yPos);
  yPos += 10;

  // Date and Time
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(expense.transaction_date).toLocaleDateString()}`, 20, yPos);
  doc.text(`Time: ${new Date(expense.created_at).toLocaleTimeString()}`, 120, yPos);
  yPos += 10;

  // Separator
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Expense Details
  doc.setFontSize(12);
  doc.text("Expense Details", 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.text(`Category: ${expense.category}`, 20, yPos);
  yPos += 7;
  
  if (expense.vendor_name) {
    doc.text(`Vendor: ${expense.vendor_name}`, 20, yPos);
    yPos += 7;
  }
  
  if (expense.invoice_number) {
    doc.text(`Invoice Number: ${expense.invoice_number}`, 20, yPos);
    yPos += 7;
  }

  if (expense.description) {
    doc.text(`Description: ${expense.description}`, 20, yPos);
    yPos += 7;
  }

  yPos += 5;
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Amount
  doc.setFontSize(14);
  doc.text("Amount:", 20, yPos);
  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text(`$${Number(expense.amount).toFixed(2)}`, 80, yPos);
  yPos += 15;

  // Person and Reason
  doc.setFontSize(10);
  doc.text(`Created By: ${expense.users?.full_name || "Unknown"}`, 20, yPos);
  yPos += 7;
  doc.text(`Reason: ${expense.description || expense.category}`, 20, yPos);
  yPos += 10;

  // Status
  doc.setFontSize(10);
  const statusColor = expense.approval_status === "approved" ? [0, 150, 0] : [255, 165, 0];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Status: ${expense.approval_status.toUpperCase()}`, 20, yPos);
  yPos += 10;

  if (expense.approved_by) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Approved By: ${expense.approved_by_user?.full_name || "N/A"}`, 20, yPos);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  // Save the PDF
  const filename = `expense-receipt-${expense.receipt_number || expense.id.substring(0, 8)}.pdf`;
  doc.save(filename);
}

// New function to generate income receipt/invoice
export async function generateIncomeReceipt(income: any, companyName: string = "AlphaGrid") {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Load and add logo
  try {
    const logoBase64 = await getImageAsBase64("/logo-placeholder.png");
    doc.addImage(logoBase64, "PNG", 20, 20, 30, 30);
  } catch (error) {
    // Fallback placeholder
    doc.setFillColor(200, 200, 200);
    doc.rect(20, 20, 30, 30, "F");
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Logo", 35, 37, { align: "center" });
  }

  // Company Header
  doc.setFontSize(20);
  doc.setTextColor(0, 0, 0);
  doc.text(companyName, 60, 30);
  doc.setFontSize(12);
  doc.text("Income Receipt / Invoice", 60, 40);

  let yPos = 60;

  // Receipt Number (generate if not exists)
  const receiptNumber = income.receipt_number || `INC-${income.id.substring(0, 8).toUpperCase()}`;
  doc.setFontSize(14);
  doc.text("Receipt Number:", 20, yPos);
  doc.setFontSize(12);
  doc.text(receiptNumber, 80, yPos);
  yPos += 10;

  // Date and Time
  doc.setFontSize(10);
  doc.text(`Date: ${new Date(income.transaction_date).toLocaleDateString()}`, 20, yPos);
  doc.text(`Time: ${new Date(income.created_at || Date.now()).toLocaleTimeString()}`, 120, yPos);
  yPos += 10;

  // Separator
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Income Details
  doc.setFontSize(12);
  doc.text("Income Details", 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  doc.text(`Source: ${income.income_sources?.name || "Unknown"}`, 20, yPos);
  yPos += 7;

  if (income.description) {
    doc.text(`Description: ${income.description}`, 20, yPos);
    yPos += 7;
  }

  yPos += 5;
  doc.line(20, yPos, pageWidth - 20, yPos);
  yPos += 10;

  // Amount Details
  doc.setFontSize(12);
  doc.text("Amount Breakdown", 20, yPos);
  yPos += 8;

  doc.setFontSize(10);
  const grossAmount = Number(income.amount);
  const netAmount = Number(income.net_amount || income.amount);
  const fees = grossAmount - netAmount;
  const feePercentage = income.income_sources?.fee_percentage || 0;

  doc.text(`Gross Amount: $${grossAmount.toFixed(2)}`, 20, yPos);
  yPos += 7;

  if (feePercentage > 0) {
    doc.text(`Fee (${feePercentage}%): $${fees.toFixed(2)}`, 20, yPos);
    yPos += 7;
  }

  doc.setFontSize(14);
  doc.text("Net Amount:", 20, yPos);
  doc.setFontSize(16);
  doc.setTextColor(0, 150, 0);
  doc.text(`$${netAmount.toFixed(2)}`, 80, yPos);
  yPos += 15;

  // Person and Reason
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text(`Created By: ${income.users?.full_name || "Unknown"}`, 20, yPos);
  yPos += 7;
  doc.text(`Reason: ${income.description || income.income_sources?.name || "Income"}`, 20, yPos);
  yPos += 10;

  // Status
  doc.setFontSize(10);
  const statusColor = income.approval_status === "approved" ? [0, 150, 0] : [255, 165, 0];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.text(`Status: ${income.approval_status.toUpperCase()}`, 20, yPos);
  yPos += 10;

  if (income.approved_by) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Approved By: ${income.approved_by_user?.full_name || "N/A"}`, 20, yPos);
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  // Save the PDF
  const filename = `income-receipt-${receiptNumber}.pdf`;
  doc.save(filename);
}
