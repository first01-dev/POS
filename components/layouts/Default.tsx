import { Box } from '@mui/material'
import { useRouter } from 'next/router'
import DrawerAppBarLayout from '../DrawerAppBarLayout'

type Defualt = {
  children: React.ReactNode
}

export default function Layout({ children }: Defualt) {
  const router = useRouter()
  return (
    <Box sx={{ display: 'flex' }}>
      <DrawerAppBarLayout />

      <Box
        component="main"
        sx={{
          ml: 0, // ⭐ เคลียร์ตัวนี้
          width: '100%',
          minHeight: '100vh',
          p: router.pathname === '/cashier' ? 0 : 5,
        }}>
        {children}
      </Box>
    </Box>
  )
}
