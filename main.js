

var { app, BrowserWindow, ipcMain, ipcRenderer } = require("electron");
var path = require("path");
var url = require("url");
var fs = require("fs-extra");


var javaInit = require('./javaInit')
var childProcess = require('child_process');
var javaInstancePath = "com.genfare.applet.encoder.EncoderApplet";
var logger = require('electron-log');

let reqPath = path.join(app.getAppPath(), '../../')
fs.copyFile(app.getAppPath() + '/logging.properties', reqPath + '/logging.properties');

fs.copySync(app.getAppPath() + '/app.properties', reqPath + 'app.properties');

// var getLocalJavaPath = process.env.JAVA_HOME+"\\jre\\bin\\server";
// logger.info("Java Class Path "+ app.getAppPath()+'\\node_modules\\java\\build\\jvm_dll_path.json');
// fs.writeJson(app.getAppPath()+'\\node_modules\\java\\build\\jvm_dll_path.json',getLocalJavaPath);

var java = javaInit.getJavaInstance();
logger.info("classpath", java.classpath)
var JPOSApplet = java.import("com.genfare.pos.applet.POSApplet");
var posAppletInstance = new JPOSApplet();
var jsObject = java.import("netscape.javascript.JSObject");
var myjsObject = null;
var result = posAppletInstance.runInitializationSync();
logger.info(result);
const electron = require('electron');
const dialog = electron.dialog;
dialog.showErrorBox = function (title, content) {
  // console.log('${title}\n${content}');
};

let win;

function createWindow() {
  win = new BrowserWindow({
    width: 1300, height: 1000, webPreferences: {
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
  //  win.webContents.openDevTools()

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

app.on('before-quit', () => {
    mainWindow.removeAllListeners('close');
    mainWindow.close();
});

// initialize the app's main window
app.on("activate", () => {
  if (win === null) {
    createWindow();
  }

});


ipcMain.removeAllListeners("ELECTRON_BROWSER_WINDOW_ALERT")
ipcMain.on("ELECTRON_BROWSER_WINDOW_ALERT", (event, message, title) => {
  console.warn('[Alert] ** ${title} ** ${message}')
  event.returnValue = 0 // **IMPORTANT!**
})

/*
 * Read SmartCard Functionality Start Here
  */

ipcMain.on('readSmartcard', (event, cardname) => {
  try {
    var result = posAppletInstance.setEncoderSync(cardname);
  } catch (error) {
    logger.info("error " + error);
    event.sender.send('encoder', error);
  }
  if (result.getSuccessSync()) {
    // readSmartCardOnSetEncoder();
    try {
      var result = posAppletInstance.readCardSync();
    }
    catch (error) {
      logger.info("error " + error);
      event.sender.send('readcardError', error);
    }
    if (result.getSuccessSync()) {
      event.sender.send('readcardResult', result.getValueSync());
    }
    else {
      event.sender.send('readcardError', result.getMessageSync());
    }
  }
  else {
    event.sender.send('encoderError', result.getMessageSync());
  }
})

// function readSmartCardOnSetEncoder(){
//   try{
//     var result = posAppletInstance.readCardSync();
//   }
//   catch (error) {
//     logger.info("error " + error);
//     event.sender.send('readcardError', error);
//   }
//  if(result.getSuccessSync()){
//    event.sender.send('readcardResult', result.getValueSync());
//  }
//  else{
//   event.sender.send('readcardError', result.getMessageSync());
//  }
// }

// need to use readcard instead of newfarecard by passing isNew Variable
ipcMain.on('newfarecard', (event, cardname) => {
  try {
    var result = posAppletInstance.setEncoderSync(cardname);
  } catch (error) {
    logger.info("error " + error);
    event.sender.send('encoder', error);
  }
  if (result.getSuccessSync()) {
    // readSmartCardOnSetEncoder();
    try {
      var result = posAppletInstance.readCardSync();
    }
    catch (error) {
      logger.info("error " + error);
      event.sender.send('readcardError', error);
    }
    if (result.getSuccessSync()) {
      event.sender.send('newfarecardResult', result.getValueSync());
    }
    else {
      event.sender.send('readcardError', result.getMessageSync());
    }
  }
  else {
    event.sender.send('encoderError', result.getMessageSync());
  }
})

ipcMain.on('magneticcard', (event, cardname) => {
  console.log("before java call  Data", posAppletInstance)
  try {
    var smartread = posAppletInstance.readCardSync();
    console.log("smartcard", smartread)
  } catch (error) {
    console.log(error);
  }

  event.sender.send('magneticcardResult', smartread);
})

//encode new card
ipcMain.on('encodenewCard', (event, a, b, c, d, jsondata) => {

  logger.info("before java call  Data", posAppletInstance)
  try {
    // logger.info("show the json data",jsondata);
    var resultCardPid = posAppletInstance.getCardPIDSync();
    var encodevar = posAppletInstance.encodeCardSync(a, b, c, d, JSON.stringify(jsondata));
  } catch (error) {
    logger.info('show thw error here', error);
  }
  logger.info('result of encode', encodevar)
  event.sender.send('encodeCardResult', encodevar.getValueSync());
});



// encode existing card
ipcMain.on('encodeExistingCard', (event, cardNumber, jsondata) => {

  logger.info("before java call  Data", posAppletInstance)
  try {
    // logger.info("show the json data",jsondata);
    // var encodevar = posAppletInstance.encodeCardSync(a,b,c,d,jsondata1,jsondata2,jsondata3);
    var cardNumberStr = "";
    cardNumberStr = cardNumber.toString();
    var resultCardPid = posAppletInstance.getCardPIDSync();

    var encodevar = posAppletInstance.addProductsSync(cardNumberStr, JSON.stringify(jsondata));
  } catch (error) {
    logger.info('show thw error here', error);
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
  logger.info("activation call", result.getSuccessSync());
  event.sender.send('activationCallResult', result.getSuccessSync());
})


ipcMain.on('verifycall', (event, data, environment) => {
  // var assetId = data.assetId
  logger.info("verify call  Data", posAppletInstance)
  var result = posAppletInstance.validateRegisterDeviceSync(environment, data.assetId, data.setupCode);
  event.sender.send('verifyCallResult', result.getMessageSync());
})

ipcMain.on('switchlogincall', (event) => {
  var result = posAppletInstance.getTerminalConfigJSONSync();
  logger.info("terminalConfig" + result);
  event.sender.send('switchLoginCallResult', result);
})


ipcMain.on('terminalConfigcall', (event) => {
  var result = posAppletInstance.getTerminalConfigJSONSync();
  logger.info("terminalConfig" + result);
  event.sender.send('terminalConfigResult', result);
})

ipcMain.on('logincall', (event, login) => {
  var userName = login.username.toString()
  var password = login.password.toString()
  var result = posAppletInstance.authenticateSync(userName, password);

  event.sender.send('loginCallResult', result.getValueSync());
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
  logger.info("savaTransaction  Data", posAppletInstance)
  var result = posAppletInstance.saveTransactionSync(JSON.stringify(TransData));
  logger.info("savaTransaction data", '' + result)
  event.sender.send('saveTransactionResult', result);
})


ipcMain.on('savaTransactionForMagneticMerchandise', (event, TransData) => {
  logger.info("savaTransaction  Data", posAppletInstance)
  var result = posAppletInstance.saveTransactionSync(JSON.stringify(TransData));
  logger.info("savaTransaction data", '' + result)
  event.sender.send('saveTransactionForMagneticMerchandiseResult', result);
})

ipcMain.on('getCardPID', (event, cardname) => {
  // var result = posAppletInstance.setEncoderSync(cardname);
  try {
    var resultCardPid = posAppletInstance.getCardPIDSync();
  } catch (error) {
    logger.info('show thw error here', error);
  }
  logger.info("main.js : getCardPID", '' + resultCardPid)
  event.sender.send('getCardPIDResult', resultCardPid.getValueSync());
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

ipcMain.on('compensation', (event, catalog) => {
  logger.info("compensation  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("compensationResult", '' + result)

  event.sender.send('compensationResult', result);
})

ipcMain.on('printReceipt', (event, TransData, timestamp) => {
  logger.info("printReceipt  Data", TransData)
  var timeStamp = java.newLong(Number( timestamp));
  var result = posAppletInstance.printReceiptSync( TransData, timeStamp);
  logger.info("printReceipt Result data", '' + result)
  event.sender.send('printReceiptResult', result);
})

/** ADMIN METHODS STARTS HERE*/

ipcMain.on('adminSales', (event, shiftType, startTime, endTime) => {
  // var javaLong1 = java.newInstanceSync("java.lang.Long", startTime.toString())
  // var javaLong2 = java.newInstanceSync("java.lang.Long", endTime.toString())
  //  logger.info('sales call', shiftType, startTime.toString(), endTime.toString())
  var S = java.newLong(Number(startTime / 1000));
  var E = java.newLong(Number(endTime / 1000));
  var result = posAppletInstance.getSalesreportSync(shiftType, S, E);
  logger.info("salesResult", '' + result)

  event.sender.send('adminSalesResult', result);
})
ipcMain.on('adminSalesPaymentMethod', (event, userID, shiftType, startTime, endTime, nul1, nul2, nul3) => {
  var S = java.newLong(Number(startTime / 1000));
  var E = java.newLong(Number(endTime / 1000));
  var result = posAppletInstance.getTotalPaymentReportSync(false, shiftType, S, E, 0, 0, 0);
  logger.info("adminSalesPaymentMethod", '' + result)

  event.sender.send('adminSalesPaymentResult', result);
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
  var result = posAppletInstance.triggerSyncSync();
  logger.info("adminSync Result", '' + result.getSuccessSync())

  event.sender.send('adminSyncResult', result.getSuccessSync());
})

ipcMain.on('isSyncCompleted', (event, catalog) => {
  logger.info("comp  Data", posAppletInstance)
  var result = posAppletInstance.isSyncCompleteSync();
  logger.info("isSync Completed Result", '' + result)
  event.sender.send('isSyncCompletedResult', result);
})

ipcMain.on('adminDeviceConfig', (event, catalog) => {
  logger.info("deviceConfig  Data", posAppletInstance)
  var result = posAppletInstance.getDeviceInfoJSONSync();
  logger.info("deviceConfig", '' + result)

  event.sender.send('adminDeviceConfigResult', result);
})

ipcMain.on('adminTerminalConfig', (event, catalog) => {
  logger.info("adminTerminalConfig  Data", posAppletInstance)
  var result = posAppletInstance.getTerminalConfigJSONSync();
  logger.info("adminTerminalConfig", '' + result)

  event.sender.send('adminTerminalConfigResult', result);
})

ipcMain.on('adminShiftSaleSummary', (event, catalog) => {
  logger.info("comp  Data", posAppletInstance)
  var result = posAppletInstance.getProductCatalogJSONSync();
  logger.info("compResult", '' + result)

  event.sender.send('adminShiftSaleSummaryResult', result);
})

ipcMain.on('saveOffering', (event, offerings) => {
  var result = posAppletInstance.saveOfferingSync(offerings);
  event.sender.send('saveOfferingResult', '' + result.getSuccessSync());
});

ipcMain.on('updateCardData', (event, cardname, transactionDate) => {
  var resultSetEncoder = posAppletInstance.setEncoderSync(cardname);
  var result = posAppletInstance.updateCardDataSync("changecardexp",transactionDate.toString());
  event.sender.send('updateCardDataResult', '' + result.getSuccessSync());
});

/** ADMIN METHODS END HERE*/