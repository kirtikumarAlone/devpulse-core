
import { readFileSync,  } from "fs";
import { join } from "path";
import { z } from "zod";


// setting.json schema of user can talk we any AI api provider
const SettingsSchema = z.object({
    env:z.object({
        API_endpoint:z.string().url("InValid API end Point"),
        API_KEY:z.string().min(1,"API key must be required"),
        Model_NAME:z.string().min(1,"modle name is required"),
        Default_Model:z.string().min(1,'Invalid Model Point'),
        DATABASE_URL: z.string().optional(),
    })
})

// Creating the Z interfaces
export type Settings = z.infer<typeof SettingsSchema>;


//define the function of loading the All procese setting
export function loadSettings(): Settings  {
    const SettingPath = join(process.cwd(),"setting.json")


    //if setting Path is empty so throw the error
    if(!SettingPath){
        console.error("setting.json not found. Run `devpulse config` to set it up.");
        process.exit(1)
    }

    //if setting path is exit os the read the file 
    const raw = readFileSync(SettingPath,'utf-8')


    //create a unknow variable for the stoing the all thing in json
    let parsed : unknown

    try{
        parsed = JSON.parse(raw)
    }catch {
    console.error("setting.json is not valid JSON.");
    process.exit(1);
  }

  // Store the result in of that json variable
  const result = SettingsSchema.safeParse(parsed)


  //if the rseuls is not success full so the it thow the error
  if (!result.success) {
    console.error("Invalid setting.json:");
    result.error.issues.forEach((e:any) => {
      console.error(`  - ${e.path.join(".")}: ${e.message}`);
    });
    process.exit(1);
  }
  

  //everything is good so return the result data
  return result.data
    
}