<?php
/**
 * Plugin Name:     MJJ Select2 CMB2
 * Plugin URI:      https://github.com/thasheblows/mjj-select2-cmb2
 * Description:     Example of using Select2 with CMB2 repeating group fields
 * Author:          JJ Jay
 * Author URI:      https://tharshetests.wordpress.com
 * Version:         0.1.0
 *
 * @package         Mjj_Select2_Cmb2
 */


/**
 * Call our class.
 */
class MJJ_Select2_CMB2 {

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

		/**
		 * The class is instantiated on cmb2_admin_init so that's where we are right now
		 */
		private function __construct(){

			$this->add_metaboxes(); // this gets added on cmb2_admin_init

			// add in the scripts
			add_action( 'admin_enqueue_scripts', array( $this, 'add_scripts' ) );
		}

		/**
		 * This adds in the scripts. It's a laundry list of scripts rather than
		 * one concatenated and minified script. Why? you ask. Why indeed. I didn't want
		 * to use a task runner or module builder or whatever because I can find them distracting
		 * in tutorials, especially if I don't quite understand their way. You might do this sort of thing
		 * differently than I do and I'm not going to make you try to figure out how I do it.
		 * You can clone this, install it and edit the js files and BOOM! that's it, no need to run anything. 
		 *   
		 * In a real project, I trust you to make good decisions about how to do all this prroperly. :)
		 */
		public function add_scripts(){

			// we need select2 for this. We're not going to make everyone use our select2 everywhwere, let's just load it on posts.
			if( get_current_screen()->id === 'post' ){
				wp_register_script( 'select2', plugin_dir_url( __FILE__ ) . 'assets/vendor/select2.min.js' );
				wp_enqueue_style( 'select2',  plugin_dir_url( __FILE__ ) . 'assets/vendor/select2.min.css' );
	
				wp_enqueue_script( 'mjj-regular-select', plugin_dir_url( __FILE__ ) . 'assets/js/regular-select.js', array( 'jquery', 'select2' ), filemtime(  plugin_dir_path( __FILE__ ) . 'assets/js/regular-select.js' ), true );
				wp_enqueue_script( 'mjj-ajax-select', plugin_dir_url( __FILE__ ) . 'assets/js/ajax-select.js', array( 'jquery', 'select2' ), filemtime(  plugin_dir_path( __FILE__ ) . 'assets/js/ajax-select.js' ), true );
			}
		}

		/**
		 * This does what it says on the tin. (It adds the metaboxes.)
		 */
		private function add_metaboxes(){
			// the whote point of this is to show how Select2 works with repeatable group fields so let's make us a metabox!
			
			/**
			 * Initiate the metabox
			 */
			$metabox = new_cmb2_box( array(
				'id'            => 'mjj-select2-box',   // This will be the id of the div which holds the repeatble group. 
														// It'll be used later to keep an eye out for an added group.
				'title'         => __( 'MJJ S2 Metabox', 'mjj-s2-cmb2' ),
				'object_types'  => array( 'post' ),     // Post type
				'context'       => 'normal',
				'priority'      => 'high',
				'show_names'    => true,                // Show field names on the left
			) );

			/**
			 * Add a repeatable group
			 */
			$select_group = $metabox->add_field( array(
				'id'          => '_mjj-select2',
				'type'        => 'group',
				'description' => __( 'The repeatable groups are the entries below.', 'mjj-s2-cmb2' ),
				'repeatable'  => true,      // I think the default is true so this is just here to make it explicit
				'options'     => array(
					'group_title'   => __( 'Entry {#}', 'mjj-s2-cmb2' ),
					'add_button'    => __( 'Add Another Entry', 'mjj-s2-cmb2' ),
					'remove_button' => __( 'Remove Entry', 'mjj-s2-cmb2'
					 ),
					'sortable'      => true, 
				),
			) );

			/**
			 * Now we'll add our select fields to the group
			 * First up: regular-select -- this one is going set up a select the usual way
			 */
			$metabox->add_group_field( $select_group, array(
				'name'          => __( 'Regular select', 'mjj-s2-cmb2' ),
				'description'   => __( 'Select one.', 'mjj-s2-cmb2' ),
				'row_classes'   => 'regular-select',    // Add in a class to the select, we'll use this to add the select2
				'id'            => 'regular_select',
				'type'          => 'select',
				'options'       => array(
					''          => '',                  // This is an empty option which is needed to have a placeholder            
					'hello'     => __( 'Hello', 'mjj-s2-cmb2' ),
					'hi'        => __( 'Hiya', 'mjj-s2-cmb2' ),
					'alien'     => __( 'Take me to your leader', 'mjj-s2-cmb2' ),
					'yikes'     => __( 'Yikes', 'mjj-s2-cmb2' )
				),
			) );

			/**
			 * Next up: ajax-select -- this one is going to dynamically add options using ajax
			 */
			$metabox->add_group_field( $select_group, array(
				'name'          => __( 'Ajax select', 'mjj-s2-cmb2' ),
				'description'   => __( 'Start typing to search Github repos (need at least 3 letters)', 'mjj-s2-cmb2' ),
				'row_classes'   => 'ajax-select',
				'id'            => 'ajax_select',
				'type'          => 'mjj_ajax_select2',  
				'options'       => array(				// I'm adding in a blank option to make the add new row work so that it doesn't default to the first option
					''          => ''
				)
			) );
		}
}

// let's only use this class if cmb2_admin_init fires
add_action( 'cmb2_admin_init', 'instantiate_mjj_select2_cmb' );
function instantiate_mjj_select2_cmb(){
	
	include_once( 'field-types/class-mjj-select-field.php' );
	MJJ_Ajax_Select_Field::getInstance();

	MJJ_Select2_CMB2::getInstance();
}
