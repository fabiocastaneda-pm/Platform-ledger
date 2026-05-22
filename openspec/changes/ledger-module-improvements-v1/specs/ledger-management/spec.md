## MODIFIED Requirements

### Requirement: Crear ledger
El sistema SHALL permitir crear un nuevo ledger con los campos: nombre (único), producto asociado, país (Colombia/Perú), frecuencia (Diario/Semanal/Quincenal/Mensual) y descripción opcional. Todos los campos excepto descripción son obligatorios.

#### Scenario: Crear ledger con país y frecuencia
- **WHEN** el usuario completa el formulario incluyendo país "Colombia" y frecuencia "Mensual"
- **THEN** el sistema crea el ledger con esos atributos y los refleja en el detalle

#### Scenario: Crear ledger sin seleccionar país
- **WHEN** el usuario intenta guardar sin seleccionar un país
- **THEN** el sistema muestra error de validación "El país es obligatorio"

#### Scenario: Crear ledger sin seleccionar frecuencia
- **WHEN** el usuario intenta guardar sin seleccionar una frecuencia
- **THEN** el sistema muestra error de validación "La frecuencia es obligatoria"

### Requirement: Listar ledgers con columna País
La tabla de ledgers SHALL mostrar la columna "País" con el nombre del país y su bandera emoji correspondiente (🇨🇴 Colombia, 🇵🇪 Perú). La columna SHALL soportar filtro por país.

#### Scenario: Visualizar columna País en tabla
- **WHEN** el usuario accede a la lista de ledgers
- **THEN** la tabla muestra la columna "País" con bandera emoji y nombre del país para cada ledger

#### Scenario: Filtrar ledgers por país
- **WHEN** el usuario selecciona "Colombia" en el filtro de país
- **THEN** la tabla muestra únicamente los ledgers con country = 'colombia'
