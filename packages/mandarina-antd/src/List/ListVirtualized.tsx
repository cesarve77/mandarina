import {Find, Schema} from 'mandarina';
import React, {ReactNode} from "react";
import memoizeOne, {EqualityFn} from "memoize-one"
import isEmpty from 'lodash.isempty'
import {
    areEqual,
    GridChildComponentProps,
    GridOnScrollProps,
    ListChildComponentProps,
    VariableSizeGrid as Grid
} from 'react-window';
import {OnFilterChange, Where} from "./ListFilter";
import {CellComponent, FilterMethod, Overwrite} from "mandarina/build/Schema/Schema";
import {filterFields} from "mandarina/build/utils";
import {Empty} from "antd";
import merge from 'lodash.merge'
import {getDefaultFilterMethod} from "./ListFilters";
import {ensureId} from "../Forms";
import {ReactComponentLike} from "prop-types";
import {get} from "mandarina/build/Schema/utils";
import {DocumentNode} from "graphql";
import {RefetchQueriesProviderFn} from "react-apollo";
import HeaderDefault, {HeaderDefaultProps} from "./HeaderDefault";
import {OnSortChange} from "./SortButton";
// import {isEqual} from 'lodash';
import set from 'lodash.set';
import {SortableColumn, SortableColumns} from "./SortableColumns";
import arrayMove from 'array-move';
import {SortEnd} from "react-sortable-hoc";

export interface OnHideColumn {
    (field: string, index: number): void//todo variables format
}

export interface OnResizeStop {
    (field: string, size: number, index: number): void//todo variables format
}

export interface ListProps {
    schema: Schema
    fields?: string[]
    omitFields?: string[]
    omitFieldsRegEx?: RegExp
    pageSize?: number
    first?: number
    where?: any
    height?: number
    width?: number
    estimatedRowHeight?: number
    overscanRowsCount?: number
    overLoad?: number
    overwrite?: Overwrite
    filters?: Filters
    sort?: { [field: string]: 1 | -1 }
    onFilterChange?: (filters: Filters) => void
    onHideColumn?: (field: string) => void
    onSortChange?: (sort: { [field: string]: 1 | -1 }) => void
    BottomList?: ReactComponentLike
    header?: ReactComponentLike | HeaderDefaultProps

}


export const equalityFn: EqualityFn = (
    newArgs: any[],
    lastArgs: any[],
): boolean =>
    newArgs.length === lastArgs.length &&
    newArgs.every(
        (newArg: any, index: number): boolean =>
            newArg === lastArgs[index],
    );

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


export interface ColumnProps {
    field: string
    title: string
    width: number
    CellComponent?: CellComponent
    loadingElement?: JSX.Element
    filter: boolean
    noSort: boolean
}

const estimatedColumnWidthDefault = 200
const estimatedRowHeightDefault = 60
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

export class ListVirtualized extends React.Component<ListProps, ListState> {
    gridRef = React.createRef()
    data: any[] = []
    fields: string[]
    tHead: React.RefObject<HTMLDivElement>
    container: React.RefObject<HTMLDivElement>
    hasNextPage: boolean = false
    variables: { where?: any, first?: number, after?: string }
    refetch: Refetch
    estimatedColumnWidth: number
    firstLoad: number
    overscanRowStartIndex: number = 0
    overscanRowStopIndex: number = 0
    visibleRowStartIndex: number = 0
    visibleRowStopIndex: number = 0

    constructor(props: ListProps) {
        super(props);
        const {
            estimatedRowHeight = estimatedRowHeightDefault,
            fields = props.schema.getFields(),
            filters = {},
            overwrite,
            sort,
        } = props
        //const definitions: Partial<FieldDefinitions> = {}
        this.state = {fields, overwrite, height: this.props.height || 0, width: this.props.width || 0, filters, sort}
        this.tHead = React.createRef()
        this.container = React.createRef()
        this.firstLoad = Math.ceil((this.props.height || window.innerHeight) / estimatedRowHeight)
        this.overscanRowStopIndex = this.firstLoad

    }

    // static getDerivedStateFromProps(props, state) {
    //     // Any time the current user changes,
    //     // Reset any parts of state that are tied to that user.
    //     // In this simple example, that's just the email.
    //     if (!_.isEqual(props.fields ,state.fields) || _.isEqual(props.overwrite ,state.overwrite)) {
    //         return {
    //             prevPropsUserID: props.userID,
    //             email: props.defaultEmail
    //         };
    //     }
    //     return null;
    // }
    static defaultProps = {
        Header: HeaderDefault,
        estimatedRowHeight: estimatedRowHeightDefault

    }

    componentDidMount(): void {
        const {height, width} = this.props
        if (height && width) return
        this.resize()
        window.addEventListener('resize', this.onResize);


    }

    componentWillUnmount(): void {
        window.removeEventListener('resize', this.onResize);

    }

    resize = () => {
        let container = this.container.current && this.container.current.parentNode && this.container.current.parentNode.parentElement
        while (container && container.clientHeight === 0) {
            container = container.parentElement
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
    onResizeTimeoutId: number
    onResize = () => {
        this.onResizeTimeoutId && window.clearTimeout(this.onResizeTimeoutId)
        this.onResizeTimeoutId = window.setTimeout(this.resize, 200)
    }
    getColumnDefinition = (field: string): ColumnProps | null => {
        //detect if parent has a CellComponent
        const parentPath = getParentCellComponent(field, this.props.schema)
        if (parentPath) {
            field = parentPath
        }
        let definition = this.props.schema.getPathDefinition(field)
        const overwrite = this.state.overwrite && this.state.overwrite[field]
        if (overwrite) {
            definition = merge(definition, overwrite)
        }
        if (definition.list.hidden) return null
        return {
            field,
            loadingElement: definition.list.loadingElement,
            CellComponent: definition.list.CellComponent,
            title: definition.label ? definition.label : "",
            width: definition.list.width || estimatedColumnWidthDefault,
            filter: !definition.list.noFilter,
            noSort: !!(definition.isTable || definition.isArray || field.indexOf('.') > 0 || definition.list.noSort),
        }
    }


    onScrollTimeoutId: number
    onScroll = ({scrollLeft, ...rest}: GridOnScrollProps) => {
        if (this.tHead.current) {
            this.tHead.current.scrollLeft = scrollLeft
        }
        //this.setState({row: this.visibleRowStartIndex})
        this.onScrollTimeoutId && window.clearTimeout(this.onScrollTimeoutId)
        this.onScrollTimeoutId = window.setTimeout(() => {
            //If all visible are loaded, then not refetch
            if (this.data.slice(this.visibleRowStartIndex, this.visibleRowStopIndex).every((val) => val !== undefined)) return

            //TODO: maybe normalized the edgeds for try to do the sames queries, and get the data from the cache
            //TODO: maybe if we are in gap, then just query for that data

            const {overLoad = 0} = this.props
            this.refetch(
                {
                    skip: this.overscanRowStartIndex,
                    first: this.overscanRowStopIndex - this.overscanRowStartIndex + 1 + overLoad,
                }
            ).catch(console.error) //todo
        }, 100)
    }


    onFilterChange: OnFilterChange = (field, filter) => {
        let filters = this.state.filters
        if (filter && !isEmpty(filter)) {
            filters[field] = filter
        } else {
            delete filters[field]
        }

        this.setState({filters: {...filters}})
        if (this.props.onFilterChange) {
            this.props.onFilterChange(filters)
        }


    }
    onHideColumn: OnHideColumn = (field: string, index: number) => {
        this.setState(({overwrite}) => {
            const newOverwrite = {...overwrite} || {}
            set(newOverwrite, [field, 'list', 'hidden'], true)
            return {overwrite: newOverwrite}
        })
        // @ts-ignore
        this.gridRef.current && this.gridRef.current.resetAfterColumnIndex(index, true)

        if (this.props.onHideColumn) {
            this.props.onHideColumn(field)
        }

    }
    onResizeStop: OnResizeStop = (field, width, index) => {
        this.setState(({overwrite}) => {
            const newOverwrite = {...overwrite} || {}
            set(newOverwrite, [field, 'list', 'width'], width)
            return {overwrite: newOverwrite}
        })
        // @ts-ignore
        this.gridRef.current && this.gridRef.current.resetAfterColumnIndex(index, true)
    }
    onColumnOrderChange = ({oldIndex, newIndex}: SortEnd) => {
        this.setState(({fields}) => {
            return ({
                fields: arrayMove(fields, oldIndex, newIndex),
            });
        })
        // @ts-ignore
        this.gridRef.current && this.gridRef.current.resetAfterColumnIndex(oldIndex, true)
        // @ts-ignore
        this.gridRef.current && this.gridRef.current.resetAfterColumnIndex(newIndex, true)

    }
    onSortChange: OnSortChange = (field, direction) => {
        let sort = {[field]: direction}
        this.setState({sort})
        if (this.props.onSortChange) {
            this.props.onSortChange(sort)
        }


    }

    getAllFilters = memoizeOne(
        (filters: Filters) => {
            const allFilters: Where[] = []
            for (const field in filters) {
                const fieldDefinition = this.props.schema.getPathDefinition(field)
                const filterMethod: FilterMethod = fieldDefinition.list.filterMethod || getDefaultFilterMethod(field, this.props.schema)
                const filter = filters[field]
                allFilters.push(filterMethod(filter))
            }
            return allFilters
        }
        , equalityFn);

    calcFinalFields = memoizeOne((fields: string[], omitFields?: string[], omitFieldsRegEx?: RegExp) => {
        return ensureId(filterFields(this.props.schema.getFields(), fields, omitFields, omitFieldsRegEx));
    }, equalityFn)
    calcColumns = memoizeOne((fields: string[], overwrite?: Overwrite) => {
        const columns: (ColumnProps | null)[] = []
        fields.forEach((field) => {
            const column = this.getColumnDefinition(field)
            if (column && !columns.some((c) => c && c.field === column.field)) {
                columns.push(column)
            } else {
                columns.push(null)
            }
        })
        return columns
    }, equalityFn)


    render() {
        const {schema, where, estimatedRowHeight, overscanRowsCount = 2, overLoad = 0, header, omitFields, omitFieldsRegEx} = this.props //todo rest props

        const {fields: optionalFields, width, height, filters, sort, overwrite} = this.state
        const fields = this.calcFinalFields(optionalFields, omitFields, omitFieldsRegEx)
        const columns = this.calcColumns(fields, overwrite)
        const getColumnWidth = (index: number) => {
            if (columns[index] === null) return 0
            // @ts-ignore
            return columns[index].width;
        }
        this.estimatedColumnWidth = columns.reduce((mem, c) => c ? c.width + mem : 0, 0) / columns.length
        const allFilters = this.getAllFilters(filters)
        let whereAndFilter: { AND?: Where[] } | undefined
        if (where && !isEmpty(where) && allFilters.length > 0) {
            whereAndFilter = {AND: [where, ...allFilters]}
        } else if (where && !isEmpty(where)) {
            whereAndFilter = where
        } else if (allFilters.length > 0) {
            whereAndFilter = {AND: allFilters}
        }
        return (
            <Find schema={schema} where={whereAndFilter} skip={0} first={this.firstLoad + overLoad}
                  sort={sort}
                  fields={fields}
                  notifyOnNetworkStatusChange>
                {({data = [], query, variables, refetch, loading, count, client}) => {
                    let dataCollection = data
                    if (this.data.length === 0 && data && !loading) {
                        this.data = Array(count).fill(undefined)
                    }

                    if (dataCollection.length && !loading) {
                        this.data.splice(variables.skip, dataCollection.length, ...dataCollection);
                    }

                    this.refetch = refetch
                    this.variables = variables
                    const tHeadHeight = this.tHead.current && this.tHead.current.offsetHeight || 0
                    const itemData = {data: this.data, columns, refetch, query, variables,}
                    let headerNode: ReactNode = null
                    if (typeof header === 'function') {
                        const Header = header
                        headerNode =
                            <Header count={count} client={client} {...itemData} fields={fields} loading={loading}
                                    schema={schema}
                                    where={whereAndFilter}/>
                    }
                    if (typeof header === 'object') {
                        headerNode =
                            <HeaderDefault count={count} client={client} {...itemData} fields={fields} loading={loading}
                                           schema={schema}
                                           where={whereAndFilter}
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
                                        shouldCancelStart={(event) => {
                                            // @ts-ignore
                                            return event.target && event.target.classList && event.target.classList.contains('react-resizable-handle')
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
                                                    column={column}
                                                    sort={sort}
                                                    filters={filters}
                                                    schema={schema}
                                                    onResizeStop={this.onResizeStop}

                                                    onSortChange={this.onSortChange}
                                                    onFilterChange={this.onFilterChange}
                                                    onHideColumn={this.onHideColumn}
                                                /> : <></>)}
                                    </SortableColumns>
                                </div>
                                {!loading && !count && <Empty style={{margin: '40px'}}/>}
                                {height !== 0 &&
                                <Grid
                                    ref={this.gridRef}
                                    onScroll={this.onScroll}
                                    height={height}
                                    rowCount={count}
                                    estimatedColumnWidth={this.estimatedColumnWidth}
                                    estimatedRowHeight={estimatedRowHeight}
                                    columnCount={columns.length}
                                    columnWidth={getColumnWidth}
                                    rowHeight={(index: number) => estimatedRowHeight || estimatedRowHeightDefault}
                                    width={width}
                                    itemData={itemData}
                                    overscanColumnsCount={0}
                                    overscanRowsCount={overscanRowsCount}
                                    onItemsRendered={({
                                                          overscanRowStartIndex,
                                                          overscanRowStopIndex,
                                                          visibleRowStartIndex,
                                                          visibleRowStopIndex,

                                                      }: any) => {


                                        this.overscanRowStartIndex = overscanRowStartIndex
                                        this.overscanRowStopIndex = overscanRowStopIndex
                                        this.visibleRowStartIndex = visibleRowStartIndex
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


export const DefaultCellComponent: CellComponent = ({columnIndex, rowIndex, data, field}) => {
    const children = (data[rowIndex] && get(data[rowIndex], field.split('.'))) || []
    return <>{children.map((child, i) => <span key={i}>{child}<br/></span>)}</>
}
const defaultLoadingElement = '...'

const Cell = React.memo(
    ({columnIndex, rowIndex, data: {data, columns, query, refetch, variables}, style}: ListChildComponentProps & GridChildComponentProps & { data: { variables: any, query: DocumentNode, refetch: RefetchQueriesProviderFn, data: any, columns: ColumnProps[] } }) => {
        if (!columns[columnIndex]) return null
        const field = columns[columnIndex].field
        const CellComponent = columns[columnIndex].CellComponent || DefaultCellComponent
        const loadingElement = columns[columnIndex].loadingElement || defaultLoadingElement
        return (
            <div className={'mandarina-list-cell ' + field.replace('.', '-')}
                 style={style}>
                {!data[rowIndex] && loadingElement}
                {data[rowIndex] &&
                <CellComponent columnIndex={columnIndex} rowIndex={rowIndex} data={data} field={field}
                               refetch={refetch} variables={variables} query={query}/>}
            </div>
        )
    }
    , areEqual);


const getParentCellComponent = (field: string, schema: Schema) => {
    let from = 0
    do {
        from = field.indexOf('.', from + 1)
        const parent = field.substr(0, from)
        if (parent) {
            const parentDef = schema.getPathDefinition(parent)
            const hasParentCellComponent = parentDef && parentDef.list && parentDef.list.CellComponent
            if (hasParentCellComponent) return parent
        }
    } while (from > 0)
    return false
}