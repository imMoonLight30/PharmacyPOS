/**
 * Inventory Management Functions
 */

function getInvetory() {
  const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nkmG3khr31CQiaFISNwDYOqrSRziJUrEjzIJHs_xYDY/edit").getActiveSheet();
  var res;
  var lastRow = ss.getLastRow();
  if (lastRow > 1) {
    var dataRange = ss.getRange(2, 1, lastRow - 1, ss.getLastColumn());
    var data = dataRange.getValues();
    res= data;
  } else {
    Logger.log("No data found below the first row.");
    res = [];
  }
  console.log(res);
  return res;
}

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

function updateMedicine(rowIndex, medicineData) {
  const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nkmG3khr31CQiaFISNwDYOqrSRziJUrEjzIJHs_xYDY/edit").getActiveSheet();
  
  try {
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

function deleteMedicine(rowIndex) {
  const ss = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/1nkmG3khr31CQiaFISNwDYOqrSRziJUrEjzIJHs_xYDY/edit").getActiveSheet();
  
  try {
    var actualRow = parseInt(rowIndex) + 2;
    ss.deleteRow(actualRow);
    return "success";
  } catch (error) {
    console.error("Error deleting medicine:", error);
    return "error: " + error.toString();
  }
}