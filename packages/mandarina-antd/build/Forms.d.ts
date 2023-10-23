import React, { ReactElement } from 'react';
import { Schema } from "mandarina";
import { CreateProps, MutateResultProps, UpdateProps } from "mandarina/build/Operations/Mutate";
import { OperationVariables } from "react-apollo";
import { Model, Overwrite } from "mandarina/build/Schema/Schema";
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
type Component = (props: CreateProps | UpdateProps) => ReactElement;
type FormPropsOmitComponent = Omit<FormProps, 'Component'>;
export interface CreateFormProps extends FormPropsOmitComponent {
    ref?: React.Ref<HTMLFormElement>;
}
export interface UpdateFormProps extends FormPropsOmitComponent {
    id: string | any;
    readFields?: string[];
    ref?: React.Ref<HTMLFormElement>;
}
export interface DeleteFormProps extends FormPropsOmitComponent {
    id: string;
    ref?: React.Ref<HTMLFormElement>;
}
export declare const CreateForm: React.ForwardRefExoticComponent<Pick<CreateFormProps, "id" | "placeholder" | "style" | "children" | "onChange" | "onSubmit" | "onError" | "disabled" | "client" | "ignoreResults" | "optimisticResponse" | "variables" | "refetchQueries" | "awaitRefetchQueries" | "update" | "onCompleted" | "context" | "fetchPolicy" | "schema" | "refetchSchemas" | "innerRef" | "error" | "fields" | "overwrite" | "showInlineError" | "autosaveDelay" | "autosave" | "label" | "model" | "modelTransform" | "onSubmitFailure" | "onSubmitSuccess" | "onValidate" | "onChangeModel" | "validate"> & React.RefAttributes<HTMLFormElement>>;
export declare const UpdateForm: React.ForwardRefExoticComponent<Pick<UpdateFormProps, "id" | "placeholder" | "style" | "children" | "onChange" | "onSubmit" | "onError" | "disabled" | "client" | "ignoreResults" | "optimisticResponse" | "variables" | "refetchQueries" | "awaitRefetchQueries" | "update" | "onCompleted" | "context" | "fetchPolicy" | "schema" | "refetchSchemas" | "innerRef" | "error" | "fields" | "overwrite" | "showInlineError" | "autosaveDelay" | "autosave" | "label" | "model" | "modelTransform" | "onSubmitFailure" | "onSubmitSuccess" | "onValidate" | "onChangeModel" | "validate" | "readFields"> & React.RefAttributes<HTMLFormElement>>;
export declare const DeleteForm: React.ForwardRefExoticComponent<Pick<DeleteFormProps, "id" | "placeholder" | "style" | "children" | "onChange" | "onSubmit" | "onError" | "disabled" | "client" | "ignoreResults" | "optimisticResponse" | "variables" | "refetchQueries" | "awaitRefetchQueries" | "update" | "onCompleted" | "context" | "fetchPolicy" | "schema" | "refetchSchemas" | "innerRef" | "error" | "fields" | "overwrite" | "showInlineError" | "autosaveDelay" | "autosave" | "label" | "model" | "modelTransform" | "onSubmitFailure" | "onSubmitSuccess" | "onValidate" | "onChangeModel" | "validate"> & React.RefAttributes<HTMLFormElement>>;
export interface AutoFormProps {
    showInlineError?: boolean;
    autosaveDelay?: number;
    autosave?: boolean;
    disabled?: boolean;
    error?: Error;
    label?: boolean;
    model?: object;
    modelTransform?: (mode: 'form' | 'submit' | 'validate', model: object) => boolean;
    onChange?: (key: string, value: any) => void;
    onSubmitFailure?: (e?: any) => void;
    onSubmitSuccess?: (res?: any) => void;
    onValidate?: (model: any, error: Error, callback: () => void) => void;
    onChangeModel?: (model: Model) => void;
    onSubmit?: (model: Model) => Promise<void> | void;
    placeholder?: boolean;
    innerRef?: React.Ref<HTMLFormElement>;
    style?: any;
    validate?: 'onChange' | 'onChangeAfterSubmit' | 'onSubmit';
}
interface FormProps<TData = any, TVariables = OperationVariables> extends MutateResultProps, AutoFormProps {
    Component: Component;
    schema: Schema;
    id?: string | any;
    fields: string[];
    overwrite?: Overwrite;
    children?: ((props: any) => React.ReactNode | React.ReactNode[]) | React.ReactNode | React.ReactNode[];
}
export interface ChildFunc {
    (props: any): ReactElement;
}
export {};
