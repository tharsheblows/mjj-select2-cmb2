<?php

/**
 * This is going to make our custom select field. There might be another way to do this but I don't know it.
 * If you do, plesae tell me!
 */
class MJJ_Ajax_Select_Field{

	/**
	 * Static property to hold our singleton instance.
	 *
	 * @var $instance
	 */
	static $instance = false;

	/**
	 * If an instance exists, this returns it.  If not, it creates one and
	 * returns it.
	 *
	 * @return $instance
	 */
	public static function getInstance() {
		if ( ! self::$instance ) {
			self::$instance = new self;
		}
		return self::$instance;
	}

	private function __construct(){

		// make a select input we can use 
		add_action( 'cmb2_render_mjj_ajax_select2', array( $this, 'make_select_field'), 10, 5 );

		// but luckily we don't need to do a custom save or a custom get :)
	}

	/**
	 * This makes the custom select field. This field is going to be used for our ajax select where the options are
	 * filled out dynamically. The reason I needed a new field type was to have a place to stash the stored value on 
	 * selects that had already been save so I can retrieve them and use them when rendering as the "selected" option.
	 * I'm going to the actual "adding the selected option" bit in the js but will put the saved value in an attribute 
	 * in the select so I know which option was selected.
	 *
	 * @param array  $field              The passed in `CMB2_Field` object
	 * @param mixed  $escaped_value      The value of this field escaped.
	 *                                   It defaults to `sanitize_text_field`.
	 *                                   If you need the unescaped value, you can access it
	 *                                   via `$field->value()`
	 * @param int    $object_id          The ID of the current object
	 * @param string $object_type        The type of object you are working with.
	 *                                   Most commonly, `post` (this applies to all post-types),
	 *                                   but could also be `comment`, `user` or `options-page`.
	 * @param object $field_type_object  This `CMB2_Types` object
	 */
	public function make_select_field( $field, $escaped_value, $object_id, $object_type, $field_type_object ){

		error_log( print_r( $escaped_value, true ), 0 );
		$selected_value = ( !empty( $escaped_value ) ) ? $escaped_value : '';

		// We have the CMB2_Types object, might as well use it
		echo $field_type_object->select( array( 		// so we're going to make a select
			'name'  => $field->args['_name'],			// this gives us the name as an array item to be saved
			'description' => $field->args['description'],
			'id' => $field->args['id'],					// this is the straight up id
			'data-selected' => $selected_value, 		// and a data-selected attribute which is the value of ajax_select frrom the databasexs
			'style'			=> 'width: 750px'			// leave me alone
		) ); 
	}
}