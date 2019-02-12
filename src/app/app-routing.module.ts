import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReadcardComponent } from './components/readcard/readcard.component';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { LogoutComponent } from './components/logout/logout.component';
import { CarddataComponent } from './components/carddata/carddata.component';
import { CameraComponent } from './components/camera/camera.component';
import { SetupComponent } from './components/setup/setup.component';
import { ActivationComponent } from './components/activation/activation.component';
import { VerifyComponent } from './components/verify/verify.component';
import { AddProductComponent } from './components/add-product/add-product.component';

const routes: Routes = [
  { 
    path: '', 
    redirectTo: '/setup', 
    pathMatch: 'full'
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
    path: 'camera',
    component: CameraComponent
  },

  { 
    path: 'carddata',
    component: CarddataComponent
  },
  {
    path:'addproduct',
    component: AddProductComponent
  }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
