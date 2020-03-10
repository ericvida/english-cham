
import {fuzzySearch} from './fuzzySearchV1'

tag search-aov-results
	# Search aov results
	# in app-root
	@key
	def render
		<self>
			<ul.list>
				for object in @arr
					# object.keywords().toLowerCase().includes(@state.toLowerCase())
					if object.cham is @state or object.eng is @state
						<li.{@resultClasses}.top>
							<div> object.eng
							<div> object.cham
					else 
						if fuzzySearch(@state, object.eng) 
							<li.{@resultClasses}> 
								for key in @keys
									<div> object[key]
						elif fuzzySearch(@state, object.cham)
							<li.{@resultClasses}> 
								for key in @keys
									<div> object[key]
### css scoped
ul {
	display: flex;
	flex-direction: column;
}
li.top {
	order: 1;
	padding-top: 20px;
	padding-bottom: 20px;
}
li {
	order: 2;
}
###
