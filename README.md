# Sendo Proof-of-concept

This is an open-source proof of concept of a [Tiplink](https://tiplink.io) alternative for distributing crypto assets via a simple link that can be shared with anyone even if you don't know their wallet address or they don't have a wallet.

## Features

- One click link creation and sharing
- One click claiming of assets
- Gasless transactions when claiming assets
- Web-based wallet when using web3auth
- Guide to create a non-custodial wallet and move all assets if the receiver wants to move from web3auth wallet to a non-custodial wallet

## How it works

- You connect your wallet, select the token you want to send and the amount
- You deposit the assets and the link is created
- You share the link with anyone you want to send the assets to
- They open the link and claim the assets to a new wallet (made with web3auth) or to their existing solana wallet by connecting it

## Tech stack

- Next.js 13 with app direcory for the frontend
- Next.js API routes for the backend
- Nextauth for authentication with Solana wallet
- Web3auth for creating a new wallet for the receiver if they don't have one
- TailwindCSS and Shadcn UI for styling

## Self hosting

### Prerequisites

- MongoDB database (you can create a free one on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register))
- Web3auth project (you can create a free one on [web3auth.io](https://web3auth.io))
- Optional but highly recommended: Sentry Project (you can create a free one on [Sentry](https://sentry.io))
- Solana Mainnet RPC (You can use Helius, extrnode, etc)

### Steps

- Clone the repo and install dependencies with `pnpm i`
- Create a `.env` file and add the `DATABASE_URL` variable by setting it to the MongoDB connection string
- Create a vault keypair with `node scripts/genKeypair.js`
- Create a `.env.local` file and add in the rest of the environment variables (see `.env.example` for reference)
- Run the app with `pnpm dev`

You can now host it on your favourite cloud provider like Vercel, Netlify, etc.

## Contributing

Contributions are welcome! Feel free to open an issue or a pull request.
