import { Item } from '@/services/StyleUtils'
import {
  AccountBalanceWalletRounded,
  CircleRounded,
  CreditCardRounded,
  PaidOutlined,
  QrCode2Rounded,
} from '@mui/icons-material'
import { Box, Button, Typography } from '@mui/material'
import Grid from '@mui/material/Grid'

import * as React from 'react'

import { PaymentInfo, PaymentSelection } from '../models/type'

interface PaymentSelectorProps {
  paymentList?: PaymentInfo[]
  onSelect: (payment: PaymentSelection) => void
  edcConnect?: boolean
}

export default function PaymentSelector({ paymentList, onSelect, edcConnect }: PaymentSelectorProps) {
  const [selectedEDC, setSelectedEDC] = React.useState<'edc-qr' | 'edc-credit' | null>(null)

  const clearButtonSelection = () => {
    paymentList?.forEach((_, index) => {
      const btn = document.querySelector(`.btnpay${index}`)
      btn?.classList.remove('btnpay-selected')
    })
  }

  const handleSelect = (payment: PaymentInfo, indexSelect: number) => {
    setSelectedEDC(null)
    clearButtonSelection()
    const btn = document.querySelector(`.btnpay${indexSelect}`)
    btn?.classList.add('btnpay-selected')
    onSelect(payment)
  }

  const handleEDCSelect = (key: 'edc-qr' | 'edc-credit') => {
    setSelectedEDC(key)
    clearButtonSelection()
    onSelect({ edcType: key })
  }

  const getIcon = (paymentId: number) => {
    switch (paymentId) {
      case 6:
        return <QrCode2Rounded />
      case 5:
        return <CreditCardRounded />
      case 1:
        return <PaidOutlined />
      default:
        return <AccountBalanceWalletRounded />
    }
  }

  const renderEDCButton = (label: string, key: 'edc-qr' | 'edc-credit', onClick: () => void) => (
    <Item>
      <Button
        variant="contained"
        color="secondary"
        className={`btnpay ${selectedEDC === key ? 'btnpay-selected' : ''}`}
        onClick={onClick}>
        <div className="btn-payment-text">
          <CircleRounded
            style={{
              marginTop: -20,
              width: 15,
              height: 15,
              color: edcConnect ? '#27ae60' : '#FF0033',
              marginRight: -130,
            }}
          />
          <div className="btn-payment-icon"/>
         <Typography> {label}</Typography>
        </div>
      </Button>
    </Item>
  )

  return (
    <Box>
      <Grid container spacing={2}>
        <Grid sx={{ display: 'flex', justifyContent: 'space-between' }}>
          {paymentList?.map((payment, index) => (
            <Item key={payment.id}>
              <Button
                className={`btnpay btnpay${index}`}
                onClick={() => handleSelect(payment, index)}
                variant="contained"
                color="secondary">
                <div className="btn-payment-text">
                  <div className="btn-payment-icon">{getIcon(Number(payment.id))}</div>
                  <Typography>{payment.name}</Typography>
                </div>
              </Button>
            </Item>
          ))}
        </Grid>

        <Grid container spacing={2} style={{ margin: 0 }}>
          <Grid>{renderEDCButton('EDC-พร้อมเพย์', 'edc-qr', () => handleEDCSelect('edc-qr'))}</Grid>
          <Grid>{renderEDCButton('EDC-บัตรเครดิต', 'edc-credit', () => handleEDCSelect('edc-credit'))}</Grid>
        </Grid>
      </Grid>
    </Box>
  )
}
