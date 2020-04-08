# Build and push images.

source deploy/images.sh
set -eux -o pipefail

# Build and push
DOCKER_BUILDKIT=1 docker build -t $poluga_img .
docker push $poluga_img
