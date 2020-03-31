# Build and deploy locally for development and testing.
#
# This will use `kubectl` with the default context, so ensure it
# is correctly set to the desired cluster.
# 
# If using with minikube remember to point your shell to minikube's
# docker-daemon (check `minikube docker-env`). Otherwise, your
# cluster won't find the images on its local registry.
#
# Must be executed from the root of the repository.

set -eux -o pipefail

IMG_NAME=poluga

# Build image
DOCKER_BUILDKIT=1 docker build -t $IMG_NAME .

# Tag image with its hash (id)
tag=imageid-$(docker image inspect --format='{{.ID}}' $IMG_NAME | cut -c 8-19)
docker tag $IMG_NAME $IMG_NAME:$tag

# Copy manifests to temporary dir
tmp_dir=$(mktemp -d -t poluga_deploy_XXXXXXX)
cp -a kubernetes/. ${tmp_dir}/

# Replace placeholder with image tag
sed -i "s/\$IMAGE_TAG/$tag/g" $tmp_dir/kustomization.yaml

# Apply manifests to cluster
kubectl apply -k $tmp_dir

# Clean up
rm -rf $tmp_dir
