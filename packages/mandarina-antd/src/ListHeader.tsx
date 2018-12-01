import {Resizable} from "react-resizable";
import * as React from "react";
import {Component} from "react";
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

class ListHeader extends Component<ListHeaderProps> {

    componentDidCatch(error: any, info: any) {
        console.log('----->>>', error, info, this.props)
    }

    render() {
        const {field, onResize, onFilterChange, width, children, fieldDefinition, variables, ...props} = this.props
        if (!width) return (
            <th {...props}>
                {children}
                {onFilterChange &&
                <ListFilter field={field} fieldDefinition={fieldDefinition} onFilterChange={onFilterChange}
                            variables={variables}/>}
            </th>
        )
        return (
            <Resizable width={width} height={0} onResize={onResize}>
                <th {...props} >
                    {children}
                    {onFilterChange &&
                    <ListFilter field={field} fieldDefinition={fieldDefinition} onFilterChange={onFilterChange}
                                variables={variables}/>}
                </th>
            </Resizable>
        );
    };
}

export default ListHeader