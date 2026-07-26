#!/bin/bash
# Reproduksi stack monitoring (Prometheus + Grafana) yang dipakai buat
# submission ini, semuanya di dalam namespace "monitoring" sesuai ketentuan.
# Jalankan dari direktori ini: ./setup.sh

set -euo pipefail

kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -

# Pakai chart komunitas resmi, bukan manifest custom — lebih simpel dan
# udah teruji buat setup Prometheus + Grafana standar.
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm install prometheus prometheus-community/prometheus \
  --namespace monitoring \
  -f prometheus-values.yaml

# Bergantung ke Service Prometheus yang harus udah ada duluan (dipakai
# sebagai datasource URL Grafana), makanya diinstall belakangan.
helm install grafana grafana/grafana \
  --namespace monitoring \
  -f grafana-values.yaml

echo "Nunggu pod-nya siap..."
kubectl -n monitoring wait --for=condition=Ready pod --all --timeout=180s

echo "Password admin Grafana: lihat grafana-values.yaml (adminPassword)"
echo "Akses Grafana dengan: kubectl -n monitoring port-forward svc/grafana 3000:80"
