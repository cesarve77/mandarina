import React, {Component, createElement} from "react";
import PropTypes from 'prop-types';
import filterDOMProps from "uniforms/filterDOMProps";
import AutoField from "./AutoField";
import {Row} from "antd";
import {getDecendentsDot, getParentsDot} from "mandarina/build/utils";


class AutoFields extends Component {

    componentWillMount() {
        let {uniforms: {schema, error}} = this.context;
        this.fields = this.props.fields || schema.getSubfields()
        const groups = {}
        const groupErrors = []
        this.fields.forEach((field) => {
            const {uniforms: {group = 'default'} = {}} = schema.getField(field)
            groups[group] = groups[group] || []
            groups[group].push(field)
            const hasError = !!schema.getError(field, error)
            if (hasError) {
                groupErrors.push(group)
            }

        })
        for (const key in groups) {
            groups[key].sort(({uniforms: {order} = {}}) => order)
        }
        const groupNames = Object.keys(groups)
        //if (activeKey.length===0) activeKey = [groupNames[0]]
        groupNames.sort((groupName) => {
            const {uniforms: {order = 0} = {}} = schema.getField(groups[groupName][0])
            return order
        })
        this.groups = groups
        this.groupNames = groupNames
    }

    render() {

        let {autoField, element, fields,omitFields=[], loading, ...props} = this.props;
        const fieldList=fields || this.fields
        if (this.groupNames.length > 1) return (
            this.groupNames.map((groupName) => (
                <Row key={groupName}>
                    {createElement(
                        element,
                        props,
                        this.groups[groupName]
                            .map(field => {
                                return createElement(autoField, {key: field, name: field})
                            })
                    )}
                </Row>
            ))
        )
        const filteredField=fieldList.filter(field => omitFields.indexOf(field) === -1)
        const parents=getParentsDot(filteredField)
        return createElement(
            element,
            props,
            parents
                .map(field => {
                    let fields = getDecendentsDot(filteredField, field)
                    if (fields.length > 0) {
                        return createElement(autoField, {key: field, name: field, fields})
                    }
                    return createElement(autoField, {key: field, name: field})
                })
        )
    }
}

AutoFields.contextTypes = AutoField.contextTypes;

AutoFields.propTypes = {
    autoField: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    element: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    fields: PropTypes.arrayOf(PropTypes.string),
    omitFields: PropTypes.arrayOf(PropTypes.string),
};

AutoFields.defaultProps = {
    autoField: AutoField,
    element: 'div',
};

filterDOMProps.register('col')

export default AutoFields



