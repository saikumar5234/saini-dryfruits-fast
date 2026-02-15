import React, { memo, useMemo } from 'react';
import { MaterialReactTable } from 'material-react-table';
import { useEditContext } from '../contexts/EditContext';
import { BottomToolbar } from './ActionButtons';
import { customGlobalFilterFn } from '../hooks/useTableView';

const ProductTable = memo(({ 
  columns, 
  tableData, 
  i18nLanguage,
  globalFilter,
  setGlobalFilter,
  onSave,
  onCancelEdit,
  onRowOrderChange,
}) => {
  const { editMode, rowSelection, setRowSelection } = useEditContext();

  return (
    <MaterialReactTable
      key={i18nLanguage}
      columns={columns}
      data={tableData}
      enablePagination={false}
      enableRowSelection={editMode}
      enableGlobalFilter={true}
      manualFiltering={false}
      enableColumnFilters={false}
      enableRowVirtualization={true}
      enableColumnVirtualization={false}
      getRowId={(row) => row.id.toString()}
      onRowSelectionChange={setRowSelection}
      enableRowOrdering={!!onRowOrderChange}
      enableSorting={false}
      muiRowDragHandleProps={onRowOrderChange ? ({ table }) => ({
        onDragEnd: () => {
          const { draggingRow, hoveredRow } = table.getState();
          if (hoveredRow != null && draggingRow != null) {
            onRowOrderChange(draggingRow.index, hoveredRow.index);
          }
        },
      }) : undefined}
      filterFns={{
        customGlobalFilter: customGlobalFilterFn,
      }}
      globalFilterFn="customGlobalFilter"
      state={{
        rowSelection,
        globalFilter,
      }}
      onGlobalFilterChange={setGlobalFilter}
      initialState={{
        density: 'compact',
      }}
      muiTableBodyRowProps={({ row }) => {
        const disabled = row?.original?.isDisabled;
        return {
          sx: {
            '&:nth-of-type(odd)': {
              backgroundColor: disabled ? 'action.disabledBackground' : 'background.default',
            },
            '&:nth-of-type(even)': {
              backgroundColor: disabled ? 'action.disabledBackground' : 'background.paper',
            },
            '&:hover': {
              backgroundColor: disabled ? 'action.disabledBackground' : 'rgba(46,125,50,0.08)',
              transition: 'background 0.2s',
            },
            opacity: disabled ? 0.6 : 1,
          },
        };
      }}
      muiTableHeadCellProps={{
        sx: {
          backgroundColor: 'primary.main',
          color: 'primary.contrastText',
          fontWeight: 700,
          position: 'sticky',
          top: 0,
          zIndex: 1,
          '& .MuiSvgIcon-root': {
            color: '#111 !important',
          },
          '& .MuiButtonBase-root': {
            color: '#111 !important',
          },
          '& .MuiTableSortLabel-root .MuiSvgIcon-root': {
            color: '#111 !important',
          },
          '& .Mui-active .MuiSvgIcon-root': {
            color: '#111 !important',
          },
        },
      }}
      muiTableContainerProps={{
        sx: { maxHeight: 'calc(100vh - 250px)' }
      }}
      renderBottomToolbar={() => (
        <BottomToolbar
          editMode={editMode}
          editField={editMode ? 'both' : null}
          saving={false}
          onSave={onSave}
          onCancelEdit={onCancelEdit}
        />
      )}
    />
  );
}, (prevProps, nextProps) => {
  return (
    prevProps.tableData === nextProps.tableData &&
    prevProps.columns === nextProps.columns &&
    prevProps.i18nLanguage === nextProps.i18nLanguage &&
    prevProps.globalFilter === nextProps.globalFilter &&
    prevProps.onRowOrderChange === nextProps.onRowOrderChange
  );
});

ProductTable.displayName = 'ProductTable';

export default ProductTable;
