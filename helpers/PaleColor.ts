export default function (rgbaString: string, increaseFactor = 0.2) {
    let [r, g, b, a] = rgbaString
        .replace(/[^\d,.]/g, "")
        .split(",")
        .map(Number);

    r = Math.min(255, Math.round(r + (255 - r) * increaseFactor));
    g = Math.min(255, Math.round(g + (255 - g) * increaseFactor));
    b = Math.min(255, Math.round(b + (255 - b) * increaseFactor));

    return `rgba(${r}, ${g}, ${b}, ${a})`;
}
