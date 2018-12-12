import * as React from "react";
import {FieldDefinition, Native} from "mandarina/build/Schema/Schema";
import AutoForm from "uniforms-antd/AutoForm";
import {Schema} from "mandarina";
import {Bridge} from "./Bridge";
import {AutoField} from "./index";
import set from "lodash.set";
import get from "lodash.get";
import isEmpty from "lodash.isempty";
import unset from "lodash.unset";


export const uuid = () => 'i' + (Date.now() - 1540000000000 + Math.random()).toString(36)

export interface onFilterChange {
    (variables: any):void//todo variables format
}

export type variables = any

interface ListFilter {
    variables: variables
    onFilterChange: onFilterChange
    field: string,
    fieldDefinition: FieldDefinition
}

const ListFilter = ({variables, onFilterChange, field, fieldDefinition}: ListFilter) => {
    console.log('ListFilter',field,fieldDefinition)
    const name = uuid() //todo remove this dependeincy making schema get optional name
    fieldDefinition = {...fieldDefinition}
    fieldDefinition.form.col = false
    const filterMethod = fieldDefinition.list.filterMethod || getDefaultFilterMethod
    let FieldComponent = fieldDefinition.list.filterComponent || fieldDefinition.form.component || AutoField
    fieldDefinition.validators = fieldDefinition.validators.filter(({validatorName}) => validatorName !== 'required')
    fieldDefinition.label=""
    const schema = new Bridge(new Schema({
        filter: fieldDefinition,
    }, {
        name
    }))
    return (
        <AutoForm schema={schema} autosave autosaveDelay={400}
                  onSubmit={({filter}: { filter: any }) => onFilterChange(filterMethod.call({
                      field,
                      type: fieldDefinition.type
                  }, filter))}>
            <FieldComponent name='filter' label={false}/>
        </AutoForm>
    )
};

const getDefaultFilterMethod = function (this: { field: string, type: Native | Native[] | string | string[] }, filter: any): variables {
    const path = this.field.split('.')

    switch (this.type) {
        case String:
            console.log(path,this.type)
            return (variables: variables) => {
                path[path.length - 1] += '_contains'
                path.unshift("where");
                if (filter) {
                    set(variables, path, filter)
                } else {
                    unsetDeep(variables, path)
                }

                return variables
            }
    }
    throw Error('no default filter method for ' + this.field)
}


export default ListFilter


export const unsetDeep=(obj:object,path:string[])=> {
    unset(obj, path)
    path.pop()
    while (path.length){
        const value=get(obj,path)
        if (value && isEmpty(value)) unset(obj,path)
        path.pop()
    }
}