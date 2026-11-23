import { CartItem, Customer, EditUser, Officer, PaymentInfo, ProductDetail, Store as StoreType } from '@/models/type'
import { api } from '@/services/AxiosUtils'
import { Search, SearchIconWrapper, SelectInputBase } from '@/services/StyleUtils'
import {
  AccountCircle,
  AddCircleOutline,
  ClearOutlined,
  Close,
  DeleteOutlineOutlined,
  EditOutlined,
  MoreVertOutlined,
  PersonAddAltOutlined,
  Print,
  ReceiptLongOutlined,
  RemoveCircleOutline,
  SearchOutlined,
} from '@mui/icons-material'
import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardActions,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  Fab,
  FormControl,
  IconButton,
  InputAdornment,
  InputBase,
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material'
import CssBaseline from '@mui/material/CssBaseline'
import jwtDecode from 'jwt-decode'
import Head from 'next/head'
import * as React from 'react'
import toast from 'react-hot-toast'

import CheckOutOrder from '@/components/CheckOutOrder'
import ConfirmDelete from '@/components/dialogs/ConfirmDelete'
import CreateCustomer from '@/components/dialogs/CreateCustomer'
import ProductDetailDialog from '@/components/dialogs/ProductDetail'
import TemplateBillSlip from '@/components/dialogs/TemplateBillSlip'
import UpdateCustomer from '@/components/dialogs/UpdateCustomer'
import LoadingScreen from '@/components/LoadingScreen'
import PaymentSelector from '@/components/PaymentSelector'
import { StoreName } from '@/components/StoreName'
import { EXPIRE_TIME, EXPIRE_TIME_UNIT, OrderSentType, key } from '@/models/constants'
import { addressOption, orderPayloadC } from '@/models/mappingC'
import { customer_seed, customer_update_seed } from '@/models/seed'
import initAutoLogout from '@/services/AuthUtils'
import { sumAll } from '@/services/MathUtils'
import SentryEvent from '@/services/SentryUtils'
import { getLocalStorage, getUnixTime, setLocalStorage } from '@/services/StorageUtils'
import { AddressOption } from '@/services/StoreUtils'
import { formatBalance, formatBalance2 } from '@/services/StringUtils'

import dayjs from 'dayjs'
import { useRouter } from 'next/router'

import { v4 as uuidv4 } from 'uuid'

export default function Cashier() {
  const router = useRouter()
  const [cToken, setCToken] = React.useState('')

  const [maxWidth] = React.useState<DialogProps['maxWidth']>('lg')
  const [maxWidth2] = React.useState<DialogProps['maxWidth']>('md')
  const [currentUser, setCurrentUser] = React.useState<Officer>()
  const [store, setStore] = React.useState<StoreType>()
  const [order, setOrder] = React.useState<any>()
  const [orderItems, setOrderItems] = React.useState<any>()
  const [billOrder, setBillOrder] = React.useState<any>()
  const [timeStamp, setTimeStamp] = React.useState(0)

  const [openBill, setOpenbill] = React.useState(false)
  const [openUpdateCustomer, setOpenUpdateCustomer] = React.useState(false)
  const [openCreateCustomer, setOpenCreateCustomer] = React.useState(false)
  const [openDeleteAllCart, setOpenDeleteAllCart] = React.useState(false)
  const [openDeleteItemCart, setOpenDeleteItemCart] = React.useState(false)
  const [openDialogCheckOut, setOpenDialogCheckOut] = React.useState(false)
  const [openProdDetail, setOpenProdDetail] = React.useState(false)
  const [openChangeBalance, setOpenChangeBalance] = React.useState(false)

  const [notFound, setNotFound] = React.useState(false)
  const [loadFilter, setLoadFilter] = React.useState(false)
  const [loadFilterSubmit, setLoadFilterSubmit] = React.useState(false)
  const [initialCustomer, setInitialCustomer] = React.useState<any>([])
  const [selectedCustomer, setSelectedCustomer] = React.useState<EditUser>(customer_update_seed)
  const [customer, setCustomer] = React.useState<Customer>(customer_seed)
  const [customerList, setCustomerList] = React.useState<any>([])
  const [customerSearch, setCustomerSearch] = React.useState('')

  const [cartItems, setCartItems] = React.useState<any>([])
  const [searchType, setSearchType] = React.useState('')
  const [prodSearch, setProdSearch] = React.useState('')
  const [productItems, setProductItem] = React.useState<any>()
  const [paymentList, setPaymentList] = React.useState<PaymentInfo[]>()
  const [isInputDisabled, setIsInputDisabled] = React.useState(false)
  const [itemsRaw, setItemRaw] = React.useState<any>()
  const [searchPlaceholder, setSearchPlaceholder] = React.useState('Barcode / ชื่อหนังสือ')
  const [sentType, setSentType] = React.useState('normal')
  const [productType, setProductType] = React.useState('')

  const [load, setLoad] = React.useState({
    status: false,
    text: '',
    percentage: 0,
  })

  const [paymentForm, setPaymentForm] = React.useState({
    amount: 0,
    change: 0,
    remark: '',
  })
  const [rawAmount, setRawAmount] = React.useState('')
  const [calculatePromotion, setCalculatePromotion] = React.useState<any>()
  const [calculatePromotionPrice, setCalculatePromotionPrice] = React.useState<any>()
  const [newCart, setNewCart] = React.useState<any>()
  const [bill_slip, setBill_slip] = React.useState({ css: '', html: '' })
  const [address, setAddress] = React.useState<AddressOption[]>([])
  const [paymentMethod, setPaymentMethod] = React.useState('')
  const [productDeleteId, setProductDeleteId] = React.useState('')
  const [productInfo, setProductInfo] = React.useState<ProductDetail>()

  const [promoCode, setPromoCode] = React.useState('')
  const [discount, setDiscount] = React.useState(0)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)

  const handlePromoChange = (event: { target: { value: any } }) => {
    const value = event.target.value
    setPromoCode(value)
  }

  // [Compute] - รวมจำนวนสินค้าทั้งหมดในตะกร้า
  const getTotalQuantity = sumAll(cartItems, 'quantity')
  // [Compute] - รวมราคาสินค้าทั้งหมดในตะกร้า
  const getTotalPrice = sumAll(cartItems, 'product_sell')

  const getTextOrderSentType = (sentType: string) => {
    switch (sentType) {
      case OrderSentType.NORMAL:
        return 'รับสินค้าปกติ'
      case OrderSentType.RECIVE_STORE:
        return 'รับสินค้าที่ร้าน'
      case OrderSentType.DELIVERY:
        return 'จัดส่งที่บ้าน'
      case OrderSentType.BUFFET_299:
        return 'บุฟเฟ่ต์299'
      case OrderSentType.BUFFET_499:
        return 'บุฟเฟ่ต์499'
      default:
        return ''
    }
  }

  // [Method] - รับค่าจากฟอร์มข้อมูลลูกค้า
  const handleAddUser = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCustomer({ ...customer, [event.target.name]: event.target.value })
  }

  const handleClose = () => {
    setOpenUpdateCustomer(false)
    setOpenCreateCustomer(false)
    setOpenDeleteAllCart(false)
    setOpenDeleteItemCart(false)
    setOpenbill(false)
    setOpenChangeBalance(false)
    setOpenProdDetail(false)
  }

  const handleCloseChkout = () => {
    setOpenDialogCheckOut(false)
    setOpenbill(false)
    setPaymentForm({ amount: 0, change: 0, remark: '' })
    setPaymentMethod('')
    setRawAmount('')
  }

  const onSearchCustomer = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value === '') {
      setCustomerList([])
    } else {
      const res = await api.get(`/customer/list?keywords=${event.target.value}`)
      setCustomerList(res.data.item)
    }
    setCustomerSearch(event.target.value)
  }

  // [Method] - เลือกประเภทการรับสินค้า
  const addSendTypeToItemInCart = (index: number, value: any) => {
    const newCart = [...cartItems]
    newCart[index].sent_type = value
    setCartItems(newCart)
  }

  // [Method] - รับค่าจากฟอร์มแก้ไขข้อมูลลูกค้า
  const handleChangeEdit = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setSelectedCustomer((prevState: any) => ({
      ...prevState,
      [name]: value,
    }))
  }

  // [Method] - เลือกวันเดือนปีเกิด
  const onDateChange = (value: any) => {
    setCustomer({ ...customer, bod: value })
  }

  // [Method] - ลบสินค้าทั้งหมดในตะกร้า
  const handleRemoveAll = () => {
    setCartItems([])
    setOpenDeleteAllCart(false)
  }

  // [Method] - ลบสินค้าในตะกร้า
  const handleRemoveFromCart = () => {
    const newCartItems = cartItems.filter((value: any) => value.product_id !== productDeleteId)
    setCartItems(newCartItems)
    setOpenDeleteItemCart(false)
  }

  const handleAddToCart = (item: CartItem) => {
    const existingItem = cartItems.find((value: CartItem) => value.product_id === item.product_id)
    const currentTime = new Date()

    if (!existingItem) {
      // สินค้าใหม่
      item.quantity = 1
      item.sent_type = sentType
      item.product_sell = parseFloat(item.product_price.toString())
      item.product_sell_price = parseFloat(item.product_sell_price.toString())
      item.product_discount = parseFloat(item.product_price.toString()) - parseFloat(item.product_sell_price.toString()) // ส่วนลดต่อชิ้น
      item.added_time = currentTime

      setCartItems((prev: CartItem[]) => [
        {
          ...item,
        },
        ...prev,
      ])
    } else {
      const updatedCart = cartItems.map((value: CartItem) => {
        if (value.product_id === item.product_id) {
          // สินค้าที่มีอยู่แล้ว
          const newQuantity = value.quantity + 1
          const basePrice = parseFloat(value.product_price.toString()) // ราคาต่อชิ้น
          const discountPerUnit =
            parseFloat(value.product_price.toString()) - parseFloat(value.product_sell_price.toString()) // ส่วนลดต่อชิ้น

          return {
            ...value,
            quantity: newQuantity,
            product_sell: basePrice * newQuantity, // ราคารวม
            product_discount: discountPerUnit * newQuantity, // ส่วนลดรวม
            added_time: currentTime,
          }
        } else {
          return {
            ...value,
            product_sell: parseFloat(value.product_price.toString()) * value.quantity,
          }
        }
      })

      const sortedCart = updatedCart.sort((a: CartItem, b: CartItem) => b.added_time.getTime() - a.added_time.getTime())
      setCartItems(sortedCart)
    }
  }

  const handleDecrement = (item: CartItem) => {
    const newCart = cartItems.map((value: CartItem) => {
      if (value.product_id === item.product_id) {
        const newQuantity = parseInt(value.quantity.toString()) - 1
        if (newQuantity < 1) {
          return null
        }

        const basePrice = parseFloat(value.product_price.toString()) // ราคาต่อชิ้น
        const discountPerUnit =
          parseFloat(value.product_price.toString()) - parseFloat(value.product_sell_price.toString()) // ส่วนลดต่อชิ้น

        return {
          ...value,
          quantity: newQuantity,
          product_sell: basePrice * newQuantity, // ราคารวม
          product_discount: discountPerUnit * newQuantity, // ส่วนลดรวม
        }
      }
      return value
    })

    const filteredCart = newCart.filter((value: CartItem) => value)
    setCartItems(filteredCart)
  }

  const handleIncrement = (item: CartItem) => {
    const newCart = cartItems.map((value: CartItem) => {
      if (value.product_id === item.product_id) {
        const newQuantity = parseInt(value.quantity.toString()) + 1

        const basePrice = parseFloat(value.product_price.toString()) // ราคาต่อชิ้น
        const discountPerUnit =
          parseFloat(value.product_price.toString()) - parseFloat(value.product_sell_price.toString()) // ส่วนลดต่อชิ้น

        return {
          ...value,
          quantity: newQuantity,
          product_sell: basePrice * newQuantity, // ราคารวม
          product_discount: discountPerUnit * newQuantity, // ส่วนลดรวม
        }
      }
      return value
    })

    setCartItems(newCart)
  }

  // [Method] - จัดการกล่องข้อมความค้นหา
  const handleSearchInput = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setProdSearch(event.target.value)

    // ตรวจสอบว่าค่าที่ป้อนเข้ามาเป็นตัวเลข 13 หลักหรือไม่
    if (/^\d{13}$/.test(event.target.value)) {
      const res = await api.get(`/product/list?store_id=${store?.id}&barcode=${event.target.value}`)
      setSearchType('Barcode')

      if (res.data.items.length > 0) {
        setProductItem(res.data.items)
        const cloneItems = { ...res.data.items[0] } // ทำการ clone object ด้วย spread operator
        handleAddToCart(cloneItems)
        setProdSearch('')
        setSearchType('')
      } else {
        toast.error(res.data.msg)
        setProductItem([])
      }
    }

    // หากค่าที่ป้อนมามีความยาวน้อยกว่า 5 ตัวอักษร
    if (event.target.value.length < 5) {
      setProductItem(itemsRaw)
    }
  }

  const onEnterSearchBook = async (event: any) => {
    if (event.key === 'Enter') {
      if (searchType === 'Barcode') {
        const res = await api.get(`/product/list?store_id=${store?.id}&barcode=${event.target.value}`)
        if (res.data.items.length > 0) {
          setProductItem(res.data.items)
          const cloneItems = Object.assign({}, res.data.items[0])
          handleAddToCart(cloneItems)
          setProdSearch('')
        } else {
          toast.error(res.data.msg)
          setProductItem([])
        }
      } else {
        const res = await api.get(`/product/list?store_id=${store?.id}&keywords=${event.target.value}`)
        setProductItem(res.data.items)
      }
    }
  }

  const onClickSearch = async (event: any) => {
    setLoadFilter(true)
    if (searchType === 'Barcode') {
      const res = await api.get(`/product/list?store_id=${store?.id}&barcode=${prodSearch}`)
      if (res.data.items.length > 0) {
        setProductItem(res.data.items)
        const cloneItems = Object.assign({}, res.data.items[0])
        handleAddToCart(cloneItems)
        setProdSearch('')
      } else {
        toast.error(res.data.msg)
        setProductItem([])
      }
    } else {
      const res = await api.get(`/product/list?store_id=${store?.id}&keywords=${prodSearch}`)
      setProductItem(res.data.items)
    }
    setLoadFilter(false)
  }

  const handleChangeSentType = (event: SelectChangeEvent) => {
    setSentType(event.target.value)
    cartItems.forEach((item: any, index: number) => {
      addSendTypeToItemInCart(index, event.target.value)
    })
  }

  const handleSelectPayment = (result: PaymentInfo) => {
    setPaymentMethod(result.id as string)
    if (result.id === 5 || result.id === 6) {
      setRawAmount(formatBalance2(calculatePromotion.paid_amount))
      setPaymentForm({ ...paymentForm, amount: calculatePromotion.paid_amount })
      setIsInputDisabled(true)
    } else {
      setRawAmount('')
      setPaymentForm({ ...paymentForm, amount: 0 })
      setIsInputDisabled(false)
    }
  }

  // [Method] - ดึงข้อมูลการชำระเงิน
  const getPaymentList = async () => {
    SentryEvent('[GET] /payment/list', 'debug')
    const payment = getLocalStorage(key.PAYMENT)
    if (!!payment) {
      setPaymentList(payment)
    } else {
      setLoad({ status: true, text: 'ประเภทการจ่ายเงิน...', percentage: 80 })
      const res = await api.get(`/payment/list`)
      setPaymentList(res.data.items)
      setLocalStorage(key.PAYMENT, res.data.items, getUnixTime(EXPIRE_TIME, EXPIRE_TIME_UNIT))
    }
  }

  const getProductDetail = async (row: any) => {
    const store = getLocalStorage(key.STORE)
    const prodDetailRes = await api.get(`/product/info/${row.product_id}?store_id=${store.id}`)
    const itemDetails: ProductDetail = {
      id: Number(prodDetailRes.data.items.product_id),
      p_book_code: prodDetailRes.data.items.product_ref_code,
      p_name: prodDetailRes.data.items.product_name,
      product_type: prodDetailRes.data.items.product_type,
      book_no: prodDetailRes.data.items.product_exinfo_data.book_no,
      p_image: prodDetailRes.data.items.product_image,
      p_publishing: prodDetailRes.data.items.product_exinfo_data.publisher,
      p_isbn: prodDetailRes.data.items.product_barcode,
      product_price: parseFloat(prodDetailRes.data.items.product_price),
      p_qty: parseInt(prodDetailRes.data.items.product_quantity),
      release_date: dayjs(prodDetailRes.data.items.product_release_on).format('DD/MM/YYYY'),
    }
    setProductType(productType)

    setProductInfo(itemDetails)
    setOpenProdDetail(true)
  }

  const preCheckOut = async () => {
    const res = await api.get(`/customer/info/${selectedCustomer.id}`)
    if (res && res.status === 200 && res.data.status === 'Success') {
      setSelectedCustomer((prev) => ({
        ...prev,
        province: String(res.data.data[0].province),
        district: String(res.data.data[0].district),
        sub_district: String(res.data.data[0].sub_district),
        zip_code: res.data.data[0].zip_code,
        birth_day: res.data.data[0].birth_day,
        address: res.data.data[0].address,
      }))
    }

    const orderCheck = cartItems.some((item: any) => item.sent_type === 'recive_store' || item.sent_type === 'delivery')
    const itemLess = cartItems.filter((item: any) => Number(item.product_quantity) < item.quantity)
    const soldOut = cartItems.filter((item: any) => Number(item.product_quantity) === 0)
    const buffetBook = cartItems.filter((item: CartItem) => item.product_type !== 'บุฟเฟ่ต์')

    if (itemLess.length > 0 && sentType === 'normal') {
      for (let i = 0; i < itemLess.length; i++) {
        toast.error(
          `สินค้า "${itemLess[i].product_name}" มีจำนวนคงเหลือไม่เพียงพอ กรุณาเลือกการสั่งซื้อแบบ "รับที่ร้าน" หรือ "จัดส่งที่บ้าน"`
        )
      }
    } else if (soldOut.length > 0 && (sentType === 'buffet299' || sentType === 'buffet499')) {
      for (let i = 0; i < soldOut.length; i++) {
        toast.error(`สินค้า "${soldOut[i].product_name}" สินค้าหมด"`)
      }
    } else if ((sentType === 'buffet299' || sentType === 'buffet499') && buffetBook.length > 0) {
      for (let i = 0; i < buffetBook.length; i++) {
        toast.error(`สินค้า "${buffetBook[i].product_name}" ไม่ใช่บุฟเฟ่ต์"`)
      }
    } else if (!!orderCheck && selectedCustomer.id === 1) {
      toast.error('กรุณาเลือกลูกค้า ที่ไม่ใช่ลูกค้าทั่วไป')
    } else if (
      sentType === 'delivery' &&
      (!selectedCustomer.province ||
        (selectedCustomer.province === 'null' && !selectedCustomer.sub_district) ||
        selectedCustomer.sub_district === 'null')
    ) {
      toast.error('กรุณาแก้ไขที่อยู่ลูกค้า')
    } else if (sentType === 'recive_store' && !selectedCustomer.phone) {
      toast.error('กรุณาแก้ไขเบอร์โทรศัพท์')
    } else {
      setOpenDialogCheckOut(true)
    }
  }

  // [Method] - ดึงข้อมูลลูกค้าid=1(ผู้ใช้ทั่วไป)
  const getCustomerInit = async () => {
    const res = await api.get(`/customer/list?uid=1`)
    setInitialCustomer(res.data)
    setSelectedCustomer(res.data.item[0])
  }

  // [Method] - ดึงข้อมูลที่อยู่
  const getAddress = async () => {
    SentryEvent('[GET] /v1/address', 'debug')
    const address = getLocalStorage(key.ADDRESS)
    if (!!address) {
      setAddress(address)
    } else {
      const res = await api.get(`/address/list`)
      const address = addressOption(res.data)
      setLocalStorage(key.ADDRESS, address, getUnixTime(EXPIRE_TIME, EXPIRE_TIME_UNIT))
      setAddress(address)
    }
  }

  //[Mathod] - บันทึกการแก้ไขข้อมูลลูกค้า
  const onUpdateCustomer = async () => {
    setLoad({ status: true, text: 'บันทึกข้อมูล...', percentage: 50 })
    setCustomerSearch('')
    setOpenUpdateCustomer(false)
    delete selectedCustomer.birth_day
    selectedCustomer.updated_by = Number(currentUser?.id)
    selectedCustomer.store_id = Number(store?.id)
    const res = await api.put(`/customer/update/${selectedCustomer.id}`, selectedCustomer)
    if (res.data.status === 'Success') {
      toast.success(res.data.msg)
    } else {
      toast.error(res.data.msg)
    }
    setLoad({ status: false, text: '', percentage: 100 })
  }

  // [Method] - เพิ่มข้อมูลลูกค้า
  const onCreateCustomer = async () => {
    setLoad({ status: true, text: 'บันทึกข้อมูล...', percentage: 50 })
    setOpenCreateCustomer(false)
    customer.created_by = Number(currentUser?.id)
    customer.store_id = Number(store?.id)
    customer.bod = dayjs(customer.bod).format('YYYY-MM-DD')
    const res = await api.post('/customer/create', customer)
    setLoad({ status: false, text: '', percentage: 100 })
    if (res.data.status === 'Success') {
      toast.success(res.data.msg)
      setCustomer({
        app: 'POS',
        name: '',
        email: '',
        phone: '',
        bod: '',
        address: '',
        sub_district: '',
        district: '',
        province: 0,
        zip_code: '',
        active: 0,
        created_by: 0,
        store_id: 0,
        ref_source: '',
      })
    } else {
      toast.error(res.data.msg)
    }

    await getCustomerInit()
  }

  // [Method] - mappping ข้อมูลสินค้าใหม่
  React.useEffect(() => {
    const newCartKey = cartItems.map((v: any) => {
      const promotionItem = calculatePromotionPrice.find((p: any) => p.pro_id === v.product_id)

      return {
        pro_id: promotionItem?.pro_id,
        pro_name: v.product_name,
        pro_price: promotionItem?.pro_price,
        pro_quantity: promotionItem?.pro_quantity,
        pro_subtotal: promotionItem?.pro_subtotal,
        pro_discount: promotionItem?.pro_discount,
        pro_tax: promotionItem?.pro_tax,
        pro_tax_method: promotionItem?.pro_tax_method,
      }
    })
    setNewCart(newCartKey)
  }, [calculatePromotionPrice])

  // [Method] - สร้างคำสั่งซื้อ
  const onCreateOrder = async () => {
    const payload = orderPayloadC(
      selectedCustomer,
      paymentForm,
      newCart,
      calculatePromotion,
      paymentMethod,
      sentType,
      cToken,
      discount,
      promoCode
    )

    setPromoCode(promoCode)
    setDiscount(discount)
    if (paymentForm.amount < payload.paid_amount) {
      setLoadFilterSubmit(false)
      toast.error('จำนวนเงินที่ได้รับน้อยกว่าราคาสินค้า')
    } else {
      setLoadFilterSubmit(true)
      try {
        const orderItems = cartItems.map((item: any) => ({
          pro_id: item.product_id,
          pro_name: item.product_name,
          pro_quantity: item.quantity,
          pro_discount: item.product_discount,
          pro_price: item.product_sell,
        }))

        setOrderItems(orderItems)

        const orderRes = await api.post('/order', payload)

        setOrder(payload)

        setBillOrder(orderRes.data.data)

        if (orderRes.data.status === 'Success') {
          setPaymentForm({ amount: 0, change: Math.abs(payload.paid_amount - paymentForm.amount), remark: '' })
          setOpenChangeBalance(true)
          setCartItems([])
          setProductItem([])
          setRawAmount('')
          setProdSearch('')
          setSentType('normal')
          setOpenDialogCheckOut(false)
          setCToken('')
          setPromoCode('')
          setDiscount(0)
          setTimeStamp(Date.now())
          setPaymentMethod('')
          await getCustomerInit()
          toast.success('การสั่งซื้อสำเร็จ', { duration: 1000 })
          setLoadFilterSubmit(false)
        } else {
          toast.error(orderRes.data.msg)
          setLoadFilterSubmit(false)
        }
      } catch (error) {
        toast.error('เกิดข้อผิดพลาดในการสั่งซื้อ')
        setLoadFilterSubmit(false)
      }
    }
  }

  const handleChangeAmount = (e: { target: { value: string } }) => {
    const value = e.target.value.replace(/,/g, '')
    setRawAmount(value)
    const parsedValue = parseFloat(value)
    setPaymentForm({ ...paymentForm, amount: isNaN(parsedValue) ? 0 : parsedValue })
  }

  // [Method] - ดึงข้อมูลเริ่มต้น
  const initialData = async (id: string) => {
    SentryEvent('[GET] Initial data', 'debug')
    // await getProductItem(id)
    await getCustomerInit()
    await getAddress()
    await getPaymentList()
    setLoad({ status: false, text: 'สำเร็จ', percentage: 100 })
  }

  const openUpdateCustomerDialog = async () => {
    const res = await api.get(`/customer/info/${selectedCustomer.id}`)
    if (res && res.status === 200 && res.data.status === 'Success') {
      setSelectedCustomer((prev) => ({
        ...prev,
        province: String(res.data.data[0].province),
        district: String(res.data.data[0].district),
        sub_district: String(res.data.data[0].sub_district),
        zip_code: res.data.data[0].zip_code,
        birth_day: res.data.data[0].birth_day,
        address: res.data.data[0].address,
      }))
    }
    setOpenUpdateCustomer(true)
  }

  React.useEffect(() => {
    const token = getLocalStorage(key.TOKEN)
    if (!token) return

    setIsAuthenticated(true)
    const user: Officer = jwtDecode(token)
    const store: StoreType = getLocalStorage(key.STORE)

    initAutoLogout()
    setCurrentUser(user)
    setStore(store)
    initialData(store.id as string)
    setCToken(uuidv4())

    window.onafterprint = () => setOpenbill(false)
    return () => {
      window.onafterprint = null
    }
  }, [timeStamp])

  React.useEffect(() => {
    if (!cartItems || cartItems.length === 0) {
      setCalculatePromotion({
        sub_total: 0,
        discount_amount: 0,
        total_quantity: 0,
        discount_coupon: '',
        shipping_amount: 0,
        others_charge: 0,
        paid_amount: 0,
      })
      return
    }

    const store: StoreType = getLocalStorage(key.STORE)

    const fetchPromotion = async () => {
      try {
        const payload = {
          store: store.id,
          coupon: promoCode,
          delivery_type: sentType,
          item: cartItems.map((item: any) => ({
            product_id: item.product_id,
            product_name: item.product_name,
            product_price: item.product_price,
            quantity: item.quantity,
          })),
        }

        const response = await api.post('/promotion/calculate', payload)
        setCalculatePromotion(response.data.data)

        setCalculatePromotionPrice(response.data.data.item_list)
      } catch (error) {
        setCalculatePromotion({
          sub_total: 0,
          discount_amount: 0,
          total_quantity: 0,
          discount_coupon: '',
          shipping_amount: 0,
          others_charge: 0,
          paid_amount: 0,
        })
      }
    }

    fetchPromotion()
  }, [cartItems])

  return (
    <div>
      <style>{bill_slip.css}</style>
      <Head>
        <title>POS</title>
        <meta name="description" content="homepage" />
        <meta httpEquiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta httpEquiv="Pragma" content="no-cache" />
        <meta httpEquiv="Expires" content="0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <CssBaseline />
      <LoadingScreen open={load.status} text={load.text} percentage={load.percentage} />
      <div className="main-container hide-on-print">
        <div className="left-container">
          <div className="left-container-header">
            {isAuthenticated && <StoreName text="Cashier C" store={store?.name} currentUser={currentUser?.name} />}
            <Box
              sx={{
                zIndex: 3,
                width: '93%',
                display: 'flex',
              }}>
              <Search
                className="search"
                sx={{
                  m: 1,
                  display: 'flex',
                  height: 50,
                  borderRadius: '20px',
                }}>
                <SearchIconWrapper>
                  <Search />
                </SearchIconWrapper>
                <InputBase
                  sx={{ ml: 2, width: '100%' }}
                  placeholder={searchPlaceholder}
                  value={prodSearch}
                  onKeyUp={onEnterSearchBook}
                  onChange={handleSearchInput}
                  inputProps={{ 'aria-label': 'search' }}
                />

                <IconButton onClick={() => setProdSearch('')}>
                  <ClearOutlined />
                </IconButton>
              </Search>
              <Button
                color="primary"
                loading={loadFilter}
                startIcon={<SearchOutlined />}
                variant="contained"
                className="btnsearchinvoice2"
                onClick={onClickSearch}>
                <Typography sx={{ fontSize: '14px' }}>ค้นหา</Typography>
              </Button>
            </Box>
          </div>
          <div className="left-container-body">
            <div>
              <div className="hide-on-print product-item-container">
                <div></div>
                {notFound ? (
                  <Typography
                    sx={{
                      fontWeight: 500,
                      textAlign: 'center',
                    }}>
                    คำค้น {prodSearch} ไม่พบข้อมูล
                  </Typography>
                ) : productItems ? (
                  productItems.map((row: any, index: any) => (
                    <Card className="cardproductitem2" key={index}>
                      <div style={{ width: '15%', marginLeft: 5 }}>
                        <Typography sx={{ fontSize: '14px' }}>{row.product_barcode}</Typography>
                      </div>
                      <div style={{ width: '60%' }}>
                        <Typography className="ellipsis">{row.product_name}</Typography>
                      </div>
                      <CardActions sx={{ padding: 0, width: '10%' }}>
                        <Button
                          className="btn-addtocart2"
                          color="primary"
                          variant="contained"
                          onClick={() => {
                            handleAddToCart(row)
                          }}>
                          <Typography style={{ textAlign: 'left' }}>{formatBalance(row.product_sell_price)}</Typography>
                        </Button>
                      </CardActions>

                      <IconButton
                        onClick={(_) => getProductDetail(row)}
                        sx={{
                          color: '#7B7878',
                          ml: -1,
                        }}>
                        <MoreVertOutlined />
                      </IconButton>
                    </Card>
                  ))
                ) : (
                  <></>
                )}
                <div></div>
              </div>
            </div>
          </div>
        </div>
        <div className="right-container">
          <div className="card-item-order">
            <div className="card-header">
              <div className="search-customer-input">
                <AccountCircle className="btnaccount" />
                {initialCustomer && (
                  <Autocomplete
                    sx={{
                      border: 'none',
                      width: '90%',
                    }}
                    size="small"
                    // isOptionEqualToValue={(option: any, value: any) => {
                    //   return Number(option.active) === Number(value.active)
                    // }}
                    options={customerList}
                    getOptionLabel={(option: any) => {
                      if (option.name === 'ลูกค้าทั่วไป') {
                        return ''
                      } else {
                        return `(${option.phone})  ${option.name}`
                      }
                    }}
                    onChange={async (_, value: any) => {
                      if (value) {
                        setSelectedCustomer(value)
                        const res = await api.get(`/customer/info/${value.id}`)
                        if (res && res.status === 200 && res.data.status === 'Success') {
                          setSelectedCustomer((prev) => ({
                            ...prev,
                            province: String(res.data.data[0].province),
                            district: String(res.data.data[0].district),
                            sub_district: String(res.data.data[0].sub_district),
                            zip_code: res.data.data[0].zip_code,
                            birth_day: res.data.data[0].birth_day,
                            address: res.data.data[0].address,
                          }))
                        }
                      }
                    }}
                    value={selectedCustomer}
                    renderInput={(getCustomer) => (
                      <TextField
                        placeholder='ค้นหา "ชื่อ หรือ เบอร์โทรศัพท์" ลูกค้า'
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': {
                              border: 'none',
                            },
                          },
                        }}
                        // onFocus={() => {
                        //   setSelectedCustomer(initialCustomer[0])
                        //   setUserId(initialCustomer[0].id)
                        // }}
                        onChange={onSearchCustomer}
                        {...getCustomer}
                      />
                    )}
                  />
                )}
                {selectedCustomer.id != 1 && (
                  <IconButton onClick={openUpdateCustomerDialog}>
                    <EditOutlined
                      sx={{
                        ml: '2%',
                        color: '#7B7878',
                      }}
                    />
                  </IconButton>
                )}
              </div>
              <IconButton sx={{ mx: 2 }} onClick={(_) => setOpenCreateCustomer(true)}>
                <PersonAddAltOutlined sx={{ color: '#7B7878' }} />
              </IconButton>
            </div>
            <div className="boxitem">
              {cartItems.length > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <FormControl
                    sx={{
                      display: 'flex',
                      justifyContent: 'flex-start',
                      mt: 2,
                      ml: 2,
                    }}>
                    <Select
                      onChange={handleChangeSentType}
                      value={sentType}
                      displayEmpty
                      input={<SelectInputBase id="select-multiple-chip" />}
                      sx={{
                        mb: -1,
                        borderRadius: 10,
                        border: 'solid 1px #7B7878',
                        height: 25,
                        width: 120,
                        fontSize: 12,
                      }}>
                      <MenuItem value={OrderSentType.NORMAL} defaultChecked>
                        {getTextOrderSentType(OrderSentType.NORMAL)}
                      </MenuItem>
                      <MenuItem value={OrderSentType.RECIVE_STORE}>
                        {getTextOrderSentType(OrderSentType.RECIVE_STORE)}
                      </MenuItem>
                      <MenuItem value={OrderSentType.DELIVERY}>{getTextOrderSentType(OrderSentType.DELIVERY)}</MenuItem>
                      <MenuItem value={OrderSentType.BUFFET_499}>
                        {getTextOrderSentType(OrderSentType.BUFFET_499)}
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <Typography
                    onClick={(_) => setOpenDeleteAllCart(true)}
                    sx={{
                      width: 150,
                      fontSize: '14px',
                      mt: 2,
                      mr: 2,
                      textAlign: 'right',
                      cursor: 'pointer',
                    }}>
                    ลบรายการทั้งหมด
                  </Typography>
                </div>
              )}
              <ConfirmDelete
                text="คุณกำลังลบรายการทั้งหมด"
                open={openDeleteAllCart}
                onConfirm={handleRemoveAll}
                onCancel={handleClose}
              />
              {cartItems &&
                cartItems.map((item: any, index: number) => {
                  const isBuffet = item.product_type === 'บุฟเฟ่ต์'
                  const shouldHighlight = sentType === 'buffet499' && !isBuffet

                  return (
                    <div className="cartitem" key={index} style={shouldHighlight ? { border: '2px solid red' } : {}}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography className="ellipsis3">{item.product_name}</Typography>
                        <div>
                          <div className="cartitem-right-amount">
                            <IconButton
                              className="btnDecrement2"
                              onClick={() => {
                                setOpenDeleteItemCart(true)
                                setProductDeleteId(item.product_id)
                              }}>
                              <DeleteOutlineOutlined />
                            </IconButton>
                            <IconButton
                              className="btnDecrement"
                              onClick={() => {
                                if (item.quantity > 1) {
                                  handleDecrement(item)
                                } else {
                                  setOpenDeleteItemCart(true)
                                  setProductDeleteId(item.product_id)
                                }
                              }}>
                              <RemoveCircleOutline />
                            </IconButton>

                            <div className="bgamount">
                              <Typography className="amount">{parseInt(item.quantity)}</Typography>
                            </div>

                            <IconButton className="btnIncrement" onClick={() => handleIncrement(item)}>
                              <AddCircleOutline />
                            </IconButton>
                          </div>
                        </div>
                        <div className="textpricecart">
                          <Typography>
                            {formatBalance(parseFloat(item.product_price) * parseInt(item.quantity))}
                          </Typography>
                        </div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography style={{ color: '#7B7878' }}>{item.product_barcode}</Typography>
                        <Typography style={{ color: 'red' }}>
                          ราคาลด&nbsp;&nbsp;
                          {formatBalance(parseFloat(item.product_sell_price) * parseInt(item.quantity))}
                        </Typography>
                      </div>
                    </div>
                  )
                })}

              <ConfirmDelete
                text="คุณกำลังลบรายการสินค้า"
                open={openDeleteItemCart}
                onConfirm={handleRemoveFromCart}
                onCancel={handleClose}
              />
            </div>

            <div className="card-footer">
              <div className="card-footer-left">
                <Typography sx={{ fontSize: '16px' }}>รวมทั้งหมด</Typography>

                <Typography sx={{ fontSize: '16px' }}>รหัสโปรโมชั่น</Typography>
                <Typography sx={{ fontSize: '16px' }}>ส่วนลด</Typography>
                <Typography sx={{ fontSize: '16px' }}>ค่าจัดส่ง</Typography>
              </div>
              <div className="card-footer-center"></div>
              <div className="card-footer-right">
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                  <div>
                    <Typography sx={{ fontSize: '16px' }}>{calculatePromotion?.total_quantity}</Typography>
                  </div>
                  <div>
                    <Typography sx={{ fontSize: '16px' }}>{formatBalance(calculatePromotion?.sub_total)}</Typography>
                  </div>
                </div>

                <div className="inputpromo">
                  <InputBase
                    sx={{
                      ml: 1,
                      width: '100%',
                      fontSize: '14px',
                    }}
                    placeholder="กรอกรหัสโปรโมชั่น"
                    inputProps={{
                      'aria-label': 'กรอกรหัสโปรโมชั่น',
                    }}
                    value={promoCode}
                    onChange={handlePromoChange} // Apply promo code on every change
                  />
                </div>
                <Typography sx={{ fontSize: '16px' }}>{formatBalance(calculatePromotion?.discount_amount)}</Typography>
                <Typography sx={{ fontSize: '16px' }}>{formatBalance(calculatePromotion?.shipping_amount)}</Typography>
              </div>
            </div>
            <Typography sx={{ fontSize: '16px', ml: 2 }}>ยอดรวมที่ต้องชำระ</Typography>
            <div style={{ textAlign: 'center' }}>
              <Button
                className="btn-chkout"
                variant="contained"
                disabled={getTotalQuantity === 0}
                onClick={preCheckOut}>
                <Typography sx={{ fontSize: '60px' }}>{formatBalance(calculatePromotion?.paid_amount)}</Typography>
              </Button>
            </div>
          </div>
        </div>
        {/* <InvoicePaper open={openBill} html={bill_slip.html} onClose={handleCloseChkout} /> */}
        <UpdateCustomer
          open={openUpdateCustomer}
          onClose={handleClose}
          customer_name={selectedCustomer.name}
          customer_phone={selectedCustomer.phone}
          customer_email={selectedCustomer.email}
          customer_address={selectedCustomer.address}
          customer_main_address={[
            selectedCustomer.province,
            selectedCustomer.district,
            `${selectedCustomer.sub_district} ${selectedCustomer.zip_code}`,
          ]}
          onChangeCustomerData={handleChangeEdit}
          customer_birth_day={selectedCustomer.birth_day}
          onChangeProvince={(e) => setSelectedCustomer({ ...selectedCustomer, province: Number(e) })}
          onChangeDistrict={(e) => setSelectedCustomer({ ...selectedCustomer, district: e })}
          onChangeSubDistrictAndPostCode={(e, a) =>
            setSelectedCustomer({ ...selectedCustomer, sub_district: e, zip_code: a })
          }
          cascaderAddress={address}
          onChangeDate={(value: any) => {
            setSelectedCustomer({
              ...selectedCustomer,
              bod: !value ? null : dayjs(value).format('YYYY-MM-DD'),
            })
          }}
          onSubmit={onUpdateCustomer}
        />
        <CreateCustomer
          open={openCreateCustomer}
          onClose={handleClose}
          customer_name={customer.name}
          customer_phone={customer.phone}
          customer_email={customer.email}
          customer_address={customer.address}
          onChangeCustomerData={handleAddUser}
          cascaderAddress={address}
          onChangeProvince={(e) => setCustomer({ ...customer, province: Number(e) })}
          onChangeDistrict={(e) => setCustomer({ ...customer, district: e })}
          onChangeSubDistrictAndPostCode={(e, a) => setCustomer({ ...customer, sub_district: e, zip_code: a })}
          onChangeDate={onDateChange}
          onSubmit={onCreateCustomer}
        />

        <Dialog
          fullWidth={true}
          maxWidth={maxWidth}
          open={openDialogCheckOut}
          PaperProps={{
            style: {
              borderRadius: 20,

              overflowX: 'hidden',
            },
          }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingLeft: 20, paddingRight: 20 }}>
            <DialogTitle id="alert-dialog-title">
              <Typography sx={{ fontSize: '16px' }}>รายละเอียดคำสั่งซื้อ</Typography>
            </DialogTitle>

            <IconButton onClick={handleCloseChkout}>
              <ClearOutlined sx={{ color: '#FE5454' }} />
            </IconButton>
          </div>

          <DialogContent sx={{ m: 0, overflowY: 'initial' }}>
            <div className="dialog-chk-container">
              <div className="chk-left">
                <CheckOutOrder
                  cart={cartItems}
                  SentType={sentType}
                  address={address}
                  CustomerName={selectedCustomer.name}
                  CustomerPhone={selectedCustomer.phone}
                  CustomerRawAddress={selectedCustomer.address}
                  CustomerAddress={[
                    selectedCustomer.province,
                    selectedCustomer.district,
                    selectedCustomer.sub_district,
                    selectedCustomer.zip_code,
                  ]}
                />
              </div>

              <div className="chk-right">
                <div className="payment-select">
                  <PaymentSelector paymentList={paymentList} onSelect={(e) => handleSelectPayment(e as PaymentInfo)} />
                </div>
                <div className="chk-container">
                  <div className="chk-container-right chkout-left">
                    <Typography>รวมทั้งหมด ({calculatePromotion?.total_quantity})</Typography>
                    <Typography>รหัสโปรโมชั่น</Typography>
                    <Typography>ส่วนลด</Typography>
                    <Typography>ค่าส่ง</Typography>
                    <Typography style={{ fontSize: 20 }}>ยอดรวมที่ต้องชำระ</Typography>
                  </div>
                  <div className="chk-container-right chkout-right">
                    <Typography>{formatBalance(calculatePromotion?.sub_total)}</Typography>
                    <Typography>&nbsp;{promoCode}</Typography>
                    <Typography>{formatBalance(calculatePromotion?.discount_amount)}</Typography>
                    <Typography>{formatBalance(calculatePromotion?.shipping_amount)}</Typography>
                    <Typography style={{ fontSize: 20 }}>{formatBalance(calculatePromotion?.paid_amount)}</Typography>
                  </div>
                </div>

                <div style={{ justifyContent: 'space-between', display: 'flex' }}>
                  <div
                    style={{
                      width: '70%',
                      display: 'grid',
                      gap: 10,
                      alignItems: 'start',
                    }}>
                    <div style={{ width: '100%', display: 'flex', justifyContent: 'left' }}>
                      <Typography sx={{ fontSize: 14, mt: 2, width: '30%' }}>จำนวนเงินที่ได้รับ</Typography>

                      <div className="inputcash">
                        <InputBase
                          type="number"
                          value={rawAmount}
                          name="paid_total"
                          startAdornment={<InputAdornment position="start">฿</InputAdornment>}
                          onChange={handleChangeAmount}
                          onBlur={(e) => {
                            setRawAmount(formatBalance2(e.target.value))
                          }}
                          disabled={isInputDisabled}
                          sx={{
                            ml: 1,
                            width: '100%',
                            fontSize: '14px',
                          }}
                          placeholder="จำนวนเงิน"
                          inputProps={{
                            'aria-label': 'จำนวนเงิน',
                          }}
                        />
                      </div>
                    </div>

                    <div style={{ width: '100%', display: 'flex', justifyContent: 'left' }}>
                      <Typography sx={{ fontSize: 14, mt: 1, width: '40%' }}>บันทึกช่วยจำ</Typography>
                      <div className="inputnote2">
                        <InputBase
                          name="note"
                          onChange={(e) => setPaymentForm({ ...paymentForm, remark: e.target.value })}
                          sx={{
                            ml: 1,
                            mt: 1,
                            width: '100%',
                            fontSize: '14px',
                          }}
                          inputProps={{
                            'aria-label': 'บันทึกช่วยจำ',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                  <div style={{ width: '25%' }}>
                    <Button
                      loading={loadFilterSubmit}
                      className="btn-chkpay"
                      disabled={paymentMethod === '' ? true : false}
                      variant="contained"
                      startIcon={<ReceiptLongOutlined />}
                      onClick={onCreateOrder}>
                      <Typography sx={{ fontSize: '14px' }}>รับเงิน</Typography>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ width: '100%', display: 'flex', justifyContent: 'right' }}>
              <div style={{ width: '22%' }} />
              <Typography>{cToken}</Typography>
              <div />
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          sx={{ padding: 10 }}
          open={openChangeBalance}
          PaperProps={{
            style: {
              borderRadius: 20,
            },
          }}>
          {/* <div style={{ display: 'flex', justifyContent: 'center', padding: 10 }}>
            <Lottie options={loadingAnimationSuccess} height={150} width={150} />
          </div> */}
          <DialogContentText
            sx={{
              display: 'flex',
              justifyContent: 'center',
            }}>
            เงินทอน
          </DialogContentText>
          <Typography
            sx={{
              display: 'flex',
              justifyContent: 'center',
              fontSize: '50px',
              mb: 3,
              mt: 3,
            }}>
            {formatBalance(paymentForm.change)}
          </Typography>

          <DialogActions sx={{ mb: 2, justifyContent: 'center', pl: 5, pr: 5 }}>
            <Button
              color="warning"
              sx={{ backgroundColor: '#F1F1F1' }}
              variant="contained"
              autoFocus
              onClick={async (_) => {
                await setOpenChangeBalance(false)
                await setOpenbill(false)
              }}>
              <Typography sx={{ fontSize: '14px', color: '#7B7878' }}>เสร็จสิ้น</Typography>
            </Button>
            <Button
              autoFocus
              color="warning"
              sx={{ backgroundColor: '#F1F1F1' }}
              variant="contained"
              onClick={(_) => setOpenbill(true)}>
              <Typography sx={{ fontSize: '14px', color: '#7B7878' }}>ดูใบเสร็จ</Typography>
            </Button>
          </DialogActions>
        </Dialog>
        <Dialog
          open={openBill}
          PaperProps={{
            style: {
              padding: 10,
            },
          }}>
          <Fab
            color="primary"
            aria-label="add"
            className="float-btn-bill hide-on-print"
            onClick={(_) => setOpenbill(false)}>
            <Close />
          </Fab>
          <Fab color="info" aria-label="add" className="float-btn-bill-2 hide-on-print" onClick={(_) => print()}>
            <Print />
          </Fab>
          <TemplateBillSlip
            text="cashier"
            open={openBill}
            onClose={handleClose}
            store_name={store?.name}
            store_address={store?.address}
            vat_reg={store?.vat_reg_no}
            invoice_id={billOrder}
            date_time={dayjs().format('DD/MM/YYYY HH:mm')}
            customer_name={order?.customer_name}
            customer_phone={order?.customer_mobile}
            customer_address={order?.customer_address}
            items={orderItems}
            sent_type={order?.delivery_type}
            total_items={order?.pro_qty}
            sub_total={order?.sub_total}
            discount_coupon={order?.discount_coupon}
            delivery_type={order?.delivery_type}
            discount_amount={order?.discount_amount}
            shipping_amount={order?.shipping_amount}
            total_tax={order?.total_tax}
            payable_amount={order?.paid_amount}
            paid_amount={order?.paid_total}
            change={paymentForm.change}
            invoice_note={order?.note}
            store_phone={store?.phone}
            footer_text=""
          />
        </Dialog>
        <ProductDetailDialog
          html="Product Details"
          open={openProdDetail}
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
    </div>
  )
}
