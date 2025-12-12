# Lab 5: Securing Serverless Applications

## Lab overview
Before you’ll be able to make this application available outside of your development team, you need to review security best practices for securing access and protecting resources and data. You have successfully completed coding your application with several features and have also taken care of observability and monitoring aspects of the bookmark application. In this lab, you look into security aspects to ensure the protection of your resources and data and to avoid application outages.

The following architecture diagram shows the components that have been and will be deployed:

<img width="1125" height="1372" alt="image" src="https://github.com/user-attachments/assets/33f3332a-a3b5-4c80-96b7-82dd4958c542" />

This lab uses the following services:

* AWS Amplify
* AWS Serverless Application Model (AWS SAM)
* Amazon Cognito
* Amazon DynamoDB
* Amazon EventBridge
* Amazon Simple Notification Service (Amazon SNS)
* AWS Step Functions
* AWS Lambda
* Amazon CloudWatch
* Amazon API Gateway
* AWS WAF
* AWS Key Management Service (AWS KMS)
* AWS Systems Manager Parameter Store
* AWS Secrets Manager

### Objectives

After completing this lab, you will be able to:

Secure your application with AWS WAF web ACLs
Secure access to your API with an API Gateway resource policy
Secure your Lambda functions and other backend services with AWS KMS, Systems Manager Parameter Store, and Secrets Manager


## Task 1: Understanding AWS WAF and securing the application with web ACLs
**AWS WAF** is a web application firewall that helps protect your web applications or APIs against common web exploits that may affect availability, compromise security, or consume excessive resources. AWS WAF gives you control over how traffic reaches your applications by enabling you to create security rules that block common attack patterns, such as SQL injection or cross-site scripting, and rules that filter out specific traffic patterns you define.

You can get started quickly using AWS Managed Rules for AWS WAF, a pre-configured set of rules managed by AWS or AWS Marketplace sellers. AWS Managed Rules for AWS WAF address issues like the OWASP Top 10 security risks. These rules are regularly updated as new issues emerge. AWS WAF includes a full-featured API that you can use to automate the creation, deployment, and maintenance of security rules.

### Task 1.1: Securing with AWS WAF web ACLs
A web access control list (web ACL) has a capacity of 1,500. You can add hundreds of rules and rule groups to a web ACL. The total number that you can add is based on the complexity and capacity of each rule.

A rate-based rule tracks the rate of requests for each originating IP address and triggers the rule action on IPs with rates that exceed a limit. You set the limit as the number of requests per a 5-minute time span. You can use this type of rule to put a temporary block on requests from an IP address that’s sending excessive requests. By default, AWS WAF aggregates requests based on the IP address from the web request origin, but you can configure the rule to use an IP address from an HTTP header, such as X-Forwarded-For, instead.

When the rule action triggers, AWS WAF applies the action to additional requests from the IP address until the request rate falls below the limit. It can take a minute or two for the action change to go into effect.

In this task, you create a web ACL to secure the API Gateway resources using AWS WAF.

### Create a web ACL

<img width="738" height="310" alt="image" src="https://github.com/user-attachments/assets/e50a59ed-7234-445b-b37d-4e15d4c6cf87" />
<img width="709" height="651" alt="image" src="https://github.com/user-attachments/assets/f4e501cc-3820-4dd9-a50d-ea8e6a9ca144" />

The web ACL has been created, and an ID has been generated for the web ACL.

### Attach the web ACL to API Gateway
<img width="712" height="289" alt="image" src="https://github.com/user-attachments/assets/5edcd01d-d586-4c69-8f26-3523929100f2" />

You should see a service message reading, *Successfully updated stage ‘dev’*. The web ACL is assigned to the **dev** stage of the bookmark application.

<img width="722" height="71" alt="image" src="https://github.com/user-attachments/assets/ebb33c36-f832-49d6-a356-1378e15b62da" />

### Test the web ACL using Artillery
First, you load the bookmark data using the Artillery tool within the Visual Studio Code (VS Code) IDE (integrated development environment) and then invoke a load test.

<img width="726" height="148" alt="image" src="https://github.com/user-attachments/assets/fc2eed5a-ffb4-49ca-8f6b-73432241e46f" />

```bash
cd app-code/test
TOKEN=$(curl --request PUT "http://169.254.169.254/latest/api/token" --header "X-aws-ec2-metadata-token-ttl-seconds: 3600")
echo export AWS_REGION=$(curl -s http://169.254.169.254/latest/meta-data/placement/region --header "X-aws-ec2-metadata-token: $TOKEN") >> ~/environment/app-code/labVariables
source ~/environment/app-code/labVariables
echo export API_GATEWAY_ID=$(aws apigateway get-rest-apis --query 'items[?name==`Bookmark App`].id' --output text) >> ~/environment/app-code/labVariables
source ~/environment/app-code/labVariables
echo export API_GATEWAY_URL=https://${API_GATEWAY_ID}.execute-api.${AWS_REGION}.amazonaws.com/dev >> ~/environment/app-code/labVariables
source ~/environment/app-code/labVariables
sed -Ei "s|<API_GATEWAY_URL>|${API_GATEWAY_URL}|g" simple-post.yaml
cd ..
```

> [!NOTE]
> The script is running the AWS CLI command the API Gateway ID and the AWS region to construct the API Gateway URL. This URL is then substituted in the placeholder <API_GATEWAY_URL> in the **simple-post.yaml** file.

<img width="305" height="27" alt="image" src="https://github.com/user-attachments/assets/2c7c5c3d-8488-462b-9264-bbc06c7865b8" />

```bash
cd ~/environment/app-code/test && artillery run simple-post.yaml
```

This script runs for 30 seconds, adding data through the API and then invoking the createBookmark Lambda function. In the next steps, you run a curl command to retrieve one of the bookmark details that was added in the above step.

<img width="692" height="130" alt="image" src="https://github.com/user-attachments/assets/db9ab6f4-3eec-4979-beab-a9d08fde1a48" />

You see the list of items added to the **bookmarksTable** by the artillery run.

<img width="704" height="46" alt="image" src="https://github.com/user-attachments/assets/46ed0d7e-ed34-48c1-9966-1edeabb34f13" />

```bash
source ~/environment/app-code/labVariables
echo export ID=$(aws dynamodb scan --table-name bookmarksTable --query Items[0].id --output text) >> ~/environment/app-code/labVariables
source ~/environment/app-code/labVariables
curl ${API_GATEWAY_URL}/bookmarks/${ID}

```
**Expected output:**
```json
******************************
**** This is OUTPUT ONLY. ****
******************************

{"username":"george.washington","description":"non dignissimos explicabo","shared":false,"id":"8633d79a-9410-4705-93ea-1a4a0ea76010","name":"aliquam totam illo","bookmarkUrl":"https://buford.biz"}

```
The **curl** command invokes the **getBookmark** Lambda function to retrieve the bookmark details of the provided item id. The bookmark details are displayed in a JSON format in the terminal.

<img width="604" height="28" alt="image" src="https://github.com/user-attachments/assets/449179ba-36b7-4a43-a5bb-6ce6af0acd64" />

> [!NOTE]
>  This command creates a load test of 2000 requests for the user “ben.franklin” because the goal is to reach 100 requests per minute. The 200 status code for each request indicates that the request has been successful.

<img width="722" height="54" alt="image" src="https://github.com/user-attachments/assets/fb76454b-74d0-412a-9ea5-32ce29cbc22e" />

```bash
source ~/environment/app-code/labVariables
curl ${API_GATEWAY_URL}/bookmarks/${ID}
```

<img width="361" height="33" alt="image" src="https://github.com/user-attachments/assets/2d07d281-0ec2-4e94-9ba2-4cf5ffcf4b65" />

```json
{"message": "Forbidden"}
```

This message is displayed because the web ACL you created is blocking the request to the bookmark application. Specifying conditions in a web ACL allows you to protect your application resources. API Gateway rejects any further calls after the first 100 requests made in 1 minute. When AWS WAF sees continuous requests from the same source IP address, it blocks all future calls based on the rule. After a few minutes, AWS WAF releases the restrictions and automatically lets the calls in.

You can check the requests that are blocked by the web ACL in the AWS WAF console.

<img width="586" height="91" alt="image" src="https://github.com/user-attachments/assets/b414a70f-014a-4b49-bd48-c09d50a639a5" />

Now, you see the requests in the **BLOCK** state. As AWS WAF releases the restrictions after a few minutes, you invoke the API Gateway endpoint to see if the request is still being blocked.

> [!NOTE]
> It might take up to 5 minutes for AWS WAF to release the restrictions.

<img width="482" height="27" alt="image" src="https://github.com/user-attachments/assets/4a999995-42a3-4ebc-a2f0-5719ceba8a32" />

```bash
source ~/environment/app-code/labVariables
curl ${API_GATEWAY_URL}/bookmarks/${ID}
```

This command displays the bookmark details for the provided **id**.

> [!NOTE]
> If you do not see the bookmark details, wait until the restrictions are released, and run the above curl command again.

### Task 1.2: Securing with AWS WAF using an IP Address

In this section, you create an IP set that contains an IP address from which you want to block any requests to your application.

<img width="680" height="145" alt="image" src="https://github.com/user-attachments/assets/d4f64bb0-652b-4d3d-84b5-57dafb41d8e8" />
<img width="640" height="105" alt="image" src="https://github.com/user-attachments/assets/0afe106e-84b1-42b6-ad89-5e184d58280f" />


```bash
curl https://checkip.amazonaws.com/
```
Copy the IP address displayed in the terminal, and paste it into the **IP addresses** field on the **Create IP** set page. Append `/32` to the end of the IP address.

> [!NOTE]
> Without the CIDR block of `/32`, an error will be thrown if the **Create IP** set is chosen.

<img width="341" height="31" alt="image" src="https://github.com/user-attachments/assets/4a314650-b436-476c-b4f9-1e4dcb859e96" />

An IP set has been successfully created. Now, you need to attach the IP set to a web ACL.

<img width="637" height="413" alt="image" src="https://github.com/user-attachments/assets/97bbcaec-277f-474b-90f7-531bf2db3ff5" />

The web ACL has been created, and an ID has been generated for the web ACL.

### Attach the web ACL to API Gateway
<img width="653" height="184" alt="image" src="https://github.com/user-attachments/assets/a729efe7-58ad-4359-8f91-69ebbbc729bc" />

The web ACL has been assigned to the dev stage of the bookmark application.

### Test the web ACL using curl

<img width="733" height="45" alt="image" src="https://github.com/user-attachments/assets/b0abadc5-69aa-496d-9e88-bf7990695a7e" />

```bash
source ~/environment/app-code/labVariables
curl ${API_GATEWAY_URL}/bookmarks/${ID}
```

<img width="723" height="46" alt="image" src="https://github.com/user-attachments/assets/202ef7c0-554d-4d92-bb92-16014b14f7d6" />

```json
{"message": "Forbidden"}
```

Before you proceed to the next task, you must remove the above web ACL because it blocks requests to the application from your IP address.

<img width="699" height="164" alt="image" src="https://github.com/user-attachments/assets/4920f0cc-34cf-4364-9155-86a31b848aaa" />

This step disassociates the web ACL from the **dev** stage of the bookmark application.

## Task 2: Securing the application with API Gateway resource policies

API Gateway resource policies are JSON policy documents that you attach to an API to control whether a specified principal (typically an AWS Identity and Access Management [IAM] user or role) can invoke the API. You can use API Gateway resource policies to allow your API to be securely invoked by the following:

* Users from a specified AWS account
* Specified source IP address ranges or CIDR blocks
* Specified virtual private clouds (VPCs) or VPC endpoints (in any account)

You can attach a resource policy to an API by using the AWS Management Console, AWS Command Line Interface (AWS CLI), or AWS SDKs. API Gateway resource policies are different from IAM policies. IAM policies are attached to IAM entities (users, groups, or roles) and define what actions those entities are capable of doing on which resources. API Gateway resource policies are attached to resources. For a more detailed discussion of the differences between identity-based (IAM) policies and resource policies, see (Identity-Based Policies and Resource-Based Policies)[https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies_identity-vs-resource.html].

You can use API Gateway resource policies together with IAM policies. In this task, you learn how to add certain IP addresses or a range of IP addresses to an allow list to access your API Gateway resources. You create a resource policy for the bookmark API that denies access to any IP address that isn’t specifically allowed.

<img width="436" height="33" alt="image" src="https://github.com/user-attachments/assets/f8f39c17-5cc4-466b-8f73-5a068bea27c4" />

https://checkip.amazonaws.com/

<img width="723" height="183" alt="image" src="https://github.com/user-attachments/assets/d8978a01-0546-444d-9c43-e3d5ba3d4d11" />

```json
{
  "Version": "2012-10-17",
  "Statement": [{
      "Effect": "Allow",
      "Principal": "*",
      "Action": "execute-api:Invoke",
      "Resource": "execute-api:/*/*/*"
    },
    {
      "Effect": "Deny",
      "Principal": "*",
      "Action": "execute-api:Invoke",
      "Resource": "execute-api:/*/*/*",
      "Condition": {
        "NotIpAddress": {
          "aws:SourceIp": ["SOURCEIPORCIDRBLOCK"]
        }
      }
    }
  ]
}
```
<img width="686" height="85" alt="image" src="https://github.com/user-attachments/assets/1ae9ec44-320c-47e8-80bd-81c13a4a951c" />

Now, you need to deploy the changes.

<img width="452" height="136" alt="image" src="https://github.com/user-attachments/assets/1b28758c-5763-4cc7-ad9f-701900a9a335" />

This step deploys the resource policy you just created. Now, you test whether the resource policy is working or not.

<img width="538" height="33" alt="image" src="https://github.com/user-attachments/assets/ac2cdcfe-aa42-4cd1-995b-6e1715df9d43" />

```bash
source ~/environment/app-code/labVariables
curl ${API_GATEWAY_URL}/bookmarks/${ID}
```

In the console, an error message similar to the following message is displayed:
```json
{"Message":"User: anonymous is not authorized to perform: execute-api:Invoke on resource: arn:aws:execute-api:(AWS:Region):*******1234:(BookmarkAppID)/dev/GET/bookmarks/(bookmarkId) with an explicit deny"}
```

This message is displayed because you created a resource policy to deny all the requests from other than your system’s IP address. Before you proceed to the next task, you should remove the above resource policy because it blocks the application from being invoked.

<img width="546" height="133" alt="image" src="https://github.com/user-attachments/assets/11010b49-351f-4969-8525-937f567a3183" />

Now, you need to deploy the changes.

<img width="457" height="134" alt="image" src="https://github.com/user-attachments/assets/5d318e5f-0cf1-45e6-94c3-33e9a3071303" />

This step deploys the changes you just made.

<img width="659" height="29" alt="image" src="https://github.com/user-attachments/assets/38d6e039-f857-45f7-8ec3-25fb2a8ff684" />

```bash
source ~/environment/app-code/labVariables
curl ${API_GATEWAY_URL}/bookmarks/${ID}
```

**Expected output:**
```json
******************************
**** This is OUTPUT ONLY. ****
******************************

{"username":"george.washington","description":"non dignissimos explicabo","shared":false,"id":"8633d79a-9410-4705-93ea-1a4a0ea76010","name":"aliquam totam illo","bookmarkUrl":"https://buford.biz"}

```


## Task 3: Securing an AWS Lambda function

A highly recommended best practice is to never store your secrets or passwords in plain text or hard code them as part of the function code. They should always be encrypted to secure them from attacks. The following are a few widely used tools to manage your secrets:

* AWS KMS
* Parameter Store
* Secrets Manager

**AWS KMS** makes it easy for you to create and manage cryptographic keys and control their use across a wide range of AWS services and in your applications. AWS KMS is a secure and resilient service that uses hardware security modules that have been validated under FIPS 140-2, or are in the process of being validated, to protect your keys. AWS KMS is integrated with AWS CloudTrail to provide you with logs of all key use in order to help meet your regulatory and compliance needs.

**Parameter Store** provides secure, hierarchical storage for configuration data management and secrets management. You can store data such as passwords, database strings, Amazon Machine Image (AMI) IDs, and license codes as parameter values. You can store values as plain text or encrypted data. You can reference Systems Manager parameters in your scripts, commands, Systems Manager documents, and configuration and automation workflows by using the unique name that you specified when you created the parameter.

**Secrets Manager** helps you protect secrets needed to access your applications, services, and IT resources. The service enables you to easily rotate, manage, and retrieve database credentials, API keys, and other secrets throughout their lifecycle. Users and applications retrieve secrets with a call to Secrets Manager APIs, eliminating the need to hard code sensitive information in plain text. Secrets Manager offers secret rotation with built-in integration for Amazon Relational Database Service (Amazon RDS), Amazon Redshift, and Amazon DocumentDB. Also, the service is extensible to other types of secrets, including API keys and OAuth tokens. In addition, Secrets Manager enables you to control access to secrets using fine-grained permissions and to audit secret rotation centrally for resources in the AWS Cloud, third-party services, and on premises.

In this task, you learn how to secure secrets using AWS KMS, Parameter Store, and Secrets Manager and retrieve the secrets in your Lambda code.


### Task 3.1: Securing environment variables using AWS KMS

<img width="725" height="352" alt="image" src="https://github.com/user-attachments/assets/5887214e-1e78-4158-b81e-bfc79e4fb3d6" />

The user or role is displayed at the top-right of your screen.

<img width="594" height="104" alt="image" src="https://github.com/user-attachments/assets/2edaa624-6ae0-4779-8e15-5eb831b0d4d2" />

Review the policy in the Key policy section.

<img width="359" height="66" alt="image" src="https://github.com/user-attachments/assets/4edd5cb5-cf92-4adb-a6f4-b75b092b0e6b" />

```bash
export KeyId=$(aws kms list-aliases --query 'Aliases[?starts_with(AliasName, `alias/LambdaSecrets`)].TargetKeyId' --output text)
aws kms encrypt --plaintext "Key Management Service Secrets" --query CiphertextBlob --output text --key-id ${KeyId} --cli-binary-format raw-in-base64-out
```

You are encrypting the string **Key Management Service Secrets** using the AWS KMS key ID.

<img width="537" height="22" alt="image" src="https://github.com/user-attachments/assets/f566968d-2e26-492f-a532-51d5cda140f7" />

The resulting encoded output is base64 encoded and is provided as an environment variable to your Lambda function. The Lambda function decrypts the data to get the plaintext in order to actually use it.

### Create a Lambda function and configure it in API Gateway to test the AWS KMS
In this section, you create a new Lambda function to test the AWS KMS secrets.

<img width="684" height="354" alt="image" src="https://github.com/user-attachments/assets/a3225089-41be-42ae-90a2-e3c4e791c565" />

```typescript
import { KMSClient, DecryptCommand } from "@aws-sdk/client-kms";
import { SSMClient, GetParameterCommand } from "@aws-sdk/client-ssm";
import { SecretsManagerClient, GetSecretValueCommand } from "@aws-sdk/client-secrets-manager"; 


const kmsSecret = process.env.KMS_SECRET;

let decodedSecret;
let DecodedKMSSecret;

const kms = new KMSClient({});
const ssm =  new SSMClient({});
const sm = new SecretsManagerClient({});

export const handler = async message => {
    console.log(message);
    let secretType = message.pathParameters.id
    console.log("Secret Type:", secretType);

    if(secretType == 'kms')
        decodedSecret = await decodeKMSSecret();   
    else
        decodedSecret = "Provide a valid secret type (kms, ssm, or sm (secrets manager))";

    console.log(decodedSecret);
    const response = {
        statusCode: 200,
        headers: {},
        body: JSON.stringify('Plain text secret(s): ' + decodedSecret)
    };
    return response;
};

async function decodeKMSSecret() {
    if (DecodedKMSSecret) {
        return DecodedKMSSecret;
    }
    const params = {
      CiphertextBlob: Buffer.from(kmsSecret, 'base64')
    };
    const data = await kms.send(new DecryptCommand(params));
    DecodedKMSSecret = Buffer.from(data.Plaintext, 'base64').toString('utf-8');
    return DecodedKMSSecret;
}
```

<img width="752" height="316" alt="image" src="https://github.com/user-attachments/assets/1b741a53-dd77-4458-b8d0-8ee7059ad135" />

> [!NOTE]
> This Lambda function shows how to use the AWS KMS SDK to read secrets. Review the function code after it is deployed.

> [!NOTE]
> To read the secrets, an IAM permission, **kms:Decrypt**, is needed for the Lambda function. For the purposes of this lab, the permission has already been added to the **LambdaDeploymentRole**, which is assigned to the Lambda function during the pre-build lab process.

To test this Lambda function, configure it in API Gateway.

<img width="479" height="165" alt="image" src="https://github.com/user-attachments/assets/f4bc5a14-4b2c-4aec-b795-bd72942704b3" />

Once the resource creation is complete, the **secrets** resource appears in the **Resources** pane.

<img width="596" height="103" alt="image" src="https://github.com/user-attachments/assets/af89311f-a896-4617-af18-48544fd31ba8" />

Once the resource creation is complete, the **{id}** resource appears under the **secrets** resource in the **Resources** pane.

<img width="659" height="134" alt="image" src="https://github.com/user-attachments/assets/9b70bfe8-c583-408d-889e-9b9cab55d169" />

This is the new Lambda function name that you just created.

<img width="228" height="33" alt="image" src="https://github.com/user-attachments/assets/0fa3ee3c-9c33-4e8f-8cd6-3a0a8948e884" />

The Lambda function has been integrated into the new API endpoint. Now, the new endpoint should be deployed in order to test the function.

<img width="536" height="99" alt="image" src="https://github.com/user-attachments/assets/022306dd-27ff-4127-a2b1-312387d48faa" />

This step has successfully deployed the new endpoint to the **dev** stage.

TO BE CONTINUE














