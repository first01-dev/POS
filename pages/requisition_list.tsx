import DataTable from '@/components/DataTable'
import Detail from '@/components/dialogs/Detail'
import { StoreName } from '@/components/StoreName'
import { RequesitionHeaders } from '@/models/column'
import { key } from '@/models/constants/index'
import {
  DataTableOption,
  Officer,
  ProductItem,
  RequisitionBody,
  RequisitionDetail,
  Store as StoreType,
} from '@/models/type'
import { api } from '@/services/AxiosUtils'
import { getLocalStorage } from '@/services/StorageUtils'
import { Search, SearchIconWrapper, SelectInputBase } from '@/services/StyleUtils'
import {
  AddCircleOutlineOutlined,
  AddToPhotosOutlined,
  ClearOutlined,
  DeleteForeverOutlined,
  DoneAll,
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
  DialogContentText,
  DialogProps,
  DialogTitle,
  FormControl,
  FormControlLabel,
  FormGroup,
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
import { styled } from '@mui/material/styles'
import TableCell, { tableCellClasses } from '@mui/material/TableCell'
import jwtDecode from 'jwt-decode'
import Head from 'next/head'
import router from 'next/router'
import * as React from 'react'
import toast from 'react-hot-toast'

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: '#f1f1f1',
    color: theme.palette.warning,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}))

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  // hide last border
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}))

export default function RequisitionList() {
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('lg')
  const [maxWidth2, setMaxWidth2] = React.useState<DialogProps['maxWidth']>('md')
  const [searchType, setSearchType] = React.useState('ทั้งหมด')
  const [keyword, setKeyword] = React.useState('')
  const [openAccept, setOpenAccept] = React.useState(false)
  const [openCancel, setOpenCancel] = React.useState(false)
  const [openRemoveItem, setOpenRemoveItem] = React.useState(false)
  const [openDetail, setOpenDetail] = React.useState(false)
  const [requisitionList, setRequisitionList] = React.useState<any>([])
  const [itemTotal, setItemTotal] = React.useState(0)
  const [selectItem, setSelectItem] = React.useState<any[]>([])
  const [bookInSelect, setBookInSelect] = React.useState<any>([])
  const [store, setStore] = React.useState<any>({})

  const [load, setLoad] = React.useState({
    status: false,
    text: '',
    persentage: 0,
  })
  const [dataLoading, setDataLoading] = React.useState(true)

  const [searchProductByBarcode, setSearchProductByBarcode] = React.useState('')
  const [searchTypeStock, setSearchTypeStock] = React.useState('Barcode')
  const [placeholder, setPlaceholder] = React.useState('Barcode / ชื่อหนังสือ')
  const [searchText, setSearchText] = React.useState('')
  const [loadFilter, setLoadFilter] = React.useState(false)
  const [loadingSubmit, setLoadingSubmit] = React.useState(false)
  const [bill_slip, setBillSlip] = React.useState({ html: '', css: '' })
  const [openProduct, setOpenProduct] = React.useState(false)
  const [openaddrequisition, setOpenAddrequisition] = React.useState(false)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(25)
  const [productDeleteId, setProductDeleteId] = React.useState('')
  const [requisitionInfo, setRequisitionInfo] = React.useState<RequisitionDetail>()
  const [currentUser, setCurrentUser] = React.useState<Officer>()

  const [requisitionData, setRequisitionData] = React.useState<RequisitionBody>({
    type: 'new',
    note: '',
    item: [],
    user_id: 0,
    store_id: 0,
  })

  const [qty, setQty] = React.useState(0)
  const [selectedList, setSelectedList] = React.useState<ProductItem[]>([])

  const handleClose = () => {
    setOpenDetail(false)
    setRequisitionData({ ...requisitionData, item: [] })
    setOpenAddrequisition(false)
    setSelectedList([])
  }

  //ลบสินค้าในตาราง
  const handleRemoveItem = () => {
    const DeleteItem = selectedList.filter((value: ProductItem) => value.product_id !== productDeleteId)
    const DeleteItem2 = requisitionData.item.filter((value: any) => value.product_id !== productDeleteId)
    setRequisitionData({ ...requisitionData, item: DeleteItem2 })
    setSelectedList(DeleteItem)
    setOpenRemoveItem(false)
  }

  const handleChangePage = async (event: unknown, newPage: number) => {
    setPage(newPage)

    await getRequisitionlist({
      keywords: searchText,
      start: newPage * rowsPerPage,
    })
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(+event.target.value)
    setPage(0)
  }

  const handleSelectSearchStatus = (event: SelectChangeEvent) => {
    setSearchType(event.target.value)
  }

  // [Method] - จัดการกล่องข้อมความค้นหา
  const handleSearchInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value)
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

  const resetSelectedList = () => {
    setRequisitionData({ ...requisitionData, item: [] })
    setSelectedList([])

    setOpenCancel(false)
    setSearchProductByBarcode('')
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
    if (!validateSearchBarcode()) {
      return
    }

    const STORE: StoreType = getLocalStorage(key.STORE)

    let searchParam
    if (/^\d{13}$/.test(searchText)) {
      searchParam = {
        store_id: STORE.id,
        barcode: keyword,
      }
    } else {
      searchParam = {
        store_id: STORE.id,
        keywords: keyword,
        length: 100,
      }
    }

    try {
      const res = await api.get(`/product/list`, {
        params: searchParam,
      })

      if (res.data.items.length > 0) {
        setSelectItem(res.data.items)
        setOpenProduct(true)
      } else {
        toast.error('ไม่พบสินค้า')
      }
    } catch (error) {
    } finally {
      setLoadFilter(false)
    }
  }

  const handleInputQuantity = (value: string, bo_code: string) => {
    const updatedAcceptQty = requisitionData.item.map((item) => {
      if (item.product_id === bo_code) {
        item.quantity = parseInt(value)
      }
      return item
    })
    setRequisitionData({ ...requisitionData, item: updatedAcceptQty })
  }

  const showBillReceipt = async (item: any) => {
    const store = getLocalStorage(key.STORE)
    const response = await api.get(`/purchase/info/${item.id}?store_id=${store.id}`)

    const bookList: ProductItem[] = response.data.data[0].items.map((value: any) => {
      return {
        type: value.product_type,
        barcode: value.product_barcode,
        product_id: Number(value.product_id),
        pro_quantity: Number(value.product_quantity),
        product_accept_quantity: Number(value.accepted_quantity),
        name: value.product_name,
      } as ProductItem
    })

    // Calculate the total number of items
    const totalItems = bookList.length

    const itemDetails: RequisitionDetail = {
      id: Number(item.id),
      ref_no: item.ref_no,
      created_by_name: item.created_by_name,
      create_date: item.created_at,
      total_quantity: Number(item.total_quantity),
      note: item.note,
      book_list: bookList,
      total_items: totalItems,
    }
    setRequisitionInfo(itemDetails)
    setOpenDetail(true)
  }

  const onInputQtyComplete = async () => {
    const currentTime = new Date()
    const newItem: ProductItem[] = bookInSelect.map((item: any) => {
      return {
        product_id: parseInt(item.product_id),
        name: item.product_name,
        type: item.product_type,
        barcode: item.product_barcode,
        price: parseInt(item.product_price),
        quantity: 1,
        pro_quantity: parseInt(item.product_quantity),
        added_time: currentTime,
      }
    })

    // check if item already exist
    const existItem = selectedList.filter((value) => newItem.find((item) => item.product_id === value.product_id))
    existItem.forEach((item) => {
      toast.error(`สินค้า ${item.name} มีอยู่ในรายการแล้ว`)
    })

    // remove exist item from new item
    for (let i = 0; i < existItem.length; i++) {
      const index = newItem.findIndex((value) => value.product_id === existItem[i].product_id)
      newItem.splice(index, 1)
    }

    setSelectedList((prev) => {
      const updatedList = [...prev, ...newItem].sort((a: any, b: any) => b.added_time - a.added_time)
      return updatedList
    })
    setRequisitionData((prev) => ({
      ...prev,
      item: [...prev.item, ...newItem].sort((a: any, b: any) => b.added_time - a.added_time),
    }))
    setOpenProduct(false)
    setKeyword('')
    setBookInSelect([])
    setQty(0)
  }

  const isDisabled = !selectedList || selectedList.length === 0
  const isSelectDisabled = bookInSelect.length === 0

  const getRequisitionlist = async (options?: DataTableOption) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const res = await api.get('/purchase/datatable', {
      params: { store_id: store.id, start: options?.start, ref_no: options?.keywords, status: options?.status },
    })
    if (res) {
      setItemTotal(res.data.recordsFiltered)
      const data = await res.data.data.map(async (item: any, index: number) => {
        return {
          ref_no: item.ref_no,
          date: item.created_at,
          total_quantity: item.total_quantity,
          create_by_name: item.created_by_name,
          status: item.status,
          ACTION: (
            <div key={index} className="showbill">
              <div className="boxshowbill">
                <IconButton sx={{ p: 0, mt: 1 }} onClick={(_) => showBillReceipt(item)}>
                  <ReceiptLongRounded sx={{ width: '25px', height: '25px' }} />
                </IconButton>
              </div>
            </div>
          ),
        }
      })
      const result = await Promise.all(data)
      setRequisitionList(result)
      setDataLoading(false)
    }
    setLoad({ status: false, text: '', persentage: 100 })
  }

  // [Watch] - ตรวจจับการเปลี่ยนแปลงของคำค้นหาแล้วกรองข้อมูลออกมา
  React.useEffect(() => {
    const STORE: StoreType = getLocalStorage(key.STORE)

    if (/^\d{13}$/.test(keyword)) {
      api.get(`/product/list?store_id=${store?.id}&barcode=${keyword}`).then((res) => {
        if (res.data.items.length > 0) {
          const currentTime = new Date()
          const data: ProductItem = {
            product_id: parseInt(res.data.items[0].product_id),
            pro_quantity: parseInt(res.data.items[0].product_quantity),
            barcode: res.data.items[0].product_barcode,
            name: res.data.items[0].product_name,
            type: res.data.items[0].product_type,
            price: parseInt(res.data.items[0].product_price),
            quantity: 1,
            added_time: currentTime, // Adding timestamp
          }

          // Check if item already exists
          const exist: any = selectedList.find((value) => value.product_id === data.product_id)
          if (exist) {
            const updatedAcceptQty = requisitionData.item
              .map((item: any) => {
                if (item.product_id === data.product_id) {
                  item.quantity += 1
                  item.added_time = currentTime // Update timestamp
                }
                return item
              })
              .sort((a, b) => b.added_time - a.added_time) // Sort by timestamp (latest first)
            setRequisitionData({ ...requisitionData, item: updatedAcceptQty })
          } else {
            const updatedList = [...selectedList, data].sort((a: any, b: any) => b.added_time - a.added_time) // Sort by timestamp (latest first)
            setSelectedList(updatedList)
            setRequisitionData((prev) => ({
              ...prev,
              item: [...prev.item, data].sort((a: any, b: any) => b.added_time - a.added_time), // Sort by timestamp (latest first)
            }))
          }
        } else {
          toast.error(res.data.msg)
        }

        setKeyword('')
      })
    }
  }, [keyword])

  React.useEffect(() => {
    const user: Officer = jwtDecode(getLocalStorage(key.TOKEN) as string)
    setCurrentUser(user)
    if (getLocalStorage(key.STORE) && getLocalStorage(key.TOKEN)) {
      setStore(getLocalStorage(key.STORE))
      getRequisitionlist()
    } else {
      router.push('/')
    }
  }, [])

  const onSubmitRuquisition = async () => {
    setLoadingSubmit(true)

    try {
      const user: Officer = Object.create(jwtDecode(getLocalStorage(key.TOKEN)))
      requisitionData.user_id = Number(user.id)
      requisitionData.store_id = Number(store.id)

      // Check if item quantity is greater than 0
      if (!requisitionData.item.every((item) => Number(item.quantity) > 0)) {
        toast.error('กรุณากรอกจำนวนสินค้ามากกว่า 0')
        setOpenAccept(false)
        setLoadingSubmit(false)
        return
      }

      const res = await api.post(`/purchase/create`, requisitionData)
      if (res) {
        setRequisitionData({
          type: 'new',
          note: '',
          item: [],
          user_id: 0,
          store_id: 0,
        })
        setSelectedList([])
        toast.success('เพิ่มรายการเบิกสินค้าสำเร็จ')
      }

      getRequisitionlist()
    } catch (error) {
      toast.error('เกิดข้อผิดพลาดในการส่งข้อมูล')
    } finally {
      setLoadingSubmit(false)
      setOpenAccept(false)
      setOpenAddrequisition(false)
    }
  }

  const onEnterSearch = async (event: any) => {
    if (event.key === 'Enter') {
      if (searchType === 'ทั้งหมด') {
        await getRequisitionlist({
          keywords: searchText,
        })
      } else {
        // not use
        await getRequisitionlist({
          keywords: searchText,
          status: searchType,
        })
      }
    }
  }

  const onClickSearch = async () => {
    setLoadFilter(true)
    setPage(0)

    try {
      await getRequisitionlist({
        keywords: searchText,
        ...(searchType !== 'ทั้งหมด' && { status: searchType }),
      })
    } finally {
      setLoadFilter(false)
    }
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
        <StoreName
          text="เบิกสินค้า"
          icon={<AddToPhotosOutlined />}
          store={store?.name}
          currentUser={currentUser?.name}
        />

        <div className="justify-between items-center w-99">
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
                  placeholder="รหัสใบเบิกสินค้า"
                  onKeyDown={onEnterSearch}
                  onChange={(e) => setSearchText(e.target.value)}
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
          <div className="rounded-20 bg-gray w-15 items-center flex justify-center" style={{ height: 70 }}>
            <Button
              className="btn-confirm w-60"
              color="info"
              startIcon={<AddCircleOutlineOutlined />}
              variant="contained"
              onClick={(_) => setOpenAddrequisition(true)}>
              <Typography sx={{ fontSize: '14px' }}>เพิ่ม</Typography>
            </Button>
          </div>
        </div>
        {/* Table Element Component */}
      </div>
      <DataTable
        items={requisitionList}
        itemTotal={itemTotal}
        headers={RequesitionHeaders}
        rowPerPage={rowsPerPage}
        loadingText="ไม่มีรายการเบิกสินค้า"
        loading={dataLoading}
        page={page}
        onChangePage={handleChangePage}
        onChangeRowsPerPage={handleChangeRowsPerPage}
      />

      <Dialog
        maxWidth={maxWidth}
        open={openaddrequisition}
        PaperProps={{
          style: {
            borderRadius: 20,
          },
        }}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div style={{ width: '93%' }}>
            <DialogTitle id="alert-dialog-title">
              <Typography sx={{ fontSize: '16px' }}>เบิกสินค้า</Typography>
            </DialogTitle>
          </div>
          <div>
            <IconButton onClick={handleClose} sx={{ mt: 1 }}>
              <ClearOutlined sx={{ color: '#FE5454' }} />
            </IconButton>
          </div>
        </div>

        <DialogContent sx={{ paddingBottom: 0, height: 600, marginTop: -2 }}>
          <Box className="bg-gray justify-start flex items-center p-10 mb-10" sx={{ gap: 2 }}>
            <Typography sx={{ ml: 3 }}>ประเภท</Typography>
            <FormControl sx={{ height: 40, ml: 2, width: 200 }}>
              <Select
                id="demo-multiple-chip-label"
                displayEmpty
                defaultValue={requisitionData.type}
                onChange={(e) =>
                  setRequisitionData({
                    ...requisitionData,
                    type: e.target.value,
                  })
                }
                input={<SelectInputBase id="select-multiple-chip" />}
                sx={{ borderRadius: '20px', height: 50, width: '100%' }}>
                <MenuItem value="old">หนังสือเก่า</MenuItem>
                <MenuItem value="new">หนังสือใหม่</MenuItem>
              </Select>
            </FormControl>
            <div className="justify-start flex items-center w-50">
              {/* form ค้นหา */}
              <Typography className="w-30">ค้นหาสินค้า</Typography>
              {/* <FormControl sx={{ height: 35, border: 0, width: 130, ml: '10px' }}>
                <Select
                  id="demo-multiple-chip-label"
                  value={searchTypeStock}
                  onChange={handleSelectSearchType}
                  displayEmpty
                  input={<SelectInputBase id="select-multiple-chip" />}
                  sx={{
                    fontSize: '14px',
                    borderRadius: '10px',
                    height: 50,
                    width: 120,
                    border: 1,
                    borderColor: '#E7E7E7',
                  }}>
                  <MenuItem value="Barcode">Barcode</MenuItem>
                  <MenuItem value="ชื่อหนังสือ">ชื่อหนังสือ</MenuItem>
                </Select>
              </FormControl> */}
              <Search className="input w-full" style={{ height: 40 }}>
                <SearchIconWrapper>
                  <Search />
                </SearchIconWrapper>
                <InputBase
                  className="input-base"
                  value={keyword}
                  placeholder={placeholder}
                  onChange={handleSearchInput}
                  inputProps={{ 'aria-label': 'search' }}
                />
              </Search>
              <Button
                disabled={keyword === ''}
                color="primary"
                loading={loadFilter}
                startIcon={<SearchOutlined />}
                variant="contained"
                className="rounded-20 w-20"
                onClick={onAddProduct}>
                <Typography>ค้นหา</Typography>
              </Button>
            </div>
          </Box>
          <div className="boxitemlist">
            <TableContainer
              component={Paper}
              sx={{
                width: '100%',
                borderRadius: '0px',
                border: 'none',
                overflowX: 'hidden',
                boxShadow: 'none',
              }}>
              <Table aria-label="customized table">
                <TableHead>
                    
                  <TableRow>
                    <StyledTableCell align="center" sx={{ width: 100 }}>
                      <Typography >ลำดับที่</Typography>
                    </StyledTableCell>
                    <StyledTableCell align="center" sx={{ pl: 10 }}>
                      <Typography>Barcode</Typography>
                    </StyledTableCell>
                    <StyledTableCell className="thead-text" align="center" sx={{ width: '400px' }}>
                      <Typography>ชื่อสินค้า</Typography>
                    </StyledTableCell>
                    <StyledTableCell className="thead-text" align="center">
                      <Typography>ประเภท</Typography>
                    </StyledTableCell>
                    <StyledTableCell sx={{ width: '100px' }} className="thead-text" align="center">
                      <Typography>ราคาปก</Typography>
                    </StyledTableCell>
                    <StyledTableCell sx={{ width: 100 }} className="thead-text" align="center">
                      <Typography>คงเหลือ</Typography>
                    </StyledTableCell>
                    <StyledTableCell className="thead-text" align="center">
                      <Typography>จำนวนเบิก</Typography>
                    </StyledTableCell>
                    <StyledTableCell sx={{ width: 50 }} className="thead-text" align="center">
                      <Typography></Typography>
                    </StyledTableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {selectedList.length > 0 &&
                    selectedList.map((row: ProductItem, index: number) => (
                      <StyledTableRow key={index} sx={{ height: 20 }}>
                        <StyledTableCell
                          component="th"
                          scope="row"
                    
                          className="cellrequisitioninfo"
                          align="center">
                         {selectedList.length - index}
                        </StyledTableCell>
                        <StyledTableCell
                          component="th"
                          scope="row"
                          sx={{ width: 90 }}
                          className="cellrequisitioninfo"
                          align="center">
                          {row.barcode}
                        </StyledTableCell>
                        <StyledTableCell className="cellrequisitioninfo" align="left">
                          {row.name}
                        </StyledTableCell>
                        <StyledTableCell className="cellrequisitioninfo" align="center" sx={{ width: '100px' }}>
                          {row.type}
                        </StyledTableCell>
                        <StyledTableCell className="cellrequisitioninfo" align="right" sx={{ width: '100px' }}>
                          {row.price}
                        </StyledTableCell>
                        <StyledTableCell className="cellrequisitioninfo" align="center">
                          {row.pro_quantity}
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
                            onChange={(e) => {
                              if (row.barcode !== undefined) {
                                handleInputQuantity(e.target.value, row.product_id)
                              }
                            }}
                            inputProps={{ 'aria-label': 'input' }}
                            placeholder="กรอกจำนวนสินค้า"
                          />
                        </StyledTableCell>
                        <StyledTableCell align="center" className="cellrequisitioninfo">
                          <div
                            onClick={(_) => {
                              setOpenRemoveItem(true)
                              setProductDeleteId(row.product_id)
                            }}>
                            <IconButton>
                              <DeleteForeverOutlined
                                sx={{
                                  color: '#FE5454',
                                }}
                              />
                            </IconButton>
                          </div>
                        </StyledTableCell>
                      </StyledTableRow>
                    ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <Dialog sx={{ padding: 2 }} open={openRemoveItem}>
            <DialogContentText sx={{ padding: 5 }}>ลบสินค้าในตะกร้าหรือไม่</DialogContentText>
            <DialogActions sx={{ mb: 2, justifyContent: 'center' }}>
              <Button className="btn-confirm" color="primary" variant="contained" onClick={handleRemoveItem} autoFocus>
                ยืนยัน
              </Button>
              <Button
                className="btn-confirm"
                onClick={(_) => setOpenRemoveItem(false)}
                autoFocus
                color="warning"
                variant="contained">
                ยกเลิก
              </Button>
            </DialogActions>
          </Dialog>

          <Box
            sx={{
              mt: -2,
              zIndex: 3,
              width: '100%',
              padding: 2,
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#F1F1F1',
            }}>
            <Typography sx={{ ml: 3 }}>หมายเหตุ</Typography>
            <InputBase
              className="noteInput"
              onChange={(e) => setRequisitionData({ ...requisitionData, note: e.target.value })}
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
              inputProps={{ 'aria-label': 'search' }}
            />

            <br />
          </Box>
          <DialogActions sx={{ justifyContent: 'center', mb: 1, mt: 1 }}>
            <Button
              disabled={isDisabled}
              onClick={(_) => setOpenAccept(true)}
              color="info"
              variant="contained"
              className="btn-confirm">
              <DoneAll sx={{ mr: 1 }} />
              เบิกสินค้า
            </Button>
            <Button
              disabled={isDisabled}
              onClick={(_) => setOpenCancel(true)}
              color="warning"
              variant="contained"
              className="btn-confirm">
              <RemoveCircleOutlineOutlined sx={{ mr: 1 }} />
              รีเซ็ต
            </Button>
          </DialogActions>
        </DialogContent>
      </Dialog>
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
                  alignItems: 'flex-start', // label หลายบรรทัดไม่เบี้ยว
                  '& .MuiFormControlLabel-label': {
                    width: '100%', // ⭐ สำคัญ
                  },
                }}
                control={<Checkbox onChange={() => handleCheckboxChange(value)} />}
                label={
                  <Box sx={{ width: '100%', whiteSpace: 'pre-line', my: 1 }}>
                    {`[${value.product_type}] ${value.product_barcode} ${value.product_name} (ราคาปก ${value.product_price} บาท)`}
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

      <Dialog open={openAccept} sx={{ padding: 2 }}>
        <DialogContentText sx={{ padding: 5 }}>ยืนยันการเบิกสินค้าหรือไม่</DialogContentText>
        <DialogActions sx={{ mb: 2, justifyContent: 'center' }}>
          <Button
            className="btn-confirm"
            loading={loadingSubmit}
            color="info"
            variant="contained"
            autoFocus
            onClick={onSubmitRuquisition}>
            ยืนยัน
          </Button>
          <Button
            className="btn-confirm"
            autoFocus
            color="warning"
            variant="contained"
            onClick={(_) => setOpenAccept(false)}>
            ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={openCancel} sx={{ padding: 2 }}>
        <DialogContentText sx={{ padding: 5 }}>ยืนยันการรีเซ็ตรายสินค้าหรือไม่</DialogContentText>
        <DialogActions sx={{ mb: 2, justifyContent: 'center' }}>
          <Button className="btn-confirm" color="primary" variant="contained" onClick={resetSelectedList} autoFocus>
            ยืนยัน
          </Button>
          <Button
            className="btn-confirm"
            autoFocus
            color="warning"
            variant="contained"
            onClick={(_) => setOpenCancel(false)}>
            ยกเลิก
          </Button>
        </DialogActions>
      </Dialog>
      <Detail
        open={openDetail}
        onClose={handleClose}
        html={''}
        text_qauntity="จำนวน"
        text_ref_no="เลขที่ใบเบิกสินค้า"
        text_title="วันที่เบิกสินค้า"
        subtitle="รายละเอียดรายการเบิกสินค้า"
        ref_no={requisitionInfo?.ref_no}
        create_date={requisitionInfo?.create_date}
        create_by_name={requisitionInfo?.created_by_name}
        total_quantity={requisitionInfo?.total_quantity}
        total_items={requisitionInfo?.total_items}
        book_list={requisitionInfo?.book_list as ProductItem[]}
        note={requisitionInfo?.note}
      />
    </div>
  )
}
