import type {JDataRowSource, JDataRowSource_ReadParams} from "jopi-toolkit/jk_data";
import type {WebSite} from "./jopiWebSite";
import type {JopiRequest} from "./jopiRequest";

interface RegisteredDataSource {
    name: string;
    dataSource: JDataRowSource;
    permissions: Record<string, string[]>;
}

const toExpose: Record<string, RegisteredDataSource> = {};

// noinspection JSUnusedGlobalSymbols
/**
 * Expose a data source to the network.
 * Warning: if mainly called by generated code.
 */
export function exposeRowDataSource(name: string, dataSource: JDataRowSource, permissions: Record<string, string[]>) {
    toExpose[name] = {name, dataSource, permissions};
}

export function installDataSourcesServer(webSite: WebSite) {
    for (let key in toExpose) {
        const dsInfos = toExpose[key];
        webSite.onPOST("/_jopi/ds/" + key, req => onDsCall_POST(req, dsInfos));
    }
}

interface HttpRequestParams {
    dsName: string;
    read?: JDataRowSource_ReadParams;
}

async function onDsCall_POST(req: JopiRequest, dsInfos: RegisteredDataSource): Promise<Response> {
    let reqData = await req.req_getBodyData<HttpRequestParams>();

    if (reqData.read) {
        let res = await dsInfos.dataSource.read(reqData.read);
        return req.res_jsonResponse(res);
    }

    return req.res_returnError400_BadRequest();
}