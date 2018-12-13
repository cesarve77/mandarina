import * as React from "react";
import {Find, Table} from 'mandarina';
import {FieldDefinition} from 'mandarina/build/Schema/Schema'
import {AgGridReact} from 'ag-grid-react';
import {IDatasource} from 'ag-grid-community/main';

import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';


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

interface ColumnProps {
    headerName: string
    field: string
}

export class List extends React.Component <ListProps, { columns: ColumnProps[] }> {


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
        const columns = this.fields.map(this.getColumnDefinition)
        this.state = {columns}
        this.me = React.createRef();

        //this.definitions=definitions
    }

    static defaultProps = {
        first: 10,
        pageSize: 10000,
    }


    getColumnDefinition = (field: string): ColumnProps => {
        const fieldDefinition = this.props.table.schema.getPathDefinition(field)
        return {
            field,
            headerName: fieldDefinition.label ? fieldDefinition.label : "",
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
    onGridReady = (params:{api:A}) => {
        this.api = params.api;
        this.columnApi = params.columnApi;
    }
    render() {
        const {table, first, where, ...props} = this.props
        const {columns} = this.state
        return (
            <div id="list-wrapper" style={{width: 'max-content', height: '100%'}} ref={this.me}>
                <Find table={table} where={where} first={first} fields={this.fields} {...props}>
                    {({data = [], variables, refetch, loading, count, pageInfo, fetchMore, error, onFiltersChange}) => {
                        console.log('rendering table')

                        this.refetch = refetch
                        this.variables = variables
                        this.buildFetchMore(fetchMore, pageInfo && pageInfo.endCursor)
                        this.hasNextPage = pageInfo && pageInfo.hasNextPage
                        const dataSource: IDatasource = {
                            getRows: ({startRow, endRow, sortModel, filterModel, context, successCallback, failCallback}) => {
                                console.log({
                                    startRow,
                                    endRow,
                                    sortModel,
                                    filterModel,
                                    context,
                                    successCallback,
                                    failCallback
                                })
                                const name = this.props.table.names.query.connection

                                if (startRow === 0) {
                                    return successCallback(data as any[], (data as any[]).length)
                                }
                                fetchMore(
                                    {
                                        variables: {
                                            after: pageInfo && pageInfo.endCursor
                                        },
                                        updateQuery: (previousResult: ConnectionResult, {fetchMoreResult}: { fetchMoreResult: ConnectionResult }) => {
                                            this.refetching = false
                                            const newEdges = fetchMoreResult[name].edges;
                                            return successCallback(newEdges, startRow + newEdges.length)
                                        }
                                    }
                                ).catch((console.error)) //todo
                            }
                        }
                        // if (!loading) this.firstLoad = false
                        //this.lastHeight = this.me && this.me.current && this.me.current.offsetHeight || 0// && this.me.current && this.me.current.clientHeight || document.body.clientHeight + scrollTop + 200
                        return (


                            <div
                                className="ag-theme-balham"
                                style={{
                                    height: '500px',
                                    width: '600px'
                                }}
                            >

                                Total {count}
                                <AgGridReact
                                    onGridReady={this.onGridReady}

                                    gridOptions={{
                                        columnDefs: columns
                                    }}>
                                </AgGridReact>
                            </div>
                        )
                    }}

                </Find>
            </div>
        );
    }
}


