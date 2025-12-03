import {isServerSide} from "jopi-toolkit/jk_what";

//region User info

export interface UiUserInfos {
    id: string;

    roles?: string[];
    email?: string;

    fullName?: string;
    nickName?: string;

    firstName?: string;
    lastName?: string;

    avatarUrl?: string;

    [key: string]: any;
}

export function decodeJwtToken(jwtToken: string|undefined): UiUserInfos|undefined {
    if (!jwtToken) return undefined;

    const parts = jwtToken.split('.');
    if (parts.length !== 3) return undefined;

    const payload = parts[1];
    const decodedPayload = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodedPayload) as UiUserInfos;
}

export function isUserInfoCookieUpdated(): boolean {
    const jwtToken = decodeNavigatorCookie("authorization");
    return jwtToken !== gAuthorizationCookiePreviousValue;
}

export function decodeUserInfosFromCookie(): UiUserInfos|undefined {
    if (isServerSide) {
        return undefined;
    }

    let jwtToken = decodeNavigatorCookie("authorization");
    gAuthorizationCookiePreviousValue = jwtToken;

    return decodeJwtToken(jwtToken);
}

let gAuthorizationCookiePreviousValue = "";

//endregion

//region Cookies

export function setCookie(name: string, value: string, maxAge?: number) {
    if (isServerSide) return;

    let cookieStr = `${name}=${value}; path=/`;

    if (maxAge !== undefined) {
        cookieStr += `; max-age=${maxAge}`;
    }

    document.cookie = cookieStr;
}

export function deleteCookie(name: string) {
    if (isServerSide) return;

    let current = decodeNavigatorCookie(name);
    if (current === undefined) return;

    document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    // Allow to be ok until document.cookie is refreshed.
    delete gCookies![name];
}

/**
 * Returns the value of the cookie.
 * Works browser side and server side.
 *
 * @param name
 *      The name of the cookie we want.
 */
export function decodeNavigatorCookie(name: string) {
    if (isServerSide) {
        return "";
    }

    let currentCookies = document.cookie;

    if (gCookies) {
        if (gCookieString !== currentCookies) {
            gCookieString = currentCookies;
            gCookies = undefined;
        }
    }

    if (!gCookies) {
        gCookies = {};

        currentCookies.split(';').forEach(c => {
            c = c.trim();
            let idx = c.indexOf("=");
            gCookies![c.substring(0, idx)] = c.substring(idx + 1);
        });
    }

    return gCookies![name];
}
//
let gCookies: undefined|Record<string, string>;
let gCookieString = "";

//endregion