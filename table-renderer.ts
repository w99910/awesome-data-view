import { getEventListeners } from "events";
import hexToRGBA from "./helpers/hexToRGB";
import { NotFoundIllustration } from "./helpers/icons";
import PaleColor from "./helpers/PaleColor";

const defaultPadding = "10px";
type theme = {
    table: {
        background?: string;
        color?: string;
        border?: string;
        fontFamily?: string;
        borderCollapse?: string;
        borderSpacing?: string;
        [key: string]: any;
    };
    header: {
        background: string;
        color: string;
        padding: string;
        border: string;
        [key: string]: any;
    };
    cell: {
        background: string;
        color: string;
        padding: string;
        border: string;
        [key: string]: any;
    };
};

const defaultTheme: theme = {
    table: {
        background: "transparent",
        color: "inherit",
        border: "none",
        borderCollapse: "separate",
        borderSpacing: "0px",
        fontFamily: "inherit",
    },
    header: {
        background: "transparent",
        color: "inherit",
        padding: defaultPadding,
        border: "0.5px solid #000",
    },
    cell: {
        background: "transparent",
        color: "inherit",
        padding: defaultPadding,
        border: "0.5px solid #000",
    },
};

const lightTheme: theme = {
    table: {
        background: "white",
        color: "black",
        border: "none",
        fontFamily: "inherit",
        borderCollapse: "separate",
        borderSpacing: "1px",
    },
    header: {
        background: "#ffffff",
        color: "#000",
        padding: defaultPadding,
        border: "0.5px solid #000",
    },
    cell: {
        background: "#ffffff",
        color: "#000",
        padding: defaultPadding,
        border: "0.5px solid #000",
    },
};

const darkTheme: theme = {
    table: {
        background: "#ffffff",
        color: "black",
        border: "none",
        fontFamily: "inherit",
        borderCollapse: "separate",
        borderSpacing: "1px",
    },
    header: {
        background: "#111111",
        color: "#f2f2f2",
        padding: defaultPadding,
        border: "0.5px solid #000",
    },
    cell: {
        background: "#111111",
        color: "#f2f2f2",
        padding: defaultPadding,
        border: "0.5px solid #f2f2f2",
    },
};

export default class TableRenderer {
    public table: HTMLTableElement;

    protected tbody: HTMLElement;

    protected container: HTMLElement;

    public theme: theme;

    protected headers: Array<string | HTMLElement>;

    protected _options = {
        expandable: true,
        shouldGraySomeRows: true,
        shouldFitContainer: true,
    };

    protected listeners: {
        onClickRow?: Function;
        onClickCell?: Function;
        onClickHeader?: Function;
    } = {};

    protected constructor() {
        this.theme = defaultTheme;
    }

    onClickRow(fn: Function) {
        this.listeners.onClickRow = fn;
        return this;
    }

    onClickCell(fn: Function) {
        this.listeners.onClickCell = fn;
        return this;
    }

    onClickHeader(fn: Function) {
        this.listeners.onClickHeader = fn;
        return this;
    }

    static container(container: HTMLElement) {
        let instance = new TableRenderer();
        instance.container = container;
        return instance;
    }

    lightTheme() {
        this.theme = lightTheme;
        return this;
    }

    darkTheme() {
        this.theme = darkTheme;
        return this;
    }

    customTheme(theme: theme) {
        if (theme.cell) {
            Object.keys(theme.cell).forEach((attribute) => {
                this.theme.cell[attribute] = theme.cell[attribute];
            });
        }

        if (theme.table) {
            Object.keys(theme.table).forEach((attribute) => {
                this.theme.table[attribute] = theme.table[attribute];
            });
        }

        if (theme.header) {
            Object.keys(theme.header).forEach((attribute) => {
                this.theme.header[attribute] = theme.header[attribute];
            });
        }

        return this;
    }

    render(data: object | Array<object>, headers: Array<string | HTMLElement>) {
        let div = document.createElement("div");
        if (this._options.shouldFitContainer) {
            let { width, height } = this.container.getBoundingClientRect();
            if (width !== 0) {
                div.style.width =
                    this.container.getBoundingClientRect().width + "px";
            }
            div.style.overflow = "auto";
            div.style.position = "relative";
        }

        this.table = document.createElement("table");
        // this.table.style.borderCollapse = 'collapse'
        Object.keys(this.theme.table).forEach((style) => {
            this.table.style[style] = this.theme.table[style];
        });
        this.headers = headers;
        if (!headers) {
            this.headers = this.getHeadersFromData(data);
        }

        this.renderHeaders(this.headers);

        this.tbody = document.createElement("tbody");
        this.table.appendChild(this.tbody);

        this.renderData(data, this.headers);

        div.appendChild(this.table);
        this.container.appendChild(div);
        return this;
    }

    protected getHeadersFromData(data: object | Array<object>) {
        if (data instanceof Array) {
            return data.length !== 0 ? Object.keys(data[0]) : [];
        }
        return this.getHeadersFromData(data[Object.keys(data)[0]]);
    }

    protected renderData(
        data: object | Array<object>,
        headers: Array<string | HTMLElement>
    ) {
        if (data instanceof Array) {
            data.forEach((datum, i) => {
                this.renderRow(datum, i, i % 2 === 0, i === data.length - 1);
            });
        } else {
            Object.keys(data).forEach((name) => {
                this.renderRowHeader(name, headers.length);
                this.renderData(data[name], headers);
            });
        }
    }

    protected renderHeaders(headers: Array<string | HTMLElement> = []) {
        let tr = document.createElement("tr");
        tr.style.position = "sticky";
        tr.style.top = "0";
        let onClickHeader = this.listeners.onClickHeader;

        if (this._options.expandable) {
            let th = document.createElement("th");
            Object.keys(this.theme.header).forEach((attribute) => {
                th.style[attribute] = this.theme.header[attribute];
            });
            tr.appendChild(th);
        }

        headers.forEach((header) => {
            let th = document.createElement("th");
            th.style.textTransform = "capitalize";
            Object.keys(this.theme.header).forEach((attribute) => {
                th.style[attribute] = this.theme.header[attribute];
            });

            if (header instanceof HTMLElement) {
                th.appendChild(header);
            } else {
                th.innerText = header;
            }

            th.addEventListener("click", () => {
                if (onClickHeader) onClickHeader(th, header, headers);
            });
            // th.style.position = 'sticky';
            // th.style.top = '0'
            tr.appendChild(th);
        });
        this.table.appendChild(tr);
    }

    protected renderRowHeader(header: string | HTMLElement, colspan: number) {
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        td.style.fontStyle = "italic";
        td.style.fontWeight = "600";
        td.colSpan = colspan;
        if (this._options.expandable) {
            td.colSpan += 1;
        }
        if (header instanceof HTMLElement) {
            td.appendChild(header);
        } else {
            td.innerText = header;
        }
        Object.keys(this.theme.cell).forEach((attribute) => {
            td.style[attribute] = this.theme.cell[attribute];
        });
        tr.appendChild(td);
        this.tbody.appendChild(tr);
    }

    protected renderRow(
        row: object,
        index: number,
        shouldReduceOpacity = false,
        isLastIndex = false,
    ) {
        let tr = document.createElement("tr");
        tr.setAttribute('data-index', index.toString())
        let onClickCell = this.listeners.onClickCell;
        let onClickRow = this.listeners.onClickRow;

        let addTd = (value) => {
            let td = document.createElement("td");
            Object.keys(this.theme.cell).forEach((attribute) => {
                td.style[attribute] = this.theme.cell[attribute];
            });
            if (shouldReduceOpacity) {
                const currentColor = PaleColor(
                    hexToRGBA(this.theme.cell.background, 1),
                    0.05
                );
                td.style.setProperty("background", currentColor);
            }
            if (typeof value === "object" && value?.raw) {
                value = value.raw;
            }

            if (/http(s)?:\/\/(\w+)/i.test(value)) {
                value = `<a href="${value}" style="color: #abc4ff;" target="_blank">${value}</a>`
            }

            if (!value) {
                value = 'NA'
            }

            if (value instanceof HTMLElement) {
                td.appendChild(value.cloneNode(true));
            } else if (value instanceof Function) {
                let output = value(row, index, shouldReduceOpacity, isLastIndex);
                if (output instanceof HTMLElement) {
                    td.appendChild(output);
                } else {
                    td.innerHTML = output ?? 'NA';
                }
            } else {
                td.innerHTML = value ?? 'NA';

            }
            return td;
        };

        if (onClickRow) {
            onClickRow(tr, row, this);
        }

        if (this._options.expandable) {
            let td = document.createElement("td");
            Object.keys(this.theme.cell).forEach((attribute) => {
                td.style[attribute] = this.theme.cell[attribute];
            });
            if (shouldReduceOpacity) {
                const currentColor = PaleColor(
                    hexToRGBA(this.theme.cell.background, 1),
                    0.05
                );
                td.style.setProperty("background", currentColor);
            }
            let button = document.createElement("button");
            let openIcon = `<svg style="width: 16px; color: #5bfd80" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>`;
            let closeIcon = `<svg style="width: 16px; color: #f85a5a" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"><path d="M5 12h14"/></svg>`;
            let isOpen = false;
            let tableRow: HTMLElement | null = null;

            let createTable = () => {
                tableRow = document.createElement("tr");
                let td = document.createElement("td");
                td.colSpan = this.headers.length + 1;
                let table = document.createElement("table");
                table.style.width = "100%";
                Object.keys(row).forEach((attribute) => {
                    let tr = document.createElement("tr");
                    tr.appendChild(addTd(attribute));
                    tr.appendChild(addTd(row[attribute]));
                    table.appendChild(tr);
                });
                td.appendChild(table);
                tableRow.appendChild(td);
                tr.insertAdjacentElement("afterend", tableRow);
            };
            button.addEventListener("click", () => {
                isOpen = !isOpen;
                if (isOpen) {
                    button.innerHTML = closeIcon;
                    createTable();
                } else {
                    tableRow?.remove();
                    button.innerHTML = openIcon;
                }
            });
            button.innerHTML = openIcon;
            td.appendChild(button);
            tr.appendChild(td);
        }

        Object.keys(row).forEach((attribute) => {
            let td = document.createElement("td");
            Object.keys(this.theme.cell).forEach((attribute) => {
                td.style[attribute] = this.theme.cell[attribute];
            });
            if (shouldReduceOpacity) {
                const currentColor = PaleColor(
                    hexToRGBA(this.theme.cell.background, 1),
                    0.05
                );
                td.style.setProperty("background", currentColor);
            }
            if (isLastIndex) {
                td.style.borderBottom = "none";
            }
            let v = row[attribute] ?? 'NA';
            let title = v;
            let display = v;
            if (typeof v === "object" && v) {
                if (v.display) {
                    display = v.display;
                }

                if (v.raw) {
                    title = v.raw;

                    if (/http(s)?:\/\/(\w+)/i.test(display)) {
                        display = `<a href="${v.raw}" style="color: #abc4ff;" target="_blank">${display}</a>`
                    }
                }
            }

            if (typeof title === "string") {
                td.title = title;
            }

            if (display instanceof HTMLElement) {
                td.appendChild(display.cloneNode(true));
            } else if (display instanceof Function) {
                let output = display(row, index, shouldReduceOpacity, isLastIndex);
                if (output instanceof HTMLElement) {
                    td.appendChild(output);
                } else {
                    td.innerHTML = output ?? 'NA';
                }
            } else {
                td.innerHTML = display ?? 'NA';

            }

            td.addEventListener("click", () => {
                if (onClickCell)
                    onClickCell(td, row[attribute], row, attribute);
            });

            tr.appendChild(td);
        });
        this.tbody.appendChild(tr);
    }

    showEmptyIndicator() {
        let tr = document.createElement("tr");
        let td = document.createElement("td");
        Object.keys(this.theme.cell).forEach((attribute) => {
            td.style[attribute] = this.theme.cell[attribute];
        });

        td.colSpan = this.headers.length;

        if (this._options.expandable) {
            td.colSpan += 1;
        }

        let tableRect = this.table.getBoundingClientRect();
        td.style.height =
            tableRect.height > 0 ? tableRect.height + "px" : "100%";
        td.style.width = tableRect.width > 0 ? tableRect.width + "px" : "100%";
        td.style.padding = "10px";
        td.innerHTML = `${NotFoundIllustration}`;
        tr.appendChild(td);
        this.tbody.appendChild(tr);
    }

    updateRows(rows: object | Array<object>) {
        this.tbody.innerHTML = "";
        if (rows instanceof Array && rows.length === 0) {
            this.showEmptyIndicator();
            return;
        }
        this.renderData(rows, this.headers);
    }
}
