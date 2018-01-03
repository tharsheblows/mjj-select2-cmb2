jQuery( document ) .ready( function ( $ ) {

	// This is a non-ajax select2 which builds on a normal selects and their options

	// We have a blank option in which to use a placeholder so let's use one! 
	var regSelectConfig = {
		placeholder: 'Choose a greeting'
	}

	// For the selects on the initial page load it's easy peasy, select2 for everrything! 
	$( '#mjj-select2-box .regular-select select' ).select2( regSelectConfig );

	// Ok now for repeating fields, it gets a little more difficult. It turns out that you can't clone a select2 
	// (thank you https://stackoverflow.com/questions/17175534/cloned-select2-is-not-responding for letting me know)
	// and that's what CMB2 does with repeating groups — it clones the last group. So what you need to do (as explained
	// in the link above) is destroy the cloned select2, clone and then re-apply select2 on the cloned and new selects.
	
	// Luckily we have hooks to do this! Whoo!
	// https://github.com/CMB2/CMB2/wiki/Javascript-API
	
	// 'cmb2_add_group_row_start' happens before the row gets clones 
	//  button is the button which was clicked to add a group row
	$( '#mjj-select2-box' ).on( 'cmb2_add_group_row_start', '.cmb-add-group-row', function( event, button ){

		console.log( 'lets destroy things' );

		// button is the button clicked to add a row. So let's find the row which is to be cloned.
		var clonedRow = $( button ).closest( '#mjj-select2-box' ).find( '.cmb-repeatable-grouping').last();

		// Now destroy the select2 on it
		clonedRow.find( '.regular-select select' ).select2( 'destroy' );

		// And that's all we can do at this point in time.
	});

	// Now we'll use 'cmb_add_row' to reset the select2 on the cloned select and set a select2 on the new one
	// newRow is the newly created row
   $( '#mjj-select2-box' ).on('cmb2_add_row', '.cmb-repeatable-group', function( event, newRow ){

		// add select2 to selects which don't have the select2-hidden-accessible class (using that to test for select2)
		$( '#mjj-select2-box .regular-select select:not(".select2-hidden-accessible")' ).select2( regSelectConfig );

	});

	// It turns out that Select2 messes with the sortability of the groups too, so let's destroy it, then sort, then reinstate.
	// Thank you to https://github.com/mustardBees/cmb-field-select2/blob/master/js/script.js for alerting me to this.
	// in the functions below, button is the button clicked, fromEl is the element being moved and toEl is the elembent being replaced

	// Before a group row is shifted, destroy Select2 on both the row to be moved and the row it's replacing.
	$( '#mjj-select2-box' ).on( 'cmb2_shift_rows_start', '.cmb-shift-rows', function ( event, button, fromEl, toEl ) {
		$( fromEl ).find( '.regular-select select' ).select2( 'destroy' );
		$( toEl ).find( '.regular-select select' ).select2( 'destroy' );
	});

	// After a group row is shifted, add back Select2 to the shifted rows. 
	$( '#mjj-select2-box' ).on( 'cmb2_shift_rows_complete', '.cmb-shift-rows', function ( event, button, fromEl, toEl ) {
		$( fromEl ).find( '.regular-select select' ).select2( regSelectConfig );
		$( toEl ).find( '.regular-select select' ).select2( regSelectConfig );
	});
	
});