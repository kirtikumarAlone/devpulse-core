import { db } from "./client.js";
export async function findOrCreateRepo(name:string,localPath:string) {
    try{
        // Find one record
        const repoExits = await db.repository.findUnique({
             where:
              { 
                localPath: localPath, 
            } 
        })

        if(repoExits){
            return repoExits;
        }

        const newRepo = await db.repository.create({ 
            data: 
            {
                 name:name, 
                 localPath:localPath
                },
             })
        return newRepo
    }catch(error){
        console.error('❌ Error in findOrCreateRepo:', error);
        throw error
    }
}