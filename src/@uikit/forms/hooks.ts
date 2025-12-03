import React, {useContext, useEffect} from "react";
import type {JMessage, JFieldController, JFormController} from "./interfaces.ts";
import {FormContext, JFormControllerImpl} from "./private.ts";

export function useJForm(): JFormController {
    const theForm = useContext(FormContext) as JFormControllerImpl;
    if (!theForm) throw new Error("useJForm must be used within a JForm component.");

    const [_, setCounter] = React.useState(0);

    useEffect(() => {
        function eventHandler() {
            // Here use prevCount to always have the update counter value.
            setCounter(prevCount => prevCount+1);
        }

        theForm.addStateChangeListener(eventHandler);
        return () => { theForm.removeStateChangeListener(eventHandler) };
    }, []);

    return theForm;
}

export function UseJFormMessage(): JMessage|undefined {
    let form = useJForm();
    return form.formMessage
}

export function useJFormField(name: string): JFieldController {
    const [_, setCounter] = React.useState(0);
    const form = useJForm() as JFormControllerImpl;

    let thisField = form.getField(name);
    if (!thisField) return undefined as unknown as JFieldController;

    thisField.onStateChange = () => { setCounter(prev => prev + 1) };
    return thisField;
}