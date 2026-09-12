import readline from 'readline'
import { execSync } from 'child_process'
import os from 'os'
import fs from 'fs'
import path from 'path'
import chalk from 'chalk'

interface PRData {
  title: string
  body: string
  issueNumber: string
  writtenFiles: string[]
}

interface PRReviewResult {
  confirmed: boolean
  title: string
  body: string
}

function openInEditor(content: string): string {
  const tmpFile = path.join(os.tmpdir(), 'devpulse-pr.md')
  fs.writeFileSync(tmpFile, content)

  const editor = process.env.EDITOR ||
    (process.platform === 'win32' ? 'notepad' : 'nano')

  execSync(`${editor} ${tmpFile}`, { stdio: 'inherit' })

  return fs.readFileSync(tmpFile, 'utf-8')
}

function askQuestion(question: string): Promise<string> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  })
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.trim())
    })
  })
}

export async function reviewPR(prData: PRData): Promise<PRReviewResult> {
  console.log(chalk.cyan('\n📋 PR Preview:'))
  console.log(chalk.gray('─'.repeat(60)))
  console.log(`${chalk.bold('Title:')} ${chalk.white(prData.title)}`)
  console.log(chalk.gray('─'.repeat(60)))
  console.log(chalk.white(prData.body))
  console.log(chalk.gray('─'.repeat(60)))

  console.log(chalk.cyan('\n📁 Files Changed:'))
  prData.writtenFiles.forEach(f => {
    console.log(chalk.green(`  ✓ ${f}`))
  })

  while (true) {
    console.log(chalk.cyan('\nWhat do you want to do?'))
    console.log(`  ${chalk.bold('1.')} Submit PR as is`)
    console.log(`  ${chalk.bold('2.')} Edit title`)
    console.log(`  ${chalk.bold('3.')} Edit description in editor`)
    console.log(`  ${chalk.bold('4.')} Cancel`)

    const choice = await askQuestion(chalk.cyan('\nYour choice (1-4): '))

    switch (choice) {
      case '1':
        return { confirmed: true, title: prData.title, body: prData.body }

      case '2':
        const newTitle = await askQuestion(chalk.yellow('Enter new PR title: '))
        if (newTitle) prData.title = newTitle
        console.log(chalk.green(`✅ Title updated: ${prData.title}`))
        break

      case '3':
        console.log(chalk.yellow('\n📝 Opening editor... Save and close when done.'))
        prData.body = openInEditor(prData.body)
        console.log(chalk.green('✅ Description updated!'))
        break

      case '4':
        console.log(chalk.yellow('❌ PR cancelled.'))
        return { confirmed: false, title: prData.title, body: prData.body }

      default:
        console.log(chalk.red('Invalid choice. Please enter 1, 2, 3 or 4.'))
    }
  }
}