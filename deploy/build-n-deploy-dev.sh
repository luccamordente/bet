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

ALLOW_DIRTY_WORKING_THREE=true source deploy/images.sh
set -eux -o pipefail
export PATH="$(pwd)/bin:$PATH"

TMP_DIR_PREFIX=poluga_deploy

declare -A tags

# Build and tag development images with their image ids
for name in "${repo_names[@]}"; do
  DOCKER_BUILDKIT=1 docker build -t $name ${build_args[$name]}
  img_id=imageid-$(docker image inspect --format='{{.ID}}' $name | cut -c 8-19)
  tag=$name:$img_id
  docker tag $name $tag
  tags[$name]=$tag
done

# Copy manifests to temporary dir
tmp_dir=$(mktemp -d -t "${TMP_DIR_PREFIX}_XXXXXXX")
mkdir $tmp_dir/base $tmp_dir/dev
cp -a k8s/base/. $tmp_dir/base/
cp -a k8s/dev/. $tmp_dir/dev/

# Set image replacements
(
  cd $tmp_dir/dev && \
  for name in "${repo_names[@]}"; do
    kustomize edit set image $name=${tags[$name]}
  done
)

# Apply manifests to cluster
kustomize build $tmp_dir/dev | kubectl apply -f -

# Clean up
rm -rf $tmp_dir
