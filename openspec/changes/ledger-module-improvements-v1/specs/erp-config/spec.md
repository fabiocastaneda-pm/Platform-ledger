## MODIFIED Requirements

### Requirement: Módulo ERP independiente con vista centralizada
El sistema SHALL exponer la configuración ERP como un módulo de navegación de primer nivel (ruta `/erp`) visible en el sidebar debajo de "Ledgers". SHALL mostrar una tabla con todos los ledgers, su país, frecuencia y estado de configuración ERP (Configurado / No configurado). El usuario SHALL poder acceder al formulario de configuración ERP de cada ledger desde esta vista.

#### Scenario: Acceder al módulo ERP desde sidebar
- **WHEN** el usuario hace clic en "ERP / Exportación" en el sidebar
- **THEN** el sistema navega a `/erp` y muestra la lista de todos los ledgers con su estado ERP

#### Scenario: Ver estado de configuración ERP por ledger
- **WHEN** el usuario visualiza la tabla del módulo ERP
- **THEN** cada fila muestra: nombre del ledger, país, frecuencia, formato ERP configurado y badge de estado (Configurado / No configurado)

#### Scenario: Configurar ERP desde módulo independiente
- **WHEN** el usuario hace clic en "Configurar" en una fila de la tabla ERP
- **THEN** el sistema muestra el formulario de configuración ERP para ese ledger

### Requirement: Remover tab ERP del detalle de ledger
El detalle de ledger SHALL mostrar únicamente dos tabs: "Información General" y "Configuración Contable". El tab "Exportación ERP" SHALL ser eliminado. Un enlace SHALL dirigir al usuario al módulo ERP independiente si necesita configurar la exportación.

#### Scenario: Detalle de ledger sin tab ERP
- **WHEN** el usuario navega al detalle de un ledger
- **THEN** solo aparecen los tabs "Información General" y "Configuración Contable", sin tab ERP
