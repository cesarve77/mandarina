import React, {Children} from 'react';
import connectField from 'uniforms/connectField';
import joinName from 'uniforms/joinName';
import AutoField from './AutoField';
import ListDelField from 'uniforms-antd/ListDelField';

const ListItem = ({children, showListDelField = true, name, index, ...props}) => {
        return (
            <div style={{width: '100%', clear: 'both', float: "none"}}>
                <div
                    style={{
                        float: 'right',
                        marginBottom: '10px',
                        marginLeft: '10px',
                        marginRight: '6px',
                        width: '20px'
                    }}
                >
                    {(typeof showListDelField === 'function' ? showListDelField({index, name}) : showListDelField) &&
                        <ListDelField className="top aligned ant-btn-danger" name={name} type="danger"/>}
                </div>
                <div style={{marginBottom: '4px', overflow: 'hidden'}}>
                    <div style={{borderBottom: '1px solid #adadad', height: '20px', marginTop: '-4px'}}/>
                </div>
                <div style={{width: '100%', clear: 'both'}}>
                    {children ? (
                        typeof children === 'function' ?
                            Children.map(children({children, showListDelField, name, index, ...props}), child =>
                                React.cloneElement(child, {
                                    index: index,
                                    name: joinName(name, child.name),
                                    label: null
                                })
                            )
                            :
                            Children.map(children, child =>
                                React.cloneElement(child, {
                                    index: index,
                                    name: joinName(name, child.name),
                                    label: null
                                })
                            )
                    ) : (
                        <AutoField {...{children, showListDelField, name, index, ...props}} />
                    )}
                </div>
            </div>);
    }
;

export default connectField(ListItem, {includeInChain: false, includeParent: true});
