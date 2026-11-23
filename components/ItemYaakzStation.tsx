import { Typography } from '@mui/material'
import { useEffect } from 'react'

interface ItemsReportProps {
  items: any[]
  updateValue?: string
  onSelect?: (text: string) => void
}

export default function ItemsReport(props: ItemsReportProps) {
  const { updateValue } = props

  useEffect(() => {
    if (updateValue) {
      props.items.forEach((item, index) => {
        if (item.text === updateValue) {
          const itemElement = document.querySelector(`.items-report-${index}`)
          itemElement?.classList.add('items-report-selected')
        } else {
          const itemElement = document.querySelector(`.items-report-${index}`)
          itemElement?.classList.remove('items-report-selected')
        }
      })
    }
  }, [updateValue])

  const handleSelect = (value: string, indexSelect: number) => {
    // อัปเดตคลาสของไอเทมที่เลือก
    props.items.forEach((item, index) => {
      const itemElement = document.querySelector(`.items-report-${index}`)
      if (index === indexSelect) {
        itemElement?.classList.add('items-report-selected')
      } else {
        itemElement?.classList.remove('items-report-selected')
      }
    })

    // เรียก onSelect เมื่อเลือกไอเทม
    if (props.onSelect) {
      props.onSelect(value)
    }
  }

  useEffect(() => {
    const firstItem = document.querySelector(`.items-report-0`)
    firstItem?.classList.add('items-report-selected')
  }, [])

  return props.items?.map((item, index) => (
    <div
      className={'items-yaakz-station ' + `items-report-${index} `}
      key={index}
      onClick={() => handleSelect(item.text, index)}>
      <div style={{ width: '100%' }}>
        <Typography
          style={{
            fontSize: '18px',
            textAlign: 'center',
            marginTop: '10%',
          }}>
          {item.text}
        </Typography>
      </div>
    </div>
  ))
}
