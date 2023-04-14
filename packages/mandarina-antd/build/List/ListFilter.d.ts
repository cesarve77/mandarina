import * as React from "react";
import { Schema } from "mandarina";
export declare const uuid: () => string;
export interface OnFilterChange {
    (field: string, filter: any): void;
}
export declare type Where = any;
interface ListFilterProps {
    onFilterChange: OnFilterChange;
    field: string;
    schema: Schema;
    filter?: any;
    filters?: any;
}
export declare const ListFilter: React.MemoExoticComponent<({ onFilterChange, field, filter, schema }: ListFilterProps) => JSX.Element | null>;
export default ListFilter;
