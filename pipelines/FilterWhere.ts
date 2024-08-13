import Pipelined from "../interface/Pipelined";
import PopupButton from "../helpers/PopupButton";
import hexToRGBA from "../helpers/hexToRGB";
import SetStyle from "../helpers/SetStyle";
import paleColor from "../helpers/PaleColor";
import PaleColor from "../helpers/PaleColor";

type WhereClause = "AND" | "OR"

type Operator =
    "equal to"
    | "in"
    | "not equal to"
    | "not in"
    | "between"
    | "greater than"
    | "less than"
    | "greater than or equal"
    | "less than or equal"
    | "contains"

interface Where {
    type: WhereClause,
    column?: string,
    value?: string | number | Array<string | number>,
    operator?: Operator,
    filter?: FilterWhere,
}

export default class FilterWhere implements Pipelined {
    protected _conditions: Array<Where> = [];

    render(buttonStyle = {
        background: 'transparent',
        color: '#000',
        border: '1px solid #323232'
    }, popupStyle = {
        background: 'white',
        color: '#000',
        border: '1px solid #323232',
        transformOrigin: 'center'
    }, onChange: Function) {
        let { button, div, placeholder } = PopupButton(buttonStyle, popupStyle);

        let icon = `<svg xmlns="http://www.w3.org/2000/svg" style="width:16px;" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-list-filter"><path d="M3 6h18"/><path d="M7 12h10"/><path d="M10 18h4"/></svg>`;
        placeholder.innerHTML = `${icon} Filter`

        div.appendChild(this.renderFilterWhere(this, 0, popupStyle));

        button.addEventListener('click-outside', () => {
            onChange();
        })

        return button;
    }

    protected renderCondition(condition: Where, popupStyle = {
        background: 'white',
        color: '#000',
        border: '1px solid #323232'
    }, level: number, onRemove: Function, isFirst: boolean) {
        let style = {
            background: PaleColor(hexToRGBA(popupStyle.background, 1), level / 10),
            color: popupStyle.color,
            padding: '3px 6px',
            outline: 'none',
            borderBottom: `0.5px solid ${popupStyle.color}`
        };
        if (condition.filter) {
            let conditionFilter = this.renderFilterWhere(condition.filter, level + 1, popupStyle);
            conditionFilter.style.margin = '6px'
            let whereType = document.createElement('select');
            whereType.style.width = 'fit-content';
            ["AND", "OR"].forEach((value) => {
                let option = document.createElement('option');
                option.value = value;
                option.text = value;

                if (value === condition.type) {
                    option.selected = true;
                }

                whereType.appendChild(option);
            })

            whereType.addEventListener('change', () => {
                condition.type = (whereType.value as WhereClause);
            })
            SetStyle(whereType, style)

            conditionFilter.insertBefore(whereType, conditionFilter.children[0]);
            return conditionFilter
        }
        let conditionBox = document.createElement('div');
        conditionBox.style.display = 'flex';
        conditionBox.style.alignItems = 'bottom';
        conditionBox.style.padding = '4px';
        conditionBox.style.columnGap = '20px';

        let attributeName = document.createElement('input');
        attributeName.placeholder = 'Column name';
        attributeName.value = condition.column!;
        attributeName.addEventListener('change', () => {
            condition.column = attributeName.value;
        })

        let operator = document.createElement('select');
        ["equal to", "in", "not equal to", "not in", "between", "greater than", "less than", "greater than or equal", "less than or equal", "contains"]
            .forEach((value) => {
                let option = document.createElement('option');
                option.value = value;
                option.text = value;

                if (value === condition.operator) {
                    option.selected = true;
                }

                operator.appendChild(option);
            })

        operator.addEventListener('change', () => {
            condition.operator = (operator.value as Operator);
        })

        let value = document.createElement('input');
        value.placeholder = 'comma separated value'
        value.value = condition.value instanceof Array ? condition.value.join(',') : condition.value!.toString();
        value.addEventListener('change', () => {
            // split the values by comma and assign
            condition.value = ['in', 'not in', 'between'].includes(condition.operator!) ? value.value.split(',') : value.value;
        })

        SetStyle(attributeName, style)
        SetStyle(operator, style)
        SetStyle(value, style)

        let removeButton = document.createElement('button');
        removeButton.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            onRemove();

            // since there are "add condition" and "add condition group",
            if (level > 0 && conditionBox.parentElement?.children.length === 4) {
                conditionBox.parentElement.remove();
            } else {
                conditionBox.remove();
            }
        })
        removeButton.innerHTML = `<svg style="width: 20px; color:#ff5050;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-circle-minus"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>`

        if (!isFirst) {
            let whereType = document.createElement('select');
            ["AND", "OR"].forEach((value) => {
                let option = document.createElement('option');
                option.value = value;
                option.text = value;

                if (value === condition.type) {
                    option.selected = true;
                }

                whereType.appendChild(option);
            })

            whereType.addEventListener('change', () => {
                condition.type = (whereType.value as WhereClause);
            })
            SetStyle(whereType, style)

            conditionBox.appendChild(whereType);
        }
        conditionBox.appendChild(attributeName);
        conditionBox.appendChild(operator);
        conditionBox.appendChild(value);
        conditionBox.appendChild(removeButton);

        return conditionBox
    }

    protected renderFilterWhere(filterWhere: FilterWhere, level: number, popupStyle = {
        background: 'white',
        color: '#000',
        border: '1px solid #323232'
    }) {
        let conditions = filterWhere._conditions;
        popupStyle.background = hexToRGBA(popupStyle.background, 1 - (level / 10));
        let container = document.createElement('div');
        SetStyle(container, popupStyle)
        container.style.display = 'flex';
        container.style.flexDirection = 'column';
        container.style.rowGap = '12px';
        // container.style.width = '100%';
        container.style.padding = '8px'
        if (level === 0) {
            container.style.border = 'none'
        }

        container.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
        })

        conditions.forEach((condition, i) => {
            container.appendChild(this.renderCondition(condition, popupStyle, level, () => filterWhere._conditions = filterWhere._conditions.filter((_condition) => _condition !== condition), i === 0))
        })

        const addButton = () => {
            let button = document.createElement('button');
            button.style.background = paleColor(popupStyle.background, 0.1 + (0.1 * level))
            button.style.padding = "3px 6px";
            button.style.borderRadius = "4px";
            button.style.display = "flex";
            button.style.alignItems = "center";
            button.style.columnGap = "2px";
            button.style.fontSize = "12px";
            button.style.width = 'fit-content'
            return button;
        }

        const addConditionButton = addButton();
        addConditionButton.innerHTML = `<svg style="width: 10px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Add Condition`;
        addConditionButton.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            let condition: Where = {
                type: 'AND',
                operator: "equal to",
                column: '',
                value: ''
            }
            filterWhere._conditions.push(condition);
            container.insertBefore(
                this.renderCondition(condition, popupStyle, level, () => filterWhere._conditions = filterWhere._conditions.filter((_condition) => _condition !== condition), filterWhere._conditions.length === 1),
                addConditionButton)
        })

        const addFilterWhereButton = addButton();
        addFilterWhereButton.innerHTML = `<svg style="width: 10px;" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg> Add Condition Group`;
        addFilterWhereButton.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            let _condition: Where = {
                type: 'AND',
                operator: "equal to",
                column: '',
                value: ''
            }
            let fw = (new FilterWhere)
            fw._conditions.push(_condition)
            let condition: Where = {
                type: 'AND',
                filter: fw
            }
            filterWhere._conditions.push(condition);
            container.insertBefore(
                this.renderCondition(condition, popupStyle, level + 1, () => filterWhere._conditions = filterWhere._conditions.filter((_condition) => _condition !== condition), filterWhere._conditions.length === 1),
                addConditionButton)
        })


        container.appendChild(addConditionButton);
        container.appendChild(addFilterWhereButton);
        return container;
        // container
    }

    and(columnOrFilter: string | FilterWhere, value?: string | number | Array<string | number>, operator: Operator = "equal to") {
        let where: Where = {
            'type': 'AND'
        }
        if (columnOrFilter instanceof FilterWhere) {
            where.filter = columnOrFilter;
        } else {
            where.column = columnOrFilter;
            where.value = value;
            where.operator = operator;
        }

        this._conditions.push(where)

        return this;
    }

    or(columnOrFilter: string | FilterWhere, value?: string | number | Array<string | number>, operator: Operator = "equal to") {
        let where: Where = {
            'type': 'OR'
        }
        if (columnOrFilter instanceof FilterWhere) {
            where.filter = columnOrFilter;
        } else {
            where.column = columnOrFilter;
            where.value = value;
            where.operator = operator;
        }

        this._conditions.push(where)

        return this;
    }

    build() {
        return (item: object) => {
            if (this._conditions.length === 0) return true;
            return this._conditions.reduce((result, condition) => {
                if (condition.filter) {
                    const nestedResult = condition.filter.build()(item);
                    return condition.type === 'AND' ? result && nestedResult : result || nestedResult;
                } else if (condition.column && condition.value) {
                    let comparison = false;
                    let itemValue = item[condition.column];
                    if (typeof itemValue === 'object' && itemValue.raw) {
                        itemValue = itemValue.raw;
                    }
                    switch (condition.operator) {
                        case "between":
                            if (!(condition.value instanceof Array)) {
                                throw new Error('Please provide array for "between" operator');
                            }
                            comparison = itemValue >= condition.value[0] && itemValue <= condition.value[1];
                            break;
                        case "equal to":
                            comparison = itemValue === condition.value;
                            break;
                        case "greater than":
                            comparison = itemValue > condition.value;
                            break;
                        case "less than":
                            comparison = itemValue < condition.value;
                            break;
                        case "greater than or equal":
                            comparison = itemValue >= condition.value;
                            break;
                        case "less than or equal":
                            comparison = itemValue <= condition.value;
                            break;
                        case "not equal to":
                            comparison = itemValue !== condition.value;
                            break;
                        case "not in":
                            if (!(condition.value instanceof Array)) {
                                throw new Error('Please provide array for "between" operator');
                            }
                            comparison = !condition.value.includes(itemValue);
                            break;
                        case "in":
                            if (!(condition.value instanceof Array)) {
                                throw new Error('Please provide array for "between" operator');
                            }
                            comparison = condition.value.includes(itemValue);
                            break;
                        case "contains":
                            comparison = (new RegExp(condition.value.toString().toLowerCase(), 'i')).test(itemValue.toString());
                            break;
                    }
                    // const comparison = item[condition.column] === condition.value;
                    return condition.type === 'AND' ? result && comparison : result || comparison;
                } else {
                    return true;
                }
            }, this._conditions[0].type === 'AND');
        };
    }

    handle(data: Array<object> | object): Array<object> | object {
        if (this._conditions.length === 0) {
            return data;
        }
        console.log(this._conditions)
        if (data instanceof Array) {
            return data.filter(this.build());
        }


        Object.keys(data).forEach((key) => {
            let values = data[key];
            if (!values.forEach) {
                return;
            }
            data[key] = values.filter(this.build())
        })

        return data;
    }

    toQuery() {
        return '';
    }
}
