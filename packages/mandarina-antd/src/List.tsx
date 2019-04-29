import {Table as TableAntD} from 'antd';
import {Find, Schema} from 'mandarina';
import * as React from "react";
import {FieldDefinition, OverwriteDefinition} from 'mandarina/build/Schema/Schema'
import {OnFilterChange, Where} from "./ListFilter";
import {filterFields, getDecendents, getParents} from 'mandarina/build/utils'
import {ColumnProps} from 'antd/lib/table';
import isEmpty from "lodash.isempty";
import {DefaultCellComponent} from "./ListVirtualized";
import merge from 'lodash.merge'
import {FindQueryProps} from "mandarina/build/Operations/Find";
import {deepClone} from "mandarina/build/Operations/Mutate";
//import ListHeader from "./ListHeader";
export type onResize = (e: any, {size}: { size: { width: number } }) => void


export interface ListProps extends FindQueryProps {
    schema: Schema
    fields?: string[]
    omitFields?: string[]
    omitFieldsRegEx?: RegExp
    overwrite?: { [field: string]: OverwriteDefinition }
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

//
// const components = {
//     header: {
//         cell: ListHeader
//     }
// };

export class List extends React.Component<ListProps, { columns: ColumnProps<any>[] }> {
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
        const {schema, fields, omitFields, omitFieldsRegEx} = this.props
        this.fields = filterFields(schema.getFields(), fields, omitFields, omitFieldsRegEx)
        const columns = this.getColumns(this.fields)
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

        // getColumnDefinition = (field: string): ColumnProps | undefined => {
        //     const fieldDefinition = this.props.schema.getPathDefinition(field)
        //
        //     return {
        //         field,
        //         loadingElement: fieldDefinition.list.loadingElement,
        //         CellComponent: fieldDefinition.list.CellComponent,
        //         title: fieldDefinition.label ? fieldDefinition.label : "",
        //         width: fieldDefinition.list.width || estimatedColumnWidthDefault
        //     }
        // }
        const overwrite = this.props.overwrite && this.props.overwrite[parent]
        const fieldDefinition = overwrite ? merge(deepClone(this.props.schema.getPathDefinition(parent)), overwrite) : this.props.schema.getPathDefinition(parent)
        if (!fieldDefinition || isEmpty(fieldDefinition)) {
            throw new Error(`Field "${parent}" not found`)
        }
        console.log('fieldDefinition', fieldDefinition);
        if (fieldDefinition.list.hidden) return
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
            render: (value: any, row: any, index: any) => {

                const CellComponent = fieldDefinition.list.CellComponent || DefaultCellComponent
                if (!dataIndex) return null
                return <CellComponent columnIndex={0} rowIndex={0} data={[row]}
                                      field={dataIndex} {...fieldDefinition.list.props} />
            },
            onHeaderCell: (column: ColumnProps<any>) => ({
                field: parent,
                fieldDefinition,
                onFilterChange,
                //width: column.width,
                onResize: this.handleResize(index),
            })
        }
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
    buildFetchMore = (fetchMore: (fetchMoreOptions: any) => Promise<any>, endCursor?: string) => {//FetchMoreQueryOptions<{ variables: { offset: any } }, any>) => void, data: any[]) => {
        const name = this.props.schema.names.query.connection
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

    filters: { [field: string]: Where } = {}


    onFilterChange: OnFilterChange = (field, where) => {
        if (where && !isEmpty(where)) {
            this.filters[field] = where
        } else {
            delete this.filters[field]
        }
        const allFilters = Object.values(this.filters)
        this.variables.where = this.variables.where || {}
        if (this.props.where) {
            this.variables.where = {AND: [this.props.where, ...allFilters]}
        } else {
            this.variables.where = {AND: allFilters}
        }

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
        const {schema, first, where, ...findBaseProps} = this.props
        const {columns} = this.state
        return (
            <div className="list-wrapper" style={{width: '100%'}} ref={this.me}>
                <Find schema={schema} where={where} first={first} fields={this.fields}

                      onCompleted={this.onScroll}
                      {...findBaseProps}
                >
                    {({data = [], variables, refetch, loading, count, pageInfo, fetchMore, error}) => {

                        this.refetch = refetch
                        this.variables = variables
                        this.buildFetchMore(fetchMore, pageInfo && pageInfo.endCursor)
                        this.hasNextPage = !!(pageInfo && pageInfo.hasNextPage)
                        const dataSource: any[] = loading && this.hasNextPage ? [...data as any[], ...new Array(first).fill({})] : data as any[]
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
                                    //components={components}
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


