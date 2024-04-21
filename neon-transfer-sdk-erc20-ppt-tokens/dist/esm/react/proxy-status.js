import { useEffect, useState } from 'react';
export const proxyStatus = 'proxyStatus';
export function useProxyInfo(api) {
    const [status, setStatus] = useState({});
    useEffect(() => {
        if ('localStorage' in window) {
            const data = localStorage.getItem(proxyStatus);
            if (data && data.length > 0) {
                try {
                    const parse = JSON.parse(data);
                    setStatus(parse);
                }
                catch (e) {
                    //
                }
            }
        }
    }, []);
    useEffect(() => {
        api.evmParams().then(result => {
            setStatus(result);
            if ('localStorage' in window) {
                localStorage.setItem(proxyStatus, JSON.stringify(result));
            }
        }).catch(e => console.log(e));
    }, [api]);
    return status;
}
