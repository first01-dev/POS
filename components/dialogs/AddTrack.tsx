import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Select,
  Stack,
  Typography,
} from '@mui/material'

import { SelectInputBase } from '@/services/StyleUtils'
import Inventory2OutlinedIcon from '@mui/icons-material/Inventory2Outlined'
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'

import { ClearOutlined } from '@mui/icons-material'
import dayjs from 'dayjs'
import React from 'react'

interface AddtrackProps {
  open: boolean
  text: string
  shipping: { id: number; text: string }[]
  rider: any
  selectedShipping: string
  selectRider: string
  invoice_number?: any
  trackNumber: string
  shippingDate: string

  handleSelectRider: (e: any) => void
  handleSelectedShipping: (e: any) => void
  setShippingDate: (date: string) => void
  setTrackNumber: (value: string) => void

  onClose: () => void
  onSave: () => void
}

export default function AddTrack(props: AddtrackProps) {
  const [trackNumber, setTrackNumber] = React.useState('')
  const [shippingDate, setShippingDate] = React.useState(new Date().toISOString().slice(0, 10))

  const handleSave = () => {
    if (props.selectedShipping === '' || !shippingDate) {
      return
    }

    if (Number(props.selectedShipping) !== 1 && !props.trackNumber) {
      return
    }

    props.onSave()
  }

  return (
    <Dialog
      open={props.open}
      //   onClose={props.onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            overflow: 'hidden',
          },
        },
      }}>
      {/* Header */}
      <DialogTitle sx={{ px: 3, pt: 3, pb: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography fontSize={20} fontWeight={700}>
            {props.text}
          </Typography>
          <div>
            <IconButton onClick={props.onClose}>
              <ClearOutlined sx={{ color: '#FE5454' }} />
            </IconButton>
          </div>
        </Box>
      </DialogTitle>

      <Divider />

      <DialogContent sx={{ p: 3 }}>
        <Stack spacing={3}>
          {/* รายการใบคืน */}
          <Box>
            <Box
              sx={{
                p: 2,
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2.5,
                bgcolor: 'action.hover',
              }}>
              <Typography variant="body2" color="text.secondary" mb={0.5}>
                เลขที่ใบคืน
              </Typography>
              {props.invoice_number.map((item: any) => (
                <div key={item.id}>{item.ref_no}</div>
              ))}
            </Box>
          </Box>

          {/* ข้อมูลการจัดส่ง */}
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={2.5}>
              <LocalShippingOutlinedIcon color="primary" />
              <Typography fontWeight={700} fontSize={16}>
                ข้อมูลการจัดส่ง
              </Typography>
            </Stack>

            {/* ขนส่ง */}
            <Box>
              <Typography fontSize={13} fontWeight={600} mb={1}>
                ขนส่ง{' '}
                <Box component="span" color="error.main">
                  *
                </Box>
              </Typography>

              <FormControl fullWidth>
                <Select
                  value={props.selectedShipping}
                  onChange={props.handleSelectedShipping}
                  id="demo-multiple-chip-label"
                  displayEmpty
                  input={<SelectInputBase id="select-multiple-chip" />}
                  defaultValue=""
                  renderValue={(selected) => {
                    if (selected.length === 0) {
                      return <em>เลือกขนส่ง</em>
                    }

                    const selectedShipping = props.shipping?.find((item: any) => item.id === selected)

                    if (!selectedShipping) return ''

                    return selectedShipping.text === 'office' ? 'Office' : selectedShipping.text
                  }}
                  sx={{
                    fontSize: '14px',
                    borderRadius: '20px',
                    height: 50,
                    bgcolor: '#f1f1f1',
                    border: 1,
                    borderColor: '#E7E7E7',
                  }}>
                  {props.shipping &&
                    props.shipping.map((item: any, index: number) => (
                      <MenuItem key={index} value={item.id}>
                        {item.text === 'office' ? 'Office' : item.text}
                      </MenuItem>
                    ))}
                </Select>
              </FormControl>
            </Box>

            {/* เลข Tracking */}

            {Number(props.selectedShipping) === 1 ? (
              <Box>
                <Typography fontSize={13} fontWeight={600} mb={1} mt={1}>
                  พนักงานขับรถ
                  <Box component="span" color="error.main">
                    *
                  </Box>
                </Typography>
                <FormControl fullWidth>
                  <Select
                    value={props.selectRider}
                    onChange={props.handleSelectRider}
                    id="demo-multiple-chip-label"
                    displayEmpty
                    input={<SelectInputBase id="select-multiple-chip" />}
                    defaultValue=""
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return <em>เลือกพนักงานขับรถ</em>
                      }
                      const selectedRider = props.rider?.find((item: any) => item.id === selected)
                      return selectedRider ? selectedRider.name : ''
                    }}
                    sx={{
                      fontSize: '14px',
                      borderRadius: '20px',
                      height: 50,
                      bgcolor: '#f1f1f1',
                      border: 1,
                      borderColor: '#E7E7E7',
                    }}>
                    {props.rider &&
                      props.rider.map((item: any, index: number) => (
                        <MenuItem key={index} value={item.id}>
                          {item.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Box>
            ) : (
              <Box>
                <Typography fontSize={13} fontWeight={600} mb={1} mt={1}>
                  เลข Tracking{' '}
                  <Box component="span" color="error.main">
                    *
                  </Box>
                </Typography>

                <InputBase
                  className="noteInput"
                  placeholder="กรอกเลขพัสดุ"
                  value={props.trackNumber}
                  onChange={(event) => props.setTrackNumber(event.target.value)}
                  sx={{
                    width: '100%',
                    height: 48,
                    px: 1.5,
                    borderRadius: '20px',
                    bgcolor: '#f1f1f1',
                    border: '1px solid #E0E3E7',
                    color: '#333',
                    fontSize: 14,
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}
                  inputProps={{ 'aria-label': 'เลข Tracking' }}
                />
              </Box>
            )}

            {/* วันที่จัดส่ง */}
            <Box>
              <Typography fontSize={13} fontWeight={600} mt={1}>
                วันที่จัดส่ง{' '}
                <Box component="span" color="error.main">
                  *
                </Box>
              </Typography>

              <div
                className="w-full h-90 flex justify-between items-center rounded-20 p-0"
                style={{ backgroundColor: '#f1f1f1' }}>
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="th">
                  <DateTimePicker
                    format="DD/MM/YYYY HH:mm"
                    ampm={false}
                    value={props.shippingDate ? dayjs(props.shippingDate) : dayjs()}
                    onChange={(newValue) => {
                      props.setShippingDate(
                        newValue && newValue.isValid() ? newValue.format('YYYY-MM-DD HH:mm:ss') : ''
                      )
                    }}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        placeholder: 'วัน/เดือน/ปี ชั่วโมง:นาที',
                        size: 'medium',
                        sx: {
                          height: 48,
                          borderRadius: '10px',

                          fontSize: 14,

                          '& .MuiInputBase-input': {
                            py: 1.5,
                          },
                        },
                      },
                    }}
                  />
                </LocalizationProvider>
              </div>
            </Box>
          </Box>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2.5, gap: 1, display: 'flex', justifyContent: 'center' }}>
        <Button
          color="success"
          onClick={handleSave}
          variant="contained"
          disabled={
            props.selectedShipping === '' ||
            !shippingDate ||
            (Number(props.selectedShipping) !== 2 && props.selectRider === '') ||
            (Number(props.selectedShipping) !== 1 && !props.trackNumber.trim())
          }
          startIcon={<Inventory2OutlinedIcon />}
          sx={{
            borderRadius: 10,
            minWidth: 140,
            boxShadow: 'none',
          }}>
          บันทึกข้อมูล
        </Button>
        <Button onClick={props.onClose} color="inherit" variant="outlined" sx={{ borderRadius: 10, minWidth: 100 }}>
          ยกเลิก
        </Button>
      </DialogActions>
    </Dialog>
  )
}
