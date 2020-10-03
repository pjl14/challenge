#!/bin/bash

echo "Option 1 = Create instence"
echo "Option 2 = Delete instence"
echo -n "Enter Option: "
read Option

if [[ $Option -eq 1 ]]
then
#Create instance
    echo "Creating instance..."
    gcloud compute instances create centos-7-v20200910 --zone southamerica-east1-a
 echo "done"
elif [[ $Option -eq 2 ]]
then
#delete instance
    echo "Deleting instance..."
    gcloud compute instances delete centos-7-v20200910 --zone southamerica-east1-a
 echo "done"
fi

