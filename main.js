

var { app, BrowserWindow, ipcMain, ipcRenderer } = require("electron");
var path = require("path");
var url = require("url");
var fs = require("fs-extra");
var javaInit = require('./javaInit')
var childProcess = require('child_process');
var javaInstancePath = "com.genfare.applet.encoder.EncoderApplet";
var logger = require('electron-log');

let reqPath = path.join(app.getAppPath(), '../../')
fs.copyFile(app.getAppPath()+'/logging.properties', reqPath+'/logging.properties');

fs.copySync(app.getAppPath()+'/app.properties', reqPath+'app.properties');

var java = javaInit.getJavaInstance();
logger.info("classpath", java.classpath)
var JPOSApplet = java.import("com.genfare.pos.applet.POSApplet");
var posAppletInstance = new JPOSApplet();
var jsObject = java.import("netscape.javascript.JSObject");
var myjsObject = null;
var result = posAppletInstance.runInitializationSync();
logger.info(result);

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1000, height: 800, webPreferences: {
      webSecurity: false
    }
  });

  //to remove menu 
  win.setMenu(null);

  // load the dist folder from Angular
  win.loadURL(
    url.format({
      pathname: path.join(__dirname, `dist/index.html`),
      protocol: "file:",
      slashes: true,
    })
  );

  //added this line to open developer tools for debugging
  // win.webContents.openDevTools();

  // The following is optional and will open the DevTools:
  win.webContents.openDevTools()

  win.on("closed", () => {
    win = null;
  });
}

//camera access code

app.on("ready", createWindow);

// on macOS, closing the window doesn't quit the app
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

// initialize the app's main window
app.on("activate", () => {
  if (win === null) {
    createWindow();
  }

});

/*
 * Read SmartCard Functionality Start Here
  */

ipcMain.on('readSmartcard', (event, cardname) => {
  // var cardName = cardname
  // logger.info("cardName", cardName)
  // var cardConfig = {
  //   "agency_id": 194,
  //   "end_of_transit_day_desfire": null,
  //   "priorities_and_configuration_type": 1,
  //   "printed_id_file_version": 2,
  //   "card_properties_file_version": 0,
  //   "transfer_file_version": 1,
  //   "product_list_file_version": 0,
  //   "product_file_version": 3,
  //   "journal_file_version": 1,
  //   "equipment_id": 0,
  //   "first_product_must_be_stored_value": true,
  //   "number_of_products": 4,
  //   "number_of_transfers": 1,
  //   "number_of_bonus_passes": 1,
  //   "number_of_pay_as_you_go_passes": 1,
  //   "max_stored_value": 20000,
  //   "max_pending_passes": 3,
  //   "agency_timezone_offset": -21600000,
  //   "accountFlag": false
  // }


  // logger.info("before java call  Data", posAppletInstance)

  var result = posAppletInstance.setEncoderSync(cardname);

  // logger.info("setEncoder Data", '' + result)
  try {
    // var resultObject = java.newInstance("com.genfare.pos.applet.POSApplet.ResultObject");

    var resultObject = posAppletInstance.readCardSync();
    logger.info('resultObject',resultObject);
  } catch (error) {
    logger.info(error);
  }

  event.sender.send('readcardResult',resultObject.getValueSync());
})


ipcMain.on('newfarecard', (event, cardname) => {
  logger.info("before java call  Data", posAppletInstance)
  var result = posAppletInstance.setEncoderSync(cardname);
  try {
    var smartread = posAppletInstance.readCardSync();
    logger.info("smartcard", smartread)
  } catch (error) {
    logger.info(error);
  }

  event.sender.send('newfarecardResult', smartread.getValueSync());
})

//encode new card
ipcMain.on('encodenewCard', (event, a,b,c,d,jsondata) => {
  
  logger.info("before java call  Data", posAppletInstance)
  try {
    // logger.info("show the json data",jsondata);
    var encodevar = posAppletInstance.encodeCardSync(a,b,c,d,JSON.stringify(jsondata));
  } catch (error) {
    logger.info('show thw error here',error);
  }
  logger.info('result of encode', encodevar)
  event.sender.send('encodeCardResult', encodevar.getValueSync());
});



// encode existing card
ipcMain.on('encodeExistingCard', (event, cardNumber,jsondata) => {
  
  logger.info("before java call  Data", posAppletInstance)
  try {
    // logger.info("show the json data",jsondata);
    // var encodevar = posAppletInstance.encodeCardSync(a,b,c,d,jsondata1,jsondata2,jsondata3);
    var cardNumberStr = "";
    cardNumberStr = cardNumber.toString();
    var encodevar = posAppletInstance.addProductsSync(cardNumberStr,JSON.stringify(jsondata));
  } catch (error) {
    logger.info('show thw error here',error);
  }
  logger.info('result of encode', encodevar)
  event.sender.send('encodeCardResult', encodevar.getValueSync());
});

/*
 * Read SmartCard Functionality End Here
  */

// ipcMain.on('writeSmartcard', (event, cardname) => {
//   var cardName = cardname
//   var writeData = [{ "type_expiration": 0, "add_time": 0, "recharges_pending": 0, "days": 31, "priority_and_condition": 5, "status": "ACTIVE", "is_prod_bad_listed": false, "product_type": 1, "ticket_id": 124, "designator": 3, "designator_details": 0, "start_date_epoch_days": 0, "exp_date_epoch_days": 0, "is_linked_to_user_profile": false, "sourceZone": 0, "destinationZone": 0, "mfgId": 0, "equipmentType": 0, "equipmentId": 0, "individualLoadSeqNo": 0, "tpbCode": 0, "rangeLoadSeqNo": 0, "fileSize": 0, "accessRights": 0, "fileVersion": 0, "slotNumber": 2, "balance": 31, "isRegistered": false, "start_date": 18000000, "isAutoRechargeBackend": false, "isAutoRechargePurse1": false, "isAutoRechargePurse2": false, "isCardBased": true, "isAccountBased": false, "isTpbLock": false, "exp_date": 18000000, "exp_date_str": "01/01/1970", "start_date_str": "01/01/1970" }]
//   var PID = "0000003945"
//   logger.info("  write card call", EncoderInstance)

//   var result = EncoderInstance.encodeCardSync(PID, 1, 0, 0, JSON.stringify(writeData));

//   logger.info("write call result", '' + result)


//   event.sender.send('writeSmartCardResult', result);
// })


ipcMain.on('activationcall', (event, environment, data) => {
  //var assetId = setup
  // var JSString = java.import("java.lang.String");
  var result = posAppletInstance.registerDeviceSync(environment, data.assetId, data.password);
   logger.info("activation call",result.getSuccessSync());
  event.sender.send('activationCallResult', result.getSuccessSync());
})


ipcMain.on('verifycall', (event, data, environment) => {
  // var assetId = data.assetId
  logger.info("verify call  Data", posAppletInstance)
  var result = posAppletInstance.validateRegisterDeviceSync(environment,data.assetId, data.setupCode);
  event.sender.send('verifyCallResult', result.getMessageSync());
})

ipcMain.on('switchlogincall', (event) => {
  var result = posAppletInstance.getTerminalConfigJSONSync();
  logger.info("terminalConfig"+result);
  event.sender.send('switchLoginCallResult', result);
})

ipcMain.on('logincall', (event, login) => {
  var userName = login.username.toString()
  var password = login.password.toString()
  var result = posAppletInstance.authenticateSync(userName, password);

  event.sender.send('loginCallResult', result);
})

ipcMain.on('catalogJson', (event, catalog) => {
  logger.info("catalogJson  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("catalogJson data", '' + result)

  event.sender.send('catalogJsonResult', result);
})


ipcMain.on('generateSequenceNumber', (event, catalog) => {
  var result = posAppletInstance.generateSequenceNumberSync();
  logger.info("generateSequenceNumber", '' + result)
  event.sender.send('generateSequenceNumberSyncResult', result);
})


ipcMain.on('savaTransaction', (event, TransData) => {
  var TransData = { "userID": "admin@ta.com", "timestamp": 1548956849820, "transactionID": "1548956849834", "transactionType": "Charge", "transactionAmount": 12.5, "salesAmount": 12.5, "taxAmount": 0, "items": [{ "transactionID": "1548956849834", "cardPID": "0000004524", "cardUID": "1185357863206784", "quantity": 0, "productIdentifier": null, "ticketTypeId": null, "ticketValue": 0, "slotNumber": 0, "expirationDate": 18198, "balance": 0, "IsMerchandise": false, "IsBackendMerchandise": false, "IsFareCard": true, "unitPrice": 0, "totalCost": 0, "userID": "admin@ta.com", "shiftID": 1, "fareCode": "Full", "walletContentItems": [{ "transactionID": "1548956849834", "quantity": 1, "productIdentifier": "1406", "ticketTypeId": 3, "ticketValue": 10, "status": "ACTIVE", "slotNumber": 3, "startDate": 0, "expirationDate": 0, "balance": 10, "rechargesPending": 0, "IsMerchandise": false, "IsBackendMerchandise": false, "IsFareCard": false, "unitPrice": 12.5, "totalCost": 12.5, "userID": "admin@ta.com", "shiftID": 1, "fareCode": "Full", "offeringId": 27, "cardPID": "0000004524", "cardUID": "1185357863206784", "walletTypeId": 3, "shiftType": 0, "timestamp": 1548956849820 }], "walletTypeId": 3, "shiftType": 0, "timestamp": 1548956849820 }], "payments": [{ "paymentMethodId": 2, "amount": 12.5 }], "shiftType": 0 }
  logger.info("savaTransaction  Data", posAppletInstance)
  var result = posAppletInstance.saveTransactionSync(JSON.stringify(TransData));
  logger.info("savaTransaction data", '' + result)

  event.sender.send('saveTransactionResult', result);
})


ipcMain.on('creditOrDebit', (event, catalog) => {
  logger.info("creditOrDebit  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("creditOrDebitResult data", '' + result)

  event.sender.send('creditOrDebitResult', result);
})

ipcMain.on('check', (event, catalog) => {
  logger.info("check  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("checkResult data", '' + result)

  event.sender.send('checkResult', result);
})

ipcMain.on('existingFareCard', (event, catalog) => {
  logger.info("existingFareCard  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("existingFareCardResult data", '' + result)

  event.sender.send('existingFareCardResult', result);
})

ipcMain.on('voucher', (event, catalog) => {
  logger.info("voucher  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("voucherResult data", '' + result)

  event.sender.send('voucherResult', result);
})

ipcMain.on('payAsYouGo', (event, catalog) => {
  logger.info("payAsYouGo  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("payAsYouGoResult data", '' + result)

  event.sender.send('payAsYouGoResult', result);
})

ipcMain.on('comp', (event, catalog) => {
  logger.info("comp  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("compResult", '' + result)

  event.sender.send('compResult', result);
})


/** ADMIN METHODS STARTS HERE*/

ipcMain.on('adminSales', (event, catalog) => {
  logger.info("comp  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("compResult", '' + result)

  event.sender.send('adminSalesResult', result);
})

ipcMain.on('adminCloseShift', (event, catalog) => {
  logger.info("comp  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("compResult", '' + result)

  event.sender.send('adminCloseShiftResult', result);
})

ipcMain.on('adminOpenShift', (event, catalog) => {
  logger.info("comp  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("compResult", '' + result)

  event.sender.send('adminOpenShiftResult', result);
})
ipcMain.on('adminSync', (event, catalog) => {
  logger.info("comp  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("compResult", '' + result)

  event.sender.send('adminSyncResult', result);
})

ipcMain.on('adminDeviceConfig', (event, catalog) => {
  logger.info("comp  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("compResult", '' + result)

  event.sender.send('adminDeviceConfigResult', result);
})

ipcMain.on('adminShiftSaleSummary', (event, catalog) => {
  logger.info("comp  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("compResult", '' + result)

  event.sender.send('adminShiftSaleSummaryResult', result);
})

/** ADMIN METHODS END HERE*/