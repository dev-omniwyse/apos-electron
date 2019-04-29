import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReadcardComponent } from './components/readcard/readcard.component';
import { LoginComponent } from './components/login/login.component';
import { CarddataComponent } from './components/carddata/carddata.component';
import { SetupComponent } from './components/setup/setup.component';
import { ActivationComponent } from './components/activation/activation.component';
import { VerifyComponent } from './components/verify/verify.component';
import { AddProductComponent } from './components/add-product/add-product.component';
import { CompComponent } from './components/comp/comp.component';
import { AdminComponent } from './components/admin/admin.component';
import { DeviceconfComponent } from './components/deviceconf/deviceconf.component';
import { ShiftSalesSummaryComponent } from './components/shift-sales-summary/shift-sales-summary.component';
import { ShiftsComponent } from './components/shifts/shifts.component';
import { EnvironmentComponent } from './components/environment/environment.component';
const routes: Routes = [
  {
    path: '',
    redirectTo: '/environment',
    pathMatch: 'full'
  },

  {
    path: 'environment',
    component: EnvironmentComponent
  },

  {
    path: 'setup',
    component: SetupComponent
  },
  {
    path: 'activation',
    component: ActivationComponent
  },
  {
    path: 'verify',
    component: VerifyComponent
  },

  {
    path: 'login',
    component: LoginComponent
  },
  {
    path: 'readcard',
    component: ReadcardComponent
  },
  {
    path: 'carddata',
    component: CarddataComponent
  },
  {
    path: 'addproduct',
    component: AddProductComponent
  },
  {
    path: 'comp',
    component: CompComponent
  },
  {
    path: 'admin',
    component: AdminComponent
  },
  {
    path: 'deviceconfig',
    component: DeviceconfComponent
  },
  {
    path: 'shift_sales',
    component: ShiftSalesSummaryComponent
  },
  {
    path: 'shifts',
    component: ShiftsComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {onSameUrlNavigation: 'reload'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
