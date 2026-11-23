import DataTable from '@/components/DataTable'
import Detail from '@/components/dialogs/Detail'
import ItemsYaakzStation from '@/components/ItemYaakzStation'
import { StoreName } from '@/components/StoreName'
import { StationHeaders } from '@/models/column'
import { key } from '@/models/constants/index'
import { DataTableOption, InvoiceDetail, Officer, ProductItem, Store as StoreType } from '@/models/type'
import { api } from '@/services/AxiosUtils'
import { getLocalStorage } from '@/services/StorageUtils'
import { formatBalance } from '@/services/StringUtils'
import { Item, Search, SearchIconWrapper, StyledTableCell, StyledTableRow } from '@/services/StyleUtils'
import {
  ClearOutlined,
  DoneAll,
  InfoOutlined,
  LocalMallOutlined,
  MonetizationOnOutlined,
  ReceiptLongRounded,
  SearchOutlined,
  Send,
  WorkspacePremiumOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  IconButton,
  InputBase,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import Grid from '@mui/material/Grid'
import dayjs from 'dayjs'
import jwtDecode from 'jwt-decode'
import Head from 'next/head'
import * as React from 'react'
import toast from 'react-hot-toast'
import 'react-toastify/dist/ReactToastify.css'

interface AcceptData {
  product_id: string
  product_accept: number
  accept: any
  note?: string
}

const iconCards = [
  <MonetizationOnOutlined className="icon-item-report" suppressHydrationWarning />,
  <WorkspacePremiumOutlined className="icon-item-report" suppressHydrationWarning />,
  <WorkspacePremiumOutlined className="icon-item-report" suppressHydrationWarning />,
]

const textCards = ['รายการขาย', 'สาขา', 'Online']

const itemPanel = iconCards.map((item, index) => {
  return {
    icon: item,
    text: textCards[index],
  }
})

export default function stationList() {
  const [stationDataList, setStationDataList] = React.useState<any>([])
  const [stationDataDetail, setStationDataDetail] = React.useState<any>({})
  const [itemTotal, setItemTotal] = React.useState(0)

  const [fullWidth, setFullWidth] = React.useState(true)
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('lg')
  const [placeHolder, setPlaceHolder] = React.useState('เลขที่ใบส่งของ')
  const [receiveText, setReceiveText] = React.useState('')
  const [open, setOpen] = React.useState(false)
  const [openAccept, setOpenAccept] = React.useState(false)
  const [openDetail, setOpenDetail] = React.useState(false)
  const [stationInfoItem, setStationInfoItem] = React.useState<any>([])
  const [searchText, setsearchText] = React.useState('')
  const [store, setStore] = React.useState<any>({})
  const [loadFilter, setLoadFilter] = React.useState(false)
  const [loadingSubmit, setLoadingSubmit] = React.useState(false)
  const [isFromExStation, setIsFromExStation] = React.useState(false)
  const [isFromNewStation, setIsFromNewStation] = React.useState(false)
  const [isReturningToWarehouse, setIsReturningToWarehouse] = React.useState(false)
  const [requisitionInfo, setRequisitionInfo] = React.useState<InvoiceDetail>()
  const [currentUser, setCurrentUser] = React.useState<Officer>()
  const [actionButtonLabel, setActionButtonLabel] = React.useState('รับสินค้า')
  const [dataType, setDataType] = React.useState('รายการขาย')

  const [load, setLoad] = React.useState({
    status: false,
    text: '',
    persentage: 0,
  })

  const [dataLoading, setDataLoading] = React.useState(true)

  const [accept, setAccept] = React.useState<AcceptData[]>([])
  const [orderId, setOrderId] = React.useState('')

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(25)
  const [customerPhone, setCustomerPhone] = React.useState('')

  const handleChangePage = async (event: unknown, newPage: number) => {
    setPage(newPage)
    setDataLoading(true)
    const start = newPage * rowsPerPage

    try {
      await getStationDataList({
        keywords: searchText,
        customer_phone: customerPhone, // ค่าที่เก็บจาก state โดยไม่เคลียร์
        start: start,
      })
      console.log(customerPhone)
    } catch (error) {
      console.error('Error during pagination:', error)
    } finally {
      setLoadFilter(false)
    }
  }

  const handleClose = () => {
    setOpenDetail(false)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const openBookAcceptManage = async (id: any, apiEndpoint: string) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const { data, status } = await api.get(`${apiEndpoint}/${id}`, {
      params: { store_id: store.id },
    })
    const isExStation = apiEndpoint === '/exstation/info'
    const isNewStation = apiEndpoint === '/invoice_station/info'
    setIsFromExStation(isExStation) // ตั้งค่าแหล่งที่มา
    setIsFromNewStation(isNewStation)

    if ((status === 200 && data.status === 'Success') || data.status === 'success') {
      const {
        station_status,
        date,
        bill_date,
        item_list,
        order_item,
        invoice_number,
        order_invoice,
        invoice,
        order_number,
      } = data.data

      const orderItems = isExStation || isNewStation ? item_list : order_item
      const formattedOrderItems = orderItems.map((item: any) => ({
        ...item,
        product_quantity: isExStation || isNewStation ? item.quantity : item.product_quantity,
        product_price: isNewStation ? item.product_price_normal : item.product_price,
        product_barcode: item.product_barcode,
        product_name: item.product_name,
        track_number: item.track_number,
      }))

      const formattedStationDataDetail = {
        ...data.data,
        bill_date: isExStation || isNewStation ? date : bill_date,
        invoice_number: isNewStation ? order_invoice : invoice_number,
        order_number: isNewStation ? invoice : order_number,
        track_number: data.data.track_number,
        head_text: isExStation ? 'รับสินค้า Yaakz Station Online' : 'รับสินค้า Yaakz Station สาขา',
      }

      setOrderId(id)
      setAccept(
        formattedOrderItems.map((item: any) => ({
          product_id: item.product_id,
          product_accept: item.product_quantity,
          accept: 1,
        }))
      )
      setStationDataDetail(formattedStationDataDetail)
      setStationInfoItem(formattedOrderItems)

      const buttonLabel =
        station_status === 'รับสินค้าเข้าร้านแล้ว' ||
        data.data.status_text === 'รับสินค้าเข้าร้านแล้ว' ||
        data.data.status === 'instore'
          ? 'ส่งมอบ'
          : 'รับสินค้า'
      setActionButtonLabel(buttonLabel)
      setOpen(true)
    } else {
      toast.error(data.msg)
    }
  }

  //ดึงข้อมูลตารางรับสินค้า
  const getStationDataList = async (options?: DataTableOption) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const isPhoneSearch = !!options?.customer_phone
    let combinedData = []

    if (isPhoneSearch) {
      // เรียกข้อมูลจากทั้งสอง API พร้อมกันโดยระบุหน้าที่ต้องการ
      const [exstationRes, stationRes, stationData] = await Promise.all([
        api.get('/exstation/datatable', {
          params: {
            store: store.id,
            start: options?.start,
            length: rowsPerPage,
            ordernum: options?.keywords,
            phone: options?.customer_phone,
          },
        }),
        api.get('/station/datatable', {
          params: {
            store_id: store.id,
            start: options?.start,
            length: rowsPerPage,
            invoice: options?.keywords,
            customer_phone: options?.customer_phone,
          },
        }),
        api.get('/invoice_station/datatable', {
          params: {
            store_id: store.id,
            start: options?.start,
            length: rowsPerPage,
            order_invoice: options?.keywords,
            customer_phone: options?.customer_phone,
          },
        }),
      ])

      // รวมข้อมูลจากทั้งสอง API
      combinedData = [...exstationRes.data.data, ...stationRes.data.data, ...stationData.data.data]
      setItemTotal(exstationRes.data.recordsFiltered + stationRes.data.recordsFiltered)
    } else {
      const isSiamInterShopSearch = options?.keywords?.length === 7

      const apiEndpoint =
        dataType === 'สาขา'
          ? '/invoice_station/datatable'
          : dataType === 'Online' || isSiamInterShopSearch
          ? '/exstation/datatable'
          : '/station/datatable'

      const params =
        dataType === 'Online' || isSiamInterShopSearch
          ? {
              store: store.id,
              start: options?.start,
              length: rowsPerPage,
              ordernum: options?.keywords,
              phone: options?.customer_phone,
            }
          : dataType === 'สาขา'
          ? {
              store_id: store.id,
              start: options?.start,
              length: rowsPerPage,
              order_invoice: options?.keywords,
              customer_phone: options?.customer_phone,
            }
          : {
              store_id: store.id,
              start: options?.start,
              length: rowsPerPage,
              invoice: options?.keywords,
              customer_phone: options?.customer_phone,
            }

      const res = await api.get(apiEndpoint, { params })
      combinedData = res.data.data
      setItemTotal(res.data.recordsFiltered)
    }

    // จัดการข้อมูลที่ได้รับจาก API
    const data = combinedData.map((item: any) => {
      const isYInThirdPosition = item.order_number
      const isNewStation = item.order_invoice
      const detailApiEndpoint = isYInThirdPosition
        ? '/exstation/info'
        : isNewStation
        ? '/invoice_station/info'
        : '/station/info'

      let status

      switch (item.status) {
        case 'pending':
          status = 'รอดำเนินการ'
          break
        case 'recived':
          status = 'ลูกค้ารับสินค้าแล้ว'
          break
        case 'return':
          status = 'ส่งคืนสินค้าแล้ว'
          break
        case 'instore':
          status = 'รับสินค้าเข้าร้านแล้ว'
          break
        default:
          status = item.station_status || item.status_text || item.status
      }
      let buttonAction = null
      let invoice_number = item.invoice_number || item.order_invoice
      if (item.type === 'delivery') {
        buttonAction = (
          <div className="showbill">
            <div className="boxshowbill">
              <IconButton
                className="btn-confirm"
                onClick={(_) =>
                  showBillReceipt(
                    isYInThirdPosition ? item.invoice_number : isNewStation ? item.id : item.id,
                    detailApiEndpoint
                  )
                }>
                <ReceiptLongRounded sx={{ width: '25px', height: '25px' }} suppressHydrationWarning />
              </IconButton>
            </div>
          </div>
        )
      } else if (dataType === 'รายการขาย') {
        buttonAction = (
          <div className="showbill">
            <div className="boxshowbill">
              <IconButton
                className="btn-confirm"
                onClick={(_) =>
                  showBillReceipt(
                    isYInThirdPosition ? item.invoice_number : isNewStation ? item.id : item.id,
                    detailApiEndpoint
                  )
                }>
                <InfoOutlined sx={{ width: '25px', height: '25px' }} suppressHydrationWarning />
              </IconButton>
            </div>
          </div>
        )
      } else {
        if (status === 'รับสินค้าเข้าร้านแล้ว') {
          buttonAction = (
            <div>
              <Button
                className="btn-confirm"
                color="info"
                variant="contained"
                onClick={() =>
                  openBookAcceptManage(
                    isYInThirdPosition ? item.invoice_number : isNewStation ? item.id : item.id,
                    detailApiEndpoint
                  )
                }
                sx={{
                  color: '#fff',
                  fontSize: '14px',
                  width: 110,
                  borderRadius: '10px',
                }}>
                <Send sx={{ mr: 1 }} />
                ส่งมอบ
              </Button>
            </div>
          )
        } else if (status === 'รอดำเนินการ') {
          buttonAction = (
            <div>
              <Button
                className="btn-confirm"
                color="info"
                variant="contained"
                onClick={() =>
                  openBookAcceptManage(
                    isYInThirdPosition ? item.invoice_number : isNewStation ? item.id : item.id,
                    detailApiEndpoint
                  )
                }
                sx={{
                  color: '#fff',
                  fontSize: '14px',
                  borderRadius: '10px',
                  padding: 0.7,
                  width: 110,
                }}>
                <DoneAll sx={{ mr: 1 }} suppressHydrationWarning />
                รับสินค้า
              </Button>
            </div>
          )
        } else {
          buttonAction = (
            <div className="showbill">
              <div className="boxshowbill">
                <IconButton
                  className="btn-confirm"
                  sx={{ p: 0, mt: 1 }}
                  onClick={(_) =>
                    showBillReceipt(
                      isYInThirdPosition ? item.invoice_number : isNewStation ? item.id : item.id,
                      detailApiEndpoint
                    )
                  }>
                  <InfoOutlined sx={{ width: '25px', height: '25px' }} suppressHydrationWarning />
                </IconButton>
              </div>
            </div>
          )
        }

        if (status === 'ลูกค้ารับสินค้าแล้ว' || status === 'ส่งคืนสินค้าแล้ว') {
          buttonAction = (
            <div className="showbill">
              <div className="boxshowbill">
                <IconButton
                  className="btn-confirm"
                  onClick={(_) =>
                    showBillReceipt(
                      isYInThirdPosition ? item.invoice_number : isNewStation ? item.id : item.id,
                      detailApiEndpoint
                    )
                  }>
                  <ReceiptLongRounded sx={{ width: '25px', height: '25px' }} suppressHydrationWarning />
                </IconButton>
              </div>
            </div>
          )
        }
      }

      return {
        invoice_number: isYInThirdPosition ? item.order_number : invoice_number,
        create_date: item.created_at,
        total_item: item.total_item,
        customer_name: item.customer_name,
        customer_phone: item.customer_phone,
        type: item.type,
        status: status,
        station_instore_date: getReciveDate(status, item, isYInThirdPosition),
        ACTION: buttonAction,
      }
    })

    setStationDataList(data)
    setDataLoading(false)
  }

  const getReciveDate = (status: string, item: any, isYInThirdPosition?: any) => {
    let recive_date = item.station_complete_date || item.complete_date
    let instore_date = item.station_instore_date || item.instore_date
    let return_date = item.station_return_date || item.return_date
    if (status === 'ลูกค้ารับสินค้าแล้ว') {
      const date = isYInThirdPosition ? item.complete_at : recive_date
      return date === '' ? '-' : dayjs(date).isValid() ? dayjs(date).format('DD/MM/YYYY') : '-'
    } else if (status === 'รับสินค้าเข้าร้านแล้ว') {
      const date = isYInThirdPosition ? item.instore_at : instore_date
      return date === '' ? '-' : dayjs(date).isValid() ? dayjs(date).format('DD/MM/YYYY') : '-'
    } else if (status === 'ส่งคืนสินค้าแล้ว') {
      const date = isYInThirdPosition ? item.return_at : return_date
      return date === '' ? '-' : dayjs(date).isValid() ? dayjs(date).format('DD/MM/YYYY') : '-'
    } else {
      return '-'
    }
  }

  const showBillReceipt = async (orderId: any, apiEndpoint: any) => {
    const storeData: StoreType = getLocalStorage(key.STORE)

    const isExStation = apiEndpoint === '/exstation/info'
    const isStation = apiEndpoint === '/station/info'
    const apiEndpoint2 = isExStation
      ? `/exstation/info/${orderId}?store_id=${storeData.id}`
      : isStation
      ? `/station/info/${orderId}?store_id=${storeData.id}`
      : `/invoice_station/info/${orderId}?store_id=${storeData.id}`

    const response = await api.get(apiEndpoint2)
    const res = response.data.data
    const itemDetails: InvoiceDetail = {
      head_text: isStation ? 'รายละเอียดรายการขาย' : 'รายละเอียดรับสินค้า',
      invoice_code: isExStation || isStation ? res.invoice_number : res.order_invoice,
      station_status: res.station_status,
      customer_name: res.customer_name,
      customer_phone: res.customer_phone,
      invoice_date:
        dayjs(isExStation ? res.complete_at : isStation ? res.station_complete_date : res.complete_date).format(
          'DD/MM/YYYY'
        ) || '',
      instore_at: dayjs(isExStation ? res.instore_at : isStation ? res.station_instore_date : res.instore_date).format(
        'DD/MM/YYYY'
      ),
      return_at: dayjs(isExStation ? res.return_at : isStation ? res.station_return_date : res.return_date).format(
        'DD/MM/YYYY'
      ),
      total_quantity: res.total_item,
      order_number: isExStation || isStation ? res.order_number : res.invoice,
      book_list: isStation
        ? res.order_item?.map((value: any) => ({
            pro_id: Number(value.product_id),
            pro_status: value.station_status,
            barcode: value.product_barcode,
            name: value.product_name,
            product_accept_quantity: Number(value.product_quantity || 0),
          }))
        : res.item_list?.map((value: any) => ({
            pro_id: Number(value.product_id),
            pro_status: value.station_status,
            barcode: value.product_barcode,
            name: value.product_name,
            product_accept_quantity: Number(value.quantity || 0),
          })),
    }
    console.log(itemDetails)
    setRequisitionInfo(itemDetails)
    setOpenDetail(true)
  }

  const onSubmitSent = () => {
    if (isReturningToWarehouse) {
      acceptSentReturn()
      setIsReturningToWarehouse(false)
    } else if (actionButtonLabel === 'ส่งมอบ') {
      invoiceSent()
    } else if (actionButtonLabel === 'รับสินค้า') {
      invoiceAccept()
    }
  }

  const invoiceSent = async () => {
    setLoadingSubmit(true)
    const user = Object.create(jwtDecode(getLocalStorage(key.TOKEN)))
    const payload = isFromExStation
      ? {
          store_id: parseInt(store.id),
          invoice_number: orderId,
          user_id: parseInt(user.id),
        }
      : {
          id: orderId,
          store_id: parseInt(store.id),
          user_id: parseInt(user.id),
        }

    const endpoint = isFromExStation ? '/exstation/confirm' : '/invoice_station/recived'

    const res = await api.post(endpoint, payload)
    if ((res && res.status === 200 && res.data.status === 'Success') || res.data.status === 'success') {
      setLoadingSubmit(false)
      toast.success(res.data.msg)
      setOpenAccept(false)
      setOpen(false)
      await getStationDataList({ keywords: searchText, start: page * rowsPerPage })
    } else {
      toast.error(res.data.msg)
      setOpenAccept(false)
      setLoadingSubmit(false)
    }
  }
  const invoiceAccept = async () => {
    setLoadingSubmit(true)
    const user = Object.create(jwtDecode(getLocalStorage(key.TOKEN)))

    const payload = isFromExStation
      ? {
          store_id: parseInt(store.id),
          invoice_number: orderId,
          user_id: parseInt(user.id),
        }
      : {
          id: orderId,
          store_id: parseInt(store.id),
          user_id: parseInt(user.id),
        }

    // กำหนด endpoint ตามแหล่งที่มา
    const endpoint = isFromExStation ? '/exstation/accept' : '/invoice_station/instore'

    const res = await api.post(endpoint, payload)
    if ((res && res.status === 200 && res.data.status === 'Success') || res.data.status === 'success') {
      setLoadingSubmit(false)
      toast.success(res.data.msg)
      setOpenAccept(false)
      setOpen(false)
      await getStationDataList({ keywords: searchText, start: page * rowsPerPage })
    } else {
      toast.error(res.data.msg)
      setOpenAccept(false)
      setLoadingSubmit(false)
    }
  }

  const acceptSentReturn = async () => {
    setLoadingSubmit(true)
    const user = Object.create(jwtDecode(getLocalStorage(key.TOKEN)))

    const payload = isFromExStation
      ? {
          store_id: parseInt(store.id),
          invoice_number: orderId,
          user_id: parseInt(user.id),
        }
      : {
          id: orderId,
          store_id: parseInt(store.id),
          user_id: parseInt(user.id),
        }

    const endpoint = isFromExStation ? '/exstation/return' : '/invoice_station/return'

    const res = await api.post(endpoint, payload)
    if ((res && res.status === 200 && res.data.status === 'Success') || res.data.status === 'success') {
      setLoadingSubmit(false)
      toast.success(res.data.msg)
      setOpenAccept(false)
      setOpen(false)
      await getStationDataList({ keywords: searchText, start: page * rowsPerPage })
    } else {
      toast.error(res.data.msg)
      setOpenAccept(false)
      setLoadingSubmit(false)
    }
  }

  React.useEffect(() => {
    const user: Officer = jwtDecode(getLocalStorage(key.TOKEN) as string)
    setCurrentUser(user)
    if (getLocalStorage(key.STORE) && getLocalStorage(key.TOKEN)) {
      setStore(getLocalStorage(key.STORE))
    }
  }, [])

  React.useEffect(() => {
    setLoad({ status: true, text: 'รายการรับสินค้า...', persentage: 75 })
    getStationDataList()
  }, [])

  const onEnterSearch = async (event: any) => {
    if (event.key === 'Enter') {
      await getStationDataList({
        keywords: searchText,
        customer_phone: customerPhone,
      })
    }
  }

  const onClickSearch = async () => {
    setLoadFilter(true)
    setPage(0)
    try {
      const isFromSiamInterShop = searchText.length === 7

      if (isFromSiamInterShop) {
        await onButtonSelect('Online')
        setsearchText('')
      } else if (isFromNewStation) {
        await onButtonSelect('สาขา')
        setsearchText('')
      } else {
        await onButtonSelect('รายการขาย')
        setsearchText('')
      }

      await getStationDataList({
        keywords: searchText,
        customer_phone: customerPhone,
      })
      setCustomerPhone('')
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการดึงข้อมูล')
    } finally {
      setLoadFilter(false)
    }
  }
  const onButtonSelect = async (value: any) => {
    setDataType(value) // อัปเดต dataType
    if (value === 'Online') {
      setCustomerPhone('')
      setPlaceHolder('เลขที่คำสั่งซื้อ')
      setPage(0)
    } else {
      setPlaceHolder('เลขที่ใบส่งของ')
      setReceiveText('รายการขาย')
    }
  }

  React.useEffect(() => {
    const fetchData = async () => {
      setDataLoading(true)
      try {
        await getStationDataList({
          keywords: searchText,
          customer_phone: customerPhone,
        })
      } catch (error) {
        console.error('Error fetching data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    if (dataType) {
      fetchData()
    }
  }, [dataType])

  return (
    <div>
      <Head>
        <title>POS</title>
        <meta name="description" content="blank" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <LoadingScreen open={load.status} text={load.text} percentage={load.persentage} /> */}
      <div>
        <StoreName
          text="Yaakz Station"
          icon={<LocalMallOutlined />}
          store={store?.name}
          currentUser={currentUser?.name}
        />

        <div className=" flex justify-between items-center" style={{width:"85%"}}>
          <Box
            className="w-60 flex justify-between bg-gray rounded-20 p-10 items-center"
            style={{ gap: 10, height: 70 }}>
            <Typography sx={{ ml: 2 }}>ค้นหา</Typography>
            <Search className="input" style={{ width: '40%' }}>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              <InputBase
                className="input-base"
                placeholder={placeHolder}
                onKeyDown={onEnterSearch}
                value={searchText}
                onChange={(e) => setsearchText(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>

            <Typography>หรือ</Typography>
            <Search className="input " style={{ width: '40%' }}>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              <InputBase
                className="input-base"
                placeholder="เบอร์โทรศัพท์"
                onKeyDown={onEnterSearch}
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>

            <Button
              color="primary"
              loading={loadFilter}
              startIcon={<SearchOutlined suppressHydrationWarning />}
              variant="contained"
              className="btn-confirm p-10"
              onClick={onClickSearch}>
              <Typography sx={{ fontSize: '14px' }}>ค้นหา</Typography>
            </Button>
          </Box>
          <div className="item-yaakzstation-container">
            <ItemsYaakzStation updateValue={dataType} items={itemPanel} onSelect={onButtonSelect} />
          </div>
        </div>
        {/* Table Element Component */}
        <DataTable
          items={stationDataList}
          itemTotal={itemTotal}
          headers={StationHeaders}
          rowPerPage={rowsPerPage}
          loadingText="ไม่มีรายการรับสินค้า"
          loading={dataLoading}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </div>

      {/* Table Element Component */}

      <Dialog
        fullWidth={fullWidth}
        maxWidth={maxWidth}
        PaperProps={{
          style: {
            borderRadius: 20,
          },
        }}
        open={open}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '93%' }}>
            <DialogTitle id="alert-dialog-title">
              <Typography sx={{ fontSize: '24px' }}>{stationDataDetail.head_text}</Typography>
            </DialogTitle>
          </div>
          <div>
            <IconButton className="btn-confirm" onClick={(_) => setOpen(false)} sx={{ mt: 1 }}>
              <ClearOutlined sx={{ color: '#FE5454' }} />
            </IconButton>
          </div>
        </div>
        <Grid container spacing={2}>
          <Grid xs={4}>
            <Item>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, ml: 2, mt: 2 }}>
                เลขที่ใบรับสินค้า : {stationDataDetail.invoice_number}
              </Typography>
            </Item>
          </Grid>
          <Grid xs={4}>
            <Item>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, ml: 2, mt: 2 }}>
                หมายเลขพัสดุ : {stationDataDetail.track_number}
              </Typography>
            </Item>
          </Grid>
          <Grid xs={4}>
            <Item>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, ml: 2, mt: 2 }}>
                เลขที่คำสั่งซื้อ : {stationDataDetail.order_number}
              </Typography>
            </Item>
          </Grid>
          <Grid xs={4}>
            <Item>
              <Typography sx={{ fontSize: '16px', fontWeight: 600, ml: 2, mt: 2 }}>
                เลขที่คำสั่งซื้อ : {stationDataDetail.order_number}
              </Typography>
            </Item>
          </Grid>
          <Grid xs={4}>
            <Item>
              {' '}
              <Typography sx={{ fontSize: '16px', fontWeight: 600, ml: 2, mt: 2 }}>
                ชื่อลูกค้า : {stationDataDetail.customer_name}
              </Typography>
            </Item>
          </Grid>
          <Grid xs={4}>
            <Item>
              {' '}
              <Typography sx={{ fontSize: '16px', fontWeight: 600, ml: 2, mr: 2, mt: 2 }}>
                เบอร์โทรศัพท์ : {stationDataDetail.customer_phone}
              </Typography>
            </Item>
          </Grid>
        </Grid>

        <DialogContent sx={{ py: 0 }}>
          <TableContainer
            component={Paper}
            sx={{
              width: '100%',
              borderRadius: '0px',
              border: 'none',
              overflowX: 'initial',
              boxShadow: 'none',
            }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center">Barcode</StyledTableCell>
                  <StyledTableCell align="left" sx={{ width: '300px' }}>
                    ชื่อสินค้า
                  </StyledTableCell>

                  <StyledTableCell align="center">ราคาปก</StyledTableCell>
                  <StyledTableCell align="center">ที่ส่งมา</StyledTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {stationInfoItem.map((item: any, index: any) => (
                  <StyledTableRow sx={{ height: 20 }} key={index}>
                    <StyledTableCell className="cellinvoiceinfo" align="center">
                      {item.product_barcode}
                    </StyledTableCell>
                    <StyledTableCell
                      className="cellinvoiceinfo"
                      component="th"
                      scope="row"
                      align="left"
                      sx={{ width: '400px' }}>
                      {item.product_name}
                    </StyledTableCell>

                    <StyledTableCell className="cellinvoiceinfo" align="center">
                      {formatBalance(item.product_price)}
                    </StyledTableCell>
                    <StyledTableCell className="cellinvoiceinfo" align="center">
                      {item.product_quantity}
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', mb: 1, mt: 1 }}>
          <Button color="info" variant="contained" onClick={() => setOpenAccept(true)} className="btn-confirm">
            <DoneAll sx={{ mr: 1 }} suppressHydrationWarning />
            {actionButtonLabel}
          </Button>
          {actionButtonLabel === 'ส่งมอบ' && (
            <div style={{ borderLeft: '1px #000 solid', paddingLeft: '1%' }}>
              <Button
                color="secondary"
                variant="contained"
                onClick={() => {
                  setIsReturningToWarehouse(true) // กำหนดสถานะการส่งคืนคลัง
                  setOpenAccept(true) // เปิด dialog
                }}
                className="btn-confirm">
                <Send sx={{ mr: 1 }} suppressHydrationWarning />
                <Typography>ส่งคืนคลัง</Typography>
              </Button>
            </div>
          )}
        </DialogActions>
      </Dialog>
      <Dialog sx={{ padding: 2 }} open={openAccept}>
        <DialogContentText sx={{ padding: 5 }}>ยืนยันการรับสินค้าหรือไม่</DialogContentText>
        <DialogActions sx={{ mb: 2, justifyContent: 'center' }}>
          <Button
            className="btn-confirm"
            loading={loadingSubmit}
            color="info"
            variant="contained"
            onClick={onSubmitSent}
            autoFocus>
            ยืนยัน
          </Button>
          <Button
            className="btn-confirm"
            onClick={() => setOpenAccept(false)}
            autoFocus
            color="warning"
            variant="contained">
            ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>

      {/* Table Element Component */}

      <Detail
        open={openDetail}
        onClose={handleClose}
        html={'YaakzStation'}
        text_accecpt_qauntity="จำนวนที่ส่งมา"
        text_ref_no="เลขที่ใบรับสินค้า"
        text_title="วันที่"
        subtitle={requisitionInfo?.head_text}
        order_number={requisitionInfo?.order_number}
        ref_no={requisitionInfo?.invoice_code}
        create_date={requisitionInfo?.invoice_date}
        instore_at={requisitionInfo?.instore_at}
        return_at={requisitionInfo?.return_at}
        station_status={requisitionInfo?.station_status}
        customer_name={requisitionInfo?.customer_name}
        customer_phone={requisitionInfo?.customer_phone}
        total_quantity={requisitionInfo?.total_quantity}
        book_list={requisitionInfo?.book_list as ProductItem[]}
        note={requisitionInfo?.note}
      />
    </div>
  )
}
