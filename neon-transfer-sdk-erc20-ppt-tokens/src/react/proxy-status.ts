import { useEffect, useState } from 'react';
import { NeonProxyRpcApi } from '../api';
import { NeonProgramStatus } from '../models';

export const proxyStatus = 'proxyStatus';

export function useProxyInfo(api: NeonProxyRpcApi): NeonProgramStatus {
  const [status, setStatus] = useState<NeonProgramStatus>({} as NeonProgramStatus);

  useEffect(() => {
    if ('localStorage' in window) {
      const data = localStorage.getItem(proxyStatus);
      if (data && data.length > 0) {
        try {
          const parse = JSON.parse(data);
          setStatus(parse);
        } catch (e) {
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
