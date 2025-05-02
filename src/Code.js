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
  /*sales = {
  items: [
    { id: '101', quantity: 2, price: 25.99 },
    { id: '102', quantity: 1, price: 49.99 },
    { id: '103', quantity: 3, price: 12.50 }
  ],
  totalAmount: 121.47,
  transactionId: 'TXN-ABC123XYZ',
  saleDate: '2024-07-24T10:00:00Z'
  };*/
  const itemsArray = sales.items;
  const transactionId = sales.transactionId;
  const saleDate = sales.saleDate;
  const totalAmount = sales.totalAmount;
  itemsArray.forEach(item => {
    sheet.appendRow([
      transactionId,
      saleDate,
      item.name,
      item.quantity,
      item.price,
      totalAmount
    ]);
  });
}
