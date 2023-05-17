import React, {ReactElement, SyntheticEvent} from "react"
import HideColumn from "./HideColumn";
import SortButton, {OnSortChange} from "./SortButton";
import ListFilter, {OnFilterChange} from "./ListFilter";
import {SortableContainer, SortableElement} from 'react-sortable-hoc';
import {ColumnDef, OnHideColumn, OnResizeStop, Sort} from "./ListVirtualized";
import {Schema} from "mandarina";
// @ts-ignore
import {ResizableBox, ResizeCallbackData} from 'react-resizable';
import {Overwrite} from "mandarina/build/Schema/Schema";


interface SortableColumnInterface {
    column: ColumnDef
    sort?: Sort
    filters: any
    overwrite?: Overwrite[string]
    schema: Schema
    onSortChange: OnSortChange
    onFilterChange: OnFilterChange
    onHideColumn: OnHideColumn
    onResizeStop: OnResizeStop
    height: number
    columnIndex: number
}


interface SortableColumnsInterface {
    children: ReactElement[]
    width: number
    height: number
}


export const SortableColumn = SortableElement(({columnIndex,  overwrite, column: {title,field, filter, noSort, width}, sort, filters, schema, onSortChange, onResizeStop, onFilterChange, onHideColumn, height}: SortableColumnInterface) => {
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
                                       overwrite={overwrite}
                                       filters={filters}
                                       filter={filters?.[field]}
                                       schema={schema}/>}
                {<HideColumn onHide={() => onHideColumn(field, columnIndex)}/>}

            </ResizableBox>
        );
    }
)

export const SortableColumns = SortableContainer(({children,height,empty, tHead,grid}: SortableColumnsInterface & any) => {
    return <div className={' mandarina-list-thead-row'}
                onWheel = {(e) =>{
                    tHead.current.scrollLeft = tHead.current.scrollLeft + e.deltaX
                    !empty && grid.current.scrollTo({scrollLeft: tHead.current.scrollLeft})
                }}
                style={{height}}>
        {children}
    </div>
});

