/// <reference types="react" />
export interface OnSortChange {
    (field: string, direction: -1 | 1): void;
}
declare const SortButton: ({ sort, field, onSortChange }: {
    onSortChange: OnSortChange;
    sort?: {
        [field: string]: 1 | -1;
    } | undefined;
    field: string;
}) => JSX.Element;
export default SortButton;
