declare module 'imjoy-core' {
    // Specify the module's exports here
    export class ImJoy {
        constructor(imjoy_api: any);
        start(): Promise<void>;
    }

}
