.PHONY: deploy_all
deploy_all:
	ansible-playbook deploy.yaml --ask-become-pass  --tags all

.PHONY: deploy_webapp
deploy_webapp:
	ansible-playbook deploy.yaml --ask-become-pass --tags webapp

.PHONY: deploy_migrate
deploy_migrate:
	ansible-playbook deploy.yaml --ask-become-pass --tags migrate

.PHONY: deploy_feedmanager
deploy_feedmanager:
	ansible-playbook deploy.yaml --ask-become-pass --tags feedmanager
