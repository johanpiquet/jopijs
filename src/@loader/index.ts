import * as NodeModule from 'node:module';

import {isNodeJS, isBunJS} from "jopi-toolkit/jk_what";
import {installBunJsLoader} from "jopijs/loader-tools";

// Guard to avoid recursive self-registration when using Module.register(import.meta.url)
const __JOPI_LOADER_REGISTERED__ = Symbol.for('jopi-loader:registered');
const __g: any = globalThis as any;

if (!__g[__JOPI_LOADER_REGISTERED__]) {
    __g[__JOPI_LOADER_REGISTERED__] = true;

    if (isNodeJS) {
        // "register" allow async.
        NodeModule.register(new URL('./nodeJsLoader.js', import.meta.url));
    } else if (isBunJS) {
        installBunJsLoader();
    }
}