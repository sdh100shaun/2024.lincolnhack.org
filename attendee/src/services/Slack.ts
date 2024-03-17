import { WebClient } from '@slack/web-api';

const token: string = getApiKey();

const getApiKey = () => {
    const apiKey = process.env.SLACK_API_TOKEN;
    if (!apiKey) {
        console.error('SLACK_API_TOKEN is not set');
        return null;
    }
    return apiKey;
};

const web = new WebClient(token);

async function inviteNewUser(email: string, channel_ids: string, team_id: string) {
    try {
        await web.admin.users.invite({ email, channel_ids, team_id });
        console.log(`Successfully invited new user with email ${email}`);
    } catch (error) {
        console.error(`Error inviting new user with email ${email}:`, error);
    }
}
export default inviteNewUser;
