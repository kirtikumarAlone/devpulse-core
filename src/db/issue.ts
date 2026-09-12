import { db } from "./client.js";

interface createDebugIssue{
    title:string
    repositoryId:string
}

interface createAgentStep{
    debugIssueId:string, 
    thought:string, 
    actionTaken:string,
    gitDiff:string,
    outputLog:string,
    stepNumber:number
}
export async function createDebugIssue({title, repositoryId}:createDebugIssue){
    try{
        const issue = await db.debugIssue.create({
            data:{
                title:title,
                repositoryId:repositoryId,
                status:'in_progress'
            }
        })
        return issue
    }catch(error) {
    console.error('❌ Error creating debug issue record:', error);
    throw error;
}
}

export async function createAgentStep(
    {
        debugIssueId,
        thought, 
        actionTaken,
        gitDiff,
        outputLog,
        stepNumber}:createAgentStep) {
    try{
        const step = await db.agentStep.create({
            data:{
                debugIssueId,
                thought,
                actionTaken,
                gitDiff,
                outputLog,
                stepNumber
            }
        })
        return step
    }catch(error){
        console.error(`❌ Error saving agent step #${stepNumber}:`, error);
    throw error;
    }
}


export async function getIssueHistory() {
  try {
    const issues = await db.debugIssue.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { repository: true }
    })
    return issues
  } catch (error) {
    console.error('❌ Failed to fetch issue history:', error)
    throw error
  }
}



export async function updateDebugIssueStatus(id: string, status: string) {
  try {
    await db.debugIssue.update({
      where: { id },
      data: { status }
    })
  } catch (error) {
    console.error('❌ Failed to update issue status:', error)
    throw error
  }
}