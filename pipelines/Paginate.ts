import {Pipelined} from "../interface/Pipelined";
import PopupButton from "../helpers/PopupButton";
import SetStyle from "../helpers/SetStyle";
import PaleColor from "../helpers/PaleColor";
import hexToRGBA from "../helpers/hexToRGB";

export default class Paginate implements Pipelined {
    protected _currentPageIndex: number = 1;

    protected _pageSize: number = 10;

    protected _totalItems: number = 0;

    protected _buttonsLimit: number = 5;

    protected _onChange: null | Function = null;

    protected buttonsDiv: HTMLDivElement;

    protected buttonStyle: {
        [key: string]: any;
    };

    render(
        totalItems: number,
        buttonStyle = {
            background: "transparent",
            color: "#000",
            border: "1px solid #323232",
        }
    ) {
        this._totalItems = totalItems;

        this.buttonStyle = buttonStyle;
        this.buttonsDiv = document.createElement("div");
        let styles = {
            display: "flex",
            columnGap: "10px",
            alignItems: "center",
        };
        SetStyle(this.buttonsDiv, styles);

        this.buildButtons();
        return this.buttonsDiv;
    }

    protected buildButton(onClick: Function) {
        let button = document.createElement("button");
        button.style.padding = "6px";
        button.style.borderRadius = "4px";

        button.addEventListener("click", (e) => onClick(e));

        SetStyle(button, this.buttonStyle);

        return button;
    }

    protected change() {
        this.buildButtons();
        if (this._onChange) this._onChange(this._currentPageIndex);
    }

    protected buildNumberOfItemsIndicator() {
        let { button, toggleVisibility, placeholder, div } = PopupButton(
            this.buttonStyle,
            {
                border: this.buttonStyle.border,
                background: PaleColor(
                    hexToRGBA(this.buttonStyle.background, 1),
                    0.1
                ),
            }
        );

        placeholder.innerHTML = `${this._pageSize} per page`;

        let itemsPerPage = [5, 10, 20, 30, 40, 50, 100];
        itemsPerPage.forEach((option, i) => {
            let btn = document.createElement("button");
            btn.innerText = option.toString();
            btn.className = "px-8 py-3 hover:opacity-80";
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                e.preventDefault();
                toggleVisibility();
                this._pageSize = option;
                this._currentPageIndex = 1;
                // this._buttonsLimit =
                placeholder.innerHTML = `${this._pageSize} per page`;
                this.buildButtons();
                if (this._onChange) this._onChange(this._currentPageIndex);
            });
            if (i !== itemsPerPage.length - 1) {
                btn.classList.add("border-b");
            }
            div.appendChild(btn);
        });
        return button;
    }

    protected buildButtons() {
        // if (this._buttonsLimit > this._totalItems / this._pageSize) {
        this._buttonsLimit = Math.ceil(this._totalItems / this._pageSize);
        // }
        console.log(this._buttonsLimit);
        let previousButton = this.buildButton(() => {
            this._currentPageIndex = Math.max(1, this._currentPageIndex - 1);
            this.change();
        });
        previousButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-left"><path d="m15 18-6-6 6-6"/></svg>`;
        let nextButton = this.buildButton(() => {
            this._currentPageIndex = Math.min(
                this._totalItems,
                this._currentPageIndex + 1
            );
            this.change();
        });
        nextButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-chevron-right"><path d="m9 18 6-6-6-6"/></svg>`;

        this.buttonsDiv.innerHTML = "";
        // Build number of items per page
        this.buttonsDiv.appendChild(this.buildNumberOfItemsIndicator());

        this.buttonsDiv.appendChild(previousButton);

        // Build page indexes
        let start = Math.max(1, this._currentPageIndex - 2); // Adjust to show 2 previous pages

        const end = Math.min(
            this._buttonsLimit,
            start + this._buttonsLimit - 1
        ); // Limit to totalItems

        if (end - start < this._buttonsLimit) {
            start = end - this._buttonsLimit + 1;
        }

        for (let i = start; i <= end; i++) {
            let btn = this.buildButton(() => {
                this._currentPageIndex = i;
                btn.style.background = PaleColor(
                    hexToRGBA(this.buttonStyle.background, 1),
                    0.05
                );
                this.change();
            });
            btn.innerText = i.toString();
            btn.style.paddingLeft = "16px";
            btn.style.paddingRight = "16px";
            if (i === this._currentPageIndex) {
                btn.style.background = PaleColor(
                    hexToRGBA(this.buttonStyle.background, 1),
                    0.05
                );
            }
            this.buttonsDiv.appendChild(btn);
        }

        this.buttonsDiv.appendChild(nextButton);
    }

    totalItems(size: number) {
        this._totalItems = size;
        return this;
    }

    pageSize(size: number) {
        this._pageSize = size;
        return this;
    }

    buttonsLimit(size: number) {
        this._buttonsLimit = size;
        return this;
    }

    onChange(fn: Function) {
        this._onChange = fn;
        return this;
    }

    update() {
        this._currentPageIndex = 1;
        this.buildButtons();
        return this;
    }

    handle(data: Array<object> | object): Array<object> | object {
        let start = Math.max(0, this._currentPageIndex - 1) * this._pageSize;
        let end = Math.min(this._totalItems, start + this._pageSize);
        if (data instanceof Array) {
            return data.slice(start, end);
        }

        return data;
    }

    toQuery() {
        return "";
    }
}
