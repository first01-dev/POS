import { ProductItem } from '@/models/type'
import { sumAll } from '@/services/MathUtils'
import { Item, StyledTableCell, StyledTableRow } from '@/services/StyleUtils'
import { ClearOutlined } from '@mui/icons-material'
import {
  Dialog,
  DialogContent,
  DialogProps,
  DialogTitle,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'
interface DetailProps {
  html: string
  open: boolean
  onClose: () => void
  text_ref_no: string
  text_title: string
  text_accecpt_qauntity?: string
  text_qauntity?: string
  text_product_accept_user?: string
  ref_no: any
  create_date: any
  instore_at?: any
  return_at?: any
  order_number?: string
  create_by_name?: any
  customer_name?: string
  customer_phone?: string
  total_quantity: any
  total_items?: any
  subtitle: any
  driver_name?: string
  shipping_name?: string
  shipping_track?: string
  shipping_on?: any
  type?: string
  note: any
  book_list: ProductItem[]
  accepted_quantity?: any
  sum_quantity?: any
  station_status?: string
  invoice_date?: string
}

export default function Detail(props: DetailProps) {
  const [maxWidth, setMaxWidth] = React.useState<DialogProps['maxWidth']>('lg')

  const getTatotalQuantity = sumAll(props.book_list || [], 'pro_quantity')
  const getTatotalAcceptQuantity = sumAll(props.book_list || [], 'product_accept_quantity')

  return (
    <Dialog
      maxWidth={maxWidth}
      fullWidth={true}
      open={props.open}
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
            <Typography sx={{ fontSize: '24px' }}>{props.subtitle}</Typography>
          </DialogTitle>
        </div>
        <div>
          <IconButton onClick={props.onClose} sx={{ mt: 1 }}>
            <ClearOutlined sx={{ color: '#FE5454' }} />
          </IconButton>
        </div>
      </div>
      <DialogContent>
        <Grid container>
          <Grid item xs={4}>
            <Item>
              <Typography sx={{ fontSize: '16px', ml: 1 }}>
                {props.text_ref_no} : {props.ref_no}
              </Typography>
            </Item>
          </Grid>

          {props.html === 'YaakzStation' && props.order_number && (
            <Grid item xs={4}>
              <Item>
                <Typography sx={{ fontSize: '16px', ml: 1 }}>เลขที่คำสั่งซื้อ : {props.order_number}</Typography>
              </Item>
            </Grid>
          )}

          {props.html !== 'YaakzStation' && (
            <Grid item xs={4}>
              <Item>
                <Typography sx={{ fontSize: '16px', ml: 1 }}>
                  {props.text_title} : {props.create_date}
                </Typography>
              </Item>
            </Grid>
          )}

          {props.html === 'YaakzStation' && (
            <Grid item xs={4}>
              <Item>
                {props.instore_at && props.instore_at !== 'Invalid Date' && (
                  <Typography sx={{ fontSize: '16px', ml: 1 }}>วันที่ : {props.instore_at} (รับเข้าร้าน)</Typography>
                )}
                {props.create_date && props.create_date !== 'Invalid Date' && (
                  <Typography sx={{ fontSize: '16px', ml: 1 }}>
                    {props.text_title} : {props.create_date} (ลูกค้ารับสินค้า)
                  </Typography>
                )}
                {props.return_at && props.return_at !== 'Invalid Date' && (
                  <Typography sx={{ fontSize: '16px', ml: 1 }}>วันที่ : {props.return_at} (ส่งคืนบริษัท)</Typography>
                )}
              </Item>
            </Grid>
          )}

          {props.create_by_name && (
            <Grid item xs={4}>
              <Item>
                <Typography sx={{ fontSize: '16px' }}>พนักงาน : {props.create_by_name}</Typography>
              </Item>
            </Grid>
          )}

          {props.text_ref_no === 'เลขที่ใบคืนสินค้า' && (
            <Grid item xs={4}>
              <Item>
                <Typography sx={{ fontSize: '16px', ml: 1, width: 400 }}>ประเภทการคืน : {props.type}</Typography>
              </Item>
            </Grid>
          )}

          {props.text_ref_no === 'เลขที่ใบคืนสินค้า' && props.shipping_on && (
            <Grid item xs={4}>
              <Item>
                <Typography sx={{ fontSize: '16px', ml: 1, width: 300 }}>วันที่จัดส่ง : {props.shipping_on}</Typography>
              </Item>
            </Grid>
          )}

          {props.text_ref_no === 'เลขที่ใบคืนสินค้า' && props.shipping_name && (
            <Grid item xs={4}>
              <Item>
                <Typography sx={{ fontSize: '16px', width: 300 }}>
                  ขนส่ง : {props.shipping_name === 'office' ? 'Office' : props.shipping_name} (
                  {props.shipping_name === 'สายลม'
                    ? props.shipping_track
                    : props.shipping_name === 'office'
                      ? props.driver_name
                      : ''}
                  )
                </Typography>
              </Item>
            </Grid>
          )}

          {props.html === 'YaakzStation' && (
            <Grid container>
              <Grid item xs={4}>
                <Item>
                  <Typography sx={{ fontSize: '16px', ml: 1 }}>จำนวน : {props.total_quantity} รายการ</Typography>
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item>
                  <Typography sx={{ fontSize: '16px', ml: 1 }}>ชื่อลูกค้า : {props.customer_name}</Typography>
                </Item>
              </Grid>
              <Grid item xs={4}>
                <Item>
                  <Typography sx={{ fontSize: '16px', ml: 1 }}>เบอร์โทรศัพท์: {props.customer_phone}</Typography>
                </Item>
              </Grid>
            </Grid>
          )}
        </Grid>

        <TableContainer component={Paper} style={{ width: '100%', marginTop: 20, justifyContent: 'center' }}>
          <Table aria-label="customized table">
            <TableHead>
              <TableRow>
                <StyledTableCell>
                  <Typography>Barcode</Typography>
                </StyledTableCell>
                <StyledTableCell>
                  <Typography>รายการ</Typography>
                </StyledTableCell>
                <StyledTableCell align="right" style={{ width: 100 }}>
                  <Typography sx={{ textAlign: 'right' }}>{props.text_qauntity}</Typography>
                </StyledTableCell>
                {props.text_accecpt_qauntity && (
                  <StyledTableCell align="right" style={{ width: 100 }}>
                    <Typography sx={{ textAlign: 'right' }}>{props.text_accecpt_qauntity}</Typography>
                  </StyledTableCell>
                )}
                {props.text_product_accept_user && (
                  <StyledTableCell align="right" style={{ width: 100 }}>
                    <Typography sx={{ textAlign: 'right' }}>{props.text_product_accept_user}</Typography>
                  </StyledTableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {props.book_list &&
                props.book_list.map((row: ProductItem, index: number) => (
                  <StyledTableRow>
                    <StyledTableCell style={{ width: 100 }}>{row.barcode}</StyledTableCell>
                    <StyledTableCell>{row.name}</StyledTableCell>
                    <StyledTableCell align="right">
                      {' '}
                      <Typography sx={{ textAlign: 'right', width: 100 }}>{row.pro_quantity}</Typography>
                    </StyledTableCell>

                    {props.text_accecpt_qauntity && (
                      <StyledTableCell align="right">
                        <Typography sx={{ textAlign: 'right', width: 100 }}>{row.product_accept_quantity}</Typography>
                      </StyledTableCell>
                    )}
                    {props.text_product_accept_user && (
                      <StyledTableCell align="right">
                        <Typography sx={{ textAlign: 'right', width: 100 }}>{row.product_accept_user}</Typography>
                      </StyledTableCell>
                    )}
                  </StyledTableRow>
                ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            marginTop: '-20px',
            paddingTop: 10,
            justifyContent: 'right',
          }}>
          <Typography sx={{ fontSize: '16px', ml: 2, mt: 5, width: 100, textAlign: 'right' }}>ทั้งหมด</Typography>
          <Typography sx={{ fontSize: '16px', ml: 5, mr: 2, mt: 5, width: 500, textAlign: 'left' }}>
            {props.total_items}
          </Typography>
          {typeof getTatotalQuantity === 'number' && !isNaN(getTatotalQuantity) && (
            <Typography sx={{ fontSize: '16px', ml: 2, mr: 2, mt: 5, width: 100, textAlign: 'right' }}>
              {getTatotalQuantity}
            </Typography>
          )}
          {typeof getTatotalAcceptQuantity === 'number' && !isNaN(getTatotalAcceptQuantity) && (
            <Typography sx={{ fontSize: '16px', ml: 2, mr: 2, mt: 5, width: 100, textAlign: 'right' }}>
              {getTatotalAcceptQuantity}
            </Typography>
          )}
          {props.text_product_accept_user && (
            <Typography
              sx={{
                fontSize: '16px',

                ml: 2,

                mt: 5,
                width: 100,
                textAlign: 'right',
              }}></Typography>
          )}
        </div>
        {props.note && (
          <div style={{ marginTop: 2, display: 'flex', justifyContent: 'right' }}>
            <div>
              <Typography>หมายเหตุ :</Typography>
            </div>
            <div>
              <Typography>{props.note}</Typography>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
