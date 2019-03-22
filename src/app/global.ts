

// globals.ts
import { Injectable } from '@angular/core';
import { ShoppingCartService } from './services/ShoppingCart.service';
import { ShoppingCart } from './models/ShoppingCart';

@Injectable()
export class Globals {
    globalCart = ShoppingCartService.getInstance;
  }