import { clearAllLocalStorage } from '@/services/StorageUtils'
import { Box, Typography } from '@mui/material'
import Image from 'next/image'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'

import mypic from '../assets/images/Yaakz_Profile-1000-01_(1)-transformed.png'

const text = () => [
  'อย่าทำให้หลงได้ไหม น้ำมันแพง',
  'อยากมีคนใส่ใจ ที่ไม่ใช่ป้าข้างบ้าน',
  'ไปดูดวงมา หมอดูทักว่า สวัสดี!',
  'เราชอบตัวเองตอนเผลอ แล้วเธอชอบเราตอนไหน',
  'พูดไม่ค่อยเก่ง แต่กินหมดจาน',
  'ถ้าจะจ้างมาเป็นคู่ชีวิต คิดเท่าไหร่',
  'เรานี้แหละ  หน้าตาความรัก',
]

export default function Logout() {
  const router = useRouter()
  const [randomText, setRandomText] = useState('')

  useEffect(() => {
    // Set a timeout to clear storage after 2 seconds
    const timer = setTimeout(() => {
      clearAllLocalStorage()
      router.push('/') // Replace 'yourTokenKey' with the actual key of the token in localStorage.
      setRandomText(text()[Math.floor(Math.random() * text().length)])
    }, 2000)

    // Cleanup the timeout if the component unmounts
    return () => clearTimeout(timer)
  }, [])

  return (
    <Box>
      <div style={{ justifyContent: 'center', marginTop: '5%' }}>
        {/* <Lottie options={backGroudAnimation} height={500} width={1000} /> */}
        <div style={{ display: 'grid', justifyContent: 'center', marginTop: '-30%' }}>
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Image src={mypic} width={300} height={300} alt="" />
          </div>
          <div style={{ border: '1px #fe5454 solid', borderRadius: 20, padding: 20 }}>
            <Typography style={{ fontSize: 24 }}>{randomText}</Typography>
          </div>
        </div>
      </div>
    </Box>
  )
}
