import * as React from "react";
import AutoForm from "uniforms-antd/AutoForm";
import {Schema} from "mandarina";
import {Bridge} from "../Bridge";
import {getDefaultComponent} from "./ListFilters";
import {FilterComponent} from "mandarina/build/Schema/Schema";


export const uuid = () => 'i' + (Date.now() - 1540000000000 + Math.random()).toString(36)

export interface OnFilterChange {
    (field: string, filter: any): void//todo variables format
}

export type Where = any

interface ListFilterProps {
    onFilterChange: OnFilterChange
    field: string,
    schema: Schema
    filter?: any
}

const ListFilter = React.memo(({onFilterChange, field, filter, schema}: ListFilterProps) => {
        const fieldDefinition = schema.getPathDefinition(field)
        if (fieldDefinition.isTable) throw new Error(`ListFilter "${field}" cannot be a table`)
        const name = uuid() //todo remove this dependeincy making schema get optional name
        let FieldComponent: FilterComponent = fieldDefinition.list.filterComponent === undefined ? getDefaultComponent(field, fieldDefinition) : fieldDefinition.list.filterComponent
        fieldDefinition.validators = fieldDefinition.validators.filter(({validatorName}) => validatorName !== 'required')
        const filterSchema = new Schema({
            filter: fieldDefinition,
        }, {
            name
        })
        const bridge = new Bridge(filterSchema)
        return FieldComponent && (
            <AutoForm schema={bridge} autosave autosaveDelay={400}
                // onChangeModel={(model: any) => console.log(model)}
                      onSubmit={({filter}: { filter: any }) => {
                          onFilterChange(field, filter)
                      }}
                      onValidate={(model: any, error: any, callback: (error: any) => void) => {

                          return callback(null);
                      }}
                      model={{filter}}
            >
                <FieldComponent name='filter' label={false} col={false} defaultValue={''}/>
            </AutoForm>
        )
    }, (prevProps, nextProps) =>
    prevProps.field === nextProps.field && prevProps.onFilterChange === nextProps.onFilterChange && prevProps.schema === nextProps.schema
)

export default ListFilter