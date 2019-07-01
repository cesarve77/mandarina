import React from "react"
import {Icon} from "antd";

const HideColumn = ({onHide}:{onHide:()=>void}) => {
    return (<Icon type="close" onClick={onHide} className={'mandarina-hide-column'} />)
}
export default HideColumn

