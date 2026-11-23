import { formatBalance } from '@/services/StringUtils'
import { Divider, Typography } from '@mui/material'
import Image from 'next/image'

interface ItemsDashboardProps {
  saleForWeekText: string
  saleForTodayText: string
  salePriceToday: any
  salePriceWeek?: any
  icon: any
}

export default function ItemsDashboard(props: ItemsDashboardProps) {
  return (
    <div className="items-dashboard">
      <div className="item-dashbord-container-component">
        <Image src={props.icon} alt={''} className="icon-item-dashboard" />
        <div style={{ width: '65%' }}>
          <div style={{ textAlign: 'right', marginTop: 12 }}>
            <Typography style={{ fontSize: '14px' }}>{props.saleForTodayText}</Typography>
          </div>
          <div style={{ textAlign: 'right', marginTop: -5 }}>
            <Typography style={{ fontSize: '28px' }}>{formatBalance(props.salePriceToday)}</Typography>
          </div>
        </div>
      </div>
      <Divider variant="middle" style={{ marginTop: 5, marginBottom: 5, borderTop: '1px solid #7B7878' }} />
      <div className="item-dashbord-container-component">
        <div>
          <div className="icon-item-dashboard" />
        </div>
        <div style={{ width: '65%' }}>
          <div style={{ textAlign: 'right' }}>
            <Typography style={{ fontSize: '14px' }}>{props.saleForWeekText}</Typography>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Typography style={{ fontSize: '20px', marginTop: -2}}>
              {formatBalance(props.salePriceWeek)}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  )
}
