import type { Ledger, AccountingEntryConfig, FieldMapping, LedgerCompany, LedgerCurrency } from '../../types'

// ─── Payment transaction types (Adquirencia doméstico e internacional) ─────────
const PAYMENT_TX_TYPES = [
  'VisaBancolombiaApprovedTransaction','VisaXXXApprovedTransaction','VisaElectronBancolombiaApprovedTransaction',
  'MasterBancolombiaApprovedTransaction','MaestroBancolombiaApprovedTransaction','AmexBancolombiaApprovedTransaction',
  'TuyaBancolombiaApprovedTransaction','PseBancolombiaApprovedTransaction','NequiApprovedTransaction',
  'BotonBancolombiaApprovedTransaction','DaviplataApprovedTransaction','MasterDaviviendaApprovedTransaction',
  'MaestroDaviviendaApprovedTransaction','DinersDaviviendaApprovedTransaction','DiscoveryDaviviendaApprovedTransaction',
  'OlimpicaSerfinanzaApprovedTransaction','CodensaScotiaApprovedTransaction','VisaBoldCfApprovedTransaction',
  'VisaElectronBoldCfApprovedTransaction','MasterBoldCfApprovedTransaction','MaestroBoldCfApprovedTransaction',
  'QrBoldApprovedTransaction','PseBoldCFApprovedTransaction',
  'VisaBancolombiaVoidedTransaction','VisaElectronBancolombiaVoidedTransaction','MasterBancolombiaVoidedTransaction',
  'MaestroBancolombiaVoidedTransaction','AmexBancolombiaVoidedTransaction','TuyaBancolombiaVoidedTransaction',
  'PseBancolombiaVoidedTransaction','NequiVoidedTransaction','BotonBancolombiaVoidedTransaction',
  'DaviplataVoidedTransaction','MasterDaviviendaVoidedTransaction','MaestroDaviviendaVoidedTransaction',
  'DinersDaviviendaVoidedTransaction','DiscoveryDaviviendaVoidedTransaction','OlimpicaSerfinanzaVoidedTransaction',
  'CodensaScotiaVoidedTransaction','VisaBoldCfVoidedTransaction','VisaElectronBoldCfVoidedTransaction',
  'MasterBoldCfVoidedTransaction','MaestroBoldCfVoidedTransaction','QrBoldVoidedTransaction','PseBoldCFVoidedTransaction',
  'VisaBancolombiaChargebackTransaction','VisaElectronBancolombiaChargebackTransaction','MasterBancolombiaChargebackTransaction',
  'MaestroBancolombiaChargebackTransaction','AmexBancolombiaChargebackTransaction','TuyaBancolombiaChargebackTransaction',
  'PseBancolombiaChargebackTransaction','NequiChargebackTransaction','BotonBancolombiaChargebackTransaction',
  'DaviplataChargebackTransaction','MasterDaviviendaChargebackTransaction','MaestroDaviviendaChargebackTransaction',
  'DinersDaviviendaChargebackTransaction','DiscoveryDaviviendaChargebackTransaction','OlimpicaSerfinanzaChargebackTransaction',
  'CodensaScotiaChargebackTransaction','VisaBoldCfChargebackTransaction','VisaElectronBoldCfChargebackTransaction',
  'MasterBoldCfChargebackTransaction','MaestroBoldCfChargebackTransaction','QrBoldChargebackTransaction','PseBoldCFChargebackTransaction',
  'VisaBancolombiaRefundedTransaction','VisaElectronBancolombiaRefundedTransaction','MasterBancolombiaRefundedTransaction',
  'MaestroBancolombiaRefundedTransaction','AmexBancolombiaRefundedTransaction','TuyaBancolombiaRefundedTransaction',
  'PseBancolombiaRefundedTransaction','NequiRefundedTransaction','BotonBancolombiaRefundedTransaction',
  'DaviplataRefundedTransaction','MasterDaviviendaRefundedTransaction','MaestroDaviviendaRefundedTransaction',
  'DinersDaviviendaRefundedTransaction','DiscoveryDaviviendaRefundedTransaction','OlimpicaSerfinanzaRefundedTransaction',
  'CodensaScotiaRefundedTransaction','VisaBoldCfRefundedTransaction','VisaElectronBoldCfRefundedTransaction',
  'MasterBoldCfRefundedTransaction','MaestroBoldCfRefundedTransaction','QrBoldRefundedTransaction','PseBoldCFRefundedTransaction',
  'VisaBancolombiaReversedTransaction','VisaElectronBancolombiaReversedTransaction','MasterBancolombiaReversedTransaction',
  'MaestroBancolombiaReversedTransaction','AmexBancolombiaReversedTransaction','TuyaBancolombiaReversedTransaction',
  'PseBancolombiaReversedTransaction','NequiReversedTransaction','BotonBancolombiaReversedTransaction',
  'DaviplataReversedTransaction','MasterDaviviendaReversedTransaction','MaestroDaviviendaReversedTransaction',
  'DinersDaviviendaReversedTransaction','DiscoveryDaviviendaReversedTransaction','OlimpicaSerfinanzaReversedTransaction',
  'CodensaScotiaReversedTransaction','VisaBoldCfReversedTransaction','VisaElectronBoldCfReversedTransaction',
  'MasterBoldCfReversedTransaction','MaestroBoldCfReversedTransaction','QrBoldReversedTransaction','PseBoldCFReversedTransaction',
  'VisaBancolombiaChargebackReversionTransaction','VisaElectronBancolombiaChargebackReversionTransaction',
  'MasterBancolombiaChargebackReversionTransaction','MaestroBancolombiaChargebackReversionTransaction',
  'AmexBancolombiaChargebackReversionTransaction','TuyaBancolombiaChargebackReversionTransaction',
  'PseBancolombiaChargebackReversionTransaction','NequiChargebackReversionTransaction',
  'BotonBancolombiaChargebackReversionTransaction','DaviplataChargebackReversionTransaction',
  'MasterDaviviendaChargebackReversionTransaction','MaestroDaviviendaChargebackReversionTransaction',
  'DinersDaviviendaChargebackReversionTransaction','DiscoveryDaviviendaChargebackReversionTransaction',
  'OlimpicaSerfinanzaChargebackReversionTransaction','CodensaScotiaChargebackReversionTransaction',
  'VisaBoldCfChargebackReversionTransaction','VisaElectronBoldCfChargebackReversionTransaction',
  'MasterBoldCfChargebackReversionTransaction','MaestroBoldCfChargebackReversionTransaction',
  'QrBoldChargebackReversionTransaction','PseBoldCFChargebackReversionTransaction',
  'VisaBancolombiaDisputedTransaction','VisaElectronBancolombiaDisputedTransaction','MasterBancolombiaDisputedTransaction',
  'MaestroBancolombiaDisputedTransaction','AmexBancolombiaDisputedTransaction','TuyaBancolombiaDisputedTransaction',
  'PseBancolombiaDisputedTransaction','NequiDisputedTransaction','BotonBancolombiaDisputedTransaction',
  'DaviplataDisputedTransaction','MasterDaviviendaDisputedTransaction','MaestroDaviviendaDisputedTransaction',
  'DinersDaviviendaDisputedTransaction','DiscoveryDaviviendaDisputedTransaction','OlimpicaSerfinanzaDisputedTransaction',
  'CodensaScotiaDisputedTransaction','VisaBoldCfDisputedTransaction','VisaElectronBoldCfDisputedTransaction',
  'MasterBoldCfDisputedTransaction','MaestroBoldCfDisputedTransaction','QrBoldDisputedTransaction','PseBoldCFDisputedTransaction',
  'VisaBancolombiaReleasedTransaction','VisaElectronBancolombiaReleasedTransaction','MasterBancolombiaReleasedTransaction',
  'MaestroBancolombiaReleasedTransaction','AmexBancolombiaReleasedTransaction','TuyaBancolombiaReleasedTransaction',
  'PseBancolombiaReleasedTransaction','NequiReleasedTransaction','BotonBancolombiaReleasedTransaction',
  'DaviplataReleasedTransaction','MasterDaviviendaReleasedTransaction','MaestroDaviviendaReleasedTransaction',
  'DinersDaviviendaReleasedTransaction','DiscoveryDaviviendaReleasedTransaction','OlimpicaSerfinanzaReleasedTransaction',
  'CodensaScotiaReleasedTransaction','VisaBoldCfReleasedTransaction','VisaElectronBoldCfReleasedTransaction',
  'MasterBoldCfReleasedTransaction','MaestroBoldCfReleasedTransaction','QrBoldReleasedTransaction','PseBoldCFReleasedTransaction',
  'VisaBancolombiaConfirmedTransaction','VisaElectronBancolombiaConfirmedTransaction','MasterBancolombiaConfirmedTransaction',
  'MaestroBancolombiaConfirmedTransaction','AmexBancolombiaConfirmedTransaction','TuyaBancolombiaConfirmedTransaction',
  'PseBancolombiaConfirmedTransaction','NequiConfirmedTransaction','BotonBancolombiaConfirmedTransaction',
  'DaviplataConfirmedTransaction','MasterDaviviendaConfirmedTransaction','MaestroDaviviendaConfirmedTransaction',
  'DinersDaviviendaConfirmedTransaction','DiscoveryDaviviendaConfirmedTransaction','OlimpicaSerfinanzaConfirmedTransaction',
  'CodensaScotiaConfirmedTransaction','VisaBoldCfConfirmedTransaction','VisaElectronBoldCfConfirmedTransaction',
  'MasterBoldCfConfirmedTransaction','MaestroBoldCfConfirmedTransaction','QrBoldConfirmedTransaction','PseBoldCFConfirmedTransaction',
  'CapitalCupoBoldShadowDiscount','CfCupoBoldShadowDiscount',
  'CapitalCupoBoldInterestAdjustment','CfCupoBoldInterestAdjustment',
  'VantiApprovedTransaction','VantiVoidedTransaction','VantiRefundedTransaction',
  'LedgerActivationTransaction','AdjustmentBalanceMerchantCredit','AdjustmentBalanceMerchantDebit',
  'VisaBancolombiaChargebackDirectTransaction','VisaElectronBancolombiaChargebackDirectTransaction',
  'MasterBancolombiaChargebackDirectTransaction','MaestroBancolombiaChargebackDirectTransaction',
  'AmexBancolombiaChargebackDirectTransaction','TuyaBancolombiaChargebackDirectTransaction',
  'PseBancolombiaChargebackDirectTransaction','NequiChargebackDirectTransaction',
  'BotonBancolombiaChargebackDirectTransaction','DaviplataChargebackDirectTransaction',
  'MasterDaviviendaChargebackDirectTransaction','MaestroDaviviendaChargebackDirectTransaction',
  'DinersDaviviendaChargebackDirectTransaction','DiscoveryDaviviendaChargebackDirectTransaction',
  'OlimpicaSerfinanzaChargebackDirectTransaction','CodensaScotiaChargebackDirectTransaction',
  'VisaBoldCfChargebackDirectTransaction','VisaElectronBoldCfChargebackDirectTransaction',
  'MasterBoldCfChargebackDirectTransaction','MaestroBoldCfChargebackDirectTransaction',
  'QrBoldChargebackDirectTransaction','PseBoldCFChargebackDirectTransaction',
  'CapitalCupoBoldInterestReversed','CfCupoBoldInterestReversed',
  'VisaBancolombiaChargeBackAssumedTransaction','VisaElectronBancolombiaChargeBackAssumedTransaction',
  'MasterBancolombiaChargeBackAssumedTransaction','MaestroBancolombiaChargeBackAssumedTransaction',
  'AmexBancolombiaChargeBackAssumedTransaction','TuyaBancolombiaChargeBackAssumedTransaction',
  'PseBancolombiaChargeBackAssumedTransaction','NequiChargeBackAssumedTransaction',
  'BotonBancolombiaChargeBackAssumedTransaction','DaviplataChargeBackAssumedTransaction',
  'MasterDaviviendaChargeBackAssumedTransaction','MaestroDaviviendaChargeBackAssumedTransaction',
  'DinersDaviviendaChargeBackAssumedTransaction','DiscoveryDaviviendaChargeBackAssumedTransaction',
  'OlimpicaSerfinanzaChargeBackAssumedTransaction','CodensaScotiaChargeBackAssumedTransaction',
  'VisaBoldCfChargeBackAssumedTransaction','VisaElectronBoldCfChargeBackAssumedTransaction',
  'MasterBoldCfChargeBackAssumedTransaction','MaestroBoldCfChargeBackAssumedTransaction',
  'QrBoldChargeBackAssumedTransaction','PseBoldCFChargeBackAssumedTransaction',
  'AmexDaviviendaApprovedTransaction','AmexDaviviendaVoidedTransaction','AmexDaviviendaChargebackTransaction',
  'AmexDaviviendaRefundedTransaction','AmexDaviviendaReversedTransaction','AmexDaviviendaChargebackReversionTransaction',
  'AmexDaviviendaDisputedTransaction','AmexDaviviendaReleasedTransaction',
]

type FM = { field: string; code: string; name: string; nature: 'debito' | 'credito'; ceco: string; note: string }

function paymentFMs(txType: string): FM[] {
  const t = txType
  if (t.endsWith('ApprovedTransaction') || t.endsWith('ConfirmedTransaction')) return [
    { field: 'amount_gross', code: '1110', name: 'Bancos', nature: 'debito', ceco: 'A1C20000', note: 'Ingreso bruto adquirencia' },
    { field: 'amount_fee',   code: '4135', name: 'Servicios de intermediación financiera', nature: 'credito', ceco: 'A1C20000', note: 'Comisión adquirencia cobrada' },
  ]
  if (t.endsWith('VoidedTransaction') || t.endsWith('ReversedTransaction') || t.endsWith('RefundedTransaction')) return [
    { field: 'amount_gross', code: '4135', name: 'Servicios de intermediación financiera', nature: 'debito', ceco: 'A1C20000', note: 'Reversión de ingreso adquirencia' },
    { field: 'amount_fee',   code: '1110', name: 'Bancos', nature: 'credito', ceco: 'A1C20000', note: 'Devolución de fondos al comercio' },
  ]
  if (t.endsWith('ChargebackTransaction') || t.endsWith('ChargebackDirectTransaction') || t.endsWith('ChargeBackAssumedTransaction')) return [
    { field: 'amount_chargeback', code: '2810', name: 'Provisiones para litigios', nature: 'debito',  ceco: 'A1C20000', note: 'Contracargo recibido de red' },
    { field: 'amount_gross',      code: '1110', name: 'Bancos', nature: 'credito', ceco: 'A1C20000', note: 'Débito cuenta por contracargo' },
  ]
  if (t.endsWith('ChargebackReversionTransaction')) return [
    { field: 'amount_gross',      code: '1110', name: 'Bancos', nature: 'debito',  ceco: 'A1C20000', note: 'Restitución fondos por reversión contracargo' },
    { field: 'amount_chargeback', code: '2810', name: 'Provisiones para litigios', nature: 'credito', ceco: 'A1C20000', note: 'Cierre de provisión contracargo' },
  ]
  if (t.endsWith('DisputedTransaction')) return [
    { field: 'amount_disputed', code: '2810', name: 'Provisiones para litigios', nature: 'debito',  ceco: 'A1C20000', note: 'Apertura de disputa — bloqueo provisional' },
    { field: 'amount_gross',    code: '1105', name: 'Caja', nature: 'credito', ceco: 'A1C20000', note: 'Retención de fondos en disputa' },
  ]
  if (t.endsWith('ReleasedTransaction')) return [
    { field: 'amount_gross',    code: '1105', name: 'Caja', nature: 'debito',  ceco: 'A1C20000', note: 'Liberación de fondos post-disputa' },
    { field: 'amount_disputed', code: '2810', name: 'Provisiones para litigios', nature: 'credito', ceco: 'A1C20000', note: 'Cierre de provisión disputa' },
  ]
  if (t.endsWith('ShadowDiscount')) return [
    { field: 'amount_discount', code: '5210', name: 'Honorarios', nature: 'debito',  ceco: 'A1C30000', note: 'Descuento sombra Cupo Bold' },
    { field: 'amount_gross',    code: '1110', name: 'Bancos', nature: 'credito', ceco: 'A1C30000', note: 'Aplicación de descuento sombra' },
  ]
  if (t.endsWith('InterestAdjustment')) return [
    { field: 'amount_gross',    code: '1110', name: 'Bancos', nature: 'debito',  ceco: 'A1C30000', note: 'Débito por ajuste de interés Cupo Bold' },
    { field: 'amount_interest', code: '4210', name: 'Ingresos por comisiones', nature: 'credito', ceco: 'A1C30000', note: 'Ajuste de intereses Cupo Bold' },
  ]
  if (t.endsWith('InterestReversed')) return [
    { field: 'amount_interest', code: '2810', name: 'Provisiones para litigios', nature: 'debito',  ceco: 'A1C30000', note: 'Reversión de intereses Cupo Bold' },
    { field: 'amount_gross',    code: '1105', name: 'Caja', nature: 'credito', ceco: 'A1C30000', note: 'Crédito por reversión de interés' },
  ]
  if (t === 'LedgerActivationTransaction') return [
    { field: 'amount_activation', code: '1105', name: 'Caja', nature: 'debito',  ceco: 'A1C20000', note: 'Activación de ledger — saldo inicial' },
    { field: 'amount_fee',        code: '4135', name: 'Servicios de intermediación financiera', nature: 'credito', ceco: 'A1C20000', note: 'Ingreso por activación' },
  ]
  if (t === 'AdjustmentBalanceMerchantCredit') return [
    { field: 'amount_adjustment', code: '1110', name: 'Bancos', nature: 'debito',  ceco: 'A1C20000', note: 'Ajuste de balance — crédito comercio' },
    { field: 'amount_fee',        code: '4135', name: 'Servicios de intermediación financiera', nature: 'credito', ceco: 'A1C20000', note: 'Registro ajuste crédito' },
  ]
  if (t === 'AdjustmentBalanceMerchantDebit') return [
    { field: 'amount_adjustment', code: '4135', name: 'Servicios de intermediación financiera', nature: 'debito',  ceco: 'A1C20000', note: 'Ajuste de balance — débito comercio' },
    { field: 'amount_fee',        code: '1110', name: 'Bancos', nature: 'credito', ceco: 'A1C20000', note: 'Registro ajuste débito' },
  ]
  // fallback
  return [
    { field: 'amount_gross', code: '1110', name: 'Bancos', nature: 'debito',  ceco: 'A1C20000', note: 'Registro contable automático' },
    { field: 'amount_fee',   code: '4135', name: 'Servicios de intermediación financiera', nature: 'credito', ceco: 'A1C20000', note: 'Comisión aplicada' },
  ]
}

function mkPaymentConfig(txType: string, idx: number): AccountingEntryConfig {
  const fms = paymentFMs(txType)
  return {
    id: `cfg-pay-${idx + 1}`,
    ledgerId: 'ldg-025',
    transactionType: txType,
    fieldMappings: fms.map((m, mi): FieldMapping => ({
      id: `fm-pay-${idx + 1}-${mi + 1}`,
      fieldName: m.field,
      accountCode: m.code,
      accountName: m.name,
      nature: m.nature,
      ceco: m.ceco,
      accountingNote: m.note,
    })),
    createdAt: '2026-06-01T09:00:00Z',
    version: 1,
  }
}

const USERS = [
  'maria.lopez@bold.co',
  'juan.perez@bold.co',
  'ana.reyes@bold.co',
  'carlos.mendez@bold.co',
]

function u(i: number) { return USERS[i % USERS.length] }

function mkConfig(ledgerId: string, txType: string, desc: string): AccountingEntryConfig {
  return {
    id: `cfg-${ledgerId}`,
    ledgerId,
    transactionType: txType,
    description: desc,
    fieldMappings: [
      { id: `fm-${ledgerId}-1`, fieldName: 'amount_principal', accountCode: '1105', accountName: 'Caja', nature: 'debito' },
      { id: `fm-${ledgerId}-2`, fieldName: 'amount_fee', accountCode: '4135', accountName: 'Servicios de intermediación financiera', nature: 'credito' },
    ],
    createdAt: '2026-04-01T09:00:00Z',
    version: 1,
  }
}

export const mockLedgers: Ledger[] = [
  {
    id: 'ldg-001', name: 'EFECTY', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-001', createdAt: '2026-01-10T09:00:00Z', updatedAt: '2026-07-01T14:00:00Z',
    createdBy: u(0), description: 'Pagos y retiros en efectivo mediante red EFECTY',
    configs: [mkConfig('ldg-001', 'pago_efecty', 'Registro de pago en efectivo EFECTY')],
  },
  {
    id: 'ldg-002', name: 'Servibanca', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-002', createdAt: '2026-01-12T09:00:00Z', updatedAt: '2026-07-02T10:00:00Z',
    createdBy: u(1), description: 'Retiros en red Servibanca',
    configs: [],
  },
  {
    id: 'ldg-003', name: 'PSE CashIn', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'SAS', currency: 'COP',
    internalId: 'LDG-003', createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-07-05T11:00:00Z',
    createdBy: u(2), description: 'Ingresos de dinero vía PSE',
    configs: [mkConfig('ldg-003', 'pse_cashin', 'Ingreso de fondos por PSE')],
  },
  {
    id: 'ldg-004', name: 'PSE CashOut', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'SAS', currency: 'COP',
    internalId: 'LDG-004', createdAt: '2026-01-15T09:00:00Z', updatedAt: '2026-07-05T11:30:00Z',
    createdBy: u(2), description: 'Egresos de dinero vía PSE',
    configs: [],
  },
  {
    id: 'ldg-005', name: 'Transferencias Bold', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'SAS', currency: 'COP',
    internalId: 'LDG-005', createdAt: '2026-02-01T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z',
    createdBy: u(3), description: 'Transferencias entre cuentas Bold',
    configs: [],
  },
  {
    id: 'ldg-006', name: 'Pagos y recargas', product: '', status: 'activo',
    country: 'colombia', frequency: 'semanal', company: 'SAS', currency: 'COP',
    internalId: 'LDG-006', createdAt: '2026-02-03T09:00:00Z', updatedAt: '2026-07-08T14:00:00Z',
    createdBy: u(0), description: 'Pagos de servicios y recargas de celular',
    configs: [],
  },
  {
    id: 'ldg-007', name: 'CDT Deposit', product: '', status: 'activo',
    country: 'colombia', frequency: 'mensual', company: 'CF', currency: 'COP',
    internalId: 'LDG-007', createdAt: '2026-02-10T09:00:00Z', updatedAt: '2026-07-12T10:00:00Z',
    createdBy: u(1), description: 'Depósitos en CDT para clientes',
    configs: [],
  },
  {
    id: 'ldg-008', name: 'ACH Deposit', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-008', createdAt: '2026-02-12T09:00:00Z', updatedAt: '2026-07-11T15:00:00Z',
    createdBy: u(2), description: 'Depósitos vía cámara ACH',
    configs: [],
  },
  {
    id: 'ldg-009', name: 'QR - Bre-B', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'SAS', currency: 'COP',
    internalId: 'LDG-009', createdAt: '2026-03-01T09:00:00Z', updatedAt: '2026-07-15T09:00:00Z',
    createdBy: u(3), description: 'Pagos QR interoperables Bre-B',
    configs: [],
  },
  {
    id: 'ldg-010', name: 'Breb', product: '', status: 'borrador',
    country: 'colombia', frequency: 'diario', company: 'SAS', currency: 'COP',
    internalId: 'LDG-010', createdAt: '2026-07-01T09:00:00Z', updatedAt: '2026-07-01T09:00:00Z',
    createdBy: u(0), description: undefined,
    configs: [],
  },
  {
    id: 'ldg-011', name: 'Llaves Redeban - Bre-B', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'SAS', currency: 'COP',
    internalId: 'LDG-011', createdAt: '2026-03-05T09:00:00Z', updatedAt: '2026-07-10T11:00:00Z',
    createdBy: u(1), description: 'Llaves de interoperabilidad Redeban en red Bre-B',
    configs: [],
  },
  {
    id: 'ldg-012', name: 'Transfiya', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-012', createdAt: '2026-03-08T09:00:00Z', updatedAt: '2026-07-14T10:00:00Z',
    createdBy: u(2), description: 'Transferencias inmediatas vía Transfiya',
    configs: [],
  },
  {
    id: 'ldg-013', name: 'Bolsillos remunerados', product: '', status: 'activo',
    country: 'colombia', frequency: 'mensual', company: 'CF', currency: 'COP',
    internalId: 'LDG-013', createdAt: '2026-03-10T09:00:00Z', updatedAt: '2026-07-18T09:00:00Z',
    createdBy: u(3), description: 'Causación de rendimientos en bolsillos remunerados',
    configs: [],
  },
  {
    id: 'ldg-014', name: 'Pagos tributarios', product: '', status: 'activo',
    country: 'colombia', frequency: 'mensual', company: 'SAS', currency: 'COP',
    internalId: 'LDG-014', createdAt: '2026-03-12T09:00:00Z', updatedAt: '2026-07-20T08:00:00Z',
    createdBy: u(0), description: 'Pagos de impuestos nacionales y distritales',
    configs: [],
  },
  {
    id: 'ldg-015', name: 'CDT - Constitución, causación, pagos', product: '', status: 'activo',
    country: 'colombia', frequency: 'mensual', company: 'CF', currency: 'COP',
    internalId: 'LDG-015', createdAt: '2026-03-15T09:00:00Z', updatedAt: '2026-07-19T11:00:00Z',
    createdBy: u(1), description: 'Ciclo completo de CDT: constitución, causación y pago de rendimientos',
    configs: [],
  },
  {
    id: 'ldg-016', name: 'Cash In CUD - PSE - Adquirencia FDS', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-016', createdAt: '2026-04-01T09:00:00Z', updatedAt: '2026-07-21T09:00:00Z',
    createdBy: u(2), description: 'Ingresos por CUD, PSE y adquirencia fondo de seguridad',
    configs: [],
  },
  {
    id: 'ldg-017', name: 'Cash In Montos altos', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-017', createdAt: '2026-04-02T09:00:00Z', updatedAt: '2026-07-21T10:00:00Z',
    createdBy: u(3), description: 'Cash In superiores a umbral de montos altos',
    configs: [],
  },
  {
    id: 'ldg-018', name: 'Debit Card ATM Dom en SAP', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-018', createdAt: '2026-04-05T09:00:00Z', updatedAt: '2026-07-20T14:00:00Z',
    createdBy: u(0), description: 'Retiros en ATM domésticos con tarjeta débito registrados en SAP',
    configs: [],
  },
  {
    id: 'ldg-019', name: 'Debit Card POS Dom en SAP', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-019', createdAt: '2026-04-05T09:00:00Z', updatedAt: '2026-07-20T14:30:00Z',
    createdBy: u(1), description: 'Compras en POS domésticos con tarjeta débito registrados en SAP',
    configs: [],
  },
  {
    id: 'ldg-020', name: 'Debit Card POS Int en SAP', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-020', createdAt: '2026-04-06T09:00:00Z', updatedAt: '2026-07-20T15:00:00Z',
    createdBy: u(2), description: 'Compras en POS internacionales con tarjeta débito registrados en SAP',
    configs: [],
  },
  {
    id: 'ldg-021', name: 'Debit Card ATM Int en SAP', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-021', createdAt: '2026-04-06T09:00:00Z', updatedAt: '2026-07-20T15:30:00Z',
    createdBy: u(3), description: 'Retiros en ATM internacionales con tarjeta débito registrados en SAP',
    configs: [],
  },
  {
    id: 'ldg-022', name: 'Desembolsos Cupo bold (Comercial, TC, Pay in 4)', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'Capital', currency: 'COP',
    internalId: 'LDG-022', createdAt: '2026-04-10T09:00:00Z', updatedAt: '2026-07-18T11:00:00Z',
    createdBy: u(0), description: 'Desembolsos de líneas de crédito Cupo Bold',
    configs: [],
  },
  {
    id: 'ldg-023', name: 'Débitos automáticos', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'SAS', currency: 'COP',
    internalId: 'LDG-023', createdAt: '2026-04-12T09:00:00Z', updatedAt: '2026-07-17T09:00:00Z',
    createdBy: u(1), description: 'Cobros automáticos domiciliados',
    configs: [],
  },
  {
    id: 'ldg-024', name: 'Adquirencia Manual', product: '', status: 'inactivo',
    country: 'colombia', frequency: 'diario', company: 'SAS', currency: 'COP',
    internalId: 'LDG-024', createdAt: '2025-08-01T09:00:00Z', updatedAt: '2026-01-15T10:00:00Z',
    createdBy: u(2), description: 'Adquirencia manual para comercios sin terminal',
    configs: [mkConfig('ldg-024', 'adquirencia_manual', 'Registro manual de adquirencia')],
  },
  {
    id: 'ldg-025', name: 'Adquirencia doméstico e internacional', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'SAS', currency: 'COP',
    internalId: 'LDG-025', createdAt: '2026-01-20T09:00:00Z', updatedAt: '2026-07-21T10:00:00Z',
    createdBy: u(3), description: 'Transacciones de adquirencia doméstica e internacional',
    configs: PAYMENT_TX_TYPES.map(mkPaymentConfig),
  },
  {
    id: 'ldg-026', name: 'Cupo bold CF ledger general', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-026', createdAt: '2026-05-01T09:00:00Z', updatedAt: '2026-07-15T11:00:00Z',
    createdBy: u(0), description: 'Ledger general de línea Cupo Bold en CF',
    configs: [],
  },
  {
    id: 'ldg-027', name: 'Cupo bold CF Cuentas espejo y rotación', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-027', createdAt: '2026-05-02T09:00:00Z', updatedAt: '2026-07-15T11:30:00Z',
    createdBy: u(1), description: 'Cuentas espejo y rotación de fondos para Cupo Bold CF',
    configs: [],
  },
  {
    id: 'ldg-028', name: 'Cupo bold CF / TC Provisiones', product: '', status: 'activo',
    country: 'colombia', frequency: 'mensual', company: 'CF', currency: 'COP',
    internalId: 'LDG-028', createdAt: '2026-05-05T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z',
    createdBy: u(2), description: 'Provisiones de cartera para Cupo Bold y Tarjeta de Crédito',
    configs: [],
  },
  {
    id: 'ldg-029', name: 'Tarjeta crédito doméstico', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-029', createdAt: '2026-05-08T09:00:00Z', updatedAt: '2026-07-20T09:00:00Z',
    createdBy: u(3), description: 'Transacciones de tarjeta de crédito en comercios domésticos',
    configs: [],
  },
  {
    id: 'ldg-030', name: 'Tarjeta crédito internacional', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-030', createdAt: '2026-05-08T09:00:00Z', updatedAt: '2026-07-20T09:30:00Z',
    createdBy: u(0), description: 'Transacciones de tarjeta de crédito en comercios internacionales',
    configs: [],
  },
  {
    id: 'ldg-031', name: 'Tarjeta Credito Cuentas espejo y rotación', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'CF', currency: 'COP',
    internalId: 'LDG-031', createdAt: '2026-05-10T09:00:00Z', updatedAt: '2026-07-19T14:00:00Z',
    createdBy: u(1), description: 'Cuentas espejo y rotación de fondos para Tarjeta de Crédito',
    configs: [],
  },
  {
    id: 'ldg-032', name: 'Cupo Comercial ledger general', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'Capital', currency: 'COP',
    internalId: 'LDG-032', createdAt: '2026-05-12T09:00:00Z', updatedAt: '2026-07-18T10:00:00Z',
    createdBy: u(2), description: 'Ledger general para línea de Cupo Comercial',
    configs: [],
  },
  {
    id: 'ldg-033', name: 'Cupo Comercial rotación y cuentas espejo', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'Capital', currency: 'COP',
    internalId: 'LDG-033', createdAt: '2026-05-12T09:00:00Z', updatedAt: '2026-07-18T10:30:00Z',
    createdBy: u(3), description: 'Rotación de cartera y cuentas espejo Cupo Comercial',
    configs: [],
  },
  {
    id: 'ldg-034', name: 'Cupo Comercial provisiones', product: '', status: 'activo',
    country: 'colombia', frequency: 'mensual', company: 'Capital', currency: 'COP',
    internalId: 'LDG-034', createdAt: '2026-05-15T09:00:00Z', updatedAt: '2026-07-14T11:00:00Z',
    createdBy: u(0), description: 'Provisiones de cartera vencida Cupo Comercial',
    configs: [],
  },
  {
    id: 'ldg-035', name: 'Notas débito y crédito cuenta depósito', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'SAS', currency: 'COP',
    internalId: 'LDG-035', createdAt: '2026-06-01T09:00:00Z', updatedAt: '2026-07-21T08:00:00Z',
    createdBy: u(1), description: 'Notas de ajuste débito y crédito sobre cuentas de depósito',
    configs: [],
  },
  {
    id: 'ldg-036', name: 'Payin 4 ledger general', product: '', status: 'activo',
    country: 'colombia', frequency: 'diario', company: 'Capital', currency: 'COP',
    internalId: 'LDG-036', createdAt: '2026-06-05T09:00:00Z', updatedAt: '2026-07-20T16:00:00Z',
    createdBy: u(2), description: 'Ledger general para producto Pay in 4',
    configs: [],
  },
  {
    id: 'ldg-037', name: 'Payin 4 Cuentas espejo y rotación', product: '', status: 'borrador',
    country: 'colombia', frequency: 'diario', company: 'Capital', currency: 'COP',
    internalId: 'LDG-037', createdAt: '2026-07-10T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z',
    createdBy: u(3), description: undefined,
    configs: [],
  },
  {
    id: 'ldg-038', name: 'Payin 4 Provisiones', product: '', status: 'borrador',
    country: 'colombia', frequency: 'mensual', company: 'Capital', currency: 'COP',
    internalId: 'LDG-038', createdAt: '2026-07-10T09:00:00Z', updatedAt: '2026-07-10T09:00:00Z',
    createdBy: u(0), description: undefined,
    configs: [],
  },
  {
    id: 'ldg-039', name: 'Pagos a proveedores CF - Capital - SAS', product: '', status: 'activo',
    country: 'colombia', frequency: 'mensual', company: 'CF', currency: 'COP',
    internalId: 'LDG-039', createdAt: '2026-06-15T09:00:00Z', updatedAt: '2026-07-21T11:00:00Z',
    createdBy: u(1), description: 'Pagos a proveedores consolidados de las tres compañías',
    configs: [],
  },
]

export const PRODUCTS = [
  'Cashout Montos Altos',
  'Cashout Express',
  'Remesas Internacionales',
  'Pagos PSE',
  'Datáfonos Terminal',
  'Link de Pago',
  'Cobro Recurrente',
]

export const COUNTRIES = [
  { value: 'colombia', label: '🇨🇴 Colombia' },
  { value: 'peru',     label: '🇵🇪 Perú' },
]

export const FREQUENCIES = [
  { value: 'diario',    label: 'Diario' },
  { value: 'semanal',   label: 'Semanal' },
  { value: 'quincenal', label: 'Quincenal' },
  { value: 'mensual',   label: 'Mensual' },
]

export const COMPANIES: { value: LedgerCompany; label: string }[] = [
  { value: 'CF',      label: 'Bold CF' },
  { value: 'SAS',     label: 'Bold SAS' },
  { value: 'Capital', label: 'Bold Capital' },
  { value: 'Peru',    label: 'Bold Peru' },
]

export const COMPANIES_BY_COUNTRY: Record<string, { value: LedgerCompany; label: string }[]> = {
  colombia: [
    { value: 'CF',      label: 'Bold CF' },
    { value: 'SAS',     label: 'Bold SAS' },
    { value: 'Capital', label: 'Bold Capital' },
  ],
  peru: [
    { value: 'Peru', label: 'Bold Peru' },
  ],
}

export const CURRENCIES: { value: LedgerCurrency; label: string }[] = [
  { value: 'COP', label: 'COP — Peso Colombiano' },
  { value: 'USD', label: 'USD — Dólar Estadounidense' },
  { value: 'PEN', label: 'PEN — Sol Peruano' },
]
