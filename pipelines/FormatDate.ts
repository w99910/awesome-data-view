import Pipelined from "../interface/Pipelined";

type DateColumn = {
    column: string,
    renderer?: Function,
}

export default class FormatDate implements Pipelined {
    protected dateColumns: Array<DateColumn> = [];

    column(column: string, renderer?: Function) {
        // Overwrite existing column settings
        this.dateColumns = this.dateColumns.filter(
            (col) => col.column !== column
        );
        this.dateColumns.push({
            column: column,
            renderer: renderer
        });
        return this;
    }

    handle(data: Array<object> | object): Array<object> | object {
        if (this.dateColumns.length === 0) {
            return data;
        }

        let _formatDate = (data: object, column: string, renderer?: Function) => {
            let raw = data[column];
            if (!raw) return [raw, null];

            let value = raw;
            if (value.raw) {
                value = value.raw;
            }

            value = new Date(value);

            if (isNaN(value.getTime())) return [data[column], null];

            return [raw, renderer ? renderer(value) : value.toLocaleString()];
        }

        if (data instanceof Array) {
            return data.map((datum) => {
                this.dateColumns.forEach((dateColumn) => {
                    let [raw, formattedValue] = _formatDate(datum, dateColumn.column, dateColumn.renderer);
                    if (!formattedValue) return;
                    datum[dateColumn.column] = {
                        raw: raw,
                        display: formattedValue,
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
