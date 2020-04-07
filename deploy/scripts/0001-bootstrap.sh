# Create the Kubernetes cluster

set -eux -o pipefail

key=~/.ssh/poluga-t3asmall-workers

if [ ! -f "$key" ]; then
  ssh-keygen -t rsa -N '' -f $key
fi

eksctl create cluster \
  --name poluga \
  --region us-east-1 \
  --version 1.15 \
  --nodegroup-name poluga-t3asmall-workers \
  --node-type t3a.small \
  --nodes 2 \
  --nodes-min 1 \
  --nodes-max 3 \
  --ssh-access \
  --ssh-public-key ${key}.pub \
  --managed
