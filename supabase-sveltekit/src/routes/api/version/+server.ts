import { COMMIT_UUID } from "$env/static/private";

export const GET = () => {
    try {
        return new Response(JSON.stringify({ version: COMMIT_UUID }));
        // return new Response(lastCommitUUID.toString());
    } catch (error) {
        return new Response('Error retrieving version', { status: 500 });
    }
}
