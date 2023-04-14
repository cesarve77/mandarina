import React from 'react';
import { Schema } from 'mandarina';
import { AutoFormProps } from "./Forms";
import { Overwrite } from "mandarina/build/Schema/Schema";
export interface ActionFormProps extends AutoFormProps {
    schema: Schema;
    actionName: string;
    result: string;
    fields: string[];
    resultFields?: string[];
    children?: React.ReactNode | ((props: any) => React.ReactNode | React.ReactNode[]);
    refetchSchemas?: string[];
    overwrite?: Overwrite;
    [key: string]: any;
}
declare const _default: React.ForwardRefExoticComponent<Pick<ActionFormProps, React.ReactText> & React.RefAttributes<HTMLFormElement>>;
export default _default;
