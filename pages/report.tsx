import DataTable from '@/components/DataTable'
import ItemsReport from '@/components/ItemReport'
import { StoreName } from '@/components/StoreName'
import ProductDetailDialog from '@/components/dialogs/ProductDetail'
import { SaleDailyListHeaders, SaleListHeaders, StockSoldOutHeaders, TopTwentySaleListHeaders } from '@/models/column'
import { key } from '@/models/constants'
import { DataTableOption, Officer, ProductDetail, Store as StoreType } from '@/models/type'
import { api } from '@/services/AxiosUtils'
import { getLocalStorage, setLocalStorage } from '@/services/StorageUtils'
import {
  useSaleStore,
  useStockOutStore,
  useTopTwentySalelistStore,
  useTopTwentySalePricelistStore,
} from '@/services/StoreUtils'
import {
  ClearOutlined,
  MonetizationOnOutlined,
  MoreVertOutlined,
  ShowChartOutlined,
  WarningAmberOutlined,
  WorkspacePremiumOutlined
} from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  IconButton,
  InputBase,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import 'dayjs/locale/th'
import jwtDecode from 'jwt-decode'
import Head from 'next/head'
import React, { useEffect } from 'react'
import toast from 'react-hot-toast'

export default function ReportStore() {
  const [showMonthPicker, setShowMonthPicker] = React.useState(false)
  const [openDetail, setOpenDetail] = React.useState(false)
  const [openIncome, setOpenIncome] = React.useState(false)
  const [store, setStore] = React.useState<any>({})
  const [itemTotal, setItemTotal] = React.useState(0)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(25)
  const [dataLoading, setDataLoading] = React.useState(true)
  const [currentUser, setCurrentUser] = React.useState<Officer>()
  const [selectedSwitch, setSelectedSwitch] = React.useState<string>('ยอดขาย')

  const [selectedMonth, setSelectedMonth] = React.useState<any>(dayjs())
  const [selectedDateIncome, setSelectedDateIncome] = React.useState<any>(dayjs())

  const [headers, setHeaders] = React.useState<any>(SaleListHeaders)
  const [data, setData] = React.useState<any>([])
  const [dataIncome, setDataIncome] = React.useState<any>([])
  const [filterTopTwentySaleList, setFilterTopTwentySaleList] = React.useState('qty')
  const [formDataIncome, setFormDataIncome] = React.useState({
    store_id: '',
    date: '',
    value: '',
  })

  const [productInfo, setProductInfo] = React.useState<ProductDetail>()

  const iconCards = [
    <MonetizationOnOutlined className="icon-item-report" suppressHydrationWarning />,
    <WorkspacePremiumOutlined className="icon-item-report" suppressHydrationWarning />,
    <WarningAmberOutlined className="icon-item-report" suppressHydrationWarning />,
    <WarningAmberOutlined className="icon-item-report" suppressHydrationWarning />,
    // <SyncProblemOutlined className="icon-item-report" suppressHydrationWarning />,
  ]

  const textCards = [
    'ยอดขาย',
    'สินค้าขายดี 20 อันดับ',
    'สินค้าใกล้หมด Stock',
    'แจ้งยอด',
    // 'สินค้าที่ไม่มีการเคลื่อนไหวมากกว่า 1 เดือนขึ้นไป',
  ]

  const itemPanel = iconCards.map((item, index) => {
    return {
      icon: item,
      text: textCards[index],
    }
  })

  const visibleItems = itemPanel.filter((item) => {
    if (item.text === 'แจ้งยอด' && store?.type !== 'B2S' && store?.type !== 'BeTrend') {
      return false
    }

    return true
  })

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilterTopTwentySaleList((event.target as HTMLInputElement).value)
  }

  const handleCloseIncome = () => {
    setOpenIncome(false)
    onButtonSelect('ยอดขาย')
  }

  const handleChangePage = async (event: unknown, newPage: number) => {
    setPage(newPage)

    const options: DataTableOption = {
      start: newPage * rowsPerPage,
      length: rowsPerPage,
    }
    switch (selectedSwitch) {
      case 'ยอดขาย':
        await getSalelist(options)
        break
      case 'สินค้าขายดี 20 อันดับ':
        await getTopTwentySalelist(options)
        break
      case 'สินค้าใกล้หมด Stock':
        await getStocklist(options)
        break
      // case 'สินค้าที่ไม่มีการเคลื่อนไหวมากกว่า 1 เดือนขึ้นไป':
      //   await getDeadStocklist(options)
      //   break
      default:
        await getStocklist(options)
        break
    }
  }

const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const { name, value } = e.target

  // เอาเฉพาะตัวเลขกับจุด
  let cleaned = value.replace(/[^0-9.]/g, '')

  // ไม่ให้มีจุดเกิน 1 ตัว
  const parts = cleaned.split('.')
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('')
  }

  // จำกัดทศนิยมไม่เกิน 2 ตำแหน่ง
  if (cleaned.includes('.')) {
    const [integer, decimal] = cleaned.split('.')
    cleaned = integer + '.' + decimal.slice(0, 2)
  }

  setFormDataIncome((prev) => ({
    ...prev,
    [name]: cleaned,
  }))
}





  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleDateChange = (newValue: any) => {
    setSelectedDateIncome(newValue)
  }

  const handleClose = () => {
    setOpenDetail(false)
  }
  const getStocklist = async (options?: DataTableOption) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const { stockOutlist, setStockOutlist } = useStockOutStore.getState()

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
                <IconButton className="btn-confirm" sx={{ p: 0, mt: 1 }} onClick={(_) => getProductDetail(item)}>
                  <MoreVertOutlined sx={{ width: '25px', height: '25px' }} suppressHydrationWarning />
                </IconButton>
              </div>
            </div>
          ),
        }
      })

      const result = await Promise.all(data)
      setStockOutlist(result)
      setData(result)

      setItemTotal(res.data.recordsTotal)
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
  
  const getSaleListOfDaily = async (options?: DataTableOption) => {
    const store: StoreType = getLocalStorage(key.STORE)

    const res = await api.get('/report/order/monthly', {
      params: {
        store_id: store.id,
        month: options?.date,
        year: options?.year,
      },
    })

   if (res.data && res.data.items && res.data.items.length > 0) {

  const sortedItems = res.data.items.sort((a: any, b: any) => {
    return dayjs(b.bill_date).valueOf() - dayjs(a.bill_date).valueOf()
  })

  const result = sortedItems.map((item: any) => ({
    total_price: item.total_price,
    bill_date: dayjs(item.bill_date).format('DD/MM/YYYY'),
    total_pmethod_cod: item.total_pmethod_cod,
    total_pmethod_creditcard: item.total_pmethod_creditcard,
    total_pmethod_promptpay: item.total_pmethod_promptpay,
  }))

  setData(result)
  setRowsPerPage(sortedItems.length)
  setItemTotal(sortedItems.length)

    } else {
      setItemTotal(0)
      setData([])
    }

    setDataLoading(false)
  }

  const getSalelist = async (options?: DataTableOption) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const { saleList, setSaleList } = useSaleStore.getState()

    if (saleList.length > 0) {
      setData(saleList)
      setItemTotal(saleList.length)
      setDataLoading(false)
      return
    }

    const res = await api.get(`/report/order/six_month_ago?store_id=${store.id}`)
    if (res.data && res.status === 200 && res.data.status === 'Success') {
      const formattedResult = res.data.items.map((item: any) => ({
        total: res.data.total,
        bill_month: dayjs()
          .month(item.bill_month - 1)
          .format('MMMM'),
        total_pmethod_cod: item.total_pmethod_cod,
        total_pmethod_creditcard: item.total_pmethod_creditcard,
        total_pmethod_promptpay: item.total_pmethod_promptpay,
        calculatedTotal: item.total_pmethod_cod + item.total_pmethod_creditcard + item.total_pmethod_promptpay,
        ACTION: (
          <Button
            color="info"
            variant="contained"
            className="btn-confirm"
            onClick={() => {
              setSelectedSwitch('รายวัน')
              onMonthChange(item.bill_month, item.bill_year)
            }}>
            ดูเพิ่มเติม
          </Button>
        ),
      }))

      setSaleList(formattedResult)
      setData(formattedResult)
      setItemTotal(res.data.items.length)
    } else {
      setSaleList([])
      setData([])
      setItemTotal(0)
    }

    setDataLoading(false)
  }

  //ยอดขาย20อันดับตามจำนวน
  const getTopTwentySalelist = async (options?: DataTableOption) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const { topTwentySalelist, setTopTwentySalelist } = useTopTwentySalelistStore.getState()

    if (topTwentySalelist.length > 0) {
      setData(topTwentySalelist)
      setItemTotal(topTwentySalelist.length)
      setDataLoading(false)
      return
    }
    const res = await api.get('/report/top_selling/quantity', {
      params: { store_id: store.id, month: options?.date, year: options?.year },
    })
    if (res.data && res.status === 200 && res.data.status === 'Success') {
      const data = await res.data.items.map(async (item: any) => {
        return {
          product_barcode: item.f_product_barcode,
          product_id: item.f_product_id,
          product_name: item.f_product_name,
          total_price: item.total_price,
          total_quantity: item.total_quantity,
        }
      })

      const result = await Promise.all(data)
      setTopTwentySalelist(result)
      setData(result)
      setItemTotal(res.data.items.length)
    } else {
      setItemTotal(0)
      setData([])
    }
    setDataLoading(false)
  }

  //ยอดขาย20อันดับตามมูลค่า
  const getTopTwentySalePricelist = async (options?: DataTableOption) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const { topTwentySalePricelist, setTopTwentySalePricelist } = useTopTwentySalePricelistStore.getState()
    if (topTwentySalePricelist.length > 0) {
      setData(topTwentySalePricelist)
      setItemTotal(topTwentySalePricelist.length)
      setDataLoading(false)
      return
    }
    const res = await api.get('/report/top_selling/price', {
      params: { store_id: store.id, month: options?.date, year: options?.year },
    })
    if (res.data && res.status === 200 && res.data.status === 'Success') {
      const data = await res.data.items.map(async (item: any) => {
        return {
          product_barcode: item.f_product_barcode,
          product_id: item.f_product_id,
          product_name: item.f_product_name,
          total_price: item.total_price,
          total_quantity: item.total_quantity,
        }
      })
      const result = await Promise.all(data)
      setTopTwentySalePricelist(result)
      setData(result)
      setItemTotal(res.data.items.length)
    } else {
      setItemTotal(0)
      setData([])
    }
    setDataLoading(false)
  }

  const onButtonSelect = (value: string) => {
    setDataLoading(true)
    setSelectedSwitch(value) // อัปเดต selectedSwitch ตามค่าที่ได้รับจาก ItemsReport
    setSelectedMonth(dayjs()) // ตั้งค่าเดือนเป็นปัจจุบัน
  }
  const onMonthChange = (month: any, year: any) => {
    setSelectedMonth(dayjs(`${year}-${month}-01`))

    // Clear the top-twenty sale lists
    const { setTopTwentySalelist } = useTopTwentySalelistStore.getState()
    const { setTopTwentySalePricelist } = useTopTwentySalePricelistStore.getState()
    setTopTwentySalelist([]) // Clear topTwentySalelist
    setTopTwentySalePricelist([]) // Clear topTwentySalePricelist

    fetchData(month, year, filterTopTwentySaleList, selectedSwitch) // Pass selectedSwitch explicitly
  }

  const currentMonth = dayjs()
  const sixMonthsAgo = currentMonth.subtract(5, 'month')

  const isDisabled = (date: any) => {
    if (!date) return true
    const selectedDate = dayjs(date)

    const isOutsideMonthRange =
      selectedDate.isBefore(sixMonthsAgo, 'month') || selectedDate.isAfter(currentMonth, 'month')

    const currentYear = currentMonth.year()
    const sixMonthsAgoYear = sixMonthsAgo.year()
    const selectedYear = selectedDate.year()
    const isOutsideYearRange = selectedYear < sixMonthsAgoYear || selectedYear > currentYear

    return isOutsideMonthRange || isOutsideYearRange
  }

  const getIncomeList = async () => {
    if (!store?.id) return

    try {
      const res = await api.get(`/income?store_id=${store.id}`)
      setDataIncome(res.data.data[0])
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || 'เกิดข้อผิดพลาด')
    }
  }

  const onSaveIncome = async () => {
    if (!store?.id || !selectedDateIncome) return

    try {
      const payload = {
        store_id: store.id,
        date: dayjs(selectedDateIncome).format('YYYY-MM-DD'),
        value: formDataIncome.value,
      }

      await api.post('/income', payload)

      toast.success('บันทึกสำเร็จ')

      setOpenIncome(false) // 👈 ปิด dialog
      setFormDataIncome({
        store_id:store.id,
        date:dayjs().format("DD/MM/YYYY"),
        value:''
      })
      await getIncomeList() // 👈 รีโหลดข้อมูลใหม่
      onButtonSelect('ยอดขาย')
    } catch (err: any) {
      toast.error(err?.response?.data?.msg || 'บันทึกไม่สำเร็จ')
    }
  }

  const fetchData = async (month: string, year: string, filter: string = '', switchType: string) => {
    switch (switchType) {
      case 'ยอดขาย':
        setHeaders(SaleListHeaders)
        await getSalelist({ date: month, year: year })
        setShowMonthPicker(false)
        break
      case 'รายวัน':
        setHeaders(SaleDailyListHeaders)
        await getSaleListOfDaily({ date: month, year })
        setShowMonthPicker(true)
        break
      case 'สินค้าขายดี 20 อันดับ':
        setHeaders(TopTwentySaleListHeaders)
        if (filter === 'qty') {
          await getTopTwentySalelist({ date: month, year: year })
        } else if (filter === 'price') {
          await getTopTwentySalePricelist({ date: month, year: year })
        }
        break
      case 'แจ้งยอด':
        setOpenIncome(true)
        break
      default:
        setHeaders(StockSoldOutHeaders)
        await getStocklist()
        break
    }
  }

  React.useEffect(() => {
    const user: Officer = jwtDecode(getLocalStorage(key.TOKEN) as string)
    const store: StoreType = getLocalStorage(key.STORE)
    const storedSaleList = localStorage.getItem('saleList')
    if (storedSaleList) {
      getSalelist(JSON.parse(storedSaleList))
    }
    setStore(store)
    setCurrentUser(user)

    getSalelist()
  }, [])

  React.useEffect(() => {
    const init = async () => {
      const token = getLocalStorage(key.TOKEN) as string
      const user: Officer = jwtDecode(token)
      const storedStore: StoreType = getLocalStorage(key.STORE)
      const storedSaleList = localStorage.getItem('saleList')

      if (storedSaleList) {
        getSalelist(JSON.parse(storedSaleList))
      }

      if (storedStore?.id) {
        try {
          const res = await api.get(`/store/info/${storedStore.id}`)

          const updatedStore = {
            ...storedStore,
            type: res.data.data[0].type, // 👈 เอา type มาเติม
          }

          setStore(updatedStore)
          setLocalStorage(key.STORE, updatedStore, dayjs().add(1, 'day').unix())
          console.log(store)
        } catch (err) {
          console.error('get store info error', err)
          setStore(storedStore)
        }
      } else {
        setStore(storedStore)
      }

      setCurrentUser(user)
      getSalelist()
    }

    init()
  }, [])
  React.useEffect(() => {
    if (store?.type === 'B2S' || store?.type === 'BeTrend') {
      getIncomeList()
    }
  }, [store?.type])

  useEffect(() => {
    const month = dayjs(selectedMonth).format('MM')
    const year = dayjs(selectedMonth).format('YYYY')
    fetchData(month, year, filterTopTwentySaleList, selectedSwitch)
  }, [selectedSwitch, selectedMonth, filterTopTwentySaleList])

  return (
    <>
      <div>
        <Head>
          <title>POS</title>
          <meta name="description" content="blank" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <Box>
          <StoreName text="Report" icon={<ShowChartOutlined />} store={store?.name} currentUser={currentUser?.name} />

          <div className="item-dashboard-container2">
            <ItemsReport
              items={visibleItems}
              selected={selectedSwitch}
              onSelect={onButtonSelect}
              dataIncome={dataIncome}
            />
            {/* <div className="items-report2" onClick={() => setOpenIncome(true)}>
              <div style={{ display: 'grid', justifyContent: 'right', width: '100%', padding: '1rem' }}>
                <Typography style={{ fontSize: '18px', textAlign: 'right' }}>
                  แจ้งยอดล่าสุด ณ วันที่ {dataIncome.date}
                </Typography>
                <Divider
                  variant="middle"
                  style={{ marginTop: 5, marginBottom: 5, borderTop: '1px solid #7B7878', width: '100%' }}
                />
                <Typography style={{ fontSize: '18px', textAlign: 'right' }}>{dataIncome.value}</Typography>
              </div>
            </div> */}
          </div>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginTop: -2 }}>
            {(selectedSwitch === 'สินค้าขายดี 20 อันดับ' || showMonthPicker) && (
              <div
                style={{
                  display: 'flex',
                  marginTop: '-0.5rem',

                  marginLeft: '1rem',
                  gap: '1rem',
                  alignItems: 'center',
                }}>
                <Typography>เลือกเดือน</Typography>
                <div className="filter-date-input-report">
                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                    <DatePicker
                      views={['year', 'month']}
                      openTo="month"
                      format="MMMM YYYY"
                      value={dayjs(selectedMonth)}
                      onChange={(date) => {
                        if (date) {
                          onMonthChange(date.month() + 1, date.year())
                        }
                      }}
                      disableFuture={true}
                      shouldDisableMonth={isDisabled}
                      minDate={sixMonthsAgo}
                      maxDate={currentMonth}
                    />
                  </LocalizationProvider>
                </div>
              </div>
            )}
            {selectedSwitch === 'สินค้าขายดี 20 อันดับ' && (
              <FormControl>
                <RadioGroup row defaultValue="qty" onChange={handleChange}>
                  <FormControlLabel
                    onClick={(_) => setFilterTopTwentySaleList('qty')}
                    value="qty"
                    control={<Radio />}
                    label="ดูตามจำนวน"
                  />
                  <FormControlLabel
                    value="price"
                    onClick={(_) => setFilterTopTwentySaleList('price')}
                    control={<Radio />}
                    label="ดูตามยอดขาย"
                  />
                </RadioGroup>
              </FormControl>
            )}
          </div>

          <DataTable
            style={{ height: 420 }}
            items={data}
            itemTotal={itemTotal}
            headers={headers}
            rowPerPage={rowsPerPage}
            loadingText="ไม่มีรายการ"
            loading={dataLoading}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />

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
        </Box>
      </div>
      <Dialog
        slotProps={{
          paper: {
            style: {
              borderRadius: 20,
            },
          },
        }}
        open={openIncome}
        >
        <DialogTitle sx={{ fontWeight: 800 ,display:"flex",justifyContent:"space-between" , alignItems:"center"}}>📄 แจ้งยอดขาย <ClearOutlined sx={{ color: '#FE5454' }} onClick={handleCloseIncome}/></DialogTitle>

        <DialogContent style={{ display: 'grid', justifyContent: 'center', gap: 10 }}>
          <div className="filter-date-input-report2">
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DatePicker
                format="DD/MM/YYYY"
                label="เลือกวันที่"
                value={selectedDateIncome}
                onChange={handleDateChange}
              />
            </LocalizationProvider>
          </div>
          <InputBase
            name="value"
            value={formDataIncome.value}
            placeholder="จำนวนเงิน"
            onChange={handleInputChange}
          
            inputProps={{ inputMode: 'decimal' }}
            sx={{
              border: '1px solid #CCCCCC',
              borderRadius: 2,
              paddingLeft: 2,
              width: '100%',
            }}
          />
          <Button onClick={onSaveIncome} variant="contained" className="btn-confirm">
            บันทึก
          </Button>
        </DialogContent>
      </Dialog>
    </>
  )
}
