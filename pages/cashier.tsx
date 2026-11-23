import {
  CartItem,
  Coupon,
  Customer,
  EditUser,
  Officer,
  PaymentInfo,
  PaymentSelection,
  ProductDetail,
  Store as StoreType,
} from '@/models/type'
import { api } from '@/services/AxiosUtils'
import { loadingAnimationSuccess, Search, SearchIconWrapper, SelectInputBase } from '@/services/StyleUtils'
import {
  AccountCircle,
  AddCircleOutline,
  ClearOutlined,
  Close,
  DeleteOutlineOutlined,
  EditOutlined,
  ErrorOutlineRounded,
  MoreVertOutlined,
  PersonAddAltOutlined,
  Print,
  ReceiptLongOutlined,
  RemoveCircleOutline,
  SearchOutlined,
} from '@mui/icons-material'
import {
  Autocomplete,
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
import jwtDecode from 'jwt-decode'
import Head from 'next/head'
import * as React from 'react'
import Countdown, { CountdownRenderProps } from 'react-countdown'
import toast from 'react-hot-toast'

import CheckOutOrder from '@/components/CheckOutOrder'
import ConfirmDelete from '@/components/dialogs/ConfirmDelete'
import CreateCustomer from '@/components/dialogs/CreateCustomer'
import ProductDetailDialog from '@/components/dialogs/ProductDetail'
import TemplateBillSlip from '@/components/dialogs/TemplateBillSlipB'
import UpdateCustomer from '@/components/dialogs/UpdateCustomer'
import LoadingScreen from '@/components/LoadingScreen'
import PaymentSelector from '@/components/PaymentSelector'
import { StoreName } from '@/components/StoreName'
import { EXPIRE_TIME, EXPIRE_TIME_UNIT, key, OrderSentType } from '@/models/constants'
import { addressOption, orderPayload } from '@/models/mapping'
import { customer_seed, customer_update_seed } from '@/models/seed'
import initAutoLogout from '@/services/AuthUtils'
import { EDCUtilWeb } from '@/services/EDCUtills'
import { sumAll, sumAllWithCondition } from '@/services/MathUtils'
import SentryEvent from '@/services/SentryUtils'
import { getLocalStorage, getUnixTime, setLocalStorage } from '@/services/StorageUtils'
import { AddressOption } from '@/services/StoreUtils'
import { formatBalance, formatBalance2 } from '@/services/StringUtils'

import dayjs from 'dayjs'
import Image from 'next/image'
import { useRouter } from 'next/router'

import Lottie from 'react-lottie'
import { v4 as uuidv4 } from 'uuid'
import mypic from '../assets/images/12E22EBE-6E62-4149-ADEA-18C16948C5C5_1_201_a.jpeg'

export default function Cashier() {
  const router = useRouter()
  const [cToken, setCToken] = React.useState('')

  const [maxWidth] = React.useState<DialogProps['maxWidth']>('lg')

  const [currentUser, setCurrentUser] = React.useState<Officer>()
  const [store, setStore] = React.useState<StoreType>()
  const [order, setOrder] = React.useState<any>()
  const [billOrder, setBillOrder] = React.useState<any>()
  const [couponInfo, setCouponInfo] = React.useState<any>([])
  const [timeStamp, setTimeStamp] = React.useState(0)

  const [openBill, setOpenbill] = React.useState(false)
  const [openUpdateCustomer, setOpenUpdateCustomer] = React.useState(false)
  const [openCreateCustomer, setOpenCreateCustomer] = React.useState(false)
  const [openDeleteAllCart, setOpenDeleteAllCart] = React.useState(false)
  const [openDeleteItemCart, setOpenDeleteItemCart] = React.useState(false)
  const [openDialogCheckOut, setOpenDialogCheckOut] = React.useState(false)
  const [openProdDetail, setOpenProdDetail] = React.useState(false)
  const [openChangeBalance, setOpenChangeBalance] = React.useState(false)
  const [openPaymentEDC, setOpenPaymentEDC] = React.useState(false)
  const [openPartnerBook, setOpenPartnerBook] = React.useState(false)
  const [notFound, setNotFound] = React.useState(false)
  const [loadFilter, setLoadFilter] = React.useState(false)
  const [loadFilterSubmit, setLoadFilterSubmit] = React.useState(false)
  const [isInputDisabled, setIsInputDisabled] = React.useState(false)
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [isBrowser, setIsBrowser] = React.useState(false)

  const [initialCustomer, setInitialCustomer] = React.useState<any>([])
  const [selectedCustomer, setSelectedCustomer] = React.useState<EditUser>(customer_update_seed)
  const [customer, setCustomer] = React.useState<Customer>(customer_seed)

  const [notificationList, setNotificationList] = React.useState<any>([])
  const [cartItems, setCartItems] = React.useState<any>([])
  const [customerList, setCustomerList] = React.useState<any>([])
  const [address, setAddress] = React.useState<AddressOption[]>([])

  const [searchType, setSearchType] = React.useState('')
  const [prodSearch, setProdSearch] = React.useState('')
  const [customerSearch, setCustomerSearch] = React.useState('')
  const [sentType, setSentType] = React.useState('normal')
  const [searchPlaceholder] = React.useState('Barcode / ชื่อหนังสือ')
  const [productType, setProductType] = React.useState('')
  const [editPrice, setEditPrice] = React.useState('')
  const [paymentMethod, setPaymentMethod] = React.useState('')
  const [productDeleteId, setProductDeleteId] = React.useState('')
  const [promoCode, setPromoCode] = React.useState('')
  const [promoInput, setPromoInput] = React.useState('')

  const [productItems, setProductItem] = React.useState<any>()
  const [paymentList, setPaymentList] = React.useState<PaymentInfo[]>()

  const [partnerProductId, setPartnerProductId] = React.useState<string | number | null>(null)

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

  const [bill_slip] = React.useState({ css: '', html: '' })

  const [productInfo, setProductInfo] = React.useState<ProductDetail>()

  const [discount, setDiscount] = React.useState(0)
  const [discountCoupon, setDiscountCoupon] = React.useState<Coupon | any>(null)

  const [connectedPort, setConnectedPort] = React.useState<any | null>(null)

  const handlePromoChange = (event: { target: { value: any } }) => {
    const value = event.target.value.toUpperCase()
    setPromoInput(value)
  }

  // [Compute] - รวมจำนวนสินค้าทั้งหมดในตะกร้า
  const getTotalQuantity = sumAll(cartItems, 'quantity')

  // [Compute] - รวมราคาสินค้าทั้งหมดในตะกร้า
  const getTotalPrice = () => {
    return sumAll(cartItems, 'product_price')
  }
  const getTotalSellPrice = () => {
    return sumAll(cartItems, 'product_sell')
  }

  
const recalculateItem = (item: CartItem): CartItem => {
  const quantity = Number(item.quantity || 1)
  const currentTime = new Date()

  const isPartner = item.product_type === 'พาร์ทเนอร์'

  const basePriceUnit = isPartner
    ? Number(item.product_sell_price || item.product_price || 0)
    : Number(item.product_price_unit || item.product_price || 0)

  const pricePerUnit = isPartner
    ? basePriceUnit
    : Number(item.product_sell_price || 0)

  const totalPrice = basePriceUnit * quantity
  const totalSell = pricePerUnit * quantity

  return {
    ...item,

    product_price_unit: basePriceUnit,
    product_price: totalPrice,

    product_sell_price: pricePerUnit,
    product_sell: totalSell,

    product_discount: isPartner
      ? 0
      : (basePriceUnit - pricePerUnit) * quantity,

    quantity,
    added_time: currentTime,
  }
}


  const getCoupon = async (code: string) => {
    try {
      const res = await api.get(`/coupon/${code}`)
      const coupon = res.data
      const couponInfo = res.data.data.coupon

      if (coupon.status === 'error') {
        setDiscountCoupon(null)
        setPromoInput('')
        return
      }

      const rule = couponInfo.rule ? JSON.parse(couponInfo.rule) : {}

      if (rule.order_amount_min && getTotalSellPrice() < rule.order_amount_min) {
        toast.error(`ยอดสั่งซื้อขั้นต่ำ ${rule.order_amount_min} บาท`)
        return
      }

      if (couponInfo.expire_on && dayjs(couponInfo.expire_on).isBefore(dayjs())) {
        toast.error('คูปองหมดอายุแล้ว')
        setPromoInput('')
        return
      }

      setPromoCode(code) // เก็บเมื่อใช้สำเร็จ
      setDiscountCoupon(couponInfo)
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการใช้คูปอง')
    }
  }

  const calculateCouponDiscount = (price: number) => {
  if (!discountCoupon) return 0

  const rule = discountCoupon.rule
    ? JSON.parse(discountCoupon.rule)
    : {}

  if (
    rule.order_amount_min != null &&
    price < Number(rule.order_amount_min)
  ) {
    return 0
  }

  let discount = 0

  switch (discountCoupon.discount_type) {
    case 'percentage':
      discount = Math.round(
        (price * Number(discountCoupon.discount_value)) / 100
      )
      break

    case 'fixed':
      discount = Number(discountCoupon.discount_value)
      break
  }

  if (discountCoupon.discount_max != null) {
    discount = Math.min(
      discount,
      Number(discountCoupon.discount_max)
    )
  }

  return Math.min(discount, price)
}

  const calculateTotalDiscount = (items: CartItem[]) =>
    items.reduce((sum, item) => sum + Number(item.product_discount || 0), 0)

  // [Medthod] - จัดการค่าจัดส่ง
  
  const getShippingCost = () => {
  const totalDelivery = sumAllWithCondition(
    cartItems,
    'product_sell',
    'sent_type',
    'delivery'
  )

  if (totalDelivery === 0) return 0

  return totalDelivery > 700 ? 0 : 50
}

  const buffetPrices: Record<string, number> = {
    buffet299: 299,
    buffet349: 349,
    buffet399: 399,
    buffet499: 499,
    buffet699: 699,
  }

  const getActualTotalPrice = () => {
    const shippingCost = getShippingCost()
    const totalPrice = getTotalSellPrice()

    return totalPrice + shippingCost - calculateCouponDiscount(totalPrice)
  }

  const getNetTotalPrice = () => {
    const buffetPrice = buffetPrices[sentType]
    const shippingCost = getShippingCost()
    const totalPrice = getTotalSellPrice()

    if (buffetPrice) {
      return buffetPrice
    }

    return totalPrice + shippingCost - calculateCouponDiscount(getTotalSellPrice())
  }

  const renderer = ({ completed, total }: CountdownRenderProps) => {
    if (completed) {
      setOpenPaymentEDC(false)
      setLoadFilterSubmit(false)
      toast.error('หมดเวลาในการชำระเงิน กรุณาทำรายการใหม่')
      return <span>หมดเวลา</span>
    } else {
      const totalSeconds = Math.ceil(total / 1000)
      return <span>{totalSeconds} วินาที</span>
    }
  }

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
      case OrderSentType.BUFFET_349:
        return 'บุฟเฟ่ต์349'
      case OrderSentType.BUFFET_399:
        return 'บุฟเฟ่ต์399'
      case OrderSentType.BUFFET_499:
        return 'บุฟเฟ่ต์499'
      case OrderSentType.BUFFET_699:
        return 'บุฟเฟ่ต์699'
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

  const searchCustomer = async (keyword: any, prestationAddress?: any) => {
    if (!keyword) {
      setCustomerList([])
      return
    }

    try {
      const res = await api.get(`/customer/list?keywords=${keyword.phone}`)

      if (res.data.item && res.data.item.length > 0) {
        const customerList = [...res.data.item] // สำเนาข้อมูลลูกค้า

        // ถ้ามีข้อมูลที่อยู่จาก prestation ให้อัพเดทลูกค้าคนแรก
        if (prestationAddress && customerList[0]) {
          const updatedCustomer = {
            ...customerList[0],
            name: prestationAddress.customer_name,
            address: prestationAddress.address,
            province: prestationAddress.province,
            district: prestationAddress.district,
            sub_district: prestationAddress.sub_district,
            zip_code: prestationAddress.zip_code,
          }

          customerList[0] = updatedCustomer

          setSelectedCustomer(updatedCustomer)
        } else {
          setSelectedCustomer(customerList[0])
        }

        setCustomerList(customerList)
      } else {
        await onCreateCustomer(prestationAddress, keyword) // ถ้าไม่พบลูกค้า ให้สร้างใหม่
      }
    } catch (error) {
      setCustomerList([])
    }

    setCustomerSearch(keyword)
  }

  // สำหรับ input field
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

  const handleChangeEdit = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target

    let sanitized: string | number = value

    // field ที่เป็นตัวเลขเท่านั้น
    const numberFields = ['customer_phone']

    if (numberFields.includes(name)) {
      sanitized = value === null || value === 'null' || value === '' ? 0 : Number(value)
    }

    setSelectedCustomer((prevState: any) => ({
      ...prevState,
      [name]: sanitized,
    }))
  }

  // [Method] - เลือกวันเดือนปีเกิด
  const onDateChange = (value: any) => {
    setCustomer({ ...customer, bod: value })
  }


// [Method] - ลบสินค้าทั้งหมดในตะกร้า
const handleRemoveAll = () => {
  setCartItems([])
  setSentType('normal')
  setOpenDeleteAllCart(false)
}

// [Method] - ลบสินค้าในตะกร้า
const handleRemoveFromCart = () => {
  const newCartItems = cartItems.filter(
    (value: any) => value.product_id !== productDeleteId
  )

  setCartItems(newCartItems)

  if (newCartItems.length === 0) {
    setSentType('normal')
  }

  setOpenDeleteItemCart(false)
}

  const handleAddToCart = (item: CartItem) => {
    const currentTime = new Date()

    setCartItems((prevCart: CartItem[]) => {
      const existingItem = prevCart.find((ci: any) => Number(ci.product_id) === Number(item.product_id))

      let updatedCart: CartItem[]

      if (!existingItem) {
        const newItem: CartItem = {
          ...item,
          quantity: Number(item.quantity) || 1,
          product_price: Number(item.product_price),

          added_time: currentTime,
        }

        updatedCart = [...prevCart, recalculateItem(newItem)]
      } else {
        updatedCart = prevCart.map((ci: any) => {
          if (Number(ci.product_id) === Number(item.product_id)) {
            // ⭐ Partner ไม่เพิ่มจำนวน
            if (item.product_type === 'พาร์ทเนอร์') {
              return ci
            }

            // ⭐ สินค้าปกติ เพิ่มจำนวน
            return recalculateItem({
              ...ci,
              quantity: Number(ci.quantity) + 1,
              added_time: currentTime,
            })
          }

          // ⭐ สำคัญมาก!
          // สินค้าตัวอื่นต้อง return กลับไปด้วย
          return recalculateItem(ci)
        })
      }

      updatedCart.sort((a, b) => {
        if (a.product_id === item.product_id) return -1
        if (b.product_id === item.product_id) return 1
        return 0
      })

      return updatedCart
    })

    if (item.product_type === 'พาร์ทเนอร์') {
      const isAlreadyInCart = cartItems.some((ci: CartItem) => Number(ci.product_id) === Number(item.product_id))

      if (!isAlreadyInCart) {
        setPartnerProductId(Number(item.product_id))
        setEditPrice('')
        setOpenPartnerBook(true)
      }
    }
  }

  const handleDecrement = (item: CartItem) => {
    const newCart = cartItems
      .map((value: CartItem) => {
        if (value.product_id === item.product_id) {
          const newQuantity = Number(value.quantity) - 1
          if (newQuantity < 1) return null

          return recalculateItem({
            ...value,
            quantity: newQuantity,
          })
        }
        return recalculateItem(value)
      })
      .filter((value: any): value is CartItem => value !== null)

    setCartItems(newCart)
  }

  const handleIncrement = (item: CartItem) => {
    const newCart = cartItems.map((value: CartItem) => {
      if (value.product_id === item.product_id) {
        const newQuantity = Number(value.quantity) + 1

        return recalculateItem({
          ...value,
          quantity: newQuantity,
        })
      }
      return recalculateItem(value)
    })

    setCartItems(newCart)
  }

  // [Method] - จัดการกล่องข้อมความค้นหา
  const handleSearchInput = async (event: any) => {
    setProdSearch(event.target.value)

    // ตรวจสอบว่าค่าที่ป้อนเข้ามาเป็นตัวเลข 13 หลัก (Barcode) หรือไม่
    if (/^\d{13}$/.test(event.target.value) && event.key !== 'Enter') {
      setSearchType('Barcode')

      const res = await api.get(`/product/list?store_id=${store?.id}&barcode=${event.target.value}`)

      if (res.data.items.length > 0) {
        const product = res.data.items[0]

        setProductItem(res.data.items)

        const cloneItems = { ...product }

        handleAddToCart(cloneItems)

        setProdSearch('')
      } else {
        toast.error(res.data.msg)
        setProductItem([])
      }
    }
    // ตรวจสอบว่าค่าที่ป้อนเข้ามาเป็นตัวเลข 8 หลัก (MyStation) หรือไม่
    else if (event.target.value.length === 12) {
      setSearchType('MyStation')
    } else {
      setSearchType('Keywords')
    }
  }

  const onEnterSearchBook = async (event: any) => {
    if (event.key === 'Enter') {
      if (searchType === 'MyStation') {
        const res = await api.get(`/prestation/${prodSearch}`)
        if (res.data) {
          const itemList = res.data.items
          const sentType =
            res.data.type === 'recive_store' ? 'recive_store' : res.data.type === 'delivery' ? 'delivery' : 'normal'

          if (itemList && itemList.length > 0) {
            const productList = await Promise.all(
              itemList.map(async (item: any) => {
                const productRes = await api.get(`/product/list?store_id=${store?.id}&barcode=${item.pro_barcode}`)

                if (productRes.data.items.length > 0) {
                  let foundProduct = productRes.data.items[0]
                  foundProduct.quantity = item.pro_quantity ?? 1
                  return foundProduct
                }
                return null
              })
            )

            // กรองสินค้าที่หาเจอ และเพิ่มลงตะกร้า
            productList
              .filter((item) => item !== null)
              .forEach((item: any) => {
                handleAddToCart(item)
              })

            // สร้างข้อมูลที่อยู่จาก prestation
            const prestationAddress = {
              customer_name: res.data.name,
              address: res.data.address,
              province: res.data.province,
              district: res.data.district,
              sub_district: res.data.sub_district,
              zip_code: res.data.post_code,
              ref_source: 'CSAPP',
              ref_id: res.data._id,
            }

            // ค้นหาลูกค้าและอัพเดทที่อยู่
            await searchCustomer(res.data, prestationAddress)
            setSentType(sentType)
          } else {
            toast.error('ไม่พบข้อมูล MyStation')
          }
        } else {
          toast.error('ไม่พบข้อมูล MyStation')
        }
      } else {
        // ค้นหาด้วยคำค้นหาทั่วไป
        const res = await api.get(`/product/list?store_id=${store?.id}&keywords=${prodSearch}`)
        setProductItem(res.data.items)
      }

      setLoadFilter(false)
    }
  }

  const onClickSearch = async (event: any) => {
    setLoadFilter(true)

    if (searchType === 'MyStation') {
      const res = await api.get(`/prestation/${prodSearch}`)
      if (res.data) {
        const itemList = res.data.items
        const sentType =
          res.data.type === 'recive_store' ? 'recive_store' : res.data.type === 'delivery' ? 'delivery' : 'normal'

        if (itemList && itemList.length > 0) {
          const productList = await Promise.all(
            itemList.map(async (item: any) => {
              const productRes = await api.get(`/product/list?store_id=${store?.id}&barcode=${item.pro_barcode}`)

              if (productRes.data.items.length > 0) {
                let foundProduct = productRes.data.items[0]
                foundProduct.quantity = item.pro_quantity ?? 1
                return foundProduct
              }
              return null
            })
          )

          // กรองสินค้าที่หาเจอ และเพิ่มลงตะกร้า
          productList
            .filter((item) => item !== null)
            .forEach((item: any) => {
              handleAddToCart(item)
            })

          // สร้างข้อมูลที่อยู่จาก prestation
          const prestationAddress = {
            customer_name: res.data.name,
            address: res.data.address,
            province: res.data.province,
            district: res.data.district,
            sub_district: res.data.sub_district,
            zip_code: res.data.post_code,
            ref_source: 'CSAPP',
            ref_id: res.data._id,
          }

          // ค้นหาลูกค้าและอัพเดทที่อยู่
          await searchCustomer(res.data, prestationAddress)
          setSentType(sentType)
        } else {
          toast.error('ไม่พบข้อมูล MyStation')
        }
      } else {
        toast.error('ไม่พบข้อมูล MyStation')
      }
    } else if (searchType === 'Barcode') {
      const res = await api.get(`/product/list?store_id=${store?.id}&barcode=${prodSearch}`)
      if (res.data.items.length > 0) {
        setProductItem(res.data.items)

        const cloneItems = { ...res.data.items[0] }
        cloneItems.quantity = cloneItems.quantity || 1
        handleAddToCart(cloneItems)
        setProdSearch('')
      } else {
        toast.error(res.data.msg)
        setProductItem([])
      }
    } else {
      // ค้นหาด้วยคำค้นหาทั่วไป
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

  const handleSelectPayment = (payment: PaymentSelection) => {
    let method = ''

    if ('edcType' in payment) {
      method = payment.edcType
    } else {
      method = String(payment.id)
    }

    setPaymentMethod(method)

    if ('edcType' in payment || (payment as PaymentInfo).id === 5 || (payment as PaymentInfo).id === 6) {
      setRawAmount(formatBalance2(getNetTotalPrice()))
      setPaymentForm({ ...paymentForm, amount: getNetTotalPrice() })
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

  const getRecallList = async () => {
    const store = getLocalStorage(key.STORE)
    const res = await api.get(`/recall/datatable?store_id=${store.id}`)

    const filtered = res.data.data.filter((item: any) => item.return_tmp === 0)

    setNotificationList(filtered.length)
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
  const itemLess = cartItems.filter(
    (item: any) => Number(item.product_quantity) < item.quantity
  )

  const soldOut = cartItems.filter(
    (item: any) => Number(item.product_quantity) === 0
  )

  const buffetBook = cartItems.filter(
    (item: CartItem) => item.product_type !== 'บุฟเฟ่ต์'
  )

  const isBuffet = [
    'buffet299',
    'buffet349',
    'buffet399',
    'buffet499',
    'buffet699',
  ].includes(sentType)


  if (cartItems.length === 0) {
    toast.error('กรุณาเลือกสินค้า')
  } else if (itemLess.length > 0 && sentType === 'normal') {
    for (const item of itemLess) {
      toast.error(
        `สินค้า "${item.product_name}" มีจำนวนคงเหลือไม่เพียงพอ กรุณาเลือกการสั่งซื้อแบบ "รับที่ร้าน" หรือ "จัดส่งที่บ้าน"`
      )
    }
  } else if (soldOut.length > 0 && isBuffet) {
    for (const item of soldOut) {
      toast.error(`สินค้า "${item.product_name}" สินค้าหมด`)
    }
  } else if (isBuffet && buffetBook.length > 0) {
    for (const item of buffetBook) {
      toast.error(`สินค้า "${item.product_name}" ไม่ใช่บุฟเฟ่ต์`)
    }
  } else if (
    (sentType === 'recive_store' || sentType === 'delivery') &&
    selectedCustomer.id === 1
  ) {
    toast.error('กรุณาเลือกลูกค้า ที่ไม่ใช่ลูกค้าทั่วไป')
  } else if (
    sentType === 'delivery' &&
    (
      !selectedCustomer.province ||
      selectedCustomer.province === 'null' ||
      !selectedCustomer.sub_district ||
      selectedCustomer.sub_district === 'null'
    )
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

    delete selectedCustomer.birth_day
    selectedCustomer.updated_by = Number(currentUser?.id)
    selectedCustomer.store_id = Number(store?.id)

    const payload = {
      ...selectedCustomer,
      province:
        selectedCustomer.province === null || selectedCustomer.province === 'null' ? 0 : selectedCustomer.province,
      district:
        selectedCustomer.district === null || selectedCustomer.district === 'null' ? 0 : selectedCustomer.district,
      sub_district:
        selectedCustomer.sub_district === null || selectedCustomer.sub_district === 'null'
          ? 0
          : selectedCustomer.sub_district,
      zip_code:
        selectedCustomer.zip_code === null || selectedCustomer.zip_code === 'null' ? 0 : selectedCustomer.zip_code,
      address: selectedCustomer.address === null || selectedCustomer.address === 'null' ? '' : selectedCustomer.address,
    }

    const res = await api.put(`/customer/update/${selectedCustomer.id}`, payload)
    if (res && res.status === 200 && res.data.status === 'Success') {
      toast.success(res.data.msg)
      setOpenUpdateCustomer(false)
    } else {
      toast.error(res.data.msg)
    }
    setLoad({ status: false, text: '', percentage: 100 })
  }

  // ฟังก์ชันสำหรับสร้าง payload ลูกค้าใหม่
  const createCustomerPayload = (keyword: Customer, addressOptions: any[]) => {
    const transformedCustomer = transformAddress(keyword, addressOptions)

    const payload = {
      app: 'POS',
      name: transformedCustomer.name,
      email: transformedCustomer.email,
      phone: transformedCustomer.phone,
      bod:
        typeof transformedCustomer.bod === 'string'
          ? transformedCustomer.bod
          : dayjs(transformedCustomer.bod).format('YYYY-MM-DD'),
      address: transformedCustomer.address,
      sub_district: transformedCustomer.customer_subdistrict || transformedCustomer.sub_district,
      district: Number(transformedCustomer.customer_district || transformedCustomer.district),
      province: Number(transformedCustomer.customer_province || transformedCustomer.province),
      zip_code: transformedCustomer.customer_zipcode || transformedCustomer.zip_code,
      active: transformedCustomer.active || 0,
      created_by: transformedCustomer.created_by,
      store_id: transformedCustomer.store_id,
      ref_source: transformedCustomer.ref_source || 'POS',
    }

    return payload
  }

  const onCreateCustomer = async (prestationAddress?: any, keyword?: any) => {
    setLoad({ status: true, text: 'บันทึกข้อมูล...', percentage: 50 })

    const newCustomerData = {
      ...customer,
      created_by: Number(currentUser?.id),
      store_id: Number(store?.id),
      ...keyword,
      ...prestationAddress,
      ...(customer.bod ? { bod: dayjs(customer.bod).format('YYYY-MM-DD') } : {}),
    }

    const payload = createCustomerPayload(newCustomerData, address)

    try {
      const res = await api.post('/customer/create', payload)
      setLoad({ status: false, text: '', percentage: 100 })
      if (res.data.status === 'Success') {
        toast.success(res.data.msg)
        setOpenCreateCustomer(false)

        const phone = newCustomerData.phone
        const searchRes = await api.get(`/customer/list?keywords=${phone}`)

        const createdCustomer = searchRes.data.item?.find((c: any) => c.phone === phone)

        if (createdCustomer) {
          setSelectedCustomer(createdCustomer) // ✅ มี id พร้อมใช้แก้ไข
          setCustomerList((prev: any) => [...prev, createdCustomer])
        }

        setCustomer({ ...customer_seed })
      } else {
        toast.error(res.data.msg)
      }
    } catch (error) {
      setLoad({ status: false, text: '', percentage: 100 })
      toast.error('ไม่สามารถสร้างลูกค้าใหม่ได้')
    }
  }

  const transformAddress = (customer: any, addressData: any) => {
    if (!addressData || !Array.isArray(addressData)) return customer

    let provinceId: number | null = null
    let districtId: number | null = null
    let subDistrictId: string | null = null
    let zipCode: string = customer.zip_code || ''

    // หา province
    const provinceItem = addressData.find(
      (p: any) => p.label === customer.province || String(p.value) === String(customer.province)
    )
    if (provinceItem) {
      provinceId = Number(provinceItem.value)
      // หา district
      const districtItem = provinceItem.children?.find(
        (d: any) => d.label === customer.district || String(d.value) === String(customer.district)
      )
      if (districtItem) {
        districtId = Number(districtItem.value)
        // หา sub_district
        const subDistrictItem = districtItem.children?.find(
          (s: any) => s.label.split(' ')[0] === customer.sub_district || s.value.split(' ')[0] === customer.sub_district
        )
        if (subDistrictItem) {
          subDistrictId = subDistrictItem.value.split(' ')[0]
          zipCode = subDistrictItem.value.split(' ')[1]
        }
      }
    }

    return {
      ...customer,
      province: provinceId ?? 0,
      district: districtId ?? 0,
      sub_district: subDistrictId ?? '',
      zip_code: zipCode,
    }
  }

  const handleSavePrice = () => {
    if (partnerProductId === null) return

    const newPrice = Number(editPrice) || 0

    setCartItems((prevCart: CartItem[]) => {
      return prevCart.map((item) => {
        if (Number(item.product_id) !== Number(partnerProductId)) {
          return item
        }

        return {
          ...item,
          partner_price: newPrice,
          // ราคาที่กรอก = ราคาขายต่อชิ้น
          product_price: newPrice,

          // ราคาขายรวม
          product_sell: newPrice,
        }
      })
    })

    setOpenPartnerBook(false)
  }

  const onCreateOrder = async () => {
    let paymentMethodId = paymentMethod === 'edc-credit' ? '5' : paymentMethod === 'edc-qr' ? '6' : paymentMethod

    const fixedCustomer = transformAddress(selectedCustomer, address)
    const payload = orderPayload(
      fixedCustomer,
      paymentForm,
      newCartKey,
      paymentMethodId,
      getActualTotalPrice(),
      getShippingCost(),
      sentType,
      cToken,
      calculateCouponDiscount(getTotalSellPrice()),
      discount,
      promoCode
    )

    if (paymentForm.amount < payload.paid_amount) {
      toast.error('จำนวนเงินที่ได้รับน้อยกว่าราคาสินค้า')
      return
    }

    setLoadFilterSubmit(true)
    let edcInstance: EDCUtilWeb | null = null
    let edcResult: any = null

    try {
      const isEDC = paymentMethod === 'edc-credit' || paymentMethod === 'edc-qr'

      if (isEDC) {
        // ✅ ตรวจว่าอยู่ใน Browser และรองรับ Web Serial API
        if (typeof window === 'undefined' || !('serial' in navigator)) {
          toast.error('EDC payment is not supported in this environment')
          setLoadFilterSubmit(false)
          return
        }

        edcInstance = new EDCUtilWeb()
        const connected = await connectEDCDevice(edcInstance)
        if (!connected) {
          toast.error('ไม่สามารถเชื่อมต่อกับเครื่อง EDC ได้')
          setLoadFilterSubmit(false)
          return
        }

        setOpenPaymentEDC(true)

        // ✅ เริ่มทำรายการชำระเงิน
        edcResult = await edcInstance.processPayment(paymentForm.amount, paymentMethod)

        if (edcResult.status !== 'success') {
          toast.error(`การชำระผ่าน EDC ล้มเหลว: ${edcResult.message || 'Unknown EDC error'}`)
          setOpenPaymentEDC(false)
          return
        }

        toast.success('การชำระผ่าน EDC สำเร็จ', { duration: 2000 })
      }

      //✅ บันทึกคำสั่งซื้อหลังจากชำระสำเร็จ
      const orderRes = await api.post('/order', payload)
      setOrder(payload)
      setBillOrder(orderRes.data.data)
      setCouponInfo(orderRes.data.coupon)

      if (orderRes.data.status === 'Success') {
        const changeAmount = Math.abs(payload.paid_amount - paymentForm.amount)
        setPaymentForm({ amount: 0, change: changeAmount, remark: '' })
        setOpenPaymentEDC(false)
        setOpenChangeBalance(true)
        setCartItems([])
        setProductItem([])
        setRawAmount('')
        setProdSearch('')
        setSentType('normal')
        setOpenDialogCheckOut(false)
        setCToken('')
        setPromoCode('')
        setDiscountCoupon(null)
        setDiscount(0)
        setTimeStamp(Date.now())
        setPaymentMethod('')
        setPromoInput('')
        await getCustomerInit()
        toast.success('การสั่งซื้อสำเร็จ', { duration: 1000 })
      } else {
        toast.error(orderRes.data.msg)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการสั่งซื้อ'
      if (message.includes('EDC')) toast.error(`เกิดข้อผิดพลาดกับเครื่อง EDC: ${message}`)
      else if (message.includes('network') || message.includes('fetch'))
        toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย')
      else toast.error(message)
      setOpenPaymentEDC(false)
    } finally {
      setLoadFilterSubmit(false)
      if (edcInstance) {
        try {
          await edcInstance.disconnect()
        } catch {}
      }
    }
  }

  const connectEDCDevice = async (edcInstance: EDCUtilWeb): Promise<boolean> => {
    try {
      const serial = (navigator as any).serial
      if (!serial) {
        toast.error('Browser นี้ไม่รองรับ Web Serial API')
        return false
      }

      const ports = await edcInstance.getAllAvailablePorts()

      // --- (โค้ดส่วนเดิมของคุณต่อจากนี้) ---
      let selectedPort = null

      // ขั้นแรก: ลองหา port ที่เคยอนุญาต
      const pairedPorts = await serial.getPorts()
      if (pairedPorts.length > 0) {
        selectedPort = pairedPorts[0]
      } else {
        // ถ้าไม่มี → ให้ popup เลือกใหม่
        selectedPort = await serial.requestPort()
      }

      try {
        const pairedPorts = await serial.getPorts()
        selectedPort = pairedPorts[0]
      } catch (error) {}

      if (!selectedPort) {
        try {
          // ไม่กรองพอร์ต เพื่อให้เลือกได้ทุกอย่าง
          selectedPort = await serial.requestPort()
        } catch (error: any) {
          if (error.name === 'AbortError') toast.error('ยกเลิกการเลือกอุปกรณ์')
          else if (error.name === 'NotFoundError') toast.error('ไม่พบอุปกรณ์')
          else toast.error('เกิดข้อผิดพลาดขณะเลือกอุปกรณ์')
          return false
        }
      }

      if (!selectedPort) {
        toast.error('ไม่ได้เลือกอุปกรณ์')
        return false
      }

      edcInstance.port = selectedPort
      setConnectedPort(selectedPort)
      await edcInstance.connect()

      return true
    } catch (error) {
      console.error('[EDC] ❌ Error connecting:', error)
      toast.error('เกิดข้อผิดพลาดในการเชื่อมต่อ EDC')
      return false
    }
  }

  const handleChangeAmount = (e: { target: { value: string } }) => {
    const value = e.target.value.replace(/,/g, '')
    setRawAmount(value)
    const parsedValue = parseFloat(value)
    setPaymentForm({ ...paymentForm, amount: isNaN(parsedValue) ? 0 : parsedValue })
  }

  const newCartKey = cartItems.map((v: any) => {
    const price = v.partner_price ?? v.product_sell_price

    return {
      pro_id: v.product_id,

      pro_name: v.product_name,

      pro_price: price,

      pro_quantity: v.quantity,

      pro_discount: v.product_discount,

      pro_subtotal: price * v.quantity,

      pro_delivery: v.sent_type,

      pro_tax: 0,

      pro_tax_method: 'inclusive',
    }
  })
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
    const buffetPrice = buffetPrices[sentType] || null
    const totalPrice = getTotalSellPrice

    if (buffetPrice) {
      setDiscount(totalPrice() - buffetPrice)
    } else {
      setDiscount(calculateTotalDiscount(cartItems))
    }
  }, [cartItems])

  React.useEffect(() => {
    getNetTotalPrice()
  }, [discountCoupon])

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
    getRecallList()
    window.onafterprint = () => setOpenbill(false)
    return () => {
      window.onafterprint = null
    }
  }, [timeStamp])

  React.useEffect(() => {
    // ตรวจว่าอยู่ใน browser
    if (typeof window !== 'undefined' && 'serial' in navigator) {
      setIsBrowser(true)

      const serial = (navigator as any).serial

      // โหลด ports ที่เชื่อมต่ออยู่แล้ว
      serial.getPorts().then((ports: any[]) => {
        if (ports.length > 0) {
          setConnectedPort(ports[0])
        }
      })
    } else {
    }
  }, [isBrowser])


  return (
    <div>
      <style>{bill_slip.css}</style>
      <Head>
        <title>POS B</title>
        <meta name="description" content="homepage" />
        <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
        <meta http-equiv="Pragma" content="no-cache" />
        <meta http-equiv="Expires" content="0" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <LoadingScreen open={load.status} text={load.text} percentage={load.percentage} />

      <div className="main-container hide-on-print">
        <div className="left-container">
          <div className="left-container-header">
            <div style={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              {isAuthenticated && <StoreName text="Cashier" store={store?.name} currentUser={currentUser?.name} />}
              {notificationList > 0 && (
                <div
                  style={{
                    marginLeft: 'auto',
                    marginRight: 10,
                    backgroundColor: '#FFBC11',
                    padding: '5px 10px',
                    borderRadius: '20px',

                    gap: 5,
                  }}>
                  <Typography
                    onClick={() => router.push('/stock_out')}
                    style={{ textDecoration: 'underline', cursor: 'pointer' }}>
                    📥 มีหนังสือถูกเรียกเก็บ
                  </Typography>
                </div>
              )}
            </div>
            <div className="flex mt-10">
              <Search className="bg-white rounded-20 flex items-center" style={{ height: 40, width: '80%' }}>
                <SearchIconWrapper>
                  <Search />
                </SearchIconWrapper>
                <InputBase
                  className="input"
                  sx={{ ml: 2, fontSize: '16px' }}
                  inputProps={{ 'aria-label': 'search' }}
                  placeholder={searchPlaceholder}
                  value={prodSearch}
                  onKeyUp={onEnterSearchBook}
                  onChange={handleSearchInput}
                />

                <IconButton className="text-gray" onClick={() => setProdSearch('')}>
                  <ClearOutlined />
                </IconButton>
              </Search>
              <Button
                disabled={prodSearch === ''}
                color="primary"
                loading={loadFilter}
                startIcon={<SearchOutlined />}
                variant="contained"
                className="btn-confirm"
                onClick={onClickSearch}>
                <Typography>ค้นหา</Typography>
              </Button>
            </div>
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
                  productItems.map((row: any) => {
                    const isPartner = row.product_type === 'พาร์ทเนอร์'

                    const isPartnerInCart =
                      isPartner &&
                      cartItems.some(
                        (item: any) =>
                          Number(item.product_id) === Number(row.product_id) && item.product_type === 'พาร์ทเนอร์'
                      )

                    return (
                      <Card
                        style={{
                          gap: 5,
                          borderRadius: 20,
                        }}
                        className="flex justify-between w-full p-10 mt-10"
                        key={row.product_id}>
                        <div>
                          <Typography sx={{ fontSize: '14px' }}>{row.product_barcode}</Typography>
                        </div>

                        <div className="w-99">
                          <Typography className="ellipsis">{row.product_name}</Typography>
                        </div>

                        <CardActions className="w-10">
                          <Button
                            className="btn-confirm"
                            color="primary"
                            variant="contained"
                            disabled={isPartnerInCart}
                            onClick={() => {
                              handleAddToCart(row)
                            }}>
                            <Typography>{formatBalance(row.product_price)}</Typography>
                          </Button>
                        </CardActions>

                        <IconButton
                          style={{ marginLeft: 5 }}
                          onClick={() => getProductDetail(row)}
                          className="rounded-20 justify-end">
                          <MoreVertOutlined />
                        </IconButton>
                      </Card>
                    )
                  })
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
            <div className="card-header flex justify-between">
              <div className="bg-gray flex justify-between rounded-20 items-center w-full">
                <AccountCircle className="text-gray ml-10" />
                {initialCustomer && (
                  <Autocomplete
                    className="w-full"
                    size="small"
                    options={customerList}
                    getOptionLabel={(option: any) => {
                      if (option.name === 'ลูกค้าทั่วไป') return ''

                      const prefix = option.ref_source === 'CSAPP' ? '(M) ' : ''

                      return `${prefix}${option.phone} ${option.name}`
                    }}
                    renderOption={(props, option: any) => {
                      const prefix = option.ref_source === 'CSAPP' ? '(M)' : '\u00A0'.repeat(6)

                      return (
                        <li {...props}>
                          {prefix} {option.phone} {option.name}
                        </li>
                      )
                    }}
                    onChange={async (_, value: any) => {
                      if (value) {
                        setSelectedCustomer(value)
                        const res = await api.get(`/customer/info/${value.id}`)
                        if (res && res.status === 200 && res.data.status === 'Success') {
                          setSelectedCustomer((prev) => ({
                            ...prev!,
                            province: String(res.data.data[0].province),
                            district: String(res.data.data[0].district),
                            sub_district: String(res.data.data[0].sub_district),
                            zip_code: res.data.data[0].zip_code,
                            birth_day: res.data.data[0].birth_day,
                            address: res.data.data[0].address,
                          }))
                        }
                      } else {
                        // ✅ เมื่อกดกากบาท → กลับไปเป็นลูกค้าทั่วไป (id = 1)
                        if (initialCustomer && initialCustomer.item && initialCustomer.item[0]) {
                          setSelectedCustomer(initialCustomer.item[0])
                        }
                      }
                    }}
                    value={selectedCustomer}
                    renderInput={(params) => (
                      <TextField
                        placeholder='ค้นหา "ชื่อ หรือ เบอร์โทรศัพท์" ลูกค้า'
                        sx={{
                          width: '100%',
                          '& .MuiOutlinedInput-root': {
                            '& fieldset': { border: 'none' },
                          },
                        }}
                        onChange={onSearchCustomer}
                        {...params}
                      />
                    )}
                    clearOnEscape
                    clearOnBlur
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
            <div className="scroll overflow-x-hidden h-full">
              {cartItems.length > 0 && (
                <div className="justify-between items-center mt-3">
                  <FormControl className="justify-start">
                    <Select
                      onChange={handleChangeSentType}
                      value={sentType}
                      displayEmpty
                      input={<SelectInputBase id="select-multiple-chip" />}
                      sx={{
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
                      <MenuItem value={OrderSentType.BUFFET_299}>
                        {getTextOrderSentType(OrderSentType.BUFFET_299)}
                      </MenuItem>
                      <MenuItem value={OrderSentType.BUFFET_349}>
                        {getTextOrderSentType(OrderSentType.BUFFET_349)}
                      </MenuItem>
                      <MenuItem value={OrderSentType.BUFFET_399}>
                        {getTextOrderSentType(OrderSentType.BUFFET_399)}
                      </MenuItem>
                      <MenuItem value={OrderSentType.BUFFET_699}>
                        {getTextOrderSentType(OrderSentType.BUFFET_699)}
                      </MenuItem>
                    </Select>
                  </FormControl>
                  <Typography
                    onClick={(_) => setOpenDeleteAllCart(true)}
                    sx={{
                      width: 150,
                      fontSize: '14px',

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
                  const shouldHighlight =
                    (sentType === 'buffet299' ||
                      sentType === 'buffet399' ||
                      sentType === 'buffet349' ||
                      sentType === 'buffet499' ||
                      sentType === 'buffet699') &&
                    !isBuffet

                  return (
                    <div
                      className="bg-gray rounded-20 mt-10 "
                      key={index}
                      style={shouldHighlight ? { border: '2px solid red' } : {}}>
                      <div className="justify-between p-10">
                        <Typography className="ellipsis3">{item.product_name}</Typography>
                        <div className="justify-between items-center">
                          <IconButton
                            onClick={() => {
                              setOpenDeleteItemCart(true)
                              setProductDeleteId(item.product_id)
                            }}>
                            <DeleteOutlineOutlined />
                          </IconButton>
                          <IconButton
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

                          <Typography>{parseInt(item.quantity)}</Typography>

                          <IconButton
                            disabled={item.product_type === 'พาร์ทเนอร์'}
                            onClick={() => handleIncrement(item)}>
                            <AddCircleOutline />
                          </IconButton>

                          <Typography>{formatBalance(parseFloat(item.product_price))}</Typography>
                        </div>
                      </div>
                      <div className="justify-between p-10">
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

            <div className="justify-between">
              <div className="card-footer-left">
                <Typography sx={{ fontSize: '16px' }}>รหัสโปรโมชั่น</Typography>
                <Typography sx={{ fontSize: '16px' }}>รวมทั้งหมด</Typography>

                <Typography sx={{ fontSize: '16px' }}>ส่วนลด</Typography>
                <Typography sx={{ fontSize: '16px' }}>ส่วนลดโปรโมชั่น</Typography>

                <Typography sx={{ fontSize: '16px' }}>ค่าจัดส่ง</Typography>
              </div>

              <div className="card-footer-right">
                <div style={{ justifyContent: 'space-between', display: 'flex', gap: 5 }}>
                  <div
                    style={{
                      justifyContent: 'space-between',
                      display: 'flex',
                      border: '1px #CCCCCC solid',
                      borderRadius: 10,
                      paddingLeft: 5,
                      paddingRight: 5,
                    }}>
                    <InputBase
                      className="input-base"
                      placeholder="กรอกรหัสโปรโมชั่น"
                      inputProps={{
                        'aria-label': 'กรอกรหัสโปรโมชั่น',
                      }}
                      value={promoInput}
                      onChange={handlePromoChange}
                    />
                    {promoInput !== '' && (
                      <IconButton
                        style={{ padding: 0 }}
                        onClick={() => {
                          setPromoInput('')
                          setPromoCode('')
                          setDiscountCoupon(null)
                        }}>
                        <ClearOutlined />
                      </IconButton>
                    )}
                  </div>
                  <Button
                    disabled={cartItems.length === 0 || promoInput === ''}
                    variant="contained"
                    color="info"
                    style={{ borderRadius: 10 }}
                    onClick={() => getCoupon(promoInput)}>
                    ใช้
                  </Button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', width: '50%' }}>
                  <div>
                    <Typography sx={{ fontSize: '16px' }}>{getTotalQuantity}</Typography>
                  </div>
                  <div>
                    <Typography sx={{ fontSize: '16px' }}>{formatBalance(getTotalPrice())}</Typography>
                  </div>
                </div>

                <Typography color={discount !== 0 ? 'primary' : 'inherit'}>{formatBalance(discount)}</Typography>

                <Typography color={calculateCouponDiscount(getTotalSellPrice()) !== 0 ? 'primary' : 'inherit'}>
                  {calculateCouponDiscount(getTotalSellPrice()) !== 0 && '-'}
                  {formatBalance(calculateCouponDiscount(getTotalSellPrice()))}
                </Typography>

                <Typography sx={{ fontSize: '16px' }}>{formatBalance(getShippingCost())}</Typography>
              </div>
            </div>

            <Typography sx={{ fontSize: '16px', ml: 2 }}>ยอดรวมที่ต้องชำระ</Typography>
            <div style={{ textAlign: 'center' }}>
              <Button
                className="btn-confirm w-full"
                variant="contained"
                disabled={getTotalQuantity === 0}
                onClick={preCheckOut}>
                <Typography sx={{ fontSize: '60px' }}>{formatBalance(getNetTotalPrice())}</Typography>
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
          slotProps={{
            paper: {
              style: {
                borderRadius: 20,
              },
            },
          }}
          fullWidth={true}
          maxWidth={maxWidth}
          open={openDialogCheckOut}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <div style={{ width: '93%' }}>
              <DialogTitle id="alert-dialog-title">
                <Typography sx={{ fontSize: '16px' }}>รายละเอียดคำสั่งซื้อ</Typography>
              </DialogTitle>
            </div>
            <div>
              <IconButton onClick={handleCloseChkout} sx={{ mt: 1 }}>
                <ClearOutlined sx={{ color: '#FE5454' }} />
              </IconButton>
            </div>
          </div>

          <DialogContent sx={{ m: 0, overflowY: 'initial' }}>
            <div className="justify-between">
              <div className="w-full">
                <CheckOutOrder
                  cart={cartItems}
                  SentType={sentType}
                  address={address}
                  selectedCustomer={selectedCustomer}
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

              <div className="pl-20">
                <div className="payment-select">
                  <PaymentSelector
                    paymentList={paymentList}
                    onSelect={handleSelectPayment}
                    edcConnect={connectedPort}
                  />
                </div>
                <div className="justify-between">
                  <div className="chk-container-right chkout-left">
                    <Typography>รหัสโปรโมชั่น</Typography>
                    <Typography>รวมทั้งหมด ({getTotalQuantity})</Typography>

                    <Typography>ส่วนลด</Typography>
                    <Typography>ส่วนลดโปรโมชั่น</Typography>
                    <Typography>ค่าส่ง</Typography>
                    <Typography style={{ fontSize: 20 }}>ยอดรวมที่ต้องชำระ</Typography>
                  </div>
                  <div className="text-right">
                    <Typography>&nbsp;{promoCode}</Typography>
                    <Typography>{formatBalance(getTotalPrice())}</Typography>

                    {discount === 0 ? (
                      <Typography>{formatBalance(discount)}</Typography>
                    ) : (
                      <Typography color="primary">-{formatBalance(discount)}</Typography>
                    )}

                    {calculateCouponDiscount(getTotalSellPrice()) === 0 ? (
                      <Typography>{formatBalance(calculateCouponDiscount(getTotalSellPrice()))}</Typography>
                    ) : (
                      <Typography color="primary">
                        -{formatBalance(calculateCouponDiscount(getTotalSellPrice()))}
                      </Typography>
                    )}
                    <Typography>{formatBalance(getShippingCost())}</Typography>
                    <Typography style={{ fontSize: 20 }}>{formatBalance(getNetTotalPrice())}</Typography>
                  </div>
                </div>

                <div className="justify-between mt-10">
                  <div
                    style={{
                      width: '70%',
                      display: 'grid',
                      gap: 10,
                      alignItems: 'start',
                    }}>
                    <div className="justify-between">
                      <Typography sx={{ fontSize: 14, mt: 2, width: '30%' }}>จำนวนเงินที่ได้รับ</Typography>

                      <div className="bg-gray rounded-lg w-60 items-center flex ">
                        <InputBase
                          className="input-base"
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
                      <div className="bg-gray rounded-lg w-full">
                        <InputBase
                          className="input-base"
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
                      className="btn-confirm w-full h-full"
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
              <Typography>{cToken}</Typography>
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
          <div style={{ display: 'flex', justifyContent: 'center', padding: 10 }}>
            <Lottie options={loadingAnimationSuccess} height={150} width={150} />
          </div>
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
          slotProps={{
            paper: {
              style: {
                padding: 10,
              },
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
            type={order?.delivery_type}
            date_time={dayjs().format('DD/MM/YYYY HH:mm')}
            customer_name={order?.customer_name}
            customer_phone={order?.customer_mobile}
            customer_address={order?.customer_address}
            items={order?.item_list}
            sent_type={order?.delivery_type}
            total_items={order?.pro_qty}
            subtotal={order?.sub_total}
            discount_coupon={order?.discount_coupon}
            coupon={couponInfo}
            delivery_type={order?.delivery_type}
            discount_other={order?.discount_other}
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

        <Dialog
          open={openPaymentEDC}
          slotProps={{
            paper: { style: { borderRadius: 20 } },
          }}>
          {paymentMethod === 'edc-credit' ? (
            <div>
              {' '}
              <DialogTitle style={{ marginTop: 20, textAlign: 'center' }}>
                <Typography fontSize={18}>แตะบัตร เสียบบัตร หรือรูดได้ที่เครื่อง EDC</Typography>
              </DialogTitle>
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography fontWeight={400}>กรุณาชำระเงินภายใน</Typography>
                <Countdown date={Date.now() + 180000} renderer={renderer} />

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Image
                    style={{ justifyContent: 'center' }}
                    priority
                    src={mypic}
                    rel="preload"
                    width={200}
                    height={220}
                    alt=""
                  />
                </div>
                <Typography fontSize={14}>
                  <ErrorOutlineRounded />
                  &nbsp;กรุณาอย่าออกจากหน้านี้ ระบบกำลังดำเนินการชำระเงิน
                </Typography>
              </DialogContent>
            </div>
          ) : (
            <>
              {' '}
              <DialogTitle style={{ marginTop: 20, textAlign: 'center' }}>
                <Typography fontSize={18}>สแกน QR พร้อมเพย์ ที่เครื่องedc</Typography>
              </DialogTitle>
              <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <Typography fontWeight={400}>กรุณาชำระเงินภายใน</Typography>
                <Countdown date={Date.now() + 180000} renderer={renderer} />

                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <Image
                    style={{ justifyContent: 'center' }}
                    priority
                    src={mypic}
                    rel="preload"
                    width={200}
                    height={220}
                    alt=""
                  />
                </div>
                <Typography fontSize={14}>
                  <ErrorOutlineRounded />
                  &nbsp;กรุณาอย่าออกจากหน้านี้ ระบบกำลังดำเนินการชำระเงิน
                </Typography>
              </DialogContent>
            </>
          )}
        </Dialog>

        <Dialog
          open={openPartnerBook}
          onClose={() => setOpenPartnerBook(false)}
          maxWidth="xs"
          fullWidth
          slotProps={{
            paper: {
              sx: {
                borderRadius: 4,
                px: 1,
                pb: 1,
              },
            },
          }}>
          <DialogTitle
            sx={{
              pb: 1,
              pt: 2.5,
            }}>
            <Typography
              sx={{
                fontSize: 22,
                fontWeight: 700,
              }}>
              บันทึกราคาขาย
            </Typography>
          </DialogTitle>

          <DialogContent sx={{ pt: '12px !important' }}>
            {/* ชื่อสินค้า */}
            <div
              style={{
                background: '#F5F5F5',
                borderRadius: 12,
                padding: '12px 14px',
                marginBottom: 16,
                display: 'flex',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <Typography>📚ชื่อสินค้า&nbsp;:&nbsp;</Typography>
              <Typography
                sx={{
                  fontSize: 15,
                  fontWeight: 600,
                  lineHeight: 1.5,
                }}>
                {productItems?.find((item: any) => Number(item.product_id) === Number(partnerProductId))?.product_name}
              </Typography>
            </div>

            {/* ราคา */}
            <Typography
              sx={{
                fontSize: 14,
                fontWeight: 600,
                mb: 0.8,
              }}>
              ราคาขาย
            </Typography>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#F7F7F7',
                border: '1.5px solid #E0E0E0',
                borderRadius: 14,
                height: 38,
                padding: '4px 14px',
                transition: '0.2s',
              }}>
              <InputBase
                autoFocus
                className="input-base"
                placeholder="0"
                value={editPrice}
                onChange={(e) => {
                  setEditPrice(e.target.value.replace(/\D/g, ''))
                }}
                sx={{
                  flex: 1,
                  fontSize: 28,
                  fontWeight: 700,
                  py: 1,
                }}
                inputProps={{
                  'aria-label': 'จำนวนเงิน',
                  inputMode: 'numeric',
                  style: {
                    textAlign: 'right',
                  },
                }}
              />

              <Typography
                sx={{
                  fontSize: 18,
                  fontWeight: 600,
                  color: '#777',
                  ml: 1,
                }}>
                ฿
              </Typography>
            </div>
          </DialogContent>

          <DialogActions
            sx={{
              px: 3,
              pb: 2.5,
              pt: 1,
            }}>
            <Button
              fullWidth
              variant="contained"
              disabled={!editPrice || Number(editPrice) <= 0}
              onClick={handleSavePrice}
              sx={{
                height: 48,
                borderRadius: 3,
                fontSize: 16,
                fontWeight: 600,
                boxShadow: 'none',
              }}>
              บันทึกราคา
            </Button>
          </DialogActions>
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
