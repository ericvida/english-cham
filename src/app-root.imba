import * as localForage from 'localforage'
import {data} from './data.imba'
import * as datajson from './data.json'
# import {Search} from './components/search'
# import Fuse from 'fuse.js'
# console.log Fuse

# console.log datajson.default
let dict  = datajson.default
const engOptions = {
	includeScore: true
	shouldSort:true
	findAllMatches: true
	includeMatches: true,
	minMatchCharLength: 1,
	location: 0,
	threshold: 0.2,
	distance: 100,
	ignoreLocation: true
}

# const eng = new Fuse(datajson.default, engOptions)
# console.log eng
# console.log datajson.default
# console.log localForage.default







export def fuzzy needle, haystack
	let haystackLength = haystack.length
	let needleLength = needle.length
	if needleLength > haystackLength
		return false
	if needleLength is haystackLength
		return needle is haystack
	let needleLetter = 0
	while needleLetter < needleLength
		let haystackLetter = 0
		let match = false
		var needleLetterCode = needle.charCodeAt(needleLetter++)
		while haystackLetter < haystackLength
			if haystack.charCodeAt(haystackLetter++) is needleLetterCode
				break match = true
		continue if match
		return false
	return true











# GLOBAL STYLES
global css @root
	*
		p:0
		m:0



# APPROOT
tag app-root
	def render
		<self>
			<Layout>



let query = ""
# LAYOUT
tag Layout
	langs = ["Cham","English","IPA"]
	lang = langs[0]
	current = 0
	css &
		bg: white
		ff:sans-serif
		header
			p:4
			bg:gray9
			c:white
			d:block
	def render
		<self>
			<header>
				<Search langs=langs lang=lang current=current>
			<main>
				<word-list lang=lang dict=data>



tag Search
	css &
		%search
			d:flex
		%lang
			bg:gray7 @hover:gray6 @active: gray7
			c:gray2
			flb:60px
			fs:.6em
			jc:center
			d:flex
			ai:center
			p:4
			btlr:2
			bblr:2
			us:none
			cursor:pointer
		%field
			p:2 
			radius:0
			btrr:2 
			bbrr:2 
			bd:0 
			bgc:gray5 @focus:white
			&::placeholder
				c:gray9 @ios: gray1
			fw:bold
			flg:1
			of:hidden
				
	def switchLang
		if current < 2
			current++
			lang = langs[current]
		else
			current = 0
			lang = langs[current]
		console.log lang
	prop gap = 1
	def render
		<self>
			<div%search>
				<div%lang @click.switchLang> lang.toUpperCase()
				<input%field bind=query placeholder="Search {lang} word">






# WORDLIST > LAYOUT
tag word-list
	# prop query is bound
	prop list = datajson.default
	css &
		fs:.8em
	def render
		<self>
			for item,k in list
				if fuzzy(query, item[0])
					<div> 
						<Word cham=item[0] ipa=item[1] note=item[2]>
							<translation-list trans=item[3]>
			
			# for word in list
			# 	<div> 
			# 		<Word cham=word[0] ipa=word[1] note=word[2]>
			# 			<translation-list trans=word[3]>



# WORD > WORDLIST
tag Word
	prop cham
	prop ipa
	prop note
	css %card
		bdb: 1px solid gray9
		w:100%
		p:4
	css %cham
		fw:bold
		d:flex
		jc:space-between
	css %ipa
		c:gray4
		b:red 1px solid 
		size: 10px
		d:block
		flg:1
		ta:right
	css %note
		pl:1
		flg:0
	def render
		<self>
			<%card>
				<span%cham> 
					<p> cham
					<p%ipa> "/{ipa}/"
					<span%note> note
				<slot>
				


# TRANSLATION-LIST > WORD-LIST/WORD
tag translation-list
	css ol
		ml:0
		c:gray5
	css %translation
		py:1
		ml:4
		bdb: 1px solid gray3
	css %meaning
		pb:2
	css %definition
		c:gray7
	css %use
		c:gray3
	css %info
		c:gray5
		ff:serif
		font-style:italic
	def render
		<self>
			<ol>
				for t in trans
					<li%translation> 
						<p%meaning[d:flex jc:space-between]> 
							<span%definition> t[0] # definition
							<span%use> t[2] # use
						<p%info> t[1] # use






















imba.mount <app-root>