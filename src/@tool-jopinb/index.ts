import {jopiLauncherTool} from "jopijs/loader-tools";

const VERSION = "2.0.0";

export function useEngine(engine: string) {
    if (process.env.JOPI_LOG==="1") {
        console.log("JopiN - Loader Version" + VERSION + " - engine=" + engine);
    }

    jopiLauncherTool(engine).then();
}
