import {Find, Table} from 'mandarina';
import * as React from "react";
import '../styles.css'
import {get} from "mandarina/build/Schema/utils";
import {GridOnScrollProps, VariableSizeGrid as Grid} from 'react-window';


export interface ListProps {
    table: Table
    fields?: string[]
    pageSize?: number
    first?: number
    where?: any
    height?: number
    width?: number
    estimatedRowHeight?: number

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
const estimatedColumnWidthDefault=120
export class ListVirtualized extends React.Component<ListProps, { columns: ColumnProps[], height: number, width: number }> {
    skip: number = 0
    data: any[] = []
    fields: string[]
    tHead: React.RefObject<HTMLDivElement>
    container: React.RefObject<HTMLDivElement>
    hasNextPage: boolean = false
    variables: { where?: any, first?: number, after?: string }
    fetchMore: (fetchMoreOptions: any) => Promise<any>
    estimatedColumnWidth: number


    constructor({
                    estimatedRowHeight = estimatedColumnWidthDefault,
                    table,
                    fields,
                    ...rest
                }: ListProps) {
        super({estimatedRowHeight, table, fields, ...rest});
        //const definitions: Partial<FieldDefinitions> = {}
        this.fields = fields || table.getFields()
        const columns = this.fields.map(this.getColumnDefinition)
        this.estimatedColumnWidth = columns.reduce((mem, {width}) => width + mem, 0) / columns.length

        this.state = {columns, height: 0, width: 0}
        this.tHead = React.createRef()
        this.container = React.createRef()
        //this.definitions=definitions
    }

    static defaultProps = {
        first: 50,
        pageSize: 10000,
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
        const fieldDefinition = this.props.table.schema.getPathDefinition(field)
        return {
            field,
            title: fieldDefinition.label ? fieldDefinition.label : "",
            width: fieldDefinition.list.width || estimatedColumnWidthDefault
        }
    }


    getColumnWidth = (index: number) => {
        return 120
    }
    onScrollTimeoutId: number
    onScroll = ({scrollLeft}: GridOnScrollProps) => {
        this.onScrollTimeoutId && window.clearTimeout(this.onScrollTimeoutId)
        this.onScrollTimeoutId = window.setTimeout(() => {

            this.fetchMore(
                {
                    variables: {
                        skip: this.skip,
                        first: 50,
                    },
                    updateQuery: (previousResult: ConnectionResult, {fetchMoreResult}: { fetchMoreResult: ConnectionResult }) => {
                        return fetchMoreResult
                    }
                }
            ).catch((console.error)) //todo

        }, 75)
        if (this.tHead.current) {
            this.tHead.current.scrollLeft = scrollLeft
        }
    }

    data0: any[] = []

    render() {
        const {table, first, where, estimatedRowHeight} = this.props //todo rest props
        const {columns, width, height} = this.state
        const rowHeight = 35
        return (
            <Find table={table} where={where} first={first} fields={this.fields}>
                {({data = [], variables, refetch, loading, count, pageInfo, fetchMore, error, onFiltersChange}) => {
                    const dataCollection = data as any[]
                    if (this.data.length === 0 && data && !loading) {
                        this.data = Array(count).fill({})
                        this.data0 = columns.map(({field}) => get(this.data[0], field.split('.')))
                    }
                    if (dataCollection.length && !loading) {
                        console.log('splice.splice', this.state)
                        this.data.splice(this.skip, dataCollection.length, ...dataCollection);
                    }

                    this.fetchMore = fetchMore
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
                                <div className={'mandarina-list-thead-row'} style={{width: this.estimatedColumnWidth * columns.length}}>
                                    {columns.map(({title, field}, columnIndex) => <div key={field}
                                                                                       className={'mandarina-list-thead-col'}
                                                                                       style={{width: this.getColumnWidth(columnIndex)}}>{title}</div>)}
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
                                rowHeight={index => rowHeight}
                                width={width}
                                overscanCount={10}
                                useIsScrolling
                                onItemsRendered={({
                                                      overscanRowStartIndex,
                                                  }) => {
                                    this.skip = overscanRowStartIndex
                                }}
                            >
                                {
                                    ({columnIndex, rowIndex, style, ...props}) => {
                                        // @ts-ignore
                                        const isScrolling = props.isScrolling
                                        return (
                                            <div className={'mandarina-list-cell'}
                                                 style={{...style, ...blur, overflow: 'hidden'}}>
                                                {(isScrolling || loading) && '...'}
                                                {(!isScrolling && !loading) && get(this.data[rowIndex], columns[columnIndex].field.split('.'))}
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


