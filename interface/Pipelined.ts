export interface Pipelined {
    handle(data: Array<object> | object): Array<object> | object;

    toQuery(): string;
}
