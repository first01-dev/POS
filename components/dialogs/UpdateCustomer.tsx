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
import { DatePicker, LocalizationProvider } from '@mui/x-date-pickers'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import dayjs from 'dayjs'
import React from 'react'

interface UpdateCustomerProps {
  open: boolean
  onClose: () => void
  customer_name: any
  customer_phone: any
  customer_email: any
  customer_address: any
  customer_main_address: any
  onChangeCustomerData: (e: any) => void

  customer_birth_day: any
  onChangeDate: (e: any) => void
  cascaderAddress: any

  onChangeProvince: (e: any) => void
  onChangeDistrict: (e: any) => void
  onChangeSubDistrictAndPostCode: (e: any, a: any) => void

  onSubmit: () => void
}

export default function UpdateCustomer(props: UpdateCustomerProps) {
  const [province, setProvince] = React.useState('x')
  const [district, setDistrict] = React.useState('x')
  const [subDistrict, setSubDistrict] = React.useState('x')

  const [districtList, setDistrictList] = React.useState([])
  const [subDistrictList, setSubDistrictList] = React.useState([])

  React.useEffect(() => {
    if (props.customer_main_address[0] && props.open === true) {
      setProvince(props.customer_main_address[0])
    }
  }, [props.open])

  React.useEffect(() => {
    const district = props.cascaderAddress.find((item: any) => item.value === Number(province))
    if (district?.children && props.open === true) {
      setDistrictList(district?.children)
    }

    if (props.customer_main_address[1] && props.open === true) {
      setDistrict(props.customer_main_address[1])
    }

    if (province !== 'x') {
      props.onChangeProvince(province)
    }
  }, [province])

  React.useEffect(() => {
    const subDistrict: any = districtList.find((item: any) => item.value === Number(district))
    if (subDistrict?.children && props.open === true) {
      setSubDistrictList(subDistrict?.children)
    }

    const subDistrictValue = props.customer_main_address[2].split(' ')[1]
    if (subDistrictValue !== 'null' && subDistrictValue !== '' && props.open === true) {
      setSubDistrict(props.customer_main_address[2])
    }

    if (district !== 'x') {
      props.onChangeDistrict(district)
    }
  }, [district])

  React.useEffect(() => {
    if (subDistrict !== 'x') {
      const [subDistrictValue, postCode] = subDistrict.split(' ')
      props.onChangeSubDistrictAndPostCode(subDistrictValue, postCode)
    }
  }, [subDistrict])

  const onCloseDialog = () => {
    setProvince('x')
    setDistrict('x')
    setSubDistrict('x')
    setDistrictList([])
    setSubDistrictList([])
    props.onClose()
  }

  const onSubmit = () => {
    setProvince('x')
    setDistrict('x')
    setSubDistrict('x')
    setDistrictList([])
    setSubDistrictList([])
    props.onSubmit()
  }

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

  const isDisabled =
    !props.customer_name || !props.customer_phone || !props.customer_email || !isValidEmail(props.customer_email)

  return (
    <Dialog
      fullWidth
      open={props.open}
      PaperProps={{
        style: {
          borderRadius: 20,
        },
      }}
      aria-labelledby="alert-dialog-title">
      <div style={{ width: '95%', display: 'flex', justifyContent: 'space-between' }}>
        <DialogTitle id="alert-dialog-title">
          <Typography sx={{ fontSize: '16px' }}>แก้ไขข้อมูลลูกค้า</Typography>
        </DialogTitle>
        <div>
          <IconButton onClick={onCloseDialog} sx={{ mt: 1 }}>
            <ClearOutlined sx={{ color: '#FE5454' }} />
          </IconButton>
        </div>
      </div>

      <DialogContent className="grid" style={{ gap: 15 }}>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="form-input">
            {props.customer_name === '' ? <PermIdentity sx={{ color: '#FE5454' }} /> : <PermIdentity />}
            <InputBase
              onChange={props.onChangeCustomerData}
              value={props.customer_name}
              name="name"
              sx={{ width: '100%', ml: 2 }}
              placeholder="ชื่อผู้ใช้"
              inputProps={{
                'aria-label': 'ชื่อผู้ใช้',
              }}
            />
          </div>
          <div className="form-input">
            {props.customer_phone === '' ? <PhoneOutlined sx={{ color: '#FE5454' }} /> : <PhoneOutlined />}
            <InputBase
              value={props.customer_phone}
              onChange={handlePhoneInput}
              name="phone"
              sx={{ width: '100%', ml: 2 }}
              placeholder="เบอร์โทรศัพท์"
              inputProps={{
                'aria-label': 'เบอร์โทรศัพท์',
              }}
            />
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="form-input">
            {isDisabled ? <EmailOutlined style={{ color: '#FE5454' }} /> : <EmailOutlined />}

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
                slots={{
                  openPickerIcon: CakeOutlined,
                }}
                format="DD/MM/YYYY"
                className="borderless-date-picker"
                defaultValue={props.customer_birth_day ? dayjs(props.customer_birth_day) : undefined}
                onChange={props.onChangeDate}
              />
            </LocalizationProvider>
          </div>
        </div>

        {/* Address Selector Element*/}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <div className="form-input">
            <LocationCityOutlined className="btnicon" />
            <div className="select-address">
              <Select
                value={province}
                size="small"
                onChange={(e) => setProvince(e.target.value as string)}
                sx={{ width: '100%', borderRadius: 20 }}>
                <MenuItem value={province || 'x'} disabled key="">
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
                value={district}
                disabled={districtList?.length === 0}
                onChange={(e) => setDistrict(e.target.value as string)}
                sx={{ width: '100%', borderRadius: 20 }}>
                <MenuItem value={district || 'x'} disabled key="">
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
              value={subDistrict}
              disabled={subDistrictList?.length === 0}
              onChange={(e) => setSubDistrict(e.target.value as string)}
              sx={{ width: '100%', borderRadius: 20 }}>
              <MenuItem value={subDistrict || 'x'} disabled key="">
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
        {/* Address Selecter Element */}

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
        <Button disabled={isDisabled} className="btn-confirm w-90" variant="contained" onClick={onSubmit}>
          <Typography sx={{ fontSize: '16px' }}>บันทึก</Typography>
        </Button>
      </DialogActions>
    </Dialog>
  )
}
