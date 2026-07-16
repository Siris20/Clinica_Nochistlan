import urllib.request
import json

url = 'http://localhost:8000/api/cita'

# 1. CREAR cita con horario diferente
print("=== PRUEBA 1: Crear cita ===")
data = {
    'cliente_id': 5,
    'area_id': 1,
    'sucursal_id': 1,
    'fecha_inicio': '2026-08-05T14:30:00',  # Otro día más lejano
    'fecha_fin': '2026-08-05T15:30:00',
    'motivo': 'Consulta original'
}

req = urllib.request.Request(url, data=json.dumps(data).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='POST')
try:
    with urllib.request.urlopen(req) as response:
        body = json.loads(response.read().decode('utf-8'))
        cita_id = body['id']
        print(f"✓ Cita creada - ID: {cita_id}")
        print(f"  Motivo: {body['motivo']}")
        print(f"  Estado: {body['estado']}")
except urllib.error.HTTPError as e:
    print(f"✗ Error {e.code}: {e.read().decode('utf-8')}")
    exit(1)

# 2. ACTUALIZAR solo motivo y observaciones (sin cambiar horario)
print("\n=== PRUEBA 2: Actualizar motivo y observaciones ===")
data2 = {
    'motivo': 'Consulta modificada',
    'observaciones': 'Nueva observación',
    'estado': 'Confirmada'
}

url2 = f'http://localhost:8000/api/cita/{cita_id}'
req2 = urllib.request.Request(url2, data=json.dumps(data2).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PUT')
try:
    with urllib.request.urlopen(req2) as response:
        body = json.loads(response.read().decode('utf-8'))
        print(f"✓ Cita actualizada exitosamente")
        print(f"  Nuevo motivo: {body['motivo']}")
        print(f"  Nuevas observaciones: {body['observaciones']}")
        print(f"  Nuevo estado: {body['estado']}")
except urllib.error.HTTPError as e:
    print(f"✗ Error {e.code}: {e.read().decode('utf-8')}")
    exit(1)

# 3. ACTUALIZAR con horario conflictivo (debe rechazar)
print("\n=== PRUEBA 3: Actualizar a horario ocupado (debe fallar) ===")
data3 = {
    'fecha_inicio': '2026-07-15T19:30:00',  # Este horario ya existe
    'fecha_fin': '2026-07-15T20:30:00'
}

req3 = urllib.request.Request(url2, data=json.dumps(data3).encode('utf-8'), headers={'Content-Type': 'application/json'}, method='PUT')
try:
    with urllib.request.urlopen(req3) as response:
        print(f"✗ No debería haber funcionado!")
        exit(1)
except urllib.error.HTTPError as e:
    if e.code == 400:
        print(f"✓ Rechazado correctamente - Error 400")
        error_msg = json.loads(e.read().decode('utf-8'))
        print(f"  Mensaje: {error_msg['detail']}")
    else:
        print(f"✗ Error inesperado {e.code}: {e.read().decode('utf-8')}")
        exit(1)

print("\n✓ TODAS LAS PRUEBAS PASARON")
