import { OrderSentType } from '@/models/constants'
import { CartItem } from '@/models/type'
import { Table, TableBody, TableCell, TableHead, TableRow, Typography } from '@mui/material'

interface CheckOutOrderProps {
  cart: CartItem[]
  SentType: string
  CustomerName: string
  CustomerPhone: string
  CustomerAddress: any
  CustomerRawAddress: string
  address: any
  selectedCustomer?: any
}

export default function CheckOutOrder(props: CheckOutOrderProps) {
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

  const getAddressTextWithName = () => {
    const selectedCustomer = props.selectedCustomer

    // 1️⃣ ถ้ามี selectedCustomer
    if (selectedCustomer) {
      const { address, sub_district, district, province, zip_code } = selectedCustomer

      if (props.address && Array.isArray(props.address)) {
        // หา province
        const provinceItem = props.address.find((p: any) => String(p.value) === String(province))
        if (provinceItem) {
          const districtItem = provinceItem.children?.find((d: any) => String(d.value) === String(district))
          if (districtItem) {
            const subDistrictItem = districtItem.children?.find(
              (s: any) => String(s.value).split(' ')[0] === String(sub_district)
            )

            const parts = [
              address, // บ้านเลขที่
              subDistrictItem ? subDistrictItem.label.split(' ')[0] : sub_district,
              districtItem.label || district,
              provinceItem.label || province,
              zip_code,
            ].filter(Boolean)

            return parts.join(' ')
          }
        }
      }

      // ถ้า id ไม่ match กับ address array ให้ fallback เป็น string id เดิม
      return [address, sub_district, district, province, zip_code].filter(Boolean).join(' ')
    }

    // 2️⃣ ถ้าไม่มี selectedCustomer ให้ fallback เป็น props.CustomerAddress
    if (props.CustomerAddress && Array.isArray(props.CustomerAddress) && props.CustomerAddress.length >= 4) {
      const postCode = props.CustomerAddress[3]
      const subDistrict = props.CustomerAddress[2]
      const district = props.CustomerAddress[1]
      const province = String(props.CustomerAddress[0])

      if (props.address && Array.isArray(props.address)) {
        let provinceLabel = province
        let districtLabel = district
        let subDistrictLabel = subDistrict

        props.address.forEach((p: any) => {
          if (String(p.value) === province) {
            provinceLabel = p.label
            p.children?.forEach((d: any) => {
              if (String(d.value) === district) {
                districtLabel = d.label
                d.children?.forEach((s: any) => {
                  if (s.value && s.value.split(' ')[0] === subDistrict) {
                    subDistrictLabel = s.label.split(' ')[0]
                  }
                })
              }
            })
          }
        })

        return [subDistrictLabel, districtLabel, provinceLabel, postCode].filter(Boolean).join(' ')
      }

      return [subDistrict, district, province, postCode].filter(Boolean).join(' ')
    }

    return 'ไม่พบข้อมูลที่อยู่'
  }

  // [Method] - รูปแบบการแสดงค่าเงิน
  const formatMoney = (amount: number) => {
    return amount.toLocaleString('th-TH', { minimumFractionDigits: 2 })
  }

  return (
    <div className="main-container-chk">
      <div className="header-chk">
        <Typography className="header-type-text">{getTextOrderSentType(props.SentType)}</Typography>
        {props.SentType !== 'normal' && (
          <div className="header-type-subtext">
            <Typography>
              {props.CustomerName} {props.CustomerPhone}
            </Typography>

            <Typography>{getAddressTextWithName()}</Typography>
          </div>
        )}
      </div>
      <div className="table-container">
        <Table sx={{ minWidth: '100%', bg: 'whitesmoke' }} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell
                sx={{
                  width: 50,
                  fontSize: '14px',
                  border: 'none',
                  textAlign: 'center',
                }}>
                จำนวน
              </TableCell>
              <TableCell
                className="totalcart"
                sx={{
                  border: 'none',
                  width: 300,
                  fontSize: '14px',
                }}
                align="center">
                รายการ
              </TableCell>
              <TableCell
                sx={{
                  border: 'none',
                  width: 50,
                  fontSize: '14px',
                  paddingRight: '0px',
                  paddingLeft: '0px',
                }}
                align="left">
                ราคาปก
              </TableCell>
            </TableRow>
          </TableHead>
          {props.cart.map((item) => (
            <TableBody key={item.product_id}>
              <TableRow>
                <TableCell
                  sx={{
                    width: 30,
                    fontSize: '14px',
                    border: 'none',
                    textAlign: 'center',
                  }}
                  className="tablecartitem2">
                  <Typography
                    sx={{
                      fontSize: '14px',
                    }}>
                    {item.quantity}
                  </Typography>
                </TableCell>
                <TableCell
                  className="tablecartitem2"
                  sx={{
                    border: 'none',
                    width: 300,
                  }}
                  align="left">
                  <Typography>{item.product_name}</Typography>
                </TableCell>
                <TableCell
                  className="tablecartitem"
                  sx={{
                    border: 'none',
                  }}
                  align="left">
                  <Typography
                    sx={{
                      fontSize: '14px',
                    }}>
                    {formatMoney(item.product_price)}
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          ))}
        </Table>
      </div>
    </div>
  )
}
