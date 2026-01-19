#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const network = process.argv[2];

if (!network) {
  console.error("Usage: node prepare-network.js <network>");
  process.exit(1);
}

const networksPath = path.join(__dirname, "..", "networks.json");
const networks = JSON.parse(fs.readFileSync(networksPath, "utf8"));

if (!networks[network]) {
  console.error(`Network "${network}" not found in networks.json`);
  console.error("Available networks:", Object.keys(networks).join(", "));
  process.exit(1);
}

const config = networks[network].StreamPayment;

const templatePath = path.join(__dirname, "..", "subgraph.template.yaml");
const outputPath = path.join(__dirname, "..", "subgraph.yaml");

let template = fs.readFileSync(templatePath, "utf8");

template = template
  .replace(/\{\{network\}\}/g, network)
  .replace(/\{\{address\}\}/g, config.address)
  .replace(/\{\{startBlock\}\}/g, config.startBlock);

fs.writeFileSync(outputPath, template, "utf8");

console.log(`✅ Prepared subgraph.yaml for network: ${network}`);
console.log(`   Address: ${config.address}`);
console.log(`   Start Block: ${config.startBlock}`);
