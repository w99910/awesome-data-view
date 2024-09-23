import Pipelined from "../interface/Pipelined";

type truncate = {
    column?: string | null,
    limit: number,
    postfix?: string,
}

export default class TruncateCell implements Pipelined {
    protected _limitations: Array<truncate> = [];

    column(column: string, limit: number, postfix = "...") {
        this._limitations = this._limitations.filter(
            (_limitation) => _limitation.column !== column
        );
        this._limitations.push({
            column: column,
            limit: limit,
            postfix: postfix,
        });
        return this;
    }

    all(limit: number, postfix = '...') {
        this._limitations = [{
            column: null,
            limit: limit,
            postfix: postfix,
        }]
        return this;
    }

    handle(data: Array<object> | object): Array<object> | object {
        if (this._limitations.length === 0) {
            return data;
        }

        let getTruncatedValue = (data: object, column: string, limit: number, postfix: string) => {
            let value = data[column];

            if (!isNaN(parseFloat(value))) {
                return value;
            }

            return value.length > limit
                ? value.substring(
                    0,
                    Math.min(value.length, limit)
                ) + postfix
                : value;
        }

        if (data instanceof Array) {
            return data.map((datum) => {
                this._limitations.forEach((_limitation) => {
                    if (!_limitation.column && _limitation.limit) {
                        Object.keys(datum).forEach((column) => {
                            let value = datum[column];
                            if (!value || typeof value === 'object') return;
                            datum[column] = {
                                raw: value,
                                display: getTruncatedValue(datum, column, _limitation.limit, _limitation.postfix ?? '...')
                            }
                        });
                        return;
                    }
                    if (
                        !_limitation.column ||
                        !datum.hasOwnProperty(_limitation.column) ||
                        typeof datum[_limitation.column] !== "string"
                    ) {
                        return;
                    }
                    let value = datum[_limitation.column].toString();
                    datum[_limitation.column] = {
                        raw: value,
                        display: getTruncatedValue(datum, _limitation.column, _limitation.limit, _limitation.postfix ?? '...'),
                    };
                });
                return datum;
            });
        }

        Object.keys(data).forEach((key) => {
            let values = data[key];
            if (!values.forEach) {
                return;
            }
            data[key] = this.handle(values);
        });

        return data;
    }

    toQuery() {
        return {};
    }
}
