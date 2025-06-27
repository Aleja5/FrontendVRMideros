

export const filterFields = ({ oti, operarios, procesos, areasProduccion, maquinas }) => [
  {
    name: "oti",
    label: "OTI",
    options: oti,
    keyField: "_id",
    valueField: "numeroOti",
    order: 1,
  },
  {
    name: "operario",
    label: "Operario",
    options: operarios,
    keyField: "_id",
    valueField: "name",
    order: 2,
  },
  {
    name: "proceso",
    label: "Proceso",
    options: procesos,
    keyField: "_id",
    valueField: "nombre",
    order: 3,
  },
  {
    name: "areaProduccion",
    label: "Área Producción",
    options: areasProduccion,
    keyField: "_id",
    valueField: "nombre",
    order: 4,
  },
  {
    name: "maquina",
    label: "Máquina",
    options: maquinas,
    keyField: "_id",
    valueField: "nombre",
    order: 5,
  },
];
