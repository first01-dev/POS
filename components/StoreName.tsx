import { Box, Typography } from '@mui/material'

interface StoreNameProps {
  text: string
  store: any
  currentUser: any
  icon?: any
}
export function StoreName({ text, store, currentUser, icon }: StoreNameProps) {
  return (
    <Box display="flex" alignItems="center">
      {icon}
      <Typography>
        {text} - {store} - {currentUser} (กำลังใช้งาน)
      </Typography>
    </Box>
  )
}
