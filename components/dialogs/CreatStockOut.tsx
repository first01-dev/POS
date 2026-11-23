import { ProductItem } from '@/models/type'
import { Search, SearchIconWrapper, SelectInputBase, StyledTableCell, StyledTableRow } from '@/services/StyleUtils'
import { ClearOutlined, DeleteForeverOutlined, Inventory2Outlined, SearchOutlined } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogProps,
  DialogTitle,
  FormControl,
  IconButton,
  InputBase,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import React from 'react'

interface CreatStockOutProps {
  open: boolean
  openAccept: boolean

  openCancel: boolean
  disabled: boolean
  isDisabled: boolean

  typeStock: string
  keyword: string
  placeholder: string
  note: string
  selectRider: string
  rider: any

  onNoteChange: (value: string) => void
  handleClose: () => void
  onOpenCancel: () => void
  onOpenComfirm: () => void

  handleSelectTypeStock: (e: any) => void
  handleSearchInput: (e: any) => void
  onAddProduct: () => void
  handleInputQuantity: (value: any, bo_code: string) => void
  onRemoveItem: (item: any) => void
  handleSelectRider: (e: any) => void
  selectedList: any
}
export default function CreatStockOut(props: CreatStockOutProps) {
  const [fullWidth] = React.useState(true)
  const [maxWidth] = React.useState<DialogProps['maxWidth']>('lg')
  return (
    <Dialog
      fullWidth={fullWidth}
      maxWidth={maxWidth}
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
            <Typography sx={{ fontSize: '16px' }}>คืนสินค้า</Typography>
          </DialogTitle>
        </div>
        <div>
          <IconButton onClick={props.handleClose} sx={{ mt: 1 }}>
            <ClearOutlined sx={{ color: '#FE5454' }} />
          </IconButton>
        </div>
      </div>

      <DialogContent sx={{ paddingBottom: 0, height: 600, marginTop: -2 }}>
        <Box className="bg-gray  p-10 mb-20" sx={{ gap: 2 }}>
          <div className="justify-start flex items-center" style={{ width: '80%' }}>
            {/* form ค้นหา */}
            <Typography sx={{ ml: 2 }}>ประเภทใบคืน</Typography>
            <FormControl sx={{ height: 40, ml: 2, width: 200 }}>
              <Select
                id="demo-multiple-chip-label"
                value={props.typeStock}
                onChange={props.handleSelectTypeStock}
                disabled={props.disabled}
                displayEmpty
                input={<SelectInputBase id="select-multiple-chip" />}
                sx={{ borderRadius: '20px', height: 50, width: '100%' }}>
                <MenuItem value="Normal">หนังสือสาขา</MenuItem>
                <MenuItem value="Warranty">เคลมสินค้า</MenuItem>
                <MenuItem value="Defective">หนังสือชำรุด</MenuItem>
                <MenuItem value="Buffet">บุฟเฟ่ต์</MenuItem>
                {props.disabled && <MenuItem value="Recall">เรียกคืน</MenuItem>}
              </Select>
            </FormControl>
            <div className="justify-start flex items-center w-60 ml-20" style={{ gap: 10 }}>
              <Typography className="w-30">ค้นหาสินค้า</Typography>
              <Search className="input" style={{ height: 40, backgroundColor: '#fff' }}>
                <SearchIconWrapper>
                  <Search />
                </SearchIconWrapper>
                <InputBase
                  className="input-base"
                  value={props.keyword}
                  placeholder={props.placeholder}
                  onChange={props.handleSearchInput}
                  inputProps={{ 'aria-label': 'search' }}
                />
              </Search>
              <Button
            variant="contained"
             disabled={props.keyword === ''}
                onClick={props.onAddProduct}
            startIcon={<SearchOutlined />}
            sx={{
              borderRadius: 10,
              minWidth: 80,
              boxShadow: 'none',
            }}>
            ค้นหา
          </Button>
             
            </div>
          </div>
        </Box>
        <div className="boxitemlist">
          <TableContainer
            component={Paper}
            sx={{
              width: '100%',
              borderRadius: '0px',
              border: 'none',
              overflowX: 'hidden',
              boxShadow: 'none',
            }}>
            <Table aria-label="customized table">
              <TableHead>
                <TableRow>
                  <StyledTableCell align="center" sx={{ width: 100 }}>
                    <Typography>ลำดับที่</Typography>
                  </StyledTableCell>
                  <StyledTableCell align="center">
                    <Typography>Barcode</Typography>
                  </StyledTableCell>
                  <StyledTableCell className="thead-text" align="center" sx={{ width: '500px' }}>
                    <Typography>ชื่อสินค้า</Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: '100px' }} className="thead-text" align="center">
                    <Typography>ราคาปก</Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: 100 }} className="thead-text" align="center">
                    <Typography>คงเหลือ</Typography>
                  </StyledTableCell>
                  <StyledTableCell className="thead-text" align="center">
                    <Typography>จำนวนคืน</Typography>
                  </StyledTableCell>
                  <StyledTableCell sx={{ width: 50 }} className="thead-text" align="center">
                    <Typography></Typography>
                  </StyledTableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {props.selectedList.length > 0 &&
                  props.selectedList.map((row: ProductItem, index: number) => (
                    <StyledTableRow key={index} sx={{ height: 20 }}>
                      <StyledTableCell component="th" scope="row" className="cellrequisitioninfo" align="center">
                        {props.selectedList.length - index}
                      </StyledTableCell>
                      <StyledTableCell
                        component="th"
                        scope="row"
                        sx={{ width: 90 }}
                        className="cellrequisitioninfo"
                        align="center">
                        {row.barcode}
                      </StyledTableCell>
                      <StyledTableCell className="cellrequisitioninfo" align="left">
                        {row.name}
                      </StyledTableCell>
                      <StyledTableCell className="cellrequisitioninfo" align="right" sx={{ width: '100px' }}>
                        {row.price}
                      </StyledTableCell>
                      <StyledTableCell className="cellrequisitioninfo" align="center">
                        {row.pro_quantity}
                      </StyledTableCell>
                      <StyledTableCell align="center" className="cellrequisitioninfo">
                        <InputBase
                          sx={{
                            pl: 1,
                            ml: 2,
                            borderRadius: '10px',
                            bgcolor: '#ffffff',
                            border: 1,
                            borderColor: '#E7E7E7',
                            color: 'primary',
                          }}
                          type="number"
                          name="qty"
                          value={row.quantity}
                          onChange={(e) => {
                            if (row.barcode !== undefined) {
                              props.handleInputQuantity(e.target.value, row.product_id)
                            }
                          }}
                          inputProps={{ 'aria-label': 'input' }}
                          placeholder="กรอกจำนวนสินค้า"
                        />
                      </StyledTableCell>
                      <StyledTableCell className="cellrequisitioninfo" align="center">
                        <div onClick={() => props.onRemoveItem(row.product_id)}>
                          <IconButton>
                            <DeleteForeverOutlined
                              sx={{
                                color: '#FE5454',
                              }}
                            />
                          </IconButton>
                        </div>
                      </StyledTableCell>
                    </StyledTableRow>
                  ))}
              </TableBody>
            </Table>
          </TableContainer>
        </div>

        <Box
          sx={{
            mt: -2,
            zIndex: 3,
            width: '100%',

            display: 'flex',
            alignItems: 'center',
            padding: 2,
            backgroundColor: '#F1F1F1',
          }}>
          <Typography sx={{ ml: 3 }}>หมายเหตุ</Typography>
          <InputBase
            className="noteInput"
            value={props.note}
            onChange={(e) => props.onNoteChange(e.target.value)}
            sx={{
              pl: 1,
              ml: 2,
              width: '50%',
              height: 40,
              borderRadius: '20px',
              bgcolor: '#ffffff',
              border: 1,
              borderColor: '#E7E7E7',
              color: 'primary',
            }}
            inputProps={{ 'aria-label': 'search' }}
          />
          

          <br />
        </Box>

        <DialogActions sx={{ px: 3, py: 2.5, gap: 1, display: 'flex', justifyContent: 'center' }}>
          <Button
          color='success'
            variant="contained"
            disabled={props.isDisabled}
            onClick={props.onOpenComfirm}
            startIcon={<Inventory2Outlined />}
            sx={{
              borderRadius: 10,
              minWidth: 140,
              boxShadow: 'none',
            }}>
            คืนสินค้า
          </Button>
          <Button
        
            onClick={props.onOpenCancel}
            color="inherit"
            variant="outlined"
            sx={{ borderRadius: 10, minWidth: 100 }}>
            รีเซ็ต
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  )
}
