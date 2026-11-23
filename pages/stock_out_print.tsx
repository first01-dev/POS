import { key } from '@/models/constants'
import { Officer } from '@/models/type'
import { getLocalStorage } from '@/services/StorageUtils'
import { formatBalance } from '@/services/StringUtils'
import { Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material'
import dayjs from 'dayjs'
import jwtDecode from 'jwt-decode'
import { useSearchParams } from 'next/navigation'
import router from 'next/router'
import React from 'react'
import Barcode from 'react-barcode'

export default function stockOutPrint() {
  const searchParams = useSearchParams()
  const [store, setStore] = React.useState<any>({})
  const [currentUser, setCurrentUser] = React.useState<Officer>()
  const data = JSON.parse(searchParams.get('payload') as string)
  const genDot = (length: number) => {
    return '.'.repeat(length)
  }

  React.useEffect(() => {
    if (data) {
      print()
    }
  })

  React.useEffect(() => {
    const user: Officer = jwtDecode(getLocalStorage(key.TOKEN) as string)
    setCurrentUser(user)
    if (getLocalStorage(key.STORE) && getLocalStorage(key.TOKEN)) {
      setStore(getLocalStorage(key.STORE))
      const sideBar = document.getElementById('drawer-sidebar')
      if (sideBar) {
        sideBar.style.display = 'none'
      }
    } else {
      router.push('/')
    }
    window.onafterprint = () => window.close()
    return () => {
      window.onafterprint = null
    }
    return () => {
      const sideBar = document.getElementById('drawer-sidebar')
      if (sideBar) {
        sideBar.style.display = 'block'
      }
    }
  }, [])
  return (
    data && (
      <div className="receipt-template-stock">
        <div>
          <Typography style={{ textAlign: 'center', marginTop: 20, marginBottom: 10 }}>รายการคืนหนังสือ</Typography>
          <Typography style={{ fontSize: '14px', marginBottom: 10 }}>{store.name}</Typography>
          <Typography style={{ fontSize: '14px' }}>เอกสารเลขที่ : {data.ref_no}</Typography>
          <Typography style={{ fontSize: '14px' }}>ประเภทการคืน : {data.type} </Typography>
          {data.created_at !== '' && (
            <Typography style={{ fontSize: '14px' }}>วันที่ทำรายการ : {dayjs(data.created_at).format('DD/MM/YYYY')}</Typography>
          )}

          <TableContainer
            component={Paper}
            style={{
              width: '100%',
              marginTop: 20,

              boxShadow: 'rgba(0, 0, 0, 0.02) 0px 1px 3px 0px, rgba(27, 31, 35, 0.15) 0px 0px 0px 1px',
            }}>
            <Table aria-label="simple table" style={{ width: '95%' }}>
              <TableHead>
                <TableRow>
                  <TableCell align="center" style={{ border: '#000000 1px solid' }}>
                    <Typography>ราคา</Typography>
                  </TableCell>
                  <TableCell align="center" style={{ border: '#000000 1px solid' }}>
                    <Typography>จำนวนเล่ม</Typography>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {data.item.map((row: any) => (
                  <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                    <TableCell align="right" style={{ border: '#000000 1px solid' }}>
                      {formatBalance(row.price)}
                    </TableCell>
                    <TableCell align="right" style={{ border: '#000000 1px solid' }}>
                      {row.quantity}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <div style={{ justifyContent: 'right', display: 'flex', marginTop: 20, marginRight: 20 }}>
            <Typography>รวมทั้งหมด {data.total_item} รายการ</Typography>
          </div>
          <div style={{ justifyContent: 'space-between', display: 'flex', marginTop: 20, marginLeft: 5 }}>
            <Typography style={{ fontSize: '14px' }}>ผู้ส่งคืนสินค้า</Typography>
            <Typography sx={{ textAlign: 'center', marginRight: 2 }}>{genDot(40)}</Typography>
          </div>
          <div style={{ justifyContent: 'space-between', display: 'flex', marginTop: 20, marginLeft: 5 }}>
            <Typography style={{ fontSize: '14px' }}>ผู้รับคืน</Typography>
            <Typography sx={{ textAlign: 'right', marginRight: 2 }}>{genDot(40)}</Typography>
          </div>
          <div style={{ justifyContent: 'space-between', display: 'flex', marginTop: 20, marginLeft: 5 }}>
            <Typography style={{ fontSize: '14px' }}>คลังสินค้า</Typography>
            <Typography sx={{ textAlign: 'right', marginRight: 2 }}>{genDot(40)}</Typography>
          </div>
          <div
            style={{ width: '100%', display: 'flex', justifyContent: 'center', marginTop: '1.5rem', marginLeft: -3 }}>
            <Barcode value={data.ref_no} displayValue={false} height={40} />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Typography>{data.ref_no}</Typography>
          </div>
        </div>
      </div>
    )
  )
}
