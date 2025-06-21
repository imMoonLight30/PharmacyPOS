function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate();
}

function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

function getInvetory() {
  const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nkmG3khr31CQiaFISNwDYOqrSRziJUrEjzIJHs_xYDY/edit").getActiveSheet();
  var res;
  var lastRow = ss.getLastRow();
  if (lastRow > 1) {
    // Get the data range, starting from the second row (row 2)
    var dataRange = ss.getRange(2, 1, lastRow - 1, ss.getLastColumn());
    // Get the values from the data range.  This will be a 2D array.
    var data = dataRange.getValues();
    res= data;
  } else {
    Logger.log("No data found below the first row.");
    res = [];
  }
  console.log(res);
  return res;
}

// Admin function to get sales data
function getSalesData() {
  const sheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/10dpI9staPQsPUMr-t297_nsyENqDVsZOtKtgofBTcVs/edit").getActiveSheet();
  var res;
  var lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    var dataRange = sheet.getRange(2, 1, lastRow - 1, sheet.getLastColumn());
    var data = dataRange.getValues();
    res = data;
  } else {
    Logger.log("No sales data found.");
    res = [];
  }
  console.log("Sales data:", res);
  return res;
}

// Admin function to add new medicine to inventory
function addMedicine(medicineData) {
  const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nkmG3khr31CQiaFISNwDYOqrSRziJUrEjzIJHs_xYDY/edit").getActiveSheet();
  
  try {
    ss.appendRow([
      medicineData.name,
      medicineData.quantity,
      medicineData.unitPrice
    ]);
    return "success";
  } catch (error) {
    console.error("Error adding medicine:", error);
    return "error: " + error.toString();
  }
}

// Admin function to update existing medicine in inventory
function updateMedicine(rowIndex, medicineData) {
  const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nkmG3khr31CQiaFISNwDYOqrSRziJUrEjzIJHs_xYDY/edit").getActiveSheet();
  
  try {
    // rowIndex is 0-based from frontend, but spreadsheet rows are 1-based and we start from row 2
    var actualRow = parseInt(rowIndex) + 2;
    
    ss.getRange(actualRow, 1).setValue(medicineData.name);
    ss.getRange(actualRow, 2).setValue(medicineData.quantity);
    ss.getRange(actualRow, 3).setValue(medicineData.unitPrice);
    
    return "success";
  } catch (error) {
    console.error("Error updating medicine:", error);
    return "error: " + error.toString();
  }
}

// Admin function to delete medicine from inventory
function deleteMedicine(rowIndex) {
  const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nkmG3khr31CQiaFISNwDYOqrSRziJUrEjzIJHs_xYDY/edit").getActiveSheet();
  
  try {
    // rowIndex is 0-based from frontend, but spreadsheet rows are 1-based and we start from row 2
    var actualRow = parseInt(rowIndex) + 2;
    
    ss.deleteRow(actualRow);
    return "success";
  } catch (error) {
    console.error("Error deleting medicine:", error);
    return "error: " + error.toString();
  }
}

function recordSale(sales) {
  // First check stock availability
  const stockCheck = checkStockAvailability(sales.items);
  
  if (stockCheck.status === "insufficient") {
    return {
      status: "stock_error",
      message: "Insufficient stock for some items",
      stockIssues: stockCheck.stockIssues
    };
  }
  
  if (stockCheck.status === "error") {
    return {
      status: "error",
      message: stockCheck.message
    };
  }
  
  // Proceed with recording the sale
  const sheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/10dpI9staPQsPUMr-t297_nsyENqDVsZOtKtgofBTcVs/edit").getActiveSheet();
  /*sales = {
  items: [
    { name: 'Medicine A', quantity: 2, price: 25.99 },
    { name: 'Medicine B', quantity: 1, price: 49.99 },
    { name: 'Medicine C', quantity: 3, price: 12.50 }
  ],
  totalAmount: 121.47,
  transactionId: 'TXN-ABC123XYZ',
  saleDate: '2024-07-24T10:00:00Z',
  customerName: 'John Doe',
  customerContact: '+91 98765 43210'
  };*/
  const itemsArray = sales.items;
  const transactionId = sales.transactionId;
  const saleDate = sales.saleDate;
  const totalAmount = sales.totalAmount;
  const customerName = sales.customerName || 'Walk-in Customer';
  const customerContact = sales.customerContact || 'N/A';
  
  try {
    // Record the sale
    itemsArray.forEach(item => {
      sheet.appendRow([
        transactionId,
        saleDate,
        item.name,
        item.quantity,
        item.price,
        totalAmount,
        customerName,
        customerContact
      ]);
    });
    
    // Update inventory
    const inventoryUpdate = updateInventoryAfterSale(itemsArray);
    
    if (inventoryUpdate.status === "success") {
      return {
        status: "success",
        message: "Sale recorded and inventory updated successfully",
        inventoryUpdates: inventoryUpdate.updates
      };
    } else {
      return {
        status: "partial_success",
        message: "Sale recorded but inventory update failed: " + inventoryUpdate,
        inventoryError: inventoryUpdate
      };
    }
    
  } catch (error) {
    console.error("Error recording sale:", error);
    return {
      status: "error",
      message: "Failed to record sale: " + error.toString()
    };
  }
}

// Admin function to import medicines from CSV data
function importMedicinesFromCSV(csvData) {
  const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nkmG3khr31CQiaFISNwDYOqrSRziJUrEjzIJHs_xYDY/edit").getActiveSheet();
  
  try {
    // Parse CSV data
    const lines = csvData.split('\n');
    let successCount = 0;
    let errorCount = 0;
    let errors = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line === '') continue; // Skip empty lines
      
      const columns = line.split(',').map(col => col.trim().replace(/^"/, '').replace(/"$/, '')); // Remove quotes if present
      
      if (columns.length < 3) {
        errors.push(`Line ${i + 1}: Insufficient columns (expected: name, quantity, price)`);
        errorCount++;
        continue;
      }
      
      const name = columns[0];
      const quantity = parseInt(columns[1]);
      const price = parseFloat(columns[2]);
      
      // Validate data
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
      
      // Add to spreadsheet
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

// Admin function to get CSV template
function getCSVTemplate() {
  return "Medicine Name,Quantity,Unit Price\nParacetamol,100,5.50\nAmoxicillin,50,25.00\nIbuprofen,75,12.30";
}

// Function to update inventory after sale
function updateInventoryAfterSale(saleItems) {
  const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nkmG3khr31CQiaFISNwDYOqrSRziJUrEjzIJHs_xYDY/edit").getActiveSheet();
  
  try {
    const lastRow = ss.getLastRow();
    if (lastRow <= 1) {
      return "error: No inventory data found";
    }
    
    // Get all inventory data
    const dataRange = ss.getRange(2, 1, lastRow - 1, ss.getLastColumn());
    const inventoryData = dataRange.getValues();
    
    let updateResults = [];
    
    saleItems.forEach(saleItem => {
      let itemFound = false;
      
      for (let i = 0; i < inventoryData.length; i++) {
        const inventoryItem = inventoryData[i];
        const medicineName = inventoryItem[0];
        const currentQuantity = inventoryItem[1];
        
        // Check if medicine name matches (case-insensitive)
        if (medicineName.toLowerCase() === saleItem.name.toLowerCase()) {
          const newQuantity = currentQuantity - saleItem.quantity;
          
          if (newQuantity < 0) {
            updateResults.push(`Error: Insufficient stock for ${saleItem.name}. Available: ${currentQuantity}, Requested: ${saleItem.quantity}`);
          } else {
            // Update the quantity in the spreadsheet
            const rowIndex = i + 2; // +2 because array is 0-based and we start from row 2
            ss.getRange(rowIndex, 2).setValue(newQuantity);
            updateResults.push(`Updated ${saleItem.name}: ${currentQuantity} → ${newQuantity}`);
          }
          itemFound = true;
          break;
        }
      }
      
      if (!itemFound) {
        updateResults.push(`Warning: Medicine "${saleItem.name}" not found in inventory`);
      }
    });
    
    return {
      status: "success",
      updates: updateResults
    };
    
  } catch (error) {
    console.error("Error updating inventory:", error);
    return "error: " + error.toString();
  }
}

// Function to check stock availability before sale
function checkStockAvailability(saleItems) {
  const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nkmG3khr31CQiaFISNwDYOqrSRziJUrEjzIJHs_xYDY/edit").getActiveSheet();
  
  try {
    const lastRow = ss.getLastRow();
    if (lastRow <= 1) {
      return {
        status: "error",
        message: "No inventory data found"
      };
    }
    
    // Get all inventory data
    const dataRange = ss.getRange(2, 1, lastRow - 1, ss.getLastColumn());
    const inventoryData = dataRange.getValues();
    
    let stockIssues = [];
    let allItemsAvailable = true;
    
    saleItems.forEach(saleItem => {
      let itemFound = false;
      
      for (let i = 0; i < inventoryData.length; i++) {
        const inventoryItem = inventoryData[i];
        const medicineName = inventoryItem[0];
        const availableQuantity = inventoryItem[1];
        
        // Check if medicine name matches (case-insensitive)
        if (medicineName.toLowerCase() === saleItem.name.toLowerCase()) {
          if (availableQuantity < saleItem.quantity) {
            stockIssues.push({
              medicine: saleItem.name,
              requested: saleItem.quantity,
              available: availableQuantity
            });
            allItemsAvailable = false;
          }
          itemFound = true;
          break;
        }
      }
      
      if (!itemFound) {
        stockIssues.push({
          medicine: saleItem.name,
          requested: saleItem.quantity,
          available: 0,
          notFound: true
        });
        allItemsAvailable = false;
      }
    });
    
    return {
      status: allItemsAvailable ? "available" : "insufficient",
      stockIssues: stockIssues
    };
    
  } catch (error) {
    console.error("Error checking stock:", error);
    return {
      status: "error",
      message: error.toString()
    };
  }
}
