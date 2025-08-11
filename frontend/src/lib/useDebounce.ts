import { useEffect, useState } from "react"

const useDebounce = (value: string, delay: number) => {
    const [debounceValue, setDebounceValue] = useState(value || "");

    useEffect(() => {
        const timeOut = setTimeout(() => {
            setDebounceValue(value);
        }, delay);

        // clean up function
        return () => clearTimeout(timeOut);
    }, [value, delay])

    return debounceValue;
}

export default useDebounce