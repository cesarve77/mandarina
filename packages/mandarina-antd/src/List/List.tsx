import TableAntD, {ColumnProps} from 'antd/lib/table';
import {Find, Schema} from 'mandarina';
import * as React from "react";
import {ComponentType, ReactNode} from "react";
import {FieldDefinition, Overwrite} from 'mandarina/build/Schema/Schema'
import {Where} from "./ListFilter";
import {merge} from "lodash";
import {DefaultCellComponent, getParentCellComponent} from "./ListVirtualized";
import {FindProps} from "mandarina/build/Operations/Find";
import {deepClone} from "mandarina/build/Operations/Mutate";
import {Result} from "antd";
import {ReactComponentLike} from "prop-types";
//import ListHeader from "./ListHeader";
export type onResize = (e: any, {size}: { size: { width: number } }) => void


export interface ListProps extends FindProps {
    schema: Schema
    fields: string[]
    overwrite?: Overwrite
    pageSize?: number
    first?: number
    where?: any
    ref?: React.Ref<List>
    Dimmer?: ComponentType
    header?: ReactComponentLike

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
    me: React.RefObject<HTMLDivElement>
    fetchMore: () => void
    refetch: any //todo
    hasNextPage: boolean = false
    refetching: boolean = false
    variables: { where?: any, first?: number, after?: string }
    data?: any[]
    loading: boolean

    constructor(props: ListProps) {
        super(props);
        //const definitions: Partial<FieldDefinitions> = {}
        const {fields} = this.props
        const columns = this.getColumns(fields)
        this.state = {columns}
        this.me = React.createRef();
        this.loading=true
        this.data=[]
        //this.definitions=definitions

    }


    static defaultProps = {
        first: 10000,
        pageSize: 10000,
    }

    getColumns(fields: string[], path = "") {
        const columns: ColumnProps<any>[] = []
        fields.forEach((field, index) => {
            const column = this.getColumnDefinition(field, index)
            if (column && !columns.some((c) => !!(c && c.dataIndex === column.dataIndex))) {
                columns.push(column)
            }
        })
        return columns

    }

    getColumnDefinition = (field: string, index: number): ColumnProps<any> | undefined => {
        const parentPath = getParentCellComponent(field, this.props.schema);
        if (parentPath) {
            field = parentPath
        }
        const overwrite = this.props.overwrite && this.props.overwrite[field];

        let definition: FieldDefinition
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

        if (definition.list.hidden) return

        return {
            // fixed: index===0 ? 'left' :undefined,
            dataIndex: field,
            key: field,
            width: definition.list.width,
            title: definition.label ? definition.label : "",
            render: (value: any, row: any, index: any) => {
                const CellComponent = definition.list.CellComponent || DefaultCellComponent
                return <CellComponent columnIndex={0} rowIndex={0} data={[row]}
                                      field={field} {...definition.list.props} />
            },
                onHeaderCell: (column: ColumnProps<any>) => ({
                field: field,
                fieldDefinition: definition,
                // onFilterChange: this.onFilterChange,
                width: column.width,
                onResize: this.handleResize(index),
            })
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


    // onFilterChange: OnFilterChange = (field, where) => {
    //     if (where && !isEmpty(where)) {
    //         this.filters[field] = where
    //     } else {
    //         delete this.filters[field]
    //     }
    //     const allFilters = Object.values(this.filters)
    //     this.variables.where = this.variables.where || {}
    //     if (this.props.where) {
    //         this.variables.where = {AND: [this.props.where, ...allFilters]}
    //     } else {
    //         this.variables.where = {AND: allFilters}
    //     }
    //
    //     this.refetch(this.variables)
    // }


    handleResize = (index: number): onResize => (e, {size}) => {
        this.setState(({columns}) => {
            const nextColumns = [...columns];
            nextColumns[index] = {
                ...nextColumns[index],
                width: size.width,
            };``
            return {columns: nextColumns};
        });
    };
    firstLoad: boolean = true

    render() {
        const {schema, first, fields, header, where, Dimmer, ...findBaseProps} = this.props
        const {columns} = this.state
        return (
            <div className="list-wrapper" style={{width: '100%'}} ref={this.me}>

                <Find schema={schema} where={where} first={first} fields={fields}
                      {...findBaseProps}
                >
                    {({data = [], variables, refetch, loading, count, pageInfo, fetchMore, error}) => {
                        this.loading=loading
                        if (error) return <Result status={"500"} subTitle={error.message}/>
                        this.refetch = refetch
                        this.variables = variables
                        this.buildFetchMore(fetchMore, pageInfo && pageInfo.endCursor)
                        this.hasNextPage = !!(pageInfo && pageInfo.hasNextPage)
                        const dataSource: any[] = loading && this.hasNextPage ? [...data as any[], ...new Array(first).fill({})] : data as any[]
                        if (!loading) this.firstLoad = false
                        //this.lastHeight = this.me && this.me.current && this.me.current.offsetHeight || 0// && this.me.current && this.me.current.clientHeight || document.body.clientHeight + scrollTop + 200
                        let headerNode: ReactNode = null;
                        if (typeof header === 'function') {
                            const Header = header;
                            headerNode = <Header data={dataSource}  count={count}/>
                        }
                        if (typeof header === 'object' || !header) {
                            headerNode = <HeaderDefault data={dataSource} count={count} {...header}  />
                        }
                        this.data=dataSource
                        return (
                            <div>
                                {headerNode}
                                <div style={{position: 'relative'}}>
                                    {Dimmer && <Dimmer/>}
                                    <TableAntD
                                        scroll={{x: '100%'}}
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
                            </div>
                        )
                    }}

                </Find>
            </div>
        );
    }
}


const HeaderDefault = ({count,title=' total'}: { count: number, title?:string }) => <div style={{textAlign: "right"}}>{count} {title}</div>
