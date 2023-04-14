import * as React from "react";
import { OnFilterChange } from "./ListFilter";
import { onResize } from "./List";
import { FieldDefinition } from "mandarina/build/Schema/Schema";
import { Schema } from "mandarina";
interface ListHeaderProps {
    onResize: onResize;
    width: number;
    children: React.ReactChildren;
    fieldDefinition: FieldDefinition;
    onFilterChange: OnFilterChange;
    field: string;
    schema: Schema;
}
declare const ListHeader: ({ field, onResize, onFilterChange, width, schema, children, fieldDefinition, ...rest }: ListHeaderProps) => JSX.Element;
export default ListHeader;
