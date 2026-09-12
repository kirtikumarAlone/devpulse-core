import path from 'path';
import fs from 'fs';
import { loadSettings } from '../config/loadSettings.js';

interface AnalyzeIssueOptions {
  issueTitle: string
  issueBody: string
  diff: string
  commits: readonly object[]
  localPath: string
  previousError?: string
}

function getRepoFiles(localPath: string): string {
  let fileContents = ''
  try {
    const files = fs.readdirSync(localPath)
    for (const file of files) {
      const filePath = path.join(localPath, file)
      const stat = fs.statSync(filePath)
      if (stat.isFile() && (
        file.endsWith('.js') ||
        file.endsWith('.ts') ||
        file.endsWith('.jsx') ||
        file.endsWith('.tsx')
      )) {
        const content = fs.readFileSync(filePath, 'utf-8')
        fileContents += `\n=== ${file} ===\n${content}\n`
      }
    }
  } catch (e) {}
  return fileContents || 'No source files found'
}

export async function analyzeIssue({
  issueTitle,
  issueBody,
  diff,
  commits,
  localPath,
  previousError  
}: AnalyzeIssueOptions): Promise<string> {
  const settings = loadSettings();
  const { API_KEY, API_endpoint, Model_NAME } = settings.env;

  let packageJsonContent = 'No package.json found';
  const packageJsonPath = path.join(localPath, 'package.json');
  if (fs.existsSync(packageJsonPath)) {
    packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
  }

  const repoFiles = getRepoFiles(localPath)

  const systemPrompt = `You are an elite, highly autonomous AI Software Engineer agent designed to operate inside a strict sandbox environment. Your sole purpose is to diagnose complex engineering problems, analyze repositories, and provide deterministic, production-grade bug fixes or features. 
You do NOT have access to any shell, terminal, or file system tools. 
Work only with the context provided to you.
CRITICAL OPERATIONAL CONSTRAINTS:
1. DO NOT write conversational prose, summaries, greetings, or post-fix explanations.
2. DO NOT use standard Markdown backticks (\`\`\`) to wrap your code solutions.
3. You must ONLY output the structural XML tags specified in the user prompt to declare code updates.
4. Any explanation, reasoning, or non-code text MUST be tightly wrapped inside an optional \`<thought>\` tag at the absolute beginning of your response. Nothing outside of strict tags is permitted.
5. All code modifications must be mathematically sound, syntactically perfect, fully implemented (no placeholders or "// TODO: rest of code"), and strictly adhere to the project's existing architectural style, ECMAScript module configuration, and TypeScript specifications.
6. If you include a <thought> block, it must be the FIRST thing in your response before any <file> tags.
7. CRITICAL: Only modify files that already exist in the repository. Do NOT create new files unless the issue explicitly requires it. If no test file exists, create one that verifies your fix works.
The test file must use Node.js built-in assert module.`;

  const userPrompt = `You are assigned to resolve a high-priority engineering issue within the codebase. Below is the full contextual payload including the target issue, local system diffs, historical context, and the repository's configuration state.

=== CONTENT BOUNDARIES ===

=== GITHUB ISSUE ===
Title: ${issueTitle}
Description:
${issueBody || 'No description provided.'}

=== RECENT GIT DIFF ===
${diff || 'No recent diff changes.'}

=== RECENT COMMITS HISTORY ===
${JSON.stringify(commits.slice(0, 5), null, 2)}

=== REPOSITORY PACKAGE.JSON ===
${packageJsonContent}

=== REPOSITORY SOURCE FILES ===
${repoFiles}

=== END OF CONTENT BOUNDARIES ===

INSTRUCTIONS & TASK PIPELINE:
1. Deep Contextual Analysis: Cross-reference the GitHub issue against the actual source files, package.json dependencies, and recent commit history to isolate the root cause.
2. IMPORTANT: Only modify files that are shown in the REPOSITORY SOURCE FILES section above. Use the exact same file names.
3. Formulate Sandbox Patch: Design a precise code modification plan that cleanly resolves the issue.
4. Output Generation: Transform your solution into code modifications using the strict structural syntax defined below.

OUTPUT FORMAT REQUIREMENTS:
<file name="exact/filename/from/repo.js">
// Full updated file content here
</file>

<thought>
Write your engineering breakdown here.
</thought>

CRITICAL ENFORCEMENT RULES:
- Use EXACT file names from the REPOSITORY SOURCE FILES section
- Do not create new files unless absolutely necessary
- Do not add any conversational text before, between, or after the tags
${previousError ? `\n=== PREVIOUS FIX FAILED WITH THIS ERROR ===\n${previousError}` : ''}`;

  try {
    console.log(`🤖 Sending data context to AI model (${Model_NAME})...`);

    const response = await fetch(API_endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: Model_NAME,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.2
      })
    });

    if (!response.ok) {
      throw new Error(`AI Provider responded with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json() as { choices: { message: { content: string } }[] };
    return data.choices[0]?.message?.content || 'No response content generated by the AI.';

  } catch (error) {
    console.error('❌ Failed to run AI Analysis:', error);
    throw error;
  }
}