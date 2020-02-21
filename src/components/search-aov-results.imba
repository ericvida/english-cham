# This fuzzy search can help Chico find his feather in a haystack.
# meet chico: http://chico.tirado.app
def fuzzyFeather feather, haystack
	let haystackLength = haystack.length
	let featherLength = feather.length
	if featherLength > haystackLength
		return false
	if featherLength is haystackLength
		return feather is haystack
	
	let featherLetter = 0
	while featherLetter < featherLength
		let haystackLetter = 0
		let match = false
		var featherLetterCode = feather.charCodeAt(featherLetter++)
		
		while haystackLetter < haystackLength
			if haystack.charCodeAt(haystackLetter++) is featherLetterCode
				break match = true
		continue if match
		return false
	return true

tag search-aov-results
	# Search aov results
	# in app-root
	def render
		<self>
			<ul>
				for object in @arr
					# object.keywords().toLowerCase().includes(@state.toLowerCase())
					if fuzzyFeather(@state, object.eng) or fuzzyFeather(@state, object.cham)
						<li.{@resultClasses}> 
							<div> object.eng
							<div> object.cham
