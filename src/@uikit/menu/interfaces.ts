import React from "react";

export enum MenuName {
    LEFT_MENU = "layout.left",
    RIGHT_MENU = "layout.right",
    TOP_MENU = "layout.top"
}

export interface ReactMenuItem {
    key: string;
    items?: ReactMenuItem[];
    isActive?: boolean;

    /**
     * Is used as a key for React key calculation.
     */
    reactKey?: string;

    title?: string;
    url?: string;
    icon?: React.FC<any>;
    breadcrumb?: string[] | React.FC<any>;

    [key: string]: any;
}
