import dayjs from 'dayjs';
import Cookies from 'js-cookie';

const getAllCookies = () => {
    return Cookies.get();
}

/**
 * Sets a value in the browser's local storage with an optional expiration time.
 * @param key - The key to use for the local storage entry.
 * @param value - The value to store in the local storage entry.
 * @param expire_unix_time - The Unix timestamp (in seconds) when the entry should expire.
 */
const setLocalStorage = (key: string, value: any, expire_unix_time?: number) => {
    if (!expire_unix_time) {
        Cookies.set(key, JSON.stringify({value}));
    } else {
        Cookies.set(key, JSON.stringify({value}), {expires: new Date(expire_unix_time * 1000)});
    }
}

/**
 * Retrieves a value from local storage by key.
 * If the value is expired, it will be removed from local storage and null will be returned.
 * @param key - The key to retrieve the value for.
 * @returns The value associated with the key, or null if the value is expired or not found.
 */
const getLocalStorage = (key: string) => {
    const data = Cookies.get(key);
    // if data is string or json
    if (data) {
        const parsedData = JSON.parse(data);
        // if data is expired
        if (parsedData.expire_unix_time && parsedData.expire_unix_time < dayjs().unix()) {
            localStorage.removeItem(key);
            return null;
        }
        return parsedData.value;
    }
}

/**
 * Removes the item with the specified key from local storage.
 * @param key - The key of the item to remove.
 */
const clearLocalStorage = (key: string) => {
    Cookies.remove(key);
}

/**
 * Clears all items from the local storage.
 */
const clearAllLocalStorage = () => {
    // get all keys Cookies
    const keys = Object.keys(Cookies.get());
    keys.forEach(key => {
        Cookies.remove(key);
    });
}

/**
 * Returns the Unix timestamp for a future date/time based on a given value and unit of time.
 * @param value The amount of time to add to the current date/time.
 * @param unit The unit of time to add to the current date/time (e.g. 'day', 'hour', 'minute', etc.).
 * @returns The Unix timestamp for the future date/time.
 */
const getUnixTime = (value: number, unit: dayjs.ManipulateType) => {
    return dayjs().add(value, unit).unix();
}

export {
    clearAllLocalStorage, clearLocalStorage, getAllCookies, getLocalStorage, getUnixTime, setLocalStorage
};


