import { Injectable } from '@angular/core';

@Injectable()
export class AddProductValidations  {
    private static _addProductValidations = new AddProductValidations();
    public static get getInstance() {
        return AddProductValidations._addProductValidations;
    }

    checkIsBadListedProductOnWallet(selectedItem, currentCard) {
        let flag = false;
        for (const product of currentCard.products) {
              if (selectedItem.Ticket.Group == product.product_type && (selectedItem.Ticket.Designator == product.designator)) {
            if (product.is_prod_bad_listed == true) {
              flag = true;
              break;
            }
          }
        }
        return flag;
      }

        /**
   * check the total product count reached for card.
   * check if product is merchendise product it returns true.
   * check if product is magnetic product it returns true.
   * check the product count for existing card and return the count.
   * @param {*} selectedItem
   * @returns
   * @memberof AddProductComponent
   */
//   isTotalproductCountForCardreached(selectedItem: any) {
//     let canAddProduct = false;
//     if (this.isMerchendiseProduct()) {
//       return true;
//     }

//     if (this.isMagneticProduct()) {
//       if (this.isMagneticProductLimitReached()) {
//         return false;
//       }
//       return true;
//     }
//     if (this.isUltraLightProduct()) {
//       if (!this.isUltraLightProductLimitReached(selectedItem)) {
//         return false;
//       }
//       return true;
//     }

//     const currentProductCount = this.getProductCountFromExistingCard(selectedItem);
//     if (currentProductCount > this.terminalConfigJson.NumberOfProducts) {
//       canAddProduct = false;
//       return canAddProduct;
//     }
//     let onlyPayAsYouGoAllowed = false;
//     if (this.terminalConfigJson.NumberOfProducts - 1 == currentProductCount) {
//       if (!this.isThereAnyActivePayAsYouGoProduct()) {
//         onlyPayAsYouGoAllowed = true;
//       }
//     }

//     if (!onlyPayAsYouGoAllowed && this.isFrequentProduct(selectedItem)) {
//       if (this.isCounttReachedForFrequentRide(selectedItem)) {
//         return true;
//       }
//       return false;
//     }

//     if (!onlyPayAsYouGoAllowed && this.isStoreRideProduct(selectedItem)) {
//       if (this.isCounttReachedForStoreRide(selectedItem)) {
//         return true;
//       }
//       return false;
//     }

//     if (this.isPayAsYouGoProduct(selectedItem)) {
//       if (this.isCounttReachedForPayAsYouGo(selectedItem)) {
//         return true;
//       }
//       return false;
//     }

//     return canAddProduct;
//   }
}
