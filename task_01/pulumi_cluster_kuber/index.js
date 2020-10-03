"use strict";
//const pulumi = require("@pulumi/pulumi");
//const gcp = require("@pulumi/gcp");

import * as gcp from "@pulumi/gcp";
import * as kubernetes from "@pulumi/kubernetes"; 

// Create cluster
const cluster = new gcp.container.Cluster("cluster", {
    zone: "outhamerica-east1-a",
    initialNodeCount: 1,
}); 


// Manufacture a GKE-style Kubeconfig. Note that this is slightly "different" because of the way GKE requires
// gcloud to be in the picture for cluster authentication (rather than using the client cert/key directly).
export const k8sConfig = pulumi.
    all([ cluster.name, cluster.endpoint, cluster.masterAuth ]).
    apply(([ name, endpoint, auth ]) => {
        const context = `${gcp.config.project}_${gcp.config.zone}_${name}`;
        return `apiVersion: v1
clusters:
- cluster:
    certificate-authority-data: ${auth.clusterCaCertificate}
    server: https://${endpoint}
  name: ${context}
contexts:
- context:
    cluster: ${context}
    user: ${context}
  name: ${context}
current-context: ${context}
kind: Config
preferences: {}
users:
- name: ${context}
  user:
    auth-provider:
      config:
        cmd-args: config config-helper --format=json
        cmd-path: gcloud
        expiry-key: '{.credential.token_expiry}'
        token-key: '{.credential.access_token}'
      name: gcp
`;
    });

// Export a Kubernetes provider instance that uses our cluster from above.
export const k8sProvider = new k8s.Provider("gkeK8s", {
    kubeconfig: k8sConfig,
}, {
    dependsOn: [nodePool],
});

const k8sprovider = new kubernetes.Provider ("gke",{
    kubeconfig: k8sConfig
});

//deployment NGINX
const nginxLabels = {"app" : "nginx"}
const deployment = new kubernetes.apps.v1.deployment("nginx",{
    spec: {
        selector: { matchLabels: nginxLabels },
            template: {
                metadata: {
                    labels: nginxLabels,
            },
            epec: {
                container: [{
                    name: "nginx",
                    image: "nginx",
                }],
            },
        },
    },
    replicas: 2,  
},{Provider: k8sprovider});

const service = new kubernetes.core.v1.service("nginx",{
    spec: {
        type: "LoadBalancer",
        selector: nginxLabels,
        ports: [{port:80}],
    },
},{ provider : k8sprovider });

export const nginxIp = service.status.apply(status => status.loadBalancer.ingress[0].ip);
