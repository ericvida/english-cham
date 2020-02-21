def fuzzysearch needle haystack
	var tlen = haystack.length
	var qlen = needle.length
	if qlen > tlen
		return false
	if qlen is tlen
		return needle is haystack;
	outer: for var i = 0, j = 0; i < qlen; i++
		var nch = needle.charCodeAt(i);
		while j < tlen
		if (haystack.charCodeAt(j++) is nch)
			continue outer;
		return false;
	return true;

module.exports = fuzzy;
