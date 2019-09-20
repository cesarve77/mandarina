import React, {SyntheticEvent} from "react"
import HideColumn from "./HideColumn";
import SortButton, {OnSortChange} from "./SortButton";
import ListFilter, {OnFilterChange} from "./ListFilter";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import {ColumnProps, OnHideColumn, OnResizeStop, Sort} from "./ListVirtualized";
import {Schema} from "mandarina";
// @ts-ignore
import {ResizableBox, ResizeCallbackData} from 'react-resizable';


interface SortableColumnInterface {
    column: ColumnProps
    sort?: Sort
    filters: any
    schema: Schema
    onSortChange: OnSortChange
    onFilterChange: OnFilterChange
    onHideColumn: OnHideColumn
    onResizeStop: OnResizeStop
    height: number
    columnIndex: number
}


interface SortableColumnsInterface {
    children: JSX.Element[]
    width: number
    height: number
}


export const SortableColumn = SortableElement(({columnIndex, column: {title, field, filter, noSort, width}, sort, filters, schema, onSortChange, onResizeStop, onFilterChange, onHideColumn, height}: SortableColumnInterface) => {
    console.log('columnIndex',columnIndex)
        return (
            <ResizableBox
                className={'mandarina-list-thead-col ant-table-column-has-sorters ant-table-column-sort ' + field.replace(/\./g, '-')}
                width={width}
                height={height}
                handleSize={[10, 10]}
                axis={'x'}
                onResizeStop={(e: SyntheticEvent, data: ResizeCallbackData) => onResizeStop(field, data.size.width, columnIndex)}>
                <div>
                    {title}
                    {!noSort && <SortButton onSortChange={onSortChange} field={field} sort={sort}/>}
                </div>

                {filter && <ListFilter onFilterChange={onFilterChange}
                                       field={field}
                                       filter={filters && filters[field]}
                                       schema={schema}/>}
                {<HideColumn onHide={() => onHideColumn(field, columnIndex)}/>}

            </ResizableBox>
        );
    }
)

export const SortableColumns = SortableContainer(({children, width, height}: SortableColumnsInterface) => {
    return <div className={' mandarina-list-thead-row'}
                style={{width, height}}>
        {children}
    </div>
});

