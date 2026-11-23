import { AccountCircle, EditOutlined, PersonAddAltOutlined } from '@mui/icons-material'

import { Box, CssBaseline, IconButton, InputBase, Paper } from '@mui/material'

export default function Cart() {
  return (
    <div
      style={{
        position: 'fixed',
        height: '100%',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        alignContent: 'center',
        marginRight: '2%',
        top: 0,
        right: 0,
      }}>
      <Box>
        <CssBaseline />
        <Paper
          sx={{
            zIndex: 5,
            mt: 1,
            height: 750,
            width: 360,
            borderRadius: 10,
            backgroundColor: 'FFFFFF',
          }}>
          <div
            style={{
              height: 44,
              width: '80%',
              marginLeft: '5%',
              borderRadius: 20,
              backgroundColor: '#F1F1F1',
              display: 'flex',
              alignItems: 'center',
            }}>
            <AccountCircle sx={{ ml: '2%', color: '#7B7878', alignItems: 'center' }} />
            <InputBase
              sx={{ ml: 1, width: '70%' }}
              placeholder="ค้นหาสมาชิก"
              inputProps={{ 'aria-label': 'ค้นหาสมาชิก' }}
            />
            <IconButton>
              <EditOutlined sx={{ ml: '2%', color: '#7B7878', alignItems: 'center' }} />
            </IconButton>
          </div>

          <IconButton>
            <PersonAddAltOutlined sx={{ ml: '2%', color: '#7B7878', alignItems: 'center' }} />
          </IconButton>
        </Paper>
      </Box>
    </div>
  )
}
