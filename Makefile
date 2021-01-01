ImageName := account-management-service-logpost-stag
DockerPath := ./docker/stag.Dockerfile

GCP_ProjectID := logpost-298506
GCR_TagStaging := asisa.gcr.io/${GCP_ProjectID}/${ImageName}

docker-build:
	docker build -f ${DockerPath} . -t ${GCR_TagStaging}
docker-push: 
	docker push ${GCR_TagStaging}

docker-build-push:
	make docker-build; \
	make docker-push;

hand-deploy-to-stag-step-1:
	git push -u origin develop; \
	git checkout stag-release; \
	git pull origin develop;
hand-deploy-to-stag-step-2:
	git push -u origin stag-release; \
	git checkout develop;

	