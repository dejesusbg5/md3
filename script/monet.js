import {
  argbFromHex,
  hexFromArgb,
  themeFromSourceColor,
  applyTheme,
} from "https://cdn.skypack.dev/@material/material-color-utilities";

const materialTheme = document.createElement("style");
materialTheme.setAttribute("id", "material-theme");
document.head.appendChild(materialTheme);

window.colorScheme = function (hexColor) {
  const sourceColor = argbFromHex(hexColor);
  const theme = themeFromSourceColor(sourceColor);
  const { palettes } = theme;

  let cssText = "";

  const newTone = (tone) => {
    switch (tone) {
      case 90:
        return 5;
      case 95:
        return 4;
      case 99:
        return 1;
      default:
        return 10;
    }
  };

  const addColorVars = (paletteName, palette, hexColor) => {
    for (let tone = 10; tone <= 100; tone += newTone(tone)) {
      const baseColor = palette.tone(tone);
      const baseColorHex = hexFromArgb(baseColor);
      cssText += `--${paletteName}-${tone}: ${baseColorHex}; `;

      const COLOR = {
        h: chroma(baseColorHex).hsl()[0],
        s: chroma(baseColorHex).hsl()[1],
        l: chroma(baseColorHex).hsl()[2],
      };

      if (["neutral", "neutral-variant"].includes(paletteName) && [10, 20, 30, 90, 99].includes(tone)) {
        for (var j = 1; j < 5; j++) {
          let alpha, source, backdrop, overlay;

          alpha = Math.abs((j - 1) * 0.15);
          source = COLOR;
          backdrop = {
            h: chroma(hexColor).hsl()[0],
            s: chroma(hexColor).hsl()[1],
            l: chroma(hexColor).hsl()[2],
          };

          overlay = {
            h: backdrop.h - source.h / 10,
            s: source.s * 0.9 + (backdrop.s - source.s) * (1 - alpha) * alpha * 0.20833333,
            l: source.l * 0.957142857 + (backdrop.l - source.l) * (1 - alpha) * alpha * 0.77,
          };

          overlay.l += source.l > 0.5 ? (j + 5.5) / 200 : (j + 1.5) / 150;
          cssText += `--${paletteName}-${tone}-e${j}: ${chroma(overlay)};`;
        }
      }
    }
  };

  addColorVars("primary", palettes.primary, hexColor);
  addColorVars("secondary", palettes.secondary, hexColor);
  addColorVars("tertiary", palettes.tertiary, hexColor);
  addColorVars("neutral", palettes.neutral, hexColor);
  addColorVars("neutral-variant", palettes.neutralVariant, hexColor);

  materialTheme.textContent = `:root { ${cssText} }`;
};

window.colorSchemeImg = function (path) {
  const img = document.createElement("img");
  img.crossOrigin = "Anonymous";
  img.src = path;

  img.addEventListener("load", () => {
    const vibrant = new Vibrant(img);
    const swatches = vibrant.swatches();
    const primary = swatches.Vibrant?.getHex() ?? swatches.DarkVibrant?.getHex() ?? swatches.LightVibrant?.getHex();
    colorSchemeHCT(primary);
  });
};

window.toggleDarkMode = function () {
  document.body.classList.toggle("light");
  document.body.classList.toggle("dark");
};

document.body.classList.add(window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
