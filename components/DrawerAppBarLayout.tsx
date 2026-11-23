import { clearAllLocalStorage } from '@/services/StorageUtils'
import {
  AddToPhotosOutlined,
  AssessmentOutlined,
  AssignmentOutlined,
  ChangeCircleOutlined,
  Input,
  InventoryOutlined,
  LocalMallOutlined,
  LogoutOutlined,
  PresentToAllOutlined,
  ReceiptLongRounded,
  ShowChartOutlined,
  StorefrontOutlined
} from '@mui/icons-material'
import { Box, Drawer, ListItemButton, ListItemIcon, Typography } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/router'
import React from 'react'
import mypic from '../assets/images/Yaakz_Profile-1000-01_(1)-transformed.png'

const drawerWidth = 100

export default function DrawerAppBarLayout() {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  const router = useRouter()
  const isActive = (path: string) => router.asPath === path
  const onLogout = () => {
    clearAllLocalStorage()
    router.push('/')
  }

  const iconBox = (active: boolean) => ({
    borderRadius: '10px',
    marginLeft: '5px',
    marginRight:'5px',
    padding: 0,
    backgroundColor: active ? '#da2323' : 'transparent',
    transition: '0.2s',
  })

  const drawer = (
    <div>
      <div style={{ color: '#FFFFFF',display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: 10 }}>
        <Image style={{ justifyContent: 'center' }} priority src={mypic} rel="preload" width={80} height={80} alt="" />
      </div>
      <div className="active" style={{ marginTop: -20 }}>
        <Box sx={iconBox(isActive('/cashier/'))}>
          <ListItemButton
           
            sx={{ p: '8px', justifyContent: 'space-evenly',opacity: 1
   
     }}
            href="/cashier">
            <ListItemIcon
              sx={{
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
             
              }}>
              <StorefrontOutlined className="icon-sidebar" />

              <Typography sx={{ fontSize: 12 }}>POS B</Typography>
            </ListItemIcon>
          </ListItemButton>
        </Box>
        {/* <ListItemButton
          disabled={router.asPath === '/cashier_c' ? true : false}
          sx={{ p: '8px', justifyContent: 'space-evenly' }}
          href="/cashier_c">
          <ListItemIcon
            sx={{
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-evenly',
              alignItems: 'center',
            }}>
            <StorefrontOutlined className="icon-sidebar" suppressHydrationWarning></StorefrontOutlined>
            <Typography sx={{ fontSize: 12 }}>POS C</Typography>
          </ListItemIcon>
        </ListItemButton> */}
        {/* <Box sx={iconBox(isActive('/void/'))}>
          <ListItemButton
    
            sx={{ p: '8px', justifyContent: 'space-evenly' }}
            href="/void">
            <ListItemIcon
              sx={{
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <ReplayRounded className="icon-sidebar" suppressHydrationWarning></ReplayRounded>
              <Typography sx={{ fontSize: 12 }}>Void</Typography>
            </ListItemIcon>
          </ListItemButton>
        </Box> */}
        <Box sx={iconBox(isActive('/order_list/'))}>
          <ListItemButton
          
            sx={{ p: '8px', justifyContent: 'space-evenly' }}
            href="/order_list">
            <ListItemIcon
              sx={{
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <InventoryOutlined className="icon-sidebar" suppressHydrationWarning></InventoryOutlined>
              <Typography sx={{ fontSize: 12 }}>คำสั่งซื้อ</Typography>
            </ListItemIcon>
          </ListItemButton>
        </Box>

        <Box sx={iconBox(isActive('/invoice_list/'))}>
          <ListItemButton
            
            sx={{ p: '8px', justifyContent: 'space-evenly' }}
            href="/invoice_list">
            <ListItemIcon
              sx={{
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <Input className="icon-sidebar" suppressHydrationWarning></Input>
              <Typography sx={{ fontSize: 12 }}>รับสินค้า</Typography>
            </ListItemIcon>
          </ListItemButton>
        </Box>

        <Box sx={iconBox(isActive('/requisition_list/'))}>
          <ListItemButton
           
            sx={{ p: '8px', justifyContent: 'space-evenly' }}
            href="/requisition_list">
            <ListItemIcon
              sx={{
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <AddToPhotosOutlined className="icon-sidebar" suppressHydrationWarning />
              <Typography sx={{ fontSize: 12 }}>เบิกสินค้า</Typography>
            </ListItemIcon>
          </ListItemButton>
        </Box>

        <Box sx={iconBox(isActive('/stock_out/'))}>
          <ListItemButton
          
            sx={{ p: '8px', justifyContent: 'space-evenly' }}
            href="/stock_out">
            <ListItemIcon
              sx={{
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <PresentToAllOutlined className="icon-sidebar" suppressHydrationWarning />
              <Typography sx={{ fontSize: 12 }}>คืนสินค้า</Typography>
            </ListItemIcon>
          </ListItemButton>
        </Box>

        <Box sx={iconBox(isActive('/stock_list/'))}>
          <ListItemButton
           
            href="/stock_list"
            sx={{
              p: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ListItemIcon
              sx={{
                p: 0,
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <AssignmentOutlined className="icon-sidebar" suppressHydrationWarning />
              <Typography
                sx={{
                  fontSize: 11,
                  width: 60,
                  lineHeight: 1.1,
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}>
                สินค้าในสาขา
              </Typography>
            </ListItemIcon>
          </ListItemButton>
        </Box>

        <Box sx={iconBox(isActive('/yaakz_station/'))}>
          <ListItemButton
           
            href="/yaakz_station"
            sx={{
              p: '8px',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ListItemIcon
              sx={{
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: 0,
                textAlign: 'center',
              }}>
              <LocalMallOutlined className="icon-sidebar" />

              <Typography
                sx={{
                  fontSize: 11,
                  width: 60, 
                  lineHeight: 1.1,
                  textAlign: 'center',
                  wordBreak: 'break-word',
                }}>
                Yaakz Station
              </Typography>
            </ListItemIcon>
          </ListItemButton>
        </Box>

        <Box sx={iconBox(isActive('/dashboard/'))}>
          <ListItemButton
          
            sx={{ p: '8px', justifyContent: 'space-evenly' }}
            href="/dashboard">
            <ListItemIcon
              sx={{
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <AssessmentOutlined className="icon-sidebar" suppressHydrationWarning />
              <Typography sx={{ fontSize: 12 }}>Dashboard</Typography>
            </ListItemIcon>
          </ListItemButton>
        </Box>

        <Box sx={iconBox(isActive('/report/'))}>
          <ListItemButton
        
            sx={{ p: '8px', justifyContent: 'space-evenly' }}
            href="/report">
            <ListItemIcon
              sx={{
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <ShowChartOutlined className="icon-sidebar" suppressHydrationWarning />
              <Typography sx={{ fontSize: 12 }}>Report</Typography>
            </ListItemIcon>
          </ListItemButton>
        </Box>

        <Box sx={iconBox(isActive('/book_claim/'))}>
          <ListItemButton
         
            sx={{ p: '8px', justifyContent: 'space-evenly' }}
            href="/book_claim">
            <ListItemIcon
              sx={{
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <ChangeCircleOutlined className="icon-sidebar" suppressHydrationWarning />
              <Typography sx={{ fontSize: 12 }}>เคลมหนังสือ</Typography>
            </ListItemIcon>
          </ListItemButton>
        </Box>

        <Box sx={iconBox(isActive('/record_buffet/'))}>
          <ListItemButton
            
            sx={{ p: '8px', justifyContent: 'space-evenly' }}
            href="/record_buffet">
            <ListItemIcon
              sx={{
                color: '#FFFFFF',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-evenly',
                alignItems: 'center',
              }}>
              <ReceiptLongRounded className="icon-sidebar" suppressHydrationWarning />
              <Typography sx={{  fontSize: 11,
                  width: 60,
                  lineHeight: 1.1,
                  textAlign: 'center',
                  wordBreak: 'break-word', }}>Buffet Collection</Typography>
            </ListItemIcon>
          </ListItemButton>
        </Box>
      </div>
    </div>
  )

  return (
    <>
      <Box
        component="nav"
        id="drawer-sidebar"
        sx={{
          width: { sm: drawerWidth },
          flexShrink: { sm: 0 },
          borderRadius: 10,
        }}
        aria-label="mailbox folders">
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
              display: 'flex',
              justifyContent: 'space-between',
              border: 'none',
              boxShadow:
                'rgba(0, 0, 0, 0.07) 0px 1px 2px, rgba(0, 0, 0, 0.07) 0px 2px 4px, rgba(0, 0, 0, 0.07) 0px 4px 8px, rgba(0, 0, 0, 0.07) 0px 8px 16px, rgba(0, 0, 0, 0.07) 0px 16px 32px, rgba(0, 0, 0, 0.07) 0px 32px 64px;',
              backgroundColor: '#FE5454',
            },
          }}
          open>
          {drawer}

          <div>
            <ListItemButton onClick={onLogout} sx={{ p: '8px', justifyContent: 'space-evenly' }}>
              <ListItemIcon
                sx={{
                  color: '#FFFFFF',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-evenly',
                  alignItems: 'center',
                }}>
                <LogoutOutlined className="icon-sidebar" suppressHydrationWarning></LogoutOutlined>
                <Typography sx={{ fontSize: 12 }}>ออกจากระบบ</Typography>
              </ListItemIcon>
            </ListItemButton>
          </div>
        </Drawer>
      </Box>
    </>
  )
}
