import * as fs from 'fs';
import * as path from 'path';

/**
 * Parses the AI response for <file name="..."> blocks and writes them to the local repository.
 * 
 * @param aiResponse - The raw string response from the AI model containing custom XML tags.
 * @param localPath - The absolute destination root path of the cloned sandbox repository.
 * @returns An array of relative paths representing the files successfully written to disk.
 */
export function applyFix(aiResponse: string, localPath: string): string[] {
  const regex = /<file name="([^"]+)">([\s\S]*?)<\/file>/g;
  const matches = [...aiResponse.matchAll(regex)];
  const writtenFiles: string[] = [];

  for (const match of matches) {
    const fileName = match[1]?.trim();   // Extract file name safely
    const content = match[2];            // Extract the accompanying code

    // Validation Guard: Skip if the regex match returned undefined or empty strings
    if (!fileName || !content) {
      continue;
    }

    // Build the absolute file path destination
    const fullPath = path.resolve(localPath, fileName);

    // Sandbox Guard: Block directory traversal attempts
    if (!fullPath.startsWith(path.resolve(localPath))) {
      console.warn(`[Sandbox Guard] Blocked attempt to write outside sandbox: ${fileName}`);
      continue;
    }

    const dir = path.dirname(fullPath);
    
    try {
      // Create the missing directory hierarchy recursively if it doesn't already exist
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Synchronously write the complete file contents to the absolute destination path
      fs.writeFileSync(fullPath, content, 'utf-8');
      
      writtenFiles.push(fileName);
      console.log(`✨ Applied patch: ${fileName}`);
    } catch (error) {
      console.error(`❌ Failed to write file ${fileName}:`, error);
    }
  }

  return writtenFiles;
}