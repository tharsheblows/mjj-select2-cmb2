jQuery( document ) .ready( function ( $ ) {

	// This is the ajax select2
	// To start with, the select is empty -- it doesn't have any options, we're going to ge those with ajax
	// but we need to know what's been previously saved, so let's get those and add them to the correct selects
	
	// Slight detour: I'm using the Wirecutter's posts here. It's a lovely WP site with lots of fun posts.
	// You could change this into searching your own posts! What fun that would be.
	var siteWithSearchTurnedOnThatsFastEnough = 'https://api.github.com/search/repositories';

	// When someone types in the field, it searches The Wirecutters posts and pops up the results
	// https://select2.org/data-sources/ajax
	// Let's make a config thing again, just like with the regular-select but with a few more bits
	var selectRepo = {
		ajax: {
			url: siteWithSearchTurnedOnThatsFastEnough,
			dataType: 'json',
			method: 'GET',
			delay: 250,     			// 250ms after someone stops typing to do the search
			data: function ( params ) {
				var queryParameters = {
					q: params.term, 	// search term
					page: params.page 	// which page              
				}
				return queryParameters;
			},
		processResults: function (data, params) {
			// This is taken directly from https://select2.org/data-sources/ajax
			// parse the results into the format expected by Select2
			// since we are using custom formatting functions we do not need to
			// alter the remote JSON data, except to indicate that infinite
			// scrolling can be used
			params.page = params.page || 1; // if no page, it's the first page
	
			return {
				results: data.items, // results are in the items
				pagination: {
					more: (params.page * 30) < data.total_count // this handles I think infinite scroll? I am not completely sure
				}
			};
		},
			cache: true // because Jonny Harris might be annoyed if I put false
		},
		placeholder: 'Start typing!',
		escapeMarkup: function (markup) { return markup; }, // let our custom formatter work
		minimumInputLength: 3, 								// you have to type at least 3 letters to get a result
		templateResult: formatRepo, 						// format the results
		templateSelection: formatRepoSelection 				// format the current selection
	};

	function formatRepo ( repo ) {
		if (repo.loading) {
			return repo.text;
		}
		
		// the styling on the does not hold up, it's just here to show. you don't need to add it inline obvs, I'm just a bit lazy atm.
		var markup = "<div style='overflow: hidden;'>" +
			"<div style='float: left; margin-right: 20px;'><img src='" + repo.owner.avatar_url + "' style='width: 100px;' /></div>" +
			"<div>" + repo.full_name + "</div>";
		
		if (repo.description) {
			markup += "<h4>" + repo.description + "</h4>";
		}
		
		markup += "<div class='select2-result-repository__statistics'>" +
			repo.forks_count + " Forks &bull; " +
			repo.stargazers_count + " Stars &bull; " +
			repo.watchers_count + " Watchers" +
			"</div>" +
			"</div>";
		
		return markup;
	}
	

	function formatRepoSelection ( repo ) {
		return repo.full_name || repo.text;
	}

	// ok we need to put it together 
	var ajaxSelects = $( '.ajax-select select' );   // get all the ajax selects we made
	ajaxSelects.select2( selectRepo );              // and make them select2s
	setSelectedOptions( ajaxSelects ); 				// then set the initial value

	// This sets the initial value -- it takes an array of selects
	function setSelectedOptions( selects ){
		$.each( selects, function( i, select ) {            // go through each of the selects
			var selectedRepo = $( select ).attr( 'data-selected' );     	// the repo id we saved is in the data-selected attribute
			if( selectedRepo ){     									
				$.get( 
					'https://api.github.com/repositories/' + selectedRepo, 
				)
				.done( function( data ) {
					// https://stackoverflow.com/questions/30316586/select2-4-0-0-initial-value-with-ajax
					// new Option is here https://select2.org/programmatic-control/add-select-clear-items
					var addRepoOption = new Option( data.full_name,  data.id, true, true ); // make the new Option
					$( select ).append( addRepoOption ).trigger( 'change' );				// append it to the select and trigger a change so it shows up
					$( select ).attr( 'data-selected-text', data.full_name );				// add this in to use when moving / adding things
				});
			}
		});
	} 

	// Ok up to here is fairly straightforward. Now we have to add in the ability to 1) add a field and 2) move fields
	// We know we're going to have to destroy the Select2 before we do either of those, so we need to put the id in the
	// data-selected attribute of the select so we can set the selected value again after we restore them.
	// In short, we need the https://select2.org/programmatic-control/events
	// Now. There might be a better way of doing this but this seems to work.
	
	// when something is selected via select2 do this
	$( '#mjj-select2-box' ).on( 'select2:select', '.ajax-select', function( e ){
		// then add the selected id and the name of the repo to the select so we can pick it up after we remake the select2
		$( this ).closest( '.cmb-td' ).find( 'select' ).attr( 'data-selected', e.params.data.id );
		$( this ).closest( '.cmb-td' ).find( 'select' ).attr( 'data-selected-text', e.params.data.full_name );
	}); 

	// next steps are same as for the regular select2
	// there are a few more comments in regular-select.js
	
	// 'cmb2_add_group_row_start' happens before the row gets clones 
	//  button is the button which was clicked to add a group row
	$( '#mjj-select2-box' ).on( 'cmb2_add_group_row_start', '.cmb-add-group-row', function( event, button ){

		// button is the button clicked to add a row. So let's find the row which is to be cloned.
		var clonedRow = $( button ).closest( '#mjj-select2-box' ).find( '.cmb-repeatable-grouping').last();

		// Now destroy the select2 on it
		clonedRow.find( '.ajax-select select' ).select2( 'destroy' );

	 // And that's all we can do at this point in time.
	});

	// Now we'll use 'cmb_add_row' to reset the select2 on the cloned select and set a select2 on the new one
	// newRow is the newly created row
   $( '#mjj-select2-box' ).on( 'cmb2_add_row', '.cmb-repeatable-group', function( event, newRow ){

	 	// add select2 to selects which don't have the select2-hidden-accessible class (using that to test for select2)
	 	$( '#mjj-select2-box .ajax-select select:not(".select2-hidden-accessible")' ).select2( selectRepo );

	 	// and take off the data-selected and data-selected-text attributes from the new Row
	 	$( newRow ).find( 'select' ).removeAttr( 'data-selected' ).removeAttr( 'data-selected-text' );

	});

	// It turns out that Select2 messes with the sortability of the groups too, so let's destroy it, then sort, then reinstate.
	// Thank you to https://github.com/mustardBees/cmb-field-select2/blob/master/js/script.js for alerting me to this.
	// in the functions below, button is the button clicked, fromEl is the element being moved and toEl is the elembent being replaced

	// Before a group row is shifted, destroy Select2 on both the row to be moved and the row it's replacing.
	// Also, the data-attributes on the selects don't seem to copy over, so let's switch those around ourselves
	// AND because of the whole "don't make too many external calls" thing, we'll use the attributes we stashed in the select function
	$( '#mjj-select2-box' ).on( 'cmb2_shift_rows_start', '.cmb-shift-rows', function ( event, button, fromEl, toEl ) {
		
		// Let's get all the attributes we need
		var fromElSelect = $( fromEl ).find( '.ajax-select select' );
		var fromElSelected = fromElSelect.attr( 'data-selected' );
		var fromElSelectedText = fromElSelect.attr( 'data-selected-text' );
		

		var toElSelect = $( toEl ).find( '.ajax-select select' );
		var toElSelected = toElSelect.attr( 'data-selected' );
		var toElSelectedText = toElSelect.attr( 'data-selected-text' );
		
		if( fromElSelected && fromElSelectedText ){
			// Then, if they're there, replace them with the row it's being switched with
			toElSelect.attr( 'data-selected', fromElSelected );
			toElSelect.attr( 'data-selected-text', fromElSelectedText );
		} else {
			// Otherwise, remove them
			toElSelect.removeAttr( 'data-selected' ).removeAttr( 'data-selected-text' );
		}

		// do this for both elements
		if( toElSelected && toElSelectedText ){
			fromElSelect.attr( 'data-selected', toElSelected );
			fromElSelect.attr( 'data-selected-text', toElSelectedText );
		}  else {
			fromElSelect.removeAttr( 'data-selected' ).removeAttr( 'data-selected-text' );
		}

		fromElSelect.select2( 'destroy' );
	 	toElSelect.select2( 'destroy' );
	});

	// After a group row is shifted, add back Select2 to the shifted rows. 
	$( '#mjj-select2-box' ).on( 'cmb2_shift_rows_complete', '.cmb-shift-rows', function ( event, button, fromEl, toEl ) {
		var toE = $( toEl ).find( '.ajax-select select' );
		var fromE = $( fromEl ).find( '.ajax-select select' );

		toE.select2( selectRepo );
	 	fromE.select2( selectRepo );

		// if we have data-selected-text, then let's just add the option in rather than bother Github for it (who's rate limited? me. oops.)
		if( fromE.attr( 'data-selected-text' ) && fromE.attr( 'data-selected' ) ){
			var addFromOption = new Option( fromE.attr( 'data-selected-text' ),  fromE.attr( 'data-selected' ), true, true ); // make the new Option
			fromE.append( addFromOption ).trigger( 'change' );
		}
		
		if( toE.attr( 'data-selected-text' ) && toE.attr( 'data-selected' ) ){
			var addFromOption = new Option( toE.attr( 'data-selected-text' ),  toE.attr( 'data-selected' ), true, true ); // make the new Option
			toE.append( addFromOption ).trigger( 'change' );
		}
	 	
	});
	
});