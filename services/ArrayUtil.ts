type OrderBy = 'asc' | 'desc';

/**
 * เรียงลำดับอาร์เรย์โดยใช้คีย์ที่กำหนด
 * @param array อาร์เรย์ที่ต้องการจัดเรียง
 * @param key คีย์ที่ใช้ในการเรียงลำดับ
 * @param orderBy ลำดับการเรียง (asc หรือ desc)
 * @param prefix คำนำหน้าที่ต้องการตัดออกก่อนที่จะทำการเปรียบเทียบ
 * @returns อาร์เรย์ที่ถูกเรียงลำดับ
 */
export const sortByKey = (array: any[], key: string, orderBy: OrderBy ) => {
   
    return array.sort((a, b) => {
        if (orderBy === 'asc') {
            return parseInt(a[key]) - parseInt(b[key]);
        } else {
            return parseInt(b[key]) - parseInt(a[key]);
        }
    });
}