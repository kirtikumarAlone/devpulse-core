#!/usr/bin/env node

import readline from 'readline'
import chalk from 'chalk'
import figlet from 'figlet'
import { solveCommand } from './commands/solve.js'
import { handleAuth } from '../github/auth.js'
import { historyCommand } from './commands/history.js'
import { showConfig, setConfig } from './commands/config.js'

const theme = {
  primary: chalk.cyan.bold,
  success: chalk.green.bold,
  error: chalk.red.bold,
  muted: chalk.gray,
  accent: chalk.magenta,
}

function showBanner() {
  console.log(theme.primary(figlet.textSync('DevPulse')))
  console.log(theme.muted('AI-powered GitHub issue solver\n'))
}

function showHelp() {
  console.log(`
${theme.primary('Available Commands:')}
  ${theme.accent('solve')} <issue-url>   Solve a GitHub issue automatically
  ${theme.accent('auth')}                Connect your GitHub account
  ${theme.accent('auth --status')}       Check GitHub connection status
  ${theme.accent('config')}              View current settings
  ${theme.accent('help')}                Show this help message
  ${theme.accent('exit')}                Exit DevPulse
  ${theme.accent('history')}             Show recent solved issues
  `)
}

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

rl.on('close', () => {
  console.log(theme.success('\n👋 Goodbye!'))
  process.exit(0)
})

function prompt() {
  try {
    rl.question(theme.primary('DevPulse > '), async (input) => {
      const parts = input.trim().split(' ')
      const command = parts[0]
      const args = parts.slice(1)

      switch (command) {
        case 'solve':
          if (!args[0]) {
            console.log(theme.error('❌ Please provide an issue URL'))
            console.log(theme.muted('Usage: solve https://github.com/owner/repo/issues/1'))
          } else {
            await solveCommand(args[0], { branch: 'main' })
          }
          break

        case 'auth':
          rl.pause()
          await handleAuth()
          rl.resume()
          break

        case 'help':
          showHelp()
          break

        case 'history':
            await historyCommand()
            break

        case 'config':
            const configArgs = args
            if (configArgs[0] === 'set' && configArgs[1] && configArgs[2]) {
                setConfig(configArgs[1], configArgs[2])
            } else {
                showConfig()
            }
            break

        case 'exit':
        case 'quit':
          console.log(theme.success('👋 Goodbye!'))
          process.exit(0)

        case '':
          break

        default:
          console.log(theme.error(`Unknown command: ${command}`))
          console.log(theme.muted('Type help to see available commands'))
      }

      prompt()
    })
  } catch (error: any) {
    if (error.code === 'ERR_USE_AFTER_CLOSE') {
      process.exit(0)
    }
    throw error
  }
}

showBanner()
showHelp()
prompt()