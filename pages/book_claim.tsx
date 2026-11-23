import DataTable from '@/components/DataTable'
import Detail from '@/components/dialogs/Detail'
import ProductDetailDialog from '@/components/dialogs/ProductDetail'
import ItemsYaakzStation from '@/components/ItemYaakzStation'
import { StoreName } from '@/components/StoreName'
import { BookClaimHeaders } from '@/models/column'
import { key } from '@/models/constants/index'
import {
  BookClaimBody,
  DataTableOption,
  InvoiceDetail,
  Officer,
  ProductDetail,
  ProductItem,
  Store as StoreType,
} from '@/models/type'
import { api } from '@/services/AxiosUtils'
import { getLocalStorage } from '@/services/StorageUtils'
import { Search, SearchIconWrapper, StyledTableCell, StyledTableRow } from '@/services/StyleUtils'
import {
  ChangeCircleOutlined,
  ClearOutlined,
  DoneAll,
  MonetizationOnOutlined,
  MoreVertOutlined,
  ReceiptLongRounded,
  SearchOutlined,
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
  Divider,
  FormControl,
  FormControlLabel,
  IconButton,
  InputBase,
  Paper,
  Radio,
  RadioGroup,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import axios from 'axios'
import dayjs from 'dayjs'
import jwtDecode from 'jwt-decode'
import Head from 'next/head'
import * as React from 'react'
import toast from 'react-hot-toast'
import 'react-toastify/dist/ReactToastify.css'
import { v4 as uuidv4 } from 'uuid'

const iconCards = [
  <MonetizationOnOutlined className="icon-item-report" suppressHydrationWarning />,
  <WorkspacePremiumOutlined className="icon-item-report" suppressHydrationWarning />,
]

const textCards = ['เคลมหนังสือ', 'ประวัติการเคลม']

const itemPanel = iconCards.map((item, index) => {
  return {
    icon: item,
    text: textCards[index],
  }
})

type ErrorMessageType = {
  store_name: string
  num_id: string
  name: string
}

export default function stationList() {
  const [bookCliamList, setBookCliamList] = React.useState<any>([])
  const [bookCliamDetail, setBookCliamDetail] = React.useState<any>({})
  const [bookCliamInfo, setBookCliamInfo] = React.useState<InvoiceDetail>()
  const [itemTotal, setItemTotal] = React.useState(0)

  const [bookclaim, setBookCliam] = React.useState<BookClaimBody>({
    store_id: '',
    claim_no: '',
    customer_name: '',
    customer_phone: '',
    claim_token: '',
    creation_date: '',
    item_list: [],
  })

  const [fullWidth, setFullWidth] = React.useState(true)
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('lg')

  const [openDetail, setOpenDetail] = React.useState(false)
  const [openaddClaim, setOpenaddClaim] = React.useState(false)
  const [openDetailBill, setOpenDetailBill] = React.useState(false)

  const [productInfo, setProductInfo] = React.useState<ProductDetail>()
  const [dataClaim, setDataClaim] = React.useState<any>([])

  const [selectedNumId, setSelectedNumId] = React.useState('')
  const [searchText, setSearchText] = React.useState('')
  const [claimToken, setClaimToken] = React.useState('')
  const [store, setStore] = React.useState<any>({})
  const [loadFilter, setLoadFilter] = React.useState(false)
  const [loadingSubmit, setLoadingSubmit] = React.useState(false)
  const [openAccept, setOpenAccept] = React.useState(false)

  const [currentUser, setCurrentUser] = React.useState<Officer>()
  const [existingClaims, setExistingClaims] = React.useState<string[]>([])
  const [statusClaims, setStatusClaims] = React.useState<{ claim_no: string; status: string }[]>([])

  const [prodSearch, setProdSearch] = React.useState('')
  const [customerPhone, setCustomerPhone] = React.useState('')
  const [claimNo, setClaimNo] = React.useState('')
  const [searchType, setSearchType] = React.useState('เลขที่ใบเคลม')
  const [dataType, setDataType] = React.useState('เคลมหนังสือ')
  const [isErrorDialogOpen, setIsErrorDialogOpen] = React.useState(false)
  const [errorMessage, setErrorMessage] = React.useState<ErrorMessageType | null>(null)

  const [load, setLoad] = React.useState({
    status: false,
    text: '',
    persentage: 0,
  })
  const [dataLoading, setDataLoading] = React.useState(true)

  const [page, setPage] = React.useState(0)
  const [timeStamp, setTimeStamp] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(25)

  const [dataList, setDataList] = React.useState<any>([])

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>, id: string) => {
    const newValue = event.target.value as 'Changed' | 'Return'
    const newDataList = dataList.map((item: any) => {
      if (item.id === id) {
        return {
          ...item,
          type: newValue,
        }
      }
      return item
    })
    setDataList(newDataList)
  }

  const handleChangePage = async (event: unknown, newPage: number) => {
    setPage(newPage)

    await getBookCliamList({
      keywords: searchText,
      start: newPage * rowsPerPage,
    })
  }

  const handleCloseDetail = () => {
    setOpenDetail(false)
  }

  const handleClose = () => {
    setOpenDetail(false)
    setOpenDetailBill(false)
    setOpenaddClaim(false)
    setDataList([])
    setDataClaim([])
    setSearchType('เลขที่ใบเคลม')
    setSelectedNumId('')
    setBookCliam({
      store_id: '',
      claim_no: '',
      customer_name: '',
      customer_phone: '',
      claim_token: '',
      creation_date: '',
      item_list: [],
    })
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  //ดึงข้อมูลตาราง
  const getBookCliamList = async (options?: DataTableOption) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const params = {
      store: store.id,
      claim_no: options?.claim_no,
      keywords: options?.keywords,
      date: options?.date,
      status: options?.status,
      start: options?.start,
    }
    const res = await api.get('/claim/datatable', { params })

    setItemTotal(res.data.recordsFiltered)

    const data = res.data.data.map((item: any) => ({
      claim_no: item.claim_no,
      create_date: item.created_at,
      customer_name: item.customer_name,
      customer_phone: item.customer_phone,
      status: item.status === 'Success' ? 'เรียบร้อย' : 'ยกเลิก',
      ACTION: (
        <div className="showbill">
          <div className="boxshowbill">
            <IconButton sx={{ p: 0, mt: 1 }} onClick={(_) => showBillReceipt(item)}>
              <ReceiptLongRounded sx={{ width: '25px', height: '25px' }} suppressHydrationWarning />
            </IconButton>
          </div>
        </div>
      ),
    }))
    setCustomerPhone('')
    setClaimNo('')

    setBookCliamList(data)

    setDataLoading(false)
  }
  const getProductDetail = async (item: any) => {
    const store = getLocalStorage(key.STORE)
    const res = await api.get(`/store/stock/${store.id}?barcode=${item.product_barcode}`)
    if (res.data.data.length === 0) {
      toast.error('ไม่พบสินค้าในสาขานี้')
      return
    }
    const productId = res.data.data[0].product_id

    const prodDetailRes = await api.get(`/product/info/${productId}?store_id=${store.id}`)

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

  const showBillReceipt = async (orderId: any) => {
    const storeData: StoreType = getLocalStorage(key.STORE)
    const response = await api.get(`/claim/${storeData.id}/${orderId.id}`)

    const itemDetails: InvoiceDetail = {
      invoice_code: orderId.claim_no,

      create_by_name: orderId.customer_name,
      invoice_date: dayjs(orderId.created_at).format('DD/MM/YYYY HH:MM'),
      customer_phone: orderId.customer_phone,

      book_list: response.data.data[0].claim_items.map((value: any) => {
        return {
          pro_id: Number(value.product_id),
          pro_quantity: value.station_status,
          barcode: value.product_barcode,
          name: value.product_name,
          product_accept_quantity: Number(value.quantity),
          product_accept_user: value.type === 'Changed' ? 'เปลี่ยน' : 'ส่งคืน',
        } as ProductItem
      }),
    }
    setBookCliamInfo(itemDetails)

    setOpenDetailBill(true)
  }

  const invoiceAccept = async () => {
    setLoadingSubmit(true)
    const user = Object.create(jwtDecode(getLocalStorage(key.TOKEN)))
    const store = getLocalStorage(key.STORE)

    const selectedClaim = dataClaim.find((claim: any) => claim.num_id === selectedNumId)

    if (!selectedClaim) {
      toast.error('ไม่พบใบเคลมที่เลือก')
      setLoadingSubmit(false)
      return
    }

    const itemAvailabilityChecks = await Promise.all(
      selectedClaim.item.data.map(async (item: any) => {
        const itemInList = dataList.find((dataItem: any) => dataItem.barcode === item.product_barcode)
        const itemType = itemInList ? itemInList.type : undefined

        // Use the correct type based on dataList
        if (itemType === 'Changed') {
          const res = await api.get(`/store/stock/${store.id}?barcode=${item.product_barcode}`)

          // Check if the stock data is empty
          if (res.data.data.length === 0) {
            return { available: false, item, noStock: true }
          }

          const productId = res.data.data[0].product_id
          const prodDetailRes = await api.get(`/product/info/${productId}?store_id=${store.id}`)

          const items = prodDetailRes.data.items
          const availableQuantity = parseInt(items.product_quantity)

          if (!items) {
            return { available: false, item }
          } else if (availableQuantity < item.quan) {
            // If available quantity is less than the required quantity
            return { available: false, item, availableQuantity }
          } else {
            return { available: true }
          }
        }
        return { available: true }
      })
    )

    const unavailableItems = itemAvailabilityChecks.filter((check) => !check.available)

    if (unavailableItems.length > 0) {
      unavailableItems.forEach(({ item, availableQuantity, noStock }) => {
        if (noStock) {
          toast.error(`ไม่มีสินค้า "${item.product_name}" ในสาขา`)
        } else if (availableQuantity !== undefined && availableQuantity < item.quan) {
          // If there is stock but the quantity is insufficient
          toast.error(`สินค้า "${item.product_name}" จำนวนในคลังไม่พอ กรุณาเปลี่ยนประเภทการคืน`)
        }
      })
      setLoadingSubmit(false)
      return
    }

    const listItem = selectedClaim.item.data.map((item: any) => {
      const itemInList = dataList.find((dataItem: any) => dataItem.id === item.id)
      return {
        product_name: item.product_name,
        product_ref_code: item.product_code,
        quantity: item.quan,
        type: itemInList?.type || 'Changed',
        product_price: Number(item.product_price),
      }
    })

    const payload = {
      store_id: store.id,
      claim_no: selectedClaim.num_id,
      customer_name: selectedClaim.name,
      customer_phone: selectedClaim.tel,
      item_list: listItem, // TODO: Add item_list
      claim_token: claimToken,
      created_by: user.id,
    }

    try {
      const res = await api.post('/claim', payload)
      if (res.data.status === 'Success') {
        setLoadingSubmit(false)
        toast.success(res.data.msg)
        setOpenaddClaim(false)
        setDataList([])
        setDataClaim([])
        setClaimToken('')
        setSelectedNumId('')
        setSearchType('เลขที่ใบเคลม')
        setTimeStamp(Date.now())
        setOpenAccept(false)
        setBookCliam({
          store_id: '',
          claim_no: '',
          customer_name: '',
          customer_phone: '',
          claim_token: '',
          creation_date: '',
          item_list: [],
        })

        getBookCliamList()
      } else {
        toast.error(res.data.msg)
        setOpenAccept(false)
        setOpenaddClaim(false)
        setLoadingSubmit(false)
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล')
      setOpenaddClaim(false)
      setLoadingSubmit(false)
    }
  }

  const onEnterSearch = async (event: any) => {
    if (event.key === 'Enter') {
      if (searchType === 'ทั้งหมด') {
        await getBookCliamList({
          claim_no: claimNo,
          keywords: customerPhone,
        })
      } else {
        await getBookCliamList({
          claim_no: claimNo,
          keywords: searchText,
        })
      }
    }
  }

  const onClickSearch = async () => {
    setLoadFilter(true)
    if (dataType === 'เคลมหนังสือ') {
      await onSearchClaimInvoice({ keyword: claimNo, customerPhone: customerPhone })
    } else {
      await getBookCliamList({
        claim_no: claimNo,
        keywords: customerPhone,
      })
    }

    setLoadFilter(false)
  }

  React.useEffect(() => {
    if (dataType === 'ประวัติการเคลม') {
      getBookCliamList()
      setSearchText('')
      setCustomerPhone('')
      setClaimNo('')
      setDataClaim([])
    } else if (dataType === 'เคลมหนังสือ') {
      setClaimNo('')
      setCustomerPhone('')
      setDataClaim([])
    }
  }, [dataType])

  const onButtonSelect = async (value: any) => {
    setDataType(value)
  }

  const onSearchClaimInvoice = async (params: { keyword?: string; customerPhone?: string }) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const user = Object.create(jwtDecode(getLocalStorage(key.TOKEN)))

    try {
      const apiBookclaimBase = process.env.NEXT_PUBLIC_API_BOOKCLAIM

      const url = params.keyword
        ? `${apiBookclaimBase}num_id=${params.keyword}&store_id=${store.code_name}`
        : `${apiBookclaimBase}store_id=${store.code_name}&tel=${params.customerPhone}`

      const res = await axios.get(url)
      const isKeywordSearch = url.includes('num_id=')

      if (res.data) {
        if (res.data.length === 0) {
          toast.error(isKeywordSearch ? 'ไม่พบใบเคลมนี้' : 'ไม่มีใบเคลมของเบอร์โทรศัพท์นี้')
          setCustomerPhone('')
          setClaimNo('')

          return
        } else if (res.data[0].status === '2') {
          toast.error('ใบเคลมนี้ถูกทำรายการแล้ว')
          setCustomerPhone('')
          setClaimNo('')
          return
        } else if (isKeywordSearch && res.data[0].status_type === 'Error' && res.data[0].status != '2') {
          toast.error(`ใบเคลมนี้แจ้งเคลมที่สาขา  ${res.data[0].store_name} `)
          setCustomerPhone('')
          setClaimNo('')
          return
        }
      }

      if (!isKeywordSearch) {
  const errorItems = res.data
    .filter((item: any) => item.status === '0')
    .map((item: any) => ({
      store_name: item.store_name,
      num_id: item.num_id,
      name: item.name,
      status_type: item.status_type,
    }))
    .sort((a: any, b: any) => {
      if (a.status_type === 'Success' && b.status_type !== 'Success') return -1
      if (a.status_type !== 'Success' && b.status_type === 'Success') return 1
      return 0
    })

  // 👇 เพิ่มเช็คตรงนี้
  if (errorItems.length === 0) {
    toast.error('ใบเคลมนี้ถูกทำรายการแล้ว')
    return
  }

  setErrorMessage(errorItems)
  setCustomerPhone('')
  setClaimNo('')
  setIsErrorDialogOpen(true)

  return
}


      // สร้าง id ให้ item
      res.data.forEach((dataDetail: any) => {
        dataDetail.item.data.forEach((item: any) => {
          item.id = uuidv4()
        })
      })

      setDataClaim(res.data) // ใช้ res.data ตรงๆ
      setDataList([])

      let newProductItems: ProductItem[] = []
      let newBookClaim: any = {}

      res.data.forEach((dataDetail: any) => {
        const items = dataDetail.item.data
        const productItems: ProductItem[] = items.map((item: any) => ({
          id: item.id,
          pro_quantity: parseInt(item.quan),
          product_code: item.product_code,
          barcode: item.product_barcode,
          name: item.product_name,
          price: item.product_price,
          type: 'Changed',
        }))

        newProductItems = [...newProductItems, ...productItems]

        newBookClaim = {
          store_id: store.id,
          claim_no: dataDetail.num_id,
          customer_name: dataDetail.name,
          customer_phone: dataDetail.tel,
          created_by: user.id,
          creation_date: dayjs(dataDetail.creation_date).format('DD/MM/YYYY'),
          item_list: productItems,
        }
      })

      setBookCliam((prev: any) => ({
        ...prev,
        ...newBookClaim,
      }))

      setDataList((prev: any) => [
        ...prev,
        ...newProductItems.map((newItem) => {
          const existingItem = prev.find((item: any) => item.barcode === newItem.barcode)
          return existingItem ? { ...newItem, type: existingItem.type } : newItem
        }),
      ])

      if (res.data.length === 1) {
        setSelectedNumId(res.data[0].num_id)
      }


      setCustomerPhone('')
      setClaimNo('')
    } catch (error) {
      setCustomerPhone('')
      setClaimNo('')
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
    setClaimToken(uuidv4())
    getBookCliamList()
  }, [timeStamp])

  React.useEffect(() => {
    let timer: NodeJS.Timeout

    if (isErrorDialogOpen) {
      timer = setTimeout(() => {
        setIsErrorDialogOpen(false)
      }, 500000) // 30 seconds = 30000 milliseconds
    }

    // Cleanup function to clear the timer
    return () => {
      if (timer) {
        clearTimeout(timer)
      }
    }
  }, [isErrorDialogOpen])

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
          text="เคลมหนังสือ"
          icon={<ChangeCircleOutlined />}
          store={store?.name}
          currentUser={currentUser?.name}
        />

        <div className="justify-between w-99 mt-10 items-center">
          <Box
            className="w-60 flex justify-between bg-gray rounded-20 p-10 mb-20 mt-20 items-center"
            style={{ gap: 10, height: 70 }}>
            <Typography style={{ paddingLeft: '3%', width: '13%' }}>ค้นหา</Typography>
            <Search className="input" style={{ width: '40%' }}>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              <InputBase
                className="input-base"
                placeholder="เลขที่ใบเคลม"
                value={claimNo}
                onKeyDown={onEnterSearch}
                onChange={(e) => setClaimNo(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
            <Typography style={{ paddingLeft: '1%', width: '5%' }}>หรือ</Typography>
            <Search className="input" style={{ width: '40%' }}>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              <InputBase
                className="input-base"
                placeholder="เบอร์โทรศัพท์"
                value={customerPhone}
                onKeyDown={onEnterSearch}
                onChange={(e) => setCustomerPhone(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
              />
            </Search>
            <Button
              color="primary"
              loading={loadFilter}
              startIcon={<SearchOutlined />}
              variant="contained"
              className="btn-confirm p-10"
              onClick={onClickSearch}>
              <Typography sx={{ fontSize: '14px' }}>ค้นหา</Typography>
            </Button>
          </Box>

          <div className="justify-end flex">
            <ItemsYaakzStation updateValue={dataType} items={itemPanel} onSelect={onButtonSelect} />
          </div>
        </div>
        {/* Table Element Component */}
        {dataType === 'ประวัติการเคลม' && (
          <DataTable
            items={bookCliamList}
            itemTotal={itemTotal}
            headers={BookClaimHeaders}
            rowPerPage={rowsPerPage}
            loadingText="ไม่มีรายการรับสินค้า"
            loading={dataLoading}
            page={page}
            onChangePage={handleChangePage}
            onChangeRowsPerPage={handleChangeRowsPerPage}
          />
        )}
      </div>
      {dataType === 'เคลมหนังสือ' && (
        <div style={{ justifyContent: 'center', display: 'flex' }}>
          <div
            style={{
              backgroundColor: '#F1F1F1',
              width: '100%',

              marginTop: '2%',

              justifyContent: 'center',
              display: 'flex',
              alignItems: 'center',
              borderRadius: 20,
            }}>
            {dataClaim.length === 0 && (
              <Typography style={{ padding: '5%', fontSize: 24 }}>
                ค้นหาเลขที่ใบเคลม หรือ เบอร์โทรศัพท์ เพื่อทำการเคลม
              </Typography>
            )}

            {dataClaim.length > 0 && (
              <div style={{ width: '100%', maxHeight: 'calc(100vh - 200px)', overflow: 'scroll' }}>
                {dataClaim
                  .filter((dataDetail: any) => {
                    const claimStatus = statusClaims.find((claim: any) => claim.claim_no === dataDetail.num_id)
                    return !claimStatus || claimStatus.status !== 'Success'
                  })
                  .map((dataDetail: any, claimIndex: number) => (
                    <FormControl key={claimIndex} style={{ width: '100%' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        {dataClaim.length > 1 && ( // Show RadioGroup only if more than 1 claim
                          <RadioGroup
                            style={{ width: '3%' }}
                            row
                            aria-labelledby="demo-row-radio-buttons-group-label"
                            name="row-radio-buttons-group"
                            value={selectedNumId}
                            onChange={() => setSelectedNumId(dataDetail.num_id)}>
                            <FormControlLabel
                              style={{ width: '3%', padding: 10 }}
                              value={dataDetail.num_id}
                              control={<Radio checked={selectedNumId === dataDetail.num_id} />}
                              label=""
                            />
                          </RadioGroup>
                        )}
                        <div style={{ padding: 20, width: '100%' }}>
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              width: '100%',
                              marginLeft: 10,
                            }}>
                            <Typography>เลขที่ใบเคลม : {dataDetail.num_id}</Typography>
                            <Typography>ชื่อลูกค้า : {dataDetail.name}</Typography>
                            <Typography>เบอร์โทรศัพท์ : {dataDetail.tel}</Typography>
                            <Typography>วันที่แจ้งเคลม : {dataDetail.creation_date}</Typography>
                          </div>
                          {/* Show claim details always, no condition on selectedNumId */}
                          {selectedNumId === dataDetail.num_id && (
                            <TableContainer
                              component={Paper}
                              sx={{
                                maxHeight: 'calc(100vh - 370px)',
                                width: '100%',
                                marginTop: 5,
                                boxShadow: 'none',
                              }}>
                              <Table stickyHeader aria-label="sticky table">
                                <TableHead>
                                  <TableRow>
                                    <StyledTableCell style={{ backgroundColor: '#fff' }} align="center">
                                      Barcode
                                    </StyledTableCell>
                                    <StyledTableCell
                                      style={{ backgroundColor: '#fff' }}
                                      align="center"
                                      sx={{ width: '200px' }}>
                                      ชื่อหนังสือ
                                    </StyledTableCell>
                                    <StyledTableCell align="center" style={{ width: '5%', backgroundColor: '#fff' }}>
                                      ราคาปก
                                    </StyledTableCell>
                                    <StyledTableCell align="center" style={{ width: '10%', backgroundColor: '#fff' }}>
                                      จำนวนที่เคลม
                                    </StyledTableCell>
                                    <StyledTableCell style={{ backgroundColor: '#fff' }} align="center">
                                      รายละเอียด
                                    </StyledTableCell>
                                    <StyledTableCell style={{ backgroundColor: '#fff' }} align="center">
                                      ประเภทการเคลม
                                    </StyledTableCell>
                                  </TableRow>
                                </TableHead>
                                <TableBody>
                                  {dataDetail.item.data.map((item: any, itemIndex: number) => (
                                    <StyledTableRow key={itemIndex}>
                                      <StyledTableCell align="center">{item.product_barcode}</StyledTableCell>
                                      <StyledTableCell align="left">{item.product_name}</StyledTableCell>
                                      <StyledTableCell align="right">{item.product_price}</StyledTableCell>
                                      <StyledTableCell align="center">{item.quan}</StyledTableCell>
                                      <StyledTableCell align="center">
                                        <IconButton onClick={() => getProductDetail(item)}>
                                          <MoreVertOutlined />
                                        </IconButton>
                                      </StyledTableCell>
                                      <StyledTableCell align="center">
                                        <FormControl>
                                          <RadioGroup
                                            row
                                            aria-labelledby={`radio-buttons-group-label-${itemIndex}`}
                                            name={`radio-buttons-group-${itemIndex}`}
                                            value={dataList.find((dataItem: any) => dataItem.id === item.id)?.type}
                                            onChange={(e) => handleChange(e, item.id)} // No condition on selectedNumId
                                          >
                                            <FormControlLabel value="Changed" control={<Radio />} label="เปลี่ยน" />
                                            <FormControlLabel value="Return" control={<Radio />} label="ส่งคืน" />
                                          </RadioGroup>
                                        </FormControl>
                                      </StyledTableCell>
                                    </StyledTableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </TableContainer>
                          )}
                        </div>
                      </div>
                    </FormControl>
                  ))}

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '2%' }}>
                  <Button
                    color="info"
                    variant="contained"
                    className="btn-confirm p-10 mr-10"
                    onClick={(_) => setOpenAccept(true)}>
                    <DoneAll />
                    <Typography sx={{ fontSize: '14px' }}>เคลมหนังสือ</Typography>
                  </Button>
                  <Button className="btn-confirm p-10" color="warning" variant="contained" onClick={handleClose}>
                    <Typography sx={{ fontSize: '14px' }}>ยกเลิก</Typography>
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Table Element Component */}

      <Dialog sx={{ padding: 2 }} open={openAccept}>
        <DialogContentText sx={{ padding: 5 }}>ยืนยันการเคลมสินค้าหรือไม่</DialogContentText>
        <DialogActions sx={{ mb: 2, justifyContent: 'center' }}>
          <Button
            className="btn-confirm p-10 "
            loading={loadingSubmit}
            color="info"
            variant="contained"
            onClick={invoiceAccept}
            autoFocus>
            ยืนยัน
          </Button>
          <Button
            className="btn-confirm p-10"
            onClick={() => setOpenAccept(false)}
            autoFocus
            color="warning"
            variant="contained">
            ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        PaperProps={{
          style: {
            borderRadius: 20,
          },
        }}
        open={isErrorDialogOpen}
        onClose={() => setIsErrorDialogOpen(false)}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '100%' }}>
            <DialogTitle id="alert-dialog-title">
              <strong>ใบเคลมที่พบ</strong>
            </DialogTitle>
          </div>
          <div>
            <IconButton onClick={(_) => setIsErrorDialogOpen(false)} sx={{ mt: 1, m: 1.5 }}>
              <ClearOutlined sx={{ color: '#FE5454' }} />
            </IconButton>
          </div>
        </div>
        <DialogContent>
          {Array.isArray(errorMessage) ? (
            errorMessage.map((error, index) => (
              <div key={index}>
                <Typography>ใบเคลมที่ : {error.num_id}</Typography>
                <Typography>ชื่อลูกค้า : {error.name}</Typography>
                <Typography>แจ้งเคลมที่ : {error.store_name}</Typography>
                {index < errorMessage.length - 1 && <Divider sx={{ my: 2 }} />}
              </div>
            ))
          ) : (
            <>
              <Typography>ใบเคลมที่ : {errorMessage?.num_id}</Typography>
              <Typography>ชื่อลูกค้า : {errorMessage?.name}</Typography>
              <Typography>แจ้งเคลมที่ : {errorMessage?.store_name}</Typography>
            </>
          )}
        </DialogContent>
      </Dialog>

      <ProductDetailDialog
        html="Product Details"
        open={openDetail}
        onClose={handleCloseDetail}
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
      <Detail
        open={openDetailBill}
        onClose={handleClose}
        html={''}
        text_accecpt_qauntity="จำนวนที่เคลม"
        text_product_accept_user="สถานะ"
        text_ref_no="เลขที่ใบเคลมสินค้า"
        text_title="วันที่เคลมสินค้า"
        subtitle="รายละเอียดรายการเคลมสินค้า"
        ref_no={bookCliamInfo?.invoice_code}
        create_date={bookCliamInfo?.invoice_date}
        total_quantity={bookCliamInfo?.quantity_total}
        book_list={bookCliamInfo?.book_list as ProductItem[]}
        note={bookCliamInfo?.note}
      />
    </div>
  )
}
