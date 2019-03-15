import { Component, OnInit, ChangeDetectorRef, NgZone, AfterViewInit, ViewChild, Type } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { CdtaService } from '../../cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-shift-sales-summary',
  templateUrl: './shift-sales-summary.component.html',
  styleUrls: ['./shift-sales-summary.component.css']
})
export class ShiftSalesSummaryComponent implements OnInit {
  sales = []
  selectedValue: any
  selectedValues: any
  salesData: any
  salesPaymentData: any

  constructor(private cdtaservice: CdtaService, private route: ActivatedRoute, private router: Router, private _ngZone: NgZone, private electronService: ElectronService, private ref: ChangeDetectorRef, private http: HttpClient) {

    this.electronService.ipcRenderer.on('adminSalesResult', (event, data) => {
      console.log("sales data", data)
      if (data != undefined && data != "") {
        //this.show = true;
        // localStorage.setItem("allSales", data)
        this.salesData = JSON.parse(data);
        return this.salesData
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
      }
    });

    this.electronService.ipcRenderer.on('adminSalesPaymentResult', (event, data) => {
      console.log("sales data", data)
      if (data != undefined && data != "") {
        //this.show = true;
        // localStorage.setItem("paymentTypes", data)
        this.salesPaymentData = JSON.parse(data);
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
        return this.salesPaymentData
      }
    });

    this.electronService.ipcRenderer.on('printSummaryReportResult', (event, data) => {
      console.log("sales data", data)
      if (data != undefined && data != "") {
        //this.show = true;
        // localStorage.setItem("paymentTypes", data)
        alert("printSummaryReport Done")
        console.log("printSummaryReport Done", data)
        //  this.salesPaymentData = JSON.parse(data);
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
      }
    });

    this.electronService.ipcRenderer.on('printReceiptHeaderResult', (event, data) => {
      console.log("sales data", data)
      if (data != undefined && data != "") {
        //this.show = true;
        // localStorage.setItem("paymentTypes", data)
        alert("printReceiptHeaderResult Done")
        console.log("printReceiptHeaderResult Done", data)
        //  this.salesPaymentData = JSON.parse(data);
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
      }
    });

    this.electronService.ipcRenderer.on('printSummaryPaymentsReportResult', (event, data) => {
      console.log("sales data", data)
      if (data != undefined && data != "") {
        //this.show = true;
        // localStorage.setItem("paymentTypes", data)
        alert("printSummaryPaymentsReportResult Done")
        console.log("printSummaryPaymentsReportResult Done", data)
        this.salesPaymentData = JSON.parse(data);
        this._ngZone.run(() => {
          // this.router.navigate(['/addproduct'])
        });
      }
    });

  }


  ngOnInit() {


    this.sales = JSON.parse(localStorage.getItem("shiftReport"));
    //   let all = {
    //     userEmail:"--All--",
    //     userID: "",
    //     shiftID: "0",
    //     shiftType: "",
    //     shiftState: "3",
    //     openingDrawer: "0.00",
    //     closingDrawer: "0.00",
    //     initialOpeningTime: 0,
    //     timeOpened: 0,
    //     timeClosed: 0,
    //     userThatClosedShift: ""
    // }
    // this.sales.push(all)

    // this.cdtaservice.getsalesJson().subscribe(data => {
    //   if (data != '') {
    //     console.log("sales json", data)
    //     this.salesData = data
    //   }

    // });
    this.salesData = JSON.parse(localStorage.getItem("allSales"));
    this.salesPaymentData = JSON.parse(localStorage.getItem("paymentTypes"))
    // this.cdtaservice.getsalesPaymentJson().subscribe(data => {
    //   if (data != '') {
    //     console.log("sales json", data)
    //     this.salesPaymentData = data
    //   }

    // });
  }

  hidePopUp() {
    // this.hideModalPopup = true
    // localStorage.setItem("hideModalPopup",this.hideModalPopup.toString())
    let shiftReports = JSON.parse(localStorage.getItem("shiftReport"));
    let userId = localStorage.getItem("userID")
    shiftReports.forEach(element => {
      if ((element.shiftType == "0" && element.shiftState == "0") || (element.shiftType == "1" && element.shiftState == "0")) {
        localStorage.setItem("hideModalPopup", "true")
      } else {
        localStorage.setItem("hideModalPopup", "false")
      }
    })
  }

  shiftSaleSummary() {
    console.log("selectedValue:", this.selectedValues)
    // console.log("saleSummary", JSON.parse(saleSummary))
    if (this.selectedValues == 0) {
      this.selectedValue = 0
    } else {
      this.selectedValue = this.selectedValues.userID
      console.log("this.selectedvalue", this.selectedValue)
    }
    this.electronService.ipcRenderer.send('adminSales', Number(this.selectedValues.shiftType), this.selectedValues.initialOpeningTime, this.selectedValues.timeClosed)
    this.electronService.ipcRenderer.send('adminSalesPaymentMethod', Number(this.selectedValues.userID), Number(this.selectedValues.shiftType), this.selectedValues.initialOpeningTime, this.selectedValues.timeClosed, null, null, null)
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
      this.generateTotalReport(clerkContents, null);

    }
  }

  generateTotalReport(shiftOneContents, shiftTwoContents) {
    console.log('generateTotalReport');
    var shiftType = shiftOneContents.typeOfshift,
      isAllUsers = shiftOneContents.isAllUsers,
      printTime = shiftOneContents.transactionTime,
      openShiftTimeStamp = shiftOneContents.shiftOpeningTime,
      shiftID = shiftOneContents.shiftID,
      userID = shiftOneContents.userID,
      closeShiftTimeStamp = shiftOneContents.shiftClosingTime,
      shiftOnePaymentData = this.getTotalPaymentReport(isAllUsers, shiftType, openShiftTimeStamp, closeShiftTimeStamp, null, null, null);
    if (shiftTwoContents != null) {
      var shiftType1 = shiftTwoContents.typeOfshift,
        isAllUsers1 = shiftTwoContents.isAllUsers,
        openShiftTimeStamp1 = shiftTwoContents.shiftOpeningTime,
        shiftID1 = shiftTwoContents.shiftID,
        userID1 = shiftTwoContents.userID,
        closeShiftTimeStamp1 = shiftTwoContents.shiftClosingTime,

        shiftTwoReportData = this.backEndSummaryReport(isAllUsers, shiftType1, openShiftTimeStamp1, closeShiftTimeStamp1, shiftID1, userID1),
        shiftTwoPaymentData = this.getTotalPaymentReport(isAllUsers, shiftType, openShiftTimeStamp, closeShiftTimeStamp, shiftType1, openShiftTimeStamp1, closeShiftTimeStamp1);

      var user1_drawerReport = shiftTwoReportData.drawerReport,
        user1_productsReport = shiftTwoReportData.totalProductsReport,
        user1_userID = shiftTwoReportData.userID,
        user1_isAllUsers = shiftTwoReportData.isAllUsers,
        user1_transactionTime = shiftTwoReportData.transactionTime;


    }
    var shiftOneReportData = this.backEndSummaryReport(isAllUsers, shiftType, openShiftTimeStamp, closeShiftTimeStamp, shiftID, userID);
    console.log("shiftOneReportData", shiftOneReportData)
    var user0_drawerReport = shiftOneReportData.drawerReport,
      user0_productsReport = shiftOneReportData.totalProductsReport,
      user0_userID = shiftOneReportData.userID,
      user0_isAllUsers = shiftOneReportData.isAllUsers,
      user0_transactionTime = shiftOneReportData.transactionTime;



    try {
      // posApplet.printReceiptHeader(user0_isAllUsers, new Date().getTime());
      this.electronService.ipcRenderer.send("printReceiptHeader", user0_isAllUsers, new Date().getTime());

    } catch (e) {
      console.log("Exception printing summary header.")
    }

    try {
      this.electronService.ipcRenderer.send("printSummaryReport", user0_drawerReport, user0_productsReport, Number(user0_userID), user0_isAllUsers);
    } catch (e) {
      console.log("Exception printing sales summary.");
    }
    if (shiftTwoContents != null) {
      try {
        this.electronService.ipcRenderer.send("printSummaryReport", user1_drawerReport, user1_productsReport, Number(user1_userID), user1_isAllUsers);
      } catch (e) {
        console.log("Exception printing sales summary.");
      }
      try {
        this.electronService.ipcRenderer.send("printSummaryPaymentsReport", shiftTwoPaymentData);

      } catch (e) {
        console.log("Exception printing payment summary.");
      }

    } else {
      try {
        //  posApplet.printSummaryPaymentsReport(shiftOnePaymentData);
        this.electronService.ipcRenderer.send("printSummaryPaymentsReport", shiftOnePaymentData);
      } catch (e) {
        console.log("Exception printing payment summary.");

      }


    }

  }


  getTotalPaymentReport(isAllUsers, shiftType, openShiftTimeStamp, closeShiftTimeStamp, shiftType1, openShiftTimeStamp1, closeShiftTimeStamp1) {
    var paymentReport = "", paymentsReport = "";
    console.log('getTotalPaymentReport.....');
    this.electronService.ipcRenderer.send('adminSalesPaymentMethod', Number(this.selectedValues.userID), Number(this.selectedValues.shiftType), this.selectedValues.initialOpeningTime, this.selectedValues.timeClosed, null, null, null)
    var paymentReportJSON = this.salesPaymentData
    // if (APOS.util.POSApplet.isNullUndefinedEmpty(paymentReportJSON)) {
    //     paymentReport = Ext.decode(paymentReportJSON);
    //     console.log(paymentReport);
    // }
    paymentReport = this.generatePrintReceiptForPayments(paymentReportJSON);
    return paymentReport;
  }

  getAllClerksPaymentReports(shiftStore) {

    var backendPaymentReport = [];
    // shiftStore.each(function (record) {
    shiftStore.forEach(record => {
      this.electronService.ipcRenderer.send('adminSalesPaymentMethod', Number(record.userID), Number(record.shiftType), record.initialOpeningTime, record.timeClosed, null, null, null)
      var paymentReport = this.salesPaymentData;
      // if (APOS.util.POSApplet.isNullUndefinedEmpty(paymentReportJSON)) {
      // var paymentReport = Ext.decode(paymentReportJSON);
      if (paymentReport != null) {
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
    // var recordIndex = formsofpaymentstore.findExact('PaymentMethod', paymentType);
    // if (recordNotFound != recordIndex) {

    //     record = formsofpaymentstore.getAt(recordIndex);
    //     if (null != record) {
    //         if (null != record.data) {
    //             displayName = record.data.DisplayName;
    //         }
    //     }
    // }

    //  return displayName;
  }


  backEndSummaryReport(isAllUsers, shiftType, openShiftTimeStamp, closeShiftTimeStamp, shiftID, userID) {
    this.electronService.ipcRenderer.send('adminSales', Number(shiftType), openShiftTimeStamp, closeShiftTimeStamp);
    var productReport = "",
      productReportJSON = this.salesData,
      productsReport = "",
      drawerReport = "",
      recordNotFound = -1,
      openShiftRecord = null,
      totalProductCount = 0,
      currentProductSum: any = 0,
      productValue: any = 0,
      productQuantity: any = 0,
      totalProductCost: any = 0,
      totalProductsReport: any = "",
      totalQuantity: any = 0,
      totalAmountSold: any = 0,
      productDescription = '',
      isMerchandise: any = 0,
      totalFareProductsSoldInShift: any = 0,
      totalNonFareProductsSoldInShift: any = 0,
      totalAmountBilledInShift: any = 0,
      receiptWidth = 44,
      spacer = '',
      maxDescriptionLength = (receiptWidth / 2) + 4,
      padSize = 0,
      secondPadSize = 0,
      middlePadSize = Math.floor(receiptWidth / 2) + 10;


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
    var paymentsStore = JSON.parse(localStorage.getItem("paymentTypes"))
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
      if (element.paymentMethodId == "CASH") {
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
