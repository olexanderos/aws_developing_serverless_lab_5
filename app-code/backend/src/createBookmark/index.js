import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
const dynamoClient = new DynamoDBClient({});

export const handler = async message => {
  console.log(message);
  
  //Fail the messages randomly to see those errors in X-Ray tracing. It's for testing only.
  if(Math.random() < 0.2)
    throw new Error('An unknown error occurred');

  //Can you throw a different response code other than 200?
  
  //Timeout failures about 10%
  if(Math.random() < 0.15) {
     await new Promise(resolve => setTimeout(resolve, 10000));
  };  

  if (message.body) {
    let bookmark = JSON.parse(message.body);
    let params = {
      TableName: process.env.TABLE_NAME,
      Item: {
        id: bookmark.id ,
        bookmarkUrl: bookmark.bookmarkUrl ,
        name: bookmark.name ,
        description: bookmark.description ,
        username: bookmark.username ,
        shared: bookmark.shared 
      }
    };  
    
    // Replace this line with segment annotation code 

    
    console.log(`Adding bookmark to table ${process.env.TABLE_NAME}`);
    await dynamoClient.send(new PutCommand(params));
    console.log(`New bookmark added to the inventory`);
  }

  return {
    statusCode: 200,
    headers: {"Access-Control-Allow-Origin": '*'},
    body: JSON.stringify({})
  };
}