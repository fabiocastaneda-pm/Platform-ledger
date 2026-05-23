import type { Account } from '../../types'

export const mockAccounts: Account[] = [
  // ── ACTIVO: BANCOS ──────────────────────────────────────────────
  { code: '1115000000', name: 'BANCOS Y OTRAS ENTIDADES FINANCIERAS', type: 'activo', status: 'activa', level: 'grupo' },
  { code: '1115050000', name: 'BANCOS NACIONALES',                    type: 'activo', status: 'activa', level: 'cuenta' },
  { code: '1115050101', name: 'Ingreso BANCOLOMBIA S.A. MN',          type: 'activo', status: 'activa', level: 'auxiliar' },
  { code: '1115050102', name: 'Salida BANCOLOMBIA S.A. MN',           type: 'activo', status: 'activa', level: 'auxiliar' },
  { code: '1115050201', name: 'Ingreso BOLD CF MN',                   type: 'activo', status: 'activa', level: 'auxiliar' },
  { code: '1115050202', name: 'Salida BOLD CF MN',                    type: 'activo', status: 'activa', level: 'auxiliar' },
  { code: '1115090000', name: 'BANCO VIRTUAL',                        type: 'activo', status: 'activa', level: 'cuenta' },
  { code: '1115099901', name: 'Ingreso Banco Virtual',                type: 'activo', status: 'activa', level: 'auxiliar' },
  { code: '1115099902', name: 'Salida Banco Virtual',                 type: 'activo', status: 'activa', level: 'auxiliar' },

  // ── PASIVO: DEPÓSITOS ELECTRÓNICOS ──────────────────────────────
  { code: '2120000000', name: 'DEPÓSITOS ELECTRÓNICOS',              type: 'pasivo', status: 'activa', level: 'grupo' },
  { code: '2120050000', name: 'DEPÓSITOS DE DINERO ELECTRÓNICOS',    type: 'pasivo', status: 'activa', level: 'cuenta' },
  { code: '2120050201', name: 'TRANSFERENCIAS BOLD',                 type: 'pasivo', status: 'activa', level: 'auxiliar' },
  { code: '2120050501', name: 'PSE',                                 type: 'pasivo', status: 'activa', level: 'auxiliar' },
  { code: '2120050601', name: 'PSE - CASH OUT',                      type: 'pasivo', status: 'activa', level: 'auxiliar' },
  { code: '2120050801', name: 'ACH',                                 type: 'pasivo', status: 'activa', level: 'auxiliar' },
  { code: '2120050901', name: 'TRANSFIYA',                           type: 'pasivo', status: 'activa', level: 'auxiliar' },
  { code: '2120051601', name: 'QR',                                  type: 'pasivo', status: 'activa', level: 'auxiliar' },
  { code: '2120052101', name: 'TARJETA DE CRÉDITO',                  type: 'pasivo', status: 'activa', level: 'auxiliar' },

  // ── INGRESOS: POR SERVICIOS ──────────────────────────────────────
  { code: '4113000000', name: 'INGRESOS POR SERVICIOS',              type: 'ingreso', status: 'activa', level: 'grupo' },
  { code: '4113950000', name: 'OTROS INGRESOS POR SERVICIO',         type: 'ingreso', status: 'activa', level: 'cuenta' },
  { code: '4113950501', name: 'ACH',                                 type: 'ingreso', status: 'activa', level: 'auxiliar' },
  { code: '4113950601', name: 'PSE',                                 type: 'ingreso', status: 'activa', level: 'auxiliar' },
  { code: '4113950701', name: 'SERVICIOS POS',                       type: 'ingreso', status: 'activa', level: 'auxiliar' },

  // ── INGRESOS: HONORARIOS Y COMISIONES ───────────────────────────
  { code: '4115000000', name: 'HONORARIOS Y COMISIONES',             type: 'ingreso', status: 'activa', level: 'grupo' },
  { code: '4115100000', name: 'SERVICIOS BANCARIOS — INGRESOS',      type: 'ingreso', status: 'activa', level: 'cuenta' },
  { code: '4115100101', name: 'COMISIÓN ATM',                        type: 'ingreso', status: 'activa', level: 'auxiliar' },
  { code: '4115100201', name: 'COMISIÓN EFECTY',                     type: 'ingreso', status: 'activa', level: 'auxiliar' },
  { code: '4115100501', name: 'COMISIÓN BOLSILLOS REMUNERADOS',      type: 'ingreso', status: 'activa', level: 'auxiliar' },
  { code: '4115102401', name: 'COMISIÓN PSE',                        type: 'ingreso', status: 'activa', level: 'auxiliar' },
  { code: '4115140000', name: 'ESTABLECIMIENTOS AFILIADOS TARJETAS', type: 'ingreso', status: 'activa', level: 'cuenta' },
  { code: '4115140101', name: 'TARJETAS DÉBITO',                     type: 'ingreso', status: 'activa', level: 'auxiliar' },
  { code: '4115140501', name: 'ADQUIRENCIA',                         type: 'ingreso', status: 'activa', level: 'auxiliar' },

  // ── GASTOS: COMISIONES ───────────────────────────────────────────
  { code: '5115000000', name: 'COMISIONES GASTOS',                   type: 'egreso', status: 'activa', level: 'grupo' },
  { code: '5115120000', name: 'SERVICIOS BANCARIOS — COSTOS',        type: 'egreso', status: 'activa', level: 'cuenta' },
  { code: '5115120201', name: 'COSTOS ACH — GASTO',                  type: 'egreso', status: 'activa', level: 'auxiliar' },
  { code: '5115120501', name: 'COSTOS BANREP — COMISIÓN',            type: 'egreso', status: 'activa', level: 'auxiliar' },
  { code: '5115120701', name: 'COSTOS EFECTY',                       type: 'egreso', status: 'activa', level: 'auxiliar' },
  { code: '5115510000', name: 'COMISIONES POR VENTAS',               type: 'egreso', status: 'activa', level: 'cuenta' },
  { code: '5115510501', name: 'OPERACIONES DE ADQUIRENCIA',          type: 'egreso', status: 'activa', level: 'auxiliar' },
  { code: '5115510601', name: 'OPERACIONES FRANQUICIA MASTERCARD — COSTO', type: 'egreso', status: 'activa', level: 'auxiliar' },
]
