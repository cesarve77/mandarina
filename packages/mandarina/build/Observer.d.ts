import { RefObject } from "react";
import { QueryResult } from "react-apollo/Query";
declare const Observer: ({ refetch, children, pollInterval, startPolling, stopPolling, variables, ...props }: Pick<QueryResult<any, import("react-apollo").OperationVariables>, "refetch" | "startPolling" | "stopPolling"> & {
    variables: any;
    pollInterval?: number | undefined;
    children: any;
}) => any;
export default Observer;
export declare function useIdle(options: any, name?: string): boolean;
export declare function useActive(ref: RefObject<Element>, name?: string): boolean;
export declare function useIntersection(ref: RefObject<Element>, name?: string): boolean;
