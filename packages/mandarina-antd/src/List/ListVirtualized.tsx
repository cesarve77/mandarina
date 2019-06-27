import {Find, Schema} from 'mandarina';
import React, {ReactNode} from "react";
import memoize from "memoize-one"
import isEmpty from 'lodash.isempty'
import {
    areEqual,
    GridChildComponentProps,
    GridOnScrollProps,
    ListChildComponentProps,
    VariableSizeGrid as Grid
} from 'react-window';
import ListFilter, {OnFilterChange, Where} from "./ListFilter";
import {CellComponent, FieldDefinition, FilterMethod, Overwrite} from "mandarina/build/Schema/Schema";
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
import SortButton, {OnSortChange} from "./SortButton";
import HideColumn from "./HideColumn";
import _ from 'lodash';


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
    sort?: {[field: string]: 1|-1}
    onFilterChange?: (filters: Filters) => void
    onHideColumn?: (field: string) => void
    onSortChange?: (sort: { [field: string]: 1 | -1 }) => void
    BottomList?: ReactComponentLike
    header?: ReactComponentLike | HeaderDefaultProps
    columns: Columns,

}

export type Column={[field:string]: number}
export type Columns=Column[]

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
    noSort: true
}

const estimatedColumnWidthDefault = 200
const estimatedRowHeightDefault = 60
export type Filters = { [field: string]: Where }

interface ListState {
    filters: any,
    sort?: {[field: string]: 1 |-1},
    columns: ColumnProps[],
    height: number,
    width: number
}

export type Refetch = (refetchOptions: any) => Promise<any>

export class ListVirtualized extends React.Component<ListProps, ListState> {

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
            schema,
            fields,
            omitFields,
            omitFieldsRegEx,
            filters = {},
            sort,
        } = props
        //const definitions: Partial<FieldDefinitions> = {}
        this.fields = filterFields(schema.getFields(), fields, omitFields, omitFieldsRegEx)
        const columns: ColumnProps[] = []
        this.state = {columns, height: this.props.height || 0, width: this.props.width || 0, filters,sort}

        this.fields.forEach((field) => {
            const column = this.getColumnDefinition(field)
            if (column) columns.push(column)
        })

        // const columns = this.fields.reduce((result, field) => {
        //
        // }, [] as ColumnProps[]);

        this.estimatedColumnWidth = columns.reduce((mem, {width}) => width + mem, 0) / columns.length
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
    getColumnDefinition = (field: string): ColumnProps | undefined => {
        //detect if parent has a CellComponent
        const path = field.split('.')
        path.pop()
        const parentPath = path.join('.')
        const parentDef = this.props.schema.getPathDefinition(parentPath)
        const hasParentCellComponent = parentDef && parentDef.list && parentDef.list.CellComponent
        let definition: FieldDefinition
        const overwrite = this.props.overwrite && this.props.overwrite[field]
        if (hasParentCellComponent) {
            definition = overwrite ? merge(parentDef, overwrite) : parentDef
            field = parentPath
        } else {
            const fieldDefinition = this.props.schema.getPathDefinition(field)
            definition = overwrite ? merge(fieldDefinition, overwrite) : fieldDefinition
        }
        if (definition.list.hidden) return
        if (this.state.columns.some((column: ColumnProps) => column.field === field)) return
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


    getColumnWidth = (index: number) => {
        return this.state.columns[index].width
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
    onHideColumn = (field: string) => {
        const columns = this.state.columns.filter(column => column.field !== field)
        this.setState({columns})
        if (this.props.onHideColumn) {
            this.props.onHideColumn(field)
        }

    }

    onSortChange: OnSortChange = (field, direction) => {
        let sort ={[field]:direction}
        this.setState({sort})
        if (this.props.onSortChange) {
            this.props.onSortChange(sort)
        }


    }

    getAllFilters = memoize(
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
    );

    render() {
        const {schema, where, estimatedRowHeight, overscanRowsCount = 2, overLoad = 0, header} = this.props //todo rest props
        const {columns, width, height, filters, sort} = this.state
        const allFilters = this.getAllFilters(filters)
        let whereAndFilter: { AND?: Where[] } | undefined
        if (where && !isEmpty(where) && allFilters.length > 0) {
            whereAndFilter = {AND: [where, ...allFilters]}
        } else if (where && !isEmpty(where)) {
            whereAndFilter = where
        } else if (allFilters.length > 0) {
            whereAndFilter = {AND: allFilters}
        }
        const fields = ensureId(this.fields)
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

                                <div ref={this.tHead} className='mandarina-list-thead' style={{width}}>
                                    <div className={' mandarina-list-thead-row'}
                                         style={{width: this.estimatedColumnWidth * columns.length}}>
                                        {columns.map(({title, field, filter, noSort}, columnIndex) => <div key={field}
                                                                                                           className={'mandarina-list-thead-col ant-table-column-has-sorters ant-table-column-sort ' + field.replace(/\./g, '-')}
                                                                                                           style={{width: this.getColumnWidth(columnIndex)}}>
                                            {<HideColumn onHide={() => this.onHideColumn(field)}/>}
                                            {title} {!noSort &&
                                        <SortButton onSortChange={this.onSortChange} field={field} sort={sort}/>}
                                            {filter && <ListFilter onFilterChange={this.onFilterChange}
                                                                   field={field}
                                                                   filter={filters && filters[field]}
                                                                   schema={schema}/>}
                                        </div>)}
                                    </div>
                                </div>
                                {!loading && !count && <Empty style={{margin: '40px'}}/>}
                                {height !== 0 && <Grid
                                    onScroll={this.onScroll}
                                    height={height}
                                    rowCount={count}
                                    estimatedColumnWidth={this.estimatedColumnWidth}
                                    estimatedRowHeight={estimatedRowHeight}
                                    columnCount={columns.length}
                                    columnWidth={this.getColumnWidth}
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



