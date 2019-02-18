import { Component, NgZone, OnInit } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ElectronService } from 'ngx-electron';

@Component({
  selector: 'app-shifts',
  templateUrl: './shifts.component.html',
  styleUrls: ['./shifts.component.css']
})
export class ShiftsComponent implements OnInit {

  numberDigits: any = ['1', '2', '3', '4', '5', '6', '7', '8', '9']
  productTotal: any = 0;

  constructor(private cdtaService: CdtaService, private router: Router, private _ngZone: NgZone, private electronService: ElectronService) { }

  ngOnInit() {

  }

}
