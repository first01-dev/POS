import { useBillStore } from '@/services/StoreUtils'
import PrintIcon from '@mui/icons-material/Print'
import { Fab } from '@mui/material'
import Head from 'next/head'
import { useEffect } from 'react'

export default function ShowBill() {
  const { html, css } = useBillStore()
  useEffect(() => {
    console.log('html', html)
    console.log('css', css)
  }, [])

  return (
    <div
      style={{
        background: '#f1f1f1',
        paddingBottom: '1.5rem',
      }}>
      <Head>
        <title>Bill</title>
        <meta name="description" content="Bill" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <style>{css}</style>
      <style>{`
        .receipt-template {
            background: #fff;
            padding: 1.5rem;
            
        }
      `}</style>
      <br />
      <div dangerouslySetInnerHTML={{ __html: html as string }} />
      <br />
      <div style={{ display: 'flex', justifyContent: 'center' }} className="hide-on-print">
        <Fab variant="extended" color="primary" onClick={(_) => window.print()}>
          <PrintIcon sx={{ mr: 1 }} />
          Print
        </Fab>
      </div>
    </div>
  )
}
