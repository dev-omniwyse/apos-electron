import { BrowserModule, HammerGestureConfig, HAMMER_GESTURE_CONFIG } from '@angular/platform-browser';
import * as Hammer from 'hammerjs';

import { NgModule, ErrorHandler } from '@angular/core';
import { HttpClientModule, HttpClient, HttpRequest, HttpResponse, HttpEventType } from '@angular/common/http';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CdtaService } from './cdta.service';
import { NgxElectronModule } from 'ngx-electron';
import { HomeComponent } from './components/home/home.component';
import { LoginComponent } from './components/login/login.component';
import { CarddataComponent } from './components/carddata/carddata.component';
import { SetupComponent } from './components/setup/setup.component';
import { ActivationComponent } from './components/activation/activation.component';
import { VerifyComponent } from './components/verify/verify.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { CompComponent } from './components/comp/comp.component';
import { AdminComponent } from './components/admin/admin.component';
import { DeviceconfComponent } from './components/deviceconf/deviceconf.component';
import { ShiftSalesSummaryComponent } from './components/shift-sales-summary/shift-sales-summary.component';
import { ShiftsComponent } from './components/shifts/shifts.component';
import { NgxLoadingModule } from 'ngx-loading';
import { NgxSpinnerModule } from 'ngx-spinner';
import { EnvironmentComponent } from './components/environment/environment.component';
import { SlickModule } from 'ngx-slick';
import { Globals } from './global';
import {SessionServiceApos} from './session';
import { NumericOnlyDirective } from './components/add-product/numeric-only.directive';
import { NoCommaPipe } from './pipe/no-comma.pipe';
import { DatePipe } from '@angular/common';
import {NgIdleKeepaliveModule} from '@ng-idle/keepalive';
import {SysytemConfig} from './config';
import { GlobalErrorHandler } from './services/GlobalErrorHandler.service';
import { AccountDetailsComponent } from './components/account-details/account-details.component';

export class HammerConfig extends HammerGestureConfig {
  overrides = <any>{
    'swipe': { direction: Hammer.DIRECTION_ALL }
  };
}
@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    CarddataComponent,
    SetupComponent,
    ActivationComponent,
    VerifyComponent,
    NavbarComponent,
    AddProductComponent,
    CompComponent,
    AdminComponent,
    DeviceconfComponent,
    ShiftSalesSummaryComponent,
    ShiftsComponent,
    EnvironmentComponent,
    NumericOnlyDirective,
    NoCommaPipe,
    AccountDetailsComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    NgxElectronModule,
    ReactiveFormsModule,
    FormsModule,
    NgxSpinnerModule,
    NgIdleKeepaliveModule.forRoot(),
    NgxLoadingModule.forRoot({}),
    SlickModule.forRoot()
  ],
  providers: [CdtaService, DatePipe, Globals, SessionServiceApos, SysytemConfig,
    {
      provide: HAMMER_GESTURE_CONFIG,
      useClass: HammerConfig
    },
    {
      provide: ErrorHandler,
      useClass: GlobalErrorHandler
    }],
  bootstrap: [AppComponent]
})
export class AppModule { }
