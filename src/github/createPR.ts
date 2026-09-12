import { simpleGit } from "simple-git";
import { getToken } from "./auth.js";

export async function createPR(
  owner: string, 
  repo: string, 
  issueNumber: string, 
  localPath: string,
  issueTitle: string,
  writtenFiles: string[],
  prBody: string,
  attempts: number = 1
): Promise<string> {
  try {
    const token = getToken();
    const git = simpleGit(localPath);
    const branchName = `fix/issue-${issueNumber}`;

    // Get GitHub username from token
    const userRes = await fetch('https://api.github.com/user', {
      headers: { 
        'Authorization': `token ${token}`,
        'User-Agent': 'DevPulse-Agent'
      }
    })
    const user = await userRes.json() as { login: string }
    const username = user.login

    // Fork the repo to user's account
    console.log(`🍴 Forking ${owner}/${repo} to ${username}...`)
    await fetch(`https://api.github.com/repos/${owner}/${repo}/forks`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DevPulse-Agent'
      }
    })

    // Wait for fork to be ready
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Delete existing branch if it exists
    const branches = await git.branchLocal()
    if (branches.all.includes(branchName)) {
      await git.deleteLocalBranch(branchName, true)
    }

    // Create and switch to a new local branch
    await git.checkoutLocalBranch(branchName);

    // Stage all changes
    await git.add('.');

    // Check if there are any changes to commit
    const status = await git.status()
    if (status.files.length === 0) {
      throw new Error('No changes to commit — AI did not generate any file patches')
    }

    await git.commit(`fix: resolve issue #${issueNumber}`);

    // Set remote to user's fork and push
    await git.remote(['set-url', 'origin', 
      `https://${token}@github.com/${username}/${repo}.git`
    ])
    await git.push('origin', branchName)

    // Detect default branch of original repo
    const remoteInfo = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
      headers: {
        'Authorization': `token ${token}`,
        'User-Agent': 'DevPulse-Agent'
      }
    })
    const repoData = await remoteInfo.json() as { default_branch: string }
    const defaultBranch = repoData.default_branch || 'main'

    // Open a Pull Request using the reviewed body
    const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
      method: 'POST',
      headers: {
        'Authorization': `token ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'DevPulse-Agent'
      },
      body: JSON.stringify({
        title: issueTitle,
        head: `${username}:${branchName}`,
        base: defaultBranch,
        body: prBody
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`GitHub API responded with status ${response.status}: ${errorData}`);
    }

    const data = (await response.json()) as { html_url: string };
    console.log(`🔗 PR created: ${data.html_url}`);
    return data.html_url;

  } catch (error) {
    console.error('❌ Failed to create PR:', error);
    throw error;
  }
}