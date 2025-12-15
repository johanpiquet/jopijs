import React from "react";

export function ucFirst(text: string): string {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

export function showIfTrue(cond: any, value: React.ReactNode) {
    if (!!cond) return value;
    return null;
}

export function showIfFalse(cond: any, value: React.ReactNode) {
    if (!cond) return value;
    return null;
}

export function sendFormData(url: string, formData: FormData): Promise<Response> {
    return fetch(url!, {
        method: 'POST',
        body: formData,
        credentials: 'include'
    });
}

export function sendJsonData(url: string, data: any): Promise<Response> {
    return fetch(url!, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data),
        credentials: 'include'
    });
}

/**
 * Calculate the final component CSS classes.
 *
 * @param custom       By what replace this classes.
 * @param extra1        What to append to the final classes (allows avoiding using custom).
 * @param extra2        What to append to the final classes (generally added in cas of error).
 * @param defaults     The default classes.
 */
export function passThrough<T>(custom: undefined|Record<string, string>,
                               extra1: undefined|Record<string, string>,
                               extra2: undefined|Record<string, string>,
                               defaults: T): T {
    function mix(base: string|undefined, custom: string|undefined, extra1: string|undefined, extra2: string|undefined): string|undefined {
        if (custom) base = custom;

        if (extra1) {
            if (!base) base = extra1;
            base += " " + extra1;
        }

        if (extra2) {
            if (!base) base = extra2;
            base += " " + extra2;
        }

        return base;
    }

    let res: any = {};

    for (let key in defaults) {
        res[key] = mix((defaults as any)[key], custom?.[key], extra1?.[key], extra2?.[key]);
    }

    return res;
}