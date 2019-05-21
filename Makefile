all: deploy app
.PHONY: app layers deploy package validate

STACK_NAME := A11ygatorBot
PACKAGE_TEMPLATE := template.yml
PACKAGE_BUCKET ?= chialab-cloudformation-templates
PACKAGE_PREFIX ?= chialab/a11ygator-bot

PACKAGE_PROFILE ?= chialabsrl
DEPLOY_PROFILE ?= chialab

APP_BUCKET := $(shell aws cloudformation describe-stacks --stack-name $(STACK_NAME) --query 'Stacks[0].Outputs[?OutputKey==`AppBucketName`].OutputValue' --output text --profile $(DEPLOY_PROFILE))
DISTRIBUTION_ID := $(shell aws cloudformation describe-stacks --stack-name $(STACK_NAME) --query 'Stacks[0].Outputs[?OutputKey==`DistributionId`].OutputValue' --output text --profile $(DEPLOY_PROFILE))

app:
	aws s3 sync public/ s3://$(APP_BUCKET) --delete --profile $(DEPLOY_PROFILE)
	aws cloudfront create-invalidation \
		--distribution-id $(DISTRIBUTION_ID) \
		--paths '/*' \
		--profile $(DEPLOY_PROFILE)

layers:
	docker run --rm \
		-v $(PWD)/layers/pa11y/nodejs:/var/task \
		-e NODE_ENV=production \
		-e PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=1 \
		lambci/lambda:build-nodejs8.10 \
		npm $(if $(wildcard layers/pa11y/nodejs/node_modules/*), rebuild, install)
	yarn --cwd layers/twit/nodejs install
	yarn --cwd layers/uuid/nodejs install

deploy: package
	aws cloudformation deploy \
		--template-file template.yml \
		--stack-name $(STACK_NAME) \
		--capabilities CAPABILITY_IAM \
		--profile $(DEPLOY_PROFILE)

package: validate
	aws cloudformation package \
		--template-file templates/root.yml \
		--output-template-file $(PACKAGE_TEMPLATE) \
		--s3-bucket $(PACKAGE_BUCKET) \
		--s3-prefix $(PACKAGE_PREFIX) \
		--profile $(PACKAGE_PROFILE)
	aws s3 cp $(PACKAGE_TEMPLATE) s3://$(PACKAGE_BUCKET)/$(PACKAGE_PREFIX)/ --profile $(PACKAGE_PROFILE)
	@echo "https://s3.amazonaws.com/$(PACKAGE_BUCKET)/$(PACKAGE_PREFIX)/$(PACKAGE_TEMPLATE)"

validate:
	aws cloudformation validate-template \
		--template-body file://templates/root.yml \
		--profile $(PACKAGE_PROFILE)
