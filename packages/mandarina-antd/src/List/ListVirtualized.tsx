import {Find, Schema} from 'mandarina';
import React, {ReactNode} from "react";
import memoizeOne from "memoize-one"
import {isEmpty} from 'lodash'

import {
    areEqual,
    GridChildComponentProps,
    GridOnScrollProps,
    ListChildComponentProps,
    VariableSizeGrid as Grid
} from 'react-window';
import {OnFilterChange, Where} from "./ListFilter";
import {CellComponent, FilterMethod, Overwrite} from "mandarina/build/Schema/Schema";
import {Empty} from "antd";
import {merge} from 'lodash'
import {getDefaultFilterMethod} from "./ListFilters";
import {ReactComponentLike} from "prop-types";
import {get} from "mandarina/build/Schema/utils";
import {DocumentNode} from "graphql";
import {RefetchQueriesProviderFn} from "react-apollo";
import HeaderDefault, {HeaderDefaultProps} from "./HeaderDefault";
import {OnSortChange} from "./SortButton";
// import {isEqual} from 'lodash';
import {set,isEqual} from 'lodash';
import {SortableColumn, SortableColumns} from "./SortableColumns";
import {SortEnd} from "react-sortable-hoc";
import arrayMove from 'array-move'
import {deepClone} from "mandarina/build/Operations/Mutate";
import {equalityFn} from "./utils";
import Query from "react-apollo/Query";

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
}


export interface ListProps extends ControlledListProps {
    schema: Schema
    fields: string[]
    pageSize?: number
    first?: number
    where?: any
    height?: number
    width?: number
    estimatedRowHeight?: number
    overscanRowCount?: number
    overLoad?: number

    header?: ReactComponentLike | HeaderDefaultProps
    ref?: React.Ref<HTMLFormElement>

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


export interface ColumnProps {
    field: string
    title: ReactNode
    width: number
    CellComponent?: CellComponent
    props?: any
    loadingElement?: JSX.Element
    filter: boolean
    noSort: boolean
}

const estimatedColumnWidthDefault = 250;
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

const createItemData = memoizeOne((data: any, columns: (ColumnProps | null)[], refetch: Refetch, query: Query, variables: any) => ({
    data, columns, refetch, query, variables
}));


export class ListVirtualized extends React.Component<ListProps, ListState> {
    gridRef = React.createRef();
    data: any[] = [];
    fields: string[];
    tHead: React.RefObject<HTMLDivElement>;
    container: React.RefObject<HTMLDivElement>;
    hasNextPage: boolean = false;
    variables: { where?: any, first?: number, after?: string };
    refetch: Refetch;
    estimatedColumnWidth: number;
    firstLoad: number;
    overscanRowStartIndex: number = 0;
    overscanRowStopIndex: number = 0;
    visibleRowStartIndex: number = 0;
    visibleRowStopIndex: number = 0;

    constructor(props: ListProps) {
        super(props);
        const {
            estimatedRowHeight = estimatedRowHeightDefault,
            fields = props.schema.getFields(),
            filters = {},
            overwrite,
            sort,
        } = props;
        //const definitions: Partial<FieldDefinitions> = {}
        this.state = {fields, overwrite, height: this.props.height || 0, width: this.props.width || 0, filters, sort};
        this.tHead = React.createRef();
        this.container = React.createRef();
        this.firstLoad = Math.ceil((this.props.height || window.innerHeight) / estimatedRowHeight);
        this.overscanRowStopIndex = this.firstLoad

    }

    static getDerivedStateFromProps(props: ListProps, state: ListState) {
        const result: Partial<ListState> = {};
        if (props.onFieldsChange && !isEqual(props.fields, state.fields)) {
            result.fields = props.fields || props.schema.getFields()
        }
        console.log('getDerivedStateFromProps',props.overwrite)

        if ((props.onOverwriteChange) && !isEqual(props.overwrite, state.overwrite)) {
            console.log('*************************')
            result.overwrite = props.overwrite
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
        estimatedRowHeight: estimatedRowHeightDefault

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
    onResizeTimeoutId: number;
    onResize = () => {
        this.onResizeTimeoutId && window.clearTimeout(this.onResizeTimeoutId);
        this.onResizeTimeoutId = window.setTimeout(this.resize, 200)
    }


    onScrollTimeoutId: number;
    onScroll = ({scrollLeft, ...rest}: GridOnScrollProps) => {
        if (this.tHead.current) {
            this.tHead.current.scrollLeft = scrollLeft
        }
        //this.setState({row: this.visibleRowStartIndex})
        this.onScrollTimeoutId && window.clearTimeout(this.onScrollTimeoutId);
        this.onScrollTimeoutId = window.setTimeout(() => {
            //If all visible are loaded, then not refetch
            if (this.data.slice(this.visibleRowStartIndex, this.visibleRowStopIndex).every((val) => val !== undefined)) return;

            //TODO: maybe normalized the edgeds for try to do the sames queries, and get the data from the cache
            //TODO: maybe if we are in gap, then just query for that data

            const {overLoad = 0} = this.props;
            this.refetch(
                {
                    skip: this.overscanRowStartIndex,
                    first: this.overscanRowStopIndex - this.overscanRowStartIndex + 1 + overLoad,
                }
            ).catch(console.error) //todo
        }, 100)
    };

    getColumnDefinition = (field: string): ColumnProps | null => {
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

        if (definition.list.hidden) return null;
        return {
            field,
            loadingElement: definition.list.loadingElement,
            CellComponent: definition.list.CellComponent,
            title: definition.label ? definition.label : "",
            width: definition.list.width || estimatedColumnWidthDefault,
            filter: !definition.list.noFilter,
            noSort: !!(definition.isTable || definition.isArray || field.indexOf('.') > 0 || definition.list.noSort),
            props: definition.list.props || {},
        }
    };


    onFilterChange: OnFilterChange = (field, filter) => {
        console.log('onFilterChange', field, filter);
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
    onHideColumn: OnHideColumn = (field: string, index: number) => {
        // @ts-ignore
        this.gridRef.current && this.gridRef.current.resetAfterColumnIndex(index, false);

        this.setState(({overwrite}) => {
            const newOverwrite = {...overwrite} || {};
            set(newOverwrite, [field, 'list', 'hidden'], true);
            if (this.props.onOverwriteChange) {
                this.props.onOverwriteChange(newOverwrite);
                return null
            } else {
                return {overwrite: newOverwrite}
            }
        })


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
            let newFields;
            if (parent) {
                //if field has a parent cell component I just put all siblings at the end to no affect the order
                //
                newFields = arrayMove(fields, oldIndex, newIndex);
                const siblings = newFields.filter(newField => newField !== field && newField.match(new RegExp(`^${parent}\.`)));
                newFields = newFields.filter(newField => !(newField !== field && newField.match(new RegExp(`^${parent}\.`))));
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
        (filters: Filters) => {
            const allFilters: Where[] = [];
            for (const field in filters) {
                const fieldDefinition = this.props.schema.getPathDefinition(field);
                const filterMethod: FilterMethod = fieldDefinition.list.filterMethod || getDefaultFilterMethod(field, this.props.schema);
                const filter = filters[field];
                allFilters.push(filterMethod(filter))
            }
            return allFilters
        }
        , equalityFn);

    calcColumns = memoizeOne((fields: string[], overwrite?: Overwrite) => {
        const columns: (ColumnProps | null)[] = [];
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
        const {schema, where, estimatedRowHeight, overscanRowCount = 2, overLoad = 0, header} = this.props; //todo rest props

        const {fields, width, height, filters, sort, overwrite} = this.state;
        const columns = this.calcColumns(fields, overwrite);
        const getColumnWidth = (index: number) => {
            if (columns[index] === null) return 0;
            // @ts-ignore
            return columns[index].width;
        };
        this.estimatedColumnWidth = columns.reduce((mem, c) => c ? c.width + mem : mem, 0) / columns.length;
        const allFilters = this.getAllFilters(filters);
        let whereAndFilter: { AND?: Where[] } | undefined;
        if (where && !isEmpty(where) && allFilters.length > 0) {
            whereAndFilter = {AND: [where, ...allFilters]}
        } else if (where && !isEmpty(where)) {
            whereAndFilter = where
        } else if (allFilters.length > 0) {
            whereAndFilter = {AND: allFilters}
        }
        console.log('rerender');
        return (
            <Find schema={schema} where={whereAndFilter} skip={0} first={this.firstLoad + overLoad}
                  sort={sort}
                  fields={fields}
                  notifyOnNetworkStatusChange>
                {({data = [], query, variables, refetch, loading, count, client}) => {
                    console.log('list Find', data);
                    let dataCollection = data;
                    if (this.data.length === 0 && data && !loading) {
                        this.data = Array(count).fill(undefined)
                    }

                    if (dataCollection.length && !loading) {
                        this.data.splice(variables.skip, dataCollection.length, ...dataCollection);
                    }

                    this.refetch = refetch;
                    this.variables = variables;
                    const tHeadHeight = this.tHead.current && this.tHead.current.offsetHeight || 0;
                    const itemData = createItemData({...this.data}, columns, refetch, query, variables);

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
                                                    filters={filters}
                                                    schema={schema}
                                                    onResizeStop={this.onResizeStop}
                                                    onSortChange={this.onSortChange}
                                                    onFilterChange={this.onFilterChange}
                                                    onHideColumn={this.onHideColumn}
                                                /> : <span key={index}></span>)}
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

const Cell = React.memo(({columnIndex, rowIndex, data: {data, columns, query, refetch, variables}, style}: ListChildComponentProps & GridChildComponentProps & { data: { variables: any, query: DocumentNode, refetch: RefetchQueriesProviderFn, data: any, columns: ColumnProps[] } }) => {
    if (!columns[columnIndex]) return null;
    const field = columns[columnIndex].field;
    const CellComponent = columns[columnIndex].CellComponent || DefaultCellComponent;
    const loadingElement = columns[columnIndex].loadingElement || defaultLoadingElement;
    const props=columns[columnIndex].props || {};
    return (
        <div className={'mandarina-list-cell ' + field.replace('.', '-')}
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


const getParentCellComponent = (field: string, schema: Schema) => {
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