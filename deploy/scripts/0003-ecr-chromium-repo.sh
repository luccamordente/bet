# Create the repository to put our main image

aws ecr create-repository \
  --region ap-south-1 \
  --repository-name poluga-chromium \
  --image-tag-mutability IMMUTABLE \
  --image-scanning-configuration scanOnPush=true

# Output:
# {
#     "repository": {
#         "repositoryArn": "arn:aws:ecr:ap-south-1:914977074407:repository/poluga-chromium",
#         "registryId": "914977074407",
#         "repositoryName": "poluga-chromium",
#         "repositoryUri": "914977074407.dkr.ecr.ap-south-1.amazonaws.com/poluga-chromium",
#         "createdAt": 1586897311.0,
#         "imageTagMutability": "IMMUTABLE",
#         "imageScanningConfiguration": {
#             "scanOnPush": true
#         }
#     }
# }
