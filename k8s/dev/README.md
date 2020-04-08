# Dev Kubernetes Environment

This environment lets you deploy a small version of the application
so you can run and test it on a local cluster in your machine.

To use it you need to create two files: `secret.env` and `env.yaml`, there
are some example files available, start with them.

You are going to need a cluster to deploy to:

- For [Mac](https://docs.docker.com/docker-for-mac/kubernetes/) and
  [Windows](https://docs.docker.com/docker-for-windows/kubernetes/) you can use
  Docker Kubernetes
- For Linux, Mac and Windows you can use
  [Minikube](https://kubernetes.io/docs/setup/learning-environment/minikube/)

Once you have your cluster you can use `deploy/deploy-dev.sh` to deploy it.
See the documentation for using the script on its header comment.
