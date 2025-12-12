import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { PutCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const dynamodb = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamodb);

console.log('Loading function');

export const handler = async (event, context) => {
    if (event) {
    let bookmark = event.detail.Records[0].dynamodb.NewImage;
    let params = {
      TableName: process.env.TABLE_NAME,
      Item: {
        id: event.detail.Records[0].dynamodb.Keys.id.S ,
        url: bookmark.url.S ,
        name: bookmark.name.S ,
        description: bookmark.description.S ,
        username: bookmark.username.S 
      }
    }; 
    console.log(event)
    console.log("In ")
    console.log(event.detail.Records[0].dynamodb.Keys.id.S)
    console.log(event.detail.Records[0].dynamodb)
    console.log(event.detail.Records[0].dynamodb.NewImage)
    console.log(event.detail.Records[0].dynamodb.NewImage.shared)
    console.log(event.detail.Records[0].dynamodb.NewImage.name.S)
    console.log(event.detail.Records[0].dynamodb.NewImage.url.S)
    console.log(event.detail.Records[0].dynamodb.NewImage.username.S)
    console.log(event.detail.Records[0].dynamodb.NewImage.description.S)
    if ( event.detail.Records[0].dynamodb.NewImage.shared === true) {
    console.log(`Adding bookmark to table ${process.env.TABLE_NAME}`);
    await docClient.send(new PutCommand(params));
    console.log(`New bookmark added to the inventory`);
    }
    else {
      console.log("did not match")
    }
    
    }
    // return `Successfully processed ${event.Records.length} records.`;
    return `Successfully processed`;
}