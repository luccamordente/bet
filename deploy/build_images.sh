# Build and tag images.

set -eux -o pipefail

if [[ -n $(git status -s) ]]; then
  echo "Error: working three is dirty" >&2
  exit 1
fi

IMG_POLUGA=poluga

tag=$(git rev-parse --short HEAD)

# Build
DOCKER_BUILDKIT=1 docker build -t $IMG_POLUGA:$tag .

# Tag with ECR repository
docker tag $IMG_POLUGA:$tag 914977074407.dkr.ecr.us-east-1.amazonaws.com/$IMG_POLUGA:$tag
