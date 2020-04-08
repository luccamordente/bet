# Prevent operations without commiting or cleaning the git working three
if [[ -n $(git status -s) ]]; then
  echo "Error: working three is dirty" >&2
  exit 1
fi

commit_id=$(git rev-parse --short HEAD)
poluga_repo_name=poluga
poluga_img="914977074407.dkr.ecr.us-east-1.amazonaws.com/$poluga_repo_name:$commit_id"
