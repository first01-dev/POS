import { getLocalStorage } from '@/services/StorageUtils'
import { isEmpty } from '@/services/StringUtils'
import jwtDecode from 'jwt-decode'
import { key } from './constants'
import { Officer, SelectedCustomer, Store } from './type'

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
const orderPayload = (
  customer: SelectedCustomer,
  paymentForm: any,
  orderItems: any,
  paymentMethod: string,
  getActualTotalPrice: number,

  shippingTotal: number,
  sentType: string,
  cToken: string,
  calculateCouponDiscount:number,
  discount: number,
  promoCode: string
) => {
  function calculateAmounts(sentType: string, promoCode?: string) {
    let paid_amount = 0
    let balance = 0
    let finalDiscount = discount

    switch (true) {
      default:
        switch (sentType) {
          case 'buffet299':
            finalDiscount = getActualTotalPrice - 299
            paid_amount = 299
            break

            case 'buffet349':
            finalDiscount = getActualTotalPrice - 349
            paid_amount = 349
            break

             case 'buffet399':
            finalDiscount = getActualTotalPrice - 399
            paid_amount = 399
            break

          case 'buffet499':
            finalDiscount = getActualTotalPrice - 499
            paid_amount = 499
            break
          case 'buffet699':
            finalDiscount = getActualTotalPrice - 699
            paid_amount = 699
            break

          default:
            paid_amount = getActualTotalPrice
        }
    }

    balance = paymentForm.amount - paid_amount
    return { paid_amount, balance, finalDiscount }
  }

  const { paid_amount, balance, finalDiscount } = calculateAmounts(sentType, promoCode)

  const discountAmount =
    sentType === 'buffet299'
      ? getActualTotalPrice - 299
      : sentType === 'buffet349'
      ? getActualTotalPrice - 349
      : sentType === 'buffet399'
      ? getActualTotalPrice - 399
      : sentType === 'buffet499'
      ? getActualTotalPrice - 499
      : sentType === 'buffet699'
      ? getActualTotalPrice - 699
      : calculateCouponDiscount

      
  const store: Store = getLocalStorage(key.STORE)
  const user: Officer = Object.create(jwtDecode(getLocalStorage(key.TOKEN)))
  const payload: any = {
    app_id: 1,
    ctoken: cToken,
    store_id: store.id,
    customer_id: customer.id,
    customer_name: customer.name,
    customer_mobile: customer.phone,
    customer_email: customer.email,
    note: paymentForm.remark,
    item_list: orderItems,
    total_items: orderItems.length,
    sub_total: getActualTotalPrice - discountAmount,
    discount_coupon: promoCode,
    discount_amount: discountAmount,

    total_tax: 0,
    shipping_amount: shippingTotal,
    others_charge: '',
    delivery_type: sentType,
    paid_amount: paid_amount,
    paid_total: paymentForm.amount,
    balance: balance,
    pmethod_id: paymentMethod,
    created_by: user.id,
  }

  if (!isEmpty(customer.address)) payload.customer_address = customer.address
  if (!isEmpty(customer.sub_district)) payload.customer_subdistrict = Number(customer.sub_district)
  if (!isEmpty(customer.district)) payload.customer_district = Number(customer.district)
  if (!isEmpty(customer.province)) payload.customer_province = Number(customer.province)
  if (!isEmpty(customer.zip_code)) payload.customer_zipcode = customer.zip_code

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

export { addressOption, orderPayload }
