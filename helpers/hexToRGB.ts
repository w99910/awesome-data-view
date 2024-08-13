export default function hexToRGBA(hex: string, alpha: string | number) {
    if (hex.startsWith('rgba')) return hex.replace(/(\d\.?\d*)?\)$/, alpha + ")");
    if (!/^#[0-9A-F]{6}$/i.test(hex)) return hex;
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
