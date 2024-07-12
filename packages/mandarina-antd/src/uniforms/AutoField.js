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

filterDOMProps.register('col', 'loading', 'minCount', 'maxCount', 'fields', 'submitting', 'validating', 'fieldDefinition')


class CustomAuto extends BaseField {
    static displayName = 'CustomAutoField';

    getChildContextName() {
        return this.context.uniforms.name;
    }

    render() {
        const props = this.getFieldProps(undefined, {ensureValue: false});
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
                        props.component = ListField;
                        break;
                    case (typeof props.fieldType === 'string' || props.fieldType === Object):
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
        //this.props  properties applied directly on AutoField
        //props has a field property with values in the schema
        const mergeProps = {...props.field.form.props, ...this.props}
        if (mergeProps.col === false) return createElement(props.component, mergeProps)
        let col = typeof mergeProps.col !== 'object' ? {span: mergeProps.col || 24} : mergeProps.col ? {...mergeProps.col} : {span: 24}
        return (
            <Col  {...col} data-id={mergeProps.name}>
                {createElement(props.component, mergeProps)}
            </Col>
        )
    }
};

export default CustomAuto
