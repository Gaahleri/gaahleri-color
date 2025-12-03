declare module "mixbox" {
  export function rgbToLatent(
    rgb: [number, number, number]
  ): [number, number, number, number, number, number, number];

  export function latentToRgb(
    latent: [number, number, number, number, number, number, number]
  ): [number, number, number];

  export function lerp(
    rgb1: [number, number, number],
    rgb2: [number, number, number],
    t: number
  ): [number, number, number];

  export default {
    rgbToLatent,
    latentToRgb,
    lerp,
  };
}
