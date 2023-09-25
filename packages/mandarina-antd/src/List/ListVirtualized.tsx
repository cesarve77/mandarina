import {Find, Schema} from 'mandarina';
import React, {ReactElement, ReactNode} from "react";
import memoizeOne from "memoize-one"
// import {isEqual} from 'lodash';
import {isEmpty, isEqual, merge, set} from 'lodash'

import {
    areEqual,
    GridChildComponentProps,
    GridOnScrollProps,
    ListChildComponentProps,
    VariableSizeGrid as Grid
} from 'react-window';
import {OnFilterChange, Where} from "./ListFilter";
import {CellComponent, FilterComponent, FilterMethod, Overwrite} from "mandarina/build/Schema/Schema";
import Empty, {EmptyProps} from "antd/lib/empty";
import {getDefaultFilterMethod} from "./ListFilters";
import {ReactComponentLike} from "prop-types";
import {get} from "mandarina/build/Schema/utils";
import {DocumentNode} from "graphql";
import {RefetchQueriesProviderFn} from "react-apollo";
import HeaderDefault, {HeaderDefaultProps} from "./HeaderDefault";
import {OnSortChange} from "./SortButton";
import {SortableColumn, SortableColumns} from "./SortableColumns";
import {SortEnd} from "react-sortable-hoc";
import arrayMove from 'array-move'
import {deepClone} from "mandarina/build/Operations/Mutate";
import {equalityFn} from "./utils";
import Query from "react-apollo/Query";
import {Result} from "antd";
import {FindProps} from "mandarina/build/Operations/Find";

export interface OnHideColumn {
    (field: string, index: number): void//todo variables format
}

export interface OnResizeStop {
    (field: string, size: number, index: number): void//todo variables format
}

export interface ControlledListProps {
    overwrite?: Overwrite
    filters?: Filters
    sort?: Sort
    onFilterChange?: (filters: Filters) => void
    onFieldsChange?: (fields: string[]) => void
    onOverwriteChange?: (overwrite: Overwrite) => void
    onSortChange?: (sort: Sort) => void
    leftButtons?: ReactNode
}


type  MouseEvent = (props: { data: any, rowIndex: number, columnIndex: number, field: string }) => void;

interface MouseEvents {
    onClick?: MouseEvent
    onMouseEnter?: MouseEvent
    onMouseLeave?: MouseEvent
}

export interface ListProps extends MouseEvents, ControlledListProps, Omit<FindProps, 'children' | 'schema' | 'where' | 'skip' | 'first' | 'sort' | 'fields'> {
    schema: Schema
    fields: string[]
    pageSize?: number
    first?: number
    where?: any
    height?: number
    width?: number
    estimatedRowHeight?: number
    rowHeight?: (rowIndex: number, data: any[]) => number
    overscanRowCount?: number
    overLoad?: number
    onDataChange?: (data: any[]) => void,
    header?: ReactComponentLike | HeaderDefaultProps
    ref?: React.Ref<ListVirtualized>
    emptyProps: EmptyProps


}


export interface ConnectionResult {
    totalCount: {
        aggregate: {
            count: number
        }
        __typename?: string
    }

    [connection: string]: {
        pageInfo: {
            hasNextPage: boolean
            hasPreviousPage: boolean
            startCursor: string
            endCursor: string
        },
        edges: Edge[]
        aggregate: {
            count: number
        }
        __typename?: string
    } | {
        aggregate: {
            count: number
        }
        __typename?: string
    }
}

export interface Edge {
    node: {
        id: string
        [field: string]: any

    }
}


const estimatedColumnWidthDefault = 175;
const estimatedRowHeightDefault = 60;

export type Filters = { [field: string]: Where }
export type Sort = { [field: string]: 1 | -1 }

interface ListState {
    filters: any,
    sort?: Sort,
    height: number,
    width: number
    fields: string[]
    overwrite?: Overwrite
}

export type Refetch = (refetchOptions: any) => Promise<any>

const createItemData = memoizeOne((data: any, columns: (ColumnDef | null)[], refetch: Refetch, query: Query, variables: any, onClick?: MouseEvent, onMouseEnter?: MouseEvent, onMouseLeave?: MouseEvent) => ({
    data, columns, refetch, query, variables, onClick, onMouseEnter, onMouseLeave
}));

export interface ColumnDef {
    field: string
    title: ReactNode
    width: number
    CellComponent?: CellComponent
    FilterComponent: FilterComponent
    filterMethod: FilterMethod
    props?: any
    loadingElement?: ReactElement
    filter: boolean
    noSort: boolean
}


export class ListVirtualized extends React.Component<ListProps, ListState> {
    gridRef = React.createRef();
    data: any[] = [];
    fields: string[];
    tHead: React.RefObject<HTMLDivElement>;
    container: React.RefObject<HTMLDivElement>;
    hasNextPage: boolean = false;
    variables: { where?: any, first?: number, after?: string };
    refetch: Refetch;
    startPolling: (pollInterval: number) => void;
    stopPolling: () => void;
    estimatedColumnWidth: number;
    firstLoad: number;
    overscanRowStartIndex: number = 0;
    overscanRowStopIndex: number = 0;
    visibleRowStartIndex: number = 0;
    visibleRowStopIndex: number = 0;

    constructor(props: ListProps) {
        super(props);
        const {
            fields = props.schema.getFields(),
            filters = {},
            overwrite,
            sort,
        } = props;

        //const definitions: Partial<FieldDefinitions> = {}
        this.state = {fields, overwrite, height: this.props.height || 0, width: this.props.width || 0, filters, sort};
        this.tHead = React.createRef();
        this.container = React.createRef();
        // this.firstLoad = Math.max(this.props.first || 0, canUseDOM ? Math.ceil((this.props.height || window.innerHeight) / estimatedRowHeight) : 0)
        this.firstLoad = this.props.first || 50
        this.overscanRowStopIndex = this.firstLoad

    }

    getSnapshotBeforeUpdate(prevProps: ListProps, prevState: ListState) {
        if (this.props.onFieldsChange && (this.props.onOverwriteChange)) {
            if (!isEqual(this.state.overwrite, prevState.overwrite)) {
                // @ts-ignore
                this.gridRef.current && this.gridRef.current.resetAfterColumnIndex(0, false);
                return null
            }
            for (let i = 0; i < prevState.fields.length; i++) {
                if (prevState.fields[i] !== this.state.fields[i]) {
                    // @ts-ignore
                    this.gridRef.current && this.gridRef.current.resetAfterColumnIndex(i, false);
                    return null
                }
            }
        }
        return null
    }

    static getDerivedStateFromProps(props: ListProps, state: ListState) {
        const result: Partial<ListState> = {};
        if (props.onFieldsChange && !isEqual(props.fields, state.fields)) {
            result.fields = props.fields || props.schema.getFields()
        }

        if ((props.onOverwriteChange) && !isEqual(props.overwrite, state.overwrite)) {
            result.overwrite = {...props.overwrite}
        }
        if (props.onSortChange && !isEqual(props.sort, state.sort)) {
            result.sort = props.sort
        }
        if (props.onFilterChange && !isEqual(props.filters, state.filters)) {
            result.filters = props.filters || {}
        }
        return result
    }

    static defaultProps = {
        Header: HeaderDefault,
        height: 0,
        width: 0,
        estimatedRowHeight: estimatedRowHeightDefault,

    };

    componentDidMount(): void {
        const {height, width} = this.props;
        if (height && width) return;
        this.resize();
        window.addEventListener('resize', this.onResize);
    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', this.onResize);
    }

    resize = () => {
        let container = this.container.current && this.container.current.parentNode && this.container.current.parentNode.parentElement;
        let deep = 0
        while (container && container.clientHeight === 0 && deep < 100) {
            container = container.parentElement
            deep++
        }
        if (container) {
            if (!this.props.height && this.state.height !== container.clientHeight) {
                this.setState({height: container.clientHeight})
            }
            if (!this.props.width && this.state.width !== container.clientWidth) {
                this.setState({width: container.clientWidth})
            }
        }

    }
    onResizeTimeoutId: number;
    onResize = () => {
        this.onResizeTimeoutId && window.clearTimeout(this.onResizeTimeoutId);
        this.onResizeTimeoutId = window.setTimeout(this.resize, 200)

    }


    onScrollTimeoutId: number;
    /**
     * used as method for ref , ref.current.fresh()
     * do not remove
     * @param full
     */
    refresh = (full: boolean = true) => {
        if (full) this.data = []
        return this.onScroll({})
    }
    onScroll = ({scrollLeft}: GridOnScrollProps) => new Promise((resolve, reject) => {
        if (this.tHead.current) {
            this.tHead.current.scrollLeft = scrollLeft
        }
        //this.setState({row: this.visibleRowStartIndex})
        this.onScrollTimeoutId && window.clearTimeout(this.onScrollTimeoutId);
        this.onScrollTimeoutId = window.setTimeout(() => {
            //If all visible are loaded, then not refetch
            if (this.data.length && [...this.data].slice(this.visibleRowStartIndex, this.visibleRowStopIndex).every((val) => val !== undefined)) {
                resolve(false)
                return;
            }
            //estan todos en el mismo ciclo
            const skip = this.overscanRowStartIndex - (this.overscanRowStartIndex % this.firstLoad)
            this.props.pollInterval && this.stopPolling && this.stopPolling();
            if (!this.data[this.overscanRowStartIndex] && !this.data[this.overscanRowStopIndex]) {
                this.refetch({
                    skip,
                    first: this.overscanRowStopIndex <= this.firstLoad ? this.firstLoad : 2 * this.firstLoad
                })
                    .then(resolve)
                    .catch(reject)

            } else if (!this.data[this.overscanRowStartIndex]) {
                this.refetch({skip, first: this.firstLoad})
                    .then(resolve)
                    .catch(reject)
            } else if (!this.data[this.overscanRowStopIndex]) {
                this.refetch({skip: skip + this.firstLoad, first: this.firstLoad})
                    .then(resolve)
                    .catch(reject)

            }
            this.props.pollInterval && this.startPolling && this.startPolling(this.props.pollInterval);
        }, 100)
    })

    getColumnDefinition = (field: string): ColumnDef | null => {
        //detect if parent has a CellComponent
        const parentPath = getParentCellComponent(field, this.props.schema);
        if (parentPath) {
            field = parentPath
        }
        const overwrite = this.state.overwrite && this.state.overwrite[field];

        let definition
        if (!this.props.schema.hasPath(field) && field.indexOf('.') < 0 && overwrite) {
            definition = merge({
                list: {
                    noFilter: true,
                    noSort: true
                }
            }, deepClone(this.props.schema.applyDefinitionsDefaults({type: String}, field)), overwrite)
        } else {
            definition = this.props.schema.getPathDefinition(field);
            if (overwrite) {
                definition = merge(deepClone(definition), overwrite)
            }
        }
        if (!definition.list) throw new Error(`You need to provide overwrite full definition for "${field}"`)

        if (definition.list.hidden) {
            return null
        } else {
            return {
                field,
                loadingElement: definition.list.loadingElement,
                CellComponent: definition.list.CellComponent,
                FilterComponent: definition.list.filterComponent || getDefaultFilterMethod(field, this.props.schema),
                filterMethod: definition.list.filterMethod || getDefaultFilterMethod(field, this.props.schema),
                title: definition.label ? definition.label : "",
                width: definition.list.width || estimatedColumnWidthDefault,
                filter: !definition.list.noFilter,
                noSort: !!(definition.isTable || definition.isArray || field.indexOf('.') > 0 || definition.list.noSort),
                props: definition.list.props || {},
            }
        }
    }


    onFilterChange: OnFilterChange = (field, filter) => {
        this.data = [];
        // @ts-ignore
        this.gridRef.current && this.gridRef.current.scrollToItem({
            rowIndex: 0
        });
        this.setState(({filters}) => {
            const newFilters = {...filters};
            if (filter && !isEmpty(filter)) {
                newFilters[field] = filter
            } else {
                delete newFilters[field]
            }
            if (this.props.onFilterChange) {
                this.props.onFilterChange(newFilters);
                return null
            } else {

                return {filters: newFilters}
            }
        })
    };
    onHideOrShowColumn = (field: string, index: number, show: boolean) => {
        // @ts-ignore
        this.gridRef.current && this.gridRef.current.resetAfterColumnIndex(index, false);

        this.setState(({overwrite}) => {
            const newOverwrite = deepClone(overwrite) || {};
            set(newOverwrite, [field, 'list', 'hidden'], !show);
            if (this.props.onOverwriteChange) {
                this.props.onOverwriteChange(newOverwrite);
                return null
            } else {
                return {overwrite: newOverwrite}
            }
        })


    };
    onHideColumn: OnHideColumn = (field: string, index: number) => {
        const {fields, overwrite} = this.state;
        //check if is the last column, if is the the last you con not hidden
        const showingColumns = this.calcColumns(fields, overwrite).reduce((mem, col) => mem + (!!col ? 1 : 0), 0)
        if (showingColumns === 1) return
        this.onHideOrShowColumn(field, index, false)
    };
    onShowColumn: OnHideColumn = (field: string, index: number) => {
        this.onHideOrShowColumn(field, index, true)
    };
    onResizeStop: OnResizeStop = (field, width, index) => {
        // @ts-ignore
        this.gridRef.current && this.gridRef.current.resetAfterColumnIndex(index, false);

        this.setState(({overwrite}) => {
            const newOverwrite = deepClone(overwrite) || {};
            set(newOverwrite, [field, 'list', 'width'], width);
            if (this.props.onOverwriteChange) {
                this.props.onOverwriteChange(newOverwrite);
                return null
            } else {
                return {overwrite: newOverwrite}

            }
        })

    };
    onColumnOrderChange = ({oldIndex, newIndex}: SortEnd) => {
        // @ts-ignore
        this.gridRef.current && this.gridRef.current.resetAfterColumnIndex(oldIndex, false);
        // @ts-ignore
        this.gridRef.current && this.gridRef.current.resetAfterColumnIndex(newIndex, false);
        this.setState(({fields}) => {
            const field = fields[oldIndex];
            const parent = getParentCellComponent(field, this.props.schema);
            let newFields: any;
            if (parent) {
                //if field has a parent cell component I just put all siblings at the end to no affect the order
                //
                newFields = arrayMove(fields, oldIndex, newIndex);
                const siblings = newFields.filter((newField: any) => newField !== field && newField.match(new RegExp(`^${parent}\.`)));
                newFields = newFields.filter((newField: any) => !(newField !== field && newField.match(new RegExp(`^${parent}\.`))));
                newFields = newFields.concat(siblings)

            } else {
                newFields = arrayMove(fields, oldIndex, newIndex)
            }

            if (this.props.onFieldsChange) {
                this.props.onFieldsChange(newFields);
                return null
            } else {
                return ({fields: newFields});
            }

        })


    };
    onSortChange: OnSortChange = (field, direction) => {
        let sort = {[field]: direction};
        if (this.props.onSortChange) {
            this.props.onSortChange(sort)
        } else {
            this.setState({sort})

        }
    };

    getAllFilters = memoizeOne(
        (filters: Filters, overwrite?: Overwrite) => {
            const allFilters: Where[] = [];
            for (const field in filters) {
                const fieldDefinition = this.getColumnDefinition(field);
                if (!fieldDefinition) continue
                const filterMethod: FilterMethod = fieldDefinition.filterMethod
                const filter = filters[field];
                allFilters.push(filterMethod(filter))
            }
            return allFilters
        }
        , equalityFn);

    calcColumns = memoizeOne((fields: string[], overwrite?: Overwrite) => {
        const columns: (ColumnDef | null)[] = [];
        fields.forEach((field) => {
            const column = this.getColumnDefinition(field);
            if (column && !columns.some((c) => !!(c && c.field === column.field))) {
                columns.push(column)
            } else {
                columns.push(null)
            }
        });
        return columns
    }, equalityFn);


    render() {
        const {
            onDataChange,
            schema,
            leftButtons,
            where,
            estimatedRowHeight,
            rowHeight,
            overscanRowCount = 2,
            overLoad = 1,
            header,
            onClick,
            onMouseEnter,
            onMouseLeave,
            emptyProps,
            ...rest
        } = this.props; //todo rest props
        const {fields, width, height, filters, sort, overwrite} = this.state;
        const columns = this.calcColumns(fields, overwrite);
        const getColumnWidth = (index: number) => {
            if (!columns[index]) return 0;
            // @ts-ignore
            return columns[index].width;
        };
        this.estimatedColumnWidth = columns.reduce((mem, c) => c ? c.width + mem : mem, 0) / columns.length;
        const allFilters = this.getAllFilters(filters, overwrite);
        let whereAndFilter: { AND?: Where[] } | undefined;
        if (where && !isEmpty(where) && allFilters.length > 0) {
            whereAndFilter = {AND: [where, ...allFilters]}
        } else if (where && !isEmpty(where)) {
            whereAndFilter = where
        } else if (allFilters.length > 0) {
            whereAndFilter = {AND: allFilters}
        }
        return (
            <Find schema={schema} where={whereAndFilter} skip={0} first={this.firstLoad}
                  sort={sort}
                // @ts-ignore
                  fields={fields}
                  notifyOnNetworkStatusChange
                  {...rest}
            >
                {({
                      data = [],
                      query,
                      variables,
                      error,
                      refetch,
                      loading,
                      count,
                      client,
                      startPolling,
                      stopPolling,
                      networkStatus
                  }) => {
                    let dataCollection = data;
                    if (this.data.length === 0 && data.length > 0 && !loading) {
                        this.data = Array(count).fill(undefined)
                    }
                    if (!loading && count > this.data.length) {//when your are polling or refetching and the count change
                        this.data = [...this.data, ...Array(count - this.data.length).fill(undefined)]
                    }
                    if (dataCollection.length && !loading) {
                        // @ts-ignore
                        //this.gridRef.current &&  this.gridRef.current.resetAfterRowIndex(variables.skip)
                        this.data.splice(variables.skip, dataCollection.length, ...dataCollection);
                    }
                    !loading && onDataChange && onDataChange(this.data)
                    this.refetch = refetch;
                    this.startPolling = startPolling;
                    this.stopPolling = stopPolling;
                    this.variables = variables;
                    let tHeadHeight = this.tHead.current && this.tHead.current.offsetHeight || 95;
                    const itemData = createItemData([...this.data], columns, refetch, query, variables, onClick, onMouseEnter, onMouseLeave);
                    let headerNode: ReactNode = null;
                    if (typeof header === 'function') {
                        const Header = header;
                        headerNode =
                            <Header count={count}
                                    client={client}
                                    {...itemData}
                                    fields={fields}
                                    sort={sort}
                                    filters={filters}
                                    overwrite={overwrite}
                                    onFieldsChange={this.props.onFieldsChange}
                                    onSortChange={this.props.onSortChange}
                                    onOverwriteChange={this.props.onOverwriteChange}
                                    onFilterChange={this.props.onFilterChange}
                                    loading={loading}
                                    schema={schema}
                                    leftButtons={leftButtons}
                                    where={whereAndFilter}

                            />
                    }
                    if (typeof header === 'object' || !header) {
                        headerNode =
                            <HeaderDefault count={count}
                                           client={client}
                                           {...itemData}
                                           fields={fields}
                                           sort={sort}
                                           filters={filters}
                                           overwrite={overwrite}
                                           onFieldsChange={this.props.onFieldsChange}
                                           onSortChange={this.props.onSortChange}
                                           onOverwriteChange={this.props.onOverwriteChange}
                                           onFilterChange={this.props.onFilterChange}
                                           loading={loading}
                                           schema={schema}
                                           where={whereAndFilter}
                                           leftButtons={leftButtons}
                                // @ts-ignore
                                           {...header}/>
                    }

                    return (
                        <>
                            {headerNode}
                            <div className={'mandarina-list'} ref={this.container}
                                 style={{
                                     width,
                                     height: height + tHeadHeight
                                 }}>
                                <div ref={this.tHead} className='mandarina-list-thead'
                                     style={{width, height: tHeadHeight ? tHeadHeight : 'auto'}}>
                                    <SortableColumns
                                        useWindowAsScrollContainer
                                        tHead={this.tHead}
                                        grid={this.gridRef}
                                        empty={!error && !loading && !count}
                                        shouldCancelStart={(event: any) => {
                                            // @ts-ignore
                                            return event.target && event.target.classList && event.target.classList.contains('react-resizable-handle') || event.target.classList.contains('no-draggable') || ['INPUT', 'SELECT', 'TEXTAREA'].includes(event.target.tagName)
                                        }}
                                        axis={'x'}
                                        lockAxis={'x'}
                                        pressThreshold={10}
                                        distance={10}
                                        onSortEnd={this.onColumnOrderChange}
                                        width={this.estimatedColumnWidth * columns.length}
                                        height={tHeadHeight}>
                                        {columns.map((column, index) =>
                                            column ?
                                                <SortableColumn
                                                    height={tHeadHeight}
                                                    key={`item-${column.field}`}
                                                    index={index}
                                                    columnIndex={index}
                                                    column={column}
                                                    sort={sort}
                                                    overwrite={overwrite?.[column.field]}
                                                    filters={filters}
                                                    schema={schema}
                                                    onResizeStop={this.onResizeStop}
                                                    onSortChange={this.onSortChange}
                                                    onFilterChange={this.onFilterChange}
                                                    onHideColumn={this.onHideColumn}
                                                /> : <span key={index}></span>)}
                                    </SortableColumns>
                                </div>
                                {error && <Result status={"500"} subTitle={error.message}/>}
                                {!error && !loading && !count && <Empty style={{margin: '40px'}} {...emptyProps}/>}
                                {height !== 0 &&
                                    <Grid
                                        ref={this.gridRef}
                                        onScroll={this.onScroll}
                                        height={height}
                                        rowCount={count || 0}
                                        estimatedColumnWidth={this.estimatedColumnWidth}
                                        estimatedRowHeight={estimatedRowHeight}
                                        columnCount={columns.length}
                                        columnWidth={getColumnWidth}
                                        rowHeight={(index: number) => {
                                            if (rowHeight) {
                                                return rowHeight(index, this.data)
                                            } else {
                                                return estimatedRowHeight || estimatedRowHeightDefault
                                            }
                                        }}
                                        width={width}
                                        itemData={itemData}
                                        overscanRowCount={overscanRowCount}
                                        onItemsRendered={({
                                                              overscanRowStartIndex,
                                                              overscanRowStopIndex,
                                                              visibleRowStartIndex,
                                                              visibleRowStopIndex,

                                                          }: any) => {


                                            this.overscanRowStartIndex = overscanRowStartIndex;
                                            this.overscanRowStopIndex = overscanRowStopIndex;
                                            this.visibleRowStartIndex = visibleRowStartIndex;
                                            this.visibleRowStopIndex = visibleRowStopIndex

                                        }}
                                    >
                                        {Cell}
                                    </Grid>}
                            </div>
                        </>
                    )
                }}

            </Find>
        );
    }
}


export const DefaultCellComponent: CellComponent = React.memo(({columnIndex, rowIndex, data, field}) => {
        const children = (data[rowIndex] && get(data[rowIndex], field.split('.'))) || [];
        return <>{children.map((child, i) => <span key={i}>{child}<br/></span>)}</>
    }
    , areEqual);

const defaultLoadingElement = '...';

const Cell = React.memo(({
                             columnIndex,
                             rowIndex,
                             data: {data, columns, query, refetch, variables, onClick, onMouseEnter, onMouseLeave},
                             style
                         }: ListChildComponentProps & GridChildComponentProps & {
    data: MouseEvents & {
        variables: any,
        query: DocumentNode,
        refetch: RefetchQueriesProviderFn,
        data: any,
        columns: ColumnDef[]
    }
}) => {
    if (!columns[columnIndex]) return null;
    const field = columns[columnIndex].field;
    const CellComponent = columns[columnIndex].CellComponent || DefaultCellComponent;
    const loadingElement = columns[columnIndex].loadingElement || defaultLoadingElement;
    const props = columns[columnIndex].props || {};
    const className = field.replace('.', '-')
    const id = data && data[rowIndex] && data[rowIndex].id || ''
    return (
        <div
            className={`mandarina-list-row-${rowIndex % 2 !== 0 ? 'even' : 'odd'} mandarina-list-cell ${className} ${id}`}
            onClick={() => onClick && onClick({data, rowIndex, field, columnIndex})}
            onMouseEnter={() => onMouseEnter && onMouseEnter({data, rowIndex, field, columnIndex})}
            onMouseLeave={() => onMouseLeave && onMouseLeave({data, rowIndex, field, columnIndex})}
            style={style}>
            {!data[rowIndex] && loadingElement}
            {data[rowIndex] &&
                <CellComponent columnIndex={columnIndex} rowIndex={rowIndex} data={data} field={field}
                               refetch={refetch} variables={variables} query={query}
                               {...props}

                />}
        </div>
    )
}, areEqual);


export const getParentCellComponent = (field: string, schema: Schema) => {
    let from = 0;
    do {
        from = field.indexOf('.', from + 1);
        const parent = field.substr(0, from);
        if (parent) {
            const parentDef = schema.getPathDefinition(parent);
            const hasParentCellComponent = parentDef && parentDef.list && parentDef.list.CellComponent;
            if (hasParentCellComponent) return parent
        }
    } while (from > 0);
    return false
};
