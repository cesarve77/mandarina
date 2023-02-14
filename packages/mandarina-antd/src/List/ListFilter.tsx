import * as React from "react";
import {memo, useMemo, useRef} from "react";
import AutoForm from "uniforms-antd/AutoForm";
import {Schema} from "mandarina";
import {Bridge} from "../Bridge";
import {getDefaultComponent} from "./ListFilters";
import {FieldDefinition, FilterComponent} from "mandarina/build/Schema/Schema";
import {deepClone} from "mandarina/build/Operations/Mutate";
import HiddenField from "uniforms-antd/HiddenField";

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
    filters?: any
}



export const ListFilter = memo(({onFilterChange, field, filter, schema}: ListFilterProps) => {
    let FieldComponent: FilterComponent = useMemo(() => {
        const fieldDefinition: FieldDefinition = deepClone(schema.getPathDefinition(field))
        let FC: FilterComponent
        if (fieldDefinition.isTable) {
            if (fieldDefinition.list.filterComponent === undefined) {
                throw new Error(`Field: "${field}" you need to set "list.noFilter" to true, or pass your custom filterComponent  "`)
            } else {
                FC = fieldDefinition.list.filterComponent
            }
        } else {
            FC = fieldDefinition.list.filterComponent === undefined ? getDefaultComponent(fieldDefinition) : fieldDefinition.list.filterComponent
        }
        return FC
    }, [schema, field])

    const name = useRef(`filter-${field}-${uuid()}`).current; //todo remove this dependeincy making schema get optional name

    const bridge = useMemo(() => {
        const fieldDefinition: FieldDefinition = deepClone(schema.getPathDefinition(field))
        fieldDefinition.validators = fieldDefinition.validators.filter(({
                                                                            validatorName,
                                                                            arrayValidator,
                                                                            tableValidator
                                                                        }) => validatorName !== 'required' && !arrayValidator && !tableValidator)
        const filterSchema = new Schema({
            // @ts-ignore
            filter: fieldDefinition,
            internal: {type: String}
        }, {
            name
        })
        return new Bridge(filterSchema, filterSchema.getFields())
    }, [schema, field])

    const onSubmit =({filter}: { filter: any }) => {
        if (filter) filter.internal = 'true' //this is for avoid rerender, if the filter does not have internal, is because is a external change as clear filters.
        onFilterChange(field, filter)
    }


    return FieldComponent && (
        <AutoForm schema={bridge} autosave autosaveDelay={400}
                  style={{width: 'calc(100% - 4px)'}}
                  onSubmit={onSubmit}
                  onValidate={(model: any, error: any, callback: (error: any) => void) => {
                      return callback(null);
                  }}
                  model={{filter}}
        >
            <HiddenField name={'internal'}/>
            <FieldComponent name='filter' label={false} col={false} defaultValue={''}/>
        </AutoForm>
    )
})


export default ListFilter
