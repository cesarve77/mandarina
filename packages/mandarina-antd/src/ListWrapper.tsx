import React, {PureComponent, ReactElement} from "react"
import {ListProps, ListVirtualized, TopBottomProps} from "./ListVirtualized";
import {ReactNodeLike} from "prop-types";

class ListWrapper extends PureComponent<ListWrapperProps, ListWrapperState> {
    renderedList: ReactNodeLike

    constructor(props: ListWrapperProps) {
        super(props)
        this.renderedList = <ListVirtualized onState={this.onState} {...props}/>
    }

    onState = (props: TopBottomProps) => {
        this.setState({...props})
    }

    render() {
        const {children, ...props} = this.props
        return (
            <>
                {React.cloneElement(children, {...props, ...this.state})}
                {this.renderedList}
            </>
        )
    }
}

export default ListWrapper


export interface ListWrapperProps extends ListProps {
    children: ReactElement
}

export interface ListWrapperState extends TopBottomProps {

}