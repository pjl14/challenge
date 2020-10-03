#- Crear uncre script bash o makefile, que acepte parámetros (CREATE, DESTROY y OUTPUT) con los siguientes pasos:
#   - Exportar las variables necesarias para crear recursos en GCP (utilizar las credenciales previamente descargadas).


#!/bin/bash

ZONE="us-east1-a"

echo "Welcome to our tiny script - lets create an instance"
gcloud compute instances create instance-1 --zone $ZONE

echo "Done!