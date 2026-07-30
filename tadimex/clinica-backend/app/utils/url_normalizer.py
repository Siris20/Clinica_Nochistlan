from datetime import date, timedelta, datetime
from typing import Optional, Tuple
import ipaddress
import re
from urllib.parse import urlparse, unquote, parse_qs, urlencode
from fastapi import HTTPException, status
import idna  # Para manejo de IDN (Internationalized Domain Names)
import unicodedata

# Constantes de validación
MAX_DOMAIN_LENGTH = 253
MAX_URL_LENGTH = 2048
MAX_USER_AGENT_LENGTH = 1000
MAX_REFERRER_LENGTH = 2048
MAX_WEBSITE_NAME_LENGTH = 255
MAX_DATE_RANGE_DAYS = 730  # 2 años
MIN_DATE = date(1990, 1, 1)  # Fecha mínima aceptable

# Expresiones regulares precompiladas mejoradas
DOMAIN_REGEX = re.compile(
    r'^(?!-)[a-zA-Z0-9-]{1,63}(?<!-)(\.[a-zA-Z0-9-]{1,63}(?<!-))*$'
)
CONTROL_CHARS_REGEX = re.compile(r'[\x00-\x1f\x7f-\x9f\u2028\u2029\u200b]')
DANGEROUS_PATTERNS = [
    r'<\s*script', 
    r'javascript\s*:', 
    r'data\s*:', 
    r'vbscript\s*:',
    r'&#x?[0-9a-f]+;?',
    r'/\*.*\*/',
    r'[\s]on\w+\s*='
]
URL_ENCODED_PATTERNS = [re.escape(p.replace(' ', r'\s*')) for p in DANGEROUS_PATTERNS]
ALL_DANGEROUS_PATTERNS = re.compile('|'.join(DANGEROUS_PATTERNS + URL_ENCODED_PATTERNS), re.IGNORECASE)


TRUSTED_DOMAINS = {
    'facebook.com', 'www.facebook.com', 'm.facebook.com',
    'google.com', 'www.google.com',
    'twitter.com', 'www.twitter.com', 'x.com',
    'linkedin.com', 'www.linkedin.com',
    'instagram.com', 'www.instagram.com',
    'youtube.com', 'www.youtube.com',
    'tiktok.com', 'www.tiktok.com'
}



def validate_and_normalize_domain(domain: str) -> str:
    """Valida y normaliza un dominio con protecciones avanzadas.
    
    Args:
        domain: Dominio a validar (puede incluir protocolo/puerto)
        
    Returns:
        str: Dominio normalizado (sin protocolo, puerto o www)
        
    Raises:
        HTTPException: Si el dominio es inválido o contiene riesgos
    """
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El dominio no puede estar vacío"
        )

    # Validación UTF-8 estricta
    try:
        domain = domain.encode('idna').decode('ascii')
    except UnicodeError:
        try:
            domain = domain.encode('utf-8').decode('utf-8')
        except UnicodeError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El dominio contiene caracteres inválidos"
            )

    domain = domain.strip().lower()

    # Manejar casos donde el dominio podría tener barras pero no protocolo
    if '://' not in domain and '/' in domain:
        # Eliminar cualquier ruta después del dominio
        domain = domain.split('/')[0]

    # Eliminar protocolo y puerto
    if '://' in domain:
        try:
            parsed = urlparse(domain)
            domain = parsed.netloc or parsed.path.split('/')[0]
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Formato de dominio inválido"
            )

    # Eliminar puerto si existe
    domain = domain.split(':')[0]

    # Eliminar cualquier barra residual
    domain = domain.split('/')[0]

    # Eliminar www. y otros subdominios no esenciales
    domain = re.sub(r'^(www\d*|ftp|mail)\.', '', domain)

    # Validación de longitud
    if len(domain) > MAX_DOMAIN_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El dominio no puede exceder {MAX_DOMAIN_LENGTH} caracteres"
        )

    # Validación de dominio internacionalizado (IDN)
    try:
        domain = idna.encode(domain).decode('ascii')
    except idna.IDNAError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El dominio contiene caracteres Unicode inválidos"
        )

    # Validación de estructura con regex mejorada
    if not DOMAIN_REGEX.match(domain):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de dominio inválido"
        )

    # Protección contra dominios engañosos
    if '--' in domain or domain.startswith('.') or domain.endswith('.'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Estructura de dominio no permitida"
        )

    # Lista negra de TLDs peligrosos
    dangerous_tlds = {'.local', '.localhost', '.internal', '.test'}
    if any(domain.endswith(tld) for tld in dangerous_tlds):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="TLD no permitido"
        )

    return domain

def validate_and_normalize_full_url(full_url: str) -> Tuple[str, str]:
    """Valida y normaliza una URL completa con dominio.
    
    Args:
        full_url: URL completa que puede incluir dominio y ruta
        
    Returns:
        Tuple[str, str]: (dominio_normalizado, ruta_normalizada)
        
    Raises:
        HTTPException: Si la URL es inválida o contiene contenido peligroso
    """
    if not full_url:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La URL no puede estar vacía"
        )
    
    # Validación UTF-8 estricta
    try:
        full_url.encode('utf-8').decode('utf-8')
    except UnicodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La URL contiene caracteres inválidos"
        )
    
    # Limpieza inicial
    full_url = full_url.strip()
    full_url = re.sub(r'\x00', '', full_url)
    full_url = CONTROL_CHARS_REGEX.sub('', full_url)
    
    # Decodificación URL
    try:
        full_url = unquote(full_url)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La URL contiene codificación inválida"
        )
    
    # Validación de longitud
    if len(full_url) > MAX_URL_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La URL no puede exceder {MAX_URL_LENGTH} caracteres"
        )
    
    # Detección de patrones peligrosos
    if ALL_DANGEROUS_PATTERNS.search(full_url):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="URL contiene contenido no permitido"
        )
    
    # Agregar protocolo si no existe (para parsing correcto)
    url_to_parse = full_url
    if not full_url.startswith(('http://', 'https://')):
        url_to_parse = f"https://{full_url}"
    
    # Parsear la URL
    try:
        parsed = urlparse(url_to_parse)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Formato de URL inválido"
        )
    
    # Extraer y validar dominio
    domain = parsed.netloc
    if not domain:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pudo extraer el dominio de la URL"
        )
    
    # Normalizar dominio
    normalized_domain = validate_and_normalize_domain(domain)
    
    # Construir y normalizar la ruta
    path = parsed.path or '/'
    
    # Normalizar la ruta manualmente (sin llamar a la otra función)
    # Normalización de barras múltiples
    path = re.sub(r'/{2,}', '/', path)
    
    # Asegurar que comience con /
    if not path.startswith('/'):
        path = '/' + path
    
    # Agregar query y fragment si existen
    if parsed.query:
        # Normalizar parámetros de query
        try:
            params = parse_qs(parsed.query, keep_blank_values=False, strict_parsing=True)
            clean_params = {k: v[-1] for k, v in params.items()}
            query = urlencode(clean_params, doseq=True)
            path += f"?{query}"
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Los parámetros de la URL son inválidos"
            )
    
    if parsed.fragment:
        path += f"#{parsed.fragment}"
    
    # Validación final de la ruta
    if len(path) > MAX_URL_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"La ruta no puede exceder {MAX_URL_LENGTH} caracteres"
        )
    
    normalized_path = path
    
    return normalized_domain, normalized_path

def validate_ip_address(ip: str) -> Optional[str]:
    """Valida y normaliza una dirección IP con protecciones avanzadas.
    
    Args:
        ip: Dirección IP a validar
        
    Returns:
        Optional[str]: IP validada o None si no es válida
        
    Raises:
        HTTPException: Si la IP es inválida o está en rango reservado
    """
    if not ip:
        return None
    
    ip = ip.strip()
    
    # Manejo de puertos
    if ':' in ip and ip.count(':') == 1:  # IPv4 con puerto
        ip_part, port = ip.split(':')
        try:
            port = int(port)
            if not 0 < port <= 65535:
                return None
        except ValueError:
            return None
    elif ip.count(':') > 1:  # IPv6, manejo especial
        if '[' in ip and ']' in ip:  # IPv6 con puerto [::1]:8080
            match = re.match(r'^\[(.+)\]:(\d+)$', ip)
            if match:
                ip_part, port = match.groups()
                try:
                    port = int(port)
                    if not 0 < port <= 65535:
                        return None
                except ValueError:
                    return None
            else:
                return None
        else:
            ip_part = ip
    else:
        ip_part = ip
    
    # Validación de la IP
    try:
        ip_obj = ipaddress.ip_address(ip_part)
        
        # Rechazar IPs reservadas/privadas
        if ip_obj.is_private or ip_obj.is_reserved or ip_obj.is_loopback:
            return None
            
        return str(ip_obj)
    except ValueError:
        return None

def sanitize_user_agent(user_agent: Optional[str]) -> Optional[str]:
    """Sanitiza el User-Agent con protecciones avanzadas.
    
    Args:
        user_agent: User-Agent a sanitizar
        
    Returns:
        Optional[str]: User-Agent sanitizado o None si no es válido
        
    Raises:
        HTTPException: Si el User-Agent es claramente malicioso
    """
    if not user_agent:
        return None
    
    # Validación UTF-8 estricta
    try:
        user_agent.encode('utf-8').decode('utf-8')
    except UnicodeError:
        return None
    
    user_agent = user_agent.strip()
    
    # Protección contra User-Agents extremadamente largos (posible DoS)
    if len(user_agent) > MAX_USER_AGENT_LENGTH * 10:  # 10x el límite normal
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User-Agent excesivamente largo"
        )
    
    # Limpieza avanzada
    user_agent = CONTROL_CHARS_REGEX.sub('', user_agent)
    
    # Normalización Unicode (evitar caracteres bidireccionales, etc.)
    user_agent = unicodedata.normalize('NFKC', user_agent)
    
    # Validación de longitud después de limpieza
    if len(user_agent) > MAX_USER_AGENT_LENGTH:
        user_agent = user_agent[:MAX_USER_AGENT_LENGTH]
    
    # Detección de patrones peligrosos
    if ALL_DANGEROUS_PATTERNS.search(user_agent):
        return None
    
    return user_agent if user_agent else None

def sanitize_referrer(referrer: Optional[str]) -> Optional[str]:
    """Sanitiza el referrer HTTP con validaciones avanzadas.
    
    Args:
        referrer: Referrer a validar
        
    Returns:
        Optional[str]: Referrer validado y normalizado o None si no es válido
        
    Raises:
        HTTPException: Si el referrer es claramente malicioso
    """
    if not referrer:
        return None
    
    # Validación básica
    referrer = referrer.strip()
    
    # Protección contra inputs extremadamente largos (potencial DoS)
    if len(referrer) > MAX_REFERRER_LENGTH * 5:  # 10KB máximo
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Referrer excesivamente largo"
        )
    
    # Limpieza de caracteres de control peligrosos
    referrer_cleaned = CONTROL_CHARS_REGEX.sub('', referrer)
    referrer_cleaned = re.sub(r'\x00', '', referrer_cleaned)  # Null bytes
    
    # Si después de la limpieza está vacío
    if not referrer_cleaned.strip():
        return None
    
    try:
        # Parseo de URL
        parsed = urlparse(referrer_cleaned)
        
        # Validar que tenga scheme y netloc
        if not parsed.scheme or not parsed.netloc:
            return None
        
        # Solo permitir HTTP y HTTPS
        if parsed.scheme.lower() not in ['http', 'https']:
            return None
        
        # Normalización de dominio
        try:
            # Manejar dominios internacionales
            netloc_normalized = idna.encode(parsed.netloc).decode('ascii').lower()
        except (idna.IDNAError, UnicodeError):
            # Si falla la normalización IDN, usar el netloc original en minúsculas
            netloc_normalized = parsed.netloc.lower()
        
        # Construcción de URL normalizada
        normalized_url = parsed._replace(
            scheme=parsed.scheme.lower(),
            netloc=netloc_normalized
        ).geturl()
        
        # Validación de longitud final
        # Ser más permisivo con dominios confiables
        domain_parts = netloc_normalized.split('.')
        if len(domain_parts) >= 2:
            base_domain = '.'.join(domain_parts[-2:])  # ej: facebook.com
            full_domain = netloc_normalized  # ej: www.facebook.com
            
            is_trusted = base_domain in TRUSTED_DOMAINS or full_domain in TRUSTED_DOMAINS
            
            if is_trusted:
                max_length = MAX_REFERRER_LENGTH * 2  # Más permisivo para dominios confiables
            else:
                max_length = MAX_REFERRER_LENGTH
        else:
            max_length = MAX_REFERRER_LENGTH
        
        if len(normalized_url) > max_length:
            # En lugar de rechazar completamente, truncar parámetros de query
            if parsed.query and len(parsed.query) > 500:
                # Mantener solo los primeros parámetros importantes
                truncated_parsed = parsed._replace(
                    query=parsed.query[:500] + '...',
                    fragment=''  # Remover fragment para ahorrar espacio
                )
                normalized_url = truncated_parsed._replace(
                    scheme=truncated_parsed.scheme.lower(),
                    netloc=netloc_normalized
                ).geturl()
                
                # Si aún es muy largo, truncar más agresivamente
                if len(normalized_url) > max_length:
                    basic_url = f"{parsed.scheme.lower()}://{netloc_normalized}{parsed.path or '/'}"
                    return basic_url if len(basic_url) <= max_length else None
            else:
                return None
                
        return normalized_url
        
    except Exception as e:
        # Log del error para debugging (opcional)
        print(f"Error en sanitize_referrer: {e}, referrer: {referrer_cleaned[:100]}...")
        return None


def sanitize_referrer_simple(referrer: Optional[str]) -> Optional[str]:
    """Versión simplificada para casos donde la validación estricta causa problemas.
    
    Úsala temporalmente si la función principal está siendo demasiado restrictiva.
    """
    if not referrer:
        return None
    
    referrer = referrer.strip()
    
    # Longitud máxima básica
    if len(referrer) > 4096:
        return None
    
    # Validación mínima de URL
    try:
        parsed = urlparse(referrer)
        if parsed.scheme in ['http', 'https'] and parsed.netloc:
            # Limpieza básica de caracteres peligrosos
            clean_referrer = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', referrer)
            return clean_referrer
    except:
        pass
    
    return None

def validate_website_name(name: str) -> str:
    """Valida y sanitiza el nombre del website con protecciones avanzadas.
    
    Args:
        name: Nombre a validar
        
    Returns:
        str: Nombre validado y seguro
        
    Raises:
        HTTPException: Si el nombre no es válido o contiene contenido peligroso
    """
    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre del sitio web no puede estar vacío"
        )
    
    # Validación UTF-8
    try:
        name.encode('utf-8').decode('utf-8')
    except UnicodeError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre contiene caracteres inválidos"
        )
    
    name = name.strip()
    
    # Normalización Unicode
    name = unicodedata.normalize('NFKC', name)
    
    # Limpieza avanzada
    name = CONTROL_CHARS_REGEX.sub('', name)
    name = re.sub(r'\x00', '', name)
    
    # Validación de longitud
    if len(name) > MAX_WEBSITE_NAME_LENGTH:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El nombre no puede exceder {MAX_WEBSITE_NAME_LENGTH} caracteres"
        )
    
    # Validación de caracteres repetidos (ej: "----")
    if re.search(r'(.)\1{3,}', name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre contiene patrones inválidos"
        )
    
    # Validación de contenido peligroso
    if ALL_DANGEROUS_PATTERNS.search(name):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre contiene contenido no permitido"
        )
    
    if not name:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="El nombre del sitio web no puede estar vacío después de la sanitización"
        )
    
    return name

def validate_date_range(start_date: date, end_date: date) -> Tuple[date, date]:
    """Valida un rango de fechas con protecciones avanzadas.
    
    Args:
        start_date: Fecha de inicio
        end_date: Fecha de fin
        
    Returns:
        Tuple[date, date]: Par de fechas validado
        
    Raises:
        HTTPException: Si el rango no es válido
    """
    today = date.today()
    
    # Validación de fechas mínimas
    if start_date < MIN_DATE or end_date < MIN_DATE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"No se admiten fechas anteriores a {MIN_DATE}"
        )
    
    # Orden de fechas
    if start_date > end_date:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="La fecha de inicio no puede ser posterior a la fecha de fin"
        )
    
    # Rango máximo configurable
    if (end_date - start_date).days > MAX_DATE_RANGE_DAYS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"El rango de fechas no puede exceder {MAX_DATE_RANGE_DAYS} días"
        )
    
    # Fechas futuras
    if start_date > today or end_date > today:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No se pueden consultar fechas futuras"
        )
    
    return start_date, end_date