"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProxyInfo = exports.proxyStatus = void 0;
const react_1 = require("react");
exports.proxyStatus = 'proxyStatus';
function useProxyInfo(api) {
    const [status, setStatus] = (0, react_1.useState)({});
    (0, react_1.useEffect)(() => {
        if ('localStorage' in window) {
            const data = localStorage.getItem(exports.proxyStatus);
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
    (0, react_1.useEffect)(() => {
        api.evmParams().then(result => {
            setStatus(result);
            if ('localStorage' in window) {
                localStorage.setItem(exports.proxyStatus, JSON.stringify(result));
            }
        }).catch(e => console.log(e));
    }, [api]);
    return status;
}
exports.useProxyInfo = useProxyInfo;
