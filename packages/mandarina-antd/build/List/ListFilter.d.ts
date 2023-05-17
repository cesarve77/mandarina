import * as React from "react";
import { Schema } from "mandarina";
import { Overwrite } from "mandarina/build/Schema/Schema";
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
    overwrite?: Overwrite[string];
    filters?: any;
}
export declare const ListFilter: React.MemoExoticComponent<({ onFilterChange, overwrite, field, filter, schema }: ListFilterProps) => JSX.Element | null>;
export default ListFilter;
