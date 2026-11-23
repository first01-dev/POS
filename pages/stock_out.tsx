import DataTable from '@/components/DataTable'
import AddTrack from '@/components/dialogs/AddTrack'
import Confirm from '@/components/dialogs/Confirm'

import ConfirmDelete from '@/components/dialogs/ConfirmDelete'
import ConfirmReset from '@/components/dialogs/ConfirmReset'
import CreatStockOut from '@/components/dialogs/CreatStockOut'
import Detail from '@/components/dialogs/Detail'
import EditTarck from '@/components/dialogs/EditTrack'
import ProductDetailDialog from '@/components/dialogs/ProductDetail'
import { StoreName } from '@/components/StoreName'
import { RecallListHeaders, StockOutHeaders } from '@/models/column'
import { key } from '@/models/constants/index'
import {
  DataTableOption,
  Officer,
  ProductDetail,
  ProductItem,
  Rider,
  StockOutBody,
  StockOutDetail,
  Store as StoreType,
} from '@/models/type'
import { api } from '@/services/AxiosUtils'
import { getLocalStorage } from '@/services/StorageUtils'
import { Search, SearchIconWrapper } from '@/services/StyleUtils'
import {
  AddCircleOutlineOutlined,
  ApartmentOutlined,
  DoneAll,
  EditOutlined,
  LocalPrintshopOutlined,
  LocalShippingOutlined,
  MoreVertOutlined,
  PresentToAllOutlined,
  ReceiptLongRounded,
  RemoveCircleOutlineOutlined,
  SearchOutlined,
} from '@mui/icons-material'
import {
  Box,
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  FormControlLabel,
  FormGroup,
  IconButton,
  InputBase,
  SelectChangeEvent,
  Typography,
} from '@mui/material'
import dayjs from 'dayjs'
import jwtDecode from 'jwt-decode'
import Head from 'next/head'
import { useRouter } from 'next/router'
import * as React from 'react'
import toast from 'react-hot-toast'

export default function stockOutList() {
  const router = useRouter()
  const [fullWidth, setFullWidth] = React.useState(true)
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('lg')

  const [searchType, setSearchType] = React.useState('ทั้งหมด')
  const [typeStock, setTypeStock] = React.useState('Normal')
  const [selectRider, setSelectRider] = React.useState('')

  const [rider, setRider] = React.useState<Rider[]>()
  const [placeholder, setPlaceholder] = React.useState('Barcode / ชื่อหนังสือ')
  const [openAccept, setOpenAccept] = React.useState(false)
  const [openConfirm, setOpenConfirm] = React.useState(false)
  const [openCancel, setOpenCancel] = React.useState(false)
  const [openProductInfo, setOpenProductInfo] = React.useState(false)
  const [disabled, setDisabled] = React.useState(false)
  const [openAddTrack, setOpenAddTrack] = React.useState(false)
  const [openEditTrack, setOpenEditTrack] = React.useState(false)
  const [isTrackMode, setIsTrackMode] = React.useState(false)

  const [stockOutList, setStockOutkList] = React.useState<any>([])
  const [recallList, setRecallList] = React.useState<any>([])
  const [itemTotal, setItemTotal] = React.useState(0)
  const [store, setStore] = React.useState<any>({})
  const [shipping, setShipping] = React.useState<any>([])

  const [load, setLoad] = React.useState({
    status: false,
    text: '',
    persentage: 0,
  })
  const [dataLoading, setDataLoading] = React.useState(true)
  const [isRecallView, setIsRecallView] = React.useState(true)

  const [searchText, setsearchText] = React.useState('')
  const [searchProductByBarcode, setSearchProductByBarcode] = React.useState('')
  const [loadFilter, setLoadFilter] = React.useState(false)
  const [loadingSubmit, setLoadingSubmit] = React.useState(false)
  const [bill_slip, setBillSlip] = React.useState({ html: '', css: '' })
  const [openDetail, setOpenDetail] = React.useState(false)
  const [openRemoveItem, setOpenRemoveItem] = React.useState(false)
  const [openaddrequisition, setOpenAddrequisition] = React.useState(false)
  const [success, setSuccess] = React.useState(false)
  const [checked, setChecked] = React.useState([])
  const [checkedInvoice, setCheckedInvoice] = React.useState([])
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(25)
  const [productDeleteId, setProductDeleteId] = React.useState('')
  const [bookInSelect, setBookInSelect] = React.useState<any>([])
  const [selectItemRecall, setSelectItemRecall] = React.useState<ProductItem[]>([])
  const [selectInvoice, setSelectInvoice] = React.useState<ProductItem[]>([])
  const [stockOut, setStockOut] = React.useState<StockOutBody>({
    note: '',
    item: [],
    user_id: 0,
    store_id: 0,
    driver: 0,
    type: '',
  })
  const [productInfo, setProductInfo] = React.useState<ProductDetail>()
  const [qty, setQty] = React.useState(0)
  const [selectedList, setSelectedList] = React.useState<ProductItem[]>([])

  const [selectItem, setSelectItem] = React.useState<any>([])
  const [stockOutInfo, setStockOutInfo] = React.useState<StockOutDetail>()
  const [currentUser, setCurrentUser] = React.useState<Officer>()
  const [openProduct, setOpenProduct] = React.useState(false)
  const [keyword, setKeyword] = React.useState('')
  const [buttonAddText, setButtonAddText] = React.useState('เพิ่ม')
  const [selectedShipping, setSelectedShipping] = React.useState('')
  const [shippingDate, setShippingDate] = React.useState('')
  const [shippingTrack, setTrackShippingTrack] = React.useState('')
  const [editShippingTrack, setEditShippingTrack] = React.useState('')

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
    getStockOutList({
      keywords: searchText,

      start: newPage * rowsPerPage,
    })
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  // [Method] - จัดการกล่องข้อมความค้นหา
  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value)
  }

  // [Method] - จัดการเลือกคนขับ
  const handleSelectRider = (event: SelectChangeEvent) => {
    setSelectRider(event.target.value)
  }
  const handleSelectedShipping = (event: any) => {
    const shipping = event.target.value

    setSelectedShipping(shipping)
    setSelectRider('')
  }

  const handleSelectTypeStock = (event: SelectChangeEvent) => {
    const selectedType = event.target.value
    setTypeStock(selectedType)

    const updatedList = selectedList.filter((product) => {
      const daysDifference = product.releaseDate
        ? (Date.now() - new Date(product.releaseDate).getTime()) / 86400000
        : null

      const isInvalidNormal = selectedType === 'Normal' && daysDifference !== null && daysDifference <= 60

      const isInvalidBuffet = selectedType === 'Buffet' && product.product_type !== 'บุฟเฟ่ต์'

      if (isInvalidNormal || isInvalidBuffet) {
        toast.error(
          `ลบสินค้า "${product.name}" เนื่องจาก${isInvalidBuffet ? 'ไม่ใช่หนังสือบุฟเฟ่ต์' : 'ยังไม่สามารถทำคืนได้'}`
        )
      }

      return !isInvalidNormal && !isInvalidBuffet
    })

    setSelectedList(updatedList)
    setStockOut((prev) => ({
      ...prev,
      item: [...updatedList].sort(
        (a: any, b: any) => new Date(b.added_time).getTime() - new Date(a.added_time).getTime()
      ),
    }))
  }

  const handleSelectInvoice = (event: React.ChangeEvent<HTMLInputElement>, item: ProductItem) => {
    const { name, checked } = event.target

    setCheckedInvoice((prev: any) => ({
      ...prev,
      [name]: checked,
    }))

    setSelectInvoice((prev: any) => {
      if (checked) {
        // ป้องกันรายการซ้ำ
        return prev.some((invoice: any) => invoice.id === item.id)
          ? prev
          : [
              ...prev,
              {
                ...item,
                id: item.id,
                ref_no: item.ref_no,
              },
            ]
      }

      // ยกเลิกการเลือก
      return prev.filter((invoice: any) => invoice.id !== item.id)
    })
  }

  const handleSelectItemRecall = (event: React.ChangeEvent<HTMLInputElement>, item: ProductItem) => {
    const { name, checked } = event.target

    setChecked((prev) => ({
      ...prev,
      [name]: checked,
    }))

    if (checked) {
      setSelectItemRecall((prev: ProductItem[]) => [...prev, item])
      setTypeStock('Recall')
      setDisabled(true)
    } else {
      setSelectItemRecall((prev: ProductItem[]) =>
        prev.filter((recallItem) => recallItem.product_barcode !== item.product_barcode)
      )
      setDisabled(false)
    }
  }

  const resetTrackForm = () => {
    setSelectedShipping('')
    setSelectRider('')
    setShippingDate('')
    setTrackShippingTrack('')
    setEditShippingTrack('')
  }

  const handleCloseAddTrack = () => {
    setOpenAddTrack(false)
    setSelectedShipping('')
    setSelectRider('')
    setShippingDate('')
    setTrackShippingTrack('')
  }

  const handleCloseEditTrack = () => {
    setOpenEditTrack(false)
    setSelectedShipping('')
    setSelectRider('')
    setShippingDate('')
    setEditShippingTrack('')
  }

  const handleClose = () => {
    setOpenDetail(false)
    setOpenProductInfo(false)
    setOpenAddrequisition(false)

    setSelectedList([])
    setSelectInvoice([])
    setChecked([])
    setCheckedInvoice([])

    resetTrackForm()

    setStockOut({ ...stockOut, item: [] })
    setKeyword('')
    setTypeStock('Normal')

    setOpenAddTrack(false)
    setOpenEditTrack(false)
  }

  const resetSelectedList = () => {
    setSelectedList([])
    setStockOut({ ...stockOut, item: [] })
    setOpenCancel(false)
    setSearchProductByBarcode('')
  }

  //ลบสินค้าในตาราง
  const handleRemoveItem = () => {
    const DeleteItem = selectedList.filter((value: ProductItem) => value.product_id !== productDeleteId)
    const DeleteItem2 = stockOut.item.filter((value: ProductItem) => value.product_id !== productDeleteId)
    setStockOut({ ...stockOut, item: DeleteItem2 })
    setSelectedList(DeleteItem)
    setOpenRemoveItem(false)
  }

  const handleCheckboxChange = (value: any) => {
    const currentIndex = bookInSelect.indexOf(value)
    const newChecked = [...bookInSelect]

    if (currentIndex === -1) {
      newChecked.push(value)
    } else {
      newChecked.splice(currentIndex, 1)
    }

    setBookInSelect(newChecked)
  }

  const validateSearchBarcode = () => {
    if (/^\d{13}$/.test(searchText)) {
      if (keyword === '') {
        toast.error('กรุณากรอกรหัสสินค้า')
        return false
      }
    } else {
      if (keyword === '') {
        toast.error('กรุณากรอกชื่อสินค้า')
        return false
      }
    }
    return true
  }

  const onAddProduct = async () => {
    setLoadFilter(true)
    if (!validateSearchBarcode()) return

    const STORE_ID = getLocalStorage(key.STORE).id

    let searchParam
    if (/^\d{13}$/.test(searchText)) {
      searchParam = {
        barcode: keyword,
      }
    } else {
      searchParam = {
        keywords: keyword,
        length: 100,
      }
    }

    try {
      const res = await api.get(`/store/stock/${STORE_ID}`, { params: searchParam })
      if (res.data.data.length > 0) {
        // Fetch additional details for each product
        const productDetailsPromises = res.data.data.map(async (product: any) => {
          const detailRes = await api.get(`/product/info/${product.product_id}?store_id=${STORE_ID}`)
          return { ...product, releaseDate: detailRes.data.items.product_release_on }
        })

        const productsWithDetails = await Promise.all(productDetailsPromises)
        setSelectItem(productsWithDetails)
        setOpenProduct(true)
      } else {
        toast.error('ไม่พบสินค้า')
      }
    } catch (error) {
      toast.error('ไม่พบสินค้าในสาขานี้')
    } finally {
      setLoadFilter(false)
    }
  }

  const handleInputQuantity = (value: string, bo_code: string) => {
    const updatedAcceptQty = stockOut.item.map((item) => {
      if (item.product_id === bo_code) {
        item.quantity = parseInt(value)
      }
      return item
    })
    setStockOut({ ...stockOut, item: updatedAcceptQty })
  }

  const onButtonSelect = async (isRecallView: boolean) => {
    setDataLoading(true)

    // เคลียร์รายการที่เลือกของทั้งสองโหมด
    setSelectItemRecall([])
    setSelectInvoice([])
    setChecked([])

    if (isRecallView) {
      await getStockOutList()
    } else {
      await getRecallList()
    }

    setIsRecallView(!isRecallView)
  }

  const openStockOut = async () => {
    if (isTrackMode) {
      setOpenAddTrack(true)

      await getShipping()
      return
    }

    await onSelectItem()
  }

  const onSelectItem = async () => {
    setOpenAddrequisition(true)

    const store: StoreType = getLocalStorage(key.STORE)
    const currentTime = new Date()

    const newItem: ProductItem[] = []

    if (selectItemRecall.length === 0) {
      setSelectedList([])
    } else {
      for (const item of selectItemRecall) {
        try {
          const res = await api.get(`/product/info/${item.product_id}?store_id=${store.id}`)
          const data = res.data.items

          newItem.push({
            product_id: parseInt(data.product_id),
            pro_quantity: parseInt(data.product_quantity),
            barcode: data.product_barcode,
            name: data.product_name,
            price: parseFloat(data.product_price),
            type: data.product_type,
            quantity: item.quantity === -1 ? parseInt(data.product_quantity) : item.quantity,
            added_time: currentTime,
            releaseDate: new Date(data.product_release_on),
          })
        } catch (error) {
          console.error(`ไม่สามารถโหลดข้อมูลสินค้า ${item.product_barcode}`, error)
        }
      }
    }

    setSelectedList(newItem)
    setStockOut((prev) => ({
      ...prev,
      item: newItem.sort((a: any, b: any) => b.added_time.getTime() - a.added_time.getTime()),
    }))

    setOpenProduct(false)
    setKeyword('')
    setBookInSelect([])
  }

  const isDisabled = !selectedList || selectedList.length === 0
  const isSelectDisabled = bookInSelect.length === 0

  const onInputQtyComplete = async (item: any) => {
    const currentTime = new Date()
    const newItem: ProductItem[] = bookInSelect.map((item: any) => {
      return {
        product_id: parseInt(item.product_id),
        pro_quantity: item.product_quantity,
        barcode: item.product_barcode,
        name: item.product_name,
        product_type: item.product_type,
        price: parseFloat(item.product_price),
        quantity: 1,
        added_time: currentTime,
        releaseDate: new Date(item.releaseDate),
      }
    })

    const zeroQty = newItem.filter((item) => item.pro_quantity === 0)
    const negativeStock = newItem.filter((item) => item.pro_quantity < 0)
    zeroQty.forEach((item) => {
      toast.error(`สินค้า "${item.name}" หมด`)
    })

    negativeStock.forEach((item) => {
      toast.error(`สินค้า "${item.name}" จำนวนติดลบ`)
    })

    const existItem = selectedList.filter((value) => newItem.find((item) => item.product_id === value.product_id))
    existItem.forEach((item) => {
      toast.error(`สินค้า "${item.name}" มีอยู่ในรายการแล้ว`)
    })

    const filteredNewItem = newItem.filter((item) => {
      const releaseDate = item.releaseDate
      const timeDiff = currentTime.getTime() - releaseDate.getTime()
      const diffDays = Math.ceil(timeDiff / (1000 * 60 * 60 * 24))

      // Normal: หนังสือต้องเกิน 60 วัน
      if (typeStock === 'Normal' && diffDays <= 60) {
        toast.error(`หนังสือ "${item.name}" ยังไม่สามารถทำคืนได้`)
        return false
      }

      // Buffet: ต้องเป็นหนังสือบุฟเฟ่ต์เท่านั้น
      if (typeStock === 'Buffet' && item.product_type !== 'บุฟเฟ่ต์') {
        toast.error(`หนังสือ "${item.name}" ไม่ใช่หนังสือบุฟเฟ่ต์`)
        return false
      }

      return true
    })

    for (let i = 0; i < existItem.length; i++) {
      const index = filteredNewItem.findIndex((item) => item.product_id === existItem[i].product_id)
      if (index !== -1) {
        filteredNewItem.splice(index, 1)
      }
    }
    for (let i = 0; i < zeroQty.length; i++) {
      const index = filteredNewItem.findIndex((item) => item.product_id === zeroQty[i].product_id)
      if (index !== -1) {
        filteredNewItem.splice(index, 1)
      }
    }

    for (let i = 0; i < negativeStock.length; i++) {
      const index = filteredNewItem.findIndex((item) => item.product_id === negativeStock[i].product_id)
      if (index !== -1) {
        filteredNewItem.splice(index, 1)
      }
    }

    setSelectedList((prev) => {
      const updatedList = [...prev, ...filteredNewItem].sort((a: any, b: any) => b.added_time - a.added_time)
      return updatedList
    })
    setStockOut((prev) => ({
      ...prev,
      item: [...prev.item, ...filteredNewItem].sort((a: any, b: any) => b.added_time - a.added_time),
    }))
    setOpenProduct(false)
    setKeyword('')
    setBookInSelect([])
    setQty(0)
  }

  const getInvoiceInfo = async (item: any) => {
    await getShipping()

    try {
      const store = getLocalStorage(key.STORE)
      const response = await api.get(`/stockout/info/${item.id}?store_id=${store.id}`)
      const data = response.data.data[0]

      const bookList: ProductItem[] = data.items.map((value: any) => {
        return {
          barcode: value.product_barcode,
          product_id: Number(value.product_id),
          pro_quantity: Number(value.product_quantity),
          product_accept_quantity: Number(value.accepted_quantity),

          name: value.product_name,
        } as ProductItem
      })
      const totalItems = bookList.length

      const itemDetails: StockOutDetail = {
        id: Number(item.id),
        ref_no: item.ref_no,
        create_by_name: item.created_by_name,
        create_date: item.created_at,
        total_quantity: Number(item.total_quantity),
        note: item.note,
        driver_name: data.driver_name,
        shipping_track: data.shipping_track || '',
        shipping_name: data.shipping_name,
        shipping_on: data.shipping_on,
        type: formatType(data.type), // Format the type field
        book_list: bookList,
        total_items: totalItems,
      }
      setEditShippingTrack(data.shipping_track || '')
      setSelectRider(data.driver)
      setSelectedShipping(data.shipping || '')

      setStockOutInfo(itemDetails)
    } catch (error) {}
  }

 
  const formatType = (type: string): string => {
    switch (type) {
      case 'Normal':
        return 'หนังสือสาขา'
      case 'Warranty':
        return 'เคลมสินค้า'
      case 'Defective':
        return 'สินค้าชำรุด'
      case 'Recall':
        return 'เรียกคืน'
      case 'Buffet':
        return 'บุฟเฟ่ต์'
      default:
        return 'หนังสือสาขา'
    }
  }

  const getShipping = async () => {
    try {
      const res = await api.get('/v1/shipping/list')
      setShipping(res.data.results ?? [])
    } catch (error) {
      console.error('ดึงรายการขนส่งไม่สำเร็จ', error)
    }
  }

  const getRiderList = async (shipping: number) => {
    try {
      const res = await api.get('/driver/list', {
        params: { shipping: shipping },
      })

      setRider(res.data.items ?? [])
    } catch (error) {
      console.error('ดึงรายการคนขับไม่สำเร็จ', error)
      setRider([])
    }
  }

  const getProductDetail = async (row: any) => {
    const store: StoreType = getLocalStorage(key.STORE)
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
    setOpenProductInfo(true)
  }

  const getRecallList = async () => {
    const store: StoreType = getLocalStorage(key.STORE)
    const res = await api.get('/recall/datatable', {
      params: {
        store_id: store.id,
      },
    })
    if (res) {
      setItemTotal(res.data.recordsFiltered)
      const data = await res.data.data.map(async (item: any) => {
        return {
          product_id: item.product_id,
          product_barcode: item.product_barcode,
          product_name: item.product_name,
          expire: item.expire,
          total_quantity: formatQuantity(item.quantity),

          ACTION: (
            <div className="showbill">
              <div className="boxshowbill">
                <IconButton sx={{ p: 0, mt: 1 }} onClick={(_) => getProductDetail(item)}>
                  <MoreVertOutlined sx={{ width: '25px', height: '25px' }} />
                </IconButton>
              </div>
            </div>
          ),

          ACTIONSELECT: item.return_tmp === 0 && (
            <Checkbox
              name={item.row}
              disabled={item.return_tmp === 1}
              onChange={(e) => handleSelectItemRecall(e, item)}
            />
          ),
        }
      })

      const result = await Promise.all(data)
      setRecallList(result)
      setDataLoading(false)
    }
  }
  const formatQuantity = (value: any) => {
    const numValue = Number(value)

    if (numValue === -1) {
      return 'เรียกคืนทั้งหมด'
    }
    return numValue
  }

  const getStockOutList = async (options?: DataTableOption) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const res = await api.get('/v1/stockout', {
      params: {
        store_id: store.id,

        ref_no: options?.keywords,
        status: options?.status,
        start: options?.start,
        date: options?.date,
      },
    })

    if (res) {
      setItemTotal(res.data.recordsFiltered)
      const data = await res.data.data.map(async (item: any) => {
        return {
          id: item.id,
          ref_no: item.ref_no,
          date: item.created_at,
          total_quantity: item.total_quantity,

          create_by_name: item.created_by_name,
          status: formatStatus(item.status, item.complete),

          ACTION: (
            <div className="justify-around">
              <div className="boxshowbill">
                <IconButton
                  sx={{ p: 0, mt: 1 }}
                  onClick={async () => {
                    await getInvoiceInfo(item)
                    setOpenDetail(true)
                  }}>
                  {getStatusIcon(item.status, item.complete)}
                </IconButton>
              </div>
              <div className="boxshowbill2">
                <IconButton sx={{ p: 0, mt: 1 }} onClick={(_) => printListStockOut(item)}>
                  {<LocalPrintshopOutlined sx={{ width: '25px', height: '25px' }} />}
                </IconButton>
              </div>
            </div>
          ),
          ACTIONSELECT:
            item.complete === 0 && item.status === 'Pending' ? (
              <Checkbox name={String(item.id)} onChange={(e) => handleSelectInvoice(e, item)} />
            ) : item.complete === 0 && item.status === 'shipping' ? (
              <IconButton
                sx={{ p: 0, mt: 1 }}
                onClick={async () => {
                  await getInvoiceInfo(item)
                  setOpenEditTrack(true)
                }}>
                <EditOutlined sx={{ width: '25px', height: '25px' }} />
              </IconButton>
            ) : null,
        }
      })
      const result = await Promise.all(data)
      setStockOutkList(result)
      setDataLoading(false)
    }

    setLoad({ status: false, text: '', persentage: 100 })
  }

 
  const formatStatus = (status: string, complete: number) => {
    switch (true) {
      case complete === 0:
        switch (status) {
          case 'Pending':
            return 'รอดำเนินการ'
          case 'shipping':
            return 'กำลังจัดส่ง'
          case 'inwh':
            return 'ถึงคลังแล้ว'
        }

      case complete === 1:
        return 'เรียบร้อยแล้ว'

      case complete === 2:
        return 'ข้อมูลไม่ตรง'

      case status === 'Cancel':
        return 'ยกเลิก'

      default:
        return 'รอดำเนินการ'
    }
  }

  const getStatusIcon = (status: string, complete: number) => {
    if (complete === 1 || complete === 2) {
      return <ApartmentOutlined sx={{ width: 25, height: 25 }} />
    }

    switch (status) {
      case 'shipping':
        return <LocalShippingOutlined sx={{ width: 25, height: 25 }} />

      case 'inwh':
        return <ApartmentOutlined sx={{ width: 25, height: 25 }} />

      default:
        return <ReceiptLongRounded sx={{ width: 25, height: 25 }} />
    }
  }

  const printListStockOut = async (item: any) => {
    const store = getLocalStorage(key.STORE)
    const response = await api.get(`/stockout/info/${item.id}?store_id=${store.id}`)
    const res = response.data.data[0]

    const payload = {
      storeName: store.name,
      ref_no: res.ref_no,
      total_item: item.total_quantity,
      created_at: res.created_at,
      type: formatType(res.type),
      item: prepairDataForPrint(res.items),
    }
    window.open(`/stock_out_print?payload=${JSON.stringify(payload)}`, '_blank')
  }

  const prepairDataForPrint = (item: any) => {
    // grouping by price
    const groupingData = item.reduce((acc: any, value: any) => {
      const existingItem = acc.find((item: any) => item.price === value.product_price_normal)
      if (existingItem) {
        existingItem.quantity += value.product_quantity
      } else {
        acc.push({
          price: value.product_price_normal,
          quantity: value.product_quantity,
        })
      }
      return acc
    }, [])
    // sort by quantity
    groupingData.sort((a: any, b: any) => b.price - a.price)
    return groupingData
  }

  const onSubmitStockOut = async () => {
    setLoadingSubmit(true)

    if (selectItemRecall.length === 0 && stockOut.item.length === 0) {
      toast.error('กรุณาเลือกสินค้าที่ต้องการคืน')
      setOpenAccept(false)
      setLoadingSubmit(false)
      return
    }

    // Check if stock quantity is insufficient
    if (stockOut.item.every((item) => Number(item.pro_quantity) < Number(item.quantity))) {
      toast.error('จำนวนสินค้าในสต็อคไม่เพียงพอ')
      setOpenAccept(false)
      setLoadingSubmit(false)
      return
    }

    if (!stockOut.item.every((item) => Number(item.quantity) > 0)) {
      toast.error('กรุณากรอกจำนวนสินค้ามากกว่า 0')
      setOpenAccept(false)
      setLoadingSubmit(false)
      return
    }

    const user: Officer = Object.create(jwtDecode(getLocalStorage(key.TOKEN)))
    const store: StoreType = getLocalStorage(key.STORE)

    const payload = {
      ...stockOut,
      user_id: Number(user.id),
      store_id: Number(store.id),
      driver: Number(selectRider),
      type: typeStock,
      item: stockOut.item.map((item) => ({
        product_id: item.product_id,
        quantity: Number(item.quantity),
      })),
    }

    const res = await api.post(`/v1/stockout`, payload)

    if (res.data.status === 'Success') {
      toast.success('เพิ่มรายการคืนสำเร็จ')

      setStockOut({
        note: '',
        item: [],
        user_id: 0,
        store_id: 0,
        driver: 0,
        type: '',
      })

      setSelectedList([])
      setOpenConfirm(false)
      setOpenAddrequisition(false)
      getStockOutList()
      getRecallList()
      setSelectItemRecall([])
      setLoadingSubmit(false)
    } else {
      toast.error(res.data.message)
      setLoadingSubmit(false)
    }
  }

  const onEnterSearch = async (event: any) => {
    if (event.key === 'Enter') {
      setLoadFilter(true)
      if (searchType === 'ทั้งหมด') {
        await getStockOutList({
          keywords: searchText,
          date: '',
        })
      } else {
        await getStockOutList({
          keywords: searchText,
          status: searchType,
        })
      }
      setLoadFilter(false)
    }
  }

  const onClickSearch = async () => {
    setLoadFilter(true)
    setPage(0)
    if (searchType === 'ทั้งหมด') {
      await getStockOutList({
        keywords: searchText,
        date: '',
      })
    } else {
      await getStockOutList({
        keywords: searchText,
        status: searchType,
      })
    }
    setLoadFilter(false)
  }

  const onSearch = async () => {
  if (searchType === 'ชื่อหนังสือ' || keyword.length !== 13) return

    let cancelled = false

    const searchProduct = async () => {
      try {
        const currentTime = new Date()

        // 1. ดึงข้อมูลสต็อก

        const isNameSearch = searchType === 'ชื่อหนังสือ'

        const searchParam = isNameSearch
          ? {
              keywords: keyword,
              length: 1000,
            }
          : {
              barcode: keyword,
              length: 1000,
            }
        const { data: stockRes } = await api.get(`/store/stock/${store.id}`, { params: searchParam })

        if (cancelled) return

        const productData = stockRes.data?.[0]

        if (!productData) {
          toast.error('ไม่มีสินค้าในสาขา')
          setKeyword('')
          return
        }

        const productId = Number(productData.product_id)
        const stockQty = Number(productData.product_quantity)

        // 2. ตรวจสอบสต็อก
        if (stockQty <= 0) {
          toast.error(stockQty === 0 ? 'ไม่มีสินค้าในสต็อก' : 'สต็อกติดลบ')
          setKeyword('')
          return
        }

        // 3. ดึงข้อมูลสินค้าเพิ่มเติม

        if (cancelled) return

        const daysDifference = productData.product_release
          ? (currentTime.getTime() - new Date(productData.product_release).getTime()) / 86400000
          : null

        // 4. ตรวจสอบประเภทการคืน
        if (typeStock === 'Normal' && daysDifference !== null && daysDifference <= 60) {
          toast.error('หนังสือเล่มนี้ยังไม่สามารถทำคืนได้')
          setKeyword('')
          return
        }

        if (typeStock === 'Buffet' && productData.product_type !== 'บุฟเฟ่ต์') {
          toast.error('ไม่ใช่สินค้าบุฟเฟ่ต์')
          setKeyword('')
          return
        }

        // 5. สร้างข้อมูลสินค้า
        const data: ProductItem = {
          product_id: productId,
          pro_quantity: stockQty,
          barcode: productData.product_barcode,
          name: productData.product_name,
          product_type: productData.product_type,
          price: Number(productData.product_price),
          added_time: currentTime,
          quantity: 1,
          releaseDate: productData.product_release,
        }

        // 6. เพิ่มสินค้าใหม่ หรือเพิ่มจำนวนสินค้าที่มีอยู่แล้ว
        const exist = selectedList.find((item) => item.product_id === productId)

        if (exist) {
          setSelectedList((prev) =>
            prev.map((item: any) => (item.product_id === productId ? { ...item, quantity: item.quantity + 1 } : item))
          )

          setStockOut((prev) => ({
            ...prev,
            item: prev.item.map((item: any) =>
              item.product_id === productId ? { ...item, quantity: item.quantity + 1 } : item
            ),
          }))
        } else {
          setSelectedList((prev) =>
            [...prev, data].sort(
              (a: any, b: any) => new Date(b.added_time).getTime() - new Date(a.added_time).getTime()
            )
          )

          setStockOut((prev) => ({
            ...prev,
            item: [...prev.item, data].sort(
              (a: any, b: any) => new Date(b.added_time).getTime() - new Date(a.added_time).getTime()
            ),
          }))
        }

        setKeyword('')
      } catch (error) {
        if (cancelled) return

        toast.error('เกิดข้อผิดพลาดในการค้นหาสินค้า')
        setKeyword('')
      }
    }

    searchProduct()

    return () => {
      cancelled = true
    }
  }

  const onSaveAddTrack = async () => {
    const user: Officer = Object.create(jwtDecode(getLocalStorage(key.TOKEN)))
    const store: StoreType = getLocalStorage(key.STORE)

    const payload = {
      store_id: store.id,
      stockout: selectInvoice.map((item) => item.id),
      shipping: selectedShipping,
      shipping_on: shippingDate || dayjs().format('YYYY-MM-DD HH:mm:ss'),
      shipping_track: shippingTrack,
      driver: Number(selectRider) || null,
      user_id: user.id,
    }
    try {
      const res = await api.patch('/v1/stockout', payload)

      if (res.data.status === 'Success') {
        toast.success('บันทึกข้อมูลขนส่งสำเร็จ')

        setSelectInvoice([])
        setChecked([])

        setIsRecallView(!isRecallView)
        await getRecallList()
        setCheckedInvoice([])
        setSelectedShipping('')
        setShippingDate('')
        setSelectRider('')
        setTrackShippingTrack('')
        setOpenAddTrack(false)
      }
    } catch (error) {
      toast.error('บันทึกข้อมูลขนส่งไม่สำเร็จ')
    }
  }

  const onSaveEditTrack = async () => {
    if (!stockOutInfo?.id) {
      toast.error('ไม่พบรายการ Invoice ที่ต้องการแก้ไข')
      return
    }

    const user: Officer = Object.create(jwtDecode(getLocalStorage(key.TOKEN)))
    const store: StoreType = getLocalStorage(key.STORE)

    const payload = {
      store_id: store.id,
      stockout: [stockOutInfo.id],
      shipping: selectedShipping,
      shipping_on: shippingDate || dayjs().format('YYYY-MM-DD HH:mm:ss'),
      shipping_track: Number(selectedShipping) === 1 ? '' : editShippingTrack,
      driver: Number(selectedShipping) === 2 ? null : Number(selectRider) || null,
      user_id: user.id,
    }

    try {
      const res = await api.patch('/v1/stockout', payload)

      if (res.data.status === 'Success') {
        toast.success('แก้ไขข้อมูลขนส่งสำเร็จ')

        setSelectedShipping('')
        setShippingDate('')
        setSelectRider('')
        setEditShippingTrack('')
        setOpenEditTrack(false)

        await getRecallList()
      }
    } catch (error) {
      toast.error('แก้ไขข้อมูลขนส่งไม่สำเร็จ')
    }
  }

  const onCancelAddTrack = async () => {
    if (!stockOutInfo?.id) {
      toast.error('ไม่พบรายการ Invoice ที่ต้องการแก้ไข')
      return
    }
    const user: Officer = Object.create(jwtDecode(getLocalStorage(key.TOKEN)))
    const store: StoreType = getLocalStorage(key.STORE)

    const payload = {
      store_id: store.id,
      stockout: [stockOutInfo.id],
      shipping: null,
      shipping_on: null,
      shipping_track: null,
      driver: null,
      user_id: user.id,
    }
    try {
      const res = await api.patch('/v1/stockout', payload)

      if (res.data.status === 'Success') {
        toast.success('บันทึกข้อมูลขนส่งสำเร็จ')

        setSelectInvoice([])

        setSuccess(true)
        setIsRecallView(!isRecallView)
        await getRecallList()
        setCheckedInvoice([])
        setSelectedShipping('')
        setShippingDate('')
        setSelectRider('')
        setTrackShippingTrack('')
        setOpenAddTrack(false)
      }
    } catch (error) {
      toast.error('บันทึกข้อมูลขนส่งไม่สำเร็จ')
    }
  }

  React.useEffect(() => {
    if (selectItemRecall.length > 0) {
      setButtonAddText('คืนรายการที่เลือก')
      setIsTrackMode(false)
    } else if (selectInvoice.length > 0) {
      setButtonAddText('จัดส่ง')
      setIsTrackMode(true)
    } else {
      setButtonAddText('เพิ่ม')
      setIsTrackMode(false)
      setDisabled(false)
    }
  }, [selectItemRecall, selectInvoice])

  React.useEffect(() => {
    const user: Officer = jwtDecode(getLocalStorage(key.TOKEN) as string)
    setCurrentUser(user)
    if (getLocalStorage(key.STORE) && getLocalStorage(key.TOKEN)) {
      setStore(getLocalStorage(key.STORE))
      getRecallList()
    } else {
      router.push('/')
    }
  }, [])

  React.useEffect(() => {
    if (Number(selectedShipping) === 1) {
      getRiderList(1)
    } else {
      setRider([])
      setSelectRider('')
    }
  }, [selectedShipping])

  React.useEffect(() => {
    onSearch()
  }, [keyword, searchType, store.id, typeStock])

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
        <StoreName
          text="คืนสินค้า"
          icon={<PresentToAllOutlined />}
          store={store?.name}
          currentUser={currentUser?.name}
        />

        <div className="justify-between items-center w-99">
          {isRecallView ? (
            <Box className="w-20 flex justify-center bg-gray rounded-20 p-20 mb-20 mt-20 items-center">
              <Typography fontWeight={600}>สินค้าเรียกคืน</Typography>
            </Box>
          ) : (
            <Box className="w-60">
              <div
                className="w-full flex justify-between bg-gray rounded-20 p-10 mb-20 mt-20 items-center"
                style={{ gap: 10, height: 70 }}>
                <Typography className="w-30">ค้นหาใบคืนสินค้า</Typography>
                <Search className="input" style={{ width: '60%' }}>
                  <SearchIconWrapper>
                    <Search />
                  </SearchIconWrapper>
                  <InputBase
                    className="input-base"
                    onKeyDown={onEnterSearch}
                    onChange={(e) => setsearchText(e.target.value)}
                    placeholder={isRecallView ? 'Barcode/ชื่อหนังสือ' : 'รหัสใบคืนสินค้า'}
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
              </div>
            </Box>
          )}

          <div
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'right', marginBottom: 20 }}>
            <Button
              variant="contained"
              onClick={() => onButtonSelect(isRecallView)}
              sx={{
                mr: 1,
                width: '20%',
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                backgroundColor: '#ffffff',
                color: '#000000',
                border: '1px solid #FE5454',
                fontSize: '16px',
                height: 70,
                borderRadius: 5,
                boxShadow: 'rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;',
              }} // เพิ่มระยะห่างด้านล่างเล็กน้อย
            >
              <Typography>{isRecallView ? 'ประวัติการคืน' : 'รายการเรียกเก็บ'}</Typography>
            </Button>

            <Box
              sx={{
                mr: 1,
                p: 2,
                width: 'fit-content',
                alignItems: 'center',
                justifyContent: 'center',
                display: 'flex',
                backgroundColor: '#E7E7E7',
                height: 70,
                borderRadius: 5,
                boxShadow: 'rgba(0, 0, 0, 0.06) 0px 2px 4px -1px;',
              }}>
              <Button
                color={selectItemRecall.length > 0 ? 'success' : 'info'}
                startIcon={<AddCircleOutlineOutlined />}
                variant="contained"
                style={{ borderRadius: 20, height: 40 }}
                onClick={openStockOut}>
                <Typography sx={{ fontSize: '14px' }}>{buttonAddText}</Typography>
              </Button>
            </Box>
          </div>
        </div>
        {/* Table Element Component */}
        {/* <DataTable
          items={stockOutList}
          itemTotal={itemTotal}
          headers={StockOutHeaders}
          rowPerPage={rowsPerPage}
          loadingText="ไม่มีรายการคืนสินค้า"
          loading={dataLoading}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        /> */}
        <DataTable
          items={isRecallView ? recallList : stockOutList}
          itemTotal={itemTotal}
          headers={isRecallView ? RecallListHeaders : StockOutHeaders}
          rowPerPage={rowsPerPage}
          loadingText={isRecallView ? 'ไม่มีรายการเรียกเก็บ' : 'ไม่มีประวัติการคืน'}
          loading={dataLoading}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </div>

      <ProductDetailDialog
        html="Product Details"
        open={openProductInfo}
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

      {/* Table Element Component */}
      <Detail
        open={openDetail}
        onClose={handleClose}
        html={''}
        text_qauntity="จำนวนที่คืน"
        text_accecpt_qauntity="จำนวนที่คลังรับเข้า"
        text_ref_no="เลขที่ใบคืนสินค้า"
        text_title="วันที่คืนสินค้า"
        subtitle="รายละเอียดรายการคืนสินค้า"
        ref_no={stockOutInfo?.ref_no}
        create_date={stockOutInfo?.create_date}
        create_by_name={stockOutInfo?.create_by_name}
        total_quantity={stockOutInfo?.total_quantity}
        total_items={stockOutInfo?.total_items}
        driver_name={stockOutInfo?.driver_name}
        shipping_name={stockOutInfo?.shipping_name}
        shipping_track={stockOutInfo?.shipping_track}
        shipping_on={stockOutInfo?.shipping_on}
        type={stockOutInfo?.type}
        book_list={stockOutInfo?.book_list as ProductItem[]}
        note={stockOutInfo?.note}
      />

      <CreatStockOut
        open={openaddrequisition}
        openAccept={openAccept}
        openCancel={openCancel}
        onOpenComfirm={() => setOpenConfirm(true)}
        onOpenCancel={() => setOpenCancel(true)}
        disabled={disabled}
        isDisabled={isDisabled}
        typeStock={typeStock}
        keyword={keyword}
        placeholder={placeholder}
        note={stockOut.note ?? ''}
        selectRider={selectRider}
        rider={rider}
        onNoteChange={(value) =>
          setStockOut((prev) => ({
            ...prev,
            note: value,
          }))
        }
        handleClose={handleClose}
        handleSelectTypeStock={handleSelectTypeStock}
        handleSearchInput={handleSearchInput}
        onAddProduct={onAddProduct}
        handleInputQuantity={handleInputQuantity}
        onRemoveItem={(productId) => {
          setProductDeleteId(productId)
          setOpenRemoveItem(true)
        }}
        handleSelectRider={handleSelectRider}
        selectedList={selectedList}
      />

      <ConfirmDelete
        open={openRemoveItem}
        text="ลบสินค้าในตะกร้าหรือไม่"
        onConfirm={handleRemoveItem}
        onCancel={() => setOpenRemoveItem(false)}
      />

      <ConfirmReset
        text="ยืนยันการรีเซ็ตรายสินค้าหรือไม่"
        openCancel={openCancel}
        onCancel={() => setOpenCancel(false)}
        onResetSelectedList={resetSelectedList}
      />

      <Confirm
        text="ยืนยันการคืนสินค้าหรือไม่"
        open={openConfirm}
        loadingSubmit={loadingSubmit}
        onSubmitStockOut={onSubmitStockOut}
        onClose={() => setOpenConfirm(false)}
      />

      <AddTrack
        open={openAddTrack}
        text="เพิ่มข้อมูลขนส่ง"
        shipping={shipping}
        selectedShipping={selectedShipping}
        invoice_number={selectInvoice}
        selectRider={selectRider}
        trackNumber={shippingTrack}
        setTrackNumber={setTrackShippingTrack}
        rider={rider}
        shippingDate={shippingDate}
        setShippingDate={setShippingDate}
        handleSelectedShipping={handleSelectedShipping}
        handleSelectRider={handleSelectRider}
        onClose={handleCloseAddTrack}
        onSave={onSaveAddTrack}
      />

      <EditTarck
        open={openEditTrack}
        success={() => {
          setOpenEditTrack(false)
        }}
        text="แก้ไขข้อมูลขนส่ง"
        shipping={shipping}
        selectedShipping={selectedShipping}
        invoice_number={stockOutInfo?.ref_no || ''}
        selectRider={selectRider}
        rider={rider}
        shipping_track={editShippingTrack}
        setShippingTrack={setEditShippingTrack}
        shippingDate={shippingDate}
        setShippingDate={setShippingDate}
        handleSelectedShipping={handleSelectedShipping}
        handleSelectRider={handleSelectRider}
        onClose={handleCloseEditTrack}
        onSave={onSaveEditTrack}
        onCancel={onCancelAddTrack}
      />
      <Dialog
        slotProps={{
          paper: {
            style: {
              borderRadius: 20,
            },
          },
        }}
        open={openProduct}
        maxWidth="md" // ⭐ สำคัญ
        fullWidth>
        <DialogContent
          sx={{
            maxHeight: '70vh',
            overflowY: 'auto',
            overscrollBehavior: 'contain',
            pb: 0,
          }}>
          <FormGroup className="w-full">
            {selectItem.map((value: any, index: number) => (
              <FormControlLabel
                sx={{
                  width: '100%',
                  alignItems: 'flex-start',
                  '& .MuiFormControlLabel-label': {
                    width: '100%', // ⭐ สำคัญ
                  },
                }}
                control={<Checkbox onChange={() => handleCheckboxChange(value)} />}
                label={
                  <Box sx={{ width: '100%', whiteSpace: 'pre-line', my: 1 }}>
                    {`${value.product_barcode} ${value.product_name} (ราคาปก ${value.product_price} บาท)`}
                  </Box>
                }
                key={index}
              />
            ))}
          </FormGroup>
          <DialogActions
            sx={{
              position: 'sticky',

              bottom: 0,
              justifyContent: 'center',
              gap: 2,
              bgcolor: '#fff', // ⭐ กัน content ด้านหลังทะลุ
              borderTop: '1px solid #eee',
              zIndex: 1,
              py: 2,
            }}>
            <Button
              disabled={isSelectDisabled}
              onClick={onInputQtyComplete}
              color="info"
              variant="contained"
              className="btn-confirm">
              <DoneAll sx={{ mr: 1 }} />
              เพิ่มสินค้า
            </Button>
            <Button onClick={(_) => setOpenProduct(false)} color="warning" variant="contained" className="btn-confirm">
              <RemoveCircleOutlineOutlined sx={{ mr: 1 }} />
              ยกเลิก
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
    </div>
  )
}
