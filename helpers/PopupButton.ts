import anime from "animejs/lib/anime.es";
import {onClickOutside} from "js-utils";

export default function (buttonStyle:{
    [key: string]: any;
} = {
    background: 'transparent',
    color: '#000',
    border: '1px solid #323232',
}, popupStyle:{
    [key: string]: any;
} = {
    background: 'white',
    color: '#000',
    border: '1px solid #323232',
}) {
    const customEvent = new CustomEvent("click-outside");
    let button = document.createElement('button');
    button.className = "relative";
    button.style.padding = "8px 14px";
    button.style.borderRadius = "4px";
    button.style.color = 'black';
    button.style.fontSize = '14px'
    button.style.border = '1px solid #323232'
    button.style.display = 'flex';
    button.style.columnGap = '10px';
    button.style.alignItems = 'center'
    button.style.justifyContent = 'center';

    Object.keys(buttonStyle).forEach((attribute) => {
        button.style[attribute] = buttonStyle[attribute]
    })

    // Create placeholder
    let placeholder = document.createElement('span');
    placeholder.style.display = 'inline-flex';
    placeholder.style.columnGap = '10px';
    placeholder.style.alignItems = 'center';
    button.appendChild(placeholder)

    let open = false;
    let div = document.createElement('div');
    div.className = "p-2 bg-white rounded border min-w-full shadow-2xl flex flex-col absolute z-10 top-[100%] right-0";
    div.style.display = 'none';
    div.style.width = 'max-content'
    div.style.transformOrigin = '100% 0%';

    Object.keys(popupStyle).forEach((attribute) => {
        div.style[attribute] = popupStyle[attribute]
    })

    const toggleVisibility = () => {
        if (!open) {
            div.style.display = 'flex';
        }
        anime({
            targets: div,
            scale: open ? [1, 0.7] : [0.7, 1],
            opacity: open ? [1, 0] : [0, 1],
            duration: 200,
            easing: 'easeInOutSine',
            complete: () => {
                open = !open;
                if (!open) {
                    div.style.display = 'none';
                    button.dispatchEvent(customEvent)
                }
            }
        })
    }

    button.addEventListener('click', function () {
        if(open){
            return;
        }
        setTimeout(() => {
            toggleVisibility();
        }, 100);
    })

    button.appendChild(div);

    onClickOutside(div, function (e) {
        if (open) {
            toggleVisibility();
        }
    })

    return {button, toggleVisibility, placeholder, div};
}
