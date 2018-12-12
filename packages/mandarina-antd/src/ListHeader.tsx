import {Resizable} from "react-resizable";
import * as React from "react";
import ListFilter, {onFilterChange, variables} from "./ListFilter";
import {onResize} from "./List";
import {FieldDefinition} from "mandarina/build/Schema/Schema";


interface ListHeaderProps {
    onResize: onResize,
    width: number,
    children: React.ReactChildren
    fieldDefinition: FieldDefinition
    onFilterChange: onFilterChange
    field: string,
    variables: variables
}

const ListHeader = ({field, onResize, onFilterChange, width, children, fieldDefinition, variables, ...rest}: ListHeaderProps) => {
    if (!width) return (
        <th {...rest}>
            {children}
            {onFilterChange &&
            <ListFilter field={field} fieldDefinition={fieldDefinition} onFilterChange={onFilterChange}
                        variables={variables}/>}
        </th>
    )
    return (
        <Resizable width={width} height={0} onResize={onResize}>
            <th {...rest} >
                {children}
                {onFilterChange &&
                <ListFilter field={field} fieldDefinition={fieldDefinition} onFilterChange={onFilterChange}
                            variables={variables}/>}
            </th>
        </Resizable>
    );
}

export default ListHeader