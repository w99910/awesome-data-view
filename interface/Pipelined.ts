export default abstract class Pipelined {
    abstract handle(data: Array<object> | object): Array<object> | object;

    abstract toQuery(): string;
}
