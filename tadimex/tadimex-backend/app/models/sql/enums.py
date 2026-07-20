from sqlalchemy import Enum
from enum import Enum

class TipoPersona(Enum):
    FISICA = "FISICA"
    MORAL = "MORAL"

class Sexo(Enum):
    MASCULINO = "MASCULINO"
    FEMENINO = "FEMENINO"

class PlazoContrato(Enum):
    DETERMINADO = "DETERMINADO"
    INDETERMINADO = "INDETERMINADO"

class RolUsuario(Enum):
    ADMINISTRADOR = "Administrador"
    RECURSOS_HUMANOS = "Recursos humanos"
    EMPLEADO = "Empleado"
    EMISOR = "Emisor"
    OBSERVADOR = "Observador"

class Status(Enum):
    ACTIVO = "ACTIVO"
    INACTIVO = "INACTIVO"
    VACACIONES = "VACACIONES"
    INCAPACIDAD = "INCAPACIDAD"

class BloodType(Enum):
    O_POSITIVO = "O+"
    O_NEGATIVO = "O-"
    A_POSITIVO = "A+"
    A_NEGATIVO = "A-"
    B_POSITIVO = "B+"
    B_NEGATIVO = "B-"
    AB_POSITIVO = "AB+"
    AB_NEGATIVO = "AB-"


class PaymentPeriod(Enum):
    SEMANAL = "SEMANAL"
    QUINCENAL = "QUINCENAL"
    MENSUAL = "MENSUAL"

class TallaUniforme(Enum):
    XS = "XS"
    S = "S"
    M = "M"
    L = "L"
    XL = "XL"
    XXL = "XXL"
    XXXL = "XXXL"

class TallaCalzado(Enum):
    VEINTIDOS = "22"
    VEINTIDOS_PUNTO_CINCO = "22.5"
    VEINTITRES = "23"
    VEINTITRES_PUNTO_CINCO = "23.5"
    VEINTICUATRO = "24"
    VEINTICUATRO_PUNTO_CINCO = "24.5"
    VEINTICINCO = "25"
    VEINTICINCO_PUNTO_CINCO = "25.5"
    VEINTISEIS = "26"
    VEINTISEIS_PUNTO_CINCO = "26.5"
    VEINTISIETE = "27"
    VEINTISIETE_PUNTO_CINCO = "27.5"
    VEINTIOCHO = "28"
    VEINTIOCHO_PUNTO_CINCO = "28.5"
    VEINTINUEVE = "29"
    VEINTINUEVE_PUNTO_CINCO = "29.5"
    TREINTA = "30"

class TipoAlmacen(Enum):
    PRINCIPAL="PRINCIPAL"
    SECUNDARIO="SECUNDARIO"
    GARAGE="GARAGE"

class RegimenFiscal(Enum):
    # Persona Física
    SUELDOS_Y_SALARIOS = "605 - Sueldos y Salarios e Ingresos Asimilados a Salarios"
    ARRENDAMIENTO = "606 - Arrendamiento"
    ACTIVIDADES_AGRICOLAS = "607 - Régimen de Enajenación o Adquisición de Bienes"
    DEMAS_INGRESOS = "608 - Demás ingresos"
    CONSOLIDACION = "609 - Consolidación"
    RESIDENTES_EN_EL_EXTRANJERO = "610 - Residentes en el Extranjero sin Establecimiento Permanente en México"
    DIVIDENDOS = "611 - Personas Físicas con Actividades Empresariales y Profesionales"
    ACTIVIDADES_EMPRESARIALES_Y_PROFESIONALES = "612 - Personas Físicas con Actividades Empresariales y Profesionales"
    INGRESOS_POR_INTERESES = "614 - Ingresos por intereses"
    INGRESOS_POR_OBTENCION_DE_PREMIOS = "615 - Régimen de ingresos por obtención de premios"
    SIN_OBLIGACIONES_FISCALES = "616 - Sin obligaciones fiscales"
    INCORPORACION_FISCAL = "621 - Incorporación fiscal"
    ACTIVIDADES_AGRICOLAS_GANADERAS = "622 - Actividades Agrícolas, Ganaderas, Silvícolas y Pesqueras"
    ACTIVIDADES_EMPRESARIALES_CON_INGRESOS_A_ATRAVES_DE_PLATAFORMAS_TECNOLOGICAS = "625 - Régimen de las Actividades Empresariales con ingresos a través de Plataformas Tecnológicas"
    REGIMEN_SIMPLIFICADO_CONFIANZA = "626 - Régimen Simplificado de Confianza"
    ENAJENACION_DE_ACCIONES = "630 - De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales"
    
    # Persona Moral
    GENERAL_DE_LEY = "601 - General de Ley Personas Morales"
    PERSONAS_MORALES_CON_FINES_NO_LUCRATIVOS = "603 - Personas Morales con Fines no Lucrativos"
    SOCIEDADES_COOPERATIVAS_DE_PRODUCCION = "620 - Sociedades Cooperativas de Producción que optan por diferir sus ingresos"
    OPCIONAL_PARA_GRUPOS_DE_SOCIEDADES = "623 - Opcional para Grupos de Sociedades"
    COORDINADOS = "624 - Coordinados"
    HIDROCARBUROS = "628 - Hidrocarburos"
    DE_LOS_REGIMENES_FISCALES_PREFERENTES_Y_EMPRESAS_MULTINACIONALES = "629 - De los Regímenes Fiscales Preferentes y de las Empresas Multinacionales"

    @classmethod
    def get_regimenes_by_tipo_persona(cls, tipo_persona: TipoPersona) -> list:
        if tipo_persona == TipoPersona.FISICA:
            return [
                cls.SUELDOS_Y_SALARIOS,
                cls.ACTIVIDADES_EMPRESARIALES_Y_PROFESIONALES,
                cls.REGIMEN_SIMPLIFICADO_CONFIANZA,
                cls.ARRENDAMIENTO,
                cls.ACTIVIDADES_AGRICOLAS,
                cls.DEMAS_INGRESOS,
                cls.RESIDENTES_EN_EL_EXTRANJERO,
                cls.DIVIDENDOS,
                cls.INGRESOS_POR_INTERESES,
                cls.SIN_OBLIGACIONES_FISCALES,
                cls.INCORPORACION_FISCAL,
                cls.ACTIVIDADES_AGRICOLAS_GANADERAS,
                cls.ENAJENACION_DE_ACCIONES, 
                cls.CONSOLIDACION,
                cls.INGRESOS_POR_OBTENCION_DE_PREMIOS,
                cls.ACTIVIDADES_EMPRESARIALES_CON_INGRESOS_A_ATRAVES_DE_PLATAFORMAS_TECNOLOGICAS

            ]
        elif tipo_persona == TipoPersona.MORAL:
            return [
                cls.GENERAL_DE_LEY,
                cls.PERSONAS_MORALES_CON_FINES_NO_LUCRATIVOS,
                cls.OPCIONAL_PARA_GRUPOS_DE_SOCIEDADES,
                cls.COORDINADOS,
                cls.HIDROCARBUROS,
                cls.SOCIEDADES_COOPERATIVAS_DE_PRODUCCION,
                cls.DE_LOS_REGIMENES_FISCALES_PREFERENTES_Y_EMPRESAS_MULTINACIONALES,
                cls.REGIMEN_SIMPLIFICADO_CONFIANZA
            ]
        return []

    @classmethod
    def is_valid_for_tipo_persona(cls, regimen: 'RegimenFiscal', tipo_persona: TipoPersona) -> bool:
        return regimen in cls.get_regimenes_by_tipo_persona(tipo_persona)
    


class UnidadMedida(str, Enum):
    PIEZA = "H87"
    ELEMENTO = "EA"
    UNIDAD_SERVICIO = "E48"
    ACTIVIDAD = "ACT"
    KILOGRAMO = "KGM"
    TRABAJO = "E51"
    TARIFA = "A9"
    METRO = "MTR"
    PAQUETE_GRANEL = "AB"
    CAJA_BASE = "BB"
    KIT = "KT"
    CONJUNTO = "SET"
    LITRO = "LTR"
    CAJA = "XBX"
    MES = "MON"
    HORA = "HUR"
    METRO_CUADRADO = "MTK"
    EQUIPOS = "11"
    MILIGRAMO = "MGM"
    PAQUETE = "XPK"
    KIT_PIEZAS = "XKI"
    VARIEDAD = "AS"
    GRAMO = "GRM"
    PAR = "PR"
    DOCENAS_PIEZAS = "DPC"
    UNIDAD = "xun"
    DIA = "DAY"
    LOTE = "XLT"
    GRUPOS = "10"
    MILILITRO = "MLT"
    VIAJE = "E54"
    
    @classmethod
    def get_type(cls, value):
        types = {
            "H87": "Múltiplos / Fracciones / Decimales",
            "EA": "Unidades de venta",
            "E48": "Unidades específicas de la industria (varias)",
            "ACT": "Unidades de venta",
            "KGM": "Mecánica",
            "E51": "Unidades específicas de la industria (varias)",
            "A9": "Diversos",
            "MTR": "Tiempo y espacio",
            "AB": "Diversos",
            "BB": "Unidades específicas de la industria (varias)",
            "KT": "Unidades de venta",
            "SET": "Unidades de venta",
            "LTR": "Tiempo y espacio",
            "XBX": "Unidades de empaque",
            "MON": "Tiempo y espacio",
            "HUR": "Tiempo y espacio",
            "MTK": "Tiempo y espacio",
            "11": "Diversos",
            "MGM": "Mecánica",
            "XPK": "Unidades de empaque",
            "XKI": "Unidades de empaque",
            "AS": "Diversos",
            "GRM": "Mecánica",
            "PR": "Números enteros / Números / Ratios",
            "DPC": "Unidades de venta",
            "xun": "Unidades de empaque",
            "DAY": "Tiempo y espacio",
            "XLT": "Unidades de empaque",
            "10": "Diversos",
            "MLT": "Tiempo y espacio",
            "E54": "Unidades específicas de la industria (varias)"
        }
        return types.get(value, "")
    


class TipoMovimiento(Enum):
    ENTRADA = "entrada"
    SALIDA = "salida"
    TRANSFERENCIA = "transferencia"
    AJUSTE = "ajuste"

class TipoEntrada(Enum):
    COMPRA = "compra"
    DEVOLUCION_CLIENTE = "devolucion_cliente"
    TRANSFERENCIA_RECIBIDA = "transferencia_recibida"
    AJUSTE_POSITIVO = "ajuste_positivo"
    PRODUCCION = "produccion"
    DONACION = "donacion"

class TipoSalida(Enum):
    VENTA = "venta"
    AJUSTE_NEGATIVO = "ajuste_negativo"
    TRANSFERENCIA_ENVIADA = "transferencia_enviada"

class MetodoPago(Enum):
    EFECTIVO = "efectivo"
    TRANSFERENCIA = "transferencia"
    CHEQUE = "cheque"
    TARJETA_CREDITO = "tarjeta_credito"
    TARJETA_DEBITO = "tarjeta_debito"
    CREDITO = "credito"

class EstadoMovimiento(Enum):
    PENDIENTE = "pendiente"
    COMPLETADO = "completado"
    CANCELADO = "cancelado"

class EstadoCliente(Enum):
    PROSPECTO = "prospecto"
    CLIENTE = "cliente"
    INACTIVO = "inactivo"