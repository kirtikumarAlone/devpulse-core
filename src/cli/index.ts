#!/usr/bin/env node

import { solveCommand } from "./commands/solve.js";
import { Command } from "commander";
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { handleAuth } from "../github/auth.js";
import chalk from "chalk";
import figlet from "figlet"; 
import { exit } from "process";
const program = new Command();

const theme = {
  primary: chalk.cyan.bold,
  secondary: chalk.blue,
  success: chalk.green.bold,
  error: chalk.red.bold,
  warning: chalk.yellow,
  accent: chalk.magenta,
  muted: chalk.gray
};


//<----------------------------------Devpulse-core command definations---------------------------------->
program
   .name('devpulse-core')
   .description(theme.muted('devpluse-core is a CLI tool that hepls the user to solve github issues in faster and efficent way whit the authomation and Power whit your most trusted AI provider'))    
   .version('1.0.0');
// Defining a command with options

//<------------------------The Solve command defination------------------------------------>
 program
   .command('solve')
   .description('Analyze a GitHub issue and attempt to solve it in a sandbox')
   .argument('<issue-url>', 'Full URL of the github issues to that need to solve')
   .option('-b, --branch <name>', 'The target branch to branch off from', 'main')
   .action(async (issueUrl, options) => {
     console.log(`🚀${theme.primary(' Starting agent for issue: ')}${chalk.underline(issueUrl)}`);
     console.log(`🔧 ${theme.muted('Options applied:')} ${chalk.italic(JSON.stringify(options))}\n`);
     await solveCommand(issueUrl,options) 
   });
   
  //<--------------------The Config command Defination------------------------------------->
   program
   .command('config')
   .description('Configure or view setting.json variables')
   .option('-s, --set <key=value>', 'Set a configuration key')
   .action((options) => {
   if (options.set) {
    console.log(`\n⚙️  ${theme.primary('Setting config:')} ${theme.accent(options.set)}`);
   } else {
     console.log(`\n📦 ${theme.primary('Displaying current configuration...')}`);
   }})

   //<-----------------------The auth Command Deifination-------------------------------->
 program
 .command('auth')
 .description('Connect your GitHub account using a Personal Access Token')
 .option('--status', 'Check if GitHub token is already saved')
 .action(async (options)=>{
   const configPath = path.join(os.homedir(), '.devpulse', 'config.json')
  
  if (options.status) {
    if (!fs.existsSync(configPath)) {
      console.log(`\n❌ ${theme.error('No token found.')} Run ${chalk.inverse(' devpulse auth ')} to connect.`);
      return
    }
    const raw = fs.readFileSync(configPath, 'utf-8')
    if (!raw.trim()) {
      console.log(`\n❌ ${theme.error('No token found.')} Run ${chalk.inverse(' devpulse auth ')} to connect.`);
      return
    }
    const config = JSON.parse(raw)
    if (config.github_token) {
      console.log(`\n✅ ${theme.success('Connected:')} GitHub token is securely saved.`);
    } else {
      console.log(`\n❌ ${theme.error('No token found.')} Run ${chalk.inverse(' devpulse auth ')} to connect.`);
    }
  } else {
    console.log(`\n🔐 ${theme.primary('Initiating GitHub Authentication Integration...')}`);
    await handleAuth()
  }
})
 
 //<------------------The Healper Text Function------------------------------------>
 program.addHelpText('beforeAll', () => {
   return theme.primary(figlet.textSync('Devpulse', { horizontalLayout: 'fitted' })) + 
          `\n${theme.muted('====================================================')}\n`;
});
 program.parse(process.argv);

            