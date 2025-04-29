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

function recordSale(sales) {
  const sheet = SpreadsheetApp.openByUrl("https://docs.google.com/spreadsheets/d/10dpI9staPQsPUMr-t297_nsyENqDVsZOtKtgofBTcVs/edit").getActiveSheet();
  sales.forEach(item => {
    sheet.appendRow([
      new Date(),
      item.name,
      item.qty,
      item.price,
      item.qty * item.price
    ]);
  });
}
