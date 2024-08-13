export default function (data: Array<object | string>, attributeName: string = null, shouldReturnAttributeValue = false) {
    let unique = [];
    data.forEach((datum) => {
        if (unique.filter((u) => typeof datum === 'object' && attributeName ? datum[attributeName] === u[attributeName] : u === datum).length === 0) {
            unique.push(datum);
        }
    })
    if (shouldReturnAttributeValue) {
        unique = unique.map((u) => u[attributeName])
    }
    return unique;
}
