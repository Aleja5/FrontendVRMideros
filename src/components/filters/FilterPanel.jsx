import React, { useState, useEffect } from "react";
import { Button, Input, Label } from "../ui";
import { Calendar } from "../ui/Calendar";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/Popover";
import { Card, CardContent } from "../ui/Card";
import { CalendarIcon, Search, X, Download, Filter } from "lucide-react";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { cn } from "../../utils/cn";
import { useFiltrosProduccion } from "./useFiltrosProduccion.jsx";
import { filterFields } from "./fields";

const FilterPanel = ({ onBuscar, onExportar, onOtiMapChange }) => {
  const [filters, setFilters] = useState({
    oti: "",
    operario: "",
    proceso: "",
    areaProduccion: "",
    maquina: "",
    fechaInicio: undefined,
    fechaFin: undefined,
  });

  const { oti, operarios, procesos, areasProduccion, maquinas, otiMap } = useFiltrosProduccion(filters.oti);

  // Notificar al componente padre cuando el otiMap cambie
  useEffect(() => {
    if (onOtiMapChange && otiMap) {
      onOtiMapChange(otiMap);
    }
  }, [otiMap, onOtiMapChange]);

  const handleApplyFilters = () => {
    onBuscar(filters);
  };

    const handleClearFilters = () => {
    setFilters({
      oti: "",
      operario: "",
      proceso: "",
      areaProduccion: "",
      maquina: "",
      fechaInicio: undefined,
      fechaFin: undefined,
    });
    onBuscar({});
  };

    const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Si se cambia la OTI, reiniciar el campo de operario
    if (name === 'oti') {
      setFilters((prev) => ({ 
        ...prev, 
        [name]: value,
        operario: "" // Limpiar operario cuando cambia la OTI
      }));
    } else {
      setFilters((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Check if any filters are active
  const hasActiveFilters = Object.values(filters).some(value => 
    value !== "" && value !== undefined && value !== null
  );

  return (
    <Card className="mb-4 border border-gray-200 shadow-sm">
      <CardContent className="p-4">
        {/* Header with title and action buttons */}
                        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <h3 className="text-m font-medium text-gray-700">Filtros de Búsqueda</h3>
            {hasActiveFilters && (
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                Activos
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="m"
              onClick={handleClearFilters}
              className="h-8 px-3 text-m"
              disabled={!hasActiveFilters}
            >
              <X className="h-3 w-3 mr-1" />
              Limpiar
            </Button>
            <Button
              size="m"
              onClick={handleApplyFilters}
              className="h-8 px-3 text-m bg-blue-500 hover:bg-blue-600"
            >
              <Search className="h-3 w-3 mr-1" />
              Buscar
            </Button>
            
          </div>
        </div>

        {/* Compact filter grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Select fields */}
          {filterFields({ oti, operarios, procesos, areasProduccion, maquinas })
            .sort((a, b) => a.order - b.order)
            .map(({ name, label, options, keyField, valueField }) => (
              <div key={name} className="space-y-1">
                <Label htmlFor={name} className="text-m font-medium text-gray-600">
                  {label}
                  {name === 'operario' && filters.oti && (
                    <span className="ml-1 text-xs text-blue-600 font-normal">
                      (filtrado por OTI)
                    </span>
                  )}
                </Label>
                <Input
                  as="select"
                  id={name}
                  name={name}
                  value={filters[name]}
                  onChange={handleChange}
                  className="h-8 text-xs"
                  disabled={name === 'operario' && filters.oti && options.length === 0}
                >
                  <option value="">
                    {name === 'operario' && filters.oti && options.length === 0 
                      ? "No hay operarios para esta OTI" 
                      : "Todos"
                    }
                  </option>
                  {options
                    .sort((a, b) => a[valueField].localeCompare(b[valueField]))
                    .map((item) => (
                      <option key={item[keyField]} value={item[keyField]}>
                        {item[valueField]}
                      </option>
                    ))}
                </Input>
              </div>
            ))}

          {/* Date fields */}
          {["fechaInicio", "fechaFin"].map((campo) => (
            <div key={campo} className="space-y-1">
              <Label className="text-m font-medium text-gray-600">
                {campo === "fechaInicio" ? "Desde" : "Hasta"}
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full h-8 justify-start text-left font-normal text-xs",
                      !filters[campo] && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-1 h-3 w-3" />
                    {filters[campo]
                      ? format(filters[campo], "dd/MM/yy", { locale: es })
                      : "Fecha"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white" align="start">
                  <Calendar
                    mode="single"
                    selected={filters[campo]}
                    onSelect={(date) =>
                      setFilters((prev) => ({ ...prev, [campo]: date }))
                    }
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default FilterPanel;
