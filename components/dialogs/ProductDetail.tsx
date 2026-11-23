import { getImageUrlFromDynamic } from '@/services/StringUtils'
import { ClearOutlined } from '@mui/icons-material'
import { CardMedia, Dialog, DialogContent, DialogProps, DialogTitle, IconButton, Typography } from '@mui/material'
import React from 'react'

interface ProductDetailProps {
  html: string
  text?: string
  open: boolean
  onClose: () => void
  p_image?: any
  p_name?: any
  book_no?: any
  product_price?: any
  p_isbn?: any
  p_book_code?: any
  p_publishing?: any
  release_date?: any
  p_qty?: any
}

export default function ProductDetail(props: ProductDetailProps) {
  const [maxWidth2, setMaxWidth2] = React.useState<DialogProps['maxWidth']>('md')

  return (
    <Dialog
      maxWidth={maxWidth2}
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
            <Typography sx={{ fontSize: '16px' }}>รายละเอียดสินค้า</Typography>
          </DialogTitle>
        </div>
        <div>
          <IconButton onClick={props.onClose} sx={{ mt: 1 }}>
            <ClearOutlined sx={{ color: '#FE5454' }} />
          </IconButton>
        </div>
      </div>

      <DialogContent sx={{ ml: 3 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          {props.p_image && (
            <div style={{ width: '30%', display: 'flex', justifyContent: 'center' }}>
              <CardMedia
                component="img"
                referrerPolicy="no-referrer"
                src={getImageUrlFromDynamic(props.p_image)}
                alt="ไม่มีภาพปก"
                sx={{ objectFit: 'contain' }}
              />
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '50%' }}>
            <div style={{ display: 'grid', gap: 10, width: '30%' }}>
              <Typography>ชื่อหนังสือ :</Typography>
              {props.book_no != '' && <Typography>เล่มที่ :</Typography>}
              <Typography>ราคาปก</Typography>
              <Typography>Barcode :</Typography>
              <Typography>รหัสหนังสือ :</Typography>
              <Typography>สำนักพิมพ์ :</Typography>
              <Typography>วันที่วางจำหน่าย :</Typography>
              <Typography>จำนวนสินค้า :</Typography>
            </div>
            <div style={{ display: 'grid', gap: 10, width: '70%' }}>
              <Typography>{props.p_name}</Typography>
              {props.book_no != '' && <Typography>{props.book_no}</Typography>}
              <Typography>{props.product_price}</Typography>
              <Typography>{props.p_isbn}</Typography>
              <Typography>{props.p_book_code}</Typography>
              <Typography>{props.p_publishing}</Typography>
              <Typography>{props.release_date}</Typography>
              <Typography>{props.p_qty}</Typography>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
