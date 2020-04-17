# Build and push images.

source deploy/images.sh
set -eux -o pipefail

# Build
for name in "${repo_names[@]}"; do
  DOCKER_BUILDKIT=1 docker build -t ${image_names[$name]} ${build_args[$name]}
done

# Push all images when all builds are successful
for img in "${image_names[@]}"; do
  docker push $img
done
