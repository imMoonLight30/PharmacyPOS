function doGet() {
  return HtmlService.createTemplateFromFile('index').evaluate();
}

function include(filename){
  return HtmlService.createHtmlOutputFromFile(filename).getContent();
}

// Test function to verify all modules are accessible
function testModules() {
  const testResults = {
    inventory: {},
    sales: {},
    stock: {},
    csv: {},
    summary: { total: 0, available: 0, missing: 0 }
  };
  
  try {
    // Test inventory functions
    testResults.inventory.getInvetory = typeof getInvetory;
    testResults.inventory.addMedicine = typeof addMedicine;
    testResults.inventory.updateMedicine = typeof updateMedicine;
    testResults.inventory.deleteMedicine = typeof deleteMedicine;
    
    // Test sales functions  
    testResults.sales.getSalesData = typeof getSalesData;
    testResults.sales.recordSale = typeof recordSale;
    
    // Test stock utility functions
    testResults.stock.checkStockAvailability = typeof checkStockAvailability;
    testResults.stock.updateInventoryAfterSale = typeof updateInventoryAfterSale;
    
    // Test CSV functions
    testResults.csv.importMedicinesFromCSV = typeof importMedicinesFromCSV;
    testResults.csv.getCSVTemplate = typeof getCSVTemplate;
    
    // Calculate summary
    Object.values(testResults).forEach(module => {
      if (typeof module === 'object' && module !== testResults.summary) {
        Object.values(module).forEach(funcType => {
          testResults.summary.total++;
          if (funcType === 'function') {
            testResults.summary.available++;
          } else {
            testResults.summary.missing++;
          }
        });
      }
    });
    
    console.log("Module Test Results:", testResults);
    
    if (testResults.summary.missing === 0) {
      return `✅ All ${testResults.summary.total} functions loaded successfully!`;
    } else {
      return `⚠️ ${testResults.summary.available}/${testResults.summary.total} functions available. ${testResults.summary.missing} missing.`;
    }
    
  } catch (error) {
    console.error("Module test failed:", error);
    return "❌ Module test failed: " + error.toString();
  }
}
