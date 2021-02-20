export default function hslToHex (hue: number, saturation: number, lightness: number): string {

  lightness /= 100;

  const a = saturation * Math.min(lightness, 1 - lightness) / 100;

  const f = (n: number) => {
    const k = (n + hue / 30) % 12;
    const color = lightness - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
  };

  return '#' + f(0) + f(8) + f(4);
}
