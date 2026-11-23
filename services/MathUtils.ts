/**
 * Calculates the sum of a specific property in an array of objects.
 *
 * @param item - The array of objects.
 * @param key - The property key to sum.
 * @returns The sum of the specified property values.
 */
const sumAll = (items: any[], keyOrFn: string | ((item: any) => number)) => {
  let sum = 0
  items.forEach((value: any) => {
    if (typeof keyOrFn === 'function') {
      sum += Number(keyOrFn(value) || 0)
    } else {
      sum += Number(value[keyOrFn] || 0)
    }
  })
  return sum
}


/**
 * Calculates the sum of a specific property in an array of objects based on a condition.
 * @param item - The array of objects.
 * @param key - The property to sum.
 * @param condition - The condition to filter the objects.
 * @param value - The value to compare against the condition.
 * @returns The sum of the specified property.
 */
const sumAllWithCondition = (item: any, key: string, condition: string, value: any) => {
  let sum = 0
  item.forEach((item: any) => {
    if (item[condition] === value) {
      sum += Number(item[key])
    }
  })
  return sum
}

const isNotZero = (value: number | string): boolean => {
  return Number(value) !== 0
}

export { isNotZero, sumAll, sumAllWithCondition }
