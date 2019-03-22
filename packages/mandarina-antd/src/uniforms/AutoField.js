import React, {createElement} from "react";
import {Col} from "antd";
import BaseField from 'uniforms/BaseField';
import NumField from 'uniforms-antd/NumField';
import BoolField from 'uniforms-antd/BoolField';
import DateField from 'uniforms-antd/DateField';
import TextField from 'uniforms-antd/TextField';
import SelectField from 'uniforms-antd/SelectField';
import RadioField from 'uniforms-antd/RadioField';
import ListField from './ListField';
import NestField from './NestField';
import TableField from "./TableField";
import invariant from 'invariant'
import {Integer} from 'mandarina'
import HiddenField from "uniforms-antd/HiddenField";
import filterDOMProps from "uniforms/filterDOMProps";

filterDOMProps.register('col', 'loading', 'omitFields', 'minCount', 'maxCount', 'fields', 'submitting', 'validating', 'fieldDefinition')


class CustomAuto extends BaseField {
    static displayName = 'CustomAutoField';

    getChildContextName() {
        return this.context.uniforms.name;
    }


    render() {

        const props = this.getFieldProps(undefined, {ensureValue: false});
        let {field: {form: {col = 24} = {}}} = props
        if (props.component === undefined) {
            if (props.allowedValues) {//todo
                if (props.checkboxes && props.fieldType !== Array) {
                    props.component = RadioField;
                } else {
                    props.component = SelectField;
                }
            } else {
                switch (true) {
                    case  /(^id$|\.id$)/.test(this.props.name):
                        props.component = HiddenField;
                        break;

                    case !!props.query:
                        props.component = TableField;
                        break;
                    case (Array.isArray(props.fieldType) || props.fieldType === Array):
                        console.log('ListField', props)
                        props.component = ListField;
                        break;
                    case (typeof props.fieldType === 'string' || props.fieldType === Object):
                        console.log('NestField')
                        props.component = NestField;
                        break;
                    case props.fieldType === Date:
                        props.component = DateField;
                        break;
                    case props.fieldType === Number:
                        props.component = NumField;
                        break;
                    case props.fieldType === Integer:
                        props.component = NumField;
                        break;
                    case props.fieldType === String:
                        props.component = TextField;
                        break;
                    case props.fieldType === Boolean:
                        props.component = BoolField;
                        break;
                }

                invariant(props.component, 'Unsupported field type in: %s', props.name);

            }
        }
        let label = this.props.label
        if (label === "") label = this.props.field.label
        if (col === false) return createElement(props.component, {...this.props, label})
        if (typeof col !== 'object') col = {span: col}
        return (
            <Col {...col}>
                {createElement(props.component, {...this.props, label})}
            </Col>
        )
    }

};

export default CustomAuto