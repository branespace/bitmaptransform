module.exports = [
    {
        name: "width",
        offset: 0x12,
        size: 4
    },
    {
        name: "height",
        offset: 0x16,
        size: 4
    },
    {
        name: "colorPlanes",
        offset: 0x1A,
        size: 2
    },
    {
        name: "bitsPerPixel",
        offset: 0x1C,
        size: 2
    },
    {
        name: "compression",
        offset: 0x1E,
        size: 4
    },
    {
        name: "imageSize",
        offset: 0x22,
        size: 4
    },
    {
        name: "xPPM",
        offset: 0x26,
        size: 4
    },
    {
        name: "yPPM",
        offset: 0x2A,
        size: 4
    },
    {
        name: "numPaletteColors",
        offset: 0x2E,
        size: 4
    },
    {
        name: "numImportantColors",
        offset: 0x32,
        size: 4
    },
    {
        name: "bitMaskRed",
        offset: 0x36,
        size: 4
    },
    {
        name: "bitMaskGreen",
        offset: 0x3A,
        size: 4
    },
    {
        name: "bitMaskBlue",
        offset: 0x3E,
        size: 4
    },
    {
        name: "bitMaskAlpha",
        offset: 0x42,
        size: 4
    }
];