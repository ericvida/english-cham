tag search-aov
	# Search aov (array > object > value)
	# in app-root
	@state = ''
	def render
		<self>
			<input[@state].{@inputClasses} placeholder="type something">
