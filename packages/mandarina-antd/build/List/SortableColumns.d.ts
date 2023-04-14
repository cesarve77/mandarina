import React from "react";
import { OnSortChange } from "./SortButton";
import { OnFilterChange } from "./ListFilter";
import { ColumnDef, OnHideColumn, OnResizeStop, Sort } from "./ListVirtualized";
import { Schema } from "mandarina";
interface SortableColumnInterface {
    column: ColumnDef;
    sort?: Sort;
    filters: any;
    schema: Schema;
    onSortChange: OnSortChange;
    onFilterChange: OnFilterChange;
    onHideColumn: OnHideColumn;
    onResizeStop: OnResizeStop;
    height: number;
    columnIndex: number;
}
export declare const SortableColumn: React.ComponentClass<SortableColumnInterface & import("react-sortable-hoc").SortableElementProps, any>;
export declare const SortableColumns: React.ComponentClass<any, any>;
export {};
