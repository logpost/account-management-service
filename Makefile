ImageName := acc-logpost
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