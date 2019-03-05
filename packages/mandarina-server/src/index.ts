import {CustomAction} from './Action/CustomAction'
import {Table} from './Table/Table'
import {Auth} from './Auth/Auth'
import Mandarina from './Mandarina'
import {getConfig} from './cli/utils'


const Action=CustomAction //for backward compatibility

export default Mandarina
export {
    getConfig,
    CustomAction,
    Action,
    Table,
    Auth
}