import {
  CakeOutlined,
  ClearOutlined,
  EmailOutlined,
  ImportContactsOutlined,
  LocationCityOutlined,
  PermIdentity,
  PhoneOutlined,
} from '@mui/icons-material'
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Typography,
} from '@mui/material'
import { DatePicker } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

import React from 'react'

interface CreateCustomerProps {
  open: boolean
  onClose: () => void
  customer_name: any
  customer_phone: any
  customer_email: any
  customer_address: any
  onChangeCustomerData: (e: any) => void

  onChangeDate: (e: any) => void
  cascaderAddress?: any

  onChangeProvince: (e: any) => void
  onChangeDistrict: (e: any) => void
  onChangeSubDistrictAndPostCode: (e: any, a: any) => void

  onSubmit: () => void
}

export default function CreateCustomer(props: CreateCustomerProps) {
  const [province, setProvince] = React.useState('')
  const [district, setDistrict] = React.useState('')
  const [subDistrict, setSubDistrict] = React.useState('')

  const [districtList, setDistrictList] = React.useState([])
  const [subDistrictList, setSubDistrictList] = React.useState([])

  React.useEffect(() => {
    const district = props.cascaderAddress.find((item: any) => item.value === province)
    setDistrictList(district?.children)
    setDistrict('')
    setSubDistrict('')
    props.onChangeProvince(province)
  }, [province])

  React.useEffect(() => {
    const subDistrict: any = districtList.find((item: any) => item.value === district)
    setSubDistrictList(subDistrict?.children)
    props.onChangeDistrict(district)
  }, [district])

  React.useEffect(() => {
    props.onChangeSubDistrictAndPostCode(subDistrict.split(' ')[0], subDistrict.split(' ')[1])
  }, [subDistrict])

  const handlePhoneInput = (e: { target: { value: string } }) => {
    const numericValue = e.target.value.replace(/\D/g, '')
    props.onChangeCustomerData({ target: { name: 'phone', value: numericValue } })
  }

  const handleEmailInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = e.target.value
      .toLowerCase()
      .replace(/\s/g, '')
      .replace(/[\u0E00-\u0E7F]/g, '') // กันภาษาไทย
      .replace(/[^a-z0-9@._-]/g, '') // allow email chars only

    props.onChangeCustomerData({
      target: {
        name: 'email',
        value: formattedValue,
      },
    })
  }

  const isValidEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const ValidateButton = () => {
    return !(
      props.customer_name !== '' &&
      props.customer_phone !== '' &&
      props.customer_email !== '' &&
      isValidEmail(props.customer_email)
    )
  }
  return (
    <Dialog
      fullWidth
      open={props.open}
      PaperProps={{
        style: {
          borderRadius: 20,
        },
      }}>
      <div style={{ width: '95%', display: 'flex', justifyContent: 'space-between' }}>
        <DialogTitle id="alert-dialog-title">
          <Typography sx={{ fontSize: '16px' }}>เพิ่มข้อมูลลูกค้า</Typography>
        </DialogTitle>

        <div>
          <IconButton onClick={props.onClose} sx={{ mt: 1 }}>
            <ClearOutlined sx={{ color: '#FE5454' }} />
          </IconButton>
        </div>
      </div>
      <DialogContent className="grid" style={{ gap: 15 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="form-input">
            {props.customer_name === '' ? <PermIdentity style={{ color: '#FE5454' }} /> : <PermIdentity />}
            <InputBase
              value={props.customer_name}
              name="name"
              onChange={props.onChangeCustomerData}
              sx={{ ml: 2, width: '100%' }}
              placeholder="ชื่อผู้ใช้*"
              inputProps={{ 'aria-label': 'ชื่อผู้ใช้' }}
            />
          </div>
          <div className="form-input">
            {props.customer_phone === '' ? <PhoneOutlined style={{ color: '#FE5454' }} /> : <PhoneOutlined />}
            <InputBase
              value={props.customer_phone}
              onChange={handlePhoneInput}
              name="phone"
              sx={{ width: '100%', ml: 2 }}
              placeholder="เบอร์โทรศัพท์*"
              inputProps={{
                'aria-label': 'เบอร์โทรศัพท์',
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="form-input">
            {props.customer_email === '' ? <EmailOutlined style={{ color: '#FE5454' }} /> : <EmailOutlined />}

            <InputBase
              value={props.customer_email}
              name="email"
              type="text"
              onChange={handleEmailInput}
              sx={{ ml: 2, width: '100%' }}
              placeholder="อีเมล์*"
              inputProps={{
                'aria-label': 'อีเมล์',
                inputMode: 'email',
                autoCapitalize: 'none',
                autoCorrect: 'off',
                spellCheck: false,
              }}
            />
          </div>
          
          <div className="form-input w-60">
            <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
              <DatePicker
                className="date-pixker"
                format="DD/MM/YYYY"
                onChange={props.onChangeDate}
                slots={{
                  openPickerIcon: CakeOutlined,
                }}
              />
            </LocalizationProvider>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="form-input">
            <LocationCityOutlined className="btnicon" />
            <div className="select-address">
              <Select
                defaultValue={'x'}
                size="small"
                onChange={(e) => setProvince(e.target.value as string)}
                sx={{ width: '100%', borderRadius: 20 }}>
                <MenuItem value="x" disabled key="">
                  กรุณาเลือกจังหวัด
                </MenuItem>
                {props.cascaderAddress.map((item: any) => (
                  <MenuItem value={item.value} key={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
              </Select>
            </div>
          </div>
          <div className="form-input">
            <LocationCityOutlined className="btnicon" />
            <div className="select-address">
              <Select
                size="small"
                defaultValue={'x'}
                disabled={districtList?.length === 0}
                onChange={(e) => setDistrict(e.target.value as string)}
                sx={{ width: '100%', borderRadius: 20 }}>
                <MenuItem value="x" disabled key="">
                  กรุณาเลือกอำเภอ
                </MenuItem>
                {districtList &&
                  districtList.map((item: any) => (
                    <MenuItem value={item.value} key={item.value}>
                      {item.label}
                    </MenuItem>
                  ))}
              </Select>
            </div>
          </div>
        </div>
        <div className="form-input w-50">
          <LocationCityOutlined className="btnicon" />
          <div className="select-address">
            <Select
              size="small"
              defaultValue={'x'}
              disabled={subDistrictList?.length === 0}
              onChange={(e) => setSubDistrict(e.target.value as string)}
              sx={{ width: '100%', borderRadius: 20 }}>
              <MenuItem value="x" disabled key="">
                กรุณาเลือกตำบล
              </MenuItem>
              {subDistrictList &&
                subDistrictList.map((item: any) => (
                  <MenuItem value={item.value} key={item.value}>
                    {item.label}
                  </MenuItem>
                ))}
            </Select>
          </div>
        </div>
        <div className="form-input w-95">
          <ImportContactsOutlined className="btnicon" />
          <InputBase
            value={props.customer_address}
            name="address"
            onChange={props.onChangeCustomerData}
            sx={{ ml: 2, width: '100%' }}
            placeholder="ที่อยู่เพิ่มเติม"
            inputProps={{ 'aria-label': 'ที่อยู่' }}
          />
        </div>
      </DialogContent>
      <DialogActions className="flex justify-center mb-2 w-full">
        <Button disabled={ValidateButton()} className="btn-confirm w-90" variant="contained" onClick={props.onSubmit}>
          <Typography sx={{ fontSize: '16px' }}>บันทึก</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  )
}
