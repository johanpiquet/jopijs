import DdosProtection from "./DdosProtection.ts";
import CorsMiddleware from "./CorsMiddleware.ts";
import {JopiRequest} from "../jopiRequest.js";

export const Middlewares = {
    ddosProtection: DdosProtection,

    requestTimeout_sec: (timeInSec:number) => (req: JopiRequest) => {
        req.req_extendTimeout_sec(timeInSec);
        return null;
    }
};

export const PostMiddlewares = {
    cors: CorsMiddleware
};