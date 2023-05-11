import React, {RefObject, useEffect, useRef, useState} from "react"
import {QueryResult} from "react-apollo/Query";


const Observer = ({
                      refetch,
                      children,
                      pollInterval,
                      startPolling,
                      stopPolling,
                      variables,
                      ...props
                  }:
                      Pick<QueryResult, 'refetch' | 'startPolling' | 'stopPolling'> &
                      {
                          variables: any,
                          pollInterval?: number,
                          children: any
                      }) => {
    const firstTime = useRef(true)
    const div = useRef<HTMLDivElement>(null)
    const active = useActive(div, variables.where.status)
    useEffect(() => {
        if (!pollInterval) return
        if (active) {

            if (!firstTime.current) {
                startPolling(pollInterval)
                refetch()
            }
            firstTime.current = false
        } else {
            stopPolling()
        }

    }, [active])
    if (!pollInterval) return children
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
    return (<div
        ref={div}>
        {children}</div>)

}
export default Observer

export function useIdle(options: any, name = '') {
    const createActivityDetector = require("activity-detector").default
    const [isIdle, setIsIdle] = useState(false);
    useEffect(() => {
        const activityDetector = createActivityDetector(options)
        activityDetector.on('idle', () => {
            setIsIdle(true)
        })
        activityDetector.on('active', () => {
            setIsIdle(false);
        })
        return () => {
            activityDetector.stop()
        }
    }, [])
    return isIdle
}

export function useActive(ref: RefObject<Element>, name = '') {
    const intersection = useIntersection(ref, name)
    const idle = useIdle({
        timeToIdle: 30000,
        ignoredEventsWhenIdle: [],
    }, name)
    // const documentVisibility = useDocumentVisibility()
    return !idle && intersection
}

export function useIntersection(ref: RefObject<Element>, name = '') {
    const [visible, setVisible] = useState(true);
    useEffect(() => {
        if (!ref.current) return
        const callback: IntersectionObserverCallback = (entries) => {
            entries.forEach(entry => {
                setVisible(entry.intersectionRatio >= 0.15)
            });
        };
        const options = {threshold: [.14, .16]};
        const observer = new IntersectionObserver(callback, options);
        observer.observe(ref.current)
        return () => {
            if (!ref.current) return
            observer.unobserve(ref.current);
        }
    }, [ref.current])
    return visible
}

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
