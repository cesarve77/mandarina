import {HeaderActionButtonProps} from "./HeaderDefault";

const exportFnc = ({query, client, where}: HeaderActionButtonProps) => new Promise((resolve ,reject)=>{
    client.query({
        // @ts-ignore
        query,
        variables: {
            where
        }
    }).then((res: any) => {

    }).catch(reject)
})

export default exportFnc

