import { Schema } from 'mandarina'
import { FetchResult } from "react-apollo/Mutation";
import { ApolloError } from "apollo-client";
import ApolloClient from "apollo-client/ApolloClient";

export type TData = any

export interface MutateChildrenParams extends FormChildrenParams {
	mutate: (model: Model) => Promise<void | FetchResult<Model>>

}

export interface FormChildrenParams {
	schema: Schema,
	data: TData
	loading: boolean
	error?: ApolloError
	called?: boolean
	client?: ApolloClient<any>

	[rest: string]: any
}

export interface MutateChildren {
	(mutateChildrenParams: MutateChildrenParams): JSX.Element
}

export interface Model {
	id?: string
	[key: string]: any
}
