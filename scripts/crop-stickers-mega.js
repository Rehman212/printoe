const path = require("path");
const fs = require("fs");
const sharp = require("D:/printoe/node_modules/sharp");

const SRC =
  "F:/Users/Rehman/.cursor/projects/d-printo-backend/assets/f__Users_Rehman_AppData_Roaming_Cursor_User_workspaceStorage_a305c3cd0e0a9d7ed391e4da14e312cc_images_image-4e9fd3d8-c543-4801-8e6b-e1984c5a432c.png";
const OUT = "D:/printoe/public/mega";

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const meta = await sharp(SRC).metadata();
  console.log("source", meta.width, meta.height);

  // Manual crops for 1024x621 reference mega-menu screenshot
  const crops = [
    { name: "sticker-types", left: 48, top: 58, width: 220, height: 92 },
    { name: "popular-stickers", left: 276, top: 58, width: 220, height: 92 },
    { name: "sticker-shapes", left: 504, top: 58, width: 220, height: 92 },
    { name: "sticker-materials", left: 732, top: 58, width: 220, height: 92 },
    { name: "label-types", left: 48, top: 318, width: 220, height: 92 },
    { name: "product-labels", left: 276, top: 318, width: 220, height: 92 },
    { name: "business-labels", left: 504, top: 318, width: 220, height: 92 },
    { name: "label-materials", left: 732, top: 318, width: 220, height: 92 },
  ];

  for (const c of crops) {
    const outPath = path.join(OUT, `${c.name}.jpg`);
    await sharp(SRC)
      .extract({
        left: c.left,
        top: c.top,
        width: c.width,
        height: c.height,
      })
      .jpeg({ quality: 90 })
      .toFile(outPath);
    console.log("wrote", c.name);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
