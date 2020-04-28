# Create the repository to put our main image

aws ecr create-repository \
  --region ap-south-1 \
  --repository-name poluga-chromium \
  --image-tag-mutability IMMUTABLE \
  --image-scanning-configuration scanOnPush=true
