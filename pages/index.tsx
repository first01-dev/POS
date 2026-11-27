import { key, version } from '@/models/constants/index'
import { Store as StoreType } from '@/models/type'
import { api } from '@/services/AxiosUtils'
import { getLocalStorage, setLocalStorage } from '@/services/StorageUtils'
import { useStore } from '@/services/StoreUtils'
import { ArrowForward, EmailOutlined, KeyOutlined, Store } from '@mui/icons-material'
import {
  Box,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Paper,
} from '@mui/material'
import dayjs from 'dayjs'
import jwtDecode from 'jwt-decode'
import Head from 'next/head'
import Image from 'next/image'
import { useRouter } from 'next/router'
import * as React from 'react'
import toast from 'react-hot-toast'
import mypic from '../assets/images/Yaakz_Profile-1000-01_(1)-transformed.png'

// เช็ค Bot ใหม่
import { Turnstile } from '@marsidev/react-turnstile'
// เช็ค Bot เดิม 
// import ReCAPTCHA from 'react-google-recaptcha'

const drawerWidth = 240

export default function LoginPage() {

  const router = useRouter()
  const { setStore } = useStore()
  const [openStoreList, setOpenStoreList] = React.useState(false)
  const [storelist, setStoreList] = React.useState<any>([])
  const [loading, setLoading] = React.useState(false)
  const [isBot, setIsBot] = React.useState(true)
  const [login, setLogin] = React.useState({
    email: '',
    password: '',
  })
  const [dataLogin, setDataLogin] = React.useState(true)

  const handleData = (event: React.ChangeEvent<HTMLInputElement>) => {
    setLogin({ ...login, [event.target.name]: event.target.value })
  }

  const handleClose = () => {
    setOpenStoreList(false)
  }

  const handleselectstore = (item: any) => {
    setOpenStoreList(false)
    const data: StoreType = {
      id: item.store_id,
      address: item.address,
      vat_reg_no: item.vat_reg_no,
      phone: item.mobile,
      name: item.name,
      code_name: item.code_name,
 
    }


    setLocalStorage(key.STORE, data, dayjs().add(1, 'day').unix())
    toast.success('เข้าสู่ระบบสำเร็จ', { position: 'top-center' })
    router.push('/cashier')
  }

  const onLogin = async () => {
    setLoading(true)

    if (login.email === '') {
      toast.error('กรุณากรอกอีเมล')
    } else if (login.password === '') {
      toast.error('กรุณากรอกรหัสผ่าน')
    } else {
      const loginRes = await api.post('/user/login', login)
      if (loginRes.data.status === 'Success') {
        const decoded: any = jwtDecode(loginRes.data.token)
        setLocalStorage(key.TOKEN, loginRes.data.token, decoded.exp)
        setStoreList(loginRes.data.store_list)
       
        
        setOpenStoreList(true)
      } else {
        toast.error(loginRes.data.msg)
        setLoading(false)
      }
    }
  }

  const checkBot = (value: any) => {
    if (value) {
      setIsBot(false)
    }
  }

  React.useEffect(() => {
    const [token, store] = [getLocalStorage(key.TOKEN), getLocalStorage(key.STORE)]

    if (token && store) {
      toast.success('มีการเข้าสู่ระบบแล้ว', { position: 'top-center' })
      router.push('/cashier')
    }
  }, [])

  return (
    <div style={{ backgroundColor: '#F1F1F1' }}>
      <Head>
        <title>POS</title>
        <meta name="description" content="login" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Box
        sx={{
          backgroundColor: '#F1F1F1',
          display: 'flex',
          justifyContent: 'end',
        }}>
        <Box
          sx={{
            backgroundColor: '#F1F1F1',
            flexGrow: 1,
            p: 3,
            mt: 15,
            width: { sm: `calc(100% - ${drawerWidth}px)`, zIndex: 2 },
          }}>
          <Box sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                display: 'flex',
                flexWrap: 'wrap',
                '& > :not(style)': {
                  m: 1,
                  width: 400,
                  height: 380,
                  ml: 'auto',
                  mr: 'auto',
                },
              }}>
              <Paper elevation={0} sx={{ borderRadius: 5, textAlign: 'center' }}>
                <Image style={{ marginTop: -100 }} src={mypic} width={200} height={200} alt="" />

                <div className="inputloginuser" style={{ marginTop: -20 }}>
                  <EmailOutlined className="btnaccount" />
                  <InputBase
                    autoComplete="off"
                    onChange={handleData}
                    name="email"
                    type="email"
                    sx={{ ml: 2, width: '80%' }}
                    placeholder="อีเมล"
                    inputProps={{ 'aria-label': 'กรอกอีเมล' }}
                  />
                </div>

                <div className="inputloginuser">
                  <KeyOutlined className="btnaccount" />
                  <InputBase
                    autoComplete="off"
                    onChange={handleData}
                    name="password"
                    type="password"
                    sx={{ ml: 2, width: '80%' }}
                    placeholder="รหัสผ่าน"
                    inputProps={{ 'aria-label': 'กรอกรหัสผ่าน' }}
                  />
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  {/* <ReCAPTCHA sitekey="6Lf2yLYpAAAAAG0mtVbNixrG5_AmWnpahONYCEej" onChange={checkBot} /> */}
                  <Turnstile
                      siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                      onSuccess={checkBot}
                      onExpire={() => checkBot(null)}
                  />
                </div>
                <br />
                <Button
                  onClick={onLogin}
                  variant="contained"
                  disabled={isBot}
                  color="error"
                  sx={{ mt: -2, borderRadius: 3, width: '80%' }}>
                  Login
                </Button>
                <Dialog
                  PaperProps={{
                    style: {
                      borderRadius: '20px',
                      width: 500,
                      height: '70%',
                    },
                  }}
                  onClose={handleClose}
                  open={openStoreList}
                  aria-labelledby="alert-dialog-title"
                  aria-describedby="alert-dialog-description">
                  <DialogTitle id="alert-dialog-title">{'เลือกสาขา'}</DialogTitle>
                  <DialogContent className="boxselectstore">
                    <nav aria-label="main mailbox folders">
                      {storelist &&
                        storelist.map((item: any, index: number) => (
                          <List key={index}>
                            <ListItem disablePadding>
                              <ListItemButton onClick={(e) => handleselectstore(item)}>
                                <ListItemIcon>
                                  <Store />
                                </ListItemIcon>
                                <ListItemText>{item.name}</ListItemText>
                                <ListItemIcon sx={{ mr: 0, minWidth: 5 }}>
                                  <ArrowForward />
                                </ListItemIcon>
                              </ListItemButton>
                            </ListItem>
                            <Divider />
                          </List>
                        ))}
                    </nav>
                    <Divider />
                  </DialogContent>
                </Dialog>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>
      <div className="footer-version">
        {version} &copy; บริษัท เบสท์ คอมเมิร์ซ โซลูชั่นส์ จำกัด. 459 ซอยลาดพร้าว 48 ถนนลาดพร้าว แขวงสามเสนนอก
        เขตห้วยขวาง กทม. 10310
      </div>
    </div>
  )
}
