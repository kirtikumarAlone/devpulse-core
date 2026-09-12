import { getToken } from './auth.js';

interface FetchIssueOptions {
  owner: string;
  repo: string;
  issueNumber: number | string;
}

interface GitHubIssueResponse {
  title: string;
  body: string;
}

export async function fetchIssue({ owner, repo, issueNumber }: FetchIssueOptions): Promise<GitHubIssueResponse> {
  // 1. Get the authenticated token
  const token = getToken();

  // 2. Construct the GitHub API endpoint URL
  const url = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumber}`;

  try {
    console.log(`🔍 Fetching details for issue #${issueNumber}...`);

    // 3. Make the API request with the proper headers
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `token ${token}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'devpulse-cli' // GitHub API requires a User-Agent header
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}: ${response.statusText}`);
    }

    // 4. Parse the response and extract only what we need
    const data = await response.json() as { title: string; body: string };

    return {
      title: data.title,
      body: data.body || '' // Fallback to empty string if the body is null/empty
    };

  } catch (error) {
    console.error(`❌ Failed to fetch issue #${issueNumber}:`, error);
    throw error;
  }
}