import React from "react"
import HideColumn from "./HideColumn";
import SortButton, {OnSortChange} from "./SortButton";
import ListFilter, {OnFilterChange} from "./ListFilter";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import {ColumnProps, OnHideColumn, Sort} from "./ListVirtualized";
import {Schema} from "mandarina";

interface SortableColumnInterface {
    column: ColumnProps
    sort?: Sort
    filters: any
    schema: Schema
    onSortChange: OnSortChange
    onFilterChange: OnFilterChange
    onHideColumn: OnHideColumn
}


interface SortableColumnsInterface {
    children: JSX.Element[],
    width: number
}


export const SortableColumn = SortableElement(({column: {title, field, filter, noSort, width}, sort, filters, schema, onSortChange, onFilterChange, onHideColumn}: SortableColumnInterface) => (
        <div key={field}
             className={'mandarina-list-thead-col ant-table-column-has-sorters ant-table-column-sort ' + field.replace(/\./g, '-')}
             style={{width}}>
            {<HideColumn onHide={() => onHideColumn(field)}/>}
            {title} {!noSort &&
        <SortButton onSortChange={onSortChange} field={field} sort={sort}/>}
            {filter && <ListFilter onFilterChange={onFilterChange}
                                   field={field}
                                   filter={filters && filters[field]}
                                   schema={schema}/>}
        </div>
    )
)

export const SortableColumns = SortableContainer(({children, width}: SortableColumnsInterface) => {
    return <div className={' mandarina-list-thead-row'}
                style={{width}}>
        {children}
    </div>
});

