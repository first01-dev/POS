import TemplateBillSlip from '@/components/dialogs/TemplateBillSlipB'
import { StoreName } from '@/components/StoreName'
import { key } from '@/models/constants'
import { BillItems, Officer, OrderInfo, ProductItem } from '@/models/type'
import { api } from '@/services/AxiosUtils'
import { sumAll } from '@/services/MathUtils'
import { getLocalStorage } from '@/services/StorageUtils'
import { Search, SearchIconWrapper, StyledTableCell, StyledTableRow } from '@/services/StyleUtils'
import {
  ClearOutlined,
  Close,
  DeleteForeverOutlined,
  Print,
  ReceiptLongRounded,
  SearchOutlined,
} from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
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
import dayjs from 'dayjs'
import jwtDecode from 'jwt-decode'
import Head from 'next/head'
import router from 'next/router'
import React from 'react'
import toast from 'react-hot-toast'

export default function RecordBuffet() {
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [openProduct, setOpenProduct] = React.useState(false)
  const [loadFilter, setLoadFilter] = React.useState(false)
  const [openBill, setOpenBill] = React.useState(false)
  const [open, setOpen] = React.useState(false)

  const [store, setStore] = React.useState<any>({})

  const [currentUser, setCurrentUser] = React.useState<Officer>()
  const [selectedList, setSelectedList] = React.useState<ProductItem[]>([])
  const [orderInfo, setOrderInfo] = React.useState<OrderInfo[]>([])
  const [order, setOrder] = React.useState<any>({})
  const [dataOrder, setDataOrder] = React.useState<any>({})
  const [productOrder, setProductOrder] = React.useState<{
    order_items: BillItems[]
  }>({
    order_items: [],
  })

  const [recordData, setRecordData] = React.useState({
    buffet_type: '',
    order_num: '',
  })

  const [keyword, setKeyword] = React.useState('')
  const [receiptKeyword, setReceiptKeyword] = React.useState('')

  const [openRemoveItem, setOpenRemoveItem] = React.useState(false)
  const [openReset, setOpenReset] = React.useState(false)
  const [selectedRemoveId, setSelectedRemoveId] = React.useState<number | null>(null)

  const totalQuantity = () => {
    return sumAll(selectedList, 'quantity')
  }

  const hasInvalidProduct = selectedList.some((item) => item.product_type !== 'บุฟเฟ่ต์')

  const isSaveDisabled = selectedList.length === 0 || hasInvalidProduct

  // [Method] - จัดการกล่องข้อมความค้นหา
  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value.replace(/\D/g, '') // เอาเฉพาะตัวเลข
    setKeyword(value)
  }

  const handleInputQuantity = (value: string, productId: number) => {
    setSelectedList((prev) =>
      prev.map((item) => (item.product_id === productId ? { ...item, quantity: parseInt(value) || 0 } : item))
    )
  }

  /* ================= RESET ================= */

  const handleReset = () => {
    setRecordData({ buffet_type: '', order_num: '' })
    setSelectedList([])
    setKeyword('')
    setReceiptKeyword('')
    setOpenReset(false)
  }

  /* ================= SEARCH RECEIPT ================= */

  const isValidReceiptFormat = (value: string) => {
    const pattern = /^\d+\/\d+$/
    return pattern.test(value)
  }

  const hasReceipt = !!recordData.order_num

  const handleSearchReceipt = async () => {
    if (!isValidReceiptFormat(receiptKeyword)) return

    try {
      const orders = await getOrderList()

      if (!orders.length) {
        toast.error('ไม่พบใบเสร็จ')

        // 👇 เคลียร์ state
        setOrderInfo([])
        setRecordData((prev) => ({
          ...prev,
          order_num: '',
        }))

        return
      }

      const order = orders[0]

      if (!['buffet299', 'buffet399', 'buffet399', 'buffet699'].includes(order.type)) {
        toast.error('ไม่ใช่รายการบุฟเฟ่ต์')

        setOrderInfo([])
        setRecordData((prev) => ({
          ...prev,
          order_num: '',
        }))

        return
      }

      if (order.total_item > 1) {
        toast.error('ใบเสร็จนี้ทำรายการแล้ว')

        setOrderInfo([])
        setRecordData((prev) => ({
          ...prev,
          order_num: '',
        }))

        return
      }

      // ✅ ผ่านทุกเงื่อนไข
      setOrderInfo(orders)
      setRecordData((prev) => ({
        ...prev,
        order_num: receiptKeyword,
      }))

      toast.success('พบใบเสร็จบุฟเฟ่ต์')
    } catch (error) {
      toast.error('ไม่พบใบเสร็จ')

      setOrderInfo([])
      setRecordData((prev) => ({
        ...prev,
        order_num: '',
      }))
    }
  }

  const handleRemoveItem = () => {
    if (!selectedRemoveId) return

    setSelectedList((prev) => prev.filter((item) => item.product_id !== selectedRemoveId))

    setOpenRemoveItem(false)
    setSelectedRemoveId(null)
  }

  const onSaveRecord = async () => {
    try {
      if (!recordData.order_num) {
        toast.error('กรุณาค้นหาใบเสร็จ')
        return
      }

      if (selectedList.length === 0) {
        toast.error('กรุณาเลือกสินค้า')
        return
      }

      const payload = {
        buffet_type: orderInfo[0]?.type,
        order_num: recordData.order_num,
        item_list: selectedList.map(({ product_type, ...rest }) => rest),
      }

      const resPost = await api.post('/buffetcoll/create', payload)

      if (resPost.data?.error) {
        toast.error(resPost.data.error)
        return
      }

      const orderList = await getOrderList()

      const found = orderList.find((order: any) => order.invoice_number === recordData.order_num)

      if (found) {
        showBillReceipt(found.id)
      } else {
        toast.error('ไม่พบ order นี้')
      }

      toast.success('บันทึกรายการสำเร็จ')
      handleReset()
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'บันทึกไม่สำเร็จ')
    }
  }

  const getOrderList = async () => {
    const res = await api.get(`/order/datatable?store_id=${store.id}&invoice=${receiptKeyword}`)

    return res.data?.data || []
  }

  const showBillReceipt = async (orderId: any) => {
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
    if (keyword.length !== 13) return

    const fetchProduct = async () => {
      try {
        const searchParam = {
          barcode: keyword,
          length: 1000,
        }

        const res = await api.get(`/store/stock/${store.id}`, {
          params: searchParam,
        })

        if (res.data.data[0].product_type !== 'บุฟเฟ่ต์') {
          toast.error(`"${res.data.data[0].product_name}" ไม่ใช่บุฟเฟ่ต์`)
          setKeyword('')
       
        }
        if (res.data.data.length === 0) {
          toast.error('ไม่มีสินค้าในสาขา')
          setKeyword('')
          return
        }

        const productData = res.data.data[0]

        if (parseInt(productData.product_quantity) === 0) {
          toast.error('ไม่มีสินค้าในสต็อก')
          setKeyword('')
          return
        }

        const newData: ProductItem = {
          product_id: parseInt(productData.product_id),
          pro_quantity: parseInt(productData.product_quantity),
          product_barcode: productData.product_barcode,
          product_name: productData.product_name,
          product_code: productData.product_ref_code,
          product_price: parseInt(productData.product_price),
          sell_price: parseInt(productData.product_sell_price),
          quantity: 1,
          product_type: productData.product_type,
        }

        setSelectedList((prev) => {
          const exist = prev.find((item) => item.product_id === newData.product_id)

          if (exist) {
            // เพิ่มจำนวน + ย้ายขึ้นบน
            const updated = prev.map((item) =>
              item.product_id === newData.product_id ? { ...item, quantity: (item.quantity ?? 0) + 1 } : item
            )

            const target = updated.find((item) => item.product_id === newData.product_id)
            const others = updated.filter((item) => item.product_id !== newData.product_id)

            return [target!, ...others]
          }

          // ของใหม่ → ขึ้นบนสุด
          return [newData, ...prev]
        })

        setKeyword('')
      } catch (error) {
        console.error(error)
        toast.error('เกิดข้อผิดพลาด')
      }
    }

    fetchProduct()
  }, [keyword])

  React.useEffect(() => {
    const token = getLocalStorage(key.TOKEN)
    const store = getLocalStorage(key.STORE)

    if (!token) {
      router.push('/')
      return
    }

    try {
      const user: Officer = jwtDecode(token)
      setCurrentUser(user)

      if (store) {
        setStore(store)

        setIsAuthenticated(true)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Invalid token:', error)
      router.push('/')
    }
  }, [])

  React.useEffect(() => {
    if (isValidReceiptFormat(receiptKeyword)) {
      handleSearchReceipt()
    }
  }, [receiptKeyword])

  React.useEffect(() => {
    setOrderInfo([])
    setRecordData((prev) => ({
      ...prev,
      order_num: '',
    }))
  }, [receiptKeyword])
  return (
    <div>
      <Head>
        <title>POS</title>
        <meta name="description" content="blank" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div>
        {isAuthenticated && (
          <StoreName
            text="Buffet Collection"
            icon={<ReceiptLongRounded />}
            store={store?.name}
            currentUser={currentUser?.name}
          />
        )}

        <div className="w-50">
          <div
            className="w-full flex justify-between bg-gray rounded-20 p-10 mb-20 mt-20 items-center"
            style={{ gap: 10, height: 70 }}>
            <Typography className="w-40">ค้นหาเลขที่ใบเสร็จ</Typography>

            <Search className="input items-center" style={{ width: '80%' }}>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              <InputBase
                className="input-base"
                value={receiptKeyword}
                onChange={(e) => setReceiptKeyword(e.target.value)}
                placeholder="เลขที่ใบเสร็จ"
                inputProps={{ 'aria-label': 'search' }}
              />
              <IconButton onClick={() => setReceiptKeyword('')}>
                <ClearOutlined style={{ paddingRight: 5 }} />
              </IconButton>
            </Search>

            <Button
              disabled={receiptKeyword === ''}
              color="primary"
              startIcon={<SearchOutlined />}
              variant="contained"
              className="btn-confirm p-10"
              onClick={handleSearchReceipt}>
              <Typography sx={{ fontSize: '14px' }}>ค้นหา</Typography>
            </Button>
          </div>
        </div>

        {/* ===== SHOW MESSAGE IF NO RECEIPT ===== */}
        {!hasReceipt && (
          <div
            style={{
              backgroundColor: '#F1F1F1',
              padding: 30,
              borderRadius: 10,
              textAlign: 'center',
            }}>
            <Typography>ค้นหาเลขที่ใบเสร็จเพื่อบันทึกรายการ Buffet</Typography>
          </div>
        )}
        {/* ===== SHOW TABLE IF HAS RECEIPT ===== */}
        {hasReceipt && (
          <div
            style={{
              width: '100%',
              height: 'calc(100vh - 190px)',
              border: '1px #F1F1F1 solid',
              borderRadius: 20,
              overflow: 'hidden',
            }}>
            <div className="bg-gray  p-10 mb-20" style={{ gap: 2 }}>
              <div className="justify-start flex items-center w-90 ml-20">
                <Typography className="w-50">เลขที่ใบเสร็จ : {recordData.order_num}</Typography>
                <Typography className="w-40">จำนวนทั้งหมด : {totalQuantity()}</Typography>
                <Typography className="w-20">ค้นหาสินค้า</Typography>
                <Search className="input" style={{ height: 40 }}>
                  <SearchIconWrapper>
                    <Search />
                  </SearchIconWrapper>
                  <InputBase
                    className="input-base"
                    value={keyword}
                    placeholder="Barcode"
                    onChange={handleSearchInput}
                    inputProps={{ 'aria-label': 'search' }}
                  />
                </Search>
              </div>
            </div>
            <div className="boxitemlist">
              <TableContainer
                component={Paper}
                sx={{
                  height: 'calc(100vh - 340px)',
                  width: '100%',
                  borderRadius: '0px',
                  border: 'none',
                  overflowX: 'hidden',
                  boxShadow: 'none',
                }}>
                <Table aria-label="customized table">
                  <TableHead>
                    <TableRow>
                      <StyledTableCell align="center" sx={{ pl: 10 }}>
                        <Typography>Barcode</Typography>
                      </StyledTableCell>
                      <StyledTableCell className="thead-text" align="center" sx={{ width: '500px' }}>
                        <Typography>ชื่อสินค้า</Typography>
                      </StyledTableCell>

                      <StyledTableCell sx={{ width: '500px' }} className="thead-text" align="center">
                        <Typography>จำนวน</Typography>
                      </StyledTableCell>
                      <StyledTableCell sx={{ width: 50 }} className="thead-text" align="center">
                        <Typography></Typography>
                      </StyledTableCell>
                    </TableRow>
                  </TableHead>

                  <TableBody>
                    {selectedList.length > 0 &&
                      selectedList.map((row: ProductItem, index: number) => {
                        const isBuffet = row.product_type === 'บุฟเฟ่ต์'

                        return (
                          <StyledTableRow style={!isBuffet ? { border: '2px solid #FE5454' } : {}}>
                            <StyledTableCell
                              component="th"
                              scope="row"
                              sx={{ width: 90 }}
                              className="cellrequisitioninfo"
                              align="center">
                              {row.product_barcode}
                            </StyledTableCell>
                            <StyledTableCell className="cellrequisitioninfo" align="left">
                              {row.product_name}
                            </StyledTableCell>

                            <StyledTableCell align="center" className="cellrequisitioninfo">
                              <InputBase
                                sx={{
                                  pl: 1,
                                  ml: 2,
                                  borderRadius: '10px',
                                  bgcolor: '#ffffff',
                                  border: 1,
                                  borderColor: '#E7E7E7',
                                  color: 'primary',
                                }}
                                type="number"
                                name="qty"
                                value={row.quantity}
                                onChange={(e) => handleInputQuantity(e.target.value, row.product_id)}
                                inputProps={{ 'aria-label': 'input' }}
                                placeholder="กรอกจำนวนสินค้า"
                              />
                            </StyledTableCell>
                            <StyledTableCell align="center" className="cellrequisitioninfo">
                              <div>
                                <IconButton
                                  onClick={() => {
                                    setSelectedRemoveId(row.product_id)
                                    setOpenRemoveItem(true)
                                  }}>
                                  <DeleteForeverOutlined
                                    sx={{
                                      color: '#FE5454',
                                    }}
                                  />
                                </IconButton>
                              </div>
                            </StyledTableCell>
                          </StyledTableRow>
                        )
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>

            <div style={{ display: 'flex', justifyContent: 'center', gap: 10 }}>
              <Button
                className="btn-confirm"
                color="info"
                variant="contained"
                autoFocus
                onClick={onSaveRecord}
                disabled={isSaveDisabled}>
                ยืนยัน
              </Button>
              <Button
                onClick={() => setOpenReset(true)}
                className="btn-confirm"
                autoFocus
                color="warning"
                variant="contained">
                ยกเลิก
              </Button>
            </div>
          </div>
        )}
      </div>

      <Dialog sx={{ padding: 2 }} open={openReset}>
        <DialogContentText sx={{ padding: 5 }}>รีเซ็ตตะกร้าหรือไม่</DialogContentText>
        <DialogActions sx={{ mb: 2, justifyContent: 'center' }}>
          <Button className="btn-confirm" color="primary" variant="contained" onClick={handleReset} autoFocus>
            ยืนยัน
          </Button>
          <Button
            className="btn-confirm"
            onClick={() => setOpenReset(false)}
            autoFocus
            color="warning"
            variant="contained">
            ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog sx={{ padding: 2 }} open={openRemoveItem}>
        <DialogContentText sx={{ padding: 5 }}>ลบสินค้าในตะกร้าหรือไม่</DialogContentText>
        <DialogActions sx={{ mb: 2, justifyContent: 'center' }}>
          <Button className="btn-confirm" color="primary" variant="contained" onClick={handleRemoveItem} autoFocus>
            ยืนยัน
          </Button>
          <Button
            className="btn-confirm"
            onClick={() => setOpenRemoveItem(false)}
            autoFocus
            color="warning"
            variant="contained">
            ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        fullWidth={true}
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
