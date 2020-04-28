# Prevent operations without commiting or cleaning the git working three
if [[ ${ALLOW_DIRTY_WORKING_THREE=false} != true ]] && [[ -n $(git status -s) ]]; then
  echo "Error: working three is dirty" >&2
  exit 1
fi

set -eux -o pipefail

if [[ -z ${REPO_PREFIX=} ]]; then
  echo "Missing REPO_PREFIX env var"
  exit 1
fi

commit_id=$(git rev-parse --short HEAD)

declare -A build_args

# Name and arguments to build the images with `docker build`
build_args[poluga]="."
build_args[poluga-chromium]="--build-arg INSTALL_CHROMIUM=true ."

repo_names=()
for name in "${!build_args[@]}"; do
  repo_names+=($name)
done

declare -A image_tags
for name in "${repo_names[@]}"; do
  tag="$REPO_PREFIX/$name:$commit_id"
  image_tags[$name]=$tag
done
