import DataTable from '@/components/DataTable'
import Detail from '@/components/dialogs/Detail'
import { StoreName } from '@/components/StoreName'
import { invoiceHeaders } from '@/models/column'
import { key } from '@/models/constants/index'
import { DataTableOption, InvoiceDetail, Officer, ProductItem, Store as StoreType } from '@/models/type'
import { api } from '@/services/AxiosUtils'
import { getLocalStorage } from '@/services/StorageUtils'
import { formatBalance } from '@/services/StringUtils'
import { Search, SearchIconWrapper, SelectInputBase, StyledTableCell, StyledTableRow } from '@/services/StyleUtils'
import { ClearOutlined, DoneAll, Input, ReceiptLongRounded, SearchOutlined } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogProps,
  DialogTitle,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
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
import * as React from 'react'
import toast from 'react-hot-toast'
import 'react-toastify/dist/ReactToastify.css'

interface Data {
  INVOICE_CODE: string
  INVOICE_DATE: string
  INVOICE_ITEM: number
  INVOICE_BOOK: number
  INVOICE_TOTAL: string
  INVOICE_ACCEPT: number
  INVOICE_DUEDATE: string
  ACTION: any
}

function createData(
  INVOICE_CODE: string,
  INVOICE_DATE: string,
  INVOICE_ITEM: number,
  INVOICE_BOOK: number,
  INVOICE_TOTAL: string,
  INVOICE_ACCEPT: number,
  INVOICE_DUEDATE: string,
  ACTION: any
): Data {
  return {
    INVOICE_CODE,
    INVOICE_DATE,
    INVOICE_ITEM,
    INVOICE_BOOK,
    INVOICE_TOTAL,
    INVOICE_ACCEPT,
    INVOICE_DUEDATE,
    ACTION,
  }
}

interface AcceptData {
  product_ref: string
  product_accept: number
  accept: any
  note?: string
  stock_qty?: number
  product_name?: string
}

export default function InvoiceList() {
  const [fullWidth, setFullWidth] = React.useState(true)
  const [maxWidth] = React.useState<DialogProps['maxWidth']>('lg')

  const [searchType, setSearchType] = React.useState('ทั้งหมด')

  const [open, setOpen] = React.useState(false)
  const [openAccept, setOpenAccept] = React.useState(false)
  const [openDetail, setOpenDetail] = React.useState(false)
  const [invoiceList, setInvoiceList] = React.useState<any>([])
  const [itemTotal, setItemTotal] = React.useState(0)
  const [invoiceInfoItem, setInvoiceInfoItem] = React.useState<any>([])
  const [invoiceInfo, setInvoiceInfo] = React.useState<any>({})
  const [searchText, setsearchText] = React.useState('')
  const [store, setStore] = React.useState<any>({})
  const [loadFilter, setLoadFilter] = React.useState(false)
  const [loadingSubmit, setLoadingSubmit] = React.useState(false)
  const [requisitionInfo, setRequisitionInfo] = React.useState<InvoiceDetail>()

  const [currentUser, setCurrentUser] = React.useState<Officer>()

  const [load, setLoad] = React.useState({
    status: false,
    text: '',
    persentage: 0,
  })
  const [dataLoading, setDataLoading] = React.useState(true)

  const [accept, setAccept] = React.useState<AcceptData[]>([])
  const [invoiceCode, setInvoiceCode] = React.useState('')

  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(25)
  const [note, setNote] = React.useState('')

  const handleChangePage = async (event: unknown, newPage: number) => {
    setPage(newPage)

    if (searchType === 'ทั้งหมด') {
      await getInvoiceList({
        keywords: searchText,
        start: newPage * rowsPerPage,
      })
    } else {
      await getInvoiceList({
        keywords: searchText,
        status: searchType,
        start: newPage * rowsPerPage,
      })
    }
  }

  const handleClose = () => {
    setOpenDetail(false)
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleSelectSearchType = (event: SelectChangeEvent) => {
    setSearchType(event.target.value)
  }

  const handleNoteChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNote(event.target.value)
  }

  const mapAcceptType = (status: string) => {
    switch (status) {
      case 'รับสินค้าแล้ว':
        return 1
      case 'ไม่รับสินค้า':
        return 0
      default:
        return ''
    }
  }

  // [Method] แก้ไขจำนวนรับสินค้า
  const handleInputQuantity = (event: React.ChangeEvent<HTMLInputElement>, ref_code: string) => {
    const { value } = event.target
    // ค้นหา index ของรายการที่ต้องการแก้ไข
    const index = accept.findIndex((item) => item.product_ref === ref_code)
    if (index !== -1) {
      const newAccept = [...accept]
      newAccept[index].product_accept = parseInt(value)
      setAccept(newAccept)
    }
  }

  const getDefaultValueAccept = (item: any) => {
    let value = 0
    const data = accept.find((acceptItem) => acceptItem.product_ref === item.product_ref)
    if (data) {
      data.accept === 0 ? (value = 0) : (value = data.product_accept)
    } else {
      value = item.product_accept_quantity
    }
    return value
  }

  // [Method] validate ประเถทการรับสินค้า
  const validateAcceptType = (status: any, rawValue?: string, index?: number) => {
    let isValid = false // เปลี่ยนค่าเริ่มต้นเป็น false
    if (status === 1) {
      isValid = true
    } else if (status === 0 || accept[Number(index)]?.accept === 0) {
      isValid = true
    }
    return { isValid }
  }

  // [Method] แก้ไขสถานะการรับสินค้า
  const handleAccept = async (event: any, ref_code: string) => {
    const { value } = event.target

    // ค้นหา index ของรายการที่ต้องการแก้ไข
    const query = accept.map((item) => {
      let tmp = Object.assign({}, item)
      if (tmp.product_ref === ref_code) {
        tmp.accept = value
        value === 0 && (tmp.product_accept = 0)
      }
      return tmp
    })
    setAccept(query)
  }

  const gotoInvoicedetail = async (id: any) => {
    setAccept([])
    setInvoiceCode(id)

    const res = await api.get(`/recive/info/${id}`)
    setInvoiceInfo(res.data.item[0])
    setInvoiceInfoItem(res.data.item[0].invoice_stockin_item)
    // เซ็ตค่าเริ่มต้น ของการรับสินค้า

    for (let item in res.data.item[0].invoice_stockin_item) {
      const data = res.data.item[0].invoice_stockin_item[item]
      const acceptType = mapAcceptType(data.product_acccept)
      setAccept((prev) => [
        ...prev,
        {
          product_ref: data.product_ref,
          product_accept:
            data.product_acccept === '' ? parseInt(data.product_quantity) : parseInt(data.product_accept_quantity),
          accept: acceptType,
          stock_qty: data.product_quantity,
          product_name: data.product_name,
          note: data.note,
        },
      ])
    }
    setOpen(true)
  }

  //ดึงข้อมูลตารางรับสินค้า
  const getInvoiceList = async (options?: DataTableOption) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const res = await api.get('/recive/datatable', {
      params: { store_id: store.id, start: options?.start, keywords: options?.keywords },
    })

    if (res) {
      let data = res.data.data
      setItemTotal(res.data.recordsFiltered)

      const raw = await data.map(async (item: any) => {
        let action
        if (item.invoice_recive_avalible === 1) {
          action = (
            <Button
              color="info"
              variant="contained"
              className="btn-confirm"
              onClick={() => gotoInvoicedetail(item.invoice_number)}>
              <DoneAll />
              <Typography sx={{ fontSize: '14px' }}>รับสินค้า</Typography>
            </Button>
          )
        } else {
          action = (
            <div className="showbill">
              <div className="boxshowbill">
                <IconButton
                  sx={{ p: 0, mt: 1 }}
                  onClick={(_) => showBillReceipt(item, item.invoice_stockin_recived_date)}>
                  <ReceiptLongRounded sx={{ width: '25px', height: '25px' }} />
                </IconButton>
              </div>
            </div>
          )
        }

        let acceptDate = '-'
        let status = item.invoice_stockin_status_text
        if (item.invoice_recive_avalible === 0) {
          if (item.invoice_stockin_recived_date) {
            acceptDate = dayjs(item.invoice_stockin_recived_date).format('DD/MM/YYYY')
          }
        }

        if (item.invoice_stockin_status_text === 'ยอดไม่ตรง') {
          status = (
            <Typography style={{ color: 'red', fontSize: '14px' }}>{item.invoice_stockin_status_text}</Typography>
          )
        }

        return createData(
          item.invoice_number,
          dayjs(item.invoice_date).format('DD/MM/YYYY'),
          item.invoice_item_total,
          item.invoice_quantity_total,
          formatBalance(item.invoice_price_total),
          status,
          acceptDate,
          action
        )
      })
      const result = await Promise.all(raw)

      setInvoiceList(result)
      setDataLoading(false)
    }
    setLoad({ status: false, text: 'INVOICE_CODE', persentage: 100 })
  }

  const showBillReceipt = async (item: any, accept_date: string) => {
    const response = await api.get(`/recive/info/${item.invoice_number}`)
    const itemDetails: InvoiceDetail = {
      invoice_code: item.invoice_number,
      note: item.invoice_stockin_note,
      quantity_total: item.invoice_quantity_total,
      invoice_date: dayjs(accept_date).format('DD/MM/YYYY'),
      book_list: response.data.item[0].invoice_stockin_item.map((value: any) => {
        return {
          pro_id: Number(value.product_id),
          product_accept_quantity: Number(value.product_accept_quantity),
          pro_quantity: Number(value.product_quantity),
          barcode: value.product_barcode,
          name: value.product_name,
          product_accept: value.product_acccept,
          product_accept_user: value.product_accept_user,
        } as ProductItem
      }),
    }
    setRequisitionInfo(itemDetails)
    setOpenDetail(true)
  }

  const invoiceAccept = async () => {
    setLoadingSubmit(true)

    try {
      const user = Object.create(jwtDecode(getLocalStorage(key.TOKEN)))
      const itemAccept = accept.filter((item) => item.accept !== '')
      const itemNoSent = accept.filter((item) => item.accept === 0)

      if (itemAccept.length === 0) {
        toast.error('คุณยังไม่ได้เลือกรับสินค้า')
        setLoadingSubmit(false)
        return
      }

      // ตรวจสอบและแสดงแจ้งเตือนสำหรับสินค้าจำนวนเกิน แต่ไม่หยุดการทำงาน
      const moreQty = itemAccept.filter((item) => Number(item.product_accept) > Number(item.stock_qty))
      const lessQty = itemAccept.filter(
        (item) => Number(item.product_accept) < Number(item.stock_qty) && item.accept !== 0
      )
      moreQty.forEach((item) => {
        toast(`สินค้า " ${item.product_name} " ที่รับมากกว่าจำนวนสินค้าที่ส่งมา`, {
          icon: '⚠️',
        })
      })

      lessQty.forEach((item) => {
        toast(`สินค้า " ${item.product_name} " ที่รับน้อยกว่าจำนวนสินค้าที่ส่งมา`, {
          icon: '⚠️',
        })
      })

      const payload = {
        invoice_number: invoiceCode,
        store_id: parseInt(store.id),
        user_id: parseInt(user.id),
        note: note,
        item_accept: itemAccept,
      }

      const res = await api.post('/recive/accept', payload)

      if (res.data.status === 'Success') {
        toast.success(res.data.msg)
        setOpenAccept(false)
        setOpen(false)
        setAccept([])

        await getInvoiceList({
          keywords: searchText,
          start: page * rowsPerPage,
        })
      } else {
        toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล')
        setOpenAccept(false)
      }
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล')
    } finally {
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
    getInvoiceList()
  }, [])

  const onEnterSearch = async (event: any) => {
    if (event.key === 'Enter') {
      if (searchType === 'ทั้งหมด') {
        await getInvoiceList({
          keywords: searchText,
        })
      } else {
        await getInvoiceList({
          keywords: searchText,
          status: searchType,
        })
      }
    }
  }

  const onClickSearch = async () => {
    setLoadFilter(true)
    setPage(0)
    if (searchType === 'ทั้งหมด') {
      await getInvoiceList({
        keywords: searchText,
      })
    } else {
      await getInvoiceList({
        keywords: searchText,
        status: searchType,
      })
    }
    setLoadFilter(false)
  }

  return (
    <Box>
      <Head>
        <title>POS</title>
        <meta name="description" content="blank" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {/* <LoadingScreen open={load.status} text={load.text} percentage={load.persentage} /> */}
      <div className="Box-container">
        <StoreName text="รับสินค้า" icon={<Input />} store={store?.name} currentUser={currentUser?.name} />

        <div className="w-50">
          <div
            className="w-full flex justify-between bg-gray rounded-20 p-10 mb-20 mt-20 items-center"
            style={{ gap: 10, height: 70 }}>
            <Typography className="w-30">ค้นหาใบส่งของ</Typography>
            <Search className="input" style={{ width: '90%' }}>
              <SearchIconWrapper>
                <Search />
              </SearchIconWrapper>
              <InputBase
                className="input-base"
                placeholder="เลขที่ใบส่งของ"
                onKeyDown={onEnterSearch}
                onChange={(e) => setsearchText(e.target.value)}
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
        </div>

        {/* Table Element Component */}
        <DataTable
          items={invoiceList}
          itemTotal={itemTotal}
          headers={invoiceHeaders}
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
              <Typography sx={{ fontSize: '22px' }}>รับสินค้า</Typography>
            </DialogTitle>
          </div>
          <div>
            <IconButton onClick={(_) => setOpen(false)} sx={{ mt: 1 }}>
              <ClearOutlined sx={{ color: '#FE5454' }} />
            </IconButton>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', marginTop: '-20px', padding: '18px', paddingTop: '0' }}>
          <Typography sx={{ fontSize: '16px', fontWeight: 600, ml: 2, mt: 2, width: 400 }}>
            เลขที่ใบรับสินค้า : {invoiceInfo.invoice_number}
          </Typography>
          <Typography sx={{ fontSize: '16px', fontWeight: 600, ml: 2, mt: 2, width: 400 }}>
            วันที่ : {invoiceInfo.invoice_date?.split(' ')[0]}
          </Typography>
          <Typography sx={{ fontSize: '16px', fontWeight: 600, ml: 2, mt: 2, width: 400 }}>
            จำนวนรายการ : {invoiceInfo.invoice_item_total}
          </Typography>
        </div>
        <div style={{ display: 'flex', gap: '10px', marginTop: '-20px', padding: '18px', paddingTop: '0' }}>
          {' '}
          <Typography sx={{ fontSize: '16px', fontWeight: 600, ml: 2, mt: 2 }}>
            จำนวนรายการ : {invoiceInfo.invoice_quantity_total}
          </Typography>
        </div>

        <DialogContent sx={{ py: 0, height: 600 }}>
          <div className="boxitemlist2">
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
                    <StyledTableCell className="thead-text2" align="center" sx={{ width: '300px' }}>
                      ชื่อสินค้า
                    </StyledTableCell>
                    <StyledTableCell className="thead-text2" align="center">
                      SIS
                    </StyledTableCell>
                    <StyledTableCell className="thead-text2" align="center">
                      รหัสหนังสือ
                    </StyledTableCell>
                    <StyledTableCell className="thead-text2" align="center">
                      ราคาปก
                    </StyledTableCell>
                    <StyledTableCell className="thead-text2" align="center">
                      ที่ส่งมา
                    </StyledTableCell>
                    <StyledTableCell className="thead-text2" align="center">
                      ที่ได้รับ
                    </StyledTableCell>
                    <StyledTableCell className="thead-text2" align="center">
                      ประเภทการรับสินค้า
                    </StyledTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoiceInfoItem.map((item: any, index: any) => (
                    <StyledTableRow sx={{ height: 20 }} key={index}>
                      <StyledTableCell
                        className="cellinvoiceinfo"
                        component="th"
                        scope="row"
                        align="left"
                        sx={{ width: '400px' }}>
                        {item.product_name}
                      </StyledTableCell>
                      <StyledTableCell className="cellinvoiceinfo" align="center">
                        {item.order_number}
                      </StyledTableCell>
                      <StyledTableCell className="cellinvoiceinfo" align="center">
                        {item.product_barcode}
                      </StyledTableCell>
                      <StyledTableCell className="cellinvoiceinfo" align="right">
                        {formatBalance(item.product_price)}
                      </StyledTableCell>
                      <StyledTableCell className="cellinvoiceinfo" align="right">
                        {item.product_quantity}
                      </StyledTableCell>
                      <StyledTableCell className="cellinvoiceinfo" align="center" sx={{ width: 100 }}>
                        <InputBase
                          onChange={(e: any) => handleInputQuantity(e, item.product_ref)}
                          disabled={validateAcceptType(item.product_acccept, item, index).isValid}
                          value={getDefaultValueAccept(item)}
                          type="number"
                          style={{ borderRadius: 10, border: '1px #c3c3c3ff solid' }}
                          inputProps={{ 'aria-label': 'search' }}
                        />
                      </StyledTableCell>
                      <StyledTableCell sx={{ width: 120 }} className="cellinvoiceinfo">
                        <FormControl sx={{ height: '80%', border: 0, width: 150 }}>
                          <Select
                            defaultValue={item.product_acccept}
                            onChange={(e: any) => handleAccept(e, item.product_ref)}
                            MenuProps={{ disableScrollLock: true }}
                            id="demo-multiple-chip-label"
                            disabled={Boolean(validateAcceptType(item.product_acccept).isValid)} // ทำให้แน่ใจว่าเป็น boolean
                            displayEmpty
                            input={<SelectInputBase id="select-multiple-chip" />}
                            sx={{ borderRadius: '10px', height: 35, width: '100%', border: '#d9d9d9 1px solid' }}>
                            <MenuItem value={''}>รอดำเนินการ</MenuItem>
                            <MenuItem value={1}>รับสินค้า</MenuItem>
                            <MenuItem value={0}>ไม่มีสินค้าส่งมา</MenuItem>
                          </Select>
                        </FormControl>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <Box
            sx={{
              zIndex: 3,
              width: '100%',
              padding: 1,
              marginTop: 2,
              display: 'flex',
              justifyContent: 'left',
              backgroundColor: '#F1F1F1',
            }}>
            <Typography sx={{ ml: 3 }}>หมายเหตุ</Typography>
            <InputBase
              className="noteInput"
              inputProps={{ 'aria-label': 'search' }}
              sx={{
                pl: 1,
                ml: 2,
                width: '50%',
                height: 40,
                borderRadius: '20px',
                bgcolor: '#ffffff',
                border: 1,
                borderColor: '#E7E7E7',
                color: 'primary',
              }}
              value={note}
              onChange={handleNoteChange} // Update the note state on input change
            />

            <br />
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'center', mb: 1 }}>
          <Button color="info" variant="contained" onClick={() => setOpenAccept(true)} className="btn-confirm">
            <DoneAll sx={{ mr: 1 }} />
            รับสินค้า
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog sx={{ padding: 2 }} open={openAccept}>
        <DialogContentText sx={{ padding: 5 }}>ยืนยันการรับสินค้าหรือไม่</DialogContentText>
        <DialogActions sx={{ mb: 2, justifyContent: 'center' }}>
          <Button loading={loadingSubmit} color="info" variant="contained" onClick={invoiceAccept} autoFocus>
            ยืนยัน
          </Button>
          <Button onClick={() => setOpenAccept(false)} autoFocus color="warning" variant="contained">
            ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>

      <Detail
        open={openDetail}
        onClose={handleClose}
        html={''}
        text_qauntity="จำนวนที่ส่งมา"
        text_accecpt_qauntity="จำนวนที่รับ"
        text_ref_no="เลขที่ใบรับสินค้า"
        text_title="วันที่รับสินค้า"
        text_product_accept_user="พนักงาน"
        subtitle="รายละเอียดรายการรับสินค้า"
        ref_no={requisitionInfo?.invoice_code}
        create_date={requisitionInfo?.invoice_date}
        total_quantity={requisitionInfo?.quantity_total}
        book_list={requisitionInfo?.book_list as ProductItem[]}
        note={requisitionInfo?.note}
      />
    </Box>
  )
}
