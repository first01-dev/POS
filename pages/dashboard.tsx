import DataTable from '@/components/DataTable'
import ItemsDashboard from '@/components/ItemsDashboard'
import { StoreName } from '@/components/StoreName'
import ProductDetailDialog from '@/components/dialogs/ProductDetail'
import { StockSoldOutHeaders } from '@/models/column'
import { key } from '@/models/constants'
import { DataTableOption, Officer, Order, ProductDetail, Store as StoreType } from '@/models/type'
import { api } from '@/services/AxiosUtils'
import { getLocalStorage } from '@/services/StorageUtils'
import { formatBalance } from '@/services/StringUtils'
import { AssessmentOutlined, CurrencyExchange, MoreVertOutlined } from '@mui/icons-material'
import { Box, IconButton, Typography } from '@mui/material'
import dayjs from 'dayjs'
import jwtDecode from 'jwt-decode'
import Head from 'next/head'
import router from 'next/router'
import React from 'react'
import ImageMonth from '../assets/images/30-days.png'
import ImageWeek from '../assets/images/7-days.png'
import ImageDate from '../assets/images/date.png'

const initialOrder: Order = {
  total_amount: 0,
  total_station: 0,
  total_order: 0,
  total_normal: 0,
}

export default function Dashboard() {
  const [store, setStore] = React.useState<any>({})
  const [stockList, setStockList] = React.useState<any>([])
  const [itemTotal, setItemTotal] = React.useState(0)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(25)
  const [dataLoading, setDataLoading] = React.useState(true)

  const [openDetail, setOpenDetail] = React.useState(false)
  const [productInfo, setProductInfo] = React.useState<ProductDetail>()


  const [currnetDay, setCurrentDay] = React.useState<Order>(initialOrder)
  const [currentWeek, setCurrentWeek] = React.useState<Order>(initialOrder)
  const [currentMonth, setCurrentMonth] = React.useState<Order>(initialOrder)
  const [orderLastDay, setOrderLastDay] = React.useState<Order>(initialOrder)
  const [orderWeekly, setOrderWeekly] = React.useState<Order>(initialOrder)
  const [orderMonthly, setOrderMonthly] = React.useState<Order>(initialOrder)
  const [currentUser, setCurrentUser] = React.useState<Officer>()

  const handleChangePage = async (event: unknown, newPage: number) => {
    setPage(newPage)
    const options: DataTableOption = {
      start: newPage * rowsPerPage,
      length: rowsPerPage,
    }
    await getStocklist(options)
  }

  const handleClose = () => {
    setOpenDetail(false)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const getStocklist = async (options?: DataTableOption) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const res = await api.get('/store/quan_alert', {
      params: {
        store_id: store.id,
        keywords: options?.keywords,
        alert: 3,
        order: options?.order,
        start: options?.start,
        length: options?.length,
      },
    })
    if (res) {
      setItemTotal(res.data.recordsFiltered)
      const data = await res.data.data.map(async (item: any) => {
        return {
          product_barcode: item.product_barcode,
          product_book_code: item.product_id,
          product_name: item.product_name,
          product_sell_price: item.product_sell_price,
          product_quantity: item.product_quantity,

          ACTION: (
            <div className="showbill">
              <div className="boxshowbill">
                <IconButton sx={{ p: 0, mt: 1 }} onClick={(_) => getProductDetail(item)}>
                  <MoreVertOutlined sx={{ width: '25px', height: '25px' }} suppressHydrationWarning />
                </IconButton>
              </div>
            </div>
          ),
        }
      })

      const result = await Promise.all(data)
      setStockList(result)
      setDataLoading(false)
    }
  }

  const getProductDetail = async (row: any) => {
    const store = getLocalStorage(key.STORE)
    const prodDetailRes = await api.get(`/product/info/${row.product_id}?store_id=${store.id}`)
    const itemDetails: ProductDetail = {
      id: Number(prodDetailRes.data.items.product_id),
      p_book_code: prodDetailRes.data.items.product_ref_code,
      p_name: prodDetailRes.data.items.product_name,
      book_no: prodDetailRes.data.items.product_exinfo_data.book_no,
      p_image: prodDetailRes.data.items.product_image,
      p_publishing: prodDetailRes.data.items.product_exinfo_data.publisher,
      p_isbn: prodDetailRes.data.items.product_barcode,
      product_price: parseFloat(prodDetailRes.data.items.product_price),
      p_qty: parseInt(prodDetailRes.data.items.product_quantity),
      release_date: dayjs(prodDetailRes.data.items.product_release_on).format('DD/MM/YYYY'),
    }
    setProductInfo(itemDetails)
    setOpenDetail(true)
  }

  const getDailyOrderSummary = async () => {
    const store: StoreType = getLocalStorage(key.STORE)
    // current date summary
    const params1 = { store_id: store.id, date: dayjs().format('YYYY-MM-DD') }
    const res1 = await api.get('/dashboard/order_daily', { params: params1 })
    setCurrentDay(res1.data.data)
    // last day summary
    const params2 = { store_id: store.id, date: dayjs().subtract(1, 'day').format('YYYY-MM-DD') }
    const res2 = await api.get('/dashboard/order_daily', { params: params2 })
    setOrderLastDay(res2.data.data)
  }

  const getWeeklyOrderSummary = async () => {
    const store: StoreType = getLocalStorage(key.STORE)
    // current week summary
    const params1 = { store_id: store.id, date: dayjs().format('YYYY-MM-DD') }
    const res = await api.get('/dashboard/order_weekly', { params: params1 })
    setCurrentWeek(res.data.data)
    // last week summary base on monday of week
    const params2 = { store_id: store.id, date: getMondayOfLastWeek() }
    const res2 = await api.get('/dashboard/order_weekly', { params: params2 })
    setOrderWeekly(res2.data.data)
  }

  const getMondayOfLastWeek = () => {
    const today = new Date()
    const lastWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7)
    const lastMonday = new Date(lastWeek.setDate(lastWeek.getDate() - lastWeek.getDay() + 1))
    return dayjs(lastMonday).format('YYYY-MM-DD')
  }

  const getMonthlyOrderSummary = async () => {
    const store: StoreType = getLocalStorage(key.STORE)
    // current month summary
    const params1 = { store_id: store.id, month: dayjs().format('MM') }
    const res = await api.get('/dashboard/order_monthly', { params: params1 })
    setCurrentMonth(res.data.data)
    // last month summary
    const params2 = { store_id: store.id, month: dayjs().subtract(1, 'month').format('MM') }
    const res2 = await api.get('/dashboard/order_monthly', { params: params2 })
    setOrderMonthly(res2.data.data)
  }


  React.useEffect(() => {
    const user: Officer = jwtDecode(getLocalStorage(key.TOKEN) as string)
    setCurrentUser(user)
    if (getLocalStorage(key.STORE) && getLocalStorage(key.TOKEN)) {
      setStore(getLocalStorage(key.STORE))
      // getOrderlist()
      getStocklist()
      getDailyOrderSummary()
      getWeeklyOrderSummary()
      getMonthlyOrderSummary()
    } else {
      router.push('/')
    }
  }, [])

  return (
    <>
      <div>
        <Head>
          <title>POS</title>
          <meta name="description" content="blank" />
          <link rel="icon" href="/favicon.icon" />
        </Head>
        <Box className="w-85">
          <StoreName
            text="Dashboard"
            icon={<AssessmentOutlined />}
            store={store?.name}
            currentUser={currentUser?.name}
          />

          <div className="item-dashboard-container">
            <ItemsDashboard
              icon={ImageDate}
              saleForTodayText="ยอดขายวันนี้"
              saleForWeekText="ยอดขายเมื่อวาน"
              salePriceToday={currnetDay.total_amount}
              salePriceWeek={orderLastDay.total_amount}
            />
            <ItemsDashboard
              icon={ImageWeek}
              saleForTodayText="ยอดขายสัปดาห์นี้"
              saleForWeekText="ยอดขายสัปดาห์ที่แล้ว"
              salePriceToday={currentWeek.total_amount}
              salePriceWeek={orderWeekly.total_amount}
            />
            <ItemsDashboard
              icon={ImageMonth}
              saleForTodayText="ยอดขายเดือนนี้"
              saleForWeekText="ยอดขายเดือนที่แล้ว"
              salePriceToday={currentMonth.total_amount}
              salePriceWeek={orderMonthly.total_amount}
            />
            <div className="items-dashboard">
              <div className="item-dashbord-container-component">
                <div>
                  <CurrencyExchange className="icon-item-dashboard2" suppressHydrationWarning />
                </div>
                <div style={{ width: '65%' }}>
                  <div style={{ textAlign: 'right', marginTop: 12 }}>
                    <Typography style={{ fontSize: '14px' }}>ยอดขาย Yaakz Staion</Typography>
                  </div>
                  <div style={{ textAlign: 'right', marginTop: 5 }}>
                    <Typography style={{ fontSize: '14px' }}>เดือนนี้</Typography>
                  </div>
                  <div style={{ textAlign: 'right', marginTop: 5 }}>
                    <Typography style={{ fontSize: '34px' }}>{formatBalance(currentMonth.total_station)}</Typography>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Typography sx={{ width: '90%', ml: '2%' }}>รายการสินค้าใกล้หมด</Typography>
          <DataTable
            items={stockList}
            itemTotal={itemTotal}
            headers={StockSoldOutHeaders}
            rowPerPage={rowsPerPage}
            loadingText="ไม่มีรายการสินค้า"
            loading={dataLoading}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        </Box>

        <ProductDetailDialog
          html="Product Details"
          open={openDetail}
          onClose={handleClose}
          p_image={productInfo?.p_image}
          p_name={productInfo?.p_name}
          book_no={productInfo?.book_no}
          product_price={productInfo?.product_price}
          p_isbn={productInfo?.p_isbn}
          p_book_code={productInfo?.p_book_code}
          p_publishing={productInfo?.p_publishing}
          release_date={productInfo?.release_date}
          p_qty={productInfo?.p_qty}
        />
      </div>
    </>
  )
}
