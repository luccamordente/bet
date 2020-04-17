# Deploy to production.
#
# This will deploy with the last commit hash (HEAD). Run build-images.sh
# first to build and publish the images.
#
# This will use `kubectl` with the default context, so ensure it
# is correctly set to the desired cluster.
#
# Must be executed from the root of the repository.

source deploy/images.sh
set -eux -o pipefail
export PATH="$(pwd)/bin:$PATH"

TMP_DIR_PREFIX=poluga_deploy

declare -A image_digests

# Get digests from remote repository
for name in "${repo_names[@]}"; do
  image_digests[$name]=$(
    aws ecr describe-images \
      --repository-name=$name \
      --image-ids=imageTag=$commit_id \
      --query='imageDetails[0].imageDigest' \
      --output=text
  )
done

# Copy manifests to temporary dir
tmp_dir=$(mktemp -d -t "${TMP_DIR_PREFIX}_XXXXXXX")
mkdir $tmp_dir/base $tmp_dir/prod
cp -a k8s/base/. $tmp_dir/base/
cp -a k8s/prod/. $tmp_dir/prod/

# Set images to be replaced
(
  cd $tmp_dir/prod && \
  for name in "${repo_names[@]}"; do
    kustomize edit set image $name=$REPO_PREFIX/$name@${image_digests[$name]}
  done
)

# Decrypt secret.env
sops -d -i $tmp_dir/prod/secret.env

# Apply manifests to cluster
kustomize build $tmp_dir/prod | kubectl apply -f -

# Clean up
rm -rf $tmp_dir
