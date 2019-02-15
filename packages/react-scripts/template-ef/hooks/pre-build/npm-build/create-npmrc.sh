#!/bin/bash

#  Get artifactory token from SAS
ICS_AF_TOKEN=$(ec-sas-client frontier-hub-ics-public-artifactory-db -b fchPassword)

#  Write .npmrc
echo "//code.lds.org/artifactory/api/npm/npm-fhd/:_authToken=${ICS_AF_TOKEN}" > .npmrc
echo "@fs:registry=https://code.lds.org/artifactory/api/npm/npm-fhd/" >> .npmrc