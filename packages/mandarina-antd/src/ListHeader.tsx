import {Resizable} from "react-resizable";
import * as React from "react";
import ListFilter, {onFilterChange} from "./ListFilter";
import {onResize} from "./List";
import {FieldDefinition} from "mandarina/build/Schema/Schema";
import {Schema} from "mandarina";


interface ListHeaderProps {
    onResize: onResize,
    width: number,
    children: React.ReactChildren
    fieldDefinition: FieldDefinition
    onFilterChange: onFilterChange
    field: string,
    schema: Schema,
}

const ListHeader = ({field, onResize, onFilterChange, width, schema, children, fieldDefinition,  ...rest}: ListHeaderProps) => {
    if (!width) return (
        <th {...rest}>
            {children}
            {onFilterChange &&
            <ListFilter field={field} schema={schema} onFilterChange={onFilterChange} />}
        </th>
    )
    return (
        <Resizable width={width} height={0} onResize={onResize}>
            <th {...rest} >
                {children}
                {onFilterChange &&
                <ListFilter field={field} schema={schema} onFilterChange={onFilterChange} />}

            </th>
        </Resizable>
    );
}

export default ListHeader