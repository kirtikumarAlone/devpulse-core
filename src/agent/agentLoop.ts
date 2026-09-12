import { analyzeIssue } from '../ai/analyzeIssue.js'
import { applyFix } from '../sandbox/applyFix.js'
import { runTests, installDeps } from '../sandbox/runTests.js';

interface IssueRepoData {
  issueUrl: string;
  title: string;
  body: string;
  repoOwner: string;
  repoName: string;
  issueNumber: number;
  localPath: string;
  diff: string;
  commits: readonly object[];
}

interface AgentLoopResult {
  passed: boolean;
  finalOutput: string;
  writtenFiles?: string[];
  aiThought?: string;
  attempts?: number;
  testOutput?: string;
}

export async function agentLoop(data: IssueRepoData): Promise<AgentLoopResult> {
  const MAX_RETRIES = 3;
  let lastError = '';
  let totalAttempts = 0;

  await installDeps(data.localPath)

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    totalAttempts = attempt + 1;

    if (attempt > 0) {
      console.log(`\n🔄 [Attempt ${attempt}/${MAX_RETRIES}] Retrying with error context...`);
    } else {
      console.log('\n🚀 Starting initial fix loop...');
    }

    try {
      // 1. Call AI with error context on retry
      const aiResponse = await analyzeIssue({
        issueTitle: data.title,
        issueBody: data.body,
        diff: data.diff,
        commits: data.commits,
        localPath: data.localPath,
        previousError: lastError
      });

      // 2. Extract thought from AI response
      const thoughtMatch = aiResponse.match(/<thought>([\s\S]*?)<\/thought>/)
      const aiThought = thoughtMatch?.[1]?.trim() || ''

      // 3. Apply the fix and track written files
      const writtenFiles = applyFix(aiResponse, data.localPath);

      // 4. Run tests
      const testResult = await runTests(data.localPath);

      // 5. Tests passed — return success with full info
      if (testResult.passed) {
        console.log('✅ All tests passed!');
        return { 
          passed: true, 
          finalOutput: testResult.output,
          writtenFiles,
          aiThought,
          attempts: totalAttempts,
          testOutput: testResult.output
        };
      }

      // 6. Tests failed — save error for next attempt
      console.warn(`❌ Attempt ${attempt} failed.`);
      lastError = testResult.output;

    } catch (error: any) {
      console.error(`⚠️ Crash during attempt ${attempt}:`, error);
      lastError = error?.message || String(error);
    }
  }

  console.error('🛑 Max retries reached.');
  return { passed: false, finalOutput: lastError, attempts: totalAttempts };
}

