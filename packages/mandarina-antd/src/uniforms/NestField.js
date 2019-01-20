import React, {Component} from 'react';
import connectField from 'uniforms/connectField';
import filterDOMProps from 'uniforms/filterDOMProps';
import injectName from 'uniforms/injectName';
import joinName from 'uniforms/joinName';
import AutoField from './AutoField';
import {getDecendents, getParents} from "mandarina/build/utils";
import * as PropTypes from "prop-types";


class Nest extends Component {
    decendents = {}
    parents=[]
    constructor(props) {
        super(props)
        this.parents =getParents(props.fields)
        this.parents.forEach((parent) => {
            this.decendents[parent] = getDecendents(props.fields, parent)
        })
    }
    render() {
        let {
            children,
            error,
            errorMessage,
            itemProps,
            label,
            name,
            showInlineError,
            ...props
        } = this.props;
        return <div {...filterDOMProps(props)}>
            {label && (
                <label>
                    {label}
                </label>
            )}

            {!!(error && showInlineError) && (
                <div>
                    {errorMessage}
                </div>
            )}

            {children ? (
                injectName(name, children)
            ) : (
                this.parents.map(key => {
                        return <AutoField key={key} name={joinName(name, key)}
                                          fields={this.decendents[key]} {...itemProps} />;
                    }
                )
            )}
        </div>;
    }
}

Nest.propTypes = {
    children: PropTypes.any,
    error: PropTypes.any,
    errorMessage: PropTypes.any,
    fields: PropTypes.any,
    itemProps: PropTypes.any,
    label: PropTypes.any,
    name: PropTypes.any,
    showInlineError: PropTypes.any
}

export default connectField(Nest, {ensureValue: false, includeInChain: false});
