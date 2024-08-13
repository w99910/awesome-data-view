import Pipelined from "../interface/Pipelined";
import PopupButton from "../helpers/PopupButton";

export default class GroupBy implements Pipelined {
    protected groupByColumn: null | string = null;
    protected prefix: boolean = false;

    render(options: Array<string>, onClick: Function, buttonStyle = {
        background: 'transparent',
        color: '#000',
        border: '1px solid #323232'
    }, popupStyle = {
        background: 'white',
        color: '#000',
        border: '1px solid #323232',
    }) {
        let { button, toggleVisibility, placeholder, div } = PopupButton(buttonStyle, popupStyle);

        let icon = `<svg xmlns="http://www.w3.org/2000/svg" style="width: 16px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-grid-3x3"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>`;
        placeholder.innerHTML = `${icon} Group By: <b>${this.groupByColumn ?? 'None'}</b>`

        options.forEach((option, i) => {
            let btn = document.createElement('button');
            btn.innerText = option;
            btn.className = 'px-8 py-3';
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                e.preventDefault();
                toggleVisibility();
                onClick(option, i);
                button.querySelector('b')!.innerText = `${option}`
            });
            if (i !== options.length - 1) {
                btn.classList.add('border-b')
            }
            div.appendChild(btn)
        })

        return button
    }

    column(name: string, prefix?: boolean) {
        this.groupByColumn = name
        if (prefix) {
            this.prefix = prefix;
        }
        return this;
    }

    handle(data: Array<object> | object): Array<object> | object {
        if (!this.groupByColumn) {
            return data;
        }
        if (data instanceof Array) {
            let groups = {};
            data.forEach((datum) => {
                let value = datum[this.groupByColumn!];
                if (this.prefix) {
                    value = this.groupByColumn + ':' + value;
                }
                if (!groups.hasOwnProperty(value)) {
                    groups[value] = [datum];
                    return;
                }

                groups[value].push(datum);
            })

            return groups
        }

        Object.keys(data).forEach((key) => {
            let values = data[key];
            if (!(values instanceof Array)) {
                return;
            }
            data[key] = this.handle(values);
        })

        return data;
    }

    toQuery() {
        return '';
    }
}
