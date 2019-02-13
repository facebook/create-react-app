#!/bin/bash

#  Get artifactory token from SAS
ICS_AF_TOKEN=ec-sas-client frontier-hub-ics-public-artifactory-db password
NPMRC_TOKEN="//code.lds.org/artifactory/api/npm/npm-fhd/:_authToken=${ICS_AF_TOKEN}"
NPMRC_ICS_REGISTRY="@fs:registry=https://code.lds.org/artifactory/api/npm/npm-fhd/"

#  Write .npmrc
echo $NPMRC_TOKEN > .npmrc
echo $NPMRC_ICS_REGISTRY >> .npmrc