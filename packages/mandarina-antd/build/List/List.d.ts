import { ColumnProps } from 'antd/lib/table';
import { Schema } from 'mandarina';
import * as React from "react";
import { ComponentType } from "react";
import { FieldDefinition, Overwrite } from 'mandarina/build/Schema/Schema';
import { Where } from "./ListFilter";
import { FindProps } from "mandarina/build/Operations/Find";
import { ReactComponentLike } from "prop-types";
import { TableProps } from "antd/lib/table/interface";
export declare type onResize = (e: any, { size }: {
    size: {
        width: number;
    };
}) => void;
export interface ListProps extends FindProps {
    schema: Schema;
    fields: string[];
    overwrite?: Overwrite;
    pageSize?: number;
    first?: number;
    where?: any;
    ref?: React.Ref<List>;
    Dimmer?: ComponentType;
    header?: ReactComponentLike;
    tableProps?: TableProps<any>;
}
export interface FieldDefinitions {
    [field: string]: FieldDefinition;
}
export interface ConnectionResult {
    [connection: string]: {
        pageInfo: {
            hasNextPage: boolean;
            hasPreviousPage: boolean;
            startCursor: string;
            endCursor: string;
        };
        edges: Edge[];
        aggregate: {
            count: number;
        };
        __typename?: string;
    };
}
export interface Edge {
    node: {
        id: string;
        [field: string]: any;
    };
}
export declare class List extends React.Component<ListProps, {
    columns: ColumnProps<any>[];
}> {
    me: React.RefObject<HTMLDivElement>;
    fetchMore: () => void;
    refetch: any;
    hasNextPage: boolean;
    refetching: boolean;
    variables: {
        where?: any;
        first?: number;
        after?: string;
    };
    data?: any[];
    loading: boolean;
    constructor(props: ListProps);
    static defaultProps: {
        first: number;
        pageSize: number;
    };
    getColumns(fields: string[], path?: string): ColumnProps<any>[];
    getColumnDefinition: (field: string, index: number) => ColumnProps<any> | undefined;
    buildFetchMore: (fetchMore: (fetchMoreOptions: any) => Promise<any>, endCursor?: string | undefined) => void;
    filters: {
        [field: string]: Where;
    };
    handleResize: (index: number) => onResize;
    firstLoad: boolean;
    render(): JSX.Element;
}
