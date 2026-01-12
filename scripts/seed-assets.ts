import prisma from "../lib/prisma";

async function main() {
  console.log("Seeding assets...");

  const assets = [
    {
      symbol: "USDT",
      name: "Tether",
      icon: "https://coin-images.coingecko.com/coins/images/325/large/Tether.png?1696501661",
      networks: [
        { 
          name: "Tron (TRC20)", 
          depositAddress: "T9yX8jZ7cpPhL7k3kL2m1n5x9jZ7cpPhL7",
          icon: "https://assets.coingecko.com/coins/images/1094/standard/tron-logo.png?1696502193"
        },
        { 
          name: "Ethereum (ERC20)", 
          depositAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          icon: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628"
        },
        { 
          name: "Arbitrum One", 
          depositAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          icon: "https://assets.coingecko.com/coins/images/16547/standard/arb.jpg?1721358242"
        },
        { 
          name: "Optimism", 
          depositAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          icon: "https://assets.coingecko.com/coins/images/25244/standard/Optimism.png?1696524385"
        },
        { 
          name: "BNB Smart Chain", 
          depositAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          icon: "https://assets.coingecko.com/coins/images/825/standard/bnb-icon2_2x.png?1696501970"
        },
      ]
    },
    {
      symbol: "BTC",
      name: "Bitcoin",
      icon: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400",
      networks: [
        { 
          name: "Bitcoin", 
          depositAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
          icon: "https://coin-images.coingecko.com/coins/images/1/large/bitcoin.png?1696501400"
        }
      ]
    },
    {
      symbol: "ETH",
      name: "Ethereum",
      icon: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628",
      networks: [
        { 
          name: "Ethereum (ERC20)", 
          depositAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          icon: "https://coin-images.coingecko.com/coins/images/279/large/ethereum.png?1696501628"
        },
        { 
          name: "Base", 
          depositAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d8976F",
          icon: "https://avatars.githubusercontent.com/u/108554348?s=280&v=4"
        },
      ]
    }
  ];

  for (const asset of assets) {
    const createdAsset = await prisma.cryptoAsset.upsert({
      where: { symbol: asset.symbol },
      update: {
        name: asset.name,
        icon: asset.icon,
      },
      create: {
        symbol: asset.symbol,
        name: asset.name,
        icon: asset.icon,
      },
    });

    console.log(`Upserted asset: ${createdAsset.symbol}`);

    // Delete existing networks for this asset to avoid duplicates
    await prisma.network.deleteMany({
      where: { assetId: createdAsset.id }
    });

    // Create networks
    for (const net of asset.networks) {
      await prisma.network.create({
        data: {
          name: net.name,
          depositAddress: net.depositAddress,
          icon: net.icon,
          assetId: createdAsset.id,
        }
      });
    }
  }

  console.log("Seeding completed.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
