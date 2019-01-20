import {FieldDefinition, FilterComponent, Native, Types} from "mandarina/build/Schema/Schema";
import {Where} from "./ListFilter";
import set from "lodash.set";
import get from "lodash.get";
import isEmpty from "lodash.isempty";
import unset from "lodash.unset";
import connectField from 'uniforms/connectField'
import {DatePicker, Dropdown, Input, InputNumber, Menu, Switch} from "antd";
import React, {useState} from "react";
import {Integer, Schema} from "mandarina";
import {forceType} from "mandarina/build/Schema/utils";

const AllOperators: { [subfix: string]: { description: string, symbol: string } } = {
    "": {description: "equals", symbol: "="},
    "_not": {description: "not equals", symbol: "!="},
    "_contains": {description: "contains substring", symbol: "~"},
    "_not_contains": {description: "does not contain substring", symbol: "!~"},
    "_starts_with": {description: "starts with", symbol: "^"},
    "_not_starts_with": {description: "not starts with", symbol: "!^"},
    "_ends_with": {description: "ends with", symbol: "$"},
    "_not_ends_with": {description: "not ends with", symbol: "!$"},
    "_lt": {description: "less than", symbol: "<"},
    "_lte": {description: "less then or equals", symbol: "<="},
    "_gt": {description: "greater than", symbol: ">"},
    "_gte": {description: "greater than or equals", symbol: ">="},
    "_contains_every": {description: "contains all ", symbol: "[~]"},
    "_contains_some": {description: "contains at least 1", symbol: "~"},
}

export const getDefaultFilterMethod = (field: string, schema: Schema): Where => {
    const fieldDefinition = schema.getPathDefinition(field)
    const path = field.split('.')
    const originalPath = field.split('.')
    let len = path.length
    let last = len - 1
    //filling all parents fields. it must be a table (Relation field)
    for (let i = 0; i < len; i++) {
        const field = originalPath.slice(0, i + 1).join('.')
        const fieldDefinition = schema.getPathDefinition(field)
        if (Array.isArray(fieldDefinition.type)) {
            if (typeof fieldDefinition.type[0] === 'string') {
                path[i] += '_some'
            } else {
                // if the past parent es array, must be a array of scalars
                path[last] += '_contains_some'
                path.push(path[last])
                last++
            }

        }

    }

    return (filter: { operator: string, filter: any }) => {
        //todo forzar el tipo de verdad para que si escriben un string donde va un numero no mande el query
        console.log('filter method', filter)
        const search = filter.filter
        const original = path[last]
        if (search === 0 || search) {
            const where = {}
            path[last] += filter.operator
            const value = forceType(search, fieldDefinition.type as Native)

            if (filter.operator === "" && fieldDefinition.type === Date) {
                path[last] += "_gte"
                value.startOf('day')
                set(where, path, value.toDate())
                path[last] = original
                path[last] += "_lte"
                value.endOf('day')
                set(where, path, value.toDate())
            } else {
                set(where, path, value)
            }

            path[last] = original
            console.log('where,', where)
            return where
        } else {
            console.log('NOOOO search,', search)
            return
        }
    }
}
const getAvailableOperator = (type: Types): string[] => {
    switch (true) {
        case (type === String):
            return ["_contains", "", "_not", "_not_contains", "_starts_with", "_not_starts_with", "_ends_with", "_not_ends_with"]
        case  (type === Integer || type === Date || type === Number):
            return ["", "_not", "_lt", "_lte", "_gt", "_gte"]

        case  (type === Array):
            const subType = type[0]
            return getAvailableOperator(subType)
        default:
            return [""]
    }
}
export const getDefaultComponent = (field: string, fieldDefinition: FieldDefinition): FilterComponent => {
    const availableOperators = getAvailableOperator(fieldDefinition.type)
    const Filter = ({
                        value = {
                            operator: availableOperators[0],
                            filter: undefined
                        }, onChange
                    }: FilterPros) => {
        if (!value || (!value.operator && value.operator !== "")) {
            value = {operator: availableOperators[0], filter: undefined}
        }
        const [selected, setSelected] = useState(value.operator)
        const options = (
            <Menu onClick={({key: operator}) => {
                if (operator === "_") {
                    operator = ""
                }
                setSelected(operator)
                if (value.filter) {
                    onChange(value)
                }
            }}>
                {availableOperators.map(operator =>
                    <Menu.Item
                        key={operator || "_"}> {AllOperators[operator].symbol} {' '} {AllOperators[operator].description}</Menu.Item>)}
            </Menu>
        );
        const operator = (availableOperators.length > 1) ? (
            <Dropdown
                overlay={options}
            >
                <a className="ant-dropdown-link">
                    {AllOperators[selected].symbol}
                </a>
            </Dropdown>
        ) : undefined
        let type = fieldDefinition.type
        if (Array.isArray(type)) {
            type = type[0]
        }

        switch (true) {

            case  (type === Integer ):
                return (
                    <span className="ant-input-wrapper ant-input-group">
                <span className="ant-input-group-addon">
                  {operator}
                </span>
               <InputNumber value={value.filter}
                            style={{width: '100%'}}
                            onChange={(value) => onChange({operator: selected, filter: value})}/>
            </span>
                )
            case  (type === Number):
                return (
                    <span className="ant-input-wrapper ant-input-group">
                <span className="ant-input-group-addon">
                  {operator}
                </span>
               <InputNumber value={value.filter}
                            style={{width: '100%'}}
                            onChange={(value) => onChange({operator: selected, filter: value})}/>
            </span>
                )
            case  (type === Date):
                return (
                    <span className="ant-input-wrapper ant-input-group date-picker">
                <span className="ant-input-group-addon">
                  {operator}
                </span>
                      <DatePicker value={value.filter}
                                  onChange={(date) => onChange({operator: selected, filter: date})}/>
            </span>
                )
            case  (type === Boolean):
                return (
                    <Switch checked={!!value.filter}
                            onChange={(value) => onChange({operator: selected, filter: !!value})}/>
                )
            default:
                return <Input addonBefore={operator} value={value.filter} style={{width: '100%'}}
                              onChange={(e) => onChange({operator: selected, filter: e.target.value})}/>
        }
    }
    return connectField(Filter, {
        includeInChain: true,
        ensureValue: true,
        initialValue: true,
    })
}


export const unsetDeep = (obj: object, path: string[]) => {
    unset(obj, path)
    path.pop()
    while (path.length) {
        const value = get(obj, path)
        if (value && isEmpty(value)) unset(obj, path)
        path.pop()
    }
}

interface FilterPros {
    value: { filter: any, operator: string }
    onChange: (value: any) => void
    availableOperators: string[]
}

