import {dict} from './dict.js'
tag app-root
	@containerWidth = "container max-w-screen-md mx-auto block"
	@query = ''
	def render
		<self>
			<header .{"text-center bg-blue-900 text-gray-100 text-white pt-4 pb-16 tracking-wide"}>
				<div .{@containerWidth}>
					"English - Cham Dictionary "
					<p .{"text-teal-400 uppercase text-xs font-bold tracking-widest"}> 
						"{dict.length} words"
			<main .{"result flex flex-col bg-gray-200 min-h-screen px-12 pb-12 shadow-md"}>
				<div 
					.{@containerWidth + "shadow-2xl py-8 px-8 rounded-lg bg-teal-500 -mt-12 mb-8 shadow-lg"}>
					<input[@query] placeholder="search" 
						.{"flex-1 rounded-md py-2 px-4 w-full shadow-inner"}>
				<div .{@containerWidth}.flex>
					<search-results .w-full search=@query>
tag search-results
	@match = true
	def render
		<self>
			<div>
				for word in dict
					if word.eng[0].toLowerCase().includes(#context.query.toLowerCase())
						@match = true
					elif word.eng[1] and word.eng[1].toLowerCase().includes(#context.query)
						@match = true
					elif word.cham[0].toLowerCase().includes(#context.query)
						@match = true
					else
						@match = false

					if @match is false
						<result-word.hidden english=word.eng cham=word.cham>
					else
						<result-word.visible english=word.eng cham=word.cham>
tag result-word
	def render
		<self .{"py-2 px-4 bg-white mb-2 shadow-sm rounded-md w-full flex justify-between"}> 
			<div .{""}>
				for e, k in @english
					if k is 0 
						<span> "{e}"
					else
						<span> ", {e}"
			<div .{""}>
				for c, k in @cham
					if k is 0
						<b> "{c}"
					else
						<b> ", {c}"

### css scoped

# app-root {
# }
# app-root ul {
# 	list-style-type: none;
# 	margin: 0;
# 	padding: 0 20px;
# }
# .dictCount {
# 	width: 100%;
# 	text-align: center;
# 	padding: 5px;
# }
# .wordtotal {
# 	text-align: center;
# 	padding: 10px;
# }
# .vbox {
# 	background-color: white;
# }
# .results > li {
# 	padding: 10px;
# 	padding-left: 10px;
# 	border-bottom: 1px solid whitesmoke;

# }
# .result ol {
# 	list-style-type: upper-roman
# }
# .result-word {
# }
# .partOfSpeech {
# 	color: #ccc;
# 	font-weight: light
# 	margin-bottom: 10px;
# 	font-size: .9rem;	
# }
# .result ol li{
# 	margin-bottom: 10px;
# }
.word > * {
	display:none;
}
.show {
	display: inline-block;
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
