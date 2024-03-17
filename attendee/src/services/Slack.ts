import { WebClient } from '@slack/web-api';

const token: string = (apiKey?: string) => {
    apiKey || process.env.SLACK_API_TOKEN;
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
