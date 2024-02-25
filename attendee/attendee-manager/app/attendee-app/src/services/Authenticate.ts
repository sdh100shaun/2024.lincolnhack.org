//service to validate the user id in dynamo db
import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

export const isUser = async (email: string, passcode: string): Promise<boolean> => {
    if (email && passcode) {
        const params = {
            TableName: process.env.ATTENDEE_TABLE,
            Key: {
                email: { S: email },
                passcode: { S: passcode },
            },
        };
        try {
            const dynamoDbClient = new DynamoDBClient({ region: process.env.AWS_REGION });
            const data = await dynamoDbClient.send(new GetItemCommand(params));
            if (data.Item) {
                return data.Item.email.S === email && data.Item.passcode.S === passcode;
            } else {
                return false;
            }
        } catch (error) {
            console.error('Error not found as user', error);
            return false;
        }
    }
    return false;
};
