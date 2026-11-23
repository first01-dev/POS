import { Backdrop, Box, LinearProgress, Typography } from '@mui/material'

interface LoadingScreenProps {
  open: boolean
  percentage: number
  text: string
}

export default function LoadingScreen(props: LoadingScreenProps) {
  return (
    <Backdrop
      sx={{
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
      open={props.open}>
      {/* <Lottie style={{ marginTop: '-10rem' }} options={loadingAnimation} height={400} width={400} /> */}
      <Box sx={{ width: 300 }}>
        <LinearProgress value={props.percentage} variant="determinate" color="inherit" sx={{ mt: -15 }} />
      </Box>
      <Typography sx={{ mt: -13 }}>กำลังโหลด {props.text}</Typography>
    </Backdrop>
  )
}
