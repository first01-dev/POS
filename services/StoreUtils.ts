import { create } from 'zustand'

export interface AddressOption {
  value: string | number
  label: string
  children?: AddressOption[]
}

interface billState {
  html: string
  css: string
  setElement: (html: string, css: string) => void
}

export const useBillStore = create<billState>((set) => ({
  html: '',
  css: '',
  setElement: (html, css) => set({ html, css }),
}))

interface StoreState {
  store_id: number | string
  store_address: string
  store_vat_reg_no: string
  store_phone: string
  store_name: string
  setStore: (id: number | string, address: string, vat_reg_no: string, phone: string, name: string) => void
}

export const useStore = create<StoreState>((set) => ({
  store_id: '',
  store_address: '',
  store_vat_reg_no: '',
  store_phone: '',
  store_name: '',
  setStore: (store_id, store_address, store_vat_reg_no, store_phone, store_name) =>
    set({ store_id, store_address, store_vat_reg_no, store_phone, store_name }),
}))

interface SaleStoreState {
  saleList: any[]
  setSaleList: (data: any[]) => void

}

export const useSaleStore = create<SaleStoreState>((set) => ({
  saleList: [],
  setSaleList: (data) => set({ saleList: data }),
  
}))

interface TopTwentySalelistState {
  topTwentySalelist: any[];
  setTopTwentySalelist: (list: any[]) => void;

}

export const useTopTwentySalelistStore = create<TopTwentySalelistState>((set) => ({
  topTwentySalelist: [],
  setTopTwentySalelist: (list) => set({ topTwentySalelist: list }),
 
}))

interface TopTwentySalePricelistState {
  topTwentySalePricelist: any[];
  setTopTwentySalePricelist: (list: any[]) => void;

}

export const useTopTwentySalePricelistStore = create<TopTwentySalePricelistState>((set) => ({
  topTwentySalePricelist: [],
  setTopTwentySalePricelist: (list) => set({ topTwentySalePricelist: list }),
 
}))

interface StockOutState {
  stockOutlist: any[];
  setStockOutlist: (list: any[]) => void;

}

export const useStockOutStore = create<StockOutState>((set) => ({
  stockOutlist: [],
  setStockOutlist: (list) => set({ stockOutlist: list }),
 
}))
  


