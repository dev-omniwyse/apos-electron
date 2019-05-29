import { Injectable, NgZone } from '@angular/core';
import { Observable, of, throwError, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { ElectronService } from 'ngx-electron';
import { MediaType } from './services/MediaType';
import { DatePipe } from '@angular/common';
import { Utils } from './services/Utils.service';
declare var $: any;
const httpOptions = {
  headers: new HttpHeaders(
    {
      'Content-Type': 'application/x-www-form-urlencoded',
      'accept': 'application/json'

    }

  )
};

const apiUrl = "https://api.qe.gfcp.io/services/data-api/v1/wpf/id_card/updateExisting?tenant=CDTA&access_token=6294ffc6-1189-4803-8ddf-6a99f039f37a"

@Injectable({
  providedIn: 'root'
})


export class CdtaService {

  constructor(private http: HttpClient, private datePipe: DatePipe, private electronService: ElectronService, private _ngZone: NgZone) {

    this.electronService.ipcRenderer.on('printSummaryReportResult', (event, data) => {

      if (data != undefined && data != "") {
        console.log("printSummaryReport Done", data)
        this._ngZone.run(() => {
        });
      }
    });

    this.electronService.ipcRenderer.on('printReceiptHeaderResult', (event, data) => {
      if (data != undefined && data != "") {
        console.log("print Receipt Header Result Done", data)
        this._ngZone.run(() => {

        });
      }
    });

    this.electronService.ipcRenderer.on('printSummaryPaymentsReportResult', (event, data) => {
      if (data != undefined && data != "") {
        console.log("printSummary Payments Report Result Done", data)
        this._ngZone.run(() => {
          this.electronService.ipcRenderer.removeAllListeners("salesDataResult")
          this.electronService.ipcRenderer.removeAllListeners("paymentsDataResult")

        });
      }
    });

    this.electronService.ipcRenderer.on('printRefundReceiptResult', (event, data) => {
      if (data != undefined && data != "") {
        console.log("printRefundReceiptResult", data)
        this._ngZone.run(() => {
          this.electronService.ipcRenderer.removeAllListeners("printRefundReceiptResult")

        });
      }
    });
    this.electronService.ipcRenderer.on('printCustomerRefundReceiptResult', (event, data) => {
      if (data != undefined && data != "") {
        console.log("printCustomerRefundReceiptResult", data)
        this._ngZone.run(() => {
          this.electronService.ipcRenderer.removeAllListeners("printCustomerRefundReceiptResult")

        });
      }
    });

    this.electronService.ipcRenderer.on('printCardSummaryResult', (event, data) => {
      if (data != undefined && data != "") {
        console.log("print card summary done", data)
        this._ngZone.run(() => {

        });
      }
    });

  }

  public getJSON(): Observable<any> {
    return this.http.get("assets/data/product_catalog.json")
  }
  public getsalesJson(): Observable<any> {
    return this.http.get("assets/data/sales_summary.json")
  }
  public getsalesPaymentJson(): Observable<any> {
    return this.http.get("assets/data/sales_payment.json")
  }
  public getUserPermissionsJson(): Observable<any> {
    return this.http.get("assets/data/user_permissions.json")
  }
  // Observable string sources
  private headerShowHideSource = new Subject<string>();

  // Observable string streams
  headerShowHide$ = this.headerShowHideSource.asObservable();

  // Service message commands
  announceHeaderShowHide(mission: string) {
    this.headerShowHideSource.next(mission);
  }


   // Observable string sources
   private goToCheckOutSource = new Subject<Boolean>();

   // Observable string streams
   goToCheckout$ = this.goToCheckOutSource.asObservable();
 
   // Service message commands
   announcegoToCheckOut(proceedToCheckOut: Boolean) {
     this.goToCheckOutSource.next(proceedToCheckOut);
   }

      // Observable string sources
      private goToLogInSource = new Subject<Boolean>();

      // Observable string streams
      goToLogin$ = this.goToLogInSource.asObservable();
    
      // Service message commands
      announcegoToLogIn(proceedToLogIn: Boolean) {
        this.goToLogInSource.next(proceedToLogIn);
      }

  private terminalNumberSrc = new Subject<string>();

  // Observable string streams
  terminalNumber$ = this.terminalNumberSrc.asObservable();

  // Service message commands
  setterminalNumber(mission: string) {
    this.terminalNumberSrc.next(mission);
  }

  getUniqueSaletReport(backendSalesReport) {
    var displayingSales = [];
    var container = this;
    for (var b = 0; b < backendSalesReport.length; b++) {
      for (var c = b + 1; c < backendSalesReport.length; c++) {
        if (backendSalesReport[b].description == backendSalesReport[c].description) {
          backendSalesReport[b].value = backendSalesReport[b].value + backendSalesReport[c].value;
          backendSalesReport[b].quantity = backendSalesReport[b].quantity + backendSalesReport[c].quantity;
        }
      }
      if (!this.checkIsDuplicateSaleRecordElement(displayingSales, backendSalesReport[b])) {
        displayingSales.push(backendSalesReport[b]);
      }
    }
    return displayingSales;
  }

  checkIsDuplicateSaleRecordElement(displayingSales, backendSalesReport) {
    console.log(" verifying is duplicate element?");
    var contains = false;
    for (var i = 0; i < displayingSales.length; i++) {
      if (displayingSales[i].description == backendSalesReport.description) {
        contains = true;
        break;
      }
    }
    return contains;
  };

  iterateAndFindUniquePaymentTypeString(backendPaymentReport) {
    var container = this;
    var uniquePaymentTypes = [];
    for (var b = 0; b < backendPaymentReport.length; b++) {
      for (var c = b + 1; c < backendPaymentReport.length; c++) {
        if (backendPaymentReport[b].paymentMethod == backendPaymentReport[c].paymentMethod) {
          backendPaymentReport[b].paymentAmount = backendPaymentReport[b].paymentAmount + backendPaymentReport[c].paymentAmount;
          backendPaymentReport[b].paymentMethodCount = backendPaymentReport[b].paymentMethodCount + backendPaymentReport[c].paymentMethodCount;
        }

      }
      if (!this.checkIsDuplicatePaymentRecordElement(uniquePaymentTypes, backendPaymentReport[b])) {
        uniquePaymentTypes.push(backendPaymentReport[b]);
      }
    }
    return uniquePaymentTypes;
  }


  checkIsDuplicatePaymentRecordElement(displayingPayments, backendPaymentReport) {
    console.log(" verifying is duplicate element?");
    var contains = false;
    for (var i = 0; i < displayingPayments.length; i++) {
      if (displayingPayments[i].paymentMethod == backendPaymentReport.paymentMethod) {
        contains = true;
        break;
      }
    }
    return contains;
  }

  generatePrintReceiptForPayments(paymentReport, isSingleUser) {
    console.log("generateprintreceiptfor payments", paymentReport)
    var paymentsReport = "",
      totalPaymentCount: any = 0,
      totalPaymentCost: any = 0,
      costText = '',
      checkTotal: any = 0,
      creditTotal: any = 0,
      farecardTotal: any = 0,
      voucherTotal: any = 0,
      compTotal: any = 0,
      storedValueTotal: any = 0;

    var cashCount: any = 0,
      checkCount: any = 0,
      creditCount: any = 0,
      farecardCount: any = 0,
      voucherCount: any = 0,
      compCount: any = 0,
      storedValueCount: any = 0,
      paymentMethod = '',
      paymentAmount: any = 0,
      paymentMethodCount: any = 0;
    var cashTotal: any = 0;

    for (var i = 0; i < paymentReport.length; i++) {

      paymentMethod = paymentReport[i].paymentMethod;
      paymentAmount = Number(paymentReport[i].paymentAmount);
      paymentMethodCount = paymentReport[i].paymentMethodCount;
      if (paymentMethod == undefined) {
        totalPaymentCost += 0
        totalPaymentCount += 0
      } else {
        totalPaymentCost += paymentAmount;
        totalPaymentCount += paymentMethodCount;
      }

      switch (paymentMethod) {
        case 'CHECK':
          checkTotal = Number(paymentReport[i].paymentAmount);
          checkCount = paymentReport[i].paymentMethodCount;
          break;

        case 'CASH':
          cashTotal = Number(paymentReport[i].paymentAmount);
          cashCount = paymentReport[i].paymentMethodCount;
          break;

        case 'VOUCHER':
          voucherTotal = Number(paymentReport[i].paymentAmount);
          voucherCount = paymentReport[i].paymentMethodCount;
          break;
        case 'COMP':
          compTotal = Number(paymentReport[i].paymentAmount);
          compCount = paymentReport[i].paymentMethodCount;
          break;

        case 'STORED_VALUE':
          storedValueTotal = Number(paymentReport[i].paymentAmount);
          storedValueCount = paymentReport[i].paymentMethodCount;
          break;

        case 'EXISTING_FARECARD':
          farecardTotal = Number(paymentReport[i].paymentAmount);
          farecardCount = paymentReport[i].paymentMethodCount;
          break;

        case 'CREDIT':
          creditTotal = Number(paymentReport[i].paymentAmount);
          creditCount = paymentReport[i].paymentMethodCount;
          break;
      }
    }

    // build your receipt based on the totals
    var paymentLabel;
    var cashPaymentText = this.getPaymentTypeDisplayName('CASH');

    if (null != cashPaymentText || 0 < cashTotal) {

      paymentLabel = "Cash      ";

      costText = "          $" + cashTotal.toFixed(2);

      costText = "                          " + cashCount + "   " + costText.substring(costText.length - 10);

      costText = costText.substring(costText.length - 35);

      paymentsReport += "\n" + paymentLabel + costText;

    }

    var checkPaymentText = this.getPaymentTypeDisplayName('CHECK');

    if (null != checkPaymentText || 0 < checkTotal) {
      paymentLabel = "Check     ";

      costText = "          $" + parseFloat(checkTotal).toFixed(2);

      costText = "                          " + checkCount + "   " + costText.substring(costText.length - 10);

      costText = costText.substring(costText.length - 35);

      paymentsReport += "\n" + paymentLabel + costText;
    }

    var creditPaymentText = this.getPaymentTypeDisplayName('CREDIT');

    if (null != creditPaymentText || 0 < creditTotal) {
      paymentLabel = "Credit    ";

      costText = "          $" + parseFloat(creditTotal).toFixed(2);

      costText = "                          " + creditCount + "   " + costText.substring(costText.length - 10);

      costText = costText.substring(costText.length - 35);

      paymentsReport += "\n" + paymentLabel + costText;
    }

    var farecardPaymentText = this.getPaymentTypeDisplayName('EXISTING_FARECARD');

    if (null != farecardPaymentText || 0 < farecardTotal) {
      paymentLabel = "Fare Card ";

      costText = "          $" + parseFloat(farecardTotal).toFixed(2);

      costText = "                          " + farecardCount + "   " + costText.substring(costText.length - 10);

      costText = costText.substring(costText.length - 35);

      paymentsReport += "\n" + paymentLabel + costText;
    }


    var voucherPaymentText = this.getPaymentTypeDisplayName('VOUCHER');

    if (null != voucherPaymentText || 0 < voucherTotal) {
      paymentLabel = "Voucher   ";

      costText = "          $" + parseFloat(voucherTotal).toFixed(2);

      costText = "                          " + voucherCount + "   " + costText.substring(costText.length - 10);

      costText = costText.substring(costText.length - 35);

      paymentsReport += "\n" + paymentLabel + costText;
    }


    var storedValuePaymentText = this.getPaymentTypeDisplayName('STORED_VALUE');

    if (null != storedValuePaymentText || 0 < storedValueTotal) {
      paymentLabel = 'Pay As You Go';

      costText = "          $" + parseFloat(storedValueTotal).toFixed(2);

      costText = "                          " + storedValueCount + "   " + costText.substring(costText.length - 10);

      costText = costText.substring(costText.length - 32);

      paymentsReport += "\n" + paymentLabel + costText;
    }

    var compPaymentText = this.getPaymentTypeDisplayName('COMP');

    if (null != compPaymentText || 0 < compTotal) {
      paymentLabel = "Comp      ";

      costText = "          $" + parseFloat(compTotal).toFixed(2);

      costText = "                          " + compCount + "   " + costText.substring(costText.length - 10);

      costText = costText.substring(costText.length - 35);

      paymentsReport += "\n" + paymentLabel + costText;
    }

    // add totals
    paymentLabel = "TOTAL:    ";

    costText = "          $" + parseFloat(totalPaymentCost).toFixed(2);

    costText = "                          " + totalPaymentCount + "   " + costText.substring(costText.length - 10);

    costText = costText.substring(costText.length - 35);

    paymentsReport += "\n" + paymentLabel + costText;
    //Kept On Purpose
    console.log("paymentsReport123", paymentsReport)

    if (!isSingleUser || isSingleUser == undefined) {
      localStorage.setItem("paymentReceipt", JSON.stringify(paymentReport))
    } else {

    }

    return paymentsReport;

  }

  getPaymentTypeDisplayName(paymentType) {

    var formsofpaymentstore = JSON.parse(localStorage.getItem("printPaymentData"))
    var displayName = null;
    formsofpaymentstore.forEach(element => {
      if (paymentType == element.paymentMethod) {
        displayName = element.paymentMethod
      }
      return displayName
    });

  }

  printAllOrSpecificShiftData(specificUserDetails) {

    try {
      var date = new Date().getTime()
      this.electronService.ipcRenderer.send("printReceiptHeader", true, date);
      console.log("checking header")
    } catch (e) {
      console.log("Exception printing summary header.");
    }

    var shiftStore
    if (specificUserDetails != null) {
      shiftStore = specificUserDetails
    } else {
      shiftStore = JSON.parse(localStorage.getItem("shiftReport"))
    }
    shiftStore.forEach(element => {
      var productReportJSON = []
      var shiftType: any = ''
      var userID: any = ''
      var productsReport: any = "";
      var drawerReport: any = "";
      var currentProductSum: any = 0;
      var productValue: any = 0;
      var productQuantity: any = 0;
      var totalProductsReport: any = "";
      var totalQuantity: any = 0;
      var totalAmountSold: any = 0;
      var productDescription = '';
      var isMerchandise: any = 0;
      var totalFareProductsSoldInShift: any = 0;
      var totalNonFareProductsSoldInShift: any = 0;
      var totalAmountBilledInShift: any = 0;
      var receiptWidth = 44;
      var spacer = '';
      var maxDescriptionLength = (receiptWidth / 2) + 4;
      var padSize = 0;
      var secondPadSize = 0;
      var middlePadSize = Math.floor(receiptWidth / 2) + 10;
      var expectedCashInDrawer = 0
      JSON.parse(localStorage.getItem("backendSalesReport")).forEach(sales => {
        if (element.userID == sales.userID && element.shiftType == sales.shiftType) {
          productReportJSON.push(sales)
        }
      });

      for (var i = 0; i < productReportJSON.length; i++) {

        productDescription = productReportJSON[i].description;
        if (productDescription != undefined) {
          productValue = productReportJSON[i].value;
          productQuantity = productReportJSON[i].quantity;
          totalQuantity += parseFloat(productQuantity);
          totalAmountSold += parseFloat(productValue);
          isMerchandise = productReportJSON[i].isMerchandise;

          if (isMerchandise == 1) {
            totalNonFareProductsSoldInShift += parseFloat(productValue);
          } else {
            totalFareProductsSoldInShift += parseFloat(productValue);
          }
          if (i == 0) {
            productDescription = "\n" + productDescription
          }
          if (productDescription.length >= maxDescriptionLength) {
            productDescription = productDescription.substring(0, maxDescriptionLength) + "...";
          }

          productsReport += "\n\n";
          productsReport = productDescription;

          currentProductSum = productQuantity;

          padSize = middlePadSize - productDescription.length - (currentProductSum.toString()).length;

          while (spacer.length <= (padSize - 1)) {
            spacer += " ";
          }

          productsReport += spacer + currentProductSum;

          var costText = '$' + parseFloat(productValue).toFixed(2);

          secondPadSize = receiptWidth - (padSize + productDescription.length + costText.length + (currentProductSum.toString()).length);

          spacer = '';

          while (spacer.length <= secondPadSize) {
            spacer += " ";
          }

          productsReport += spacer + costText + "\n\n";

          totalProductsReport += productsReport;
        }
      }

      totalAmountBilledInShift = totalFareProductsSoldInShift + totalNonFareProductsSoldInShift;


      JSON.parse(localStorage.getItem("printPaymentData")).forEach(payment => {
        if (element.userID == payment.userID && element.shiftType == payment.shiftType && payment.paymentMethod == "CASH") {
          expectedCashInDrawer = expectedCashInDrawer + payment.paymentAmount
          shiftType = payment.shiftType
          userID = payment.userID
        } else if (element.userID == payment.userID && element.shiftType == payment.shiftType && payment.paymentMethod != "CASH") {
          shiftType = payment.shiftType
          userID = payment.userID
        }
      });

      console.log("expectedCashInDrawer", expectedCashInDrawer);
      drawerReport = this.generateTerminalReport(totalFareProductsSoldInShift, totalNonFareProductsSoldInShift, totalAmountBilledInShift, userID, shiftType, expectedCashInDrawer);
      // add totals
      var productsReportTotalLabel = "TOTAL:    ";
      costText = "          $" + parseFloat(totalAmountSold).toFixed(2);

      costText = costText.substring(costText.length - 10);

      var totalItem = "                                    " + totalQuantity + "   " + costText;

      totalItem = totalItem.substring(totalItem.length - 35);

      totalProductsReport += "\n" + productsReportTotalLabel + totalItem + "\n";

      // Kept On purpose for debugging
      console.log("drawerReport" + drawerReport);
      console.log("totalProductsReport" + totalProductsReport);

      var printTime = new Date().getTime();
      var user1_drawerReport = drawerReport,
        user1_productsReport = totalProductsReport,
        user1_userID = userID,
        user1_isAllUsers = false;

      try {
        this.electronService.ipcRenderer.send("printSummaryReport", user1_drawerReport, user1_productsReport, Number(user1_userID), user1_isAllUsers);
      } catch (e) {
        console.log("Exception printing sales summary.");
      }

    });

    try {

      if (specificUserDetails != null) {
        var pushPayments = []
        var specificUserPayment = JSON.parse(localStorage.getItem("printPaymentData"))
        specificUserPayment.forEach(element => {
          if (element.userID == specificUserDetails[0].userID) {
            pushPayments.push(element)
          }
        });
        var displayingPayments = this.iterateAndFindUniquePaymentTypeString(pushPayments);
        var paymentReport = this.generatePrintReceiptForPayments(displayingPayments, true);
        this.electronService.ipcRenderer.send("printSummaryPaymentsReport", paymentReport);

      } else {
        this.electronService.ipcRenderer.send("printSummaryPaymentsReport", JSON.parse(localStorage.getItem("paymentReceipt")));

      }

    } catch (e) {
      console.log("Exception printing payment summary.");
    }


  }


  generateTerminalReport(fareTotalBilled, NonFareTotalBilled, totalBilled, userID, shiftType, expectedCashInDrawer) {
    console.log("excepting too much abba", expectedCashInDrawer)
    var shiftStore = JSON.parse(localStorage.getItem("shiftReport")),

      openShift = false,
      receipt = "";
    var shiftRecord = null;
    var receiptWidth = 44;
    var openingDrawer = 0
    var closingDrawer = 0

    shiftStore.forEach(element => {
      if (element.userID == userID) {
        openingDrawer = element.openingDrawer
        closingDrawer = element.closingDrawer
      }
    });
    var paymentsTypesArray = [];
    var paymentTypeText = '';
    var shiftTypeText = 'Main shift';

    if (0 == shiftType) {
      shiftTypeText = 'Main shift';
    }

    if (1 == shiftType) {
      shiftTypeText = 'Relief shift';
    }

    receipt += "\nShift Type: " + shiftTypeText + "\n\n";

    var padSize = 0;
    var description = "Fare products:";

    receipt += description;


    var nonFareTotal = parseFloat(NonFareTotalBilled);
    var fareTotal = parseFloat(fareTotalBilled);
    var totalSold = parseFloat(totalBilled);
    var fareText = "$" + (fareTotal).toFixed(2);

    padSize = receiptWidth - (description.length + fareText.length);

    var spacer = '';

    while (spacer.length <= padSize) {
      spacer += " ";
    }

    receipt += spacer + fareText + "\n\n";
    padSize = 0;
    description = "Non-Fare products:";

    receipt += description;


    var nonfareText = "$" + (nonFareTotal).toFixed(2);

    padSize = receiptWidth - (description.length + nonfareText.length);

    var spacer = '';

    while (spacer.length <= padSize) {
      spacer += " ";
    }

    receipt += spacer + nonfareText + "\n\n";


    padSize = 0;
    description = "Total Sold:";

    receipt += description;

    var totalText = "$" + (totalSold).toFixed(2);

    padSize = receiptWidth - (description.length + totalText.length);

    var spacer = '';

    while (spacer.length <= padSize) {
      spacer += " ";
    }

    receipt += spacer + totalText + "\n\n";

    // add drawer totals
    padSize = 0;
    description = "Opening Drawer:";

    receipt += description;

    var openingAmount = 0;
    var actualCash = 0;
    var overShort = 0;

    if ((null != openingDrawer)) {

      openingAmount = Number(openingDrawer);

    }

    if (null != closingDrawer) {
      actualCash = Number(closingDrawer);
    }

    var cashTotal = expectedCashInDrawer;
    var expectedDrawer = cashTotal + openingAmount;

    if (false == openShift) {
      overShort = actualCash - expectedDrawer;
    }


    var drawerText = '$' + openingAmount.toFixed(2);

    padSize = receiptWidth - (description.length + drawerText.length);

    var spacer = '';

    while (spacer.length <= padSize) {
      spacer += " ";
    }

    receipt += spacer + drawerText + "\n\n";

    drawerText = '';

    // add drawer totals
    padSize = 0;

    description = "Expected Cash:";

    receipt += description;

    drawerText = "$" + expectedDrawer.toFixed(2);

    padSize = receiptWidth - (description.length + drawerText.length);

    var spacer = '';

    while (spacer.length <= padSize) {
      spacer += " ";
    }

    receipt += spacer + drawerText + "\n\n";

    drawerText = '';

    // add drawer totals
    padSize = 0;
    description = "Actual Cash:";

    receipt += description;

    drawerText = "$" + actualCash.toFixed(2);

    padSize = receiptWidth - (description.length + drawerText.length);

    var spacer = '';

    while (spacer.length <= padSize) {
      spacer += " ";
    }

    receipt += spacer + drawerText + "\n\n"

    drawerText = '';

    // add drawer totals
    padSize = 0;
    description = "Over/Short:";

    receipt += description;

    var overShortModifier = '';
    if (0 < overShort) {
      overShortModifier = '+';
    } else if (0 > overShort) {
      overShortModifier = '-';
      overShort = expectedDrawer - actualCash;
    }

    if (0 == overShort) {
      drawerText = "$" + overShort.toFixed(2);
    } else {
      drawerText = overShortModifier + ' $' + overShort.toFixed(2);
    }

    padSize = receiptWidth - (description.length + drawerText.length);

    var spacer = '';

    while (spacer.length <= padSize) {
      spacer += " ";
    }

    receipt += spacer + drawerText + "\n\n"


    receipt += "\n";
    return (receipt);
  }

  generateReceipt(timestamp) {

    var paymentsStore
    var transRecord
    var cart
    var transactionObj = JSON.parse(localStorage.getItem("transactionObj"))
    var catalog = JSON.parse(localStorage.getItem("catalogJSON"));
    var storedTransactionID = '';
    var taxAmountValue
    paymentsStore = transactionObj.payments;
    cart = transactionObj.items
    storedTransactionID = transactionObj.transactionID;
    taxAmountValue = transactionObj.taxAmount
    var paymentTypeText = '';
    var receiptWidth = 44;
    var receipt = "";
    var signatureRequired: any = false;
    var customerCopyReceipt = "";
    var changeDue = 0;
    var padSize = 0;
    var transText = "Trans ID:";
    var isMerchandise: Boolean
    var walletTypeId = 0;
    receipt += transText;
    padSize = receiptWidth - (transText.length + storedTransactionID.toString().length);

    var spacer = '';

    while (spacer.length <= (padSize - 1)) {
      spacer += " ";
    }

    receipt += spacer + storedTransactionID + "\n";

    var transTypeLabel = "Trans Type:";
    var transType = "Sale";

    padSize = receiptWidth - (transTypeLabel.length + transType.length);

    spacer = '';

    while (spacer.length <= (padSize - 1)) {
      spacer += " ";
    }

    receipt += transTypeLabel + spacer + transType + "\n";

    var anythingToPrint = false;

    if (cart.length > 0) {
      console.log("Receipt printing, detected wallets.");
      anythingToPrint = true;
    } else {
      console.log("Receipt printing, did not detect any wallets.");
    }
  
    if (anythingToPrint) {
      console.log("Detected items to print.");
    } else {
      console.warn("Receipt printing, failed to detect anything to print.");
      return;
    }

    receipt += "\n";

    var walletContents
    cart.forEach(element => {
      if (element.IsMerchandise == true) {
        isMerchandise = element.IsMerchandise
        walletTypeId = element.walletTypeId
        var catalogJson = JSON.parse(catalog).Offering
        catalogJson.forEach(catalogElement => {
          if (catalogElement.ProductIdentifier == element.productIdentifier) {
            return element.description = catalogElement.Description
          }

        });
        var lineItem = element.description + "";
        var lineItemQty = " - Qty: " + element.quantity + " ";
        if (lineItem.length > (35 - lineItemQty.length)) {
          lineItem = lineItem.substring(0, (35 - lineItemQty.length));
        }

        lineItem = lineItem + lineItemQty + "                                   ";
        lineItem = lineItem.substring(0, 35);

        var subtotalStr = "          $" + (element.unitPrice * element.quantity).toFixed(2);

        subtotalStr = subtotalStr.substring(subtotalStr.length - 10);

        receipt += lineItem + subtotalStr + "\n\n";
      } else {

        var PID = element.cardPID;
        var cardText = "Card ID:";

        receipt += cardText;
        padSize = receiptWidth - (cardText.length + PID.length);
        spacer = '';

        while (spacer.length <= (padSize - 1)) {
          spacer += " ";
        }

        receipt += spacer + PID + "\n";

        var dashes = "";
        while (dashes.length <= receiptWidth) {
          dashes += "-";
        }

        receipt += dashes + "\n";
        if (element.description == undefined) {
          var lineItem = "Card:" + PID + "";
        } else {
          var lineItem = element.description + "";
        }

        var lineItemQty = " - Qty: 1 ";

        if (lineItem.length > (35 - lineItemQty.length)) {
          lineItem = lineItem.substring(0, (35 - lineItemQty.length));
        }

        lineItem = lineItem + lineItemQty + "                                   ";
        lineItem = lineItem.substring(0, 35);

        var subtotalStr = "          $" + (element.unitPrice).toFixed(2);

        subtotalStr = subtotalStr.substring(subtotalStr.length - 10);

        receipt += lineItem + subtotalStr + "\n\n";




        walletContents = element.walletContentItems
        console.log("walletContents", walletContents);
        walletContents.forEach(item => {
          walletTypeId = item.walletTypeId
          //  isMerchandise = item.IsMerchandise
          JSON.parse(catalog).Offering.forEach(catalogElement => {
            if (catalogElement.Ticket != undefined) {
              if (catalogElement.ProductIdentifier == item.productIdentifier) {
                return item.description = catalogElement.Ticket.Description
              }
            }
          });
          var lineItem = item.description + "";
          var lineItemQty = " - Qty: " + item.quantity + " ";
          if (lineItem.length > (35 - lineItemQty.length)) {
            lineItem = lineItem.substring(0, (35 - lineItemQty.length));
          }

          lineItem = lineItem + lineItemQty + "                                   ";
          lineItem = lineItem.substring(0, 35);

          var subtotalStr = "          $" + (item.unitPrice * item.quantity).toFixed(2);

          subtotalStr = subtotalStr.substring(subtotalStr.length - 10);

          receipt += lineItem + subtotalStr + "\n\n";

        })
      }



    });



    var totalDue = localStorage.getItem("transactionAmount")
    var taxtotalDue = taxAmountValue
    var faretotalDue = localStorage.getItem("transactionAmount")

    var faretotalStr = "";
    var taxtotalStr = "";

    var totalStr = "";

    if ("0" == totalDue) {
      totalStr = '$0.00';
    } else {
      totalStr = "$" + Number(totalDue).toFixed(2);
    }

    if ("0" == faretotalDue) {
      faretotalStr = '$0.00';
    } else {
      faretotalStr = "$" + Number(faretotalDue).toFixed(2);
    }

    if (0 == taxtotalDue) {
      taxtotalStr = '$0.00';
    } else {
      taxtotalStr = "$" + taxtotalDue.toFixed(2);
    }

    totalStr = "                    " + totalStr;
    faretotalStr = "              " + faretotalStr;
    taxtotalStr = "              " + taxtotalStr;
    totalStr = totalStr.substring(totalStr.length - 20);
    if (isMerchandise == true) {
      receipt += "\nFare TOTAL:              " + faretotalStr + "\n\n";
      receipt += "\nTax TOTAL:               " + taxtotalStr + "\n\n";

    }

    receipt += "\nTOTAL:                   " + totalStr + "\n\n";

    var paymentAmount = "";
    var paymentId = 0;

    // possible add for payment type and change due
    paymentsStore.forEach(paymentRecord => {
      paymentId = paymentRecord.paymentMethodId;
      paymentTypeText = ""

      switch (paymentId) {
        case 1:
          paymentTypeText = "Invoiced"
          break;
        case 2:
          paymentTypeText = "Cash"
          break;
        case 3:
          paymentTypeText = "Check"
          break;
        case 4:
          paymentTypeText = "Amex"
          break;
        case 5:
          paymentTypeText = "Visa"
          break;
        case 6:
          paymentTypeText = "Mastercard"
          break;
        case 7:
          paymentTypeText = "Discover"
          break;
        case 8:
          paymentTypeText = "Comp"
          break;
        case 9:
          paymentTypeText = "Credit"
          break;
        case 10:
          paymentTypeText = "Fare_card"
          break;
        case 11:
          paymentTypeText = "Voucher"
          break;
        case 12:
          paymentTypeText = "Stored_value"
          break;
        default:
          paymentTypeText = "UNKNOWN"
          break;
      }

      // if the payment method is cash, you want to give the full amount tendered.
      //    that is the amount we stored + the change due
      if (null != paymentId) {

        if (2 == paymentId) {
          let shoppingCart = JSON.parse(localStorage.getItem("shoppingCart"));
          let indexOfCashPayment = Utils.getInstance.checkIsPaymentMethodExists(2, shoppingCart);
          if (-1 != indexOfCashPayment) {
            changeDue = shoppingCart._payments[indexOfCashPayment].cashback;
            if (undefined == changeDue) {
              changeDue = 0;
            }
          }
          paymentAmount = "          $" + Number(paymentRecord.amount).toFixed(2);
        } else {
          if (paymentRecord.amount != null) {
            paymentAmount = "          $" + Number(paymentRecord.amount).toFixed(2);
          }
        }
      }

      var paymentTenderedItem = "Payment tendered: " + paymentTypeText + "                                   ";

      paymentTenderedItem = paymentTenderedItem.substring(0, 35);

      paymentAmount = paymentAmount.substring(paymentAmount.length - 10);

      receipt += "\n" + paymentTenderedItem + paymentAmount + "\n";

      if (9 == paymentId) {
        var cardRecord: any = ""
        var cardIssuerName = "";
        var cardDetails: any = localStorage.getItem("pinPadTransactionData");
        cardRecord = JSON.parse(JSON.stringify(eval("(" + cardDetails + ")")));
        console.log("cardRecord", cardRecord)
        /*
         * 1: Visa
            2: Mastercard 
            3: Discover
            4: Amex
            6: Diners
            8: JCB
         */

        // TODO: refactor
        switch (cardRecord.issuer) {
          case 1:
            cardIssuerName = "Visa"
            break;
          case 2:
            cardIssuerName = "Mastercard"
            break;
          case 3:
            cardIssuerName = "Discover"
            break;
          case 4:
            cardIssuerName = "Amex"
            break;
          case 6:
            cardIssuerName = "Diners"
            break;
          case 8:
            cardIssuerName = "JCB"
            break;
          default:
            cardIssuerName = "UNKNOWN"
            break;
        }


        receipt += cardIssuerName + " XXXXXXXXXXXX" + cardRecord.last4 + "\n";

        receipt += "AUTH: " + cardRecord.auth_code + "\n\n";

        if (null != cardRecord.appLabel)
          receipt += "App Label: " + cardRecord.appLabel + "\n\n";
        if (null != cardRecord.tvr)
          receipt += "TVR: " + cardRecord.tvr + "\n\n";
        if (null != cardRecord.appLabel)
          receipt += "AID: " + cardRecord.aid + "\n\n";
        if (null != cardRecord.appLabel)
          receipt += "TSI: " + cardRecord.tsi + "\n\n";


      }

    });

    // if cash was one of your payment types, figure out if there's any change due
    if (paymentId == 2) {
      var changeDueLabel = "CHANGE DUE:              ";
      var changeDueStr = "";

      changeDueStr = "$" + (changeDue.toFixed(2));
      changeDueStr = "                    " + changeDueStr;

      changeDueStr = changeDueStr.substring(changeDueStr.length - 20);

      receipt += "\n" + changeDueLabel + changeDueStr;
    }

    cart.forEach(item => {
      walletTypeId = item.walletTypeId;
      if (walletTypeId == MediaType.SMART_CARD_ID) {
        var cardBalance = "",
          textProductType = "",
          remainingRides: any = 0;
        if (item.IsMerchandise != true) {
          receipt += "\n\n             Current Card Balance\n\n";
          var cards = JSON.parse(localStorage.getItem("cardsData"));
          let cardStore = this.findByCardPIDFromCardsData(cards, item.cardPID);
          var receiptWidth = 44;
          var dashes = "";
          while (dashes.length <= receiptWidth) {
            dashes += "-";
          }

          receipt += dashes + "\n";
          var PID = cardStore.printed_id;
          var cardText = "Card ID:";
          receipt += cardText;
          padSize = receiptWidth - (cardText.length + PID.length);
          spacer = '';

          while (spacer.length <= (padSize - 1)) {
            spacer += " ";
          }

          receipt += spacer + PID + "\n";

          if (cardStore.products) {

            for (var i = 0; i < cardStore.products.length; i++) {

              var dataItem = cardStore.products[i];

              var productType = dataItem.product_type;
              var designator = dataItem.designator;
              var days = dataItem.days;
              var rechargesPending = dataItem.recharges_pending;
              var remainingValue = dataItem.remaining_value;
              var remainingRides = dataItem.remaining_rides;
              var start_date = dataItem.start_date_str;
              var exp_date = dataItem.exp_date_str;
              var start_date_epoch_days = dataItem.start_date_epoch_days;
              var exp_date_epoch_days = dataItem.exp_date_epoch_days;
              var bad_listed = dataItem.is_prod_bad_listed;
              var textProductType = '';
              var cardBalance = '';
              var productDescription = '';
              var productStatus = '';
              var addTime = 0
              switch (productType) {
                case 1:
                  if (null != dataItem.add_time) {
                    addTime = dataItem.add_time;
                  }
                  if (exp_date_epoch_days > 1) {
                    cardBalance = "Exp: " + Utils.getInstance.getProductExpirationDate(exp_date_epoch_days, addTime) + " " + Utils.getInstance.getProductExpirationTime(addTime);
                  } else {
                    cardBalance = (days + 1) + " Days";
                  }

                  productDescription = (days + 1) + " Day Pass";

                  if (rechargesPending > 0) {
                    productStatus += " (" + rechargesPending + " Pending)"
                  }

                  break;
                case 2:
                  if (1 == remainingRides) {
                    cardBalance = remainingRides + " Ride";
                  } else {
                    cardBalance = remainingRides + " Rides";
                  }
                  productDescription = 'Stored Ride Pass';
                  break;
                case 3:

                  var remaining_value = 0;

                  if (dataItem.remaining_value && dataItem.remaining_value > 0) {
                    remaining_value = dataItem.remaining_value / 100;
                  }

                  productDescription = 'Pay As You Go';
                  cardBalance = "$" + remaining_value.toFixed(2);

                  break;
                case 7:

                  productDescription = "Employee Pass";

                  if (exp_date_epoch_days > 1) {
                    cardBalance = "Exp: " + exp_date;
                  }

                  break;
                default:
                  productDescription = "Unknown Product";
                  break;
              }

              JSON.parse(catalog).Offering.forEach(catalogElement => {
                if (catalogElement.Ticket != undefined) {
                  if (catalogElement.Ticket.Group == productType && (catalogElement.Ticket.Designator == designator)) {
                   
                    return productDescription = catalogElement.Ticket.Description

                  }
                }
              });


              // don't print anything if your stored value is $0
              if ((3 != productType) || (0 < remaining_value)) {

                var receiptWidth = 44;
                var padSize = 0;
                var maxDescriptionLength = receiptWidth - 16;

                if (productDescription.length >= maxDescriptionLength) {
                  productDescription = productDescription.substring(0, maxDescriptionLength).trim() + "... ";
                }

                receipt += productDescription;

                padSize = receiptWidth - (productDescription.length + cardBalance.length);

                var spacer = '';

                while (spacer.length <= (padSize - 1)) {
                  spacer += " ";
                }

                receipt += spacer + cardBalance + "\n";
              }
            }
            receipt += "\n";
          }
          else {
            console.log("Receipt printing: No smart cards stored.");
          }
        }
      }

    })

    paymentsStore.forEach(paymentRecord => {
      paymentId = paymentRecord.paymentMethodId;
      if (9 == paymentId) {
        signatureRequired = true;

        receipt += "\n\n\n";

        var receiptWidth = 44;
        var signatureLine = "SIGNATURE: ";
        while (signatureLine.length <= receiptWidth) {
          signatureLine += "_";
        }

        receipt += signatureLine + "\n\n\n";

        customerCopyReceipt = receipt;

        receipt += "               MERCHANT COPY\n\n\n";
        customerCopyReceipt += "               CUSTOMER COPY\n\n\n";

      }
    })

    receipt += "\n\n";
    console.log("receipt", receipt)
    localStorage.setItem("lastTransactionReceipt", receipt)
    this.electronService.ipcRenderer.send('printReceipt', receipt, timestamp)
    console.log(receipt + 'generateReceipt receipt ');
    console.log(customerCopyReceipt + 'generateReceipt customerCopyReceipt ');
    if (signatureRequired == true) {
      this.electronService.ipcRenderer.send('printReceipt', customerCopyReceipt, timestamp);
    }
  }

  generateRefundReceipt() {

    console.log('refund Receipt ');

    var paymentTypeText = '';
    var refundReceipt = "";
    var refundTransactionRecord = null;
    var customerCopy = ""
    var isCreditPayment: any = false;
    var transactionID = '';
    var totalDue = 0;
    var cardStore = JSON.parse(localStorage.getItem("cardsData"));
    var PID = null;
    var padSize = 0;
    var secondPadSize = 0;
    var middlePadSize = 0;
    var receiptWidth = 44;
    var maxDescriptionLength = (receiptWidth / 2) - 5;
    var costText = '';
    var nonEncodeableProducts = '';
    var nonFareProducts = '';
    var dashes = "";
    var starBar = "";

    refundTransactionRecord = JSON.parse(localStorage.getItem("shoppingCart"));
    transactionID = refundTransactionRecord._transactionID;


    while (dashes.length <= receiptWidth) {
      dashes += "-";
    }
    dashes += "\n";

    while (starBar.length <= receiptWidth) {
      starBar += "*";
    }
    starBar += "\n";

    if (null != cardStore.length) {
      PID = cardStore.printed_id;
    }
   
    refundReceipt += "\n" + this.centerText("REFUNDED  TRANSACTION") + "\n\n";


    var productDescription = '';
    var quantity = 0;
    var cart = this.getCart();

    if (cart._walletLineItem.length == 0) {
      cart = null
    }

    cart._walletLineItem.forEach(walletLineItem => {
      var walletContentData = walletLineItem._walletContents
      //if (MediaType.SMART_CARD_ID == walletLineItem._walletTypeId) {
      padSize = 0;
      secondPadSize = 0;
      middlePadSize = Math.floor(receiptWidth / 2) + 3;
      if (walletLineItem._description == "Merch*" || walletLineItem._description == "1New Magnetics") {

      } else {
        productDescription = walletLineItem._description;
      }

      if (null == productDescription || undefined == productDescription) {
        productDescription = '';
      }

      if (productDescription.length >= maxDescriptionLength) {
        productDescription = productDescription.substring(0, maxDescriptionLength) + "...";
      }

      var cards = JSON.parse(localStorage.getItem("cardsData"));

      let cardStore = this.findByCardPIDFromCardsData(cards, walletLineItem._cardPID);

      refundReceipt += "\n";
      if (cardStore != null) {
        refundReceipt += this.centerText("CARD: " + cardStore.printed_id);
      }

      refundReceipt += "\n\n";

      refundReceipt += productDescription;

      padSize = middlePadSize - productDescription.length;

      var spacer = '';
      if (walletLineItem._description == "Merch*" || walletLineItem._description == "1New Magnetics") {
        var quantityofCards: any = "";
      } else {
        quantityofCards = 1;

      }
      while (spacer.length <= (padSize - 1)) {
        spacer += " ";
      }

      refundReceipt += spacer + quantityofCards;

      if (true == walletLineItem._newCard) {
        costText = '$' + walletLineItem._unitPrice.toFixed(2);

        secondPadSize = receiptWidth - (padSize + productDescription.length + costText.length + (quantityofCards).toString().length);

        spacer = '';

        while (spacer.length <= (secondPadSize - 1)) {
          spacer += " ";
        }

        refundReceipt += spacer + costText;
      }

      refundReceipt += "\n";

      walletContentData.forEach(contentItem => {
        padSize = 0;
        secondPadSize = 0;
        middlePadSize = Math.floor(receiptWidth / 2) + 3;

        productDescription = contentItem._description;

        if (null == productDescription || undefined == productDescription) {
          productDescription = '';
        }

        if (productDescription.length >= maxDescriptionLength) {
          productDescription = productDescription.substring(0, maxDescriptionLength) + "...";
        }

        //refundReceipt += "\n";
        refundReceipt += productDescription;

        padSize = middlePadSize - productDescription.length;

        var spacer = '';

        while (spacer.length <= (padSize - 1)) {
          spacer += " ";
        }

        refundReceipt += spacer + contentItem._quantity;

        costText = '$' + (contentItem._unitPrice * contentItem._quantity).toFixed(2);

        secondPadSize = receiptWidth - (padSize + productDescription.length + costText.length + (contentItem._quantity).toString().length);

        spacer = '';

        while (spacer.length <= (secondPadSize - 1)) {
          spacer += " ";
        }

        refundReceipt += spacer + costText;

        refundReceipt += "\n";
      });
   
    });

    var productLineItem = null;

    console.log("Trying to print magnetics refund receipt");
    var cart1 = this.getCart();
    if (cart1._walletLineItem.length == 0) {
      cart1 = null;
    }
    if (null != cart1) {

      cart1._walletLineItem.forEach(item => {

        if (item._walletTypeId == 10) {

          padSize = 0;
          secondPadSize = 0;
          middlePadSize = Math.floor(receiptWidth / 2) + 3;

          productDescription = item._description;

          if (null == productDescription || undefined == productDescription) {
            productDescription = '';
          }

          if (productDescription.length >= maxDescriptionLength) {
            productDescription = productDescription.substring(0, maxDescriptionLength) + "...";
          }

          nonEncodeableProducts += productDescription;

          padSize = middlePadSize - productDescription.length;

          var spacer = '';

          while (spacer.length <= (padSize - 1)) {
            spacer += " ";
          }

          var quantityMagentic = "1";

          nonEncodeableProducts += spacer + quantityMagentic;

          costText = '$' + item._unitPrice.toFixed(2);

          secondPadSize = receiptWidth - (padSize + productDescription.length + costText.length + quantityMagentic.length);

          spacer = '';

          while (spacer.length <= (secondPadSize - 1)) {
            spacer += " ";
          }

          nonEncodeableProducts += spacer + costText;

          nonEncodeableProducts += "\n";

        }
      });
    }

    console.log("Trying to print non-fare refund receipt");


    var paymentLabel;
    var cashTotal;
    var paymentsReport = "",
      totalPaymentCount: any = 0,
      totalPaymentCost: any = 0,
      costText = '',
      checkTotal: any = 0,
      creditTotal: any = 0,
      farecardTotal: any = 0,
      voucherTotal: any = 0,
      compTotal: any = 0,
      storedValueTotal: any = 0;

    var cashCount: any = 0,
      checkCount: any = 0,
      creditCount: any = 0,
      farecardCount: any = 0,
      voucherCount: any = 0,
      compCount: any = 0,
      storedValueCount: any = 0,
      paymentMethod: any,
      paymentAmount: any = 0,
      paymentMethodCount: any = 0;
    var cashTotal: any = 0;
 
    var getReport = this.getCart();
    var paymentReport = getReport._payments

    for (var i = 0; i < paymentReport.length; i++) {
      if (paymentReport[i].paymentMethod != undefined) {
        paymentMethod = Number(paymentReport[i].paymentMethodId);
        paymentAmount = Number(paymentReport[i].amount);
        totalPaymentCost += paymentAmount;
        console.log("Payment Method: " + paymentMethod);
        switch (paymentMethod) {
          case 3:
            checkTotal = Number(paymentReport[i].amount);
            break;

          case 2:
            cashTotal = Number(paymentReport[i].amount);
            break;

          case 11:
            voucherTotal = Number(paymentReport[i].amount);
            break;
          case 8:
            compTotal = Number(paymentReport[i].amount);
            break;

          case 12:
            storedValueTotal = Number(paymentReport[i].amount);
            break;

          case 10:
            farecardTotal = Number(paymentReport[i].amount);
            break;

          case 9:
            creditTotal = Number(paymentReport[i].amount);
            break;
        }
      }
    }


    if (0 < cashTotal) {
      paymentLabel = "Cash      ";
      costText = "          $" + cashTotal.toFixed(2);
      costText = "                              " + costText.substring(costText.length - 10);
      costText = costText.substring(costText.length - 34);
      paymentsReport += "\n" + paymentLabel + costText;
    }

    if (0 < checkTotal) {
      paymentLabel = "Check     ";
      costText = "          $" + checkTotal.toFixed(2);
      costText = "                              " + costText.substring(costText.length - 10);
      costText = costText.substring(costText.length - 34);
      paymentsReport += "\n" + paymentLabel + costText;
    }

    if (0 < creditTotal) {
      paymentLabel = "Credit    ";
      costText = "          $" + creditTotal.toFixed(2);
      costText = "                              " + costText.substring(costText.length - 10);
      costText = costText.substring(costText.length - 34);
      paymentsReport += "\n" + paymentLabel + costText;
    }

    if (0 < farecardTotal) {
      paymentLabel = "Fare Card ";
      costText = "          $" + farecardTotal.toFixed(2);
      costText = "                              " + costText.substring(costText.length - 10);
      costText = costText.substring(costText.length - 34);
      paymentsReport += "\n" + paymentLabel + costText;
    }

    if (0 < voucherTotal) {
      paymentLabel = "Voucher   ";
      costText = "          $" + voucherTotal.toFixed(2);
      costText = "                              " + costText.substring(costText.length - 10);
      costText = costText.substring(costText.length - 34);
      paymentsReport += "\n" + paymentLabel + costText;
    }

    if (0 < storedValueTotal) {
      paymentLabel = 'Pay As You Go';
      costText = "          $" + storedValueTotal.toFixed(2);
      costText = "                              " + costText.substring(costText.length - 10);
      costText = costText.substring(costText.length - 34);
      paymentsReport += "\n" + paymentLabel + costText;
    }

    if (0 < compTotal) {
      paymentLabel = "Comp      ";
      costText = "          $" + compTotal.toFixed(2);
      costText = "                              " + costText.substring(costText.length - 10);
      costText = costText.substring(costText.length - 34);
      paymentsReport += "\n" + paymentLabel + costText;
    }

    if (0 < totalPaymentCost) {
      paymentLabel = "TOTAL REFUND:  ";
      costText = "          $" + totalPaymentCost.toFixed(2);
      costText = "                              " + costText.substring(costText.length - 15);
      costText = costText.substring(costText.length - 29);
      paymentsReport += "\n" + paymentLabel + costText + "\n";
    }

    //Print card summary

    var cardBalance = this.getCardSummary(0);

    for (var i = 0; i < paymentReport.length; i++) {
      if (paymentReport[i].paymentMethodId == 9) {
        isCreditPayment = true
      }
    };

    try {
      // customerCopy += "               CUSTOMER COPY\n\n\n";
      var receiptContents =
        refundReceipt +
        nonEncodeableProducts +
        nonFareProducts +
        dashes +
        paymentsReport +
        "\n" +
        starBar +
        cardBalance;

      this.electronService.ipcRenderer.send("printRefundReceipt", receiptContents, new Date().getTime());

      if (isCreditPayment == true) {

        var customerCopyReceipt =
          refundReceipt +
          nonEncodeableProducts +
          nonFareProducts +
          dashes +
          "\n" +
          starBar

        this.electronService.ipcRenderer.send("printCustomerRefundReceipt", customerCopyReceipt, new Date().getTime());
      }

    } catch (e) {
      console.log("ERROR! Exception printing receipt.");
    }

    return refundReceipt;

  }


  getCardSummary(cardCount) {
    var cardProductsStore
    var cards = ''
    var receipt = '';
    if (cardCount == 1) {
      cardProductsStore = JSON.parse(localStorage.getItem('readCardData'));
      cardProductsStore = new Array(JSON.parse(cardProductsStore))
    } else {
      cardProductsStore = JSON.parse(localStorage.getItem("cardsData"))
      cards += "\n\n              Card(s) Balance    \n\n";
      receipt += cards
    }

    var addTime = 0;
    var dashes = "";
    var receiptWidth = 44

    while (dashes.length <= receiptWidth) {
      dashes += "-";
    }
    var padSize = 0
    var cardText = "Card ID:";

    cardProductsStore.forEach(productRecord => {

      if (cardCount != 1) {
        var spacer = '';
        var PID = productRecord.printed_id
        receipt += cardText;
        padSize = receiptWidth - (cardText.length + PID.length);
        while (spacer.length <= (padSize - 1)) {
          spacer += " ";
        }
        receipt += spacer + PID + "\n";
        receipt += dashes
        receipt += "\n"
      }

      addTime = 0;
      var products = productRecord.products;
      products.forEach(dataItem => {
        var productType = dataItem.product_type;
        var designator = dataItem.designator;
        var days = dataItem.days;
        var rechargesPending = dataItem.recharges_pending;
        var remainingRides = dataItem.remaining_rides;
        var exp_date = dataItem.exp_date_str;
        var exp_date_epoch_days = dataItem.exp_date_epoch_days;

        if (null != dataItem.add_time) {
          addTime = dataItem.add_time;
        }

        var cardBalance = '';
        var productExpirationTime = "";
        var productDescription = '';
        var productStatus = '';

        switch (productType) {
          case 1:

            if (parseInt(exp_date_epoch_days) > 0) {
              cardBalance = "Exp: " + Utils.getInstance.getProductExpirationDate(exp_date_epoch_days, addTime);
              productExpirationTime = Utils.getInstance.getProductExpirationTime(addTime);
            } else {
              cardBalance = (days + 1) + " Days";
            }

            productDescription = (days + 1) + " Day Pass";

            break;
          case 2:
            if (1 == remainingRides) {
              cardBalance = remainingRides + " Ride";
            } else {
              cardBalance = remainingRides + " Rides";
            }
            productDescription = 'Stored Ride Pass';
            break;
          case 3:

            var remaining_value = 0;

            if (dataItem.remaining_value && dataItem.remaining_value > 0) {
              remaining_value = dataItem.remaining_value / 100;
            }

            productDescription = 'Pay As You Go';
            cardBalance = "$ " + remaining_value.toFixed(2);

            break;
          case 7:

            productDescription = "Employee Pass";

            if (exp_date_epoch_days > 0) {
              cardBalance = "Exp: " + exp_date;
            }

            break;
          default:
            productDescription = "Unknown Product";
            break;
        }

        var ticketKey = productType + "_" + designator;

        var receiptWidth = 44;

        // 16 is the magic number here because it's how long the expiration date would be
        //    for an active period pass
        var maxDescriptionLength = receiptWidth - 16;

        var pendingProductDescription = "";
        if ((1 == productType) && (rechargesPending)) {

          //
          var rechargesText = " (" + rechargesPending + " Pending)";
          if ((rechargesText.length + productDescription.length) < maxDescriptionLength) {
            productDescription += rechargesText;
          } else {
            pendingProductDescription = "  " + rechargesText;
          }
        }

        // don't print anything if your stored value is $0
        if ((3 != productType) || (0 < remaining_value)) {


          var padSize = 0;


          if (productDescription.length >= maxDescriptionLength) {
            productDescription = productDescription.substring(0, maxDescriptionLength).trim() + "... ";
          }

          receipt += productDescription;

          padSize = receiptWidth - (productDescription.length + cardBalance.length);

          var spacer = '';

          while (spacer.length <= (padSize - 1)) {
            spacer += " ";
          }

          receipt += spacer + cardBalance + "\n";

          // put the period pass expiration time or extra pending passes on the next line so it fits
          if ("" !== productExpirationTime || "" !== pendingProductDescription) {
            spacer = '';
            padSize = receiptWidth - (pendingProductDescription.length + productExpirationTime.length);

            while (spacer.length <= (padSize - 1)) {
              spacer += " ";
            }

            receipt += pendingProductDescription + spacer + productExpirationTime + "\n\n";
          } else {
            receipt += "\n";
          }
        } else {
          console.log("Summary printer says stored value was $0");
        }

      });
    });

    return receipt;

  }

  getCurrentTransaction() {

    this.verifyTransactionStore();

    var currentTransactionStore = JSON.parse(localStorage.getItem("shoppingCart"))

    var currentTransaction;

    if (currentTransactionStore.length > 0) {
      currentTransaction = currentTransactionStore
    }

    return currentTransaction;
  }

  verifyTransactionStore() {

    var currentTransactionStore = JSON.parse(localStorage.getItem("shoppingCart"))
    // currentTransactionStore.sync();
    var storeCount = currentTransactionStore.length;

    if (0 == storeCount) {
      // just add one record to get it back to having one empty record
      currentTransactionStore = []
      currentTransactionStore.push({
        transactionID: '',
        totalPaymentsApplied: 0,
        numPaymentTypes: 0,
        totalCashApplied: 0,
        cashBack: 0,
        totalCheckApplied: 0,
        totalCreditApplied: 0,
        totalFarecardsApplied: 0,
        totalVouchersApplied: 0,
        storedValueCardPID: '',
        storedValueCardUID: '',
        storedValueSlot: 0,
        storedValueBalance: 0,
        totalStoredValueApplied: 0,
        totalCompApplied: 0,
        currentCompApplied: 0,
        compReason: '',
        creditUsed: false,
        debitUsed: false,
        x_trans_id: '',
        x_auth_code: '',
        x_issuer: 0,
        x_last4: '',
        x_amount: '',
        x_response_code: '',
        x_response_reason_text: '',
        fareCode: ''
      });
    }
    else if (1 < storeCount) {
      for (var i = 1; i < storeCount; i++) {
        currentTransactionStore.removeAt(i);
      }
    }
  }

  getCart() {
    //"use strict";
    var cartStore = JSON.parse(localStorage.getItem("shoppingCart"));

    var cart;

    if (cartStore._walletLineItem.length > 0) {
      cart = cartStore

    } else {
      // initialize cart
      cart = []
      var newCart = {
        _walletLineItem: []
      };

      cart.push(newCart);
      // this.cartStore.sync();
      //cart = cartStore

    }

    return cart;
  }

  centerText(textToCenter) {
    var centeredText = '';
    var textLength = textToCenter.toString().length;
    var receiptWidth = 44;

    var middlePadSize = Math.floor(receiptWidth / 2);

    var padSize = middlePadSize - (Math.ceil(textLength / 2));

    var spacer = '';

    while (spacer.length <= (padSize - 1)) {
      spacer += " ";
    }

    centeredText = spacer + textToCenter;

    return centeredText;
  }


  printCardSummary() {
    var PID = null;
    var cardStore = JSON.parse(localStorage.getItem('readCardData'));
    cardStore = new Array(JSON.parse(cardStore))
    var loginStore = JSON.parse(localStorage.getItem("shiftReport"));
    var username = '';

    cardStore.forEach(element => {
      PID = element.printed_id
    });

    username = localStorage.getItem("userID")

    var receipt = this.getCardSummary(1);
    try {
      this.electronService.ipcRenderer.send("printCardSummary", receipt, PID, username, new Date().getTime());
    } catch (e) {
      console.log("Exception printing card summary.");
    }
  }

  login(username: string, password: string): Observable<any> {
    let userInfo = { username: username, password: password }
    return this.http.post('https://cdta-uat.gfcp.io/login', JSON.stringify(userInfo), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        "accept": "application/json"
      },
      responseType: 'json'

    })
      .pipe(
        map((result: any) => {
          console.log('user data', result)
          return result
        }
        ),
        catchError(this.handleError)
      );
  }

  jsonData(): Observable<any> {

    return this.http.post('https://api.staging.gfcp.io/services/device/v5/auth?tenant=CDTA&type=apos&serialNumber=APOS289&password=08e0668a-4226-4d0f-9f9e-79edb3e4b3b4', '', {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        "accept": "application/json"
      },
      responseType: 'json'

    })
      .pipe(
        map((result: any) => {
          console.log('user data', result)
          return result
        }
        ),
        catchError(this.handleError)
      );
  }

  uploadImage(data: any): Observable<Object> {

    return this.http.post(apiUrl, data,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          "accept": "application/json"
        },
        responseType: 'text'
      })
      .pipe(
        map((result: any) => {
          return result
        }
        ),
        catchError(this.handleError)
      );
  }



  cardData() {
    return this
      .http
      .get(`${apiUrl}`);
  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network error occurred. Handle it accordingly.
      console.error('An error occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
    }
    // return an observable with a user-facing error message
    return throwError('Something bad happened; please try again later.');
  };

  private extractData(res: Response) {
    let body = res;
    return body || {};
  }
  findByCardPIDFromCardsData(cardsJson, cardPID) {

    let cardData = null;
    for (let index = 0; index < cardsJson.length; index++) {
      if (cardPID == cardsJson[index].printed_id) {
        cardData = cardsJson[index];
        break;
      }
    }
    return cardData;
  }
}


