import { password, input } from '@inquirer/prompts';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export async function handleAuth(){
    try{
        const token = await password({
            message:'Paste your GitHub Personal Access Token: ',
            validate:(value) => value.length > 0 || 'Token cannot be empty!',
        })

        const configDir = path.join(os.homedir(), ".devpulse")
        const configPath = path.join(os.homedir(), ".devpulse", "config.json") 


        if(!fs.existsSync(configDir)){
            fs.mkdirSync(configDir, { recursive: true })
        }

        const ConfigData = {github_token:token}

        fs.writeFileSync(configPath, JSON.stringify(ConfigData, null,2))

        console.log('✅ GitHub token saved successfully!')
    }catch(error){
        console.log("Github authenticaion cancelled")
    }
}

export function getToken(): string {
  const configPath = path.join(os.homedir(), '.devpulse', 'config.json')
  
  if (!fs.existsSync(configPath)) {
    console.error('❌ No GitHub token found. Run devpulse auth first.')
    process.exit(1)
  }

  const raw = fs.readFileSync(configPath, 'utf-8')
  const config = JSON.parse(raw)

  if (!config.github_token) {
    console.error('❌ No GitHub token found. Run devpulse auth first.')
    process.exit(1)
  }

  return config.github_token
}