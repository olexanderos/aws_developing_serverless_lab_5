#!/bin/bash

set -o errexit pipefail

# Task 1: validate and install package
sam --version

# Set AWS_REGION multiple ways to ensure it's available
# Method 1: From instance metadata
export AWS_REGION=$(curl -s 169.254.169.254/latest/dynamic/instance-identity/document | jq -r '.region')
# Method 2: Fallback to using aws configure if metadata fails
if [ -z "$AWS_REGION" ]; then
    export AWS_REGION=$(aws configure get region)
fi
# Method 3: Hardcode from EC2 tags if all else fails
if [ -z "$AWS_REGION" ]; then
    INSTANCE_ID=$(curl -s http://169.254.169.254/latest/meta-data/instance-id)
    export AWS_REGION=$(aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].Placement.AvailabilityZone' --output text | sed 's/.$//')
fi

echo "AWS_REGION is set to: $AWS_REGION"
aws configure set default.region $AWS_REGION

# Task 2: modify ./backend/src/samconfig.toml file
export LambdaRoleName=LambdaDeploymentRole
export Lambda_Role_ARN=$(aws iam get-role --role-name ${LambdaRoleName} | jq '.Role.Arn' | tr -d '"')
export StepFunctionsRoleName=EventBridgeStateMachineRole
export StepFunctions_Role_ARN=$(aws iam get-role --role-name ${StepFunctionsRoleName} | jq '.Role.Arn' | tr -d '"')
echo $Role_ARN
export Sam_Bucket=$(aws s3api list-buckets --query "Buckets[].Name" | grep samserverless | tr -d ',' | tr -d ' ' | tr -d '"')
echo $Sam_Bucket
export Stack_Name="sam-bookmark-app"
echo $Stack_Name

# Replace values in ./backend/samconfig.toml
sed -Ei "s|<LambdaRoleARN>|${Lambda_Role_ARN}|g" ./backend/samconfig.toml
sed -Ei "s|<replace_s3>|${Sam_Bucket}|g" ./backend/samconfig.toml
sed -Ei "s|<stack_name>|${Stack_Name}|g" ./backend/samconfig.toml
sed -Ei "s|<AWS_REGION>|${AWS_REGION}|g" ./backend/samconfig.toml
sed -Ei "s|<StepFunctionsRoleARN>|${StepFunctions_Role_ARN}|g" ./backend/samconfig.toml

# Deploy backend using SAM
cd /home/********/environment/app-code/backend/src/createBookmark
npm install aws-xray-sdk
cd /home/********/environment/app-code/backend
sam deploy

