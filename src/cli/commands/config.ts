import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

// Resolve the path to setting.json in the project root
const CONFIG_PATH = path.resolve(process.cwd(), 'setting.json')

// Helper function to read config safely
function readConfig() {
  try {
    if (!fs.existsSync(CONFIG_PATH)) {
      return {
        env: {
          API_endpoint: '',
          Model_NAME: '',
          API_KEY: '',
          Default_Model: ''
        }
      }
    }
    const data = fs.readFileSync(CONFIG_PATH, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error(chalk.red('❌ Error reading setting.json:'), error)
    return { env: {} }
  }
}

export function showConfig() {
  const config = readConfig()
  const env = config.env || {}

  let maskedKey = chalk.dim('Not Set')
  if (env.API_KEY) {
    maskedKey = env.API_KEY.length > 12
      ? `${env.API_KEY.slice(0, 12)}****...hidden`
      : '****'
  }

  console.log(chalk.cyan('\n⚙️  Current Configuration:'))
  console.log(chalk.dim('─────────────────────────────────'))
  console.log(`${chalk.bold('API Endpoint:')}   ${chalk.green(env.API_endpoint || 'Not Set')}`)
  console.log(`${chalk.bold('Model:')}          ${chalk.green(env.Model_NAME || 'Not Set')}`)
  console.log(`${chalk.bold('API Key:')}        ${chalk.yellow(maskedKey)}`)
  console.log(`${chalk.bold('Default Model:')} ${chalk.green(env.Default_Model || 'Not Set')}`)
  console.log(chalk.dim('─────────────────────────────────'))
  console.log(chalk.cyan('Commands:'))
  console.log(`  config set endpoint <url>    ${chalk.dim('Set API endpoint')}`)
  console.log(`  config set model <name>      ${chalk.dim('Set model name')}`)
  console.log(`  config set key <api-key>     ${chalk.dim('Set API key')}\n`)
  console.log(`  config set database <url>    ${chalk.dim('Set database URL')}`)
}

export function setConfig(key: string, value: string) {
  const config = readConfig()
  if (!config.env) config.env = {}

  switch (key.toLowerCase()) {
    case 'endpoint':
      config.env.API_endpoint = value
      break
    case 'model':
      config.env.Model_NAME = value
      config.env.Default_Model = value
      break
    case 'key':
      config.env.API_KEY = value
      break
    case 'database':
      config.env.DATABASE_URL = value
      break
    default:
      console.log(chalk.red(`❌ Invalid key. Use: endpoint, model, or key`))
      return
  }

  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2), 'utf-8')
  console.log(chalk.green(`✅ Updated ${key} successfully!`))
}