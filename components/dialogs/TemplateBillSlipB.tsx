import { sumAll } from '@/services/MathUtils'
import { formatBalance } from '@/services/StringUtils'
import dayjs from 'dayjs'
import React from 'react'
import Barcode from 'react-barcode'

interface TemplateBillSlipprops {
  text: string
  open?: boolean
  onClose?: () => void
  store_name: any
  store_address: any
  vat_reg: any
  invoice_id: any
  type: string
  date_time: any
  customer_name: any
  customer_phone: any
  customer_address: any
  items: any
  sent_type: string
  total_items: number
  subtotal: number
  discount_other: number
  discount_coupon: string
  coupon?: any
  delivery_type: string
  discount_amount: number
  shipping_amount: number
  total_tax: number
  payable_amount: number
  paid_amount: number
  change: number
  invoice_note: string
  store_phone: any
  footer_text: string
}

export default function TemplateBillSlip(props: TemplateBillSlipprops) {
  const total_qty = sumAll(props.items, 'pro_quantity')

  const sub_discount = sumAll(props.items, 'pro_discount')

  const totalDiscount = sub_discount + props.discount_amount

  const subtotal = props.items
    .map((item: any) => item.pro_subtotal + item.pro_discount)
    .reduce((acc: any, subtotal: any) => acc + subtotal, 0)
  const buffetPrices: Record<string, number> = {
    buffet299: 299,
    buffet349: 349,
    buffet399: 399,
    buffet499: 499,
    buffet699: 699,
  }
  const isBuffet = !!buffetPrices[props.sent_type]
  const buffetPrice = buffetPrices[props.sent_type]

  const rule = props.coupon && props.coupon.rule ? JSON.parse(props.coupon.rule) : {}
  const channel = props.coupon?.channel ? JSON.parse(props.coupon.channel) : []

  const chanalName =
    channel.includes('store') && channel.includes('lnwshop')
      ? 'Yaakz Shop (เฉพาะสาขาที่ร่วมรายการ) , เว็บ yaakz.com'
      : channel.includes('store')
        ? 'Yaakz Shop (เฉพาะสาขาที่ร่วมรายการ)'
        : channel.includes('lnwshop')
          ? 'เว็บ yaakz.com'
          : 'ทุกช่องทาง'

  const sentTypeName =
    props.type === 'delivery'
        ? 'Yaakz Station - จัดส่งบ้าน'
        : props.type === 'recive_store'
          ? 'Yaakz Station - รับที่สาขา'
          : props.type === 'buffet299' || props.type === 'buffet349' || props.type === 'buffet399' || props.type === 'buffet499' || props.type === 'buffet699'
            ? 'บุฟเฟ่ต์'
            : ''
            

  return (
    <>
      <section className="receipt-template">
        <header className="receipt-header">
          <h2 className="store-name">{props.store_name}</h2>
          <br />
          <div className="address-area">
            <span className="info address">{props.store_address}</span>
            <div className="block">
              <span className="info">เลขประจำตัวผู้เสียภาษี: {props.vat_reg} (Vat Included)</span>
            </div>
          </div>
        </header>

        <h4 className="main-title" style={{ marginTop: 10 }}>
          ใบเสร็จรับเงิน/ใบกำกับภาษีอย่างย่อ
        </h4>

        <div className="block" style={{ marginTop: 10 }}>
          <span className="bcs_item_list">เลขที่เอกสาร: {props.invoice_id}</span>
          {props.type !== "normal" && (<span className="bcs_item_list">ประเภท: {sentTypeName}</span>)}
        </div>
        <div className="block">
          <span className="bcs_item_list">วันที่ขาย: {props.date_time}</span>
        </div>
        <div className="block">
          <span className="bcs_item_list">
            ชื่อลูกค้า:{' '}
            {props.customer_name
              ? (() => {
                  const parts = props.customer_name.trim().split(' ')
                  return parts.length > 1 ? `${parts[0]} xxx` : parts[0]
                })()
              : ''}
          </span>
        </div>

        <div className="block">
          <span className="bcs_item_list">
            เบอร์โทรศัพท์: {props.customer_phone ? `xxxxxxx${props.customer_phone.slice(-3)}` : ''}
          </span>
        </div>
        {/* <div className="block">
          <span className="bcs_item_list">ที่อยู่ลูกค้า: {props.customer_address}</span>
        </div> */}

        <section className="listing-area item-list" style={{ marginTop: 10 }}>
          <table>
            <thead>
              <tr>
                <td className="w-5 align-right"></td>
                <td className="w-40"></td>
                <td className="w-20 align-right"></td>
              </tr>
            </thead>
            <tbody>
              {props.items.map((value: any, index: number) => (
                <React.Fragment key={index}>
                  <tr>
                    <td className="w-5">{value.pro_quantity}</td>
                    <td className="w-40">{value.pro_name}</td>
                    <td className="align-right">
                      {formatBalance(value.pro_price * value.pro_quantity + value.pro_discount)}
                    </td>
                  </tr>
                  {!isBuffet && value.pro_discount !== 0 && (
                    <tr>
                      <td className="w-5"></td>
                      <td className="w-40">ส่วนลด</td>
                      <td className="align-right">{formatBalance(value.pro_discount)}</td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>

            {/* <tbody>
              {props.items.map(
                (value: any, index: number) =>
                  value.pro_discount !== 0 && (
                    <tr key={index}>
                      <td className="w-5">{value.pro_quantity}</td>
                      <td className="w-40">ส่วนลด</td>
                      <td className="align-right">{formatBalance(value.pro_discount * value.pro_quantity)}</td>
                    </tr>
                  )
              )}
            </tbody> */}
          </table>
        </section>
        <br />

        <section className="info-area item-list">
          <table>
            <tbody>
              <tr>
                <td className="w-40">รายการสั่งซื้อ ({total_qty})</td>
                {<td className="w-20 align-right">{formatBalance(subtotal)}</td>}
              </tr>

              {props.shipping_amount != 0 && (
                <tr>
                  <td className="w-50">ค่าจัดส่ง</td>
                  <td className="w-20 align-right">{formatBalance(props.shipping_amount)}</td>
                </tr>
              )}

              {props.discount_coupon !== '' && props.discount_amount !== 0 && (
                <tr>
                  <td className="w-40">ส่วนลดอื่นๆ({props.discount_coupon || props.delivery_type})</td>
                  <td className="align-right">{formatBalance(props.discount_amount)}</td>
                </tr>
              )}

              {sub_discount !== 0 && (
                <tr>
                  <td className="w-40">ส่วนลดทั้งหมด</td>
                  <td className="align-right">{formatBalance(isBuffet ? subtotal - buffetPrice : totalDiscount)}</td>
                </tr>
              )}

              {/* {props.total_tax !== 0 && (
                <tr>
                  <td className="w-50">ภาษีมูลค่าเพิ่ม</td>
                  <td className="w-20 align-right">{props.total_tax}</td>
                </tr>
              )} */}
              <tr>
                <td className="w-50">ยอดรวมชำระทั้งหมด</td>
                <td className="w-20 align-right">{formatBalance(props.payable_amount)}</td>
              </tr>
              <tr>
                <td className="w-50">รับเงิน</td>
                <td className="w-20 align-right">{formatBalance(props.paid_amount)}</td>
              </tr>
              {props.change !== 0 && (
                <tr>
                  <td className="w-50">เงินทอน</td>
                  <td className="w-20 align-right">{formatBalance(props.change)}</td>
                </tr>
              )}
            </tbody>
          </table>
          <br />
          {props.invoice_note === '' ||
            (props.invoice_note === null && (
              <span className="text-small">
                <b>Note:</b> {props.invoice_note}
              </span>
            ))}
        </section>

        {props.coupon != null && (
          <section className="bcs_footer_area">
            <section className="align-center">
              <br/>
              <span style={{fontSize: 20}}>{props.coupon.campaign_name}</span>
              <br/>
              <span >คูปองส่วนลด</span>
              <span style={{ fontSize: 24, marginLeft: 5, marginRight: 5, fontWeight: 600 }}>
                {props.coupon.discount_amount !== '' ? props.coupon.discount_amount : '-'}
              </span>
              <span>{props.coupon.discount_type === 'fixed' ? 'บาท' : '%'}</span>
              <br />
              {props.coupon.discount_max !== null && (
                <>
                  <span>ลดสูงสุด</span>
                  <span style={{ marginLeft: 5, marginRight: 5 }}>{props.coupon.discount_max}</span>
                  <span>บาท</span>
                  <br />
                </>
              )}

              <span className="info-area item-list">
                {rule.order_amount_min ? `เมื่อมียอดสั่งซื้อขั้นต่ำ ${rule.order_amount_min} บาท` : ''}
              </span>
              <br />

              <span className="info-area item-list">
                ใช้คูปองภายใน {dayjs(props.coupon.start_on).format('DD/MM/YYYY')} -{' '}
                {dayjs(props.coupon.expire_on).format('DD/MM/YYYY')}
                <br />
                <span className="info-area item-list">ใช้ได้ที่ : {chanalName}</span>
              </span>
              <br />
              <Barcode fontSize={16} width={2} height={40} value={props.coupon.coupon_code} />
            </section>
          </section>
        )}

        <section style={{ display: 'flex', justifyContent: 'center' }}>
          {isBuffet && <Barcode width={1} height={50} value={props.invoice_id} />}
        </section>

        <section className="bcs_footer_area">
          <br />
          <div className="align-center">
            <img
              style={{ width: 100, height: 100 }}
              src="https://e-service.bestcommercesolutions.com/bcs/images/qrcode.png"
            />
            <div>แนะนำ-ติชมสาขา / สาขาอยู่ที่ไหนบ้าง / การขอและดาวโหลดใบกำกับภาษี / ADD LINE คุยกับ แอดมิน</div>
            <div> ขอบคุณสำหรับการซื้อสินค้าจากเรา</div>
          </div>
          <br />
          <div>{props.footer_text}</div>

          <span className="block text-left align-center">สนใจสั่งซื้อออนไลน์ที่ www.yaakz.com</span>
          <br />
          <span className="block text-left">
            ในกรณีที่สินค้าเกิดความชำรุดเสียหายจากกระบวนการผลิต สามารถเปลี่ยนสินค้าคืนได้ภายใน 3 วัน ติดต่อได้ที่ LINE
            OA : @yaakzshop
          </span>
          <br />
          <span className="block text-left">
            ทางบริษัทฯ ขอสงวนสิทธิ์ในการเปลี่ยนสินค้าทดแทน โดยไม่มีนโยบายคืนเป็นเงินสด
          </span>
        </section>
      </section>
    </>
  )
}
