
import axios from "axios";

//<------------------The Repo Exists Validation Function-------------------------------------------->
export async function checkRepoExists(owner:string,repo:string) {
    try{
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}`);
        if(response.status == 200){
            return true
        }
        else{
            return false
        }
    }catch(error:unknown){
        if(axios.isAxiosError(error)){
          if (error.response?.status === 404) {
                console.error('❌ Resource not found (404). Check your repository or issue URL.');
            return false;
        }
        console.error(`🌐 API Error (${error.response?.status}): ${error.message}`);
        return false
    } else {
        console.error('💥 An unexpected system error occurred:', error);
        return false
    }
}
}

//<---------------------------The Issus Exits Validation function----------------------------->
export async function checkIssueExists(url:string) {
    try{
        const parsedUrl = new URL(url);
        const [ , owner, repo ,, issueNumberStr] = parsedUrl.pathname.split('/');
        const newUrl = `https://api.github.com/repos/${owner}/${repo}/issues/${issueNumberStr}`
        const response = await axios.get(newUrl)
        if(response.status == 200){
            console.log(`the Repo Owner is : ${owner}`)
            console.log(`The Repo Name is : ${repo}`)
            console.log(`The Repo Issuses Number is : ${issueNumberStr}`)
            return true
        }
    }catch(error:unknown){
        if(axios.isAxiosError(error)){
            return false
        }
    }
}

