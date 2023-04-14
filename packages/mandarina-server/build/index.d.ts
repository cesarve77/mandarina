import { CustomAction } from './Action/CustomAction';
import { Table } from './Table/Table';
import Mandarina from './Mandarina';
import { getConfig } from './cli/utils';
declare const Action: typeof CustomAction;
export default Mandarina;
export { getConfig, CustomAction, Action, Table, };
