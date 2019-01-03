import {Find, Schema} from 'mandarina';
import * as React from "react";
import '../styles.css'
import {get} from "mandarina/build/Schema/utils";
import {GridOnScrollProps, VariableSizeGrid as Grid} from 'react-window';
import ListFilter from "./ListFilter";


export interface ListProps {
    schema: Schema
    fields?: string[]
    pageSize?: number
    first?: number
    where?: any
    height?: number
    width?: number
    estimatedRowHeight?: number
    paginatorFactor?: number
    overscanRowsCount?: number
    overscanColumnsCount?: number
    overLoad?: number
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

interface ColumnProps {
    field: string
    title: string
    width: number
}

const estimatedColumnWidthDefault = 200
const estimatedRowHeightDefault = 60

export class ListVirtualized extends React.Component<ListProps, {  columns: ColumnProps[], height: number, width: number }> {

    data: any[] = []
    fields: string[]
    tHead: React.RefObject<HTMLDivElement>
    container: React.RefObject<HTMLDivElement>
    hasNextPage: boolean = false
    variables: { where?: any, first?: number, after?: string }
    refetch: (refetchOptions: any) => Promise<any>
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
        } = props
        //const definitions: Partial<FieldDefinitions> = {}
        this.fields = fields || schema.getFields()
        const columns = this.fields.map(this.getColumnDefinition)
        this.estimatedColumnWidth = columns.reduce((mem, {width}) => width + mem, 0) / columns.length

        this.state = { columns, height: 0, width: 0}
        this.tHead = React.createRef()
        this.container = React.createRef()
        this.firstLoad = Math.ceil((this.props.height || window.innerHeight) / estimatedRowHeight)
        this.overscanRowStopIndex = this.firstLoad
        //this.definitions=definitions
    }

    defaultProps = {
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
    getColumnDefinition = (field: string): ColumnProps => {
        const fieldDefinition = this.props.schema.getPathDefinition(field)
        return {
            field,
            title: fieldDefinition.label ? fieldDefinition.label : "",
            width: fieldDefinition.list.width || estimatedColumnWidthDefault
        }
    }


    getColumnWidth = (index: number) => {
        return this.state.columns[index].width
    }
    onScrollTimeoutId: number
    onScroll = ({scrollLeft}: GridOnScrollProps) => {
        if (this.tHead.current) {
            this.tHead.current.scrollLeft = scrollLeft
        }
        //this.setState({row: this.visibleRowStartIndex})
        this.onScrollTimeoutId && window.clearTimeout(this.onScrollTimeoutId)
        this.onScrollTimeoutId = window.setTimeout(() => {
            //If all visible are loaded, then not refetch
            console.log('scroll stop')
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
            console.log('scroll refetch')
        }, 100)

    }


    shouldComponentUpdate(nextProps: Readonly<ListProps>, nextState: Readonly<{ columns: ColumnProps[]; height: number; width: number }>, nextContext: any): boolean {
        return true
    }

    render() {
        const {schema, where, estimatedRowHeight, overscanRowsCount = 2,overscanColumnsCount=2, overLoad = 0} = this.props //todo rest props
        const {columns, width, height} = this.state


        return (
            <Find schema={schema} where={where} skip={0} first={this.firstLoad + overLoad} fields={this.fields}
                  notifyOnNetworkStatusChange>
                {({data = [], variables, refetch, loading, count, onFiltersChange}) => {
                    const dataCollection = data as any[]
                    if (this.data.length === 0 && data && !loading) {
                        this.data = Array(count).fill(undefined)
                    }
                    if (dataCollection.length && !loading) {
                        this.data.splice(variables.skip, dataCollection.length, ...dataCollection);
                    }

                    this.refetch = refetch
                    this.variables = variables


                    const tHeadHeight = this.tHead.current && this.tHead.current.offsetHeight || 0
                    return (
                        <div className={'mandarina-list'} ref={this.container}
                             style={{
                                 width,
                                 height: height + tHeadHeight
                             }}>
                             Total:{count}
                            <div ref={this.tHead} className='mandarina-list-thead' style={{width}}>
                                <div className={'mandarina-list-thead-row'}
                                     style={{width: this.estimatedColumnWidth * columns.length}}>
                                    {columns.map(({title, field}, columnIndex) => <div key={field}
                                                                                       className={'mandarina-list-thead-col'}
                                                                                       style={{width: this.getColumnWidth(columnIndex)}}>
                                        {title}
                                        <ListFilter variables={variables} onFilterChange={onFiltersChange} field={field} fieldDefinition={schema.getPathDefinition(field)}/>
                                    </div>)}
                                </div>
                            </div>
                            <Grid
                                onScroll={this.onScroll}
                                height={height}
                                rowCount={count}
                                estimatedColumnWidth={this.estimatedColumnWidth}
                                estimatedRowHeight={estimatedRowHeight}
                                columnCount={columns.length}
                                columnWidth={this.getColumnWidth}
                                rowHeight={index => estimatedRowHeight || estimatedRowHeightDefault}
                                width={width}
                                overscanColumnsCount={overscanColumnsCount}
                                overscanRowsCount={overscanRowsCount}
                                onItemsRendered={({
                                                      overscanRowStartIndex,
                                                      overscanRowStopIndex,
                                                      visibleRowStartIndex,
                                                      visibleRowStopIndex,

                                                  }) => {



                                    this.overscanRowStartIndex = overscanRowStartIndex
                                    this.overscanRowStopIndex = overscanRowStopIndex
                                    this.visibleRowStartIndex = visibleRowStartIndex
                                    this.visibleRowStopIndex = visibleRowStopIndex

                                }}
                            >
                                {
                                    ({columnIndex, rowIndex, style, ...props}) => {
                                        return (
                                            <div className={'mandarina-list-cell'}
                                                 style={{...style, ...blur, overflow: 'hidden'}}>
                                                {!this.data[rowIndex] && '...'}
                                                {this.data[rowIndex] && get(this.data[rowIndex], columns[columnIndex].field.split('.'))}
                                            </div>
                                        )
                                    }}

                            </Grid>
                        </div>
                    )
                }}

            </Find>
        );
    }
}



