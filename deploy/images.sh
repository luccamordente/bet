# Prevent operations without commiting or cleaning the git working three
if [[ ${ALLOW_DIRTY_WORKING_THREE=false} != true ]] && [[ -n $(git status -s) ]]; then
  echo "Error: working three is dirty" >&2
  exit 1
fi

set -eux -o pipefail

REPO_PREFIX=914977074407.dkr.ecr.ap-south-1.amazonaws.com

commit_id=$(git rev-parse --short HEAD)

declare -A build_args

# Name and arguments to build the images with `docker build`
build_args[poluga]="."
build_args[poluga-chromium]="--build-arg INSTALL_CHROMIUM=true ."

repo_names=()
for name in "${!build_args[@]}"; do
  repo_names+=($name)
done

declare -A image_names
for name in "${repo_names[@]}"; do
  img="$REPO_PREFIX/$name:$commit_id"
  image_names[$name]=$img
done
