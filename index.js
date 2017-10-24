var _ = require('underscore');

//2-D array representing the star
var _star = [];

//the set of possible words
var _wordSet;

//array of indices that represents where the letters go
var _valueIndices = {
	0 : [3],
	1 : [2, 3],
	2 : [0, 1, 2, 3, 4, 5, 6],
	3 : [0, 1, 4, 5],
	4 : [1, 5],
	5 : [0, 1, 4, 5],
	6 : [0, 1, 2, 3, 4, 5, 6],
	7 : [2, 3],
	8 : [3]
};

/*
* fill the star array wih underscores where words should be and blank spaces
* where there are no words. used for initializing and visualizing star. if printed 
* before solving would print blank star
*/
for (let ii = 0; ii < 9; ii++) {
	let row = [];

	for (let jj = 0; jj < 7; jj++) {
		if (_valueIndices[ii].indexOf(jj) === -1) {
			row.push(' ');
		} else {
			row.push('_');
		}
	}

	_star.push(row);
}

//prints the 2-D array to the console
function printStar() {
	_.each(_star, (row, ii) => {

		let rowString = '';

		if (ii%2 === 1) {
			rowString += ' ';
		}

		_.each(row, (letter, jj) => {
			rowString += letter + ' ';
		});

		console.log(rowString);
	});
}

/**
* Inserts a letter into the star at a specified location
*
* row       {Number} indexed 0-8
* position  {Number} indexed by number of letters in row, eg row 0 has 0, 
*                    row 1 has 0 and 1
* letter    {String} the letter to insert
*/
function insertLetter(row, position, letter) {
	_star[row][_valueIndices[row][position]] = letter;
}

/**
* Fills each position in the star with a single letter. Used for debugging printing
* the star
*
* letter {String} the letter to fill the star with
*/
function fillLetter(letter) {
	_.each(_valueIndices, (val, key) => {
		_.each(val, valueIndex => {
			_star[key][valueIndex] = letter;
		});
	});
}

/**
* Test to see if a given combination is valid. Examines intersections of words to make
* sure they have the same letter. Broken into multiple if statements for debugging
* 
* combo {String}[] The list of words we're testing in order
*/
//combo is an array of 6 words in the order they go in the star
function isValid(combo) {
	if (combo[0][0] !== combo[4][6]) {
		// console.log('fail 1');
		return false;
	} else if (combo[1][0] !== combo[2][0]) {
		// console.log('fail 2');
		return false;
	} else if (combo[2][2] !== combo[4][4]) {
		// console.log('fail 3');
		return false;
	} else if (combo[2][4] !== combo[0][2]) {
		// console.log('fail 4');
		return false;
	} else if (combo[2][6] !== combo[5][6]) {
		// console.log('fail 5');
		return false;
	} else if (combo[1][2] !== combo[4][2]) {
		// console.log('fail 6');
		return false;
	} else if (combo[5][4] !== combo[0][4]) {
		// console.log('fail 7');
		return false;
	} else if (combo[3][0] !== combo[4][0]) {
		// console.log('fail 8');
		return false;
	} else if (combo[3][2] !== combo[1][4]) {
		// console.log('fail 9');
		return false;
	} else if (combo[3][4] !== combo[5][2]) {
		// console.log('fail 10');
		return false;
	} else if (combo[3][6] !== combo[0][6]) {
		// console.log('fail 11');
		return false;
	} else if (combo[5][0] !== combo[1][6]) {
		// console.log('fail 12');
		return false;
	} else {
		return true;
	}

}

/**
* Narrow down the list of possibilities at each position by checking for existance of
* other words whose letters would fit
*
* return {String}[] 2-D array of possible words at each position
*/
function getPossibilities() {
	let possible = [];

	for (let ii = 0; ii < 6; ii++) {
		possible.push([]);
	}

	_.each(_wordSet, (word1, index) => {

		//whether this word could be at these positions
		let match1 = false;
		let match2 = false;
		let match3 = false;
		let match4 = false;
		let match5 = false;
		let match6 = false;

		_.each(_wordSet, word2 => {
			if (word1 !== word2) {
				//words are always 7 letters long
				if (word1[0] === word2[6]) {
					match1 = true;
				}

				if (word1[0] === word2[0]) {
					_.each(_wordSet, word3 => {
						if (word1 !== word3 && word2 !== word3) {
							if (word1[6] === word3[0] && word2[6] === word3[6]) {
								match2 = true;
								match5 = true;
							}

							if (word1[6] === word3[6] && word2[6] === word3[0]) {
								match3 = true;
								match4 = true;
							}

						}
					});
				}

				if (word1[6] === word2[6]) {
					match6 = true;
				}
			}
		});

		match1 && possible[0].push(word1);
		match2 && possible[1].push(word1);
		match3 && possible[2].push(word1);
		match4 && possible[3].push(word1);
		match5 && possible[4].push(word1);
		match6 && possible[5].push(word1);
	});

	return possible;

}

/**
* Construct a tree from possible words at each position, where each parent node is a possible word
* at position n, with children the possible words at position n+1 (n being 1-6, the possible
* positions in the star)
*
* possible {String}[] 2-D array of possible words at each position
*
* return {Object} the tree
*/
function buildTree(possible) {
	var tree = [];
	_.each(possible[0], word => {
		tree.push({
			value    : word,
			children : buildTree(possible.slice(1))
		});
	});

	return tree;
}

/**
* Traverses the tree of possible words, creating a list of possible combinations, with the criterion
* that a combination cannot have the same word twice
*
* tree {Object} the tree object returned from buildTree
*
* return {Array[]} List of combination arrays
*/
function getCombosFromTree(tree) {
	var comboList = [];

	var walk = function(obj, list) {
		// console.log('in walk: ' + JSON.stringify(obj, null, 3));
		// console.log('in walk: ' + list + ': ' + obj.value);
		list.push(obj.value);
		if (list.length < 6) {
		// if (list.length < 6 && list.indexOf(obj.value) === -1) {
			// console.log('in if: ' + _.isUndefined(obj.children));
			// console.log('obj.value: ' + obj.value);
			// list.push(obj.value);
			_.each(obj.children, childObj => {
				// console.log('in walk: ' + list + ': ' + childObj.value);
				let listClone = _.clone(list);
				// console.log('clone: ' + listClone);
				if (listClone.indexOf(childObj.value) === -1) {
					walk(childObj, listClone);
				}
			});
		// } else if (list.length === 6){
		} else {
			comboList.push(list);
		}
	};

	_.each(tree, obj => {
		// console.log('was an obj: ' + JSON.stringify(obj, null, 3));
		walk(obj, []);
	});

	return comboList;
}

/**
* Inserts the letters from the given combo into the star and calls printStar.
*
* combo {String}[] The list of words, in order
*/
function drawAnswer(combo) {
	//1
	_.each(combo[0], (letter, index) => {
		_star[0 + index][Math.floor(index / 2) + 3] = letter;
	});

	//2
	_.each(combo[1], (letter, index) => {
		_star[2 + index][Math.floor(index / 2)] = letter;
	});

	//3
	_.each(combo[2], (letter, index) => {
		insertLetter(2, index, letter);
	});

	//4
	_.each(combo[3], (letter, index) => {
		insertLetter(6, index, letter);
	});

	//5
	_.each(combo[4], (letter, index) => {
		_star[6 - index][Math.floor(index / 2)] = letter;
	});

	//6
	_.each(combo[5], (letter, index) => {
		_star[8 - index][Math.floor(index / 2) + 3] = letter;
	});

	printStar();
}

/**
* Walks through the steps of the solve and prints answer to the console
*/
function findCombinations() {

	//find the possibilities
	var possible = getPossibilities();

	//build a tree of possibilities
	var tree = buildTree(possible);

	//walk the tree to produce combinations of 6 words
	var combos = getCombosFromTree(tree);

	//examine each combo to see if valid, print result set and star if so
	_.each(combos, combo => {
		if (isValid(combo)) {
			console.log('answer: ' + combo);
			drawAnswer(combo);
		}
	});
}

module.exports = function(wordSet) {
	_wordSet = wordSet;
	findCombinations();
};