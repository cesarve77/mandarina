import React, { PureComponent } from 'react';
import { Schema } from '..';
import { Query, QueryProps, QueryResult } from "react-apollo";
import { AuthElementsProps } from "../Auth/Auth";
export declare const canUseDOM: boolean;
export declare type FindQueryResult = Pick<QueryResult, 'data' | 'loading' | 'error' | 'variables' | 'networkStatus' | 'refetch' | 'fetchMore' | 'startPolling' | 'stopPolling' | 'subscribeToMore' | 'updateQuery' | 'client'>;
export interface FindChildrenParams extends FindQueryResult {
    schema: Schema;
    fields: string[];
    query: Query;
    count: number;
    pageInfo?: {
        hasNextPage: boolean;
        hasPreviousPage: boolean;
        endCursor: string;
        startCursor: string;
    };
}
export interface FindChildren {
    (findChildrenParams: FindChildrenParams): React.ReactNode;
}
export declare type FindQueryProps = Pick<QueryProps, 'pollInterval' | 'notifyOnNetworkStatusChange' | 'fetchPolicy' | 'errorPolicy' | 'ssr' | 'displayName' | 'onCompleted' | 'onError' | 'context' | 'partialRefetch'>;
export declare type Having = {
    [field: string]: any;
};
export interface FindProps extends FindQueryProps {
    children?: FindChildren;
    schema: Schema;
    fields: string[];
    skip?: number;
    sort?: {
        [field: string]: -1 | 1;
    };
    where?: object;
    after?: string;
    first?: number;
    having?: Having;
}
export interface FindBaseProps {
    type: 'single' | 'plural' | 'connection';
}
export interface FindBaseState {
    fields: string[];
}
export declare class FindBase extends PureComponent<FindProps & FindBaseProps, FindBaseState> {
    static defaultProps: {
        where: {};
        first: undefined;
    };
    queryHistory: object[];
    buildQueryFromFields: (fields: string[]) => string;
    constructor(props: FindProps & FindBaseProps);
    render(): JSX.Element;
}
export declare const FindOne: (props: FindProps) => JSX.Element;
export declare const Find: (props: FindProps) => JSX.Element;
export declare const AuthFindBase: ({ Component, children, schema, denied, userRoles, action, fields: fieldsOri, Error, ...props }: {
    Component: React.ComponentType<FindProps>;
    action: "read" | "create" | "update" | "delete";
} & FindProps & AuthElementsProps) => JSX.Element;
export declare const AuthFindOne: (props: FindProps & AuthElementsProps) => JSX.Element;
export declare const AuthFind: (props: FindProps & AuthElementsProps) => JSX.Element;
