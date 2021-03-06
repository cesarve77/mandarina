import React, {ReactElement, ReactNode, useState} from "react"
import Query from "react-apollo/Query";
import {ApolloClient} from "apollo-client";
import {ColumnDef, ControlledListProps, Refetch} from "./ListVirtualized";
import {Schema} from "mandarina";
import Col from "antd/lib/col";
import Menu from "antd/lib/menu";
import Row from "antd/lib/row";
import {Spin} from "antd";

export interface HeaderProps extends ControlledListProps {
    count: number
    data: any
    columns: (ColumnDef | null)[]
    refetch: Refetch
    query: Query<any>
    variables: any
    fields: string[]
    loading: boolean
    schema: Schema
    where: any
    client: ApolloClient<any>


}


export type Action = (props: HeaderActionButtonProps) => void | Promise<any>
export type ContentFnc = (props: HeaderActionButtonProps) => ReactNode

export interface HeaderDefaultProps {
    leftButtons?: ReactNode
    counter?: boolean
    menuItems?: (({props: any, action?: Action, content: ReactNode | ReactElement | ContentFnc }) | string)[]
}


export interface HeaderActionButtonProps extends HeaderProps {
    setLoadingAction?: (loading: boolean) => void
}

const getOption = (optionName: string) => {
    return false
}

const HeaderDefault = ({leftButtons,counter = true, menuItems = [], count, ...props}: HeaderDefaultProps & HeaderProps) => {
    const [loadingAction, setLoadingAction] = useState(false)
    const menu = menuItems.map((item, index) => {
        if (typeof item === 'string') {
            const existingOption = getOption(item)
            if (existingOption) {
                return existingOption
            } else {
                throw new Error(`List menu option named ${item} do not exist`)
            }
        }
        const {action, content} = item
        const onClick = () => {
            setLoadingAction(true)
            const result = action && action({count, ...props})
            if (result instanceof Promise) {
                result
                    .then(() => setLoadingAction(false))
                    .catch(() => setLoadingAction(false))
            } else {
                setLoadingAction(false)
            }
        }
        // @ts-ignore
        if (React.isValidElement(content) && content.type.name !== 'SubMenu' && content.type.name !== "Menu") {
            let {disabled, ...props} = item.props || {}
            if (typeof disabled === 'function') disabled = disabled(count)
            return <Menu.Item {...props} disabled={disabled} key={index} onClick={onClick}>{content}</Menu.Item>
        }

        if (typeof content === 'function') {
            // @ts-ignore
            return content({count, setLoadingAction, ...props})
        }
        return content

    })
    return (
        <Row gutter={0} className={'mandarina-list-menu'}>
            <Col xs={5} sm={4} md={3} lg={2} xl={2} xxl={1} >
                {counter && `Total: ${count === 0 || count ? count : '...'}`}{leftButtons}
            </Col>
            {!!menu.length && <Col xs={19} sm={20} md={21} lg={22} xl={22} xxl={23}  style={{textAlign: 'right'}}>
                <Spin spinning={loadingAction} >
                    <Menu className={'mandarina-list-menu-btn'} mode={'horizontal'}>{menu}</Menu>
                </Spin>
            </Col>}
        </Row>
    )
}
export default HeaderDefault


