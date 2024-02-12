import {Resizable} from "react-resizable";
import * as React from "react";
import ListFilter, {OnFilterChange} from "./ListFilter";
import {onResize} from "./List";
import {FieldDefinition, Overwrite} from "mandarina/build/Schema/Schema";
import {Schema} from "mandarina";


interface ListHeaderProps {
    onResize: onResize,
    width: number,
    children: React.ReactChildren
    fieldDefinition: FieldDefinition
    onFilterChange: OnFilterChange
    field: string,
    schema: Schema,
    overwrite?: Overwrite,
}

const ListHeader = ({field, onResize, onFilterChange, overwrite, width, schema, children, fieldDefinition,  ...rest}: ListHeaderProps) => {
    if (!width) return (
        <th {...rest}>
            {children}
            {onFilterChange &&
            <ListFilter field={field} overwrite={overwrite} schema={schema} onFilterChange={onFilterChange} />}
        </th>
    )
    return (
        <Resizable width={width}  overwrite={overwrite} height={0} onResize={onResize}>
            <th {...rest} >
                {children}
                {onFilterChange &&
                <ListFilter field={field} schema={schema} onFilterChange={onFilterChange} />}

            </th>
        </Resizable>
    );
}

export default ListHeader