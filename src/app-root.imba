import {dict} from './dict.imba'
import fuzzysearch from 'fuzzysearch'
# import fuzzy from './fuzzy.imba'
let search = ""
tag app-root
	@containerWidth = "container max-w-screen-md mx-auto block"
	@query = ''
	def render
		<self>
			<header .{"text-center bg-blue-900 text-gray-100 text-white pt-4 pb-16 tracking-wide"}>
				<div .{@containerWidth}>
					<a href="https://github.com/iamtirado/english-cham" target="_blank"> "English - Cham Dictionary"
					<p .{"text-teal-400 uppercase text-xs font-bold tracking-widest"}> 
						"{dict.length} words"
			<main .{"result flex flex-col bg-gray-200 min-h-screen px-12 pb-12 shadow-md"}>
				<div 
					.{@containerWidth + "shadow-2xl py-8 px-8 rounded-lg bg-teal-500 -mt-12 mb-8 shadow-lg"}>
					<search-aov bind:state=search inputClasses="flex-1 rounded-md py-2 px-4 w-full shadow-inner">
				<div .{@containerWidth}.flex>
					<search-aov-results.w-full resultClasses="py-2 px-4 bg-white mb-2 shadow-sm rounded-md w-full flex justify-between" 
						arr=dict bind:state=search>
tag search-aov
	# Search aov (array > object > value)
	# in app-root
	@state = ''
	def render
		<self>
			<input[@state].{@inputClasses} placeholder="type something">

tag search-aov-results
	# Search aov results
	# in app-root
	def render
		<self>
			<ul>
				for object in @arr
					# object.keywords().toLowerCase().includes(@state.toLowerCase())
					if fuzzysearch(@state, object.eng) or fuzzysearch(@state, object.cham)
						<li.{@resultClasses}> 
							<div> object.eng
							<div> object.cham

### css scoped

app-root {
}
app-root ul {
	list-style-type: none;
	padding: 0 20px;
}

###

### css
# html,body {
#     width: 100%;
#     height: 100%;
#     margin: 0px;
#     font-family: Arial;
# }

# body {
#     display: block;
#     font-size: 14px;
#     align-items: stretch;
#     justify-content: center;
#     flex-direction: column;
#     background: whitesmoke;
#     padding: 30px;
# 	min-height: 80vh;
# }

# body,div,form,header,footer,section,input,button,nav,aside,article {
#     box-sizing: border-box;
# }

# div,section,input,ul,main,article,.grow {
#     flex: 1 1 auto;
# }

# input {
#     display: block;
#     padding: 0px 12px;
#     background: transparent;
#     border: none;
#     font-size: inherit;
#     width: 50px;
#     height: 24px;
# }

# header,footer {
#     flex: 0 0 auto;
#     display: flex;
#     flex-direction: row;
#     justify-content: flex-start;
#     align-items: center;
#     padding: 10px 6px;
#     background: #e8e8e8;
# }

###
