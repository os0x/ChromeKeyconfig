function get_key(evt){
	var key = evt.key === ' ' ? 'Space' : evt.key,
	ctrl = evt.ctrlKey ? 'C-' : '',
	meta = (evt.metaKey || evt.altKey) ? 'M-' : '',
	shift = evt.shiftKey ? 'S-' : '';
	if (/^(Meta|Shift|Control|Alt)$/.test(key)) return key;
	if (evt.shiftKey){
		if (/^[a-z]$/.test(key)) 
			return ctrl+meta+key.toUpperCase();
		if (/^(Enter|Space|BackSpace|Tab|Escape|Home|End|AllowLeft|AllowRight|AllowUp|AllowDown|PageUp|PageDown|Delete|F\d\d?)$/.test(key))
			return ctrl+meta+shift+key;
	}
	return ctrl+meta+key;
}
