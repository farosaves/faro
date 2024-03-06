import { execSync } from "child_process"

export const GET = () => {
    try {
        const lastCommitUUID = execSync('git rev-parse HEAD').toString().trim();
        return new Response(JSON.stringify({ version: lastCommitUUID }));
        // return new Response(lastCommitUUID.toString());
    } catch (error) {
        return new Response('Error retrieving version', { status: 500 });
    }
}
