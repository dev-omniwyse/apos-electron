import { Component, OnInit, Output } from '@angular/core';
import { CdtaService } from 'src/app/cdta.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  subscription: any;
  hideHeader = true;
// @Output()  hideHeader;
  constructor(private cdtaservice: CdtaService) { 
    this.subscription = this.cdtaservice.headerShowHide$.subscribe(
      mission => {
        if(mission == "hideHeader")
         this.hideHeader = false;
        else
        this.hideHeader = true;
      });
  }

  
  ngOnInit() {
    let item = localStorage.getItem("header");
  }

}



