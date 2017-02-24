/*! MergeColumns for DataTables v1.0.1
 * 2015 Alexey Shildyakov ashl1future@gmail.com
 */

/**
 * @summary     MergeColumns
 * @description Group rows by specified columns
 * @version     1.0.1
 * @file        dataTables.mergeColumns.js
 * @author      Alexey Shildyakov (ashl1future@gmail.com)
 * @contact     ashl1future@gmail.com
 * @copyright   Alexey Shildyakov
 *
 * License      MIT - http://datatables.net/license/mit
 *
 * This feature plug-in for DataTables automatically merges columns cells
 * based on it's values equality. It supports multi-column row grouping
 * in according to the requested order with dependency from each previous
 * requested columns. Now it supports ordering and searching.
 * Please see the example.html for details.
 *
 * Rows grouping in DataTables can be enabled by using any one of the following
 * options:
 *
 * * Setting the `mergeColumns` parameter in the DataTables initialisation
 *   to array which containes columns selectors
 *   (https://datatables.net/reference/type/column-selector) used for grouping. i.e.
 *    mergeColumns = [1, 'columnName:name', ]
 * * Setting the `mergeColumns` parameter in the DataTables defaults
 *   (thus causing all tables to have this feature) - i.e.
 *   `$.fn.dataTable.defaults.MergeColumns = [0]`.
 * * Creating a new instance: `new $.fn.dataTable.MergeColumns( table, columnsForGrouping );`
 *   where `table` is a DataTable's API instance and `columnsForGrouping` is the array
 *   described above.
 *
 * For more detailed information please see:
 *
 */

(function($){

ShowedDataSelectorModifier = {
	order: 'current',
	page: 'current',
	search: 'applied',
}

GroupedColumnsOrderDir = 'asc';

var pageChanged=false;


/*
 * columnsForGrouping: array of DTAPI:cell-selector for columns for which rows grouping is applied
 */
var MergeColumns = function ( dt, columnsForGrouping )
{
	this.table = dt.table();
	this.columnsForGrouping = columnsForGrouping;
	 // set to True when new reorder is applied by MergeColumns to prevent order() looping
	this.orderOverrideNow = false;
	this.mergeCellsNeeded = false; // merge after init
	this.order = []

	var self = this;

	dt.on('preDraw.dt', function ( e, settings) {
		if (self.mergeCellsNeeded) {
			self.mergeCellsNeeded = false;
			self._mergeCells();
		}
	});
  dt.on('page.dt', function ( e, settings) {
		if (self.mergeCellsNeeded) {
			self.mergeCellsNeeded = false;
			self._mergeCells();
		}
	})

	dt.on('draw.dt', function ( e, settings) {
		self.mergeCellsNeeded = true;

	})


	this._redraw();

/* Events sequence while Add row (also through Editor)
 * addRow() function
 *   draw() function
 *     preDraw() event
 *       mergeCells() - point 1
 *     Appended new row breaks visible elements because the mergeCells() on previous step doesn't apllied to already processing data
 *   order() event
 *     _updateOrderAndDraw()
 *       preDraw() event
 *         mergeCells()
 *       Appended new row now has properly visibility as on current level it has already applied changes from first mergeCells() call (point 1)
 *   draw() event
 */
};


MergeColumns.prototype = {


	_mergeCells: function()
	{
		var columnsIndexes = this.table.columns(this.columnsForGrouping, ShowedDataSelectorModifier).indexes().toArray()
		var showedRowsCount = this.table.rows(ShowedDataSelectorModifier)[0].length
		this._mergeColumn(0, showedRowsCount - 1, columnsIndexes);
	},

	// the index is relative to the showed data
	//    (selector-modifier = {order: 'current', page: 'current', search: 'applied'}) index
	_mergeColumn: function(iStartRow, iFinishRow, columnsIndexes)
	{
		var columnsIndexesCopy = columnsIndexes.slice()
		currentColumn = columnsIndexesCopy.shift()
		currentColumn = this.table.column(currentColumn, ShowedDataSelectorModifier)

		var columnNodes = currentColumn.nodes()
		var columnValues = currentColumn.data()

		var newSequenceRow = iStartRow,
			iRow;
		for (iRow = iStartRow + 1; iRow <= iFinishRow; ++iRow) {

			 if(columnNodes[iRow].innerHTML!==null && columnNodes[newSequenceRow].innerHTML!==null && columnNodes[iRow].innerHTML == columnNodes[newSequenceRow].innerHTML){
				 $(columnNodes[iRow]).hide()
			 }

			 else if (columnValues[iRow] === columnValues[newSequenceRow]) {
				$(columnNodes[iRow]).hide()
			} else {
				$(columnNodes[newSequenceRow]).show()
				$(columnNodes[newSequenceRow]).attr('rowspan', (iRow-1) - newSequenceRow + 1)

				if (columnsIndexesCopy.length > 0)
					this._mergeColumn(newSequenceRow, (iRow-1), columnsIndexesCopy)

				newSequenceRow = iRow;
			}

		}
		$(columnNodes[newSequenceRow]).show()
		$(columnNodes[newSequenceRow]).attr('rowspan', (iRow-1)- newSequenceRow + 1)
		if (columnsIndexesCopy.length > 0)
			this._mergeColumn(newSequenceRow, (iRow-1), columnsIndexesCopy)
	},



	_redraw: function()
	{
    this.mergeCellsNeeded = true;
		this.table.draw();
	},
};


$.fn.dataTable.MergeColumns = MergeColumns;
$.fn.DataTable.MergeColumns = MergeColumns;

$(document).on( 'page.dt', function ( e, settings ) {
	pageChanged=true;
});



// Automatic initialisation listener
$(document).on( 'init.dt', function ( e, settings ) {
//	alert("calling page init");

	if ( e.namespace !== 'dt' ) {
		return;
	}

	var api = new $.fn.dataTable.Api( settings );

	if ( settings.oInit.mergeColumns ||
		 $.fn.dataTable.defaults.mergeColumns )
	{
		options = settings.oInit.mergeColumns?
			settings.oInit.mergeColumns:
			$.fn.dataTable.defaults.mergeColumns;
		new MergeColumns( api, options );

	}
	pageChanged=false;


} );



}(jQuery));
