interface Officer {
  id: number | string
  name: string
  email: string
  iat: number
  exp: number
}

interface Store {
  id: number | string
  address: string
  vat_reg_no: string
  phone: string
  name: string
  code_name: string
}

interface Customer {
  app: 'POS'
  name: string
  email: string
  phone: string
  bod: Date | string
  address: string
  sub_district: string
  district: string
  province: number | string
  zip_code: string
  active: 0
  birth_day?: string // จริงๆมันคือ bod แหละ
  created_by: number
  store_id: number
  ref_source: string
}

interface EditUser {
  id?: number
  _method: 'PATCH'
  app: 'POS'
  name: string
  email: string
  phone: string
  bod: Date | string | null
  address: string
  sub_district: string
  district: string
  province: number | string
  zip_code: string
  active: 0
  birth_day?: string // จริงๆมันคือ bod แหละ
  updated_by: number
  store_id: number
}

interface SelectedCustomer {
  id?: number
  _method: 'PATCH'
  app: 'POS'
  name: string
  email: string
  phone: string
  bod: Date | string | null
  address: string
  sub_district: string
  district: string
  province: number | string
  zip_code: string
  active: 0
  birth_day?: string // จริงๆมันคือ bod แหละ
  updated_by: number
  store_id: number

  // เพิ่ม field สำหรับ id ที่ transformAddress แปลง
  customer_province?: string | number
  customer_district?: string | number
  customer_subdistrict?: string | number
  customer_zipcode?: string
}

interface ProductItem {
  id?:number
  pro_id?: any
  product_id?: any
  pro_quantity?: any
  pro_status?: any
  product_type?: string

  type?: 'changed' | 'return'
  barcode?: string
  name?: string
  price?: number
  ref_no?:string
  quantity?: number
  quan?: number
  product_name?:string
  pickup_quantity?: number
  product_accept_quantity?: number
  product_accept_user?: string
  product_accept?: any
  product_price?:number
  product_sell_price?: number
  sell_price?:number
  accept_date?: string
  
  product_original_qty?: number
  accepted_quantity?: number
  added_time?: Date
  product_code?: string
  product_barcode?: string
  releaseDate?: any
}

interface Coupon  {
  code: string
  type: 'percent' | 'fixed'
  discount: number
}

interface OrderInfo {
  type:string
  total_item:number
}

interface RequisitionBody {
  store_id: number
  user_id: number
  type: string
  note: string
  item: ProductItem[]
}

interface StockOutBody {
  store_id: number
  user_id: number
  driver: number
  type: string
  note: string
  item: ProductItem[]
}

interface RecordBody {
  order_num: string
  item_list: ProductItem[]
}

interface BookClaimBody {
  store_id: string
  claim_no: string
  customer_name: string
  customer_phone: string
  claim_token: string
  creation_date: string
  item_list: ProductItem[]
}

type ClaimDetail = {
  num_id: string
  name: string
  tel: string
  creation_date: string
  item: {
    data: {
      quan: string
      product_code: string
      product_barcode: string
      product_name: string
      product_price: number
    }[]
  }
}

type BookClaim = {
  store_id: string
  claim_no: string
  customer_name: string
  customer_phone: string
  created_by: string
  creation_date: string
  item_list: ProductItem[]
}

type AcceptItemType = {
  product_barcode: string
  qty: number
  // ... other properties
}

type StockOutDetail = {
  id: number
  create_by_name: string
  ref_no: string
  create_date: string
  total_quantity: number
  total_items?: any
  driver_name?: any
  shipping_name?:string
  shipping_on?:string
  type: string
  note: string
  book_list?: ProductItem[]
  shipping_track?:string
}

interface Rider {
  id: string
  name: string
}

type ProductDetail = {
  id: number
  p_book_code: string
  p_name: string
  p_image: string
  p_publishing: string
  p_isbn: string
  p_qty?: number
  release_date: string
  product_price: number
  product_type?: string
  book_no: string
}

type RequisitionDetail = {
  id: number
  created_by_name: string
  ref_no: string
  create_date: string
  total_quantity: number
  total_items: number
  note: string
  book_list: ProductItem[]
}

type PaymentInfo = {
  id: string | number
  name: string
  code_name: string
  details: string
  created_at: string
  updated_at: string
}

type PaymentSelection = PaymentInfo | { edcType: 'edc-qr' | 'edc-credit' }

type CartItem = {
  product_id: string
  product_name: string
  product_book_code: string
  product_image: string
  product_barcode: string
  product_vol: string
  product_price: number
  product_sell_price: number
  product_price_unit: number
  product_type?: string
  product_sell: number
  product_guest_price: number
  product_member_price: number

  product_quantity: string
  pro_quantity: number
  product_discount: number
  quantity: number
  sent_type: string
  added_time: Date
}

type InvoiceDetail = {
  invoice_code: string
  invoice_date?: string
  instore_at?: string
  return_at?: string
  item?: any
  book_list: ProductItem[]
  station_status?: any
  note?: string
  quantity_total?: number
  create_by_name?: string
  total_quantity?: number
  customer_phone?: string
  customer_name?: string
  order_number?: string
  head_text?: string
}

type DataTableOption = {
  keywords?: string
  barcode?: string
  customer_phone?: any
  phone?: any
  date?: string
  year?: string
  date_end?: string
  status?: string
  start?: number
  length?: number
  order?: string
  claim_no?: string
  orderNum?: string
  expire?: string
  store_id?: number
  recordsFiltered?: number
}

type Order = {
  total_order: number
  total_amount: number
  total_normal: number
  total_station: number
}

type BillItems = {
  pro_name: string
  pro_subtotal: number
  pro_quantity: number
  pro_discount: number
  pro_price: number
}

export type {
  AcceptItemType,
  BillItems,
  BookClaim,
  BookClaimBody,
  CartItem,
  ClaimDetail, Coupon, Customer, DataTableOption,
  EditUser,
  InvoiceDetail,
  Officer,
  Order, OrderInfo, PaymentInfo,
  PaymentSelection,
  ProductDetail,
  ProductItem, RecordBody, RequisitionBody,
  RequisitionDetail,
  Rider, SelectedCustomer,
  StockOutBody,
  StockOutDetail,
  Store
}

