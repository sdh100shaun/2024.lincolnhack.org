import { DynamoDBClient, GetItemCommand } from '@aws-sdk/client-dynamodb';

export class DynamoDb {
    constructor(private readonly client: DynamoDBClient, private readonly tableName: string) {}

    public async getUserByEmail(email: string): Promise<object | undefined> {
        const params = {
            TableName: this.tableName,
            Key: {
                email: {
                    S: email,
                },
            },
        };

        const result = await this.client.send(new GetItemCommand(params));
        return result.Item;
    }
}

export default DynamoDb;
