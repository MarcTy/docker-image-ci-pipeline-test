# docker-image-ci-pipeline-test
Test repository for testing a docker ci pipeline complete with unit and integration testing of a react + vite client and mqtt mosquitto + websocket API backend.

## Images
The images built are the react client component and the sensor publisher components, the mosquitto server is itself a docker image.

## Integration 
Create a docker-compose.yaml to run all images together in parallel. The first step is merging.