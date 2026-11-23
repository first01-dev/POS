import DataTable from '@/components/DataTable'
import TemplateBillSlip from '@/components/dialogs/TemplateBillSlipB'

import { StoreName } from '@/components/StoreName'
import { OrderHeaders } from '@/models/column'
import { key } from '@/models/constants/index'
import { BillItems, DataTableOption, Officer, Store as StoreType } from '@/models/type'
import { api } from '@/services/AxiosUtils'
import { getLocalStorage } from '@/services/StorageUtils'
import { useBillStore } from '@/services/StoreUtils'
import { Search, SearchIconWrapper } from '@/services/StyleUtils'
import { ClearOutlined, Close, InventoryOutlined, Print, ReceiptLongRounded, SearchOutlined } from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Fab,
  IconButton,
  InputBase,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import dayjs from 'dayjs'
import jwtDecode from 'jwt-decode'
import Head from 'next/head'
import router from 'next/router'
import * as React from 'react'
import 'react-toastify/dist/ReactToastify.css'

export default function OrderList() {
  const [dataLoading, setDataLoading] = React.useState(true)

  const { setElement } = useBillStore()
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('md')
  const [searchType, setSearchType] = React.useState('ทั้งหมด')
  const [open, setOpen] = React.useState(false)
  const [orderList, setOrderList] = React.useState<any>([])
  const [itemTotal, setItemTotal] = React.useState(0)
  const [store, setStore] = React.useState<any>({})

  const [searchText, setSearchText] = React.useState('')
  const [loadFilter, setLoadFilter] = React.useState(false)
  const [bill_slip, setBillSlip] = React.useState({ html: '', css: '' })
  const [openBill, setOpenBill] = React.useState(false)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(25)
  const [dateStart, setDateStart] = React.useState('')
  const [dateEnd, setDateEnd] = React.useState('')
  const [order, setOrder] = React.useState<any>({})
  const [dataOrder, setDataOrder] = React.useState<any>({})
  const [productOrder, setProductOrder] = React.useState<{
    order_items: BillItems[]
  }>({
    order_items: [],
  })

  const [currentUser, setCurrentUser] = React.useState<Officer>()

  const [paymentForm, setPaymentForm] = React.useState({
    amount: 0,
    change: 0,
    remark: '',
  })
  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }
  const handleChangePage = async (event: unknown, newPage: number) => {
    setPage(newPage)

    const hasDateFilter = !!(dateStart && dateEnd)

    await getOrderlist({
      keywords: searchText,
      start: newPage * rowsPerPage,
      ...(hasDateFilter ? { date: dateStart, date_end: dateEnd } : {}), // ส่งเฉพาะถ้ามี
      fromPageChange: true, // ✅ flag บอกว่าเรียกจากการเปลี่ยนหน้า
    })
  }

  const getOrderlist = async (options?: DataTableOption & { fromPageChange?: boolean }) => {
    const store: StoreType = getLocalStorage(key.STORE)

    const firstDay = dayjs().startOf('month').format('YYYY-MM-DD')
    const lastDay = dayjs().endOf('month').format('YYYY-MM-DD')

    const params: any = {
      store_id: store.id,
      invoice: options?.keywords,
      status: options?.status,
      offset: options?.start,
    }

    const isInitialLoad = !options

    // ✅ ปรับเงื่อนไขให้ไม่ส่ง date ถ้าเป็นการเปลี่ยนหน้าโดยไม่ได้เลือกวันที่
    if (!isInitialLoad) {
      if (options?.date && options?.date_end) {
        params.date = options.date
        params.date_end = options.date_end
      } else if (!options?.fromPageChange && !options?.keywords) {
        // ✅ เฉพาะตอน initial load หรือ search เท่านั้นถึงจะใส่ default เดือนนี้
        params.date = firstDay
        params.date_end = lastDay
      }
    }

    try {
      const res = await api.get('/order/datatable', { params })
      setItemTotal(res.data.recordsFiltered)

      const raw = res.data.data
      if (res) {
        const data = await raw.map(async (item: any) => ({
          ...item,
          ACTION: (
            <div className="showbill">
              <div className="boxshowbill">
                <IconButton sx={{ p: 0, mt: 1 }} onClick={(_) => showBillReceipt(item.id)}>
                  <ReceiptLongRounded sx={{ width: '25px', height: '25px' }} />
                </IconButton>
              </div>
            </div>
          ),
        }))
        const result = await Promise.all(data)
        setOrderList(result)
        setDataLoading(false)
      }
    } catch (error) {
      console.error(error)
    }
  }

  const showBillReceipt = async (orderId: any) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const res = await api.get(`/order/info/${orderId}?store_id=${store.id}`)
    let items: BillItems[] = []
    for (let i = 0; i < res.data.data.order_item.length; i++) {
      const proQuantity = res.data.data.order_item[i].product_quantity
      const proTotalPrice = res.data.data.order_item[i].product_sell_price

      const subtotal = items.push({
        pro_name: res.data.data.order_item[i].product_name,
        pro_quantity: proQuantity,
        pro_subtotal: res.data.data.order_item[i].subtotal,
        pro_discount: res.data.data.order_item[i].product_discount,
        pro_price: res.data.data.order_item[i].product_sell_price,
      })
    }

    setOrder(res.data.data.order_price[0])
    setDataOrder(res.data.data)
    setProductOrder({ order_items: items })
    setOpenBill(true)
  }

  React.useEffect(() => {
  
      getOrderlist()
      

  }, [])

  React.useEffect(() => {
    const user: Officer = jwtDecode(getLocalStorage(key.TOKEN) as string)
    setCurrentUser(user)
    if (getLocalStorage(key.STORE) && getLocalStorage(key.TOKEN)) {
      setStore(getLocalStorage(key.STORE))
    } else {
      router.push('/')
    }
  }, [])

  const onEnterSearch = async (event: any) => {
    if (event.key === 'Enter') {
      if (searchType === 'ทั้งหมด') {
        await getOrderlist({
          keywords: searchText,

          date: dateStart,
          date_end: dateEnd,
        })
      } else {
        await getOrderlist({
          keywords: searchText,
          date: dateStart,
          date_end: dateEnd,
          status: searchType === 'ใช้งาน' ? '0' : '1',
        })
      }
    }
  }

  const onClickSearch = async () => {
    setLoadFilter(true)
    setPage(0)
    const searchOptions: DataTableOption = {
      keywords: searchText,
      date: dateStart || undefined, // Only pass date if dateStart is defined
      date_end: dateEnd || undefined, // Only pass date_end if dateEnd is defined
    }

    await getOrderlist(searchOptions)

    setLoadFilter(false)
  }

  return (
    <div>
      <style>{bill_slip.css}</style>
      <Head>
        <title>POS</title>
        <meta name="description" content="blank" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <LoadingScreen open={load.status} text={load.text} percentage={load.persentage} /> */}
      <div>
        <StoreName text="คำสั่งซื้อ" icon={<InventoryOutlined />} store={store?.name} currentUser={currentUser?.name} />
        <div className="w-80">
          <div
            className="flex justify-between bg-gray rounded-20 p-10 mb-20 mt-20 items-center"
            style={{ gap: 10, height: 70 }}>
            <Search className="bg-white rounded-20 flex justify-between" style={{ height: 40, width: '30%' }}>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>

              <InputBase
                className="input-base"
                onChange={(event) => setSearchText(event.target.value)}
                onKeyDown={onEnterSearch}
                placeholder="เลขที่ใบเสร็จ"
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>

            <Typography>วันที่</Typography>
            <div className="w-50 h-90 flex justify-between items-center bg-white rounded-20 p-0">
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                <Typography className="pl-10">เริ่ม</Typography>
                <DatePicker
                  sx={{ width: '40%' }}
                  format="DD/MM/YYYY"
                  value={dayjs(dateStart)}
                  onChange={(dateString: any) => {
                    setDateStart(dayjs(dateString).format('YYYY-MM-DD'))
                  }}
                />
              </LocalizationProvider>
              <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                <Typography className="w-10">สิ้นสุด</Typography>
                <DatePicker
                  sx={{ width: '40%' }}
                  format="DD/MM/YYYY"
                  value={dayjs(dateEnd)}
                  onChange={(dateString: any) => {
                    setDateEnd(dayjs(dateString).format('YYYY-MM-DD')) // อัปเดตค่าวันที่เมื่อมีการเลือก
                  }}
                />
              </LocalizationProvider>
            </div>

            <Button
              color="primary"
              loading={loadFilter}
              startIcon={<SearchOutlined />}
              variant="contained"
              className="btn-confirm"
              onClick={onClickSearch}>
              <Typography sx={{ fontSize: '14px' }}>ค้นหา</Typography>
            </Button>
          </div>
          {/* Table Element Component */}
          <DataTable
            items={orderList}
            headers={OrderHeaders}
            rowPerPage={rowsPerPage}
            loadingText="ไม่มีรายการคำสั่งซื้อ"
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
            itemTotal={itemTotal}
            loading={dataLoading}
          />
        </div>
      </div>

      {/* Table Element Component */}

      <Dialog
        fullWidth={true}
        maxWidth={maxWidth}
        slotProps={{
          paper: {
            style: {
              borderRadius: 20,
            },
          },
        }}
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 20 }}>
          <DialogTitle id="alert-dialog-title">
            <Typography sx={{ fontSize: '16px' }}>รายละเอียดคำสั่งซื้อ</Typography>
          </DialogTitle>

          <IconButton onClick={(_) => setOpen(false)}>
            <ClearOutlined sx={{ color: '#FE5454' }} />
          </IconButton>
        </div>

        <DialogContent sx={{ paddingBottom: 0 }}></DialogContent>
      </Dialog>
      <Dialog
        open={openBill}
        PaperProps={{
          style: {
            padding: 10,
          },
        }}>
        {/* TEST BUTTON */}
        <Fab
          color="primary"
          aria-label="add"
          className="float-btn-bill hide-on-print"
          onClick={(_) => setOpenBill(false)}>
          <Close />
        </Fab>
        <Fab color="info" aria-label="add" className="float-btn-bill-2 hide-on-print" onClick={(_) => print()}>
          <Print />
        </Fab>
        {order && productOrder.order_items.length > 0 ? (
          <TemplateBillSlip
            text="orderlist"
            store_name={store.name}
            store_address={store.address}
            vat_reg={store.vat_reg_no}
            invoice_id={dataOrder.invoice_number}
            type={dataOrder.type}
            date_time={dayjs(order.created_at).format('DD/MM/YYYY HH:mm')}
            customer_name={dataOrder.customer_name}
            customer_phone={dataOrder.customer_phone}
            customer_address={dataOrder.customer_address}
            items={productOrder.order_items}
            sent_type={dataOrder.type}
            total_items={dataOrder.total_item}
            subtotal={order.sub_total}
            discount_other={order.discount_other}
            discount_coupon={order.discount_coupon}
            discount_amount={order.discount_amount}
            delivery_type={dataOrder.type}
            shipping_amount={order.shipping_amount}
            total_tax={order.total_tax}
            payable_amount={order.paid_amount}
            paid_amount={order.paid_total}
            change={order.balance}
            invoice_note={order.note}
            store_phone={store.phone}
            footer_text=""
          />
        ) : null}
      </Dialog>
    </div>
  )
}
