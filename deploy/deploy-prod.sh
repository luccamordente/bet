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

# This command ensures the current commit image exists. Without it we
# can deploy a manifest with a image tag that wasn't built and pushed
aws ecr describe-images \
  --repository-name=$poluga_repo_name \
  --image-ids=imageTag=$commit_id

# Copy manifests to temporary dir
tmp_dir=$(mktemp -d -t poluga_deploy_XXXXXXX)
mkdir $tmp_dir/base $tmp_dir/prod
cp -a k8s/base/. $tmp_dir/base/
cp -a k8s/prod/. $tmp_dir/prod/

# Replace placeholder with image tag
sed -i "s/\$COMMIT_SHORT_HASH/$commit_id/g" $tmp_dir/prod/kustomization.yaml

# Decrypt secret.env
./bin/sops -d -i $tmp_dir/prod/secret.env

# Apply manifests to cluster
./bin/kustomize build $tmp_dir/prod | kubectl apply -f -

# Clean up
rm -rf $tmp_dir
