import { getLocalStorage } from '@/services/StorageUtils';
import { isEmpty } from '@/services/StringUtils';
import jwtDecode from 'jwt-decode';
import { key } from './constants';
import { Officer, SelectedCustomer, Store } from './type';

/**
 * Constructs the payload for an order.
 * @param customer - The selected customer.
 * @param paymentForm - The payment form data.
 * @param orderItems - The items in the order.
 * @param paymentMethod - The payment method.
 * @param totalPrice - The total price of the order.
 * @param totalquantity - The total quntity of the order.
 * @param shippingTotal - The shipping total.
 * @param sentType - The type of delivery.
 * @returns The payload for the order.
 */
const orderPayloadC = (
  customer:SelectedCustomer,
      paymentForm:any,
      item_list:any,
      calculatePromotion:any,
      paymentMethod:any,
      sentType:string,
      cToken:string,
      discount:number,
      promoCode:string,
) => { 
  const store: Store = getLocalStorage(key.STORE)
  const user: Officer = Object.create(jwtDecode(getLocalStorage(key.TOKEN)))
  const payload: any = {
    _method: 'PATCH',
    app_id: 1,
    ctoken: cToken,
    store_id: store.id,
    customer_id: customer.id,
    customer_name: customer.name,
    customer_mobile: customer.phone,
    customer_email: customer.email,
    note: paymentForm.remark,
    item_list: item_list,
    total_items: item_list.length,
    sub_total: calculatePromotion.sub_total,
    discount_coupon: promoCode,
    discount_amount: calculatePromotion.discount_amount,
    total_tax: 0,
    shipping_amount: calculatePromotion.shipping_amount,
    others_charge: '',
    delivery_type: sentType,
    paid_amount: calculatePromotion.paid_amount,
    paid_total: paymentForm.amount,
    balance: paymentForm.amount-calculatePromotion.paid_amount,
    pmethod_id: paymentMethod,
    created_by: user.id,
  }

  if (!isEmpty(customer.sub_district)) {
    payload.customer_subdistrict = customer.sub_district
  }

  if (!isEmpty(customer.district)) {
    payload.customer_district = customer.district
  }

  if (!isEmpty(customer.province)) {
    payload.customer_province = customer.province
  }

  if (!isEmpty(customer.zip_code)) {
    payload.customer_zipcode = customer.zip_code
  }

  if (!isEmpty(customer.address)) {
    payload.customer_address = customer.address
  }

  return payload
}

/**
 * Generates an address options array based on the provided data.
 *
 * @param data - The data used to generate the address options.
 * @returns An array of address options.
 */
const addressOption = (data: any) => {
  return data.reduce((acc: any, province: any) => {
    const provinceItem = {
      label: province.name,
      value: province.id,
      children: province.district.map((district: any) => ({
        label: district.name,
        value: district.id,
        children: district.sub_district.map((subDistrict: any) => ({
          label: `${subDistrict.name} ${subDistrict.zip_code}`,
          value: `${subDistrict.id} ${subDistrict.zip_code}`,
        })),
      })),
    }
    acc.push(provinceItem)
    return acc
  }, [])
}

export { addressOption, orderPayloadC };

