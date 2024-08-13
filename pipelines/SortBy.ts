import {Pipelined} from "../interface/Pipelined";
import PopupButton from "../helpers/PopupButton";

export default class SortBy implements Pipelined {
    protected sortByColumn: null | string = null;

    protected isDescending: boolean = false;

    render(
        options: Array<string>,
        onClick: Function,
        buttonStyle = {
            background: "transparent",
            color: "#000",
            border: "1px solid #323232",
        },
        popupStyle = {
            background: "white",
            color: "#000",
            border: "1px solid #323232",
        }
    ) {
        let { button, toggleVisibility, placeholder, div } = PopupButton(
            buttonStyle,
            popupStyle
        );

        let descendingIcon = `<svg style="width: 16px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-down-wide-narrow"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="M11 4h10"/><path d="M11 8h7"/><path d="M11 12h4"/></svg>`;
        let ascendingIcon = `<svg style="width: 16px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-wide-narrow"><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/><path d="M11 12h10"/><path d="M11 16h7"/><path d="M11 20h4"/></svg>`;
        placeholder.innerHTML = `${
            this.isDescending ? descendingIcon : ascendingIcon
        } Sort By: <b>${this.sortByColumn ?? "None"}</b>`;

        options.forEach((option, i) => {
            let btn = document.createElement("button");
            btn.innerText = option;
            btn.className = "px-8 py-3 hover:opacity-80";
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleVisibility();
                onClick(option, i);
                placeholder.innerHTML = `${
                    this.isDescending ? descendingIcon : ascendingIcon
                } Sort By: <b>${this.sortByColumn ?? "None"}</b>`;
            });
            if (i !== options.length - 1) {
                btn.classList.add("border-b");
            }
            div.appendChild(btn);
        });

        return button;
    }

    column(name: string) {
        this.isDescending =
            name === this.sortByColumn ? !this.isDescending : false;
        this.sortByColumn = name;
        return this;
    }

    handle(data: Array<object> | object): Array<object> | object {
        if (!this.sortByColumn) {
            return data;
        }
        let order = this.isDescending ? -1 : 1;
        let orderFn = (itemA: object, itemB: object) =>
            itemA[this.sortByColumn!] >= itemB[this.sortByColumn!]
                ? order
                : -1 * order;
        if (data instanceof Array) {
            return data.sort(orderFn);
        }

        Object.keys(data).forEach((key) => {
            let values = data[key];
            if (!values.sort) {
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
