import { Schema } from 'mandarina';
import React, { ReactElement, ReactNode } from "react";
import { GridOnScrollProps } from 'react-window';
import { OnFilterChange, Where } from "./ListFilter";
import { CellComponent, FilterComponent, FilterMethod, Overwrite } from "mandarina/build/Schema/Schema";
import { ReactComponentLike } from "prop-types";
import { HeaderDefaultProps } from "./HeaderDefault";
import { OnSortChange } from "./SortButton";
import { SortEnd } from "react-sortable-hoc";
import { FindProps } from "mandarina/build/Operations/Find";
export interface OnHideColumn {
    (field: string, index: number): void;
}
export interface OnResizeStop {
    (field: string, size: number, index: number): void;
}
export interface ControlledListProps {
    overwrite?: Overwrite;
    filters?: Filters;
    sort?: Sort;
    onFilterChange?: (filters: Filters) => void;
    onFieldsChange?: (fields: string[]) => void;
    onOverwriteChange?: (overwrite: Overwrite) => void;
    onSortChange?: (sort: Sort) => void;
    leftButtons?: ReactNode;
}
declare type MouseEvent = (props: {
    data: any;
    rowIndex: number;
    columnIndex: number;
    field: string;
}) => void;
interface MouseEvents {
    onClick?: MouseEvent;
    onMouseEnter?: MouseEvent;
    onMouseLeave?: MouseEvent;
}
export interface ListProps extends MouseEvents, ControlledListProps, Omit<FindProps, 'children' | 'schema' | 'where' | 'skip' | 'first' | 'sort' | 'fields'> {
    schema: Schema;
    fields: string[];
    pageSize?: number;
    first?: number;
    where?: any;
    height?: number;
    width?: number;
    estimatedRowHeight?: number;
    overscanRowCount?: number;
    overLoad?: number;
    onDataChange?: (data: any[]) => void;
    header?: ReactComponentLike | HeaderDefaultProps;
    ref?: React.Ref<ListVirtualized>;
}
export interface ConnectionResult {
    totalCount: {
        aggregate: {
            count: number;
        };
        __typename?: string;
    };
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
    } | {
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
export declare type Filters = {
    [field: string]: Where;
};
export declare type Sort = {
    [field: string]: 1 | -1;
};
interface ListState {
    filters: any;
    sort?: Sort;
    height: number;
    width: number;
    fields: string[];
    overwrite?: Overwrite;
}
export declare type Refetch = (refetchOptions: any) => Promise<any>;
export interface ColumnDef {
    field: string;
    title: ReactNode;
    width: number;
    CellComponent?: CellComponent;
    FilterComponent: FilterComponent;
    filterMethod: FilterMethod;
    props?: any;
    loadingElement?: ReactElement;
    filter: boolean;
    noSort: boolean;
}
export declare class ListVirtualized extends React.Component<ListProps, ListState> {
    gridRef: React.RefObject<unknown>;
    data: any[];
    fields: string[];
    tHead: React.RefObject<HTMLDivElement>;
    container: React.RefObject<HTMLDivElement>;
    hasNextPage: boolean;
    variables: {
        where?: any;
        first?: number;
        after?: string;
    };
    refetch: Refetch;
    startPolling: (pollInterval: number) => void;
    stopPolling: () => void;
    estimatedColumnWidth: number;
    firstLoad: number;
    overscanRowStartIndex: number;
    overscanRowStopIndex: number;
    visibleRowStartIndex: number;
    visibleRowStopIndex: number;
    constructor(props: ListProps);
    getSnapshotBeforeUpdate(prevProps: ListProps, prevState: ListState): null;
    static getDerivedStateFromProps(props: ListProps, state: ListState): Partial<ListState>;
    static defaultProps: {
        Header: ({ leftButtons, counter, menuItems, count, ...props }: HeaderDefaultProps & import("./HeaderDefault").HeaderProps) => JSX.Element;
        height: number;
        width: number;
        estimatedRowHeight: number;
    };
    componentDidMount(): void;
    componentWillUnmount(): void;
    resize: () => void;
    onResizeTimeoutId: number;
    onResize: () => void;
    onScrollTimeoutId: number;
    /**
     * used as method for ref , ref.current.fresh()
     * do not remove
     * @param full
     */
    refresh: (full?: boolean) => Promise<unknown>;
    onScroll: ({ scrollLeft }: GridOnScrollProps) => Promise<unknown>;
    getColumnDefinition: (field: string) => ColumnDef | null;
    onFilterChange: OnFilterChange;
    onHideOrShowColumn: (field: string, index: number, show: boolean) => void;
    onHideColumn: OnHideColumn;
    onShowColumn: OnHideColumn;
    onResizeStop: OnResizeStop;
    onColumnOrderChange: ({ oldIndex, newIndex }: SortEnd) => void;
    onSortChange: OnSortChange;
    getAllFilters: (filters: Filters, overwrite?: Overwrite | undefined) => any[];
    calcColumns: (fields: string[], overwrite?: Overwrite | undefined) => (ColumnDef | null)[];
    render(): JSX.Element;
}
export declare const DefaultCellComponent: CellComponent;
export declare const getParentCellComponent: (field: string, schema: Schema) => string | false;
export {};
