import { ReactElement, ReactNode } from "react";
import Query from "react-apollo/Query";
import { ApolloClient } from "apollo-client";
import { ColumnDef, ControlledListProps, Refetch } from "./ListVirtualized";
import { Schema } from "mandarina";
export interface HeaderProps extends ControlledListProps {
    count: number;
    data: any;
    columns: (ColumnDef | null)[];
    refetch: Refetch;
    query: Query<any>;
    variables: any;
    fields: string[];
    loading: boolean;
    schema: Schema;
    where: any;
    client: ApolloClient<any>;
}
export type Action = (props: HeaderActionButtonProps) => void | Promise<any>;
export type ContentFnc = (props: HeaderActionButtonProps) => ReactNode;
export interface HeaderDefaultProps {
    leftButtons?: ReactNode;
    counter?: boolean;
    menuItems?: (({
        props: any;
        action?: Action;
        content: ReactNode | ReactElement | ContentFnc;
    }) | string)[];
}
export interface HeaderActionButtonProps extends HeaderProps {
    setLoadingAction?: (loading: boolean) => void;
}
declare const HeaderDefault: ({ leftButtons, counter, menuItems, count, ...props }: HeaderDefaultProps & HeaderProps) => JSX.Element;
export default HeaderDefault;
