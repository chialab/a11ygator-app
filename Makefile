all: package

PACKAGE_TEMPLATE := template.yml
PACKAGE_BUCKET ?= chialab-cloudformation-templates
PACKAGE_PREFIX ?= chialab/a11ygator-bot

package:
	aws cloudformation package \
		--template-file templates/root.yml \
		--output-template-file $(PACKAGE_TEMPLATE) \
		--s3-bucket $(PACKAGE_BUCKET) \
		--s3-prefix $(PACKAGE_PREFIX)
	aws s3 cp $(PACKAGE_TEMPLATE) s3://$(PACKAGE_BUCKET)/$(PACKAGE_PREFIX)/
	@echo "https://s3.amazonaws.com/$(PACKAGE_BUCKET)/$(PACKAGE_PREFIX)/$(PACKAGE_TEMPLATE)"

validate:
	aws cloudformation validate-template \
		--template-body file://templates/root.yml
