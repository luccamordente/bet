# Deploy scripts

We try to put every change to our infrastructure in this directory under a
_best effort_ basis. Scripts should be numbered to keep the order the changes
were applied to our infrastructure.

In case we have problems these scripts should serve as documentation to what
we need to recreate. If we ever desire to move to a more sofisticated
_infrastructure as code_ framework on the future (CloudFormation, Terraform,
etc.), these files are going to be usefull as well.

For most scripts it should not matter the current working directory, but if
it is unavoidable, allways assume the root of the repository as the CWD.
