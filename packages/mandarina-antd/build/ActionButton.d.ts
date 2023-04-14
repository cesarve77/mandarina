import * as React from 'react';
import { LegacyRef } from 'react';
import { MutationProps } from 'react-apollo';
import { Schema } from 'mandarina';
import Button from "antd/lib/button";
import { ButtonProps } from "antd/lib/button";
export interface ActionButtonProps extends Omit<ButtonProps, 'onError'>, Omit<MutationProps, 'children' | 'mutation'> {
    actionName: string;
    result: string;
    schema?: Schema;
    resultFields?: string[];
    refetchSchemas?: string[];
    data?: any;
    innerRef?: LegacyRef<Button>;
    onSuccess?: (data?: any) => void;
}
declare const _default: React.ForwardRefExoticComponent<ActionButtonProps & React.RefAttributes<Button>>;
export default _default;
