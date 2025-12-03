import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting seed...");

  // Clear existing data
  await prisma.recipeIngredient.deleteMany();
  await prisma.recipe.deleteMany();
  await prisma.userRecord.deleteMany();
  await prisma.color.deleteMany();
  await prisma.series.deleteMany();

  // Create Series
  const primarySeries = await prisma.series.create({
    data: {
      id: "series-primary",
      name: "Primary Color Collection",
      slug: "primary-colors",
      description:
        "基础三原色及衍生色系列 - Essential primary colors and their derivatives",
    },
  });

  const mechaSeries = await prisma.series.create({
    data: {
      id: "series-mecha",
      name: "Mecha Color Palette",
      slug: "mecha-colors",
      description:
        "机械模型专用配色系列，包含金属色和特殊色 - Specialized colors for mecha models, including metallic and special colors",
    },
  });

  console.log("✅ Created series:", primarySeries.name, mechaSeries.name);

  // Create Colors for Primary Series
  const primaryColors = await Promise.all([
    prisma.color.create({
      data: {
        id: "color-p-1",
        name: "Crimson Red (深红)",
        hex: "#DC143C",
        rgb: "220,20,60",
        description:
          "鲜明、深沉的正红色，力量与活力的象征。A vivid, deep true red symbolizing strength and vitality.",
        buyLink: "https://gaahleri.com/shop/crimson-red",
        seriesId: primarySeries.id,
      },
    }),
    prisma.color.create({
      data: {
        id: "color-p-2",
        name: "Azure Blue (蔚蓝)",
        hex: "#007FFF",
        rgb: "0,127,255",
        description:
          "明亮、纯净的蓝色，如晴空般开阔。A bright, pure blue as expansive as a clear sky.",
        buyLink: "https://gaahleri.com/shop/azure-blue",
        seriesId: primarySeries.id,
      },
    }),
    prisma.color.create({
      data: {
        id: "color-p-3",
        name: "Golden Yellow (金黄)",
        hex: "#FFC72C",
        rgb: "255,199,44",
        description:
          "带有光泽的黄色，象征财富与光明。A lustrous yellow symbolizing wealth and light.",
        buyLink: "https://gaahleri.com/shop/golden-yellow",
        seriesId: primarySeries.id,
      },
    }),
    prisma.color.create({
      data: {
        id: "color-p-4",
        name: "Pure White (纯白)",
        hex: "#FFFFFF",
        rgb: "255,255,255",
        description:
          "最纯净的白色，可用于调亮任何颜色。The purest white, can be used to lighten any color.",
        buyLink: "https://gaahleri.com/shop/pure-white",
        seriesId: primarySeries.id,
      },
    }),
    prisma.color.create({
      data: {
        id: "color-p-5",
        name: "Jet Black (墨黑)",
        hex: "#0A0A0A",
        rgb: "10,10,10",
        description:
          "深邃的黑色，可用于加深任何颜色。Deep black, can be used to darken any color.",
        buyLink: "https://gaahleri.com/shop/jet-black",
        seriesId: primarySeries.id,
      },
    }),
    prisma.color.create({
      data: {
        id: "color-p-6",
        name: "Forest Green (森林绿)",
        hex: "#228B22",
        rgb: "34,139,34",
        description:
          "深邃的绿色，如同密林般神秘。A deep green, mysterious like a dense forest.",
        buyLink: "https://gaahleri.com/shop/forest-green",
        seriesId: primarySeries.id,
      },
    }),
  ]);

  console.log("✅ Created primary colors:", primaryColors.length);

  // Create Colors for Mecha Series
  const mechaColors = await Promise.all([
    prisma.color.create({
      data: {
        id: "color-m-1",
        name: "Gunmetal Gray (枪灰)",
        hex: "#2C3539",
        rgb: "44,53,57",
        description:
          "经典机甲灰色，带有金属质感。Classic mecha gray with metallic texture.",
        buyLink: "https://gaahleri.com/shop/gunmetal-gray",
        seriesId: mechaSeries.id,
      },
    }),
    prisma.color.create({
      data: {
        id: "color-m-2",
        name: "Chrome Silver (铬银)",
        hex: "#C0C0C0",
        rgb: "192,192,192",
        description:
          "高光泽银色，适合金属部件。High-gloss silver, perfect for metal parts.",
        buyLink: "https://gaahleri.com/shop/chrome-silver",
        seriesId: mechaSeries.id,
      },
    }),
    prisma.color.create({
      data: {
        id: "color-m-3",
        name: "Warning Orange (警示橙)",
        hex: "#FF6600",
        rgb: "255,102,0",
        description:
          "醒目的橙色，常用于警示标记。Eye-catching orange, often used for warning marks.",
        buyLink: "https://gaahleri.com/shop/warning-orange",
        seriesId: mechaSeries.id,
      },
    }),
    prisma.color.create({
      data: {
        id: "color-m-4",
        name: "Titanium Blue (钛蓝)",
        hex: "#4682B4",
        rgb: "70,130,180",
        description:
          "冷峻的蓝色，带有科技感。A cool blue with a technological feel.",
        buyLink: "https://gaahleri.com/shop/titanium-blue",
        seriesId: mechaSeries.id,
      },
    }),
    prisma.color.create({
      data: {
        id: "color-m-5",
        name: "Reactor Green (反应堆绿)",
        hex: "#39FF14",
        rgb: "57,255,20",
        description:
          "荧光绿色，适合发光效果。Fluorescent green, perfect for glow effects.",
        buyLink: "https://gaahleri.com/shop/reactor-green",
        seriesId: mechaSeries.id,
      },
    }),
    prisma.color.create({
      data: {
        id: "color-m-6",
        name: "Rust Red (锈红)",
        hex: "#B7410E",
        rgb: "183,65,14",
        description:
          "旧化效果专用，模拟生锈质感。For weathering effects, simulates rust texture.",
        buyLink: "https://gaahleri.com/shop/rust-red",
        seriesId: mechaSeries.id,
      },
    }),
  ]);

  console.log("✅ Created mecha colors:", mechaColors.length);

  console.log("🎉 Seed completed successfully!");
  console.log(`   - ${2} Series created`);
  console.log(
    `   - ${primaryColors.length + mechaColors.length} Colors created`
  );
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
