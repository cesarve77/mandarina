import {Table as TableAntD} from 'antd';
import {Find, Table} from 'mandarina';
import * as React from "react";
import {FieldDefinition} from 'mandarina/build/Schema/Schema'
import ListHeader from "./ListHeader";
import {onFilterChange} from "./ListFilter";
import '../styles.css'
import {getDecendents, getParents} from "./utils";
import {ColumnProps} from 'antd/lib/table';

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

export class List extends React.Component<ListProps, { columns: ColumnProps<any>[] }> {

    components = {
        header: {
            cell: ListHeader
        },
    };
    fields: string[]
    me: React.RefObject<HTMLDivElement>
    fetchMore: () => void
    refetch: any //todo
    hasNextPage: boolean = false
    refetching: boolean = false
    variables: { where?: any, first?: number, after?: string }

    constructor(props: ListProps) {
        super(props);
        //const definitions: Partial<FieldDefinitions> = {}
        const {table, fields} = this.props
        this.fields = fields || table.getFields()
        const columns = this.getColumns(this.fields)
        console.log('columns',columns)
        this.state = {columns}
        this.me = React.createRef();

        //this.definitions=definitions
    }

    static defaultProps = {
        first: 10,
        pageSize: 10000,
    }

    getColumns(fields: string[], path = "") {
        const columns: ColumnProps<any>[] = []
        const parents = getParents(fields)
        parents.forEach((parent, index) => {

            const decedents = getDecendents(fields, parent)
            const field = path ? `${path}.${parent}` : parent
            const column = this.getColumnDefinition(field, decedents, index)
            if (column) {
                columns.push(column)
                //definitions[field]=definition
            }
        })
        return columns

    }

    getColumnDefinition = (parent: string, decedents: string[], index: number): ColumnProps<any> | undefined => {
        const fieldDefinition = this.props.table.schema.getPathDefinition(parent)
        const defaultWidth = window.innerWidth / this.fields.length
        let width: number | undefined
        if (index !== this.fields.length - 1) {
            width = defaultWidth
        }

        const children = decedents.length ? this.getColumns(decedents, parent) : undefined
        const dataIndex = !decedents.length ? parent : undefined
        const onFilterChange = !decedents.length ? this.onFilterChange : undefined
        return {
            dataIndex,
            key: parent,
            width,
            children,
            title: fieldDefinition.label ? fieldDefinition.label : "",
            onHeaderCell: (column: ColumnProps<any>) => ({
                field: parent,
                fieldDefinition,
                onFilterChange,
                width: column.width,
                onResize: this.handleResize(index),
            })
        }
    }

    componentWillUnmount() {
        window.removeEventListener("scroll", this.onScroll);
    }

    componentDidMount() {
        console.log('list componentDidMount')
        window.addEventListener("scroll", this.onScroll);
    }

    onScroll = () => {
        if (this.refetching || !this.hasNextPage) return // || this.lastHeight === clientHeight) return
        const rect = this.me.current && this.me.current.getBoundingClientRect()
        if (!rect) return
        const documentElement = document.documentElement && document.documentElement.clientHeight
        const isAlmostShowed = rect.bottom < (window.innerHeight || documentElement || 6000)
        if (isAlmostShowed) {
            this.fetchMore()
        }
    }
    buildFetchMore = (fetchMore: (fetchMoreOptions: any) => Promise<any>, endCursor: string) => {//FetchMoreQueryOptions<{ variables: { offset: any } }, any>) => void, data: any[]) => {
        const name = this.props.table.names.query.connection
        this.fetchMore = () => {
            this.refetching = true
            fetchMore(
                {
                    variables: {
                        after: endCursor
                    },
                    updateQuery: (previousResult: ConnectionResult, {fetchMoreResult}: { fetchMoreResult: ConnectionResult }) => {
                        this.refetching = false
                        const newEdges = fetchMoreResult[name].edges;
                        const pageInfo = fetchMoreResult[name].pageInfo;
                        const aggregate = fetchMoreResult[name].aggregate;
                        return newEdges.length
                            ? {
                                // Put the new comments at the end of the list and update `pageInfo`
                                // so we have the new `endCursor` and `hasNextPage` values
                                [name]: {
                                    __typename: previousResult[name].__typename,
                                    edges: [...previousResult[name].edges, ...newEdges],
                                    pageInfo,
                                    aggregate
                                }
                            }
                            : previousResult;
                    }
                }
            ).catch((console.error)) //todo
        }
    }
    onFilterChange: onFilterChange = (variablesMutator) => {
        this.firstLoad = true
        variablesMutator(this.variables)
        this.refetch(this.variables)
    }


    handleResize = (index: number): onResize => (e, {size}) => {
        this.setState(({columns}) => {
            const nextColumns = [...columns];
            nextColumns[index] = {
                ...nextColumns[index],
                width: size.width,
            };
            return {columns: nextColumns};
        });
    };
    firstLoad: boolean = true

    render() {

        const {table, first, where, ...props} = this.props
        console.log('where', where)
        const {columns} = this.state
        return (
            <div id="list-wrapper" style={{width: 'max-content', height: '100%'}} ref={this.me}>
                <Find table={table} where={where} first={first} fields={this.fields}
                      onCompleted={this.onScroll} {...props}>
                    {({data = [], variables, refetch, loading, count, pageInfo, fetchMore, error, onFiltersChange}) => {

                        this.refetch = refetch
                        this.variables = variables
                        this.buildFetchMore(fetchMore, pageInfo && pageInfo.endCursor)
                        this.hasNextPage = pageInfo && pageInfo.hasNextPage
                        const muck = new Array(first).fill({})
                        const dataSource: any[] = loading && this.hasNextPage ? [...data as any[], ...muck] : data as any[]
                        if (!loading) this.firstLoad = false
                        //this.lastHeight = this.me && this.me.current && this.me.current.offsetHeight || 0// && this.me.current && this.me.current.clientHeight || document.body.clientHeight + scrollTop + 200
                        return (

                            <div style={{textAlign: 'right'}}>

                                Total {count}
                                <TableAntD
                                    pagination={{
                                        pageSize: 5000, //todo
                                        total: count,
                                        simple: true,
                                        hideOnSinglePage: true,
                                    }}
                                    rowKey={(record: any) => record.id}

                                    bordered
                                    components={this.components}
                                    columns={columns}
                                    loading={this.firstLoad}
                                    dataSource={dataSource}
                                />
                            </div>
                        )
                    }}

                </Find>
            </div>
        );
    }
}
