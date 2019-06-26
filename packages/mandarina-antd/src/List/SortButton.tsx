import React from "react"
import {Icon} from "antd";

export interface OnSortChange {
    (field: string, direction: -1 | 1): void
}


const prefixCls = 'mandarina'
const SortButton = ({sort = {}, field, onSortChange}: { onSortChange: OnSortChange, sort?: { [field: string]: 1 | -1 }, field: string }) => {
    const isAscend = sort[field] === 1
    const isDescend = sort[field] === -1
    const onClick = (defaultDirection: 1 | -1) => {
        const direction = sort[field] !== undefined ? sort[field] > 0 ? -1 : 1 : defaultDirection
        onSortChange(field, direction)
    }
    const ascend = (
        <Icon
            onClick={() => onClick(1)}
            className={`${prefixCls}-column-sorter-up ${isAscend ? 'on' : 'off'}`}
            type="caret-up"
            theme="filled"
        />
    );

    const descend = (
        <Icon
            onClick={() => onClick(-1)}
            className={`${prefixCls}-column-sorter-down ${isDescend ? 'on' : 'off'}`}
            type="caret-down"
            theme="filled"
        />
    );

    return (
        <div
            onClick={() => onClick(1)}
            title={'sort'}
            className={`${prefixCls}-column-sorter-inner ${prefixCls}-column-sorter-inner-full`}
            key="sorter"
        >
            {ascend}
            {descend}
        </div>
    )
}
export default SortButton

