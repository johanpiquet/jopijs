import type {UiText} from "../helpers/tools";
import {type Schema, type ValidationErrors} from "jopi-toolkit/jk_schema";
import React from "react";

//region Core

export type SubmitFunction = (params: { data: any, form: JFormController, hasFiles: boolean })
                              => Promise<JMessage|undefined|void> | JMessage | undefined | void;

export interface JFormComponentProps {
    schema: Schema;
    action?: string;
    submit?: SubmitFunction
}

export interface JFieldController {
    form: JFormController;
    variantName: string;

    name: string;
    type: string;

    error: boolean;
    errorMessage?: string;

    title?: string;
    description?: string;
    placeholder?: string;

    value: any;
    oldValue: any;
    onChange: (value: any) => void;
    valueConverter: (value: any, isTyping: boolean) => any;

    //region Type String

    minLength?: number;
    errorMessage_minLength?: string;

    maxLength?: number;
    errorMessage_maxLength?: string;

    //endregion

    //region Type Number

    minValue?: number;
    errorMessage_minValue?: string;

    maxValue?: number;
    errorMessage_maxValue?: string;

    allowDecimal?: boolean;
    roundMethod?: "round" | "floor" | "ceil";
    errorMessage_dontAllowDecimal?: string;

    incrStep?: number;

    //endregion

    //region Type File

    maxFileCount?: number;
    errorMessage_maxFileCount?: string;

    acceptFileType?: string;
    errorMessage_invalidFileType?: string;

    maxFileSize?: number;
    errorMessage_maxFileSize?: string;

    //endregion

    //region Type Boolean

    requireTrue?: boolean;
    errorMessage_requireTrue?: string;

    requireFalse?: boolean;
    errorMessage_requireFalse?: string;

    //endregion
}

export interface JFormController {
    error: boolean;
    submitting: boolean;
    submitted: boolean;
    formMessage?: JMessage;

    getData<T = any>(): T;
    getFormData(): FormData;
    getSubmitUrl(): string;

    sendFormData(url?: string): Promise<JMessage>;
    sendJsonData(url?: string): Promise<JMessage>;
}

export interface JMessage {
    isOk: boolean;
    isSubmitted: boolean;

    message?: string;
    code?: string;

    fieldErrors?: ValidationErrors;
}

//endregion

//region By type

export interface JFieldProps {
    name: string;
    title?: UiText;
    description?: UiText;
    placeholder?: string;

    variant?: React.FC<unknown>;

    id?: string;
    className?: string;
}

export interface JFormMessageProps {
    id?: string;
    className?: string;
    variant?: React.FC<unknown>;
    isBefore?: boolean;
    message?: JMessage;

    errorMessage?: UiText;

    // false: allows hiding the submitted message.
    submittedMessage?: UiText|false;

    // false: allows hiding the message if field errors.
    fieldErrorMessage?: UiText|false;
}

export interface JTextFormFieldProps extends JFieldProps {
}

export interface JNumberFormFieldProps extends JFieldProps {
}

export interface JCheckboxFormFieldProps extends JFieldProps {
    defaultChecked?: boolean;
}

export interface JFileSelectFieldProps extends JFieldProps {
}

export interface JNumberFormFieldProps extends JFieldProps {
    minValue?: number;
    maxValue?: number;
    incrStep?: number;
}

export interface JAutoFormFieldProps extends
    JTextFormFieldProps,
    JNumberFormFieldProps,
    JFileSelectFieldProps,
    JCheckboxFormFieldProps {
}

//endregion

export interface JFormVariants {
    FormMessage(p: JFormMessageProps): React.ReactElement|null;

    TextFormField(p: JTextFormFieldProps): React.ReactElement;
    CheckboxFormField(p: JCheckboxFormFieldProps): React.ReactElement;
    NumberFormField(p: JNumberFormFieldProps): React.ReactElement;
    FileSelectField(p: JFileSelectFieldProps): React.ReactElement;
}