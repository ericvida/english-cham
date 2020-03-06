import {dict} from './dict.imba'
import search-aov from './components/search-aov'
import search-aov-results from './components/search-aov-results'
let search = ""
let keysofObject = ["eng","cham"]

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
						arr=dict bind:state=search keys=keysofObject>

### css scoped
app-root {
}
app-root ul {
	list-style-type: none;
	padding: 0 20px;
}
###
