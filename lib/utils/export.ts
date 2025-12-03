"use client";

// CSV Export utility
export function exportToCSV(data: any[], filename: string) {
  if (!data || data.length === 0) {
    alert("No data to export");
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);
  
  // Create CSV content
  const csvContent = [
    // Headers
    headers.map(h => `"${h}"`).join(","),
    // Data rows
    ...data.map(row => 
      headers.map(header => {
        const value = row[header];
        // Handle null/undefined
        if (value === null || value === undefined) return '""';
        // Handle objects/arrays
        if (typeof value === 'object') return `"${JSON.stringify(value)}"`;
        // Handle strings with quotes
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(",")
    )
  ].join("\n");

  // Create blob and download
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Excel export using CSV (simple approach - for full Excel, would need a library)
export function exportToExcel(data: any[], filename: string) {
  // For now, we'll use CSV format which Excel can open
  // For proper .xlsx, you'd need a library like 'xlsx'
  exportToCSV(data, filename);
}

// Format data for export
export function formatDataForExport(data: any[], type: "income" | "expense" | "project" | "worker") {
  return data.map(item => {
    switch (type) {
      case "income":
        return {
          "Date": item.transaction_date,
          "Source": item.income_sources?.name || "Unknown",
          "Amount": item.amount,
          "Net Amount": item.net_amount || item.amount,
          "Description": item.description || "",
          "Status": item.approval_status,
          "Created By": item.users?.full_name || "Unknown",
        };
      case "expense":
        return {
          "Date": item.transaction_date,
          "Category": item.category,
          "Amount": item.amount,
          "Vendor": item.vendor_name || "",
          "Invoice Number": item.invoice_number || "",
          "Receipt Number": item.receipt_number || "",
          "Description": item.description || "",
          "Status": item.approval_status,
          "Created By": item.users?.full_name || "Unknown",
        };
      case "project":
        return {
          "Name": item.name,
          "Description": item.description || "",
          "Total Value": item.total_value,
          "Status": item.status,
          "Start Date": item.start_date || "",
          "End Date": item.end_date || "",
          "Workers": item.project_workers?.length || 0,
        };
      case "worker":
        return {
          "Name": item.full_name,
          "Username": item.username,
          "Email": item.email,
          "Role": item.role,
          "Status": item.is_active ? "Active" : "Inactive",
          "Joined": item.created_at,
        };
      default:
        return item;
    }
  });
}

