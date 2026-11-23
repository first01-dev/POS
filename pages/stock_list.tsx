import DataTable from '@/components/DataTable'
import ProductDetailDialog from '@/components/dialogs/ProductDetail'
import { StoreName } from '@/components/StoreName'
import { DeadStockListHeaders } from '@/models/column'
import { key } from '@/models/constants/index'
import { DataTableOption, Officer, ProductDetail, Store as StoreType } from '@/models/type'
import { api } from '@/services/AxiosUtils'
import { sumAll } from '@/services/MathUtils'
import { getLocalStorage } from '@/services/StorageUtils'

import { Search, SearchIconWrapper } from '@/services/StyleUtils'
import { AssignmentOutlined, MoreVertOutlined, SearchOutlined } from '@mui/icons-material'
import { Button, IconButton, InputBase, Typography } from '@mui/material'
import dayjs from 'dayjs'
import jwtDecode from 'jwt-decode'
import Head from 'next/head'
import router from 'next/router'
import * as React from 'react'
import 'react-toastify/dist/ReactToastify.css'

interface MediaProps {
  loading?: boolean
}

export default function OrderList(props: MediaProps) {
  const [stockList, setStockList] = React.useState<any>([])
  const [itemTotal, setItemTotal] = React.useState(0)
  const [store, setStore] = React.useState<any>({})

  const [load, setLoad] = React.useState({
    status: false,
    text: '',
    persentage: 0,
  })
  const [dataLoading, setDataLoading] = React.useState(true)

  const [searchType, setSearchType] = React.useState('Barcode')
  const [searchText, setSearchText] = React.useState('')
  const [searchPlaceholder, setSearchPlaceholder] = React.useState('Barcode / ชื่อหนังสือ')
  const [loadFilter, setLoadFilter] = React.useState(false)
  const [page, setPage] = React.useState(0)
  const [rowsPerPage, setRowsPerPage] = React.useState(25)
  const [openDetail, setOpenDetail] = React.useState(false)
  const [productInfo, setProductInfo] = React.useState<ProductDetail>()
  const [currentUser, setCurrentUser] = React.useState<Officer>()
  const [productSum, setProductSum] = React.useState<any>([])
  const [isAuthenticated, setIsAuthenticated] = React.useState(false)
  const [sortConfig, setSortConfig] = React.useState<{
    key: string
    direction: 'asc' | 'desc'
  } | null>({
    key: 'product_quantity',
    direction: 'desc',
  })

  const handleClose = () => {
    setOpenDetail(false)
  }

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage)
    setDataLoading(true)

    const queryParams: DataTableOption = {
      start: newPage * rowsPerPage,
      length: rowsPerPage,
      keywords: searchText,
    }

    if (/^\d{13}$/.test(searchText)) {
      queryParams.barcode = searchText
    } else {
      queryParams.keywords = searchText
    }

    // If there's an active sort, pass the sort parameters
    if (sortConfig) {
      const sortByIndex = DeadStockListHeaders.findIndex((header) => header.id === sortConfig.key) + 1
      getDeadStocklist(queryParams, sortByIndex, sortConfig.direction)
    } else {
      getDeadStocklist(queryParams)
    }
  }

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newSize = +event.target.value
    setRowsPerPage(newSize)
    setPage(0)
    setDataLoading(true)

    const queryParams: DataTableOption = {
      start: 0,
      length: newSize,
      keywords: searchText,
    }

    if (/^\d{13}$/.test(searchText)) {
      queryParams.barcode = searchText
    } else {
      queryParams.keywords = searchText
    }

    // If there's an active sort, pass the sort parameters
    if (sortConfig) {
      const sortByIndex = DeadStockListHeaders.findIndex((header) => header.id === sortConfig.key) + 1
      getDeadStocklist(queryParams, sortByIndex, sortConfig.direction)
    } else {
      getDeadStocklist(queryParams)
    }
  }

  const getTatotalQuantity = sumAll(stockList, 'product_quantity')

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
    setOpenDetail(true)
  }

  const getSumProduct = async () => {
    const store: StoreType = getLocalStorage(key.STORE)
    const res = await api.get(`/report/store_stock_summary?store_id=${store.id}`)

    setProductSum(res.data.data[0])
  }

  const handleSort = async (columnId: string, options?: DataTableOption) => {
    let direction: 'asc' | 'desc' = 'asc'
    if (sortConfig?.key === columnId) {
      direction = sortConfig.direction === 'asc' ? 'desc' : 'asc'
    }

    setSortConfig({ key: columnId, direction })
    setPage(0)
    setDataLoading(true)
    const queryParams: DataTableOption = {
      start: 0,
      length: rowsPerPage,
      keywords: searchText,
      barcode: options?.barcode,
    }

    if (/^\d{13}$/.test(searchText)) {
      queryParams.barcode = searchText
    } else {
      queryParams.keywords = searchText
    }

    getDeadStocklist(queryParams, DeadStockListHeaders.findIndex((header) => header.id === columnId) + 1, direction)
  }

  const getDeadStocklist = async (options?: DataTableOption, sortByIndex?: number, sortDesc?: string) => {
    const store: StoreType = getLocalStorage(key.STORE)
    const currentStart = options?.start ?? page * rowsPerPage
    const currentLength = options?.length ?? rowsPerPage

    const StockDeadHeaders = [
      'id',
      'product_id',
      'product_name',
      'product_code',
      'quantity_remain',
      'lastsell_date',
      'date_diff',
    ]

    const queryParams = {
      draw: 1,
      start: currentStart,
      length: currentLength,
      order: sortConfig
        ? [
            {
              column: sortByIndex || 4,
              dir: sortDesc || 'desc',
            },
          ]
        : [],
      columns: StockDeadHeaders.map((header) => ({
        data: header,
        name: '',
        searchable: true,
        orderable: true,
        search: {
          value: '',
          regex: false,
        },
      })),
      keywords: options?.keywords || '',
      barcode: options?.barcode || '',
    }

    const res = await api.get(`/store/stockdead/${store.id}`, {
      params: queryParams,
    })

    if (res) {
      setItemTotal(res.data.recordsFiltered)
      const data = await res.data.data.map(async (item: any) => {
        return {
          product_barcode: item.product_code,
          product_book_code: item.product_id,
          product_name: item.product_name,
          product_quantity: item.quantity_remain,
          lastsell_date: item.lastsell_date,
          date_diff: item.date_diff,
          product_id: item.product_id,

          ACTION: (
            <div className="showbill">
              <div className="boxshowbill">
                <IconButton sx={{ p: 0, mt: 1 }} onClick={(_) => getProductDetail(item)}>
                  <MoreVertOutlined sx={{ width: '25px', height: '25px' }} />
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
        getDeadStocklist()
        getSumProduct()
        setIsAuthenticated(true)
      } else {
        router.push('/')
      }
    } catch (error) {
      console.error('Invalid token:', error)
      router.push('/')
    }
  }, [])

  const onEnterSearch = async (event: any) => {
    if (event.key === 'Enter') {
      setPage(0)
      setDataLoading(true)

      const queryParams: DataTableOption = {
        start: 0,
        length: rowsPerPage,
      }

      if (/^\d{13}$/.test(searchText)) {
        queryParams.barcode = searchText
      } else {
        queryParams.keywords = searchText
      }

      // If there's an active sort, pass the sort parameters
      if (sortConfig) {
        const sortByIndex = DeadStockListHeaders.findIndex((header) => header.id === sortConfig.key) + 1
        getDeadStocklist(queryParams, sortByIndex, sortConfig.direction)
      } else {
        getDeadStocklist(queryParams)
      }
      setLoadFilter(false)
    }
  }

  const onClickSearch = async (event: any) => {
    setLoadFilter(true)
    setPage(0)
    setDataLoading(true)

    const queryParams: DataTableOption = {
      start: 0,
      length: rowsPerPage,
    }

    if (/^\d{13}$/.test(searchText)) {
      queryParams.barcode = searchText
    } else {
      queryParams.keywords = searchText
    }

    // If there's an active sort, pass the sort parameters
    if (sortConfig) {
      const sortByIndex = DeadStockListHeaders.findIndex((header) => header.id === sortConfig.key) + 1
      getDeadStocklist(queryParams, sortByIndex, sortConfig.direction)
    } else {
      getDeadStocklist(queryParams)
    }
    setLoadFilter(false)
  }

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
            text="สินค้าในสาขา"
            icon={<AssignmentOutlined />}
            store={store?.name}
            currentUser={currentUser?.name}
          />
        )}

        <div className="justify-between w-99 mt-10 mb-20">
          <div className="w-full flex justify-between" style={{ gap: 10, height: 70 }}>
            <div
              className="w-40 flex justify-between bg-gray rounded-20 p-10 mb-20 mt-20 items-center"
              style={{ height: 70 }}>
              <Search className="input" style={{ width: '100%' }}>
                <SearchIconWrapper>
                  <Search />
                </SearchIconWrapper>
                <InputBase
                  className="input-base"
                  placeholder={searchPlaceholder}
                  value={searchText}
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

            <div style={{ width: '30%', alignItems: 'center', display: 'grid' }}>
              <Typography style={{ textAlign: 'left' }}>จำนวนคงเหลือทั้งหมด</Typography>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                <Typography style={{ fontSize: 28, textAlign: 'left' }}>{productSum.total_item} รายการ</Typography>
                <Typography style={{ fontSize: 28, textAlign: 'right' }}> {productSum.total_quantity} เล่ม</Typography>
              </div>{' '}
            </div>
          </div>
        </div>
        {/* Table Element Component */}
        <DataTable
          items={stockList}
          itemTotal={itemTotal}
          headers={DeadStockListHeaders}
          rowPerPage={rowsPerPage}
          loadingText="ไม่มีรายการสินค้า"
          loading={dataLoading}
          page={page}
          enableSort={true}
          sortConfig={sortConfig}
          onSort={handleSort}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
        />
      </div>

      {/* Table Element Component */}
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
  )
}
