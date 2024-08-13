import Pipelined from "../interface/Pipelined";

type truncate = {
    column: string,
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

    handle(data: Array<object> | object): Array<object> | object {
        if (this._limitations.length === 0) {
            return data;
        }
        if (data instanceof Array) {
            return data.map((datum) => {
                this._limitations.forEach((_limitation) => {
                    if (
                        !datum.hasOwnProperty(_limitation.column) ||
                        typeof datum[_limitation.column] !== "string"
                    ) {
                        return;
                    }
                    let value = datum[_limitation.column].toString();
                    let truncatedValue =
                        value.length > _limitation.limit
                            ? value.substring(
                                0,
                                Math.min(value.length, _limitation.limit)
                            ) + _limitation.postfix
                            : value;
                    datum[_limitation.column] = {
                        raw: value,
                        display: truncatedValue,
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
        return "";
    }
}
