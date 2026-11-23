import { Search, SearchIconWrapper } from '@/services/StyleUtils'
import { SearchOutlined } from '@mui/icons-material'

import { Box, Button, InputBase, Typography } from '@mui/material'
import Head from 'next/head'
import React from 'react'

export default function PrototypePage() {
  const [loadFilter, setLoadFilter] = React.useState(false)

  const onClickSearch = () => {
    setLoadFilter(true)
    setTimeout(() => {
      setLoadFilter(false)
    }, 2000)
  }
  return (
    <Box className="p-4 mt-10 grid gap-4">
      <Head>
        <title>Prototype</title>
        <meta name="description" content="login" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* LoadingButton */}
      <Typography>LoadingButton</Typography>
      <Button
        // disabled={prodSearch === ''}
        color="primary"
        loading={loadFilter}
        startIcon={<SearchOutlined />}
        variant="contained"
        className="btn-confirm"
        onClick={onClickSearch}>
        <Typography>ค้นหา</Typography>
      </Button>

      {/* SearchInput */}
      <div className="w-80 flex justify-between">
        <Search className="input">
          <SearchIconWrapper>
            <Search />
          </SearchIconWrapper>
          <InputBase
            sx={{ ml: 2, fontSize: '16px' }}
            placeholder="เลขที่ใบส่งของ"
            // onKeyDown={onEnterSearch}
            // onChange={(e) => setsearchText(e.target.value)}
            inputProps={{ 'aria-label': 'search' }}
          />
        </Search>
        <Button
          // disabled={prodSearch === ''}
          color="primary"
          loading={loadFilter}
          startIcon={<SearchOutlined />}
          variant="contained"
          className="rounded-20"
          onClick={onClickSearch}>
          <Typography>ค้นหา</Typography>
        </Button>
      </div>
    </Box>
  )
}
