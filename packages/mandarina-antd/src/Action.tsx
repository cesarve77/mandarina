import React, { PureComponent } from 'react'
import { Mutation } from 'react-apollo'
import gql from "graphql-tag";
import { Schema } from 'mandarina'

import { capitalize } from "mandarina/build/Table/utils";
import { buildQueryFromFields } from "mandarina/build/Operations/utils";
import { Model, MutateChildren} from './Interfaces';

export interface ActionProps {
	schema: Schema
	actionName: string,
	result: string,
	fields?: string[]
	omitFields?: string[]
	children: MutateChildren
	[key: string]: any //replace for uniforms autoform props
}

export class Action extends PureComponent<ActionProps> {
	render() {
		const { result, actionName, schema, children, fields: fieldsProp, ...rest } = this.props
		const resultSchema = Schema.instances[result]
		const fields = resultSchema ? fieldsProp || resultSchema.getFields() : undefined;
		const queryFromFields = fields ? buildQueryFromFields(fields) : '';

		const gqlString = `
            mutation ${actionName}($data: ${capitalize(actionName)}Input!) {
                ${actionName}(data: $data)
                    ${queryFromFields}
            }
        `;
		const MUTATION = gql(gqlString);

		return (
			// @ts-ignore
			<Mutation mutation={MUTATION}
				onCompleted={(data: Model) => console.log('Action onCompleted', data)}>
				{(mutationFn, {
					loading,
					data,
					error,
					called,
					client,

				}) => children({
					schema,
					mutate: (data: Model) => mutationFn({ variables: { data } }),
					loading,
					data,
					error,
					called,
					client,
					...rest
				})}
			</Mutation>
		)
	}
}
