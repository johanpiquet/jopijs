import {type Table, type CellContext, type HeaderContext} from "@tanstack/react-table";

import * as React from "react";
import * as jk_schema from "jopi-toolkit/jk_schema";

//region Rendering

export interface JFieldRenderingRules extends Omit<jk_schema.ScOnTableRenderingInfo, "rendererForCell" | "rendererForHeader"> {
    /**
     * Allows merging or replacing the default settings for the field.
     * Default is merging.
     */
    mergeMode?: "replace" | "merge";

    rendererForCell?: string|JCellRendererProvider;
    rendererForHeader?: string|JCellRendererProvider;
}

export interface JFieldWithRenderer extends Omit<jk_schema.Field, "onTableRendering"> {
    onTableRendering?: JFieldRenderingRules;
}

export type JCellRenderer = (row: CellContext<any, any>) => React.ReactNode;
export type JCellRendererProvider = (p: JCellRendererParams) => JCellRenderer;

export type JHeaderRenderer = (row: HeaderContext<any, any>) => React.ReactNode;
export type JValueRenderer = (value: React.ReactNode) => React.ReactNode;

export interface JTableLayoutItems {
    table: React.ReactElement;
    filter?: false | React.ReactNode;
    pageSelector?: false | React.ReactNode;
    columnsSelector?: false | React.ReactNode;
    statistics?: false | React.ReactNode;
}

//endregion

//region Actions

export interface JActionItem {
    title?: string;
    onClick?: (data: any) => void;
    separator?: true;
}

export type JActionsProvider = (data: any) => (JActionItem[])|undefined;

//endregion

//region Call params

export interface JCreateColumnsParams extends JTableParams {
}

export interface JColumnHeaderRendererParams {
    fieldId: string;
    field: JFieldWithRenderer;

    canSort?: boolean;
    canEdit?: boolean;

    title: string;

    builderParams: JCreateColumnsParams;

    variants: JTableVariants;
}

export interface JCellRendererParams extends JColumnHeaderRendererParams {}

export interface JColumnSelectorRendererParams {
    table: Table<any>
}

export interface JPageSelectorRendererParams {
    table: Table<any>
}

export interface JStatisticsRendererParams {
    table: Table<any>
}

export interface JTableRenderParams {
    table: Table<any>;
    ifNoContent: React.ReactNode;
}

export interface JFilterRendererParams {
    table: Table<any>;
    filterField?: string;
    placeholder?: string
}

//endregion

//region JTable

export interface JTableParams {
    variants: JTableVariants;
    data: any[];
    schema: jk_schema.Schema;
    children?: React.ReactNode;
    showColumnsSelector?: boolean;

    filterPlaceholder?: string;
    filterField?: string;
    showFilter?: boolean;

    enableEditing?: boolean;
    canSelectColumns?: boolean;

    /**
     * The default currency to use (USD, EURO, ...).
     */
    defaultCurrency?: string;

    /**
     * The default local to use for formating value (fr-FR, en-US, ...).
     */
    defaultLocal?: string;

    /**
     * Allow overriding the rendering information for the columns.
     *
     * Note: type FieldRenderingRules is equivalent to jk_schema.ScOnTableRenderingInfo
     *       but allow directly using a CellRenderer as rendererForCell and rendererForHeader.
     */
    columnsOverride?: Record<string, JFieldRenderingRules>;

    /**
     * Allows adding actions to the table.
     * The provider will evaluate the row and return corresponding actions.
     */
    actions?: JActionsProvider;
}

export interface JTableVariants {
    /**
     * The with of the select row.
     * If not set, the default value is 40px.
     */
    selectRowWidth?: number;

    /**
     * The with of the action row.
     * If not set, the default value is 40px.
     */
    actionRowWidth?: number;

    wrapCellValue: (params: JCellRendererParams) => JValueRenderer;

    createActionCell: (actions: JActionsProvider) => JCellRenderer;

    selectRowsHeaderRenderer: () => JHeaderRenderer|string;
    selectRowsCellRenderer: () => JCellRenderer;

    columnHeaderRenderer: (params: JColumnHeaderRendererParams) => JHeaderRenderer|string;
    cellRenderer: (params: JCellRendererParams) => JCellRenderer;
    //
    cellRenderer_currency?: (params: JCellRendererParams) => JCellRenderer;
    cellRenderer_percent?: (params: JCellRendererParams) => JCellRenderer;
    cellRenderer_decimal?: (params: JCellRendererParams) => JCellRenderer;
    cellRenderer_number?: (params: JCellRendererParams) => JCellRenderer;

    tableRenderer: (params: JTableRenderParams) => React.ReactElement;

    statisticsRenderer: (params: JStatisticsRendererParams) => React.ReactNode;
    pageSelectorRenderer: (params: JPageSelectorRendererParams) => React.ReactNode;
    columnsSelectorRenderer: (params: JColumnSelectorRendererParams) => React.ReactNode;
    filterRenderer: (params: JFilterRendererParams) => React.ReactNode;

    layoutRenderer: (items: JTableLayoutItems) => React.ReactNode;

    [renderer: string]: any;
}

//endregion