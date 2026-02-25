# EventHorizon

A decentralized voting system designed to empower communities to make transparent and verifiable decisions.

## Introduction
VeriBallot is a Web3 platform built to handle secure, transparent, and democratic voting for organizations, schools, or any community group. Leveraging blockchain technology, VeriBallot guarantees that every vote is tamper-proof, immutable, and accurately counted, ensuring the highest level of integrity in the voting process.

## Features
- **Immutable Voting:** Built with smart contracts to ensure votes cannot be altered once cast.
- **Transparent Results:** Everyone can verify the integrity of the election on the blockchain.
- **AI-Powered Proposal Insights:** Smart analysis checks the quality of proposals to ensure complete information before voting begins.
- **Modern User Interface:** A sleek and responsive React frontend configured with Vite.

## Technology Stack
- **Frontend:** React, TypeScript, Vite, Tailwind CSS, Shadcn UI
- **Backend/AI:** Node.js, Express (AI Service)
- **Blockchain:** Ethers.js, Solidity
- **Smart Contract Environment:** Hardhat

## Quick Start

### Prerequisites
Make sure you have Node.js and npm installed.

### Installation

1. Copy the repository and navigate to the project directory:
   ```bash
   cd VeriBallot
   ```

2. Install dependencies for the frontend and AI service:
   ```bash
   cd frontend
   npm install
   cd ../ai-service
   npm install
   cd ..
   ```

### Running the App Locally

1. **Start the Frontend Directory:**
   In a terminal, navigate to the `frontend` directory and run:
   ```bash
   npm run dev
   ```
   The UI will typically be available at `http://localhost:5173`.

2. **Start the AI Service:**
   In a new terminal window, navigate to the `ai-service` directory and run:
   ```bash
   npm start
   ```
   This handles intelligent analysis of proposals submitted through the platform.

## Deployment to Vercel

### Root Directory Deployment Fix
If you deployed to Vercel by selecting the **root folder** of the repository (where this README is), Vercel will attempt to look at `d:\SrmAP\Fullstack\VeriBallot\vercel.json`. The app itself is in `frontend/`. 
To fix 404 errors, do the following:

1. Import your GitHub repository to Vercel.
2. In the "Configure Project" step, explicitly set the **Root Directory** to `frontend`.
3. The Build Command should be `npm run build` and the Output Directory should be `dist`.
4. Deploy!

## Contributing
Contributions are welcome! Please submit a pull request or open an issue if you encounter any problems or have suggestions for improvements.
