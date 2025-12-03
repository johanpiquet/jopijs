import React from "react";
import * as jk_schema from "jopi-toolkit/jk_schema";
import type {
    JMessage,
    JFieldController,
    JFormComponentProps,
    JFormController,
    SubmitFunction
} from "./interfaces.ts";
import type {ValidationErrors} from "jopi-toolkit/jk_schema";
import {sendFormData, sendJsonData} from "../helpers/tools.ts";

type Listener = () => void;

export const FormContext = React.createContext<JFormController>(undefined as unknown as JFormController);

interface JFieldController_Private extends JFieldController {
    onStateChange?: () => void;
}

export class JFormControllerImpl implements JFormController {
    private readonly fields: Record<string, JFieldController_Private> = {};
    private readonly jsonSchema: jk_schema.SchemaDescriptor;
    private readonly onStateChange: Listener[] = [];
    private readonly submitHandler?: SubmitFunction;
    private autoRevalidate = false;
    private hasFiles = false;

    error = false;
    submitting = false;
    submitted = false;
    formMessage?: JMessage;
    
    constructor(private props: JFormComponentProps, private readonly formRef: React.RefObject<HTMLFormElement|null>) {
        this.jsonSchema = jk_schema.toJson(this.props.schema).desc;
        this.submitHandler = props.submit;
    }

    getData<T = any>(): T {
        let data: any = {};

        for (let name in this.fields) {
            let field = this.fields[name];
            data[name] = field.valueConverter(field.value, false);
        }

        return data as T;
    }
    
    getFormData(): FormData {
        let form = this.formRef.current!;
        let formData = new FormData(form);

        let data = this.getData();

        // Values can have been updated by a normalization step.
        // It's why we inject back the values.
        //
        for (let name in this.fields) {
            let field = this.fields[name];
            let value = data[name];

            // Special case for files.
            //
            if (field.type === "file") {
                if (field.value instanceof File) {
                    formData.set(name, field.value);
                } else if (field.value instanceof Array) {
                    // Remove the current value.
                    formData.delete(name);

                    // Add each one file of the array.
                    for (let i = 0; i < field.value.length; i++) {
                        formData.append(name, field.value[i]);
                    }
                }
            } else {
                if (value !== undefined && value !== null) {
                    formData.set(name, String(value));
                }
            }
        }

        return formData;
    }

    getSubmitUrl(): string {
        return this.props.action || window.location.href
    }

    async sendJsonData(url?: string): Promise<JMessage> {
        if (!url) url = this.getSubmitUrl();
        return this.processSendToServerResponse(await sendJsonData(url, this.getData()));
    }

    async sendFormData(url?: string): Promise<JMessage> {
        if (!url) url = this.getSubmitUrl();
        return this.processSendToServerResponse(await sendFormData(url, this.getFormData()));
    }

    private processSendToServerResponse(response: Response): JMessage {
        if (response.status === 200) {
            return {isOk: true, isSubmitted: true};
        }

        return {
            isOk: false,
            isSubmitted: false,
            message: response.status===500
                ? "An error occurred with the server. Please try again later."
                : "Invalid form content.",

            code: response.status === 500
                ? "SERVER_ERROR_500"
                : "SERVER_INVALID_DATA"
        };
    }

    private setFormMessage(message: JMessage): JMessage {
        this.formMessage = message;

        if (!message.message && message.fieldErrors && message.fieldErrors.globalError) {
            message.message = message.fieldErrors.globalError;
            message.code = "GLOBAL_ERROR";
        }

        if (message.isSubmitted) {
            this.declareState_Submitted();
        } else {
            if (message.isOk) {
                this.declareState_Reset();
            }
            else {
                this.submitted = false;
                this.submitting = false;
                this.declareState_Error()
            }
        }

        return message;
    }

    async submit(): Promise<JMessage|undefined> {
        this.autoRevalidate = true;
        let data = this.getData();
        let fieldErrors = this.validateAux(data);

        if (fieldErrors) {
            return this.setFormMessage({isOk: false, isSubmitted: false, fieldErrors});
        }

        this.autoRevalidate = false;

        let submitHandler = this.submitHandler;
        if (!submitHandler) submitHandler = () => this.sendFormData()

        this.declareState_Submitting();

        try {
            let r = submitHandler({data, form: this, hasFiles: this.hasFiles});

            if (r instanceof Promise) r = await r;
            if (r) return this.setFormMessage(r);
        } catch (e) {
            console.error("Error when submitting form:", e);

            return this.setFormMessage({
                isOk: false,
                isSubmitted: false,
                message: "An error occurred when submitting form",
                code: "UNKNOWN_SUBMIT_ERROR"
            });
        }

        return this.setFormMessage({isOk: true, isSubmitted: true});
    }

    validate(): ValidationErrors | undefined {
        let errors = this.validateAux(this.getData());

        if (errors) {
            this.setFormMessage({isOk: false, isSubmitted: false, fieldErrors: errors});
        } else {
            this.declareState_Reset();
        }

        return errors;
    }

    private validateAux(data: any): ValidationErrors | undefined {
        for (let field of Object.values(this.fields)) {
            field.error = false;
            field.errorMessage = undefined;
        }

        const errors = jk_schema.validateSchema(data, this.props.schema);

        if (errors) {
            if (errors.fields) {
                for (let fieldError of Object.values(errors.fields)) {
                    let fieldRef = this.getField(fieldError.fieldName);

                    if (fieldRef) {
                        fieldRef.error = true;
                        fieldRef.errorMessage = fieldError.message;
                    }
                }
            }
        }

        for (let field of Object.values(this.fields)) {
            field.onStateChange?.();
        }

        return errors;
    }

    getField(name: string): JFieldController_Private|undefined {
        let field: JFieldController_Private = this.fields[name];
        if (field) return field;

        const fieldDef = this.jsonSchema[name];
        if (!fieldDef) return undefined;

        const form = this;
        const valueConverter = selectValueConverter(fieldDef.type);
        
        if (fieldDef.type==="file") {
            this.hasFiles = true;
        }

        this.fields[name] = field = {
            form: this,
            variantName: getVariantName(fieldDef.type),

            name: name,
            error: false,

            valueConverter,
            value: fieldDef && fieldDef.default ? fieldDef.default : calcDefault(fieldDef),

            oldValue: undefined,

            onChange: (value: any) => {
                if (value!==undefined) value = valueConverter(value, true);
                if (value===field.value) return;

                field.oldValue = field.value;
                field.value = value;

                if (form.autoRevalidate) form.validate();
                else if (field.onStateChange) field.onStateChange();
            },

            ...fieldDef
        } as JFieldController_Private;

        return field;
    }

    private declareState_Submitting() {
        this.submitting = true;
        this.submitted = false;
        this.error = false;

        this.onStateChange.forEach(l => l());
    }

    private declareState_Submitted() {
        this.submitting = false;
        this.submitted = true;
        this.error = false;

        this.onStateChange.forEach(l => l());
    }

    private declareState_Error(isError = true) {
        // Here we must keep the submitted state.
        this.error = isError;

        if (!isError) {
            if (this.formMessage && !this.formMessage.isOk) {
                this.formMessage = undefined;
            }
        }

        this.onStateChange.forEach(l => l());
    }

    private declareState_Reset() {
        this.submitting = false;
        this.submitted = false;
        this.declareState_Error(false);
    }

    addStateChangeListener(l: () => void) {
        if (!this.onStateChange.includes(l)) {
            this.onStateChange.push(l);
        }
    }

    removeStateChangeListener(l: () => void) {
        let idx = this.onStateChange.indexOf(l);
        if (idx!==-1) this.onStateChange.splice(idx, 1);
    }
}

function calcDefault(fieldDef: jk_schema.SchemaFieldInfos|undefined): any {
    if (!fieldDef) return undefined;

    if (fieldDef.type === "string") return "";
    if (fieldDef.type === "number") return undefined;
    if (fieldDef.type === "boolean") return false;
    if (fieldDef.type === "object") return {};
    if (fieldDef.type === "array") return [];
    return undefined;
}

function getVariantName(fieldType: string): string {
    switch (fieldType) {
        case "string": return "TextFormField";
        case "number": return "NumberFormField";
        case "boolean": return "CheckboxFormField";
        case "file": return "FileSelectField";
    }

    return "TextFormField";
}

function selectValueConverter(fieldType: string): ((v: any, isTyping: boolean) => any) {
    switch (fieldType) {
        case "string": return (v: any) => {
            return String(v);
        }

        case "number": return (v: any, isTyping: boolean) => {
            if (!isTyping) {
                if (v===undefined) return undefined;
                v = String(v).trim().replaceAll(",", ".");
                if (v === "") return undefined;
            }
            else {
                v = String(v).trim().replaceAll(",", ".");
            }

            let asNumber = Number(v);

            // Must avoid blocking if doing something like "+5,3"

            // Let it return a string.
            // Will send an error of the type "number is required".
            //
            if (isNaN(asNumber)) return v;

            if (v==="") return undefined;
            return asNumber;
        }

        case "boolean":  return (v: any) => {
            return Boolean(v);
        }
    }

    return (v: any) => v;
}
