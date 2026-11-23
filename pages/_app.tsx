import initAutoLogout from '@/services/AuthUtils'
import createEmotionCache from '@/services/CacheUtils'
import { CacheProvider, EmotionCache } from '@emotion/react'
import { ThemeProvider, createTheme } from '@mui/material'
import 'bootstrap/dist/css/bootstrap.css'
import { AppProps } from 'next/app'
import Head from 'next/head'
import { useRouter } from 'next/router'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useEffect } from 'react'
import { Toaster } from 'react-hot-toast'
import Defualt from '../components/layouts/Default'
import '../styles/globals.css'

// Configure NProgress only once
NProgress.configure({ showSpinner: false })

// Create the MUI theme
const THEME = createTheme({
  typography: {
    fontFamily: '"Sarabun", sans-serif',
    fontSize: 14,

    fontWeightLight: 400,
    fontWeightRegular: 400,
    fontWeightMedium: 500,
    fontWeightBold: 700,

    allVariants: {
      fontFamily: '"Sarabun", sans-serif',
    },
  },
  palette: {
    primary: {
      light: '#FE5454',
      main: '#FE5454',
      dark: '#FE5454',
      contrastText: '#fff',
    },
    info: {
      light: '#60D36C',
      main: '#60D36C',
      dark: '#60D36C',
      contrastText: '#fff',
    },
    warning: {
      light: '#bdbdbd',
      main: '#bdbdbd',
      dark: '#bdbdbd',
      contrastText: '#fff',
    },
    secondary: {
      main: '#fff',
      light: '#fff',
      dark: '#fff',
      contrastText: '#E7E7E7',
    },
    success: {
      light: '#60D36C',
      main: '#259930',
      dark: '#1b5e20',
      contrastText: '#fff',
    },
  },
})

declare global {
  interface Window {
    VConsole: any // 👈️ turn off type checking
  }
}

const clientSideEmotionCache = createEmotionCache()

export interface CustomProps extends AppProps {
  emotionCache?: EmotionCache
}

export default function App({ Component, emotionCache = clientSideEmotionCache, pageProps }: AppProps & CustomProps) {
  const router = useRouter()

  useEffect(() => {
    initAutoLogout()
  }, [])

  useEffect(() => {
    const handleRouteChange = (url: string) => {
      if (url !== router.asPath) {
        NProgress.start()
      }
    }

    const handleRouteComplete = () => {
      NProgress.done()
    }

    router.events.on('routeChangeStart', handleRouteChange)
    router.events.on('routeChangeComplete', handleRouteComplete)

    return () => {
      router.events.off('routeChangeStart', handleRouteChange)
      router.events.off('routeChangeComplete', handleRouteComplete)
    }
  }, [router])

  const RenderedComponent =
    router.asPath !== '/' && router.asPath !== '/logout' ? (
      <Defualt>
        <Component {...pageProps} />
      </Defualt>
    ) : (
      <Component {...pageProps} />
    )

  return (
    <>
      <CacheProvider value={emotionCache}>
        <Head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </Head>
        <Toaster containerClassName="hide-on-print" />
        <ThemeProvider theme={THEME}>{RenderedComponent}</ThemeProvider>
      </CacheProvider>
    </>
  )
}
