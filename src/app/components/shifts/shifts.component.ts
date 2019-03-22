import { Component, NgZone, OnInit } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, FormsModule } from '@angular/forms';
import { ElectronService } from 'ngx-electron';

declare var $: any

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.css']
})
export class ShiftsComponent implements OnInit {

  numberDigits: any = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  zeroDigits: any = ["0", "00"]
  productTotal: any = 0;
  openShift: Boolean = true
  hideModalPopup: Boolean = false;
  setShiftStatus: any
  setShiftText: any
  expectedCash: any = 0
  // mainShiftClosed: Boolean = false
  public selectedValue: any = 0
  public salesData: any
  public salesPaymentData: any

  constructor(private formBuilder: FormBuilder, private cdtaService: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService) {
    this.electronService.ipcRenderer.on('salesDataResult', (event, data) => {
      console.log("print sales data", data)
      if (data != undefined && data.length != 0) {
        this._ngZone.run(() => {
          this.salesData = JSON.parse(data);
          return this.salesData
        });

      }
    });

    this.electronService.ipcRenderer.on('paymentsDataResult', (event, data) => {
      console.log("print payments  data", data)
      if (data != undefined && data.length != 0) {
        this._ngZone.run(() => {
          this.salesPaymentData = JSON.parse(data);
          localStorage.setItem("printPaymentDetails",JSON.stringify(this.salesPaymentData))
          return this.salesPaymentData
        });
      }
    });
    this.electronService.ipcRenderer.on('printSummaryReportResult', (event, data) => {

      if (data != undefined && data != "") {
        alert("print Summary Report Done")
        console.log("printSummaryReport Done", data)
        this._ngZone.run(() => {
        });
      }
    });

    this.electronService.ipcRenderer.on('printReceiptHeaderResult', (event, data) => {
      if (data != undefined && data != "") {
        alert("print Receipt Header Result Done")
        console.log("print Receipt Header Result Done", data)
        this._ngZone.run(() => {

        });
      }
    });

    this.electronService.ipcRenderer.on('printSummaryPaymentsReportResult', (event, data) => {
      if (data != undefined && data != "") {
        alert("print Summary Payments Report Result Done")
        console.log("printSummary Payments Report Result Done", data)
        this._ngZone.run(() => {

        });
      }
    });



  }

  cashDrawer() {
    //this.openShift = false
    //localStorage.setItem("openShift", this.openShift.toString());
    let shiftStore = JSON.parse(localStorage.getItem("shiftReport"))
    shiftStore.forEach(element => {
      if (element.userID == localStorage.getItem("userID") && element.shiftState == "3") {
        element.initialOpeningTime = new Date().getTime();
        element.shiftState = "0";
        element.openingDrawer = this.productTotal
        element.timeOpened = new Date().getTime();
        localStorage.setItem("disableUntilReOpenShift", "false")
      }
      localStorage.setItem("shiftReport", JSON.stringify(shiftStore))
    });
    this.router.navigate(["/admin"])
    this.hideModalPopup = false
    localStorage.setItem("hideModalPopup", this.hideModalPopup.toString())

  }
  mainShiftClose() {
    //this.mainShiftClosed = true
    let shiftStore = JSON.parse(localStorage.getItem("shiftReport"))
    let shiftreportUser = localStorage.getItem("userID")
    let mainShiftClose = "true"
    if (localStorage.getItem("closingPausedMainShift") == "true") {
      shiftStore.filter(element => {
        if (element.shiftState == "4") {
          element.shiftState = "3"
          element.userThatClosedShift = localStorage.getItem("userEmail")
          element.timeClosed = new Date().getTime();
          element.closingDrawer = this.productTotal
          localStorage.setItem("mainShiftClose", mainShiftClose)
          
        }

        if (element.userID == shiftreportUser && element.shiftType == "1") {
          element.shiftState = "3";
          element.timeClosed = new Date().getTime();
          element.closingDrawer = this.productTotal
          element.userThatClosedShift = localStorage.getItem("userEmail")
        }

      })
    }
    shiftStore.forEach(element => {
      if (element.userID == shiftreportUser && element.shiftType == "0") {
        element.shiftState = "3";
        element.timeClosed = new Date().getTime();
        element.closingDrawer = this.productTotal
        element.userThatClosedShift = localStorage.getItem("userEmail")
        localStorage.setItem("mainShiftClose", mainShiftClose)
      
      } else
        if (element.userID == shiftreportUser && element.shiftType == "1") {
          element.shiftState = "3";
          element.timeClosed = new Date().getTime();
          element.closingDrawer = this.productTotal
        }
    })
    localStorage.setItem("shiftReport", JSON.stringify(shiftStore))
   // this.printSummaryReport();
    localStorage.setItem("disableUntilReOpenShift", "true")
    this.router.navigate(["/admin"])
    }
  validShifts() {

    let reliefShif = JSON.parse(localStorage.getItem("shiftReport"));
    let userId = localStorage.getItem("userID")

    reliefShif.forEach(element => {
      if (element.shiftState == "3" && element.userID == userId && element.shiftType == "1" && localStorage.getItem("closingPausedMainShift")) {
        $("#closeShiftModal").modal('show');
      } else
        if (element.shiftState == "3" && element.userID == userId && (element.shiftType == "0" || element.shiftType == "1")) {
          $("#openShiftModal").modal('show');
        } else if (element.shiftState == "0" && element.userID == userId && (element.shiftType == "0" || element.shiftType == "1")) {
          $("#closeShiftModal").modal('show');
        } else if (element.shiftState == "4" && element.userID == userId && element.shiftType == "0") {

        }
    });

  }

  displayDigit(digit) {
    console.log("numberDigits", digit);
    this.productTotal = Math.round(this.productTotal * 100);
    this.productTotal += digit;
    this.productTotal = this.productTotal / 100;
    // if (this.productTotal == 0) {
    //   this.productTotal = digit;
    //   // this.productTotal+=digit
    // } else
    //   this.productTotal += digit

  }
  clearDigit(digit) {
    console.log("numberDigits", digit);
    this.productTotal = digit
  }

  hidePopUp() {
    this.hideModalPopup = true
    localStorage.setItem("hideModalPopup", this.hideModalPopup.toString())
    if (localStorage.getItem("closingPausedMainShift") == "true") {
      localStorage.setItem("closingPausedMainShift", "false")
    }
    let shiftReports = JSON.parse(localStorage.getItem("shiftReport"));
    let userId = localStorage.getItem("userID")
    shiftReports.forEach(element => {
      if ((element.shiftType == "0" && element.shiftState == "0") || (element.shiftType == "1" && element.shiftState == "0")) {
        localStorage.setItem("hideModalPopup", "true")
      } else if (element.shiftState == 3 && element.userID == localStorage.getItem("userID")) {
        localStorage.setItem("hideModalPopup", "false")
      }
    })
  }
  ngOnInit() {
    let shiftReports = JSON.parse(localStorage.getItem("shiftReport"));
    let userId = localStorage.getItem("userID")
    shiftReports.forEach(element => {
      if (localStorage.getItem("closingPausedMainShift") == "true" && element.userID == userId) {
        this.setShiftStatus = "CLOSE SHIFT"
        this.expectedCash = element.openingDrawer
        this.setShiftText = "Enter the total closing amount in the till and Tap 'Enter' "
      }
      else
        if ((element.shiftType == "0" && element.shiftState == "3") && element.userID == userId) {
          this.setShiftStatus = "OPEN SHIFT"
          this.expectedCash = 0
          this.setShiftText = "Enter the total opening amount in the till and Tap 'Enter' "
        } else if ((element.shiftType == "0" && element.shiftState == "0") && element.userID == userId) {
          this.setShiftStatus = "CLOSE SHIFT"
          this.expectedCash = element.openingDrawer
          this.setShiftText = "Enter the total closing amount in the till and Tap 'Enter' "
        } else if ((element.shiftType == "1" && element.shiftState == "3") && element.userID == userId) {
          this.setShiftStatus = "RELIEF SHIFT"
          this.expectedCash = 0
          this.setShiftText = "Enter the total opening amount in the till and Tap 'Enter' "
        } else if ((element.shiftType == "1" && element.shiftState == "0") && element.userID == userId) {
          this.setShiftStatus = "CLOSE RELIEF SHIFT"
          this.expectedCash = element.openingDrawer
          this.setShiftText = "Enter the total closing amount in the till and Tap 'Enter' "
        }
    })

  }
  printSummaryReport() {
    var container = this;
    var selectedItem = '';
    //  selectedItem = container.up('#topItem').down('#clerkSelector').getRecord();
    // var selectedText = selectedItem.data.value;

    //console.log("Selected Clerk: " + selectedText);

    var shiftRecord = null,
      userID = null,
      userID1 = null,
      recordIndex = -1,
      recordNotFoundIndex = -1,
      shiftID = null,
      openShiftTimeStamp = null,
      openShiftTimeStamp1 = null,
      closeShiftTimeStamp = null,
      closeShiftTimeStamp1 = null,
      shiftType = null,
      shiftType1 = null,
      shiftRecord1 = null,
      recordIndex1 = -1,
      recordNotFound1 = -1,
      shiftID1 = null


    var shiftStore = JSON.parse(localStorage.getItem('shiftReport'));
    var shiftRecord = null,
      shiftID1 = null,
      userID1 = null,
      shiftType1 = null,
      openShiftTimeStamp1 = null,
      closeShiftTimeStamp1 = null;

    // this is on initialization, where you won't have an 'old' value
    if ((0 === this.selectedValue) || ('All Sales' === this.selectedValue)) {
      try {
        // printReceiptHeader(true, new Date().getTime());
        this.electronService.ipcRenderer.send("printReceiptHeader", true, new Date().getTime());

      } catch (e) {
        console.log("Exception printing summary header.");
      }
      var backendPaymentReport = this.getAllClerksPaymentReports(shiftStore);
      var displayingPayments = this.iterateAndFindUniquePaymentTypeString(backendPaymentReport);
      var paymentReport = this.generatePrintReceiptForPayments(displayingPayments);


      console.log('All Sales.....................................');
      shiftStore.forEach(record => {
        console.log("Inside shift user calling");
        var salesReport = this.backEndSummaryReport(false, record.shiftType,
          record.initialOpeningTime, record.timeClosed, null, record.userID);
        var user1_drawerReport = salesReport.drawerReport,
          user1_productsReport = salesReport.totalProductsReport,
          user1_userID = salesReport.userID,
          user1_isAllUsers = salesReport.isAllUsers,
          user1_transactionTime = salesReport.transactionTime;
        try {
          this.electronService.ipcRenderer.send("printSummaryReport", user1_drawerReport, user1_productsReport, Number(user1_userID), user1_isAllUsers);
        } catch (e) {
          console.log("Exception printing sales summary.");
        }
      });
      // shiftStore.each(function (record) {

      //     // record.data.userID, record.data.shiftType, record.data.initialOpeningTime, 
      //     // record.data.timeClosed                                               

      // });
      try {
        // posApplet.printSummaryPaymentsReport(paymentReport);
        this.electronService.ipcRenderer.send("printSummaryPaymentsReport", paymentReport);
      } catch (e) {
        console.log("Exception printing payment summary.");
      }
      // }
    } else {
      // var recordIndex2 = shiftStore.findExact('userID', shiftStore);
      shiftStore.forEach(element => {
        if (element.userID == this.selectedValue) {
          var recordIndex2 = element.userID
          shiftID = element.shiftID;
          userID = element.userID;
          shiftType = element.shiftType;
          openShiftTimeStamp = element.initialOpeningTime;
          closeShiftTimeStamp = element.timeClosed;
        }
      });
      // if (recordNotFoundIndex != recordIndex2) {
      //     shiftRecord = shiftStore.getAt(recordIndex2);
      //     shiftID = shiftRecord.data.shiftID;
      //     userID = shiftRecord.data.userID;
      //     shiftType = shiftRecord.data.shiftType;
      //     openShiftTimeStamp = shiftRecord.data.initialOpeningTime;
      //     closeShiftTimeStamp = shiftRecord.data.timeClosed;

      // }
      var clerkContents = {
        "isAllUsers": false,
        "typeOfshift": shiftType,
        "shiftOpeningTime": openShiftTimeStamp,
        "shiftClosingTime": closeShiftTimeStamp,
        "shiftID": shiftID,
        "userID": userID
      };
      // this.generateTotalReport(clerkContents, null);

    }
  }


  getAllClerksPaymentReports(shiftStore) {

    var backendPaymentReport = [];
    // shiftStore.each(function (record) {
    shiftStore.forEach(record => {
      this.electronService.ipcRenderer.send('paymentsData', Number(record.userID), Number(record.shiftType), record.initialOpeningTime, record.timeClosed, null, null, null)
      console.log("checking payment data", this.salesPaymentData)
      var paymentReport: any = this.salesPaymentData;
      
      if (paymentReport != undefined) {
        for (var report = 0; report < paymentReport.length; report++) {
          backendPaymentReport.push(paymentReport[report]);
        }
      }
      // }
    });

    // });
    return backendPaymentReport;
  }


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


  generatePrintReceiptForPayments(paymentReport) {
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
    return paymentsReport;
  }

  getPaymentTypeDisplayName(paymentType) {
    // var record = null;
    // var recordNotFound = -1;
    var formsofpaymentstore = JSON.parse(localStorage.getItem("paymentTypes"))
    var displayName = null;
    formsofpaymentstore.forEach(element => {
      if (paymentType == element.paymentMethod) {
        displayName = element.paymentMethod
      }
      return displayName
    });

  }


  backEndSummaryReport(isAllUsers, shiftType, openShiftTimeStamp, closeShiftTimeStamp, shiftID, userID) {
    this.electronService.ipcRenderer.send('salesData', Number(shiftType), openShiftTimeStamp, closeShiftTimeStamp);


    var productsReport: any = "";
    var drawerReport: any = "";
    var recordNotFound = -1;
    var openShiftRecord = null;
    var totalProductCount = 0;
    var currentProductSum: any = 0;
    var productValue: any = 0;
    var productQuantity: any = 0;
    var totalProductCost: any = 0;
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
    console.log("checking sales data", this.salesData)
    var productReportJSON: any = this.salesData;

    // if (APOS.util.POSApplet.isNullUndefinedEmpty(productReportJSON)) {
    //     productReport = Ext.decode(productReportJSON);
    // }
    // productReportJSON = productReportJSON

    //var productReportCount = Object.keys(productReportJSON).length;

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
    var expectedCashInDrawer: any = 0
    var paymentsStore = JSON.parse(localStorage.getItem("printPaymentDetails"))
    // paymentsStore.clearFilter();
    // paymentsStore.filter([
    //   {
    //     filterFn: function (item) {
    //       return ((item.get("paymentMethodId") == "CASH") &&
    //         (item.get("shiftID") == shiftID));
    //     }
    //   }
    // ]);
    // console.log(paymentsStore);
    // var expectedCashInDrawer = paymentsStore.sum('amount');
    paymentsStore.forEach(element => {
      if (element.paymentMethod == "CASH") {
        expectedCashInDrawer = expectedCashInDrawer + element.paymentAmount
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

    var receiptContents = {
      // "paymentsReport": paymentsReport,
      "drawerReport": drawerReport,
      "totalProductsReport": totalProductsReport,
      "userID": userID,
      "isAllUsers": isAllUsers,
      "transactionTime": printTime
    };

    return receiptContents;
  }

  generateTerminalReport(fareTotalBilled, NonFareTotalBilled, totalBilled, userID, shiftType, expectedCashInDrawer) {
    var shiftStore = JSON.parse(localStorage.getItem("shiftReport")),
      openShift = false,
      receipt = "";
    var shiftRecord = null;
    var receiptWidth = 44;
    var openingDrawer
    var closingDrawer
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


}
