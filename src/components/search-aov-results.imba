import {fuzzyFeather} from './fuzzySearch'

tag search-aov-results
	# Search aov results
	# in app-root
	@key
	def render
		<self>
			<ul>
				for object in @arr
					# object.keywords().toLowerCase().includes(@state.toLowerCase())
					if fuzzyFeather(@state, object.eng) or fuzzyFeather(@state, object.cham)
						<li.{@resultClasses}> 
							for key in @keys
								<div> object[key]
