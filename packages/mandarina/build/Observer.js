"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.useIntersection = exports.useActive = exports.useIdle = void 0;
var react_1 = __importStar(require("react"));
var Observer = function (_a) {
    var refetch = _a.refetch, children = _a.children, pollInterval = _a.pollInterval, startPolling = _a.startPolling, stopPolling = _a.stopPolling, variables = _a.variables, props = __rest(_a, ["refetch", "children", "pollInterval", "startPolling", "stopPolling", "variables"]);
    var firstTime = (0, react_1.useRef)(true);
    var div = (0, react_1.useRef)(null);
    var active = useActive(div, variables.where.status);
    (0, react_1.useEffect)(function () {
        if (!pollInterval)
            return;
        if (active) {
            if (!firstTime.current) {
                startPolling(pollInterval);
                refetch();
            }
            firstTime.current = false;
        }
        else {
            stopPolling();
        }
    }, [active]);
    if (!pollInterval)
        return children;
    // const portal=ReactDOM.createPortal(
    //     <div style={{position: 'fixed',
    //         width: 150,
    //         height: 20,
    //         display:'block',
    //         zIndex:99999,
    //         backgroundColor: variables.where.status==='Paid' ? '#ff00ff' : variables.where.status==='Due' ? '#0000ff' : '#ff0000',
    //         left:0,
    //         top: variables.where.status==='Paid' ? 0 : variables.where.status==='Due' ? 20 : 40
    //     }}>{active ? 'true' : 'false'}</div>,
    //     document.body,
    // );
    return (react_1.default.createElement("div", { ref: div }, children));
};
exports.default = Observer;
function useIdle(options, name) {
    if (name === void 0) { name = ''; }
    var createActivityDetector = require("activity-detector").default;
    var _a = (0, react_1.useState)(false), isIdle = _a[0], setIsIdle = _a[1];
    (0, react_1.useEffect)(function () {
        var activityDetector = createActivityDetector(options);
        activityDetector.on('idle', function () {
            setIsIdle(true);
        });
        activityDetector.on('active', function () {
            setIsIdle(false);
        });
        return function () {
            activityDetector.stop();
        };
    }, []);
    return isIdle;
}
exports.useIdle = useIdle;
function useActive(ref, name) {
    if (name === void 0) { name = ''; }
    var intersection = useIntersection(ref, name);
    var idle = useIdle({
        timeToIdle: 30000,
        ignoredEventsWhenIdle: [],
    }, name);
    // const documentVisibility = useDocumentVisibility()
    return !idle && intersection;
}
exports.useActive = useActive;
function useIntersection(ref, name) {
    if (name === void 0) { name = ''; }
    var _a = (0, react_1.useState)(true), visible = _a[0], setVisible = _a[1];
    (0, react_1.useEffect)(function () {
        if (!ref.current)
            return;
        var callback = function (entries) {
            entries.forEach(function (entry) {
                setVisible(entry.intersectionRatio >= 0.15);
            });
        };
        var options = { threshold: [.14, .16] };
        var observer = new IntersectionObserver(callback, options);
        observer.observe(ref.current);
        return function () {
            if (!ref.current)
                return;
            observer.unobserve(ref.current);
        };
    }, [ref.current]);
    return visible;
}
exports.useIntersection = useIntersection;
//
// export function useDocumentVisibility() {
//     let [documentVisibility, setDocumentVisibility] = useState(getVisibility());
//
//     function handleVisibilityChange() {
//         setDocumentVisibility(getVisibility());
//     }
//
//     useEffect(() => {
//         // @ts-ignore
//         document.addEventListener('visibilitychange', handleVisibilityChange);
//         return () => {
//             // @ts-ignore
//             document.removeEventListener('visibilitychange', handleVisibilityChange);
//         };
//     }, []);
//
//     return documentVisibility;
// }
//
// function getVisibility() {
//     return document.visibilityState==='visible'
// }
//# sourceMappingURL=Observer.js.map