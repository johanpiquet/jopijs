import {getLogger} from "jopi-toolkit/jk_logs";

export const logServer = getLogger("jopi.server");
export const logServer_startApp = getLogger("startApp", logServer);
export const logServer_request = getLogger("request", logServer);
export const logServer_linker = getLogger("linker", logServer);

export const logBundler = getLogger("jopi.bundler");

export const logCache = getLogger("jopi.cache");
export const logCache_notInCache = getLogger("notInCache", logCache);