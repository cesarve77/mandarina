import {FieldDefinitionNative, FilterComponent, Native} from "mandarina/build/Schema/Schema";
import {Where} from "./ListFilter";
import {get, isEmpty, set, unset} from "lodash";
import connectField from 'uniforms/connectField'
import DatePicker from "antd/lib/date-picker";
import Dropdown from "antd/lib/dropdown";
import Input from "antd/lib/input";
import InputNumber from "antd/lib/input-number";
import Menu from "antd/lib/menu";
import React, {useState} from "react";
import {Integer, Schema} from "mandarina";
import {forceType, hasValidator} from "mandarina/build/Schema/utils";
import Select from "antd/lib/select";
import {Validator} from "mandarina/build/Schema/ValidatorCreator";
const { Option } = Select;
import moment from 'moment';

export const AllOperators: { [subfix: string]: { description: string, symbol: string } } = {
    "": {description: "equals", symbol: "="},
    "_not": {description: "not equals", symbol: "!="},
    "_contains": {description: "contains substring", symbol: "~"},
    "_not_contains": {description: "does not contain substring", symbol: "!~"},
    "_starts_with": {description: "starts with", symbol: "^"},
    "_not_starts_with": {description: "does not starts with", symbol: "!^"},
    "_ends_with": {description: "ends with", symbol: "$"},
    "_not_ends_with": {description: "does not ends with", symbol: "!$"},
    "_lt": {description: "less than", symbol: "<"},
    "_lte": {description: "less then or equals", symbol: "<="},
    "_gt": {description: "greater than", symbol: ">"},
    "_gte": {description: "greater than or equals", symbol: ">="},
    "_contains_every": {description: "all contains", symbol: "[~]"},
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
        if (fieldDefinition.isArray) {
            if (fieldDefinition.isTable) {
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
        const search = filter.filter
        const original = path[last]
        if (search !==undefined ) {
            const where = {}
            path[last] += filter.operator
            let value = forceType(search, fieldDefinition.type as Native)
            if (filter.operator === "" && fieldDefinition.type === Date) {
                value = moment(value)
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
            return where
        } else {
            return
        }
    }
}
const getAvailableOperator = (type: Native): string[] => {
    switch (true) {
        case (type === String):
            return ["_contains", "", "_not", "_not_contains", "_starts_with", "_not_starts_with", "_ends_with", "_not_ends_with"]
        case  (type === Integer || type === Date || type === Number):
            return ["", "_not", "_lt", "_lte", "_gt", "_gte"]
        default:
            return [""]
    }
}
export const getDefaultComponent = ( fieldDefinition: FieldDefinitionNative): FilterComponent => {
    const availableOperators = getAvailableOperator(fieldDefinition.type as Native)
    const Filter = ({
                        value = {
                            operator: availableOperators[0],
                            filter: undefined
                        }, onChange
                    }: FilterPros) => {

        let clonedValue = {...value}
        if (!clonedValue || (!clonedValue.operator && clonedValue.operator !== "")) {
            clonedValue = {operator: availableOperators[0], filter: undefined}
        }
        const [selected, setSelected] = useState(clonedValue.operator)
        const options = (
            <Menu onClick={({key: operator}) => {
                if (operator === "_") {
                    operator = ""
                }
                setSelected(operator)
                if (clonedValue.filter) {
                    onChange(clonedValue)
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
        let {type, validators} = fieldDefinition

        const hasOptions= hasValidator(validators,'isAllowed')
        switch (true) {

            case  (type === Integer):
                return (
                    <span className="ant-input-wrapper ant-input-group">
                <span className="ant-input-group-addon">
                  {operator}
                </span>
               <InputNumber value={clonedValue.filter}
                            style={{width: '100%'}}
                            onChange={(value) => (value=== 0 || value) ? onChange({
                                operator: selected,
                                filter: value
                            }) : onChange(null)}/>
            </span>
                )
            case  (type === Number):
                return (
                    <span className="ant-input-wrapper ant-input-group">
                <span className="ant-input-group-addon">
                  {operator}
                </span>
               <InputNumber value={clonedValue.filter}
                            style={{width: '100%'}}
                            onChange={(value) => (value=== 0 || value) ? onChange({
                                operator: selected,
                                filter: value
                            }) : onChange(null)}/>
            </span>
                )
            case  (type === Date):
                return (
                    <span className="ant-input-wrapper ant-input-group date-picker">
                <span className="ant-input-group-addon">
                  {operator}
                </span>
                      <DatePicker value={clonedValue.filter ? moment(clonedValue.filter) : undefined}
                                  placeholder={""}
                                  onChange={(date) => date ? onChange({
                                      operator: selected,
                                      filter: moment(date)
                                  }) : onChange(null)}/>
            </span>
                )
            case  (type === Boolean):
                const selectValue=clonedValue.filter===false ? 'false' : clonedValue.filter ? 'true' : undefined
                return (
                    <Select value={selectValue} allowClear style={{width: '100%'}} onChange={(value:any)=>{
                        if (!value) return onChange(null)
                        onChange({
                            operator: selected,
                            filter: value === 'true'
                        })
                    }}>
                        <Option value={'true'}>Yes</Option>
                        <Option value={'false'}>No</Option>

            </Select>
                )
            case  (type === String && hasOptions):
                const isAllowed=validators.find((validator:Validator)=>validator.validatorName==='isAllowed')
                if (!isAllowed){
                    return null
                }
                const transform=fieldDefinition?.form?.props?.transform
                return (
                  <Select value={clonedValue.filter} allowClear style={{width: '100%'}} onChange={(value:any)=>{
                      if (!value) return onChange(null)
                      onChange({
                          operator: "",
                          filter: value
                      })
                  }}>
                      {isAllowed.param.map((param: string)=><Option key={param} value={param}>{transform ? transform(param) : param}</Option>)}
                  </Select>
                )
            default:
                return <Input addonBefore={operator} value={clonedValue.filter} style={{width: '100%'}}
                              onChange={({target: {value}}) => value ? onChange({
                                  operator: selected,
                                  filter: value
                              }) : onChange(null)}/>
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

