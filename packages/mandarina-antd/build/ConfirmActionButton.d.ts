import * as React from 'react';
import { LegacyRef } from 'react';
import { MutationProps } from 'react-apollo';
import { Schema } from 'mandarina';
import Button, { ButtonProps } from "antd/lib/button";
import { ModalFuncProps } from "antd/lib/modal/Modal";
export interface ConfirmActionButtonProps extends Omit<ButtonProps, 'onError'>, Omit<MutationProps, 'children' | 'mutation'> {
    actionName: string;
    result: string;
    schema?: Schema;
    resultFields?: string[];
    refetchSchemas?: string[];
    data?: any;
    innerRef?: LegacyRef<Button>;
    onSuccess?: (data?: any) => void;
    modalProps: ModalFuncProps;
}
declare const _default: React.ForwardRefExoticComponent<ConfirmActionButtonProps & React.RefAttributes<Button>>;
export default _default;
