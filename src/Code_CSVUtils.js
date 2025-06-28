/**
 * CSV Import/Export Utilities
 */

function importMedicinesFromCSV(csvData) {
  const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nkmG3khr31CQiaFISNwDYOqrSRziJUrEjzIJHs_xYDY/edit").getActiveSheet();
  
  try {
    const lines = csvData.split('\n');
    let successCount = 0;
    let errorCount = 0;
    let errors = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue;
      
      const columns = line.split(',').map(col => col.trim().replace(/^"/, '').replace(/"$/, ''));
      
      if (columns.length < 3) {
        errors.push(`Line ${i + 1}: Insufficient columns (expected: name, quantity, price)`);
        errorCount++;
        continue;
      }
      
      const name = columns[0];
      const quantity = parseInt(columns[1]);
      const price = parseFloat(columns[2]);
      
      if (!name || name === '') {
        errors.push(`Line ${i + 1}: Medicine name is required`);
        errorCount++;
        continue;
      }
      
      if (isNaN(quantity) || quantity <= 0) {
        errors.push(`Line ${i + 1}: Invalid quantity for "${name}"`);
        errorCount++;
        continue;
      }
      
      if (isNaN(price) || price <= 0) {
        errors.push(`Line ${i + 1}: Invalid price for "${name}"`);
        errorCount++;
        continue;
      }
      
      try {
        ss.appendRow([name, quantity, price]);
        successCount++;
      } catch (error) {
        errors.push(`Line ${i + 1}: Error adding "${name}" - ${error.toString()}`);
        errorCount++;
      }
    }
    
    return {
      status: "completed",
      successCount: successCount,
      errorCount: errorCount,
      errors: errors
    };
  } catch (error) {
    console.error("Error importing CSV:", error);
    return {
      status: "error",
      message: "Failed to process CSV: " + error.toString()
    };
  }
}

function getCSVTemplate() {
  return "Medicine Name,Quantity,Unit Price\nParacetamol,100,5.50\nAmoxicillin,50,25.00\nIbuprofen,75,12.30";
}