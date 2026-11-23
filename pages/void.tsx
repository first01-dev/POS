import { StoreName } from '@/components/StoreName'
import { key } from '@/models/constants'
import { Officer } from '@/models/type'
import { EDCUtilWeb } from '@/services/EDCUtills'

import { getLocalStorage } from '@/services/StorageUtils'
import { DoneAll, ReplayRounded } from '@mui/icons-material'
import { Box, Button, CircularProgress, InputBase, Typography } from '@mui/material'
import jwtDecode from 'jwt-decode'
import Head from 'next/head'
import router from 'next/router'
import React from 'react'
import toast from 'react-hot-toast'

const edc = new EDCUtilWeb()

export default function VoidPage() {
  const [currentUser, setCurrentUser] = React.useState<Officer>()
  const [store, setStore] = React.useState<any>({})
  const [traceNo, setTraceNo] = React.useState<string>('')
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false)

  React.useEffect(() => {
    const user: Officer = jwtDecode(getLocalStorage(key.TOKEN) as string)
    setCurrentUser(user)
    if (getLocalStorage(key.STORE) && getLocalStorage(key.TOKEN)) {
      setStore(getLocalStorage(key.STORE))
    } else {
      router.push('/')
    }
  }, [])

  // ✅ ฟังก์ชันยืนยัน Void
  const handleVoid = async () => {
    try {
      // Validation
      if (!traceNo || traceNo.trim() === '') {
        toast.error('กรุณากรอกหมายเลข TRACE ก่อน')
        return
      }

      // ตรวจสอบว่าเป็นตัวเลขเท่านั้น
      if (!/^\d+$/.test(traceNo.trim())) {
        toast.error('หมายเลข TRACE ต้องเป็นตัวเลขเท่านั้น')
        return
      }

      setIsProcessing(true)

      // ✅ ตรวจสอบสถานะการเชื่อมต่อ
      const connected = await edc.isConnected()
      if (!connected) {
        await edc.connect()
      }

      // ✅ ส่งคำสั่ง VOID
      toast.loading(`กำลังยกเลิกรายการ TRACE: ${traceNo}`, { id: 'void-process' })

      const response = await edc.voidTransaction(traceNo)

      if (response?.status === 'success') {
        setTraceNo('')
        toast.success(`✅ ยกเลิกรายการสำเร็จสำหรับ TRACE: ${traceNo}`, {
          id: 'void-process',
          duration: 5000,
        })
      } else {
        toast.error(`❌ ไม่สามารถยกเลิกรายการได้ กรุณาตรวจสอบการเชื่อมต่อ EDC`, {
          id: 'void-process',
          duration: 5000,
        })
      }
      console.log('Void response:', response)
    } catch (err: any) {
      console.error('[EDC] handleVoid() Error:', err)

      // จัดการ error ตามประเภท
      if (err.message?.includes('Timeout')) {
        toast.error('⏱️ Timeout: EDC ไม่ตอบกลับภายในเวลาที่กำหนด', {
          id: 'void-process',
          duration: 5000,
        })
      } else if (err.message?.includes('Not connected')) {
        toast.error('🔌 ไม่ได้เชื่อมต่อกับ EDC กรุณาลองใหม่อีกครั้ง', {
          id: 'void-process',
          duration: 5000,
        })
      } else {
        toast.error('❌ ไม่สามารถยกเลิกรายการได้ กรุณาตรวจสอบการเชื่อมต่อ EDC', {
          id: 'void-process',
          duration: 5000,
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }

  // Handle Enter key press
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isProcessing) {
      handleVoid()
    }
  }

  return (
    <Box
      style={{
        paddingTop: '1.5rem',
        paddingBottom: '1.5rem',
        display: 'flex',
        flexDirection: 'column',

        gap: '1rem',
      }}>
      <Head>
        <title>POS - Void Transaction</title>
        <meta name="description" content="Void Transaction" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <Box className="Box-container">
        <StoreName text="Void" icon={<ReplayRounded />} store={store?.name} currentUser={currentUser?.name} />
      </Box>

      <Box className="Box-body">
        <Typography variant="h5" align="center" gutterBottom>
          ยกเลิกรายการ
        </Typography>
        <Typography align="center" color="text.secondary">
          พิมพ์เลข TRACE ที่ต้องการยกเลิก
        </Typography>
        <Typography variant="caption" align="center" color="text.secondary" sx={{ mt: 2 }}>
          💡 หมายเลข TRACE สามารถดูได้จากใบเสร็จของธุรกรรมที่ต้องการยกเลิก
        </Typography>

        <Box
          sx={{
            zIndex: 3,
            width: '100%',
            marginTop: 2,
            alignItems: 'center',
            display: 'flex',
            justifyContent: 'space-evenly',
            borderRadius: 3,
            border: '2px solid #00000030',
            backgroundColor: isProcessing ? '#f5f5f5' : 'transparent',
            transition: 'all 0.3s ease',
            '&:focus-within': {
              borderColor: '#FE5454',
              boxShadow: '0 0 0 2px rgba(25, 118, 210, 0.1)',
            },
          }}>
          <InputBase
            sx={{
              width: '100%',
              fontSize: '16px',
              fontWeight: 500,
            }}
            value={traceNo}
            onChange={(e) => setTraceNo(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="กรอกหมายเลข TRACE (ตัวเลขเท่านั้น)"
            disabled={isProcessing}
            inputProps={{
              'aria-label': 'trace-number',
              maxLength: 10,
              inputMode: 'numeric',
              pattern: '[0-9]*',
            }}
          />
        </Box>

        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Button
            size="small"
            color="info"
            variant="contained"
            sx={{
              borderRadius: '10px',
              marginTop: 2,
            }}
            onClick={handleVoid}
            disabled={isProcessing || !traceNo.trim()}>
            {isProcessing ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: 'white' }} />
                กำลังดำเนินการ...
              </>
            ) : (
              <>
                <DoneAll sx={{ mr: 1 }} />
                ยืนยันการยกเลิก
              </>
            )}
          </Button>
        </div>
      </Box>
    </Box>
  )
}
