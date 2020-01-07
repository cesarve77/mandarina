import Icon from 'antd/lib/icon';
import React, {Children} from 'react';
import Tooltip from 'antd/lib/tooltip';
import connectField from 'uniforms/connectField';
import filterDOMProps from 'uniforms/filterDOMProps';
import joinName from 'uniforms/joinName';
import ListAddField from 'uniforms-antd/ListAddField';
import ListItemField from './ListItemField';


const List = ({
                  children,
                  error,
                  errorMessage,
                  info,
                  initialCount,
                  itemProps,
                  label,
                  labelCol,
                  name,
                  showInlineError,
                  value,
                  wrapperCol,
                  fields,
                  ...props
              }) => {
        return <div {...filterDOMProps(props)}>
            {!!label && (
                <div>
                    {label}
                    {!!info && (
                        <span>
                            &nbsp;
                            <Tooltip title={info}>
                                <Icon type="question-circle-o"/>
                            </Tooltip>
                        </span>
                    )}
                </div>
            )}

            {!!(error && showInlineError) && (
                <div>
                    {errorMessage}
                </div>
            )}

            {children ? (
                value.map((item, index) =>
                    Children.map(children, child =>
                        React.cloneElement(child, {
                            key: index,
                            label: null,
                            name: joinName(name, child.props.name && child.props.name.replace('$', index)),
                        })
                    )
                )
            ) : (
                value.map((item, index) => {

                        return <ListItemField
                            key={index}
                            label={null}
                            labelCol={labelCol}
                            name={joinName(name, index)}
                            data-id={`list-item-${joinName(name, index)}`}
                            wrapperCol={wrapperCol}
                            fields={fields}
                            {...itemProps}
                        />;
                    }
                )
            )}
            <div  style={{clear: 'both'}}>
            <ListAddField name={`${name}.$`} initialCount={initialCount} size='large' className={'add-button'}
                          type={'primary'}
                          shape={'round'}
                          data-id={`list-add-${name}`}
                          style={{}}>
                Add {label}

            </ListAddField>
            </div>
            <div style={{clear: 'both'}}></div>
        </div>;
    }
;

List.defaultProps = {
    style: {
        border: '1px solid #DDD',
        borderRadius: '7px',
        marginBottom: '5px',
        marginTop: '5px',
        padding: '10px'
    }
};

export default connectField(List, {ensureValue: true, includeInChain: false});
