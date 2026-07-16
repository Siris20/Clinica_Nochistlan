import urllib.request
import json

url = 'http://localhost:8000/api/cita'
data = {
    'cliente_id': 5,
    'area_id': 1,
    'sucursal_id': 1,
    'fecha_inicio': '2026-07-17T16:00:00',
    'fecha_fin': '2026-07-17T17:00:00',
    'motivo': 'Prueba Python'
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
try:
    with urllib.request.urlopen(req) as response:
        print(f'✓ POST exitoso - Status: {response.status}')
        body = json.loads(response.read().decode('utf-8'))
        print(f"ID: {body['id']}")
        print(f"Motivo: {body['motivo']}")
        print(f"Estado: {body['estado']}")
        print(f"Cliente: {body['cliente']['nombre_fiscal']}")
        print(f"Área: {body['area']['name']}")
        print(f"Sucursal: {body['sucursal']['name']}")
except urllib.error.HTTPError as e:
    print(f'✗ Error {e.code}')
    print(e.read().decode('utf-8'))
