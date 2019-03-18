import React, {Children} from 'react';
import connectField from 'uniforms/connectField';
import joinName from 'uniforms/joinName';
import AutoField from './AutoField';
import ListDelField from 'uniforms-antd/ListDelField';

const ListItem = props => {
        return (
            <div style={{width: '100%', clear: 'both'}}>
                <div
                    style={{
                        float: 'right',
                        marginBottom: '10px',
                        marginLeft: '10px',
                        marginRight: '6px',
                        width: '20px'
                    }}
                >
                    <ListDelField className="top aligned" name={props.name} type="danger"/>
                </div>

                <div style={{marginBottom: '4px', overflow: 'hidden'}}>
                    <div style={{borderBottom: '1px solid #adadad', height: '20px', marginTop: '-4px'}}/>
                </div>

                <div style={{width: '100%', clear: 'both'}}>
                    {props.children ? (
                        Children.map(props.children, child =>
                            React.cloneElement(child, {
                                name: joinName(props.name, child.props.name),
                                label: null
                            })
                        )
                    ) : (
                        <AutoField {...props} />
                    )}
                </div>
            </div>);
    }
;

export default connectField(ListItem, {includeInChain: false, includeParent: true});