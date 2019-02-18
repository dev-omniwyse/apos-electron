import { Component, NgZone, OnInit } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';

declare var $ : any

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.css']
})
export class ShiftsComponent implements OnInit {

  numberDigits: any = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  productTotal: any = 0;
  openShift: Boolean = true
  closeShift : Boolean = false
  mainShiftClosed : Boolean = false

  constructor(private cdtaService: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService) { }

  cashDrawer() {
    this.openShift = false
    localStorage.setItem("openShift", this.openShift.toString());
    this.router.navigate(["/admin"])

  }
  mainShiftClose(){
    this.mainShiftClosed = true
    localStorage.setItem("mainShiftClosed", this.mainShiftClosed.toString());
    localStorage.removeItem("mainShiftPaused")
    this.router.navigate(["/admin"])
  }
  validShifts(){
    if (localStorage.getItem("closeShift") == "true"){
      $("#closeShiftModal").modal('show');
    }
    else{
      $("#openShiftModal").modal('show');
    }

  }
  ngOnInit() {

  }

}
