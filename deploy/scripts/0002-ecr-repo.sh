# Create the repository to put our main image

aws ecr create-repository \
  --repository-name poluga \
  --image-tag-mutability IMMUTABLE \
  --image-scanning-configuration scanOnPush=true \

# Output:
# {
#     "repository": {
#         "repositoryArn": "arn:aws:ecr:us-east-1:914977074407:repository/poluga",
#         "registryId": "914977074407",
#         "repositoryName": "poluga",
#         "repositoryUri": "914977074407.dkr.ecr.us-east-1.amazonaws.com/poluga",
#         "createdAt": 1586298791.0,
#         "imageTagMutability": "IMMUTABLE",
#         "imageScanningConfiguration": {
#             "scanOnPush": true
#         }
#     }
# }
