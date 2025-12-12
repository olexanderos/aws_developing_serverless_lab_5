import { PublishCommand,SNSClient } from "@aws-sdk/client-sns";
const snsClient = new SNSClient({});

export const handler = async(event, context, callback) => {
  try {
    console.log('event= ' + JSON.stringify(event));
    console.log('context= ' + JSON.stringify(context));

    const runContext = event.ExecutionContext;
    console.log('runContext= ' + runContext);

    const runName = runContext.Execution.Name;
    console.log('runName= ' + runName);

    const statemachineName = runContext.StateMachine.Name;
    console.log('statemachineName= ' + statemachineName);

    const taskToken = runContext.Task.Token;
    console.log('taskToken= ' + taskToken);

    const apigwEndpint = event.APIGatewayEndpoint;
    console.log('apigwEndpint = ' + apigwEndpint)

    const approveEndpoint = apigwEndpint + "?action=approve&ex=" + runName + "&sm=" + statemachineName + "&taskToken=" + encodeURIComponent(taskToken);
    console.log('approveEndpoint= ' + approveEndpoint);

    const rejectEndpoint = apigwEndpint + "?action=reject&ex=" + runName + "&sm=" + statemachineName + "&taskToken=" + encodeURIComponent(taskToken);
    console.log('rejectEndpoint= ' + rejectEndpoint);

    const emailSnsTopic = process.env.emailSnsTopic;
    console.log('emailSnsTopic= ' + emailSnsTopic);

    var emailMessage = 'Welcome! \n\n';
    emailMessage += 'This is an email requiring an approval for a step functions execution. \n\n'
    emailMessage += 'Please check the following information and click "Approve" link if you want to approve. \n\n'
    emailMessage += 'Execution Name -> ' + runName + '\n\n'
    emailMessage += 'Approval Link: ' +'\n\n'
    emailMessage += '<alink>' + approveEndpoint + '</alink>' + '\n\n'
    emailMessage += 'Reject Link: ' +'\n\n'
    emailMessage += '<rlink>' + rejectEndpoint + '</rlink>' + '\n\n'

    var params = {
      Message: emailMessage,
      Subject: "Required approval from AWS Step Functions",
      TopicArn: emailSnsTopic
    };
    await snsClient.send(new PublishCommand(params));
    console.log('Email sent to '+ emailSnsTopic);
}
  catch (error) {
    console.log("Unable to send message");
    throw new Error(JSON.stringify(error));
}

}
