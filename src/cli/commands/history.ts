import { getIssueHistory } from "../../db/issue.js";
import chalk from "chalk";

export async function historyCommand() {
  try {
    const issues = await getIssueHistory()

    if (issues.length === 0) {
      console.log(chalk.yellow('No issues solved yet. Run: solve <issue-url>'))
      return
    }

    console.log(chalk.cyan.bold('\n📋 Recent Issues:'))
    console.log(chalk.gray('─'.repeat(60)))

    issues.forEach((issue, index) => {
      const status = issue.status === 'in_progress' 
        ? chalk.yellow('⏳ in progress')
        : chalk.green('✅ solved')
      
      const date = new Date(issue.createdAt).toLocaleDateString()
      const repoName = issue.repository.name

      console.log(
        `${chalk.gray(`#${index + 1}`)} ${status} ${chalk.white(issue.title)} ${chalk.gray(`(${repoName}) ${date}`)}`
      )
    })

    console.log(chalk.gray('─'.repeat(60)))
    console.log(chalk.gray(`Total: ${issues.length} issues\n`))

  } catch (error) {
    console.log(chalk.red('❌ Failed to load history'))
  }
}