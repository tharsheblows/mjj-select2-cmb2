This is a plugin developed so I could figure out how Select2 worked with CMB2 repeatable groups. The repeatable group in this example contains a "regular select" which is a bog standard select to which Select2 has been applied and an "ajax select" which builds its options from user entered data. 

I can think of a few ways to do all this, so this way might not be the best way for your project or the way that's right for you.

### Select2 in a repeatable group ###
The key here is that the Select2 instances need to be destroyed before being cloned or sorted then initialised again. This is easier in the regular select. In the ajax select, it seems like it's necessary to do some switching of the select attributes manually as well as destroy and reinitialised Select2.

#### Regular select ####
You can see the js for the regular select in [assets/js/regular-select.js](https://github.com/tharsheblows/mjj-select2-cmb2/assets/js/regular-select.js) and I recommend looking at that one first to understand what you need to do to properly add and move fields. 

#### Ajax select ###
The ajax select picks up data from Github's api – it searches the repos as you're typing (not immediately as you're typing but it's pretty quick). The js for this is in [assets/js/ajax-select.js](https://github.com/tharsheblows/mjj-select2-cmb2/assets/js/ajax-select.js) – it's an extension of [Select2's own example here](https://select2.org/data-sources/ajax).

### Metaboxes ###
This plugin used CMB2 which is **not** included here, I'm assuming you have it which is why you want to know how Select2 works with it. However Select2 **is** included.

The ajax select as I've done it requires a custom field type which is in [field-types/class-mjj-select-field.php](https://github.com/tharsheblows/mjj-select2-cmb2/field-types/class-mjj-select-field.php)

### Other things ###
I haven't made it necessary to build this plugin. I think it would add an unnecessary layer of complexity to something that's meant to be a clear example of how it all works. Everything should be there to run it and if you edit the js files, the edits will show up, no need to do anything else.
