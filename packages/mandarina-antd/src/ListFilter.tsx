import * as React from "react";
import AutoForm from "uniforms-antd/AutoForm";
import {Schema} from "mandarina";
import {Bridge} from "./Bridge";
import {getDefaultComponent, getDefaultFilterMethod} from "./ListFilters";


export const uuid = () => 'i' + (Date.now() - 1540000000000 + Math.random()).toString(36)

export interface onFilterChange {
    (field: string, filter: any): void//todo variables format
}

export type Where = any

interface ListFilter {
    onFilterChange: onFilterChange
    field: string,
    schema: Schema
}

const ListFilter = React.memo(({onFilterChange, field, schema}: ListFilter) => {
    const original = schema.getPathDefinition(field)
    const fieldDefinition = {...original, form: {...original.form}}
    const name = uuid() //todo remove this dependeincy making schema get optional name
    fieldDefinition.form.col = false
    const filterMethod = fieldDefinition.list.filterMethod || getDefaultFilterMethod(field, fieldDefinition)
    let FieldComponent = fieldDefinition.list.filterComponent || fieldDefinition.form.component || getDefaultComponent(field, fieldDefinition)
    fieldDefinition.validators = fieldDefinition.validators.filter(({validatorName}) => validatorName !== 'required')
    fieldDefinition.label = ""
    fieldDefinition.defaultValue = ""
    const filterSchema=new Schema({
        filter: fieldDefinition,
    }, {
        name
    })
    const bridge = new Bridge(filterSchema)
    return (
        <AutoForm schema={bridge} autosave autosaveDelay={400}
                  onSubmit={({filter}: { filter: any }) => {
                      onFilterChange(field, filterMethod.call({fieldDefinition,schema}, filter))
                  }}
        >
            <FieldComponent name='filter' label={false}/>
        </AutoForm>
    )
})

export default ListFilter