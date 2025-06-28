/**
 * Sales Management Functions
 */

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

function recordSale(sales) {
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
  
  const sheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/10dpI9staPQsPUMr-t297_nsyENqDVsZOtKtgofBTcVs/edit").getActiveSheet();
  
  const itemsArray = sales.items;
  const transactionId = sales.transactionId;
  const saleDate = sales.saleDate;
  const totalAmount = sales.totalAmount;
  const customerName = sales.customerName || 'Walk-in Customer';
  const customerContact = sales.customerContact || 'N/A';
  
  try {
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