export function parseGithubUrl(url:string){
    const New_Split_Url = new URL(url)
    const [,owner,repo,,issueNumberStr] = New_Split_Url.pathname.split('/');
    if (!owner || !repo || !issueNumberStr) {
        throw new Error("Invalid GitHub issue URL")
    }
    return {
        owner:owner,
        repo:repo,
        issueNumberStr:issueNumberStr
    }
}


