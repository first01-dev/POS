import dayjs from 'dayjs';
import { sumAll } from './MathUtils';
import { formatBalance } from './StringUtils';

const generateBillSlipPaper = (
  html: string,
  css: string,
  billDetail: any,
  orderDetail: any,
  orderItems: any,
  vat_reg_no: any
) => {
  const pro_qty = sumAll(orderItems, 'product_quantity');
  html = replacePlaceholder(html, '{{ invoice_id }}', orderDetail.data.invoice_number);
  html = replacePlaceholder(html, '{{ date_time }}', formatDate(orderDetail.data.created_at));
  html = replacePlaceholder(html, '{{ store_name }}', billDetail.name);
  html = replacePlaceholder(html, '{{ store_phone }}', billDetail.mobile);
  html = replacePlaceholder(html, '{{ store_address }}', billDetail.address);
  html = replacePlaceholder(html, '{{ vat_reg }}', vat_reg_no);
  html = replacePlaceholder(html, '{{ customer_name }}', orderDetail.data.customer_name);
  html = replacePlaceholder(html, '{{ customer_phone }}', orderDetail.data.customer_phone);
  html = replacePlaceholder(html, '{{ customer_address }}', orderDetail.data.customer_address);
  html = replacePlaceholder(html, '{{ invoice_note }}', orderDetail.data.note);
  html = replacePlaceholder(html, '{{ total_items }}', String(pro_qty));
  html = replacePlaceholder(html, '{{ subtotal }}', orderDetail.data.order_price[0].sub_total);
  
  if (Number(orderDetail.data.order_price[0].discount_amount) !== 0) {
    html = replacePlaceholder(html, '{{ discount_amount }}', orderDetail.data.order_price[0].discount_amount);
  } else {
    html = hidePlaceholder(html, 'ส่วนลด');
    html = hidePlaceholder(html, '{{ discount_amount }}');
  }
  
  if (Number(orderDetail.data.order_price[0].shipping_amount) !== 0) {
    html = replacePlaceholder(html, '{{ shipping_amount }}', orderDetail.data.order_price[0].shipping_amount);
  } else {
    html = hidePlaceholder(html, 'ค่าจัดส่ง');
    html = hidePlaceholder(html, '{{ shipping_amount }}');
  }
  
  if (Number(0) !== 0 && 'undefined') {
    html = replacePlaceholder(html, '{{ total_tax }}', '0');
  } else {
    html = hidePlaceholder(html, 'ภาษีมูลค่าเพิ่ม');
    html = hidePlaceholder(html, '{{ total_tax }}');
  }
  
  html = replacePlaceholder(html, '{{ payable_amount }}', formatBalance(orderDetail.data.order_price[0].paid_amount));
  html = replacePlaceholder(html, '{{ paid_amount }}', formatBalance(orderDetail.data.order_price[0].paid_total));
  
  if (Number(orderDetail.data.order_price[0].balance) !== 0) {
    html = replacePlaceholder(html, '{{ change }}', formatBalance(orderDetail.data.order_price[0].balance));
  } else {
    html = hidePlaceholder(html, 'ทอนเงิน');
    html = hidePlaceholder(html, '{{ change }}');
  }
  
  html = replacePlaceholder(html, '{{ footer_text }}', '');
  html = replacePlaceholder(html, '<td class="w-10 align-right">หน่วย</td>', '<td class="w-10">หน่วย</td>');
  
  let item = '';
  orderItems.forEach((value: any) => {
    item += `<tr>
      <td>${value.product_quantity}</td>
      <td>${value.product_name}</td>
      <td class="align-right">${formatBalance(value.product_price)}</td>
      </tr>`;
  });
  
  html = replacePlaceholder(html, '{{ items }}', item);

  return { html, css };
};

const generateResultBillSlipPaper = (
  html: string,
  css: string,
  billDetail: any,
  orderDetail: any,
  orderItems: any,
  invoice_number: string
) => {
  const pro_qty = sumAll(orderItems, 'quantity');
  html = replacePlaceholder(html, '{{ invoice_id }}', invoice_number);
  html = replacePlaceholder(html, '{{ date_time }}', formatDate(dayjs()));
  html = replacePlaceholder(html, '{{ store_name }}', billDetail.name);
  html = replacePlaceholder(html, '{{ store_phone }}', billDetail.phone);
  html = replacePlaceholder(html, '{{ store_address }}', billDetail.address);
  html = replacePlaceholder(html, '{{ vat_reg }}', billDetail.vat_reg_no);
  html = replacePlaceholder(html, '{{ customer_name }}', orderDetail.customer_name);
  html = replacePlaceholder(html, '{{ customer_phone }}', orderDetail.customer_mobile);
  html = replacePlaceholder(html, '{{ customer_address }}', orderDetail.customer_address);
  html = replacePlaceholder(html, '{{ invoice_note }}', orderDetail.note);
  html = replacePlaceholder(html, '{{ total_items }}', String(pro_qty));
  html = replacePlaceholder(html, '{{ subtotal }}', formatBalance(orderDetail.sub_total));
  html = replacePlaceholder(html, '{{ footer_text }}', '');
  
  if (Number(orderDetail.discount_amount) !== 0) {
    html = replacePlaceholder(html, '{{ discount_amount }}', orderDetail.discount_amount);
  } else {
    html = hidePlaceholder(html, 'ส่วนลด');
    html = hidePlaceholder(html, '{{ discount_amount }}');
  }
  
  if (Number(orderDetail.shipping_amount) !== 0) {
    html = replacePlaceholder(html, '{{ shipping_amount }}', orderDetail.shipping_amount);
  } else {
    html = hidePlaceholder(html, 'ค่าจัดส่ง');
    html = hidePlaceholder(html, '{{ shipping_amount }}');
  }
  
  if (Number(orderDetail.total_tax) !== 0) {
    html = replacePlaceholder(html, '{{ total_tax }}', orderDetail.total_tax);
  } else {
    html = hidePlaceholder(html, 'ภาษีมูลค่าเพิ่ม');
    html = hidePlaceholder(html, '{{ total_tax }}');
  }
  
  html = replacePlaceholder(html, '{{ payable_amount }}', orderDetail.paid_amount);
  html = replacePlaceholder(html, '{{ paid_amount }}', formatBalance(orderDetail.paid_total));
  
  if (Number(orderDetail.balance) !== 0) {
    html = replacePlaceholder(html, '{{ change }}', formatBalance(orderDetail.balance));
  } else {
    html = hidePlaceholder(html, 'ทอนเงิน');
    html = hidePlaceholder(html, '{{ change }}');
  }
  
  html = replacePlaceholder(html, '<td class="w-10 align-right">หน่วย</td>', '<td class="w-10">หน่วย</td>');
  
  let item = '';
  orderItems.forEach((value: any) => {
    item += `<tr>
      <td>${value.quantity}</td>
      <td>${value.product_name}</td>
      <td class="align-right">${formatBalance(value.product_price)}</td>
      </tr>`;
  });
  
  html = replacePlaceholder(html, '{{ items }}', item);

  return { html, css };
};

const replacePlaceholder = (html: string, placeholder: string, value: string) => {
  return html.replace(placeholder, value);
};

const hidePlaceholder = (html: string, placeholder: string) => {
  return html.replace(placeholder, `<td class="w-50" style="display:none">${placeholder}</td>`);
};

const formatDate = (date: any) => {
  return dayjs(date).format('DD/MM/YYYY  HH:mm');
};


export { generateBillSlipPaper, generateResultBillSlipPaper };

