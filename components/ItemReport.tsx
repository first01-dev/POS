import { formatBalance } from '@/services/StringUtils'
import { Box, Typography } from '@mui/material'
import dayjs from 'dayjs'

interface ItemsReportProps {
  items: any[]
  selected: string
  onSelect?: (text: string) => void
  dataIncome?: {
    date?: string
    value?: number
  }
  store?: {
    type: string
  }
}

export default function ItemsReport({ items, selected, onSelect, dataIncome, store }: ItemsReportProps) {
  return (
    <>
      {items.map((item, index) => {
        const isActive = selected === item.text
        const isIncome = item.text === 'แจ้งยอด'

        return (
          <div
            key={index}
            className={`items-report ${isActive ? 'items-report-selected' : ''}`}
            onClick={() => onSelect?.(item.text)}>
            <div className="item-report-container-component">
              {/* icon แสดงเฉพาะที่ไม่ใช่แจ้งยอด */}
              {!isIncome && <div className="box-icon-item-report">{item.icon}</div>}

              <div
                style={{
                  width: isIncome ? '100%' : '65%',
                }}>
                <div className="text-item-report">
                  {!isIncome && <Typography sx={{ fontSize: 18, textAlign: 'right' }}>{item.text}</Typography>}

                  {isIncome && (
                    <Box sx={{ position: 'relative', width: '100%' }}>
                      {/* 🎀 Ribbon */}
                      <Box
                        sx={{
                          position: 'absolute',
                          top: -5,
                          left: -10,
                          backgroundColor: '#FF6B6B',
                          color: '#fff',
                          px: 2,
                          py: 0.5,
                          fontSize: 12,
                          fontWeight: 500,
                          zIndex: 1,
                          boxShadow: 2,
                          borderRadius: '4px 4px 4px 0',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            bottom: -6,
                            left: 0,
                            borderWidth: '6px 6px 0 0',
                            borderStyle: 'solid',
                            borderColor: '#D84C4C transparent transparent transparent',
                          },
                        }}>
                        กดเพื่อแจ้งยอดใหม่
                      </Box>

                      {/* 🔘 Button */}
                      <Box
                        sx={{
                          width: '100%',
                          borderRadius: 2,
                          paddingRight: 1,
                          paddingTop: 2,
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          textAlign: 'right',
                        }}>
                        <Typography>
                          แจ้งยอดล่าสุด ณ วันที่ {dataIncome?.date ? dayjs(dataIncome.date).format('DD/MM/YYYY') : '-'}
                        </Typography>

                        <Typography sx={{ fontSize: 20, fontWeight: 600 }}>
                          {dataIncome?.value != null ? `${formatBalance(dataIncome.value)}` : '-'} บาท
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })}
    </>
  )
}
