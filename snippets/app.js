// app.js
const express = require('express');
const fs = require('fs');
const path = require("path");
const app = express(); 
const detectNewline = require('detect-newline');
const snippetObj = require('./snippet');

let initialData = [];
const initialDataObj = {};



const publicPath = path.join(__dirname, "public");
app.use(express.static(publicPath));

app.use(express.urlencoded({extended: false}));
app.use((req, res, next) => { 
	console.log(req.method, req.path, req.query);
	next(); 
});

app.set('view engine', 'hbs');

initialDataObj.snippets = initialData;

/**
 * Creates code snippet object
 * @param  {File} fileName The files to be read 
 * @param  {String} data The contents of the code snippet
 * @return {Object} The resulting code snippet object
 */
function createSnippet(fileName, data, ){ 
	const newLineChar = detectNewline(data);

	//extracting the comment
	data = data.replace("//", "");
	const splitData = data.split(newLineChar);
	const splitComment = splitData[0].split(',');
	const splitCommentTrim = splitComment.map(tag => tag.trim());

	const snippetCode = splitData.slice(1).join(newLineChar);
	
	const snippet = new snippetObj.Snippet(fileName, snippetCode, ...splitCommentTrim); 
	return snippet;
	
}

/**
 * Recursively adds code snippets to initialData array
 * @param  {String} filePath The filepath to be read
 * @param  {File} data The contents of the file 
 */
function readSnippetRecursion(filePath, files, fileArrayIndex, cb){
	if(fileArrayIndex === files.length){
		cb();
		return;
	}
	fs.readFile(path.join(filePath, files[fileArrayIndex]), 'utf8', (err, data) => { 
		if(err) { 
			console.log(err);
		} else { 
			initialData.push(createSnippet(files[fileArrayIndex], data));
			readSnippetRecursion(filePath, files, fileArrayIndex + 1, cb);
			
		}
	});
}

/**
 * Callback for recursively reading file names in directory
 * @param  {String} path The filepath to be read
 * @param  {Number} fileArrayIndex The starting index of file
 * @callback cb a callback to run
 */
function readingSnippets(path, fileArrayIndex, cb){ 
	fs.readdir(path, (err, files) => { 
		if(err) {
			console.log(err);
		} else { 
			//console.log(files);
			readSnippetRecursion(path, files, fileArrayIndex, cb);
			
		}
	});
}

/**
 * HTTP GET request that matches and renders snippets based on search criteria
 * @param  {String} route The route to the homepage
 * @param  {Object} req The request object 
 * @param  {Object} res The response object
 */
app.get('/', (req,res) => { 
	let filteredData = initialData;
	if(req.query.lineQ && req.query.lineQ !== ''){
		const minLines = parseInt(req.query.lineQ);
		filteredData = filteredData.filter(snippetObj => snippetObj.lines >= minLines);
	}
	if(req.query.tagQ && !req.query.tagQ.includes(" ") && req.query.tagQ !== ''){
		filteredData = filteredData.filter(snippetObj => snippetObj.tags.includes(req.query.tagQ));
	}
	if(req.query.textQ && req.query.textQ !== ''){
		filteredData = filteredData.filter(snippetObj => snippetObj.code.includes(req.query.textQ));
	}

	res.render('home', {snippets: filteredData});
});

/**
 * HTTP GET Request that renders page that adds code snippet
 * @param  {String} route The route to page that adds code snippet
 * @param  {Object} req The request object 
 * @param  {Object} res The response object
 */
app.get('/add', (req, res) => {
	res.render('addsnippet'); 
});

/**
 * HTTP POST Request that updates code snippet
 * @param  {String} route The route to page that adds code snippet
 * @param  {Object} req The request object 
 * @param  {Object} res The response object
 */
app.post('/add', (req,res) => {
	if(req.body.name !== '' && req.body.code !== '' && req.body.tags !== ''){
		const constructData = "//" + req.body.tags + '\n' + req.body.code + '\n';
		const snippet = createSnippet(req.body.name, constructData);
		initialData.push(snippet);
		const originalFirstSnip = initialData[0];
		initialData[0] = initialData[initialData.length - 1];
		initialData[initialData.length - 1] = originalFirstSnip;
		res.redirect('/');

	} else{
		res.render('home', {snippets: initialData});
	}
});



const codePath = path.join(__dirname, "code-samples");
readingSnippets(codePath, 0, () => {
	app.listen(3000);
	initialDataObj.snippets = initialData;
	console.log('server started 3000');
});


console.log("Server started; type CTRL+C to shut down ");



