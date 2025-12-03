import * as jk_app from "jopi-toolkit/jk_app";
import * as jk_timer from "jopi-toolkit/jk_timer";

const ONE_MINUTE = jk_timer.ONE_MINUTE;
const newInterval = jk_timer.newInterval;

export enum AutomaticStartStopState { Stopped, Starting, Started, Stopping }

export interface AutomaticStartStopManagerParams {
    onStart: (data: any)=>Promise<number>;
    onStop?: (data: any)=>Promise<void>;
}

export class AutomaticStartStop {
    private _state = AutomaticStartStopState.Stopped;
    private lastStartDate: number = 0;

    private readonly startChangeListeners: (() => void)[] = [];

    private readonly onStart: (data: any)=>Promise<number>;
    private readonly onStop?: (data: any)=>Promise<void>;

    public readonly data: any = {};

    constructor(params: AutomaticStartStopManagerParams) {
        this.onStop = params.onStop;
        this.onStart = params.onStart;

        jk_app.onAppExiting(this.stop.bind(this));
    }

    get state() {
        return this._state;
    }

    private waitStateChange(): Promise<void> {
        return new Promise<void>(resolve => {
            this.startChangeListeners.push(resolve);
        });
    }

    private setState(state: AutomaticStartStopState) {
        if (this._state === state) return;
        this._state = state;

        if (this.startChangeListeners) {
            this.startChangeListeners.forEach(l => l());
            this.startChangeListeners.splice(0);
        }
    }

    async start() {
        if (this.state===AutomaticStartStopState.Started) {
            return;
        }

        if (this.state===AutomaticStartStopState.Starting) {
            await this.waitStateChange();
            return;
        }

        if (this.state===AutomaticStartStopState.Stopping) {
            await this.waitStateChange();
        }

        // If we are here, then it's in the state "stopped".
        // But since it's async, state can have changed since.
        //
        if (this.state===AutomaticStartStopState.Stopped) {
            this.setState(AutomaticStartStopState.Starting);
            let toWait = await this.onStart(this.data);

            this.lastStartDate = Date.now();
            this.startTimer(toWait);

            this.setState(AutomaticStartStopState.Started);
        }
    }

    async stop() {
        if (this.state===AutomaticStartStopState.Stopped) {
            return;
        }

        if (this.state===AutomaticStartStopState.Stopping) {
            await this.waitStateChange();
            return;
        }

        if (this.state===AutomaticStartStopState.Starting) {
            await this.waitStateChange();
        }

        // If we are here, then it's in the state "started".
        // But since it's async, state can have changed since.
        //
        if (this.state===AutomaticStartStopState.Started) {
            this.setState(AutomaticStartStopState.Stopping);

            if (this.onStop) {
                await this.onStop(this.data);
            }

            this.setState(AutomaticStartStopState.Stopped);
        }
    }

    private startTimer(toWait_ms: number) {
        const onTimer = async () => {
            switch (this.state) {
                case AutomaticStartStopState.Starting:
                    return true;
                case AutomaticStartStopState.Stopping:
                case AutomaticStartStopState.Stopped:
                    // false: stop the timer.
                    return false;
            }

            let timeDiff = Date.now() - this.lastStartDate;

            if (timeDiff>toWait_ms) {
                await this.stop();
                // false: stop the timer.
                return false;
            }

            return true;
        }

        newInterval(ONE_MINUTE, onTimer);
    }
}