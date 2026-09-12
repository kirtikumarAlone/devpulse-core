import { getToken } from './auth.js'
import {simpleGit } from 'simple-git';
import path from 'path';
import os from 'os';
import fs from 'fs';
import ora from 'ora'

//Defingin the interface for the repo Data
interface PullDataOptions{
    owner:string,
    repo:string
}



export async function pullData({owner,repo}: PullDataOptions){
const token = getToken() //<-- Take a token to connect the github

const basedir = path.join(os.homedir(),'.devpulse', 'repos');
const loaclpath = path.join(basedir,`${owner}-${repo}`)

if(!fs.existsSync(basedir)){
    fs.mkdirSync(basedir,{recursive:true}) //<-- Check if exit if it's not then it Created
}

const CloneURL = `https://${token}@github.com/${owner}/${repo}.git`;

try{
    if(fs.existsSync(loaclpath)){
        console.log('🔄 Repository directory exists. Pulling latest changes...')
        const git = simpleGit(loaclpath);
         const remote = await git.remote(['show', 'origin']) as string
         const defaultBranch = remote.match(/HEAD branch: (\S+)/)?.[1] || 'main'
          await git.checkout(defaultBranch)
          await git.pull('origin', defaultBranch)
    }else{
        const spinner = ora('📥 Cloning repository...');
        const git = simpleGit()
        await git.clone(CloneURL,loaclpath)
        spinner.succeed('Repository cloned!')
    }
    const git = simpleGit(loaclpath)
    const diff = await git.diff()
    const commitsLog = await git.log({maxCount: 10})

    return {
        loaclpath,
        diff,
        commits:commitsLog.all,
    }
}catch (error) {
    console.error('❌ Failed to pull or clone repository data:', error);
    throw error;
  }
}
