import { Customer, SelectedCustomer } from './type'

const customer_seed: Customer = {
  app: 'POS',
  name: '',
  email: '',
  phone: '',
  bod: '',
  address: '',
  sub_district: '',
  district: '',
  province: 0,
  zip_code: '',
  active: 0,
  created_by: 0,
  store_id: 0,
    ref_source: '',
}
const customer_update_seed: SelectedCustomer = {
  _method: 'PATCH',
  app: 'POS',
  name: '',
  email: '',
  phone: '',
  bod: '',
  address: '',
  sub_district: '',
  district: '',
  province: '',
  zip_code: '',
  active: 0,
  updated_by: 0,
  store_id: 0,
}

export { customer_seed, customer_update_seed }
