
const fs = require('fs');
const path = require('path');

// colorData 배열 정의
const colorData = [
        {
        "hex": "rgba(0, 0, 0, 0.6)",
        "ch": ""
    },
    {
        "hex": "rgba(0,0,0,0.6)",
        "ch": ""
    },
    {
        "hex": "rgba(18,22,25,0.6)",
        "ch": ""
    },
    {
        "hex": "#808080",
        "ch": ""
    },
    {
        "hex": "#8c8999",
        "ch": ""
    },
    {
        "hex": "#b5b5b5",
        "ch": ""
    },
    {
        "hex": "rgba(0, 0, 0, 0.16)",
        "ch": ""
    },
    {
        "hex": "#d8d8d8",
        "ch": ""
    },
    {
        "hex": "#dcdcdc",
        "ch": ""
    },
    {
        "hex": "#DFDCE0",
        "ch": ""
    },
    {
        "hex": "#e4e4e4",
        "ch": ""
    },
    {
        "hex": "rgba(128, 136, 146, 0.2)",
        "ch": ""
    },
    {
        "hex": "#e8e8e8",
        "ch": ""
    },
    {
        "hex": "#ebebeb",
        "ch": ""
    },
    {
        "hex": "#ececec",
        "ch": ""
    },
    {
        "hex": "#EDEDED",
        "ch": ""
    },
    {
        "hex": "#F0F0F0",
        "ch": ""
    },
    {
        "hex": "#f4f4f4",
        "ch": ""
    },
    {
        "hex": "#F5F5F5",
        "ch": ""
    },
    {
        "hex": "#f7f7f7",
        "ch": ""
    },
    {
        "hex": "#f7f7f8",
        "ch": ""
    },
    {
        "hex": "#f8f8f8",
        "ch": ""
    },
    {
        "hex": "#f9f9f8",
        "ch": ""
    },
    {
        "hex": "#f9f9f9",
        "ch": ""
    },
    {
        "hex": "#FEFEFE",
        "ch": ""
    },
    {
        "hex": "rgba(229,240,252,0)",
        "ch": ""
    },
    {
        "hex": "rgba(243, 246, 251, 0)",
        "ch": ""
    },
    {
        "hex": "rgba(248, 249, 251, 0)",
        "ch": ""
    },
    {
        "hex": "rgba(248, 249, 252 ,0)",
        "ch": ""
    },
    {
        "hex": "rgba(248, 249, 252, 0)",
        "ch": ""
    },
    {
        "hex": "rgba(255, 255, 255 ,0)",
        "ch": ""
    },
    {
        "hex": "rgba(255, 255, 255, 0.85)",
        "ch": ""
    },
    {
        "hex": "rgba(255,255,255,0)",
        "ch": ""
    },
    {
        "hex": "rgba(255,255,255,0.1)",
        "ch": ""
    },
    {
        "hex": "rgba(23, 42, 124, 0)",
        "ch": ""
    },
    {
        "hex": "rgba(224, 93, 23, 0.00)",
        "ch": ""
    },
    {
        "hex": "rgba(0, 0, 0, 0.00)",
        "ch": ""
    },
    {
        "hex": "rgba(4, 113, 233, 0)",
        "ch": ""
    },
    {
        "hex": "#432117",
        "ch": ""
    },
    {
        "hex": "#BE2E25",
        "ch": ""
    },
    {
        "hex": "#cc4f3e",
        "ch": ""
    },
    {
        "hex": "#DB4137",
        "ch": ""
    },
    {
        "hex": "#FF0000",
        "ch": ""
    },
    {
        "hex": "#fe2222",
        "ch": ""
    },
    {
        "hex": "#dd5f5e",
        "ch": ""
    },
    {
        "hex": "#F74836",
        "ch": ""
    },
    {
        "hex": "#e55d42",
        "ch": ""
    },
    {
        "hex": "#F55842",
        "ch": ""
    },
    {
        "hex": "#F65842",
        "ch": ""
    },
    {
        "hex": "#f06547",
        "ch": ""
    },
    {
        "hex": "#f1685e",
        "ch": ""
    },
    {
        "hex": "#f27954",
        "ch": ""
    },
    {
        "hex": "#F47B7B",
        "ch": ""
    },
    {
        "hex": "#F07E7E",
        "ch": ""
    },
    {
        "hex": "#F4805C",
        "ch": ""
    },
    {
        "hex": "#ff7e7e",
        "ch": ""
    },
    {
        "hex": "#f5857e",
        "ch": ""
    },
    {
        "hex": "#fe8d81",
        "ch": ""
    },
    {
        "hex": "#EFA0A0",
        "ch": ""
    },
    {
        "hex": "#e0b3a7",
        "ch": ""
    },
    {
        "hex": "#eab1a5",
        "ch": ""
    },
    {
        "hex": "#ffdcdc",
        "ch": ""
    },
    {
        "hex": "#f8e4e4",
        "ch": ""
    },
    {
        "hex": "#F8ECEC",
        "ch": ""
    },
    {
        "hex": "#FDECE7",
        "ch": ""
    },
    {
        "hex": "rgba(219,108,108,0.1)",
        "ch": ""
    },
    {
        "hex": "rgba(203,128,108,0.1)",
        "ch": ""
    },
    {
        "hex": "rgba(255, 169, 169, 0.15)",
        "ch": ""
    },
    {
        "hex": "#fdf8f8",
        "ch": ""
    },
    {
        "hex": "#fffbfa",
        "ch": ""
    },
    {
        "hex": "#6C3907",
        "ch": ""
    },
    {
        "hex": "#674533",
        "ch": ""
    },
    {
        "hex": "#8F401E",
        "ch": ""
    },
    {
        "hex": "#64554A",
        "ch": ""
    },
    {
        "hex": "#ab551b",
        "ch": ""
    },
    {
        "hex": "#B85D09",
        "ch": ""
    },
    {
        "hex": "#b85d09",
        "ch": ""
    },
    {
        "hex": "#E75201",
        "ch": ""
    },
    {
        "hex": "#E05D17",
        "ch": ""
    },
    {
        "hex": "#e86d00",
        "ch": ""
    },
    {
        "hex": "#E5763A",
        "ch": ""
    },
    {
        "hex": "#d8823e",
        "ch": ""
    },
    {
        "hex": "#D78455",
        "ch": ""
    },
    {
        "hex": "#DE8532",
        "ch": ""
    },
    {
        "hex": "#E68845",
        "ch": ""
    },
    {
        "hex": "#FE8A3B",
        "ch": ""
    },
    {
        "hex": "#FE8E5B",
        "ch": ""
    },
    {
        "hex": "#beb3ab",
        "ch": ""
    },
    {
        "hex": "#c0b6ad",
        "ch": ""
    },
    {
        "hex": "#DDD6D0",
        "ch": ""
    },
    {
        "hex": "#F3DACC",
        "ch": ""
    },
    {
        "hex": "#EEEAE7",
        "ch": ""
    },
    {
        "hex": "#F4F1EF",
        "ch": ""
    },
    {
        "hex": "#FFF1E5",
        "ch": ""
    },
    {
        "hex": "#FBF3EE",
        "ch": ""
    },
    {
        "hex": "#fbf3ee",
        "ch": ""
    },
    {
        "hex": "#7B5404",
        "ch": ""
    },
    {
        "hex": "#695949",
        "ch": ""
    },
    {
        "hex": "#935800",
        "ch": ""
    },
    {
        "hex": "#8A6520",
        "ch": ""
    },
    {
        "hex": "#9E6903",
        "ch": ""
    },
    {
        "hex": "#947758",
        "ch": ""
    },
    {
        "hex": "#A08039",
        "ch": ""
    },
    {
        "hex": "#B47C40",
        "ch": ""
    },
    {
        "hex": "#b87c36",
        "ch": ""
    },
    {
        "hex": "#B08223",
        "ch": ""
    },
    {
        "hex": "#B79533",
        "ch": ""
    },
    {
        "hex": "#D1A162",
        "ch": ""
    },
    {
        "hex": "#fe9717",
        "ch": ""
    },
    {
        "hex": "#D2AC5C",
        "ch": ""
    },
    {
        "hex": "#E9A838",
        "ch": ""
    },
    {
        "hex": "#F7A427",
        "ch": ""
    },
    {
        "hex": "#E7B552",
        "ch": ""
    },
    {
        "hex": "#FFAD57",
        "ch": ""
    },
    {
        "hex": "#FFAF2F",
        "ch": ""
    },
    {
        "hex": "#FDB65C",
        "ch": ""
    },
    {
        "hex": "#ffb800",
        "ch": ""
    },
    {
        "hex": "#ffb81e",
        "ch": ""
    },
    {
        "hex": "#EBC778",
        "ch": ""
    },
    {
        "hex": "#FFC845",
        "ch": ""
    },
    {
        "hex": "#FAE6B9",
        "ch": ""
    },
    {
        "hex": "#f3e9de",
        "ch": ""
    },
    {
        "hex": "#ffeed7",
        "ch": ""
    },
    {
        "hex": "#FEEEDC",
        "ch": ""
    },
    {
        "hex": "#FCEFE1",
        "ch": ""
    },
    {
        "hex": "#fcefe1",
        "ch": ""
    },
    {
        "hex": "#f5f1eb",
        "ch": ""
    },
    {
        "hex": "rgba(146,133,120,0.1)",
        "ch": ""
    },
    {
        "hex": "#f8f3eb",
        "ch": ""
    },
    {
        "hex": "#FFF3D5",
        "ch": ""
    },
    {
        "hex": "#f8f3ed",
        "ch": ""
    },
    {
        "hex": "#FCF4E6",
        "ch": ""
    },
    {
        "hex": "#fef4e3",
        "ch": ""
    },
    {
        "hex": "#FFF4E5",
        "ch": ""
    },
    {
        "hex": "#fcf5e8",
        "ch": ""
    },
    {
        "hex": "#fbf6f0",
        "ch": ""
    },
    {
        "hex": "#FFF6EA",
        "ch": ""
    },
    {
        "hex": "#FFF7EB",
        "ch": ""
    },
    {
        "hex": "#FEF8E8",
        "ch": ""
    },
    {
        "hex": "rgba(255, 209, 91, 0.15)",
        "ch": ""
    },
    {
        "hex": "#fbf9f7",
        "ch": ""
    },
    {
        "hex": "#FFFBEF",
        "ch": ""
    },
    {
        "hex": "#fffbf2",
        "ch": ""
    },
    {
        "hex": "#8e7616",
        "ch": ""
    },
    {
        "hex": "#c3a31f",
        "ch": ""
    },
    {
        "hex": "#BFBB31",
        "ch": ""
    },
    {
        "hex": "#D6C04F",
        "ch": ""
    },
    {
        "hex": "#E8D15E",
        "ch": ""
    },
    {
        "hex": "#F0D36C",
        "ch": ""
    },
    {
        "hex": "#FFD64E",
        "ch": ""
    },
    {
        "hex": "#FAE301",
        "ch": ""
    },
    {
        "hex": "#fff29f",
        "ch": ""
    },
    {
        "hex": "#fbf5df",
        "ch": ""
    },
    {
        "hex": "#FFF7D7",
        "ch": ""
    },
    {
        "hex": "#FFFF00",
        "ch": ""
    },
    {
        "hex": "#fff8e2",
        "ch": ""
    },
    {
        "hex": "#FFFBD6",
        "ch": ""
    },
    {
        "hex": "#fffdec",
        "ch": ""
    },
    {
        "hex": "#55641A",
        "ch": ""
    },
    {
        "hex": "#859e07",
        "ch": ""
    },
    {
        "hex": "#8D9D2D",
        "ch": ""
    },
    {
        "hex": "#DDE2C0",
        "ch": ""
    },
    {
        "hex": "#F4F5EA",
        "ch": ""
    },
    {
        "hex": "#217807",
        "ch": ""
    },
    {
        "hex": "#008000",
        "ch": ""
    },
    {
        "hex": "#25863e",
        "ch": ""
    },
    {
        "hex": "#34AF38",
        "ch": ""
    },
    {
        "hex": "#33B038",
        "ch": ""
    },
    {
        "hex": "#34B038",
        "ch": ""
    },
    {
        "hex": "#81C148",
        "ch": ""
    },
    {
        "hex": "#75CC76",
        "ch": ""
    },
    {
        "hex": "#BBDAA8",
        "ch": ""
    },
    {
        "hex": "#E8F4E3",
        "ch": ""
    },
    {
        "hex": "#e8f7e8",
        "ch": ""
    },
    {
        "hex": "#E8F9EC",
        "ch": ""
    },
    {
        "hex": "#1d342d",
        "ch": ""
    },
    {
        "hex": "#1b4e30",
        "ch": ""
    },
    {
        "hex": "#2f7957",
        "ch": ""
    },
    {
        "hex": "#2a8664",
        "ch": ""
    },
    {
        "hex": "#298757",
        "ch": ""
    },
    {
        "hex": "#1a946d",
        "ch": ""
    },
    {
        "hex": "#089c51",
        "ch": ""
    },
    {
        "hex": "#379e5b",
        "ch": ""
    },
    {
        "hex": "#27A275",
        "ch": ""
    },
    {
        "hex": "#26A469",
        "ch": ""
    },
    {
        "hex": "#32a666",
        "ch": ""
    },
    {
        "hex": "#2EA672",
        "ch": ""
    },
    {
        "hex": "#00BE59",
        "ch": ""
    },
    {
        "hex": "#73BF9D",
        "ch": ""
    },
    {
        "hex": "#81d6be",
        "ch": ""
    },
    {
        "hex": "#5fe3a1",
        "ch": ""
    },
    {
        "hex": "#01EE9C",
        "ch": ""
    },
    {
        "hex": "#ABE5CB",
        "ch": ""
    },
    {
        "hex": "#BFE2D2",
        "ch": ""
    },
    {
        "hex": "#e2ede9",
        "ch": ""
    },
    {
        "hex": "#DDF4EB",
        "ch": ""
    },
    {
        "hex": "rgba(99,169,139,0.15)",
        "ch": ""
    },
    {
        "hex": "#EAF5F0",
        "ch": ""
    },
    {
        "hex": "#eaf5f0",
        "ch": ""
    },
    {
        "hex": "#EEFAF5",
        "ch": ""
    },
    {
        "hex": "rgba(129, 232, 189, 0.15)",
        "ch": ""
    },
    {
        "hex": "#f2faf7",
        "ch": ""
    },
    {
        "hex": "#f7fcfa",
        "ch": ""
    },
    {
        "hex": "#234440",
        "ch": ""
    },
    {
        "hex": "#044f4e",
        "ch": ""
    },
    {
        "hex": "#006250",
        "ch": ""
    },
    {
        "hex": "#25625c",
        "ch": ""
    },
    {
        "hex": "#066555",
        "ch": ""
    },
    {
        "hex": "#2e767c",
        "ch": ""
    },
    {
        "hex": "#057e7d",
        "ch": ""
    },
    {
        "hex": "#178b8a",
        "ch": ""
    },
    {
        "hex": "#078ea4",
        "ch": ""
    },
    {
        "hex": "#0c99ac",
        "ch": ""
    },
    {
        "hex": "#0d9f85",
        "ch": ""
    },
    {
        "hex": "#009e95",
        "ch": ""
    },
    {
        "hex": "#24a0af",
        "ch": ""
    },
    {
        "hex": "#26a488",
        "ch": ""
    },
    {
        "hex": "#1EA39C",
        "ch": ""
    },
    {
        "hex": "#2ea1a8",
        "ch": ""
    },
    {
        "hex": "#26a599",
        "ch": ""
    },
    {
        "hex": "#00b1a1",
        "ch": ""
    },
    {
        "hex": "#19B4AA",
        "ch": ""
    },
    {
        "hex": "#5fafb6",
        "ch": ""
    },
    {
        "hex": "#4db5ab",
        "ch": ""
    },
    {
        "hex": "#11B9AF",
        "ch": ""
    },
    {
        "hex": "#1FBBCF",
        "ch": ""
    },
    {
        "hex": "#00bcd4",
        "ch": ""
    },
    {
        "hex": "#48bfc3",
        "ch": ""
    },
    {
        "hex": "#34C4CD",
        "ch": ""
    },
    {
        "hex": "#16CABF",
        "ch": ""
    },
    {
        "hex": "#46C7D7",
        "ch": ""
    },
    {
        "hex": "#5cc6d9",
        "ch": ""
    },
    {
        "hex": "#7ec5bf",
        "ch": ""
    },
    {
        "hex": "#5bcbb8",
        "ch": ""
    },
    {
        "hex": "rgba(33, 181, 172, 0.6)",
        "ch": ""
    },
    {
        "hex": "#9de0d4",
        "ch": ""
    },
    {
        "hex": "#A6E1DE",
        "ch": ""
    },
    {
        "hex": "#6DF0F9",
        "ch": ""
    },
    {
        "hex": "#C8E9E5",
        "ch": ""
    },
    {
        "hex": "rgba(0, 150, 169, 0.2)",
        "ch": ""
    },
    {
        "hex": "#D8F1ED",
        "ch": ""
    },
    {
        "hex": "#DDF4F2",
        "ch": ""
    },
    {
        "hex": "#E3F4F2",
        "ch": ""
    },
    {
        "hex": "rgba(39,164,136,0.1)",
        "ch": ""
    },
    {
        "hex": "#ECF8F6",
        "ch": ""
    },
    {
        "hex": "#ecf8f9",
        "ch": ""
    },
    {
        "hex": "#f2fafa",
        "ch": ""
    },
    {
        "hex": "#296e95",
        "ch": ""
    },
    {
        "hex": "#1870ad",
        "ch": ""
    },
    {
        "hex": "#1c798f",
        "ch": ""
    },
    {
        "hex": "#0c74ba",
        "ch": ""
    },
    {
        "hex": "#0a87a7",
        "ch": ""
    },
    {
        "hex": "#3493b8",
        "ch": ""
    },
    {
        "hex": "#2b93cf",
        "ch": ""
    },
    {
        "hex": "#0099b9",
        "ch": ""
    },
    {
        "hex": "#3799b2",
        "ch": ""
    },
    {
        "hex": "#1F9AB9",
        "ch": ""
    },
    {
        "hex": "#039be5",
        "ch": ""
    },
    {
        "hex": "#1ca1c4",
        "ch": ""
    },
    {
        "hex": "#42A8D5",
        "ch": ""
    },
    {
        "hex": "#19afef",
        "ch": ""
    },
    {
        "hex": "#2FB3DD",
        "ch": ""
    },
    {
        "hex": "#2fb3dd",
        "ch": ""
    },
    {
        "hex": "#67AFDE",
        "ch": ""
    },
    {
        "hex": "#77b5df",
        "ch": ""
    },
    {
        "hex": "#69B7ED",
        "ch": ""
    },
    {
        "hex": "#4fb8ff",
        "ch": ""
    },
    {
        "hex": "#4bbfe0",
        "ch": ""
    },
    {
        "hex": "#4BBEFE",
        "ch": ""
    },
    {
        "hex": "#80c5e9",
        "ch": ""
    },
    {
        "hex": "#8ECCF6",
        "ch": ""
    },
    {
        "hex": "#56d9fe",
        "ch": ""
    },
    {
        "hex": "#A9D6F5",
        "ch": ""
    },
    {
        "hex": "#C2D7DC",
        "ch": ""
    },
    {
        "hex": "#93DEFF",
        "ch": ""
    },
    {
        "hex": "#B2E2EE",
        "ch": ""
    },
    {
        "hex": "#BCE1EA",
        "ch": ""
    },
    {
        "hex": "#BBE6F1",
        "ch": ""
    },
    {
        "hex": "#d7f0fb",
        "ch": ""
    },
    {
        "hex": "#DDF0F5",
        "ch": ""
    },
    {
        "hex": "#E1F1FB",
        "ch": ""
    },
    {
        "hex": "#E4F1F5",
        "ch": ""
    },
    {
        "hex": "#E0F4FA",
        "ch": ""
    },
    {
        "hex": "#E4F4FF",
        "ch": ""
    },
    {
        "hex": "#E9F5F8",
        "ch": ""
    },
    {
        "hex": "rgba(36,156,187,0.1)",
        "ch": ""
    },
    {
        "hex": "rgba(73,156,212,0.1)",
        "ch": ""
    },
    {
        "hex": "#E3F8FF",
        "ch": ""
    },
    {
        "hex": "#f0f6fa",
        "ch": ""
    },
    {
        "hex": "#ebf7ff",
        "ch": ""
    },
    {
        "hex": "#EEF8FF",
        "ch": ""
    },
    {
        "hex": "#f2f8fc",
        "ch": ""
    },
    {
        "hex": "#f3f9fb",
        "ch": ""
    },
    {
        "hex": "#fafeff",
        "ch": ""
    },
    {
        "hex": "#222c39",
        "ch": ""
    },
    {
        "hex": "#153064",
        "ch": ""
    },
    {
        "hex": "#123d68",
        "ch": ""
    },
    {
        "hex": "#1d3a72",
        "ch": ""
    },
    {
        "hex": "#353F49",
        "ch": ""
    },
    {
        "hex": "#004170",
        "ch": ""
    },
    {
        "hex": "#153D83",
        "ch": ""
    },
    {
        "hex": "#004180",
        "ch": ""
    },
    {
        "hex": "#1D428B",
        "ch": ""
    },
    {
        "hex": "#2e4871",
        "ch": ""
    },
    {
        "hex": "#2f4c81",
        "ch": ""
    },
    {
        "hex": "#314e7a",
        "ch": ""
    },
    {
        "hex": "#0F49A4",
        "ch": ""
    },
    {
        "hex": "#194ca8",
        "ch": ""
    },
    {
        "hex": "#295297",
        "ch": ""
    },
    {
        "hex": "#1D52B0",
        "ch": ""
    },
    {
        "hex": "#1250c5",
        "ch": ""
    },
    {
        "hex": "#206191",
        "ch": ""
    },
    {
        "hex": "#546069",
        "ch": ""
    },
    {
        "hex": "#375f9e",
        "ch": ""
    },
    {
        "hex": "#0d5ec4",
        "ch": ""
    },
    {
        "hex": "#0962C4",
        "ch": ""
    },
    {
        "hex": "rgba(23, 67, 115, 0.8)",
        "ch": ""
    },
    {
        "hex": "#2662CE",
        "ch": ""
    },
    {
        "hex": "#2D64C6",
        "ch": ""
    },
    {
        "hex": "#3973B2",
        "ch": ""
    },
    {
        "hex": "#0C70DF",
        "ch": ""
    },
    {
        "hex": "#4176B1",
        "ch": ""
    },
    {
        "hex": "#2B71EA",
        "ch": ""
    },
    {
        "hex": "#0173FC",
        "ch": ""
    },
    {
        "hex": "#3B76E5",
        "ch": ""
    },
    {
        "hex": "#357dd6",
        "ch": ""
    },
    {
        "hex": "#3278F7",
        "ch": ""
    },
    {
        "hex": "#0f83da",
        "ch": ""
    },
    {
        "hex": "#4282D1",
        "ch": ""
    },
    {
        "hex": "#2487d8",
        "ch": ""
    },
    {
        "hex": "#5687ba",
        "ch": ""
    },
    {
        "hex": "#4986d0",
        "ch": ""
    },
    {
        "hex": "rgba(22, 63, 104, 0.6)",
        "ch": ""
    },
    {
        "hex": "#148FE9",
        "ch": ""
    },
    {
        "hex": "#4F8BE6",
        "ch": ""
    },
    {
        "hex": "#348ee9",
        "ch": ""
    },
    {
        "hex": "#4c8ee9",
        "ch": ""
    },
    {
        "hex": "#3493dd",
        "ch": ""
    },
    {
        "hex": "#1c93f6",
        "ch": ""
    },
    {
        "hex": "#6194d8",
        "ch": ""
    },
    {
        "hex": "#4797dd",
        "ch": ""
    },
    {
        "hex": "#5c97d3",
        "ch": ""
    },
    {
        "hex": "#3798F2",
        "ch": ""
    },
    {
        "hex": "#4399FF",
        "ch": ""
    },
    {
        "hex": "#3D9BFF",
        "ch": ""
    },
    {
        "hex": "#5ba1d6",
        "ch": ""
    },
    {
        "hex": "#769FCE",
        "ch": ""
    },
    {
        "hex": "#59a1f1",
        "ch": ""
    },
    {
        "hex": "#65a4ff",
        "ch": ""
    },
    {
        "hex": "#4faaff",
        "ch": ""
    },
    {
        "hex": "#72acf4",
        "ch": ""
    },
    {
        "hex": "#6DADF4",
        "ch": ""
    },
    {
        "hex": "#85b0da",
        "ch": ""
    },
    {
        "hex": "#8fafd6",
        "ch": ""
    },
    {
        "hex": "#5FB2FF",
        "ch": ""
    },
    {
        "hex": "#a2b0bc",
        "ch": ""
    },
    {
        "hex": "#6EC2FF",
        "ch": ""
    },
    {
        "hex": "#94c2eb",
        "ch": ""
    },
    {
        "hex": "#97cbf3",
        "ch": ""
    },
    {
        "hex": "#b9d4ff",
        "ch": ""
    },
    {
        "hex": "#C6D6E8",
        "ch": ""
    },
    {
        "hex": "#CAD7E6",
        "ch": ""
    },
    {
        "hex": "#BFE0F8",
        "ch": ""
    },
    {
        "hex": "rgba(0, 96, 241, 0.2)",
        "ch": ""
    },
    {
        "hex": "rgba(4, 113, 233, 0.2)",
        "ch": ""
    },
    {
        "hex": "rgba(4, 113, 233,0.2)",
        "ch": ""
    },
    {
        "hex": "rgba(4,113,233,0.2)",
        "ch": ""
    },
    {
        "hex": "#c6e4ff",
        "ch": ""
    },
    {
        "hex": "#D5E8FD",
        "ch": ""
    },
    {
        "hex": "#d7e8fb",
        "ch": ""
    },
    {
        "hex": "#dfe7f4",
        "ch": ""
    },
    {
        "hex": "#D3EAFF",
        "ch": ""
    },
    {
        "hex": "#E2EAF3",
        "ch": ""
    },
    {
        "hex": "#ddebfd",
        "ch": ""
    },
    {
        "hex": "#D7EDFF",
        "ch": ""
    },
    {
        "hex": "#DEECFF",
        "ch": ""
    },
    {
        "hex": "#DEEEFF",
        "ch": ""
    },
    {
        "hex": "#E2EFFF",
        "ch": ""
    },
    {
        "hex": "#e3f0fe",
        "ch": ""
    },
    {
        "hex": "#e5f0fc",
        "ch": ""
    },
    {
        "hex": "#e3f1ff",
        "ch": ""
    },
    {
        "hex": "rgba(4, 113, 233, 0.1)",
        "ch": ""
    },
    {
        "hex": "#E7F1FD",
        "ch": ""
    },
    {
        "hex": "#ECF1F7",
        "ch": ""
    },
    {
        "hex": "#eff1f4",
        "ch": ""
    },
    {
        "hex": "rgba(69,122,186,0.1)",
        "ch": ""
    },
    {
        "hex": "#EBF2FF",
        "ch": ""
    },
    {
        "hex": "#ebf2ff",
        "ch": ""
    },
    {
        "hex": "#e5f4ff",
        "ch": ""
    },
    {
        "hex": "#eaf4ff",
        "ch": ""
    },
    {
        "hex": "#EAF5FD",
        "ch": ""
    },
    {
        "hex": "#EDF4FF",
        "ch": ""
    },
    {
        "hex": "#EDF6FF",
        "ch": ""
    },
    {
        "hex": "#eef6fe",
        "ch": ""
    },
    {
        "hex": "#EEF6FF",
        "ch": ""
    },
    {
        "hex": "#f0f6fc",
        "ch": ""
    },
    {
        "hex": "#ECF7FF",
        "ch": ""
    },
    {
        "hex": "#f3f6fa",
        "ch": ""
    },
    {
        "hex": "#F3F6Fb",
        "ch": ""
    },
    {
        "hex": "#EFF7FF",
        "ch": ""
    },
    {
        "hex": "#f1f7fd",
        "ch": ""
    },
    {
        "hex": "rgba(149, 204, 255, 0.15)",
        "ch": ""
    },
    {
        "hex": "rgba(229, 240, 252, 0.5)",
        "ch": ""
    },
    {
        "hex": "rgba(235, 239, 245, 0.5)",
        "ch": ""
    },
    {
        "hex": "#F2F8FF",
        "ch": ""
    },
    {
        "hex": "#F3F9FF",
        "ch": ""
    },
    {
        "hex": "#02103A",
        "ch": ""
    },
    {
        "hex": "#091554",
        "ch": ""
    },
    {
        "hex": "#0B1966",
        "ch": ""
    },
    {
        "hex": "#031C69",
        "ch": ""
    },
    {
        "hex": "#031c69",
        "ch": ""
    },
    {
        "hex": "#272930",
        "ch": ""
    },
    {
        "hex": "#132460",
        "ch": ""
    },
    {
        "hex": "#292836",
        "ch": ""
    },
    {
        "hex": "#222e5a",
        "ch": ""
    },
    {
        "hex": "#1f2f5d",
        "ch": ""
    },
    {
        "hex": "#172A7C",
        "ch": ""
    },
    {
        "hex": "#172a7c",
        "ch": ""
    },
    {
        "hex": "#2A2D6B",
        "ch": ""
    },
    {
        "hex": "#032B89",
        "ch": ""
    },
    {
        "hex": "#0A2F8B",
        "ch": ""
    },
    {
        "hex": "#30384d",
        "ch": ""
    },
    {
        "hex": "#2e3854",
        "ch": ""
    },
    {
        "hex": "#272C8A",
        "ch": ""
    },
    {
        "hex": "#373A44",
        "ch": ""
    },
    {
        "hex": "#243776",
        "ch": ""
    },
    {
        "hex": "#32357B",
        "ch": ""
    },
    {
        "hex": "#2A3694",
        "ch": ""
    },
    {
        "hex": "#2A3795",
        "ch": ""
    },
    {
        "hex": "#0032B3",
        "ch": ""
    },
    {
        "hex": "#1f3d94",
        "ch": ""
    },
    {
        "hex": "#1d4495",
        "ch": ""
    },
    {
        "hex": "#4c4882",
        "ch": ""
    },
    {
        "hex": "#2D4B98",
        "ch": ""
    },
    {
        "hex": "#395085",
        "ch": ""
    },
    {
        "hex": "#233de8",
        "ch": ""
    },
    {
        "hex": "#2752b0",
        "ch": ""
    },
    {
        "hex": "#3E5796",
        "ch": ""
    },
    {
        "hex": "#435698",
        "ch": ""
    },
    {
        "hex": "#3c55a7",
        "ch": ""
    },
    {
        "hex": "#425dae",
        "ch": ""
    },
    {
        "hex": "#4657D1",
        "ch": ""
    },
    {
        "hex": "#56668F",
        "ch": ""
    },
    {
        "hex": "#4d65aa",
        "ch": ""
    },
    {
        "hex": "#4D5EE9",
        "ch": ""
    },
    {
        "hex": "#2565E8",
        "ch": ""
    },
    {
        "hex": "#69699f",
        "ch": ""
    },
    {
        "hex": "#5c6bc0",
        "ch": ""
    },
    {
        "hex": "#5D5FEF",
        "ch": ""
    },
    {
        "hex": "#4d75cc",
        "ch": ""
    },
    {
        "hex": "#6D73D6",
        "ch": ""
    },
    {
        "hex": "rgba(108,119,200,1)",
        "ch": ""
    },
    {
        "hex": "#6E74D7",
        "ch": ""
    },
    {
        "hex": "#4B7BF5",
        "ch": ""
    },
    {
        "hex": "#7C72F1",
        "ch": ""
    },
    {
        "hex": "#757add",
        "ch": ""
    },
    {
        "hex": "#5F78FF",
        "ch": ""
    },
    {
        "hex": "#5F82DB",
        "ch": ""
    },
    {
        "hex": "rgba(108,119,200,0.9)",
        "ch": ""
    },
    {
        "hex": "#6286EB",
        "ch": ""
    },
    {
        "hex": "#8182F4",
        "ch": ""
    },
    {
        "hex": "#738AFE",
        "ch": ""
    },
    {
        "hex": "#8691DE",
        "ch": ""
    },
    {
        "hex": "#6D94F6",
        "ch": ""
    },
    {
        "hex": "#8492F7",
        "ch": ""
    },
    {
        "hex": "#9694D5",
        "ch": ""
    },
    {
        "hex": "#89A4E9",
        "ch": ""
    },
    {
        "hex": "#a3a1fb",
        "ch": ""
    },
    {
        "hex": "#a1a8db",
        "ch": ""
    },
    {
        "hex": "#A4ABF4",
        "ch": ""
    },
    {
        "hex": "#acafeb",
        "ch": ""
    },
    {
        "hex": "#BAC0FA",
        "ch": ""
    },
    {
        "hex": "#c7c7d0",
        "ch": ""
    },
    {
        "hex": "#CFD9F4",
        "ch": ""
    },
    {
        "hex": "#E7E7FF",
        "ch": ""
    },
    {
        "hex": "#E7ECFA",
        "ch": ""
    },
    {
        "hex": "#ECEDFD",
        "ch": ""
    },
    {
        "hex": "#eff1ff",
        "ch": ""
    },
    {
        "hex": "#EFF2FB",
        "ch": ""
    },
    {
        "hex": "#F2F2FF",
        "ch": ""
    },
    {
        "hex": "#F8F9FB",
        "ch": ""
    },
    {
        "hex": "#f8f9fc",
        "ch": ""
    },
    {
        "hex": "rgba(248, 249, 252, 0.8)",
        "ch": ""
    },
    {
        "hex": "#330072",
        "ch": ""
    },
    {
        "hex": "#41346e",
        "ch": ""
    },
    {
        "hex": "#492c8a",
        "ch": ""
    },
    {
        "hex": "#4a3491",
        "ch": ""
    },
    {
        "hex": "#512da8",
        "ch": ""
    },
    {
        "hex": "#4629BD",
        "ch": ""
    },
    {
        "hex": "#5026CA",
        "ch": ""
    },
    {
        "hex": "#503FB6",
        "ch": ""
    },
    {
        "hex": "#5645a2",
        "ch": ""
    },
    {
        "hex": "#5147a8",
        "ch": ""
    },
    {
        "hex": "#5d4a9a",
        "ch": ""
    },
    {
        "hex": "#554AAD",
        "ch": ""
    },
    {
        "hex": "#584fab",
        "ch": ""
    },
    {
        "hex": "#5E3FD9",
        "ch": ""
    },
    {
        "hex": "#5f568b",
        "ch": ""
    },
    {
        "hex": "#5E3AEC",
        "ch": ""
    },
    {
        "hex": "#64579c",
        "ch": ""
    },
    {
        "hex": "#6655a5",
        "ch": ""
    },
    {
        "hex": "#6554b8",
        "ch": ""
    },
    {
        "hex": "#7c56b2",
        "ch": ""
    },
    {
        "hex": "#7A4DD9",
        "ch": ""
    },
    {
        "hex": "#7850ED",
        "ch": ""
    },
    {
        "hex": "#8059EA",
        "ch": ""
    },
    {
        "hex": "#855BDE",
        "ch": ""
    },
    {
        "hex": "#826cd6",
        "ch": ""
    },
    {
        "hex": "#7c6cfe",
        "ch": ""
    },
    {
        "hex": "#8c80ba",
        "ch": ""
    },
    {
        "hex": "#8c7dd6",
        "ch": ""
    },
    {
        "hex": "#a094fd",
        "ch": ""
    },
    {
        "hex": "#B69CFF",
        "ch": ""
    },
    {
        "hex": "#DAD4EC",
        "ch": ""
    },
    {
        "hex": "rgba(132, 113, 191, 0.25)",
        "ch": ""
    },
    {
        "hex": "#e3dbff",
        "ch": ""
    },
    {
        "hex": "#EBE5FF",
        "ch": ""
    },
    {
        "hex": "#ebe9f0",
        "ch": ""
    },
    {
        "hex": "#EDE9FC",
        "ch": ""
    },
    {
        "hex": "#EDEAF5",
        "ch": ""
    },
    {
        "hex": "#EDEBFF",
        "ch": ""
    },
    {
        "hex": "rgba(229, 214, 255, 0.4)",
        "ch": ""
    },
    {
        "hex": "#f2f0ff",
        "ch": ""
    },
    {
        "hex": "#f5f0fc",
        "ch": ""
    },
    {
        "hex": "#F3F1F9",
        "ch": ""
    },
    {
        "hex": "#F5F1FD",
        "ch": ""
    },
    {
        "hex": "rgba(148,124,176,0.1)",
        "ch": ""
    },
    {
        "hex": "#f4f2ff",
        "ch": ""
    },
    {
        "hex": "rgba(198, 185, 255, 0.15)",
        "ch": ""
    },
    {
        "hex": "#f7f6fa",
        "ch": ""
    },
    {
        "hex": "rgba(214, 190, 255, 0.15)",
        "ch": ""
    },
    {
        "hex": "#f8f6ff",
        "ch": ""
    },
    {
        "hex": "#f8f7ff",
        "ch": ""
    },
    {
        "hex": "rgba(229, 214, 255, 0.15)",
        "ch": ""
    },
    {
        "hex": "#200337",
        "ch": ""
    },
    {
        "hex": "#340857",
        "ch": ""
    },
    {
        "hex": "#532775",
        "ch": ""
    },
    {
        "hex": "#7D28A8",
        "ch": ""
    },
    {
        "hex": "#703A9A",
        "ch": ""
    },
    {
        "hex": "#843bc0",
        "ch": ""
    },
    {
        "hex": "#9049c7",
        "ch": ""
    },
    {
        "hex": "#be75fa",
        "ch": ""
    },
    {
        "hex": "#D886FF",
        "ch": ""
    },
    {
        "hex": "#bbaacc",
        "ch": ""
    },
    {
        "hex": "#c3afd3",
        "ch": ""
    },
    {
        "hex": "#D4A7F8",
        "ch": ""
    },
    {
        "hex": "#E5D9EE",
        "ch": ""
    },
    {
        "hex": "rgba(190,117,250,.3)",
        "ch": ""
    },
    {
        "hex": "#F6E8FF",
        "ch": ""
    },
    {
        "hex": "#F2ECF6",
        "ch": ""
    },
    {
        "hex": "#F9EDFF",
        "ch": ""
    },
    {
        "hex": "rgba(242, 236, 246,0.8)",
        "ch": ""
    },
    {
        "hex": "#F6F2F9",
        "ch": ""
    },
    {
        "hex": "#A434BF",
        "ch": ""
    },
    {
        "hex": "#d87cde",
        "ch": ""
    },
    {
        "hex": "#f089f5",
        "ch": ""
    },
    {
        "hex": "#f8e3ff",
        "ch": ""
    },
    {
        "hex": "#fcf3ff",
        "ch": ""
    },
    {
        "hex": "#fbf8fb",
        "ch": ""
    },
    {
        "hex": "#391c32",
        "ch": ""
    },
    {
        "hex": "#5a314b",
        "ch": ""
    },
    {
        "hex": "#985e90",
        "ch": ""
    },
    {
        "hex": "#D652A9",
        "ch": ""
    },
    {
        "hex": "#b47da0",
        "ch": ""
    },
    {
        "hex": "#DD6EB7",
        "ch": ""
    },
    {
        "hex": "#fa75d6",
        "ch": ""
    },
    {
        "hex": "#EDD3E3",
        "ch": ""
    },
    {
        "hex": "#eee8ed",
        "ch": ""
    },
    {
        "hex": "#f9e7f2",
        "ch": ""
    },
    {
        "hex": "#FAE9F4",
        "ch": ""
    },
    {
        "hex": "#F9F0F6",
        "ch": ""
    },
    {
        "hex": "rgba(188,125,163,0.1)",
        "ch": ""
    },
    {
        "hex": "rgba(255, 184, 235, 0.15)",
        "ch": ""
    },
    {
        "hex": "#fdfafc",
        "ch": ""
    },
    {
        "hex": "#79153F",
        "ch": ""
    },
    {
        "hex": "#9E002C",
        "ch": ""
    },
    {
        "hex": "#A11B54",
        "ch": ""
    },
    {
        "hex": "#E20064",
        "ch": ""
    },
    {
        "hex": "#a87e90",
        "ch": ""
    },
    {
        "hex": "#e0afc9",
        "ch": ""
    },
    {
        "hex": "#FCDEED",
        "ch": ""
    },
    {
        "hex": "#f8e2ec",
        "ch": ""
    },
    {
        "hex": "#fffdfe",
        "ch": ""
    },
    {
        "hex": "#350004",
        "ch": ""
    },
    {
        "hex": "#7A2125",
        "ch": ""
    },
    {
        "hex": "#9d2a2f",
        "ch": ""
    },
    {
        "hex": "#A7252A",
        "ch": ""
    },
    {
        "hex": "#AD1D30",
        "ch": ""
    },
    {
        "hex": "#B53031",
        "ch": ""
    },
    {
        "hex": "#CA2B40",
        "ch": ""
    },
    {
        "hex": "#D2373D",
        "ch": ""
    },
    {
        "hex": "#D84647",
        "ch": ""
    },
    {
        "hex": "#F46488",
        "ch": ""
    },
    {
        "hex": "#F7718E",
        "ch": ""
    },
    {
        "hex": "#EF7C87",
        "ch": ""
    },
    {
        "hex": "#FA88A1",
        "ch": ""
    },
    {
        "hex": "#ff92a1",
        "ch": ""
    },
    {
        "hex": "#F6D4D7",
        "ch": ""
    },
    {
        "hex": "#FFE6E8",
        "ch": ""
    },
    {
        "hex": "rgba(235, 61, 79, 0.1)",
        "ch": ""
    },
    {
        "hex": "#FDECEE",
        "ch": ""
    },
    {
        "hex": "rgb(250,233, 235,0.8)",
        "ch": ""
    },
    {
        "hex": "#FFEDF1",
        "ch": ""
    },
    {
        "hex": "#FFF0F2",
        "ch": ""
    },
    {
        "hex": "#FCF1F2",
        "ch": ""
    },
    {
        "hex": "#fff1f3",
        "ch": ""
    },
    {
        "hex": "#FFF7F8",
        "ch": ""
    }
];

// colorData 배열에서 hex -> ch 매핑 생성
function extractColorData() {
    const colorMap = new Map();
    
    colorData.forEach(item => {
        const hex = item.hex.toLowerCase();
        const ch = item.ch;
        colorMap.set(hex, ch);
    });
    
    if (colorMap.size === 0) {
        throw new Error('colorData에서 색상 매핑을 찾을 수 없습니다.');
    }
    
    return colorMap;
}

// CSS 파일에서 hex 값을 var(--ch-토큰)으로 변경
function replaceHexInCss(cssContent, colorMap) {
    let modifiedContent = cssContent;
    let replacementCount = 0;
    
    // 각 hex 값에 대해 대소문자 구분 없이 매칭하여 교체
    colorMap.forEach((ch, hex) => {
        // 정규식으로 hex 값 찾기 (대소문자 구분 없이)
        // #cd652c, #CD652C, #Cd652C 등 모든 경우 매칭
        const regex = new RegExp(`#${hex.replace('#', '')}`, 'gi');
        const matches = modifiedContent.match(regex);
        
        if (matches) {
            modifiedContent = modifiedContent.replace(regex, `var(--${ch})`);
            replacementCount += matches.length;
            console.log(`  ✓ ${hex} → var(--${ch}) (${matches.length}개 교체)`);
        }
    });
    
    return { content: modifiedContent, count: replacementCount };
}

// CSS 폴더 내의 모든 CSS 파일 처리
function processCssFolder(cssFolderPath, colorMap) {
    if (!fs.existsSync(cssFolderPath)) {
        throw new Error(`CSS 폴더를 찾을 수 없습니다: ${cssFolderPath}`);
    }
    
    const files = fs.readdirSync(cssFolderPath, { recursive: true });
    const cssFiles = files.filter(file => 
        file.endsWith('.css') && 
        fs.statSync(path.join(cssFolderPath, file)).isFile()
    );
    
    if (cssFiles.length === 0) {
        console.log('⚠️  CSS 파일을 찾을 수 없습니다.');
        return;
    }
    
    console.log(`\n📁 ${cssFiles.length}개의 CSS 파일을 처리합니다...\n`);
    
    let totalReplacements = 0;
    
    cssFiles.forEach(cssFile => {
        const filePath = path.join(cssFolderPath, cssFile);
        console.log(`📄 처리 중: ${cssFile}`);
        
        try {
            const cssContent = fs.readFileSync(filePath, 'utf8');
            const { content: modifiedContent, count } = replaceHexInCss(cssContent, colorMap);
            
            if (count > 0) {
                fs.writeFileSync(filePath, modifiedContent, 'utf8');
                console.log(`  ✅ ${count}개 교체 완료\n`);
                totalReplacements += count;
            } else {
                console.log(`  ⚠️  교체할 hex 값을 찾지 못했습니다.\n`);
            }
        } catch (error) {
            console.error(`  ❌ 오류 발생: ${error.message}\n`);
        }
    });
    
    console.log(`\n✨ 총 ${totalReplacements}개의 hex 값이 CSS 변수로 교체되었습니다.`);
}

// 메인 함수
function main() {
    const args = process.argv.slice(2);
    
    if (args.length < 1) {
        console.log('사용법: node replace-hex-to-css-vars.js <css폴더경로>');
        console.log('예시: node replace-hex-to-css-vars.js html/solid2/page/input-f/css');
        process.exit(1);
    }
    
    const cssFolderPath = args[0];
    
    console.log('🚀 Hex to CSS 변수 변환 스크립트 시작\n');
    console.log(`📁 CSS 폴더: ${cssFolderPath}\n`);
    
    try {
        // colorData 추출
        console.log('📊 colorData 추출 중...');
        const colorMap = extractColorData();
        console.log(`✅ ${colorMap.size}개의 색상 매핑을 찾았습니다.\n`);
        
        // CSS 파일 처리
        processCssFolder(cssFolderPath, colorMap);
        
    } catch (error) {
        console.error(`\n❌ 오류: ${error.message}`);
        process.exit(1);
    }
}

main();

