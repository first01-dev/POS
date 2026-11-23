import { formatBalance } from '@/services/StringUtils';
import dayjs from 'dayjs';
import 'dayjs/locale/th';
dayjs.locale('th');

interface StockOutColumn {
  id: 'ref_no' | 'date' | 'total_quantity' | 'create_by_name' | 'status' | 'ACTION' | 'ACTIONSELECT'
  label: string
  minWidth?: number
  align?: 'right' | 'center' | 'left'
  format?: (value: any) => string
}



interface RequesitionColumn {
  id: 'ref_no' | 'date' | 'total_quantity' | 'create_by_name' | 'status' | 'ACTION'
  label: string
  minWidth?: number
  align?: 'right' | 'center' | 'left'
  format?: (value: any) => string
}

interface StockListColumn {
  id: 'product_barcode' | 'product_book_code' | 'product_name' | 'product_sell_price' | 'product_quantity' | 'ACTION'
  label: string
  minWidth?: number
  width?: number
  align?: 'right' | 'center' | 'left'
  format?: (value: any) => string
}

interface RecallListColumn {
  id: 'product_barcode' | 'product_name' | 'total_quantity'  |"expire"| 'ACTION'| 'ACTIONSELECT'
  label: string
  minWidth?: number
  width?: number
  align?: 'right' | 'center' | 'left'
  format?: (value: any) => string
}

interface DeadStockColumn {
  id: 'product_barcode' | 'product_book_code' | 'product_name'| 'ACTION' |  'product_quantity' | 'lastsell_date' | 'date_diff'
  // 'product_sell_price' | 'product_quantity'
  label: string
  minWidth?: number
  width?: number
  format?: (value: any) => string
  sortable?: boolean
  align?: 'right' | 'center' | 'left'

}

interface SaleListColumn {
  id: 'bill_month' | 'total_pmethod_cod' | 'total_pmethod_creditcard' | 'total_pmethod_promptpay' |'calculatedTotal'| 'ACTION'
  label: string
  minWidth?: number
  width?: number
  align?: 'right' | 'center' | 'left'
  format?: (value: any) => string
}

interface SaleDailyListColumn {
  id: 'bill_date' | 'total_pmethod_cod' | 'total_pmethod_promptpay' | 'total_pmethod_creditcard'|'total_price' 
  label: string
  minWidth?: number
  width?: number
  align?: 'right' | 'center' | 'left'
  format?: (value: any) => string
}

interface TopTwentySaleColumn {
  id:'product_barcode' | 'product_name' |  'total_quantity' | 'total_price'
  label: string
  minWidth?: number
  width?: number
  align?: 'right' | 'center' | 'left'
  format?: (value: any) => string
}


interface StockSoldOutListColumn {
  id: 'product_barcode' | 'product_name' | 'product_quantity' | 'ACTION'
  label: string
  minWidth?: number
  width?: number
  align?: 'right' | 'center' | 'left'
  format?: (value: any) => string
}

interface StockSoldOutReportListColumn {
  id: 'product_barcode' | 'product_name' | 'product_quantity'
  label: string
  minWidth?: number
  width?: number
  align?: 'right' | 'center' | 'left'
  format?: (value: any) => string
}

interface BookClaimListColumn {
  id:
  | 'claim_no'
  | 'create_date'
  
  | 'customer_name'
  | 'customer_phone'
  
  | 'status'

  | 'ACTION'
  label: string
  minWidth?: number
  width?: number
  align?: 'right' | 'center' | 'left'
  format?: (value: any) => string
}

interface OrderListColumn {
  id: 'invoice_number' | 'created_at' | 'customer_name' | 'status' | 'payment_method_name' | 'order_amount' | 'ACTION'
  label: string
  minWidth?: number
  align?: 'right' | 'center' | 'left'
  format?: (value: any) => string
}

interface InvioceColumn {
  id:
    | 'INVOICE_CODE'
    | 'INVOICE_DATE'
    | 'INVOICE_ITEM'
    | 'INVOICE_BOOK'
    | 'INVOICE_TOTAL'
    | 'INVOICE_ACCEPT'
    | 'INVOICE_DUEDATE'
    | 'ACTION'
  label: string
  maxWidth?: number
  align?: 'right' | 'center' | 'left'
  format?: (value: number) => string
}

interface StationColumn {
  id:
    | 'invoice_number'
    | 'create_date'
    | 'total_item'
    | 'customer_name'
    | 'customer_phone'
    | 'type'
    | 'status'
    | 'station_instore_date'
    | 'ACTION'
  label: string
  minWidth?: number
  align?: 'right' | 'center' | 'left'
  format?: (value: any) => string
}

const BookClaimHeaders: BookClaimListColumn[] = [
  {
    id: 'claim_no',
    label: 'เลขที่เคลม',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'create_date',
    label: 'วันที่แจ้งเคลม',
    minWidth: 100,
    align: 'center',
    format: (value) => dayjs(value).format('DD/MM/YYYY'),
  },

  {
    id: 'customer_name',
    label: 'ชื่อลูกค้า',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'customer_phone',
    label: 'เบอร์โทร',
    minWidth: 100,
    align: 'center',
  },

  {
    id: 'status',
    label: 'สถานะ',
    minWidth: 100,
    align: 'center',
  },

  {
    id: 'ACTION',
    label: 'รายละเอียด',
    minWidth: 20,
    align: 'center',
  },
]

const StationHeaders: StationColumn[] = [
  {
    id: 'invoice_number',
    label: 'เลขที่',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'create_date',
    label: 'วันที่',
    minWidth: 100,
    align: 'center',
    format: (value) => dayjs(value).format('DD/MM/YYYY'),
  },
  {
    id: 'total_item',
    label: 'จำนวน',
    minWidth: 50,
    align: 'center',
    format: (value: string) => parseInt(value).toString(),
  },
  {
    id: 'customer_name',
    label: 'ชื่อลูกค้า',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'customer_phone',
    label: 'เบอร์โทร',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'type',
    label: 'ช่องทาง',
    minWidth: 100,
    align: 'center',
    format: (value: string) =>
      value === "recive_store" ? 'รับที่สาขา' : value === "delivery" ? 'ส่งบ้าน' : '',
  },
  {
    id: 'status',
    label: 'สถานะ',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'station_instore_date',
    label: 'วันที่รับ',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'ACTION',
    label: 'รายละเอียด',
    minWidth: 20,
    align: 'center',
  },
]

const StockOutHeaders: StockOutColumn[] = [
  {
    id: 'ref_no',
    label: 'รหัสใบคืนสินค้า',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'date',
    label: 'วันที่',
    minWidth: 100,
    align: 'center',
    format: (value) => dayjs(value).format('DD/MM/YYYY'),
  },
  {
    id: 'total_quantity',
    label: 'จำนวน',
    minWidth: 100,
    align: 'center',
    format: (value: string) => parseInt(value).toString(),
  },
  {
    id: 'create_by_name',
    label: 'พนักงาน',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'status',
    label: 'สถานะ',
    minWidth: 100,
    align: 'center',
    
  },
  {
    id: 'ACTION',
    label: 'รายละเอียด',
    minWidth: 50,
    align: 'center',
  },
  {
    id: 'ACTIONSELECT',
    label: 'เลือกรายการ',
    minWidth: 120,
    align: 'center',
  },
]

const RequesitionHeaders: RequesitionColumn[] = [
  {
    id: 'ref_no',
    label: 'รหัสใบเบิกสินค้า',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'date',
    label: 'วันที่',
    minWidth: 100,
    align: 'center',
    format: (value) => dayjs(value).format('DD/MM/YYYY'),
  },
  {
    id: 'total_quantity',
    label: 'จำนวน',
    minWidth: 100,
    align: 'center',
    format: (value: string) => parseInt(value).toString(),
  },
  {
    id: 'create_by_name',
    label: 'พนักงาน',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'status',
    label: 'สถานะ',
    minWidth: 100,
    align: 'center',
    format:(value) => (value === 'Pending' ? 'รอดำเนินการ' : (value === 'Complete' ? 'สำเร็จ' : (value === 'Cancel' ? 'ยกเลิก' : 'Unknown Status')))
  },
  {
    id: 'ACTION',
    label: 'รายละเอียด',
    minWidth: 50,
    align: 'center',
  },
]

const StockListHeaders: StockListColumn[] = [
  {
    id: 'product_barcode',
    label: 'barcode',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'product_book_code',
    label: 'รหัสหนังสือ',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'product_name',
    label: 'ชื่อหนังสือ',
    width: 100,
    align: 'left',
  },
  {
    id: 'product_sell_price',
    label: 'ราคาขาย',
    minWidth: 100,
    align: 'center',
    format: (value) => formatBalance(value),
  },
  {
    id: 'product_quantity',
    label: 'จำนวนคงเหลือ',
    minWidth: 100,
    align: 'center',
    format: (value) => Number(value).toString(),
  },
  {
    id: 'ACTION',
    label: 'รายละเอียด',
    minWidth: 50,
    align: 'center',
  },
]

const RecallListHeaders: RecallListColumn[] = [
  {
    id: 'product_barcode',
    label: 'barcode',
    width: 100,
    align: 'center',
  },

  {
    id: 'product_name',
    label: 'ชื่อหนังสือ',
    width: 500,
    align: 'left',
  },
  {
    id: 'total_quantity',
    label: 'จำนวนที่เรียกคืน',
    width: 150,
    align: 'center',

  },
    {
    id: 'expire',
    label: 'ทำคืนภายใน',
    width: 150,
    align: 'center',

  },
  {
    id: 'ACTION',
    label: 'รายละเอียด',
    minWidth: 30,
    align: 'center',
  },
  {
    id: 'ACTIONSELECT',
    label: 'เลือกรายการ',
    width: 120,
    align: 'center',
  },
]

const TopTwentySaleListHeaders: TopTwentySaleColumn[] = [
  {
    id: 'product_barcode',
    label: 'barcode',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'product_name',
    label: 'ชื่อสินค้า',
    minWidth: 100,
    align: 'left',
  },
  
  {
    id: 'total_quantity',
    label: 'จำนวน',
    width: 100,
    align: 'center',
  },
  {
    id: 'total_price',
    label: 'ยอดขาย',
    minWidth: 100,
    align: 'center',
    format: (value) => formatBalance(value),
  },

]

const DeadStockListHeaders: DeadStockColumn[] = [
  {
    id: 'product_barcode',
    label: 'barcode',
    width: 100,
    align: 'center',
  },

  {
    id: 'product_name',
    label: 'ชื่อสินค้า',
    width: 400,
    align: 'left',
  },


   {
    id: 'ACTION',
    label: 'รายละเอียด',
    width: 20,
    align: 'center',
  },
  
  {
    id: 'product_quantity',
    label: 'จำนวนคงเหลือ',
    width: 20,
    align: 'center',
    sortable: true,
  },

  {
    id: 'lastsell_date',
    label: 'วันที่ขายล่าสุด',
    width: 20,
    align: 'center',
    sortable: true,
    
format: (value) => value ? dayjs(value).format('DD/MM/YYYY') : 'ไม่เคยขาย'

  },
  {
    id: 'date_diff',
    label: 'ค้างขาย(วัน)',
    width: 20,
    align: 'center',
    sortable: true,

  },

]

const SaleListHeaders: SaleListColumn[] = [
  {
    id: 'bill_month',
    label: 'เดือน',
    width: 100,
    align: 'center',
  },
  {
    id: 'total_pmethod_cod',
    label: 'เงินสด',
    width: 100,
    align: 'center',
    format: (value) => formatBalance(value),
  },
  {
    id: 'total_pmethod_creditcard',
    label: 'บัตรเครดิต',
    width: 100,
    align: 'center',
    format: (value) => formatBalance(value),
  },
  {
    id: 'total_pmethod_promptpay',
    label: 'เงินโอน',
    width: 100,
    align: 'center',
    format: (value) => formatBalance(value),
  },
  {
    id: 'calculatedTotal',
    label: 'รวม',
    width: 100,
    align: 'center',
    format: (value) => formatBalance(value),
  },
  {
    id: 'ACTION',
    label: 'รายละเอียด',
    width: 20,
    align: 'center',
  },
  
]

const SaleDailyListHeaders: SaleDailyListColumn[] = [
  {
    id: 'bill_date',
    label: 'วัน',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'total_pmethod_cod',
    label: 'เงินสด',
    minWidth: 100,
    align: 'center',
    format: (value) => formatBalance(value),
  },
  {
    id: 'total_pmethod_creditcard',
    label: 'บัตรเครดิต',
    width: 100,
    align: 'center',
    format: (value) => formatBalance(value),
  },
  {
    id: 'total_pmethod_promptpay',
    label: 'เงินโอน',
    minWidth: 100,
    align: 'center',
    format: (value) => formatBalance(value),
  },
  {
    id: 'total_price',
    label: 'รวม',
    minWidth: 100,
    align: 'center',
    format: (value) => formatBalance(value),
  },

]

const StockSoldOutHeaders: StockSoldOutListColumn[] = [
  {
    id: 'product_barcode',
    label: 'barcode',
    width: 100,
    align: 'center',
  },

  {
    id: 'product_name',
    label: 'ชื่อหนังสือ',
    width: 100,
    align: 'left',
  },

  {
    id: 'product_quantity',
    label: 'จำนวนคงเหลือ',
    width: 100,
    align: 'center',
    format: (value) => Number(value).toString(),
  },
  {
    id: 'ACTION',
    label: 'รายละเอียด',
    width: 50,
    align: 'center',
  },
]

const StockSoldOutReportHeaders: StockSoldOutReportListColumn[] = [
  {
    id: 'product_barcode',
    label: 'barcode',
    minWidth: 100,
    align: 'center',
  },

  {
    id: 'product_name',
    label: 'ชื่อหนังสือ',
    width: 100,
    align: 'left',
  },

  {
    id: 'product_quantity',
    label: 'จำนวนคงเหลือ',
    minWidth: 100,
    align: 'center',
    format: (value) => Number(value).toString(),
  },

]



const invoiceHeaders: InvioceColumn[] = [
  { id: 'INVOICE_CODE', label: 'เลขใบส่งของ', maxWidth: 100 },
  { id: 'INVOICE_DATE', label: 'วันที่', maxWidth: 100, align: 'center' },
  {
    id: 'INVOICE_ITEM',
    label: 'จำนวนรายการรับ/ส่ง',
    maxWidth: 70,
    align: 'center',
  },
  {
    id: 'INVOICE_BOOK',
    label: 'จำนวนเล่มรับ/ส่ง',
    maxWidth: 70,
    align: 'center',
  },
  { id: 'INVOICE_TOTAL', label: 'มูลค่ารวม', maxWidth: 150, align: 'center' },
  {
    id: 'INVOICE_ACCEPT',
    label: 'สถานะ',
    maxWidth: 100,
    align: 'center',
  },
  {
    id: 'INVOICE_DUEDATE',
    label: 'วันที่รับ',
    maxWidth: 50,
    align: 'center',
  },
  {
    id: 'ACTION',
    label: 'รายละเอียด',
    maxWidth: 100,
    align: 'center',
  },
]

const OrderHeaders: OrderListColumn[] = [
  {
    id: 'invoice_number',
    label: 'เลขที่ใบเสร็จ',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'created_at',
    label: 'วันที่',
    minWidth: 100,
    align: 'center',
    format: (value) => dayjs(value).format('DD/MM/YYYY HH:mm:ss'),
  },
  {
    id: 'customer_name',
    label: 'ชื่อลูกค้า',
    minWidth: 100,
    align: 'center',
  },
  {
    id: 'status',
    label: 'สถานะ',
    minWidth: 100,
    align: 'center',
    format: (value: number) => (value === 1 ? 'ใช้งาน' : 'ไม่ใช้งาน'),
  },
  {
    id: 'payment_method_name',
    label: 'การชำระเงิน',
    minWidth: 100,
    align: 'center',
    
  },
  {
    id: 'order_amount',
    label: 'จำนวนเงิน',
    minWidth: 100,
    align: 'center',
    format: (value) => formatBalance(value),
  },
  {
    id: 'ACTION',
    label: 'ใบเสร็จ',
    minWidth: 20,
    align: 'center',
  },
]

export {
  BookClaimHeaders, DeadStockListHeaders, invoiceHeaders, OrderHeaders, RecallListHeaders, RequesitionHeaders, SaleDailyListHeaders, SaleListHeaders, StationHeaders,
  StockListHeaders, StockOutHeaders, StockSoldOutHeaders, StockSoldOutReportHeaders, TopTwentySaleListHeaders
};

