import { emptyRed } from '@/services/StyleUtils'
import {
  Box,
  Paper,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Typography,
} from '@mui/material'
import Lottie from 'react-lottie'

import { useRouter } from 'next/router'

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

interface SortConfig {
  key: string
  direction: 'asc' | 'desc'
}

interface DataTableProps {
  items: any[]
  itemTotal: number
  headers: any[]
  rowPerPage: number
  page: number
  loadingText: string
  loading: boolean
  width?: string | number
  style?: any
  onChangePage: (event: unknown, newPage: number) => any
  onChangeRowsPerPage: (event: React.ChangeEvent<HTMLInputElement>) => any
  // เพิ่ม props สำหรับ sort (optional)
  enableSort?: boolean // เพิ่มเพื่อเปิด/ปิด sort feature
  sortConfig?: SortConfig | null // ใช้สำหรับเก็บข้อมูล sort ปัจจุบัน
  onSort?: (columnId: string) => void
}

export default function DataTable(props: DataTableProps) {
  const tableMainContainerStyle = {
    width: '100%',
    borderRadius: '0px',
    border: 'none',
    boxShadow: 'rgba(99, 99, 99, 0.2) 0px 2px 8px 0px',
  }
  const router = useRouter()
  const tableHeight =
    router.pathname === '/dashboard'
      ? 'calc(100vh - 320px)'
      : router.pathname === '/report'
      ? 'calc(100vh - 260px)'
      : 'calc(100vh - 220px)'

  return props.loading ? (
    <div
      className="skel-load"
      style={{
        width: '88%',
        height: tableHeight,
        position: 'fixed',
        display: 'flex',
        flexDirection: 'column',
         
      }}>
      <div className="skel-load-table">
        {[1, 2, 3, 4, 5, 6].map((itemIndex) => (
          <div className="skel-table-head" key={itemIndex}>
            <Skeleton sx={{ height: 10, width: '10%', borderRadius: 10 }} animation="wave" variant="rectangular" />
            <Skeleton sx={{ height: 10, width: '10%', borderRadius: 10 }} animation="wave" variant="rectangular" />
            <Skeleton sx={{ height: 10, width: '30%', borderRadius: 10 }} animation="wave" variant="rectangular" />
            <Skeleton sx={{ height: 10, width: '10%', borderRadius: 10 }} animation="wave" variant="rectangular" />
            <Skeleton sx={{ height: 10, width: '10%', borderRadius: 10 }} animation="wave" variant="rectangular" />
            <Skeleton sx={{ height: 10, width: '10%', borderRadius: 10 }} animation="wave" variant="rectangular" />
          </div>
        ))}
      </div>
    </div>
  ) : props.items.length > 0 ? (
    <TableContainer component={Paper} sx={tableMainContainerStyle}>
      <Paper
        sx={{
          width: '88%',
          height: tableHeight,
          position: 'fixed',
          display: 'flex',
          flexDirection: 'column',
          borderRadius:10,
          marginTop:2
        }}>
        <TableContainer sx={{ height: 'calc(100vh - 220px)', display: 'flex', flexDirection: 'column' }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow sx={{ p: 0 }}>
                {props.headers.map((column, index: number) => (
                  <TableCell key={index} align={column.align} style={{ width: column.width }}>
                    {/* ตรวจสอบว่าเปิดใช้งาน sort และ column นี้ sortable หรือไม่ */}
                    {props.enableSort && column.sortable && props.onSort ? (
                      // ใช้ TableSortLabel (Material-UI standard)
                      <TableSortLabel
                        active={props.sortConfig?.key === column.id}
                        direction={
                          props.sortConfig && props.sortConfig.key === column.id ? props.sortConfig.direction : 'asc'
                        }
                        onClick={() => props.onSort!(column.id)}
                        sx={{
                          '& .MuiTableSortLabel-icon': {
                            opacity: props.sortConfig?.key === column.id ? 1 : 0.5,
                          },
                        }}>
                        <Typography>{column.label}</Typography>
                      </TableSortLabel>
                    ) : (
                      // แสดงเฉพาะ label ปกติ
                      <Typography>{column.label}</Typography>
                    )}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {props.items.map((row: any, index: number) => (
                <TableRow hover role="checkbox" tabIndex={-1} key={index}>
                  {props.headers.map((column, columnIndex: number) => {
                    const value = row[column.id]
                    return (
                      <TableCell key={columnIndex} align={column.align} className="cellDataTable">
                        {column.format ? column.format(value) : value}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[10, 25, 100]}
          component="div"
          count={props.itemTotal}
          rowsPerPage={props.rowPerPage}
          page={props.page}
          onPageChange={props.onChangePage}
          onRowsPerPageChange={props.onChangeRowsPerPage}
        />
      </Paper>
    </TableContainer>
  ) : (
    <Box
      sx={{
        textAlign: 'center',
        mt: props.style?.mt ? props.style.mt : '10vmin',
        ml: props.style?.ml ? props.style.ml : '9.2%',
        pb: 2,
        pt: 2,
        bgcolor: 'white',
        borderRadius: 5,
        width: '85%',
      }}>
      <Lottie options={emptyRed} height={225} width={225} />

      <Typography>{props.loadingText}</Typography>
    </Box>
  )
}
