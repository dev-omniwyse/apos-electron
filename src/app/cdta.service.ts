import { Injectable, NgZone } from '@angular/core';
import { Observable, of, throwError, Subject } from 'rxjs';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { catchError, tap, map } from 'rxjs/operators';
import { ElectronService } from 'ngx-electron';


@Injectable({
  providedIn: 'root'
})

export class CdtaService {
  constructor(private http: HttpClient, private electronService: ElectronService, private _ngZone: NgZone) {
    this.electronService.ipcRenderer.on('printSummaryReportResult', (event, data) => {
      if (data != undefined && data != "") {
        this._ngZone.run(() => {
        });
      }
    });

    this.electronService.ipcRenderer.on('printReceiptHeaderResult', (event, data) => {
      if (data != undefined && data != "") {
        this._ngZone.run(() => {
        });
      }
    });

    this.electronService.ipcRenderer.on('printSummaryPaymentsReportResult', (event, data) => {
      if (data != undefined && data != "") {
        this._ngZone.run(() => {
          this.electronService.ipcRenderer.removeAllListeners("salesDataResult")
          this.electronService.ipcRenderer.removeAllListeners("paymentsDataResult")

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
  // Observable string sources
  private headerShowHideSource = new Subject<string>();

  // Observable string streams
  headerShowHide$ = this.headerShowHideSource.asObservable();

  // Service message commands
  announceHeaderShowHide(mission: string) {
    this.headerShowHideSource.next(mission);
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
    // paymentReportCount = Object.keys(paymentReport).length;

    for (var i = 0; i < paymentReport.length; i++) {

      paymentMethod = paymentReport[i].paymentMethod;
      paymentAmount = Number(paymentReport[i].paymentAmount);
      paymentMethodCount = paymentReport[i].paymentMethodCount;

      totalPaymentCost += paymentAmount;
      totalPaymentCount += paymentMethodCount;
      console.log("Payment Method: " + paymentMethod);
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
    // var record = null;
    // var recordNotFound = -1;
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
      // printReceiptHeader(true, new Date().getTime());
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

        //var productObj = productReport[i];
        productDescription = productReportJSON[i].description;
        productValue = productReportJSON[i].value;
        productQuantity = productReportJSON[i].quantity;
        totalQuantity += parseFloat(productQuantity);
        totalAmountSold += parseFloat(productValue);

        //isMerchandise == 1 Means it is a Merchandise add Amount  
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

      // var receiptContents = {
      //     // "paymentsReport": paymentsReport,
      //     "drawerReport": drawerReport,
      //     "totalProductsReport": totalProductsReport,
      //     "userID": userID,
      //     "isAllUsers": isAllUsers,
      //     "transactionTime": printTime
      // };

      //    return receiptContents;
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
      // posApplet.printSummaryPaymentsReport(paymentReport);
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
    // shift IDs should be unique, so after filtering you better only have one record in there

    //shiftRecord = shiftStore.findRecord('userID', userID)
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

    // TODO: stop using two different ways of getting transaction IDs.
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
    var signatureRequired = false;
    var customerCopyReceipt = "";
    var changeDue = 0;
    var padSize = 0;
    var transText = "Trans ID:";
    var isMerchandise = ""
    var walletTypeId = ""
    receipt += transText;
    padSize = receiptWidth - (transText.length + storedTransactionID.length);

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

    // if (cart.ProductLineItems > 0) {
    //   console.log("Receipt printing, detected products.");
    // }

    //Add a spacer due to multiple cards on order
    receipt += "\n";

    // if(transactionObj.isMerchandise != "true" || transactionObj.walletItemId != "99")

    var walletContents
    cart.forEach(element => {
      if (element.IsMerchandise == true) {
        isMerchandise = element.IsMerchandise
        walletTypeId = element.walletTypeId
        JSON.parse(catalog).Offering.forEach(catalogElement => {
          if (catalogElement.Ticket != undefined) {
            if (catalogElement.ProductIdentifier == element.productIdentifier) {
              return element.description = catalogElement.Ticket.Description
            }
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
        walletContents = element.walletContentItems
        console.log("walletContents", walletContents);
        walletContents.forEach(item => {
          walletTypeId = item.walletTypeId
          isMerchandise = item.IsMerchandise
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

    receipt += "\nFare TOTAL:              " + faretotalStr + "\n\n";
    receipt += "\nTax TOTAL:               " + taxtotalStr + "\n\n";

    receipt += "\nTOTAL:                   " + totalStr + "\n\n";

    var paymentAmount = "";
    var paymentId = 0;

    // possible add for payment type and change due
    paymentsStore.forEach(paymentRecord => {
      paymentId = paymentRecord.paymentMethodId;
      paymentTypeText = ""

      switch (paymentId) {
        case 1:
          paymentTypeText = "INVOICED"
          break;
        case 2:
          paymentTypeText = "CASH"
          break;
        case 3:
          paymentTypeText = "CHECK"
          break;
        case 4:
          paymentTypeText = "AMEX"
          break;
        case 5:
          paymentTypeText = "VISA"
          break;
        case 6:
          paymentTypeText = "MASTERCARD"
          break;
        case 7:
          paymentTypeText = "DISCOVER"
          break;
        case 8:
          paymentTypeText = "COMP"
          break;
        case 9:
          paymentTypeText = "CREDIT"
          break;
        case 10:
          paymentTypeText = "FARE_CARD"
          break;
        case 11:
          paymentTypeText = "VOUCHER"
          break;
        case 12:
          paymentTypeText = "STORED_VALUE"
          break;
        default:
          paymentTypeText = "UNKNOWN"
          break;
      }

      // if the payment method is cash, you want to give the full amount tendered.
      //    that is the amount we stored + the change due
      if (null != paymentId) {
        if (2 == paymentId) {
          paymentAmount = "          $" + (changeDue + Number(paymentRecord.amount)).toFixed(2);
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

    });

    // if cash was one of your payment types, figure out if there's any change due
    if (paymentId == 2) {
      var changeDueLabel = "CHANGE DUE:              ";
      var changeDueStr = "";

      changeDueStr = "$" + changeDue.toFixed(2);
      changeDueStr = "                    " + changeDueStr;

      changeDueStr = changeDueStr.substring(changeDueStr.length - 20);

      receipt += "\n" + changeDueLabel + changeDueStr;
    }
 
    if (isMerchandise == "false" || (walletTypeId != "10" && walletTypeId != undefined) ) {
      var cardBalance = "",
        textProductType = "",
        remainingRides: any = 0;

      receipt += "\n\n             Current Card Balance\n\n";
      var cardStore = JSON.parse(localStorage.getItem("printCardData"));

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

          switch (productType) {
            case 1:

              if (exp_date_epoch_days > 1) {
                cardBalance = "Exp: " + exp_date;
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

          // var ticketKey = productType + "_" + designator;

          //  var carddata = new Array(cardStore);

          //  cardStore.products.forEach(cardElement => {
          JSON.parse(catalog).Offering.forEach(catalogElement => {
            if (catalogElement.Ticket != undefined) {
              if (catalogElement.Ticket.Group == productType && (catalogElement.Ticket.Designator == designator)) {
                //  var catalogdata = {
                //    "ticketid": 
                //  }
                return productDescription = catalogElement.Ticket.Description

              }
            }
          });
          // });


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
    receipt += "\n\n";
    console.log("receipt", receipt)
    // APOS.util.PrintService.printReceipt(receipt, timestamp);
    this.electronService.ipcRenderer.send('printReceipt', receipt, timestamp)
    console.log(receipt + 'generateReceipt receipt ');
    console.log(customerCopyReceipt + 'generateReceipt customerCopyReceipt ');
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
}


