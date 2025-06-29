/**
 * Stock Management Utility Functions
 */

function updateInventoryAfterSale(saleItems) {
  const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nkmG3khr31CQiaFISNwDYOqrSRziJUrEjzIJHs_xYDY/edit").getActiveSheet();
  
  try {
    const lastRow = ss.getLastRow();
    if (lastRow <= 1) {
      return "error: No inventory data found";
    }
    
    const dataRange = ss.getRange(2, 1, lastRow - 1, ss.getLastColumn());
    const inventoryData = dataRange.getValues();
    
    let updateResults = [];
    
    saleItems.forEach(saleItem => {
      let itemFound = false;
      
      for (let i = 0; i < inventoryData.length; i++) {
        const inventoryItem = inventoryData[i];
        const medicineName = inventoryItem[0];
        const currentQuantity = inventoryItem[1];
        
        if (medicineName.toLowerCase() === saleItem.name.toLowerCase()) {
          const newQuantity = currentQuantity - saleItem.quantity;
          
          if (newQuantity < 0) {
            updateResults.push(`Error: Insufficient stock for ${saleItem.name}. Available: ${currentQuantity}, Requested: ${saleItem.quantity}`);
          } else {
            const rowIndex = i + 2;
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
    return {
      status: "error",
      message: error.toString()
    };
  }
}

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