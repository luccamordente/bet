# Create the repository to put our main image

aws ecr create-repository \
  --region ap-south-1 \
  --repository-name poluga \
  --image-tag-mutability IMMUTABLE \
  --image-scanning-configuration scanOnPush=true \

# Output:
# {
#     "repository": {
#         "repositoryArn": "arn:aws:ecr:ap-south-1:914977074407:repository/poluga",
#         "registryId": "914977074407",
#         "repositoryName": "poluga",
#         "repositoryUri": "914977074407.dkr.ecr.ap-south-1.amazonaws.com/poluga",
#         "createdAt": 1586383783.0,
#         "imageTagMutability": "IMMUTABLE",
#         "imageScanningConfiguration": {
#             "scanOnPush": true
#         }
#     }
# }
