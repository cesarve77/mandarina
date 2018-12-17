import {Find, Table} from 'mandarina';
import * as React from "react";
import {FieldDefinition} from 'mandarina/build/Schema/Schema'
import '../styles.css'
import {get} from "mandarina/build/Schema/utils";
import {GridOnScrollProps, VariableSizeGrid as Grid} from 'react-window';
import {Skeleton} from "antd";
import Timeout = NodeJS.Timeout;

export type onResize = (e: any, {size}: { size: { width: number } }) => void


export interface ListProps {
    table: Table
    fields?: string[]
    pageSize?: number
    first?: number
    where?: any

}

export interface FieldDefinitions {
    [field: string]: FieldDefinition
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
}

export class ListVirtualized extends React.Component<ListProps, { columns: ColumnProps[] }> {
    skip: number = 0
    data: any[] = []
    fields: string[]
    tHead: React.RefObject<HTMLDivElement>
    hasNextPage: boolean = false
    variables: { where?: any, first?: number, after?: string }
    fetchMore: (fetchMoreOptions: any) => Promise<any>

    constructor(props: ListProps) {
        super(props);
        //const definitions: Partial<FieldDefinitions> = {}
        const {table, fields} = this.props
        this.fields = fields || table.getFields()
        const columns = this.fields.map(this.getColumnDefinition)
        this.state = {columns}
        this.tHead = React.createRef()
        //this.definitions=definitions
    }

    static defaultProps = {
        first: 50,
        pageSize: 10000,
    }


    getColumnDefinition = (field: string): ColumnProps => {
        const fieldDefinition = this.props.table.schema.getPathDefinition(field)
        return {
            field,
            title: fieldDefinition.label ? fieldDefinition.label : "",
        }
    }




    getColumnWidth = (index: number) => {
        return 120
    }
    timeoutId: Timeout
    onScroll = ({scrollLeft}: GridOnScrollProps) => {
        this.timeoutId && clearTimeout(this.timeoutId)
        this.timeoutId = setTimeout(() => {

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
        const {table, first, where,} = this.props //todo rest props
        const {columns} = this.state
        const tableWidth = 700
        const tableHeight = 500
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
                        console.log('splice.splice')
                        this.data.splice(this.skip, dataCollection.length, ...dataCollection);
                    }

                    this.fetchMore = fetchMore
                    this.variables = variables


                    const tHeadHeight = this.tHead.current && this.tHead.current.offsetHeight || 0
                    return (
                        <div className={'table-grid'}
                             style={{
                                 width: tableWidth,
                                 height: tableHeight + tHeadHeight
                             }}>
                            Total:{count}
                            <div ref={this.tHead} className='mandarina-list-thead' style={{width: tableWidth}}>
                                <div className={'mandarina-list-thead-row'} style={{width: 120 * columns.length}}>
                                    {columns.map(({title, field}, columnIndex) => <div key={field}
                                                                                       className={'mandarina-list-thead-col'}
                                                                                       style={{width: this.getColumnWidth(columnIndex)}}>{title}</div>)}
                                </div>
                            </div>
                            <Grid
                                onScroll={this.onScroll}
                                height={tableHeight}
                                rowCount={count}
                                estimatedColumnWidth={120}
                                estimatedRowHeight={50}
                                columnCount={columns.length}
                                columnWidth={this.getColumnWidth}
                                rowHeight={index => rowHeight}
                                width={tableWidth}
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
                                            <div style={{...style, ...blur, overflow: 'hidden'}}>
                                                <Skeleton loading={isScrolling || loading } active={loading}>
                                                    {get(this.data[rowIndex], columns[columnIndex].field.split('.'))}
                                                </Skeleton>
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


