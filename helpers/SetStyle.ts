export default function (element: HTMLElement, style: object) {
    Object.keys(style).forEach((attribute) => {
        element.style[attribute] = style[attribute]
    })
}
