export def fuzzySearch feather, haystack
	return false if feather.length > haystack.length	
	return feather is haystack if feather.length == haystack.length 
	for featherLetter in feather
		let match = for haystackLetter in haystack when haystackLetter is featherLetter 
			break true
		continue if match.length
		return false
	true
