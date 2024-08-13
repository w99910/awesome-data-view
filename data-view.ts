import { reactive, toRaw } from "vue";
import { Pipelined } from "./interface/Pipelined";
import TableRenderer from "./table-renderer";

export default class DataView {
    protected _data: Array<object> | object;
    protected _server: {
        endpoint: null | string;
        options: {
            method: string;
            headers: {
                [key: string]: any;
            };
        };
    } = {
        endpoint: null,
        options: {
            method: "GET",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                "Accept" : "application/json",
            },
        },
    };
    protected _columns: Array<object>;
    protected _pipelines: Array<Pipelined> = [];
    protected _options = {
        worker: false,
        compression: false,
    };

    constructor() {
        this._data = reactive([]);
        this._columns = reactive([]);
    }

    endpoint(endpoint: string, options = null) {
        if (!/^https?:\/\/(www.)?(\w+)\.(\w+)/.test(endpoint)) {
            throw new Error("Endpoint should be url");
        }
        this._server.endpoint = endpoint;
        if (options) {
            this._server.options = options;
        }
        return this;
    }

    data(data: Array<object>) {
        this._data = reactive(data);
        return this;
    }

    pipeline(pipeline: Pipelined) {
        this._pipelines.push(pipeline);
        return this;
    }

    pipelines(pipelines: Array<Pipelined>) {
        this._pipelines = pipelines;
        return this;
    }

    enableOptimization(
        options = {
            compression: false,
        }
    ) {
        this._options.worker = true;
        this._options.compression = options.compression;
    }

    export(data) {}

    protected processData() {
        let data = toRaw(this._data);
        this._pipelines.forEach((pipeline) => {
            data = pipeline.handle(data);
        });
        return data;
    }

    protected async handleServerSide() {
        let query = this._server.endpoint + "?";
        this._pipelines.forEach((pipeline, i) => {
            let params = pipeline.toQuery();

            if(!params){
                return;
            }

            query += params;

            if (i !== this._pipelines.length - 1) {
                query += "&";
            }
        });
        console.log(query)
        // try {
        //     const response = await fetch(query, this._server.options);
        //     if (!response.ok) {
        //         throw new Error(`HTTP error! status: ${response.status}`);
        //     }
        //     return response.json(); // Or text() for plain text
        // } catch (error) {
        //     console.error("Fetch Error:", error);
        //     throw error; // Rethrow for error handling elsewhere
        // }
    }

    async process() {
        if (this._server.endpoint) {
            return await this.handleServerSide();
        }

        return this.processData();
    }

    render(container: HTMLElement) {
        // return TableRenderer.container(container).lightTheme().render(this.process());
    }
}
