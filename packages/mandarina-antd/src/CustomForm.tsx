import React, { PureComponent, ReactChild, ReactElement } from 'react'
import { Schema } from 'mandarina'
import { AutoField, AutoFields, ErrorsField } from './index'

import AutoForm from 'uniforms-antd/AutoForm'
import { Bridge } from "./Bridge";
import SubmitField from "uniforms-antd/SubmitField";
import { ChildFunc } from "./Forms";
import { Action } from './Action';

export interface CustomFormProps {
	schema: Schema
	actionName: string,
	result: string,
	fields?: string[]
	omitFields?: string[]
	children?: (props: any) => React.ReactNode | React.ReactNode | React.ReactNode[]
	[key: string]: any //replace for uniforms autoform props
}

export class CustomForm extends PureComponent<CustomFormProps> {
	state: { changed: boolean } = { changed: false }
	render() {
		const { result, actionName, schema, omitFields, children, fields: fieldsProp, onSubmit } = this.props;
		const { changed } = this.state;
		const bridge = new Bridge(schema);

		return (
			// @ts-ignore
			<Action actionName={actionName} schema={schema} result={result} fields={fieldsProp}>
				{({ schema, mutate, loading, data, error, called, client, ...rest }) => {
					return (
						<AutoForm disabled={loading}
							onSubmit={(data: object) => {
								onSubmit && onSubmit(data)
								this.setState({ changed: false })
								return mutate(data);
							}}
							schema={bridge}
							onChange={() => {
								if (error) this.setState({ changed: true })
							}}
							error={changed ? undefined : error}

							{...rest}>
							{children && Array.isArray(children) && children.map((child: ReactElement<ReactChild> | ChildFunc) => {
								if (typeof child === "function") {
									return child({ loading })
								}
								return React.cloneElement(child)
							})}
							{children && !Array.isArray(children) && (typeof children === "function") && children({ loading })}
							{children && !Array.isArray(children) && (typeof children !== "function") && children}
							{!children && (
								<div>
									<AutoFields autoField={AutoField} omitFields={omitFields} />
									<ErrorsField style={{ marginBottom: '15px' }} />
									<SubmitField size='large' loading={loading} />
								</div>)
							}
						</AutoForm>
					);
				}}
			</Action>
		)
	}
}
