var stressClassesNames = {startTemporaryStress: 'start_temporary_stressed',
							stress: 'stressed',
							focus: 'focused',
							saved_stressed: 'saved_stressed'
						};
var addCommentModes = [
					{"mode": "offStep", "title": "Отключено для шага"},
					{"mode": "onStep", "title": "Включено для шага"},
					{"mode": "off", "title": "Отключено всегда"},
					{"mode": "on", "title": "Включено всегда"},
					{"mode": "modeSettings", "title": "Настройки по умолчанию"},
					{"mode": "userSettings", "title": "Настройки пользователя"}
					];

var parts = {'content': {'title': 'Содержание',
					'element': contentListContainer},
			'about': {'title': 'Информация о тексте',
					'element': aboutTextContainer},
			'main': {'title': 'Основной текст',
					'element': mainTextContainer},
			'footnote': {'title': 'Сноски',
					'element': footnoteTextContainer},
			'external_link': {'title': 'Ссылки',
					'element': externalLinksContainer},
			'media': {'title': 'Список медиа',
					'element': mediaListContainer},
			'album': {'title': 'Альбом медиа',
					'element': mediaAlbumContainer},
			'knowlege_elements': {'title': 'Элементы знаний',
					'element': knowlegeElementsContainer}
			};

var knowlegeElementPartTypesTitle = {'text': 'Текст',
									'media': 'Медиа'};

var currentModeId;
var currentSetId;

var knowlegeElement;

var addCommentMode;
var previousAddCommentMode;
var addCommentModeSource;
var previousAddCommentModeSource;
var wait;
var shiftMode = false;

var modeButton = document.getElementById('mode');
var modesMenu = document.createElement('div');
modesMenu.classList.add('submenu');
var modeMenuLoadElement = document.createElement('div');
modeMenuLoadElement.innerHTML = 'Другие режимы';
modeMenuLoadElement.classList.add('submenu_button', 'load_button');
modeMenuLoadElement.onclick = showOtherModes;

var setButton = document.getElementById('set');
var setsMenu = document.createElement('div');
setsMenu.classList.add('submenu');
var setMenuLoadElement = document.createElement('div');
setMenuLoadElement.innerHTML = 'Другие наборы';
setMenuLoadElement.classList.add('submenu_button', 'load_button');
setMenuLoadElement.onclick = showOtherSets;

var stepButton = document.getElementById('step');

var addCommentModeButton = document.getElementById('comment');
var addCommentModeMenu = document.createElement('div');
addCommentModeMenu.classList.add('submenu');
var setModeButton = document.createElement('div');
setModeButton.classList.add("submenu_button", "load_button");
setModeButton.innerHTML = "Сохранить настройку";
setModeButton.onclick = saveCurrentAddCommentMode;

var workWithTextButton = document.getElementById('create_elements');

renderSandwichMenu();

function renderSandwichMenu() {
	closePartsButton.onclick = closePartsContainer;	
	var sandwichMenu = document.createElement('div');
	sandwichMenu.classList.add('submenu');
	var sandwichMenuElements = document.createDocumentFragment();
	for (var eachPart in parts) {
		var partTitle = document.createElement('div');
		partTitle.classList.add('submenu_button');
		partTitle.innerHTML = parts[eachPart].title;
		partTitle.onclick = openPart;
		partTitle.dataset.part = eachPart;
		sandwichMenuElements.appendChild(partTitle);
	};
	sandwichMenu.appendChild(sandwichMenuElements)
	sandwichButton.appendChild(sandwichMenu);
};

function openPartsContainer() {
	closeAllParts();
	partsContainer.style.display = 'block';	
	setFullWorkSpaceHeight(partsContainer, 1);
};

function closePartsContainer() {
	partsContainer.style.display = '';
};

function setFullWorkSpaceHeight(element, shiftValue) {
	var menuHeight = menu.clientHeight + shiftValue;
	var windowViewport = window.innerHeight;
	element.style.height = (1 - menuHeight/windowViewport)*100 + '%';
};

function closeAllParts() {
	for (var eachPart in parts) {
		parts[eachPart].element.style.display = '';
	};
};

function openMainText() {
	closeAllParts();
	closePartsContainer();
	setFullWorkSpaceHeight(mainTextContainer, 6);

};

function openPart(event) {
	var part = event.target.dataset.part;
	if (part == undefined) {
		part = event.target.dataset.text_source;
	};
	if (part == 'main') {
		openMainText();
	} else if (['media_title', 'media_description'].indexOf(part) >= 0) {
		showGalleryWithMediaText(event);
	} else {
		openPartsContainer(part);
		parts[part].element.style.display = 'block';
		partsTitle.innerHTML = parts[part].title;
	};
};

function renderModeMenu() {
	modeButton.innerHTML = modesTitlesList[0].title;
	modesMenu.innerHTML = '';

	var modesAsMenuElements = document.createDocumentFragment();
	for (var eachModeId = 1; eachModeId < modesTitlesList.length; eachModeId++) {
		var modeMenuElement = document.createElement('div');
		modeMenuElement.dataset.mode = modesTitlesList[eachModeId].id;
		modeMenuElement.classList.add('submenu_button');
		modeMenuElement.innerHTML = modesTitlesList[eachModeId].title;
		modeMenuElement.onclick = setModeFromLastModes;
		modesAsMenuElements.appendChild(modeMenuElement);
	};

	modesAsMenuElements.appendChild(modeMenuLoadElement);
	modesMenu.appendChild(modesAsMenuElements);
	modeButton.appendChild(modesMenu);
};

function setModeFromLastModes(event) {
	removeAllSavedStresses();
	removeAllKnowlegeElements();
	stopCreatingElements();
	clearWindowKnowlegeElement();

	currentModeId = Number(event.target.dataset.mode);
	var previousMode = modesTitlesList[0];	
	for (var eachMode=1; eachMode<modesTitlesList.length; eachMode++) {
		if (modesTitlesList[eachMode].id == currentModeId) {
			modesTitlesList[0] = modesTitlesList[eachMode];
			modesTitlesList[eachMode] = previousMode;
			break;
		} else {
			var presentMode = modesTitlesList[eachMode];
			modesTitlesList[eachMode] = previousMode;
			previousMode = presentMode;
		};
	};
	renderModeMenu();
	downloadJson('mode_setting/'+ currentModeId + '.json', downloadModeSettingCallback);
};

function showOtherModes() {
};

function renderSetMenu() {

	setButton.innerHTML = setsTitlesList[0].title;

	setsMenu.innerHTML = '';

	var setsAsMenuElements = document.createDocumentFragment();
	for (var eachSetId = 1; eachSetId < setsTitlesList.length; eachSetId++) {
		var setMenuElement = document.createElement('div');		
		setMenuElement.classList.add('submenu_button','sets');

		var setWithThemeContainer = document.createDocumentFragment('div');
		var setElement = document.createElement('div');
		setElement.classList.add('set_title');
		setElement.innerHTML = setsTitlesList[eachSetId].title;
		setElement.dataset.set = setsTitlesList[eachSetId].id;
		setElement.onclick = setSetFromLastSets;
		setWithThemeContainer.appendChild(setElement);

		var themeElement = document.createElement('div');
		themeElement.classList.add('theme_title');
		themeElement.innerHTML = setsTitlesList[eachSetId].theme;
		themeElement.dataset.set = setsTitlesList[eachSetId].id;
		themeElement.onclick = showOtherSets;
		setWithThemeContainer.appendChild(themeElement);

		setMenuElement.appendChild(setWithThemeContainer);
		setsAsMenuElements.appendChild(setMenuElement);
	};
	setsAsMenuElements.appendChild(setMenuLoadElement);
	setsMenu.appendChild(setsAsMenuElements);
	setButton.appendChild(setsMenu);
};

function setSetFromLastSets(event) {
	removeAllSavedStresses();	
	removeAllKnowlegeElements();
	stopCreatingElements();
	clearWindowKnowlegeElement();
	currentSetId = Number(event.target.dataset.set);
	var previousSet = setsTitlesList[0];
	for (var eachSet=1; eachSet<setsTitlesList.length; eachSet++) {
		if (setsTitlesList[eachSet].id == currentSetId) {
			setsTitlesList[0] = setsTitlesList[eachSet];
			setsTitlesList[eachSet] = previousSet;
			break;
		} else {
			var presentSet = setsTitlesList[eachSet];
			setsTitlesList[eachSet] = previousSet;
			previousSet = presentSet;
		};
	};
	renderSetMenu();
	downloadJson('set/'+ currentSetId + '.json', downloadSetCallback);

};

function showOtherSets() {
	 var currentSetId = Number(event.target.dataset.set);
	 console.log(currentSetId);
	 if (currentSetId) { 

	 } else { 

	 };
};

ElementPositionConstructor = function() {

	this.setEmptyPostition = function() {
		this.textSource = null;
		this.stringNumber = null;
		this.wordNumber = null;
		this.elementType = null;
		this.elementPart = null;
	};

	this.setEmptyPostition();

	this.setNewPosition = function(textSource, stringNumber, wordNumber, elementType) {
		this.textSource = textSource;
		this.stringNumber = stringNumber;
		this.wordNumber = wordNumber;
		this.elementType = elementType;
		this.textArray = loadedTextsJson[textSource];

		this._ensuretoNumbers();

	};

	this._ensuretoNumbers = function() {
		this.stringNumber = Number(this.stringNumber);

		if (this.wordNumber >= 0) {
			this.wordNumber = Number(this.wordNumber);

		};

	};

	this._getLastStingNumber = function() {
		return this.textArray.length - 1;
	};

	this._getLastWordNumberInString = function() {

		return this.textArray[this.stringNumber].length - 1;
	};

	this.isLastWordNumberInString = function() {
		return this.wordNumber == this._getLastWordNumberInString();
	};

	this.isZeroWordNumberInString = function() {
		return this.wordNumber == 0;	
	}

	this._incrementWordPosition = function() {

		if (this.wordNumber < this._getLastWordNumberInString()) {
			this.wordNumber++;

		} else {
			this._incrementStringPosition();			
		};		
	};

	this._incrementStringPosition = function() {
		if (this.stringNumber < this._getLastStingNumber()) {
			this.stringNumber++;
			this._setZeroWordNumber();
		};
	};

	this._decrementWordPosition = function() {
		if (this.wordNumber > 0) {
			this.wordNumber--;

		} else {			
			this._decrementStringPosition();			
		};
	};

	this._decrementStringPosition = function() {
		if (this.stringNumber > 0) {
			this.stringNumber--;
			this.wordNumber = this._getLastWordNumberInString();
		};
	};

	this.hasElementPosition = function() {

		if (this.stringNumber != null) {
			return true;
		} else {
			return false;
		};
	};

	this.hasWordPosition = function() {

		if (this.wordNumber != undefined) {
			return true;
		} else {
			return false;
		};
	};

	this._setZeroWordNumber = function() {
		this.wordNumber = 0;		
	};

	this._setLastWordNumberInString = function() {
		this.wordNumber = this._getLastWordNumberInString();		
	};

	this._defineValueDirection = function(firstValue, secondValue) {
			if (firstValue < secondValue) { 
				return 'direct'; 
			} else if (firstValue > secondValue) { 
				return 'reverse';
			} else { 
				return 'hold';
			};
		};

	this.defineStringDirection = function(otherElementPosition) {
		return this._defineValueDirection(this.stringNumber, otherElementPosition.stringNumber);			
	};

	this._defineWordDirection = function(otherElementPosition) {
		return this._defineValueDirection(this.wordNumber, otherElementPosition.wordNumber);
	};

	this.defineElementDirection = function(otherElementPosition) {
		var thisPositonToOtherStringDirection = this.defineStringDirection(otherElementPosition);
		if (thisPositonToOtherStringDirection != 'hold') {			
			return thisPositonToOtherStringDirection;
		} else { 
			if (this.elementType.indexOf('text_button') != -1) { 
				if (otherElementPosition.elementType.indexOf('text_button') != -1) { 
					return 'hold';
				} else { 
					if (this.elementType.indexOf('left') != -1) { 
						if (otherElementPosition.wordNumber == 0) {
							return 'hold';
						} else {
							return 'direct';
						};
					} else if (this.elementType.indexOf('right') != -1) { 
						if (otherElementPosition.wordNumber == this._getLastWordNumberInString()) {
							return 'hold';
						} else {
							return 'reverse';
						};
					};
				};
			} else { 
				if (otherElementPosition.elementType.indexOf('text_button') != -1) { 
					if (otherElementPosition.elementType.indexOf('left') != -1) { 
						if (this.wordNumber == 0) {
							return 'hold';
						} else {
							return 'reverse';
						};
					} else if (otherElementPosition.elementType.indexOf('right') != -1) { 
						if (this.wordNumber == otherElementPosition._getLastWordNumberInString()) {
							return 'hold';
						} else {
							return 'direct';
						};
					};
				} else { 
					return this._defineWordDirection(otherElementPosition);
				};
			};
		};
	};

	this.getReadyElement = function(position) {

		var changedPositonObject = this.copyPositionObject();
		if (!changedPositonObject.hasWordPosition()) {
			switch (position) {
				case false:
					changedPositonObject._setZeroWordNumber();
					break;
				case true:
					changedPositonObject._setLastWordNumberInString();
					break;
			};
		};

		changedPositonObject.elementType = ['text', 'word'];
		return changedPositonObject;
	};

	this.incrementElementPosition = function(sameString) {

		var changedPositonObject = this.copyPositionObject();
		if (!changedPositonObject.hasWordPosition()) {
			changedPositonObject._incrementStringPosition();
			changedPositonObject._setZeroWordNumber();
		} else {
			changedPositonObject._incrementWordPosition();			
		};

		return changedPositonObject;
	};

	this.decrementElementPosition = function() {

		var changedPositonObject = this.copyPositionObject();
		if (!changedPositonObject.hasWordPosition()) {
			changedPositonObject._decrementStringPosition();
			changedPositonObject._setLastWordNumberInString();
		} else {
			changedPositonObject._decrementWordPosition();
		};

		return changedPositonObject;
	};

	this.copyPositionObject = function() {
		var copiedPositionObject = new ElementPositionConstructor();
		copiedPositionObject.textSource = this.textSource;
		copiedPositionObject.textArray = this.textArray;
		copiedPositionObject.stringNumber = this.stringNumber;
		copiedPositionObject.wordNumber = this.wordNumber;
		copiedPositionObject.elementType = this.elementType;

		return copiedPositionObject;
	};

	this.isStressed = function(stressClass) {
		function getElementWithStringAndWordNumbers(elementPositionObject) {
			return document.querySelector('.word[data-string="' + elementPositionObject.stringNumber + '"][data-word="' + elementPositionObject.wordNumber + '"]');
		};
		var wordElement = getElementWithStringAndWordNumbers(this.getReadyElement(false));
		return wordElement.classList.contains(stressClass);
	};

	this.getPositionDictionary = function() {
		positionDictionary = {};
		positionDictionary.string = this.stringNumber;
		positionDictionary.word = this.wordNumber;
		return positionDictionary;
	};

	this.createElementFromQuote = function(quotePosition, textSource) {
		this.stringNumber = quotePosition.string;
		this.wordNumber = quotePosition.word;
		this.textSource = textSource;
		this.textArray = loadedTextsJson[textSource];
		this.elementType = ['text', 'word'];
	};

	this.isTheSameElementPosition = function(otherElementPosition) {

		return (this.stringNumber == otherElementPosition.stringNumber) && (this.wordNumber == otherElementPosition.wordNumber);
	};
};

StressObjectConstructor = function(stressClassName) {

	this.startElementPosition = new ElementPositionConstructor();
	this.endElementPosition = new ElementPositionConstructor();
	this.previousEndElementPosition = new ElementPositionConstructor();
	this.stressClassName = stressClassName;
	this.number = null;
	this.quoteNumber = null;
	this.elementPart = null;
	this.textSource = null;
	this.textArray = null;

	this.erase = function() {
		this.startElementPosition = new ElementPositionConstructor();
	};

	this.setElementsPositions = function(startElementPosition, endElementPosition) {
		this.startElementPosition = startElementPosition;
		this.endElementPosition = endElementPosition;

		if (startElementPosition.textSource == endElementPosition.textSource) {
			this.textSource = startElementPosition.textSource;
			this.textArray = startElementPosition.textArray;
		} else {
			console.log('Selection has been from different text sources');
		};
	};

	this.setOperation = function(operation) {
		this.operation = operation; 
	};

	this.checkAndChangeElementsPositions = function() {
		if (this.startElementPosition.defineElementDirection(this.endElementPosition) == 'reverse') {			
			var exchageElementPosition = this.startElementPosition;
			this.startElementPosition = this.endElementPosition;
			this.endElementPosition = exchageElementPosition;
		};
	};

	this.getElementsPositions = function() {
		this.startElementPosition = this.startElementPosition.getReadyElement(false);
		this.endElementPosition = this.endElementPosition.getReadyElement(true);
	};

	this.setStartPositions = function(elementPosition) {
		this.setElementsPositions(elementPosition, elementPosition);		
		this.previousEndElementPosition = this.endElementPosition.copyPositionObject();		

	};

	this.copyElementsPositionsToThisStressObject = function(otherStressObject) {
		this.startElementPosition = otherStressObject.startElementPosition.copyPositionObject();
		this.endElementPosition = otherStressObject.endElementPosition.copyPositionObject();
		this.textSource = otherStressObject.textSource;
		this.textArray = otherStressObject.textArray;
	};

	this.copyStressObject = function(otherStressObject) {
		this.copyElementsPositionsToThisStressObject(otherStressObject);
		this.stressClassName = otherStressObject.stressClassName;
	};

	this.getPositionsDictionary = function(quoteNumber) {
		elementsDictionary = {};

		elementsDictionary.source = this.textSource;
		elementsDictionary.number = quoteNumber;
		elementsDictionary.start = this.startElementPosition.getPositionDictionary();
		elementsDictionary.end = this.endElementPosition.getPositionDictionary();
		elementsDictionary.stressObject = this;
		this.quoteNumber = quoteNumber;
		return elementsDictionary;
	};

	this.hasElementsPositions = function() {
		return this.startElementPosition.hasElementPosition();
	};

	this.defineOverlap = function(otherStressObject) {
		var isOverlaped = true;
		if (this.endElementPosition.defineElementDirection(otherStressObject.startElementPosition) == 'direct' || otherStressObject.endElementPosition.defineElementDirection(this.startElementPosition) == 'direct') {
			isOverlaped = false;
		};
		return isOverlaped;
	};

	this.createQuoteFromSaved = function(quote) {
		this.textSource = quote.source;
		this.quoteNumber = quote.number;
		this.startElementPosition = new ElementPositionConstructor;
		this.startElementPosition.createElementFromQuote(quote.start, quote.source);

		this.endElementPosition = new ElementPositionConstructor;
		this.endElementPosition.createElementFromQuote(quote.end, quote.source);

		this.textArray = loadedTextsJson[this.textSource];
		this.number = savedStressedObjects[this.textSource].length + 1;

		savedStressedObjects[this.textSource].push(this);
		quote.stressObject = this;

	};

	this.extractTextFromSource = function() {
		var wordsArray = [];
		var firstElementPosition = this.startElementPosition;
		var secondElementPostition = this.endElementPosition;
		for (var eachString=firstElementPosition.stringNumber; eachString<=secondElementPostition.stringNumber; eachString++) {
			if (eachString == firstElementPosition.stringNumber) {
				startWordNumber = firstElementPosition.wordNumber;
			} else {
				startWordNumber = 0;
			};
			if (eachString == secondElementPostition.stringNumber) {
				endWordNumber = secondElementPostition.wordNumber;
			} else {

				endWordNumber = this.textArray[eachString].length - 1;
			};
			for (var eachWord=startWordNumber; eachWord<=endWordNumber; eachWord++) {

				wordsArray.push(this.textArray[eachString][eachWord][0])

			};
		};
		return wordsArray.join(' ');
	};

	this.mergeStress = function(overlappedSavedStressObject, overlappedNumber=false) {

		this.stressClassName = stressClassesNames.saved_stressed;
		var copyThisStressObject = new StressObjectConstructor;
		copyThisStressObject.copyStressObject(this);

		var copyOverlappedSavedStressObject = new StressObjectConstructor;
		copyOverlappedSavedStressObject.copyStressObject(overlappedSavedStressObject);

		var objectsForRender = [];
		var objectForSavingToOverlappedStartsPositionsDirection = this.startElementPosition.defineElementDirection(overlappedSavedStressObject.startElementPosition);
		var objectForSavingToOverlappedEndsPositionsDirection = this.endElementPosition.defineElementDirection(overlappedSavedStressObject.endElementPosition);

		switch (objectForSavingToOverlappedStartsPositionsDirection) {
			case 'direct':
				overlappedSavedStressObject.startElementPosition = copyThisStressObject.startElementPosition;
				this.endElementPosition = copyOverlappedSavedStressObject.startElementPosition;
				objectsForRender.push(this);
				switch (objectForSavingToOverlappedEndsPositionsDirection) {
					case 'direct':
					case 'hold':

						break;
					case 'reverse':

						overlappedSavedStressObject.endElementPosition = copyThisStressObject.endElementPosition;
						var additionalStressObject = new StressObjectConstructor(stressClassesNames.saved_stressed);

						additionalStressObject.setElementsPositions(copyOverlappedSavedStressObject.endElementPosition, copyThisStressObject.endElementPosition);

						objectsForRender.push(additionalStressObject);
						break;
				};
				break;
			case 'hold':
			case 'reverse':
				switch (objectForSavingToOverlappedEndsPositionsDirection) {
					case 'direct':
					case 'hold':

						break;
					case 'reverse':

						overlappedSavedStressObject.endElementPosition = copyThisStressObject.endElementPosition;
						this.startElementPosition = copyOverlappedSavedStressObject.endElementPosition;
						objectsForRender.push(this);
				};
				break;
		};

		if (overlappedNumber) {

				objectsForRender.forEach(function(eachObjectToRender) {

				eachObjectToRender.renderStress();
			});
			overlappedSavedStressObject.elementPart.quote[overlappedSavedStressObject.quoteNumber-1] = overlappedSavedStressObject.getPositionsDictionary(overlappedSavedStressObject.quoteNumber);
		};

		return overlappedSavedStressObject;

	};

	this.isTheSamePosition = function(otherStressObject) {

		return this.startElementPosition.isTheSameElementPosition(otherStressObject.startElementPosition) && this.endElementPosition.isTheSameElementPosition(otherStressObject.endElementPosition);
	};

	this.renderStress = function(htmlNode) {

		var firstElementPosition = this.startElementPosition;
		var secondElementPostition = this.endElementPosition;

		outputToLog('===RENDERING_START===');
		outputToLog('firstElementPosition');
		outputToLogPO(firstElementPosition);
		outputToLog('secondElementPostition');
		outputToLogPO(secondElementPostition);

		var selectionClass = this.stressClassName;	
		var selectedWordElement;
		var selectedSpaceElement;
		var startWordNumber;
		var endWordNumber;

		for (var eachString=firstElementPosition.stringNumber; eachString<=secondElementPostition.stringNumber; eachString++) {

			if (eachString == firstElementPosition.stringNumber) {
				startWordNumber = firstElementPosition.wordNumber;
			} else {
				startWordNumber = 0;
			};

			var lastWordNumberInString = this.textArray[eachString].length - 1;
			if (eachString == secondElementPostition.stringNumber) {
				endWordNumber = secondElementPostition.wordNumber;
			} else {
				endWordNumber = lastWordNumberInString;
			};

			for (var eachWord=startWordNumber; eachWord<=endWordNumber; eachWord++) {

				if (selectionClass == 'temporary_stressed' || selectionClass == 'start_temporary_stressed') { 

					if (this.operation == 'remove') { 

						this.textArray[eachString][eachWord][1] = false;					
						selectedWordElement = getElementForOperation(htmlNode, this.textSource, 'word', eachString, eachWord);
						selectedWordElement.classList.remove(selectionClass);
						if (eachWord < lastWordNumberInString) {

							this.textArray[eachString][eachWord][2] = false;
							selectedSpaceElement = getElementForOperation(htmlNode, this.textSource, 'space', eachString, eachWord );
							selectedSpaceElement.classList.remove(selectionClass);
						};
						if (eachWord+1 <= lastWordNumberInString) {

							if (this.textArray[eachString][eachWord+1][1] == false && this.textArray[eachString][eachWord][2] == true) {

								this.textArray[eachString][eachWord][2] = false;							
								selectedSpaceElement = getElementForOperation(htmlNode, this.textSource, 'space', eachString, eachWord);
								selectedSpaceElement.classList.remove(selectionClass);
							};
						};
						if (eachWord-1 >= 0) {

							if (this.textArray[eachString][eachWord-1][1] == true && this.textArray[eachString][eachWord-1][2] == true) {

								this.textArray[eachString][eachWord-1][2] = false;
								selectedSpaceElement = getElementForOperation(htmlNode, this.textSource, 'space', eachString, eachWord-1);
								selectedSpaceElement.classList.remove(selectionClass);					
							};
						};
					} else { 

						if (this.textArray[eachString][eachWord][1] == false) {						

							this.textArray[eachString][eachWord][1] = true;
							selectedWordElement = getElementForOperation(htmlNode, this.textSource, 'word', eachString, eachWord);
							selectedWordElement.classList.add(selectionClass);						
							if (eachWord < endWordNumber) {

								this.textArray[eachString][eachWord][2] = true;
								selectedSpaceElement = getElementForOperation(htmlNode, this.textSource, 'space', eachString, eachWord);
								selectedSpaceElement.classList.add(selectionClass);
							} else {
								if (eachWord+1 <= lastWordNumberInString) { 

									if (this.textArray[eachString][eachWord+1][1] == true && this.textArray[eachString][eachWord][2] == false) {									

										this.textArray[eachString][eachWord][2] = true;
										selectedSpaceElement = getElementForOperation(htmlNode, this.textSource, 'space', eachString, eachWord);
										selectedSpaceElement.classList.add(selectionClass);
									};
								};
							};
							if (eachWord-1 >= 0) {

								if (this.textArray[eachString][eachWord-1][1] == true && this.textArray[eachString][eachWord-1][2] == false) {							

									this.textArray[eachString][eachWord-1][2] = true;
									selectedSpaceElement = getElementForOperation(htmlNode, this.textSource, 'space', eachString, eachWord-1);
									selectedSpaceElement.classList.add(selectionClass);
								};
							};
						};
					};
				} else { 

					selectedWordElement = getElementForOperation(htmlNode, this.textSource, 'word', eachString, eachWord);
					if (eachWord != endWordNumber) {
						selectedSpaceElement = getElementForOperation(htmlNode, this.textSource, 'space', eachString, eachWord);
					};
					if (this.operation == 'remove') {

						selectedWordElement.classList.remove(selectionClass);
						if (eachWord != endWordNumber) {
							selectedSpaceElement.classList.remove(selectionClass);
						};
					} else {

						selectedWordElement.classList.add(selectionClass);
						if (eachWord != endWordNumber) {
							selectedSpaceElement.classList.add(selectionClass);
						};
					};
				};
			};
		};
		outputToLog('!!!RENDERING_END!!!');
	};

	this.blinkStress = function() {

		this.markStressObject();
		var TIMEOUT = userSettings.blinkingTimeOut;
		var stressObject = this;
		var stopBlink = setTimeout(
			function() {
				stressObject.operation = 'remove';
				stressObject.renderStress();

				stressObject.operation = undefined;
			},
			TIMEOUT);
	};

	this.scrollToStartPosition = function() {
		var startWord = getElementForOperation(undefined, this.textSource, 'word', this.startElementPosition.stringNumber, this.startElementPosition.wordNumber);
		startWord.scrollIntoView(true);	
	};

	this.markStressObject = function() {		
		this.stressClassName = 'start_temporary_stressed';
		this.renderStress();
	};

	this.removeStressForStressObject = function() {
		this.operation = 'remove';
		this.renderStress();
	};

	this.deleteStressObject = function(deleteFromSavedStressObjects=true) {
		for (var eachsavedStressedObjectsNumber=0;eachsavedStressedObjectsNumber<savedStressedObjects[this.textSource].length;eachsavedStressedObjectsNumber++) {
			if (savedStressedObjects[this.textSource][eachsavedStressedObjectsNumber].number > this.number) {
				savedStressedObjects[this.textSource][eachsavedStressedObjectsNumber].number--;
			};
		};
		if (['media_title', 'media_description'].indexOf(this.textSource) < 0 || (currentTotalNumberOfOpenedInSliderMediaElement && currentTotalNumberOfOpenedInSliderMediaElement == this.startElementPosition.stringNumber)) {
			this.removeStressForStressObject();

		};
		if (deleteFromSavedStressObjects) {

			savedStressedObjects[this.textSource].splice(this.number-1, 1);
		};

	};

	this.getElementPartNumber = function() {
		return this.elementPart.number;
	};

	this.getKnowlegeElementNumber = function() {
		return this.elementPart.knowlegeElement.number;
	};

	this.isInSameKnowlegeElement = function(otherStressObject) {
		return this.getKnowlegeElementNumber() == otherStressObject.getKnowlegeElementNumber();
	};

	this.isInSameElementPart = function(otherStressObject) {
		return this.getElementPartNumber() == otherStressObject.getElementPartNumber();
	};

	this.isInSameQuote = function(otherStressObject) {
		return this.isInSameKnowlegeElement(otherStressObject) && this.isInSameElementPart(otherStressObject);
	};

	this.removeStressInText = function() {
		this.setOperation('remove');
		this.renderStress();
	};
};

function outputToLog(text) {
	log.value += text + '\n';
	log.scrollTop = log.scrollHeight;
};

function outputToLogPO(positionObject) {
	log.value += positionObject.stringNumber + ' ' + positionObject.wordNumber + '\n';
	log.scrollTop = log.scrollHeight;
};

function transformSavedKnowlegeElementsAndRenderQuotes(operation) {
	currentSet.elements.forEach(function(eachSavedKnowlegeElement) {
		var savedKnowlegeElement = new KnowlegeElementConstructor();
		savedKnowlegeElement.createKnowlegeElementFromSaved(eachSavedKnowlegeElement);
		savedKnowlegeElement.insertToContainer();

		savedKnowlegeElements.push(savedKnowlegeElement);
	});
};

function removeAllSavedStresses() {
	for (textSource in savedStressedObjects) {
		savedStressedObjects[textSource].forEach(function(savedStressedObjects) {
			savedStressedObjects.deleteStressObject(deleteFromSavedStressObjects=false);
		});
	};
	savedStressedObjects = {};
	createSavedStressedObjectsDict();
	savedStressedMediaTotalNumbers.forEach(function(eachSavedStressedMediaTotalNumber) {
		stressPreviewImageClassInMainTextAndMediaAlbum(eachSavedStressedMediaTotalNumber, 'remove');
	});

};

function removeAllKnowlegeElements() {
	knowlegeElementsContainer.innerHTML = '';
	savedKnowlegeElements = [];
};

KnowlegeElementConstructor = function(number) {
	this.number = number;
	this.completed = null;
	this.stop = null;
	this.date = null;
	this.stepsProps = currentModeSettings.steps;
	this.parts = [];
	this.htmlNode = null;
	this.elementPart = false;

	this.createKnowlegeElementFromSaved = function(savedKnowlegeElement) {
		this.number = savedKnowlegeElement.number;
		this.completed = savedKnowlegeElement.completed;
		this.date = savedKnowlegeElement.date;
		var thisKnowlegeElement = this;

		for (var partNumber=0;partNumber<savedKnowlegeElement.parts.length;partNumber++) {
			var elementPart = new ElementPartConstructor(this);
			elementPart.createElementPartFromSaved(savedKnowlegeElement.parts[partNumber]);
			elementPart.extractAndRenderStressQuotes();
			this.parts.push(elementPart);
		};

	};

	this.createHtmlNode = function() {

		KnowlegeElementHtmlNodeConstructor = function(knowlegeElement) {

			this.createNode = function(classesList, content) {
				var element = document.createElement('div');
				classesList.forEach(function(eachClass) {
					element.classList.add(eachClass);
				});
				if (content != undefined) {
					element.innerHTML = content;
				};
				return element;
			};

			this.createNodeAndInsertInParent = function(parentElement, elementHeaderClasses, content) {
				var element = this.createNode(elementHeaderClasses, content);
				parentElement.appendChild(element);
				return element;
			};

			this.setElementNumberForDeleteButton = function() {
				this.deleteElementButton.dataset.knowlege_element_number = this.knowlegeElement.number;
			};

			this.createDeleteButton = function(elementHeader) {
				this.deleteElementButton = this.createNodeAndInsertInParent(elementHeader, ['button', 'delete_button'], 'X');
				this.setElementNumberForDeleteButton();
				this.deleteElementButton.onclick = this.knowlegeElement.deleteFromEvent;
			};

			this.refreshElementNumber = function() {
				this.elementNumber.innerHTML = this.knowlegeElement.number;
				this.setElementNumberForDeleteButton();
			};			

			this.changeElementHeaderCompletion = function() {
				this.knowlegeElement.checkDeletedElementParts();

				if (this.knowlegeElement.completed) {
					this.elementHeader.classList.remove('uncompleted');
				} else {					
					this.elementHeader.classList.add('uncompleted');
				};
			};

			this.createElementHeader = function(knowlegeElementContainer) {
				var elementHeaderClasses = ['knowlege_element_header'];
				this.elementHeader = this.createNode(elementHeaderClasses);
				this.changeElementHeaderCompletion();
				this.elementNumber = this.createNodeAndInsertInParent(this.elementHeader, ['element_number'], this.knowlegeElement.number);
				this.createNodeAndInsertInParent(this.elementHeader, ['element_date'], this.knowlegeElement.date);
				this.createDeleteButton(this.elementHeader);
				knowlegeElementContainer.append(this.elementHeader);
			};

			this.createPartsContainer = function(knowlegeElementContainer) {
				this.partsElementsContainer = this.createNode(['knowlege_element_parts']);
				for (var eachPartNumber=0;eachPartNumber<this.knowlegeElement.parts.length;eachPartNumber++) {
					var eachPart = this.knowlegeElement.parts[eachPartNumber];
					var elementHtmlNode = eachPart.createHtmlNode();
					this.partsElementsContainer.appendChild(elementHtmlNode);
				};
				knowlegeElementContainer.append(this.partsElementsContainer);

				return this.partsElementsContainer;
			};

			this.knowlegeElement = knowlegeElement;

			var knowlegeElementContainer = this.createNode(['knowlege_element']);
			this.htmlCode = knowlegeElementContainer;
			var elementHeader = this.createElementHeader(knowlegeElementContainer);
			this.partsElementsContainer = this.createPartsContainer(knowlegeElementContainer);
		};

		var htmlNode = new KnowlegeElementHtmlNodeConstructor(this);
		this.htmlNode = htmlNode;
	};

	this.deleteFromEvent = function(event) {
		var knowlegeElementNumber = event.target.dataset.knowlege_element_number;
		var toDelete = confirm('Удалить элемент № ' + knowlegeElementNumber);
		if (toDelete) {
			var knowlegeElement = findSavedKnowlegeElement(knowlegeElementNumber);
			knowlegeElement.deleteKnowlegeElement();
		};
	};

	this.deleteKnowlegeElement = function() {

		this.parts.forEach(function(eachPart) {
			eachPart.deleteAllTypesQuotes();
		});
		for (var eachKnowlegeElementNumber=0;eachKnowlegeElementNumber<savedKnowlegeElements.length;eachKnowlegeElementNumber++) {
			if (savedKnowlegeElements[eachKnowlegeElementNumber].number > this.number) {
				savedKnowlegeElements[eachKnowlegeElementNumber].number--;
				savedKnowlegeElements[eachKnowlegeElementNumber].htmlNode.refreshElementNumber();
			};
		};
		savedKnowlegeElements.splice(this.number-1, 1);
		knowlegeElementsContainer.removeChild(this.htmlNode.htmlCode);
	};

	this.insertToContainer = function() {
		this.createHtmlNode();
		knowlegeElementsContainer.appendChild(this.htmlNode.htmlCode);
	};

	this.setDateTime = function() {
		var dateObject = new Date();
		var date = [dateObject.getFullYear(), dateObject.getMonth(), dateObject.getDate()].join('-');
		var time = [dateObject.getHours(), dateObject.getMinutes(), dateObject.getSeconds()].join(':');
		this.date = date + ' ' + time;
	};

	this.createFirstPart = function() {
		this.elementPart = undefined;
		this.addNextPart();
	};

	this.addNextPart = function() {
		if (this.elementPart != undefined) { 

			this.elementPart.createPartComment();
			elementStepNumber = this.elementPart.number;
			this.elementPart.stopAddElementPart();
			this.parts.push(this.elementPart);

		} else {
			elementStepNumber = 0; 
		};
		if (elementStepNumber < currentModeSettings.steps.length) {
			elementStepNumber++;
			this.elementPart = new ElementPartConstructor(this, elementStepNumber);
			console.log('here')
			this.elementPart.renderStepField();
			getAddCommentModeAndRenderCommentModeMenu(true);

			this.elementPart.startAddElementPart();

		} else if (elementStepNumber == currentModeSettings.steps.length) {

			this.completed = true;
			savedKnowlegeElements.push(this);
			this.insertToContainer();

			var continueCreatingElements = confirm('Добавление элемента закончено. Добавить следующий элемент?');

			if (continueCreatingElements) {

				addNextElement();
			} else {

				createCreatingElementsModeButton("start");
				hideStepField();
				clearWindowKnowlegeElement();
				alert('Добавление элементов пристановлено. Нажмите ЗАПУСК для возобновления');
			};
		};
	};

	this.deactiveElement = function() {
		this.processType = false;
		this.elementPart = false;
	};

	this.stopAddElement = function() {
		if (this.elementPart.number > 1) {
			this.stop = this.elementPart.number;

		};
		this.elementPart.stopAddElementPart();
		this.deactiveElement();		
	};

	this.backToKnowlegeElementsPart = function() {
		var hasGalleryBeenClosed = closeGalleryRequest();
		console.log(hasGalleryBeenClosed);
		if (hasGalleryBeenClosed) {
			var knowlegeElementsPartTitle = 'knowlege_elements';
			var getBack = confirm('Вернуться к вкладке ' + parts[knowlegeElementsPartTitle].title + '?');
			if (getBack) {
				event.target.dataset.text_source = knowlegeElementsPartTitle;
				openPart(event);
				this.htmlNode.htmlCode.scrollIntoView(true);
			};
		};
	};

	this.addDeletedElementPart = function(elementPartNumber) {

		if (this.completed) {
			this.deletedElementParts = [elementPartNumber];
			this.completed = false;

		} else {
			if (!this.deletedElementParts) {

				this.deletedElementParts = [elementPartNumber];
			} else {
				var elementPartIndex = this.indexOfElementNumberInDeletedElementParts(elementPartNumber);
				if (elementPartIndex < 0) {
					this.deletedElementParts.push(elementPartNumber);

				};
			};
		};
	};

	this.indexOfElementNumberInDeletedElementParts = function(elementPartNumber) {
		return this.deletedElementParts.indexOf(elementPartNumber);
	};

	this.removeDeletedElementParts = function(elementPartNumber) {
		var elementPartIndex = this.indexOfElementNumberInDeletedElementParts(elementPartNumber);
		this.deletedElementParts.splice(elementPartIndex, 1);
	};

	this.checkDeletedElementParts = function() {
		if (!this.completed && this.deletedElementParts && this.deletedElementParts.length == 0) {
			this.completed = true;
		};
	};
};

ElementPartConstructor = function(knowlegeElement, stepNumber) {

	this.defineStepProps = function() {
		this.stepProps = this.knowlegeElement.stepsProps[this.number-1];		
		this.possibleDataTypes = this.stepProps.data_types;
	};

	this.number = stepNumber;
	this.type = null;
	this.data = null;
	this.quote = null;
	this.knowlegeElement = knowlegeElement;
	if (stepNumber != undefined) {
		this.defineStepProps();
	};
	this.htmlNode = null;

	this.createElementPartFromSaved = function(savedElementPart) {
		for (prop in savedElementPart) {
			this[prop] = savedElementPart[prop];
		};
		this.defineStepProps();
	};

	this.extractAndRenderStressQuotes = function() {

		if (this.quote != null) {

			switch (this.type) {
				case "text":
					for (var quoteNumber=0;quoteNumber<this.quote.length;quoteNumber++) {
						var savedStressObject = new StressObjectConstructor('saved_stressed');
						savedStressObject.elementPart = this;
						savedStressObject.createQuoteFromSaved(this.quote[quoteNumber]);

						if (['media_title', 'media_description'].indexOf(savedStressObject.textSource) < 0) {

							savedStressObject.renderStress();
						};
					};
					break;
				case "media":
					this.quote.forEach(function(eachQuote) {
						stressPreviewImageClassInMainTextAndMediaAlbum(eachQuote.total_number);
						savedStressedMediaTotalNumbers.push(eachQuote.total_number);
					});
					break;
			};
		};
	};

	this.createPartComment = function() {
		if (addCommentMode == "on" || addCommentMode == "onStep") {
			var comment = prompt('Введите комментарий:');
			this.comment = comment;
		};
	};

	this.deleteAllTypesQuotes = function() {
		if (this.quote) {
			for (var quoteNumber=0;quoteNumber<this.quote.length;quoteNumber++) {
				var eachQuote = this.quote[quoteNumber];
				switch (this.type) {
					case 'text':
						eachQuote.stressObject.deleteStressObject();
					break;
					case 'media':
						deleteSavedStressedMediaWithTotalNumber(eachQuote.total_number);
					break;
				};
			};
		};
		this.quote = null;
	};

	this.clearPartContent = function() {
		this.deleteAllTypesQuotes();
		this.data = null;
		this.comment = null;
	};

	this.createHtmlNode = function() {

		ElementPartHtmlNodeConstructor = function(part) {

			this.createNode = function(classesList, content) {
				var element = document.createElement('div');
				classesList.forEach(function(eachClass) {
					element.classList.add(eachClass);
				});
				if (content != undefined) {
					element.innerHTML = content;
				};
				return element;
			};

			this.createNodeAndInsertInParent = function(parentElement, elementHeaderClasses, content) {
				var element = this.createNode(elementHeaderClasses, content);
				parentElement.appendChild(element);
				return element;
			};

			this.createButton = function(parentElement, classList, buttonText, onclickFunction) {
				var button = this.createNodeAndInsertInParent(parentElement, classList, buttonText);
				button.dataset.knowlege_element_number = this.knowlegeElement.number;
				button.dataset.part_number = this.part.number;
				button.onclick = onclickFunction;
				return button;
			};

			this.createChangeButton = function(partHeader) {
				return this.createButton(partHeader, ['ke_button'], 'C', this.part.changePartContent);
			};

			this.createAddCommentButton = function() {

				if (!this.part.comment) {
					this.addCommentButton = this.createButton(this.partMainNodeHeader, ['ke_button'], 'AC', this.part.addComment);
				};
			};

			this.createDeleteButton = function() {

				this.deleteButton = this.createButton(this.partMainNodeHeader, ['ke_button'], 'DEL', this.part.deleteElementPartEvent);
			};

			this.createCompleteButton = function() {
				this.completeButton = this.createButton(this.partMainNodeHeader, ['ke_button'], 'COMPLETE', this.part.completeElementPart);
			};

			this.removeAddCommentButton = function() {
				this.partMainNodeHeader.removeChild(this.addCommentButton);
			};

			this.createRemoveCommentButton = function(partHeader) {
				this.removeCommentButton = this.createButton(partHeader, ['ke_button'], 'RC', this.part.deleteComment);
			};

			this.createShowPositionButton = function(containerElement, source, stressObjectNumbersArray) {
				this.showPositionsButton = this.createNodeAndInsertInParent(containerElement, ['ke_button'], 'P');
				this.showPositionsButton.dataset.text_source = source;
				this.showPositionsButton.dataset.stress_object_number = stressObjectNumbersArray.join(' ');
				this.showPositionsButton.onclick = findAndStressObjectsInText;
			};

			this.changeElementPartHeaderCompletion = function() {
				this.partMainNodeHeader.classList.toggle('uncompleted');
			};

			this.createMainTextNode = function() {

				this.mainTextNode = this.createNode(['part_text', 'main_text']);
				this.mainPartNode = this.mainTextNode;
				if (this.part.number <= this.knowlegeElement.stepsProps.length) {
					var partTitle = this.part.stepProps.title;
				} else {
					var partTitle = this.part.title; 
				};
				this.mainTextHeader = this.createNodeAndInsertInParent(this.mainTextNode, ['part_content_header']);
				this.partMainNodeHeader = this.mainTextHeader;
				this.createNodeAndInsertInParent(this.mainTextHeader, ['part_number'], this.part.number);
				this.createNodeAndInsertInParent(this.mainTextHeader, ['part_content_title'], partTitle);
				if (part.data) {
					this.createChangeButton(this.mainTextHeader);
					this.createAddCommentButton();
					this.createDeleteButton();
					this.mainTextContentElement = this.createNodeAndInsertInParent(this.mainTextNode, ['part_content_text'], part.data);
				} else {

					this.knowlegeElement.addDeletedElementPart(this.part.number);
					this.createCompleteButton();
					this.changeElementPartHeaderCompletion();

				};
				this.htmlCode.appendChild(this.mainTextNode);				
			};

			this.createCommentNode = function() {
				if (this.part.comment) {
					this.commentNode = this.createNode(['part_text', 'comment_text']);
					this.commentHeader = this.createNodeAndInsertInParent(this.commentNode, ['part_content_header'], 'Комментарий');
					this.createChangeButton(this.commentHeader);
					this.createRemoveCommentButton(this.commentHeader);
					this.commentContentElement = this.createNodeAndInsertInParent(this.commentNode, ['part_content_text'], this.part.comment);
					this.htmlCode.appendChild(this.commentNode);

					var nextPartText = this.mainPartNode.nextSibling;
						if (nextPartText) {
							this.htmlCode.insertBefore(this.commentNode, nextPartText);
						} else { 

							this.htmlCode.appendChild(this.commentNode);							
						};
					};
			};

			this.removeCommentNode = function() {
				this.htmlCode.removeChild(this.commentNode);
			};

			this.createQuoteNode = function() {

				if (this.part.quote) {
					var source = this.part.quote[0].source; 
					var stressObjects = [];					
					var stringsRangesForRender = [];

					this.part.quote.forEach(function(eachQuote) {
						stressObjects.push(eachQuote.stressObject);
					});
					stressObjects.sort(sortStressObjectsForStartPositions);
					stressObjects.forEach(function(eachStressObject) {
						if (stringsRangesForRender.length <= 0) {
							stringsRangesForRender.push({'startStringNumber': eachStressObject.startElementPosition.stringNumber,
														'endStringNumber': eachStressObject.endElementPosition.stringNumber,
														'stressObjectNumbers': [eachStressObject.number]})
						} else {							
							if (stringsRangesForRender[stringsRangesForRender.length-1].endStringNumber+1 < eachStressObject.startElementPosition.stringNumber) {
								stringsRangesForRender.push({'startStringNumber': eachStressObject.startElementPosition.stringNumber,
															'endStringNumber': eachStressObject.endElementPosition.stringNumber,
															'stressObjectNumbers': [eachStressObject.number]})
							} else {
								stringsRangesForRender[stringsRangesForRender.length-1].endStringNumber = eachStressObject.endElementPosition.stringNumber;
								stringsRangesForRender[stringsRangesForRender.length-1].stressObjectNumbers.push(eachStressObject.number);
							};
						};
					});
					this.quoteNode = this.createNode(['part_text', 'quote_text']);

					var contextPartNumber = 0;
					var quoteHeader = this.createNodeAndInsertInParent(this.quoteNode, ['part_content_header'], 'Контекст');
					if (stringsRangesForRender.length > 1) {
						contextPartNumber++;
					} else {
						stressObjectNumbersArray = stringsRangesForRender[0].stressObjectNumbers;
						this.createShowPositionButton(quoteHeader, source, stressObjectNumbersArray);
					};
					this.createChangeButton(quoteHeader);
					for (var eachStringsRangeNumber=0;eachStringsRangeNumber<stringsRangesForRender.length;eachStringsRangeNumber++) {
						var eachStringRange = stringsRangesForRender[eachStringsRangeNumber];
						if (contextPartNumber > 0) {
							var partContextHeader = this.createNodeAndInsertInParent(this.quoteNode, ['part_content_header', 'context_header'], 'Часть ' + contextPartNumber);
							var stressObjectNumbersArray = eachStringRange.stressObjectNumbers;
							this.createShowPositionButton(partContextHeader, source, stressObjectNumbersArray);
							contextPartNumber++;
						};
						var partContextText = this.createNodeAndInsertInParent(this.quoteNode, ['part_content_text']);
						for (var stringNumber=eachStringRange.startStringNumber;stringNumber<=eachStringRange.endStringNumber;stringNumber++) {
							var partContextString = this.createNodeAndInsertInParent(partContextText, ['part_content_string']);
							var quoteStringArray = getTextStringArray(source, stringNumber);							
							var quoteString = createWordsElements(quoteStringArray, stringNumber);
							partContextString.append(quoteString);
						};						
					};
					this.htmlCode.appendChild(this.quoteNode);

					var textPart = this.quoteNode;
					stressObjects.forEach(function(eachStressObject) {						
						eachStressObject.renderStress(textPart);
					});
				};
			};

			this.createMediaNode = function() {
				this.mediaNode = this.createNode(['part_media', 'main_media']);
				this.mainPartNode = this.mediaNode;
				this.mediaHeader = this.createNodeAndInsertInParent(this.mediaNode, ['part_content_header']);
				this.partMainNodeHeader = this.mediaHeader;

				this.createNodeAndInsertInParent(this.mediaHeader, ['part_number'], this.part.number);
				this.partTitleNode = this.createNodeAndInsertInParent(this.mediaHeader, ['part_content_title']);
				if (this.part.number <= this.knowlegeElement.stepsProps.length) {
					var partTitle = this.part.stepProps.title;
					this.partTitleNode.innerHTML = partTitle;
					if (part.quote) {					
						var mediaTotalNumber = this.part.quote[0].total_number;
						var mediaTitle = getMediaString('media_title', mediaTotalNumber);
						this.mediaTitleNode = this.createNodeAndInsertInParent(this.mediaHeader, ['part_media_title'], mediaTitle);
						var mediaElement = getMediaElementWithTotalNumber(mediaTotalNumber);
						this.filmPositionerNode = this.createNodeAndInsertInParent(this.mediaNode, ['film-postioner']);
						this.filmPositionerNode.dataset.media_total_number = mediaElement.total_number;
						this.filmPositionerNode.dataset.media_type = mediaElement.type;
						this.filmPositionerNode.title = mediaTitle;
						var previewImage = mediaElement.previewImageElement.cloneNode();
						previewImage.classList.remove('media_saved_stressed');
						this.mediaTitleNode.dataset.media_total_number = mediaElement.total_number;
						this.mediaTitleNode.dataset.media_type = mediaElement.type;
						this.mediaTitleNode.onclick = window.showGallery;
						previewImage.onclick = window.showGallery;
						this.filmPositionerNode.append(previewImage);
						this.createAddCommentButton();
						this.createChangeButton(this.mediaHeader);
						this.createDeleteButton();
					} else {

						this.createCompleteButton();
						this.changeElementPartHeaderCompletion();

					};
				} else {
					var partTitle = this.part.title; 
				};
				if (this.commentNode) {
					this.htmlCode.insertBefore(this.mediaNode, this.commentNode);
				} else {
					this.htmlCode.appendChild(this.mediaNode);
				};
				return this.mediaNode;
			};

			this.createPartNode = function() {

				var partClasses = ['knowlege_element_part'];
				partClasses.push(this.part.type); 
				this.htmlCode = this.createNode(partClasses);
				switch (this.part.type) {
					case 'text':
						this.createMainTextNode();
						this.createCommentNode();
						this.createQuoteNode();
						break;
					case 'media':
						this.createMediaNode();
						this.createCommentNode();
						break;
				};
			};

			this.part = part;

			this.knowlegeElementHtmlNode = this.part.knowlegeElement.htmlNode;

			this.knowlegeElement = this.part.knowlegeElement;

			this.createPartNode();
		};

		this.htmlNode = new ElementPartHtmlNodeConstructor(this);
		return this.htmlNode.htmlCode;
	};

	this.extractMainTextFromQuotes = function() {
		var text = [];
		this.quote.forEach(function(eachQuote) {
			text.push(eachQuote.stressObject.extractTextFromSource());
		});
		return text.join(' ');
	};

	this.extractMainTextFromQuotesAndSave = function() {
		if (this.type == 'text' && this.quote != null) {
			this.data = this.extractMainTextFromQuotes();
		};
	};

	this.refreshTextPart = function() {
		this.extractMainTextFromQuotesAndSave();
		this.refreshMainText();
		this.refreshTextQuote();
	};

	this.changePartContent = function(event) {

		var part = definePart(event);
		var textTypeClassList = event.target.parentElement.parentElement.classList;
		if (part.type == 'text') {
			if (textTypeClassList.contains('main_text')) {
				part.changeMainText();
			} else if (textTypeClassList.contains('comment_text')) {
				part.changeCommentText();
			} else if (textTypeClassList.contains('quote_text')){
				part.changeTextQuote();
			};
		} else if (part.type = 'media') {
			if (textTypeClassList.contains('main_media')) {
				part.changeMediaPart();
			} else if (textTypeClassList.contains('comment_text')) {
				part.changeCommentText();
			};
		};
	};

	this.inputText = function(text, isComment='') {
		var title = this.stepProps.title;
		if (isComment) {
			isComment = 'комментария'	
		};
		return prompt('Введите текст ' + isComment + ' для ' + title, text);
	};

	this.changeMainText = function() {
		text = this.inputText(this.htmlNode.mainTextContentElement.innerHTML);
		if (text) {
			this.data = text;
			this.refreshMainText();
		};
	};

	this.refreshMainText = function() {
		this.htmlNode.mainTextContentElement.innerHTML = this.data;
	};

	this.changeCommentText = function() {
		text = this.inputText(this.htmlNode.commentContentElement.innerHTML);
		if (text) {
			this.comment = text;
			this.refereshCommentText();
		};
	};

	this.refereshCommentText = function() {
		this.htmlNode.commentContentElement.innerHTML = this.comment;
	};

	this.changeTextQuote = function() {
		var changeTextQuoteConfirm = confirm('Изменить контекст цитаты?');
		if (changeTextQuoteConfirm) {
			var event = {'target': this.htmlNode.showPositionsButton};
			findAndStressObjectsInText(event);
			this.markPreviousTextQuotesInDocument();
			this.deleteAllTextQuotes();
			this.processType = 'change';
			this.knowlegeElement.elementPart = this;
			window.knowlegeElement = this.knowlegeElement;
			this.getTextQuoteStep();
		};
	};

	this.refreshTextQuote = function() {		
		this.htmlNode.htmlCode.removeChild(this.htmlNode.quoteNode);
		this.htmlNode.createQuoteNode();
	};

	this.addComment = function(event) {
		var part = definePart(event);
		text = part.inputText('', true);
		if (text) {
			part.comment = text;
			part.htmlNode.createCommentNode();
			part.htmlNode.removeAddCommentButton();
		};
	};

	this.deleteComment = function(event) {
		part = definePart(event);
		var toDelete = confirm('Удалить комментарий');
		if (toDelete) {
			part.comment = '';
			part.htmlNode.createAddCommentButton();
			part.htmlNode.removeCommentNode();

		};
	};

	this.deleteTextQuote = function(quoteNumbersForDeleteArray) {
		for (quoteNumberInArray=0;quoteNumberInArray<quoteNumbersForDeleteArray.length;quoteNumberInArray++) {

			var stressObject = this.quote[quoteNumbersForDeleteArray[quoteNumberInArray]-1].stressObject;
			this.quote.splice(quoteNumbersForDeleteArray[quoteNumberInArray]-1, 1);
			stressObject.deleteStressObject();
		};
	};

	this.deleteAllTextQuotes = function() {
		this.quote.forEach(function(eachQuote) {
			eachQuote.stressObject.deleteStressObject();			
		});
		this.quote = [];
	};

	this.markPreviousTextQuotesInDocument = function() {

		this.previousTextQuote = [];
		for (var quoteNumber=0;quoteNumber<this.quote.length;quoteNumber++) {
			var copyStressObject = new StressObjectConstructor;
			this.quote[quoteNumber].stressObject.stressClassName = stressClassesNames.saved_stressed; 
			var stressObject = this.quote[quoteNumber].stressObject;
			copyStressObject.copyElementsPositionsToThisStressObject(stressObject);
			copyStressObject.markStressObject();
			delete this.quote[quoteNumber].stressObject;
			var previousTextQuote = copyObject(this.quote[quoteNumber]);
			previousTextQuote.stressObject = copyStressObject;
			this.previousTextQuote.push(previousTextQuote);
			this.quote[quoteNumber].stressObject = stressObject;
		};
	};

	this.removeMarkedPreviousTextQuoteInDocument = function() {
		this.previousTextQuote.forEach(function(eachStressObject) {
			eachStressObject.stressObject.removeStressForStressObject();
		});
		this.previousTextQuote = [];
	};

	this.saveNewTextQuote = function(stressObjectForSaving) {
		var quoteNumber = this.quote.length + 1;
		this.quote.push(stressObjectForSaving.getPositionsDictionary(quoteNumber));
		var stressNumber = savedStressedObjects[stressObjectForSaving.textSource].length + 1;
		stressObjectForSaving.number = stressNumber;
		stressObjectForSaving.stressClassName = stressClassesNames.saved_stressed;
		stressObjectForSaving.elementPart = this;
		stressObjectForSaving.renderStress();
		savedStressedObjects[stressObjectForSaving.textSource].push(stressObjectForSaving);
		return true;
	};

	this.changeMediaPart = function() {
		var changeMediaQuoteConfirm = confirm('Изменить медиа-объект?');
		if (changeMediaQuoteConfirm) {
			var event = {'target': this.htmlNode.mediaTitleNode};
			showGallery(event);
			this.markPreviousMediaQuotesInDocument();
			this.deleteAllMediaQuotes();
			this.quote = [];
			this.processType = 'change';
			this.knowlegeElement.elementPart = this;
			window.knowlegeElement = this.knowlegeElement;
			this.getMediaStep();
		};
	};

	this.markPreviousMediaQuotesInDocument = function() {
		this.previousMediaQuote = [];
		for (var quoteNumber=0;quoteNumber<this.quote.length;quoteNumber++) {
			var eachQuote = this.quote[quoteNumber];
			changePreviewImageEverywhere(this.quote[quoteNumber].total_number, 'add', stressClassName='media_temporary_stressed');
			var copyQuote = copyObject(eachQuote);
			this.previousMediaQuote.push(copyQuote);

		};
	};

	this.removeMarkPreviousMediaQuotesInDocument = function() {
		for (var quoteNumber=0;quoteNumber<this.previousMediaQuote.length;quoteNumber++) {
			changePreviewImageEverywhere(this.previousMediaQuote[quoteNumber].total_number, 'remove', stressClassName='media_temporary_stressed');
		};
	};

	this.deleteAllMediaQuotes = function() {
		for (var quoteNumber=0;quoteNumber<this.quote.length;quoteNumber++) {
			deleteSavedStressedMediaWithTotalNumber(this.quote[quoteNumber].total_number, 'remove');
		};
	};

	this.refreshMedia = function() {
		this.htmlNode.htmlCode.removeChild(this.htmlNode.mediaNode);
		this.htmlNode.createMediaNode();
	};

	this.deleteElementPartEvent = function(event) {
		var kEandEPNumberList = extractKnowlegeElementNumberAndElementPartNumberFromEvent(event);
		var elementPartNumber = kEandEPNumberList[1];
		var toDelete = confirm('Удалить часть № ' + elementPartNumber);
		if (toDelete) {
			var elementPart = getElementPartFromSavedKnowlegeElement(kEandEPNumberList);

			elementPart.deleteElementPart();
		};
	};

	this.deleteElementPart = function() {
		this.knowlegeElement.addDeletedElementPart(this.number);
		this.knowlegeElement.htmlNode.changeElementHeaderCompletion();
		this.clearPartContent();
		this.refreshHtmlNode();
	};

	this.refreshHtmlNode = function() {
		var partContainer = this.knowlegeElement.htmlNode.partsElementsContainer;
		partContainer.replaceChild(this.createHtmlNode(), partContainer.children[this.number-1]);
	};

	this.completeElementPart = function() {
		var kEandEPNumberList = extractKnowlegeElementNumberAndElementPartNumberFromEvent(event);
		var elementPart = getElementPartFromSavedKnowlegeElement(kEandEPNumberList);
		elementPart.processType = 'complete';
		console.log(elementPart.type)
		if (['media', 'quote'].indexOf(elementPart.stepProps.type) >= 0) {
			var openDirection = false;
			var titles = Object.keys(parts);
			var text = ['Выберете вкладку для перехода:', '0: Галлерея'];
			for (var number=0;number<titles.length;number++) {
				text.push(number + 1 + ': ' + parts[titles[number]].title);
			};
			text = text.join('\n');
			openDirectionNumber = Number(prompt(text, 1));
			console.log(openDirectionNumber);
			switch (openDirectionNumber) {
				case null:
					openDirection = false;
					break;
				case 0:
					openDirection = 'gallery';
					break;
				default:
					openDirection = titles[openDirectionNumber-1];
					break;
			};
			switch (openDirection) {
				case false:
					break;
				case 'gallery':
					event.target.dataset.media_total_number = 0;
					showGallery(event);
					break;
				default:
					event.target.dataset.text_source = openDirection;
					openPart(event);
					break;
			};
		};
		window.knowlegeElement = elementPart.knowlegeElement;
		window.knowlegeElement.elementPart = elementPart;
		elementPart.startAddElementPart();
	};

	this.fininshCompeleteElementPart = function() {
		this.stopAddElementPart();
		this.knowlegeElement.removeDeletedElementParts(this.number);
		this.refreshHtmlNode();
		this.knowlegeElement.htmlNode.changeElementHeaderCompletion();
	};

	this.startAddElementPart = function() {
		var partFunctions = this.partsHandlersFunctions[currentModeSettings.steps[this.number-1].type];

		partFunctions.createFunction();
	};

	this.stopAddElementPart = function() {

		this.partsHandlersFunctions[currentModeSettings.steps[this.number-1].type].stopFunction();
	};

	this.getTextQuoteStep = function() {

		activateDocumentSelection(eventFocusElement, eventFocusElement, eventStressElements, eventStressElements);
		wait = setTimeout(function() {}, 60000);

		elementPart = window.knowlegeElement.elementPart;
		if (!elementPart.processType || elementPart.processType == 'complete') { 
			elementPart.type = 'text';
			elementPart.quote = [];
			elementPart.data = '';
		};

		StressObjectsArrayConstructor = function(stressClassName) {

			this.array = new Array;
			this.stressClassName = stressClassName;

			this.addStressObject = function(startElementPosition, endElementPosition, operation) {

				var stressObject = new StressObjectConstructor(this.stressClassName);
				stressObject.setElementsPositions(startElementPosition, endElementPosition);
				stressObject.setOperation(operation);
				this.array.push(stressObject);
			};
		};

		var stressObject = new StressObjectConstructor('stressed');	
		var temporaryStressObject = new StressObjectConstructor('temporary_stressed');
		var currentElementPosition = new ElementPositionConstructor();
		var stressObjectsStack = [];
		var separatedStressMode = false;

		document.addEventListener('keydown', function(event) {
			if (event.key == 'Control') {

				separatedStressMode = true;
			};
		});

		document.addEventListener('keyup', function(event) {
			if (event.key == 'Control') {
				separatedStressMode = false;
			};
		});

		function eventStressElements(event) {

			if (event.type == 'mousedown') { 
				elementType = checkAndHandleElement(event.target, 'startTemporaryStress');			
				if (elementType) {
					temporaryStressObject.setStartPositions(currentElementPosition.copyPositionObject());

					temporaryStress(currentElementPosition);
				};
			};

			if (event.type == 'mouseup' && temporaryStressObject.hasElementsPositions()) {

				temporaryStressObject.checkAndChangeElementsPositions();
				temporaryStressObject.getElementsPositions();
				temporaryStressObject.setOperation('remove');
				temporaryStressObject.renderStress();

				stressObject.copyElementsPositionsToThisStressObject(temporaryStressObject);
				temporaryStressObject.erase();
				stressObject.renderStress();

				var stackStressObject = new StressObjectConstructor();
				stackStressObject.copyStressObject(stressObject);
				stressObject.erase();

				var stressObjectsNumbersForRemoveFromStack = [];
				for (var stressObjectNumber=0;stressObjectNumber<stressObjectsStack.length;stressObjectNumber++) {
					if (stackStressObject.defineOverlap(stressObjectsStack[stressObjectNumber])) {
						stressObjectsStack[stressObjectNumber].mergeStress(stackStressObject);
						stressObjectsNumbersForRemoveFromStack.push(stressObjectNumber);
					};
				};
				stressObjectsNumbersForRemoveFromStack.forEach(function(eachNumber){
					delete stressObjectsStack[eachNumber];
				});
				stressObjectsStack.push(stackStressObject);
				var sortStressObjectsStackMode = true;
				if (sortStressObjectsStackMode) {
					stressObjectsStack.sort(sortStressObjectsForStartPositions);
				};

				if (!separatedStressMode) {

					var toSave = false;
					if (!elementPart.processType) { 
						var wordsArray = [];
						stressObjectsStack.forEach(function(eachStressObjectsStack) {

							wordsArray.push(eachStressObjectsStack.extractTextFromSource());;
						});
						var textForSaving = wordsArray.join(' ')
						textForSaving = prompt('Сохранить цитату и текст для ' + elementPart.stepProps.title + '?', textForSaving);
						if (textForSaving) {
							toSave = true;
						};
					} else { 
						toSave = true;
					};

					if (toSave) {
						if (stressObjectsStack.length <= 1) { 
							console.log('single stress');
							var stressObjectForSaving = new StressObjectConstructor;
							stressObjectForSaving.copyElementsPositionsToThisStressObject(stressObjectsStack[0]);

							toSave = checkAndSaveSingleStress(stressObjectForSaving); 
						} else { 
							console.log('multipule stress');
							toSave = checkAndSaveMultipleStress();
						};
					};

					stressObjectsStack.forEach(function(eachStressObject) {
						eachStressObject.removeStressInText(); 
					});

					stressObjectsStack = [];
					if (toSave) {
						clearTimeout(wait);
						if (!elementPart.processType) {

							elementPart.data = textForSaving;

							elementPart.knowlegeElement.addNextPart();
						} else if (elementPart.processType == "change") {
							var finishChangeText = confirm('Изменить контекст цитаты для "' + elementPart.data + '"?');
							if (finishChangeText) {
								elementPart.stopTextQuoteStep();
								elementPart.refreshTextQuote();
								elementPart.removeMarkedPreviousTextQuoteInDocument();
								var mainText = elementPart.extractMainTextFromQuotes();
								var changeQuote = prompt('Изменить основной текст с "' + elementPart.data +'"?\n', mainText);
								if (changeQuote) {
									elementPart.data = mainText;
									elementPart.refreshMainText();
									var changeComment = confirm('Изменить комментарий?');
									if (changeComment) {
										elementPart.changeCommentText();
									};
								};
								elementPart.knowlegeElement.deactiveElement();
								elementPart.knowlegeElement.backToKnowlegeElementsPart();
							} else {
								elementPart.deleteAllTextQuotes();
							};
						} else { 
							var mainText = elementPart.extractMainTextFromQuotes();
							var fininshCompeleteText = prompt('Сохранить цитату и текст для ' + elementPart.stepProps.title, mainText);
							if (fininshCompeleteText) {
								elementPart.data = fininshCompeleteText;
								elementPart.fininshCompeleteElementPart();

								elementPart.knowlegeElement.deactiveElement();
								elementPart.knowlegeElement.backToKnowlegeElementsPart();
							} else {
								elementPart.deleteAllTextQuotes();
							};
						};
					};
				};
			};
			return false;
		};

		function eventFocusElement(event) {
			console.log(event.type);

			if (event.type == 'mouseover') {
				elementType = checkAndHandleElement(event.target, 'focus');

				var isNotFalseOrSpace = false;
				if (elementType != false) {
					if (elementType.indexOf('space') < 0) {
						isNotFalseOrSpace = true;
					};

				};	
				if (temporaryStressObject.startElementPosition.hasElementPosition() && isNotFalseOrSpace) {
					temporaryStress(currentElementPosition);

				};
			};
			if (event.type == 'mouseout') {

			};
		};

		function temporaryStress(currentElementPosition) {
			outputToLog('_________temporaryStress___________');
			var startElementPosition = temporaryStressObject.startElementPosition;
			var previousElementPosition = temporaryStressObject.endElementPosition;
			var arrayTemporaryStressObjects = new StressObjectsArrayConstructor('temporary_stressed');
			outputToLog('currentElementPosition.elementType');
			outputToLog(currentElementPosition.elementType);
			outputToLog('startElementPosition.elementType');
			outputToLog(previousElementPosition.elementType);
			outputToLog('startElementPosition.elementType');
			outputToLog(previousElementPosition.elementType);

			var startToPreviousDirection = startElementPosition.defineElementDirection(previousElementPosition);
			var startToCurrentDirection = startElementPosition.defineElementDirection(currentElementPosition);
			var previousToCurrentDirection = previousElementPosition.defineElementDirection(currentElementPosition);

			outputToLog('startToPreviousDirection');
			outputToLog(startToPreviousDirection);
			outputToLog('startToCurrentDirection');
			outputToLog(startToCurrentDirection);
			outputToLog('previousToCurrentDirection');
			outputToLog(previousToCurrentDirection);

			temporaryStressObject.endElementPosition = currentElementPosition.copyPositionObject();

			if (startToPreviousDirection == 'hold' && startToCurrentDirection == 'hold' && previousToCurrentDirection == 'hold') {
				outputToLog('MODE 0');
				if (startElementPosition.elementType.indexOf('text_button') >= 0) { 
					if (currentElementPosition.elementType.indexOf('text_button') >= 0) { 
						outputToLog('MODE 0.1');
						arrayTemporaryStressObjects.addStressObject(startElementPosition.getReadyElement(false), currentElementPosition.getReadyElement(true)); 
					} else { 
						outputToLog('MODE 0.2');
						arrayTemporaryStressObjects.addStressObject(currentElementPosition.incrementElementPosition(), startElementPosition.getReadyElement(true), 'remove');
					};
				} else { 
					if (currentElementPosition.elementType.indexOf('left') >= 0) { 
						outputToLog('MODE 0.3');
						arrayTemporaryStressObjects.addStressObject(currentElementPosition.getReadyElement(false), currentElementPosition.getReadyElement(true)); 
					} else if (currentElementPosition.elementType.indexOf('right') >= 0) { 
						if (!startElementPosition.isLastWordNumberInString()) {
							outputToLog('MODE 0.4.1');
							arrayTemporaryStressObjects.addStressObject(startElementPosition.incrementElementPosition(), currentElementPosition.getReadyElement(true)); 
						} else {
							outputToLog('MODE 0.4.2');
						};
					} else {
						outputToLog('MODE 0.5');
						arrayTemporaryStressObjects.addStressObject(startElementPosition.getReadyElement(false), currentElementPosition.getReadyElement(true)); 
					};
				};	
			} else if (['direct', 'hold'].indexOf(startToPreviousDirection) >= 0 && startToCurrentDirection == 'direct' && ['direct', 'hold'].indexOf(previousToCurrentDirection) >= 0) {
				outputToLog('MODE 1');
				if (previousElementPosition.elementType.indexOf('text_button') != -1) { 
					if (currentElementPosition.elementType.indexOf('text_button') != -1) { 
						outputToLog('MODE 1.1');
						arrayTemporaryStressObjects.addStressObject(previousElementPosition.incrementElementPosition(), currentElementPosition.getReadyElement(true)); 
					} else { 
						outputToLog('MODE 1.2');
						if (currentElementPosition.defineStringDirection(previousElementPosition) == 'hold') {
							outputToLog('MODE 1.2.1');
							if (!currentElementPosition.isLastWordNumberInString()) {
								outputToLog('MODE 1.2.1.1');
								arrayTemporaryStressObjects.addStressObject(currentElementPosition.incrementElementPosition(), previousElementPosition.getReadyElement(true), 'remove'); 
							} else {
								outputToLog('MODE 1.2.1.2');
							};
						} else {
							outputToLog('MODE 1.2.2');
							arrayTemporaryStressObjects.addStressObject(previousElementPosition.incrementElementPosition(), currentElementPosition.getReadyElement(true)); 
						};
					};
				} else { 
					if (currentElementPosition.elementType.indexOf('text_button') != -1) { 
						outputToLog('MODE 1.3');
						arrayTemporaryStressObjects.addStressObject(previousElementPosition.incrementElementPosition(), currentElementPosition.getReadyElement(true)); 
					} else { 
						outputToLog('MODE 1.4');
						arrayTemporaryStressObjects.addStressObject(previousElementPosition.incrementElementPosition(), currentElementPosition.getReadyElement(true)); 
					};
				};
			} else if (startToPreviousDirection == 'direct' && ['direct', 'hold'].indexOf(startToCurrentDirection) >= 0 && previousToCurrentDirection == 'reverse') {
				outputToLog('MODE 2');
				if (previousElementPosition.elementType.indexOf('text_button') != -1) { 
					if (currentElementPosition.elementType.indexOf('text_button') != -1) { 
						outputToLog('MODE 2.1');
						arrayTemporaryStressObjects.addStressObject(currentElementPosition.incrementElementPosition(), previousElementPosition.getReadyElement(true), 'remove'); 
					} else { 
						if (currentElementPosition.elementType.indexOf('word') != -1) { 
							outputToLog('MODE 2.2');
						};
						arrayTemporaryStressObjects.addStressObject(currentElementPosition.incrementElementPosition(), previousElementPosition.getReadyElement(true), 'remove'); 
					};
				} else { 
					if (currentElementPosition.elementType.indexOf('text_button') != -1) { 
						outputToLog('MODE 2.3');
						if (currentElementPosition.defineStringDirection(previousElementPosition) == 'hold') {
							outputToLog('MODE 2.3.1');
							arrayTemporaryStressObjects.addStressObject(previousElementPosition.incrementElementPosition(), currentElementPosition.getReadyElement(true)); 
						} else {
							outputToLog('MODE 2.3.2');
							arrayTemporaryStressObjects.addStressObject(currentElementPosition.incrementElementPosition(), previousElementPosition.getReadyElement(true), 'remove'); 
						};
					} else { 
						outputToLog('MODE 2.4');
						arrayTemporaryStressObjects.addStressObject(currentElementPosition.incrementElementPosition(), previousElementPosition.getReadyElement(true), 'remove'); 
					};
				};
			} else if (['reverse', 'hold'].indexOf(startToPreviousDirection) >= 0 && ['direct', 'hold'].indexOf(startToCurrentDirection) >= 0 && previousToCurrentDirection == 'direct') {
				outputToLog('MODE 3');
				if (previousElementPosition.elementType.indexOf('text_button') != -1) { 
					if (currentElementPosition.elementType.indexOf('text_button') != -1) { 
						outputToLog('MODE 3.1.1');
						arrayTemporaryStressObjects.addStressObject(previousElementPosition.getReadyElement(false), startElementPosition.decrementElementPosition(), 'remove'); 
						if (currentElementPosition.defineStringDirection(startElementPosition) != 'hold') {
							outputToLog('MODE 3.1.2');
							arrayTemporaryStressObjects.addStressObject(startElementPosition.incrementElementPosition(), currentElementPosition.getReadyElement(true)); 
						};
					} else { 
						if (currentElementPosition.elementType.indexOf('word') != -1) { 
							outputToLog('MODE 3.2');
							arrayTemporaryStressObjects.addStressObject(previousElementPosition.getReadyElement(false), startElementPosition.decrementElementPosition(), 'remove'); 
							if (startToCurrentDirection != 'hold') {
								outputToLog('MODE 3.2.1');
								arrayTemporaryStressObjects.addStressObject(startElementPosition.incrementElementPosition(), currentElementPosition.getReadyElement(true)); 
							} else {
								outputToLog('MODE 3.2.2');
							};
						};
					};
				} else { 
					if (currentElementPosition.elementType.indexOf('text_button') != -1) { 
						outputToLog('MODE 3.3');
						arrayTemporaryStressObjects.addStressObject(previousElementPosition.getReadyElement(false), startElementPosition.decrementElementPosition(), 'remove'); 
						arrayTemporaryStressObjects.addStressObject(startElementPosition.incrementElementPosition(), currentElementPosition.getReadyElement(true)); 
					} else { 
						outputToLog('MODE 3.4.1');
						arrayTemporaryStressObjects.addStressObject(previousElementPosition.getReadyElement(false), startElementPosition.decrementElementPosition(), 'remove'); 
						if (startToCurrentDirection != 'hold') {
							outputToLog('MODE 3.4.2');
							arrayTemporaryStressObjects.addStressObject(startElementPosition.incrementElementPosition(), currentElementPosition.getReadyElement(true)); 
						};
					};
				};		
			} else if (['reverse', 'hold'].indexOf(startToPreviousDirection) >= 0 && startToCurrentDirection == 'reverse' && ['reverse', 'hold'].indexOf(previousToCurrentDirection) >= 0) {
				outputToLog('MODE 4');
				if (previousElementPosition.elementType.indexOf('text_button') != -1) { 
					if (currentElementPosition.elementType.indexOf('text_button') != -1) { 
						outputToLog('MODE 4.1');
						arrayTemporaryStressObjects.addStressObject(currentElementPosition.getReadyElement(false), previousElementPosition.decrementElementPosition());
					} else { 
						outputToLog('MODE 4.2');
						if (previousElementPosition.elementType.indexOf('right') != -1) {
							outputToLog('MODE 4.2.1');
							arrayTemporaryStressObjects.addStressObject(previousElementPosition.getReadyElement(false), currentElementPosition.decrementElementPosition(), 'remove');
						} else {
							if (previousToCurrentDirection != 'hold') {
								outputToLog('MODE 4.2.2.1');
								arrayTemporaryStressObjects.addStressObject(currentElementPosition.getReadyElement(false), previousElementPosition.decrementElementPosition());
							} else {
								outputToLog('MODE 4.2.2.2');
							};
						};
					};
				} else { 
					if (currentElementPosition.elementType.indexOf('text_button') != -1) { 
						outputToLog('MODE 4.3');
						arrayTemporaryStressObjects.addStressObject(currentElementPosition.getReadyElement(false), currentElementPosition.getReadyElement(true));
						temporaryStressObject.endElementPosition = currentElementPosition.getReadyElement(false);
					} else { 
						outputToLog('MODE 4.4');
						arrayTemporaryStressObjects.addStressObject(currentElementPosition.getReadyElement(false), previousElementPosition.decrementElementPosition());
					};
				};
			} else if (['direct', 'hold'].indexOf(startToPreviousDirection) >= 0 && ['reverse', 'hold'].indexOf(startToCurrentDirection) >= 0 && previousToCurrentDirection == 'reverse') {
				outputToLog('MODE 5');
				if (previousElementPosition.elementType.indexOf('text_button') != -1) { 
					if (currentElementPosition.elementType.indexOf('text_button') != -1) { 
						outputToLog('MODE 5.1');
						arrayTemporaryStressObjects.addStressObject(currentElementPosition.getReadyElement(false), startElementPosition.incrementElementPosition());
						arrayTemporaryStressObjects.addStressObject(startElementPosition.incrementElementPosition(), previousElementPosition.getReadyElement(true), 'remove');
					} else { 
						outputToLog('MODE 5.2');
						arrayTemporaryStressObjects.addStressObject(currentElementPosition.getReadyElement(false), startElementPosition.decrementElementPosition());
						arrayTemporaryStressObjects.addStressObject(startElementPosition.incrementElementPosition(), previousElementPosition.getReadyElement(true), 'remove');
					};
				} else { 
					if (currentElementPosition.elementType.indexOf('text_button') != -1) { 
						outputToLog('MODE 5.3');
						arrayTemporaryStressObjects.addStressObject(currentElementPosition.getReadyElement(false), startElementPosition.decrementElementPosition());
						temporaryStressObject.startElementPosition = previousElementPosition.copyPositionObject();
					} else { 
						outputToLog('MODE 5.4');
						arrayTemporaryStressObjects.addStressObject(currentElementPosition.getReadyElement(false), startElementPosition.incrementElementPosition());
						arrayTemporaryStressObjects.addStressObject(startElementPosition.incrementElementPosition(), previousElementPosition.getReadyElement(true), 'remove');
					};
				};
			} else if (startToPreviousDirection == 'reverse' && ['reverse', 'hold'].indexOf(startToCurrentDirection) >= 0 && previousToCurrentDirection == 'direct') {
				outputToLog('MODE 6');
				if (previousElementPosition.elementType.indexOf('text_button') != -1) { 
					if (currentElementPosition.elementType.indexOf('text_button') != -1) { 
						outputToLog('MODE 6.1');
						arrayTemporaryStressObjects.addStressObject(previousElementPosition.getReadyElement(false),currentElementPosition.decrementElementPosition(), 'remove'); 
					} else { 
						if (currentElementPosition.elementType.indexOf('word') != -1) { 
							outputToLog('MODE 6.2');
						};
						arrayTemporaryStressObjects.addStressObject(previousElementPosition.getReadyElement(false),currentElementPosition.decrementElementPosition(), 'remove'); 
					};
				} else { 
					if (currentElementPosition.elementType.indexOf('text_button') != -1) { 
						outputToLog('MODE 6.3');
						if (currentElementPosition.defineStringDirection(previousElementPosition) == 'hold') {
							outputToLog('MODE 6.3.1');
							arrayTemporaryStressObjects.addStressObject(previousElementPosition.incrementElementPosition(), currentElementPosition.getReadyElement(true)); 
						} else {
							outputToLog('MODE 6.3.2');
							arrayTemporaryStressObjects.addStressObject(previousElementPosition.getReadyElement(false),currentElementPosition.decrementElementPosition(), 'remove'); 
						};
					} else { 
						outputToLog('MODE 6.4');
						arrayTemporaryStressObjects.addStressObject(previousElementPosition.getReadyElement(false),currentElementPosition.decrementElementPosition(), 'remove'); 
					};
				};
			};

			arrayTemporaryStressObjects.array.forEach(function(partStressObject) {
				partStressObject.checkAndChangeElementsPositions();

				partStressObject.renderStress();
			});
		};

		function getElementType(element, stressMode) {

			function isTextContainer(element) {
				return element.classList.contains('text_container');
			};

			var elementType = false;
			if (element.classList.contains(stringButtonClassName)) {
				if (isTextContainer(element.parentElement.parentElement)) {
					if (element.classList.contains('right')) {
						elementType = [stringButtonClassName, 'right'];
					} else {
						elementType = [stringButtonClassName, 'left'];
					};
				};
			} else if (element.classList.contains('word')) {
				if (isTextContainer(element.parentElement.parentElement.parentElement)) {
					elementType = ['text', 'word'];
				};
			} else if (element.classList.contains('space')) {
				if (isTextContainer(element.parentElement.parentElement.parentElement)) {
					elementType = ['text', 'space'];
				};
			};

			if (elementType) {
				blinkStressElement(element, stressMode);
			};		
			return elementType;
		};

		function checkAndHandleElement(element, stressMode) {
			var elementType = getElementType(element, stressMode);
			if (elementType) {
				var cellElement = element;
				if (elementType.indexOf('word') >= 0) {
					var cellElement = element.parentElement;
				};
				var textSource = cellElement.parentElement.parentElement.dataset.source;

				var stringNumber = element.dataset.string;
				var wordNumber = element.dataset.word;

				currentElementPosition.setNewPosition(textSource, stringNumber, wordNumber, elementType);		
			};
			return elementType;
		};

		function checkAndSaveSingleStress(stressObjectForSaving) {

			if (currentModeSettings.merge && !elementPart.processType) {
				return checkOverlappedSavedObjectsAndSaveSingleStress(stressObjectForSaving);
			} else {
				elementPart.saveNewTextQuote(stressObjectForSaving);
				return true;

			};
		};

		function checkOverlappedSavedObjectsAndSaveSingleStress(stressObjectForSaving) {

			if (!elementPart.processType) {
				var overlappedSavedStressObjects = getOverlappedSavedStressObjectsForSingle(stressObjectForSaving);
			};

			if (!elementPart.processType && overlappedSavedStressObjects.length) {
				var overlappedQuotes = getOverlappedQuotes(overlappedSavedStressObjects);

				return mergeOrSaveSingleStress(stressObjectForSaving, overlappedQuotes);
			} else {

				elementPart.saveNewTextQuote(stressObjectForSaving);
				return true;

			};
		};

		function checkAndSaveMultipleStress() {
			if (currentModeSettings.merge == true) { 
				overlappedSavedStressObjects = [];
				stressObjectsStack.forEach(function(eachStressObject) {
					var eachOverlappedSavedStressObjects = getOverlappedSavedStressObjectsForSingle(eachStressObject);
					overlappedSavedStressObjects = overlappedSavedStressObjects.concat(eachOverlappedSavedStressObjects);
				});
				if (overlappedSavedStressObjects.length < 1) { 
					console.log('no overlaps');
					toSave = prepareAndSaveMultipuleStressesInStack(stressObjectsStack);
				} else { 
					console.log('overlaps');
					toSave = mergeOrSaveMultipuleStressesInStack(overlappedSavedStressObjects);
				};
			} else {  
				toSave = prepareAndSaveMultipuleStressesInStack(stressObjectsStack);
			};
			return toSave;
		};

		function prepareAndSaveMultipuleStressesInStack(stressObjectsArray) {
			stressObjectsArray.forEach(function(eachStressObject) {
				var stressObjectForSaving = new StressObjectConstructor;
				stressObjectForSaving.copyElementsPositionsToThisStressObject(eachStressObject);

				elementPart.saveNewTextQuote(stressObjectForSaving);
			});
			return true;
		};

		function getDictOverlappedSavedStressObjects(stressObjectForSaving) {
			var overlappedSavedStressObjectsDict = {};
			savedStressedObjects[stressObjectForSaving.textSource].forEach(function(eachSavedStressObject) {

				var isOverlaped = stressObjectForSaving.defineOverlap(eachSavedStressObject);

				if (isOverlaped) {
					overlappedSavedStressObjectsDict[eachSavedStressObject.number] = eachSavedStressObject;
				};
			});
			return overlappedSavedStressObjectsDict;
		};

		function getOverlappedSavedStressObjectsForSingle(stressObjectForSaving) {
			var overlappedSavedStressObjects = [];
			savedStressedObjects[stressObjectForSaving.textSource].forEach(function(eachSavedStressObject) {

				var isOverlaped = stressObjectForSaving.defineOverlap(eachSavedStressObject);

				if (isOverlaped) {
					overlappedSavedStressObjects.push(eachSavedStressObject);
				};
			});
			return overlappedSavedStressObjects;
		};

		function getOverlappedQuotes(overlappedSavedStressObjects) {
			var overlappedQuotes = {};
			var quoteNumber = 0;
			for (var eachThisStressObjectNumber=0;eachThisStressObjectNumber<overlappedSavedStressObjects.length;eachThisStressObjectNumber++) {
				var eachThisSavedStressObject = overlappedSavedStressObjects[eachThisStressObjectNumber];
				var knowlegeElementNumber = eachThisSavedStressObject.getKnowlegeElementNumber();
				var elementPartNumber = eachThisSavedStressObject.getElementPartNumber();
				overlappedQuotes[knowlegeElementNumber] = {};
				overlappedQuotes[knowlegeElementNumber][elementPartNumber] = [eachThisSavedStressObject];
				for (var eachOtherStressObjectNumber=0;eachOtherStressObjectNumber<overlappedSavedStressObjects.length;eachOtherStressObjectNumber++) {
					if (eachThisStressObjectNumber != eachOtherStressObjectNumber) {
						var eachOtherSavedStressObject = overlappedSavedStressObjects[eachOtherStressObjectNumber];		
						if (eachThisSavedStressObject.isInSameQuote(eachOtherSavedStressObject)) {
							overlappedQuotes[knowlegeElementNumber][elementPartNumber].push(eachOtherSavedStressObject);
						};
					};
				};
			};
			return overlappedQuotes;
		};

		function getOverlapParams(overlappedQuotes) {
			var allOverlappedQuotesString = [];
			var numbers = {};
			var number = 0;
			for (knowlegeElementNumber in overlappedQuotes) {
				for (elementPartNumber in overlappedQuotes[knowlegeElementNumber]) {				
					number++;
					numbers[number] = [knowlegeElementNumber, elementPartNumber];
					var stressObjectsArray = overlappedQuotes[knowlegeElementNumber][elementPartNumber];
					allOverlappedQuotesString.push(createOvelappedChoosingString(number, knowlegeElementNumber, elementPartNumber, stressObjectsArray[0].elementPart.data));
				};
			};
			return [allOverlappedQuotesString.join('\n'), numbers];
		};

		function inputOverlappedNumber(allOverlappedQuotesString) {
			return prompt('Сохранить новую цитату - введите "N"\n' + 'Введите номер для слияния и нажмите ОК:\n' + allOverlappedQuotesString);
		};

		function createOvelappedChoosingString(number, knowlegeElementNumber, elementPartNumber, elementPartText) {
			var string = [number, 'KEN:' + knowlegeElementNumber, 'EPN:' + elementPartNumber, elementPartText].join(' - ');
			return string;
		};

		function mergeOrSaveSingleStress(stressObjectForSaving, overlappedQuotes) {

			var overlapParams = getOverlapParams(overlappedQuotes);
			var allOverlappedQuotesString = overlapParams[0];
			var numbers = overlapParams[1];
			var overlappedNumber = inputOverlappedNumber(allOverlappedQuotesString)
			console.log(overlappedNumber);

			if (Object.keys(numbers).indexOf(overlappedNumber) >= 0) {
				var knowlegeElementNumber = numbers[overlappedNumber][0];
				var elementPartNumber = numbers[overlappedNumber][1];
				var stressObjectsArray = overlappedQuotes[knowlegeElementNumber][elementPartNumber];
				var quoteNumbersForDeleteArray = [];
				for (var stressObjectNumber=0;stressObjectNumber<stressObjectsArray.length;stressObjectNumber++) {
					var eachStressObject = stressObjectsArray[stressObjectNumber];
					if (stressObjectNumber < stressObjectsArray.length-1) {
						quoteNumbersForDeleteArray.push(eachStressObject.quoteNumber);
					};
					stressObjectForSaving = stressObjectForSaving.mergeStress(eachStressObject, true);
				};

				stressObjectForSaving.elementPart.deleteTextQuote(quoteNumbersForDeleteArray);

				stressObjectForSaving.elementPart.refreshTextPart();
				stressObjectForSaving.renderStress();
				console.log(stressObjectForSaving.getPositionsDictionary());
				alert('Слияние c ' + createOvelappedChoosingString(overlappedNumber, knowlegeElementNumber, elementPartNumber, stressObjectForSaving.elementPart.data));
				return false;
			} else if (overlappedNumber == null) {
				return false;
			} else if (overlappedNumber.toUpperCase() == 'N') {
				elementPart.saveNewTextQuote(stressObjectForSaving);
				return true;

			} else {
				return mergeOrSaveSingleStress(stressObjectForSaving, overlappedQuotes);
			};
		};

		function mergeOrSaveMultipuleStressesInStack(overlappedSavedStressObjects) {
			var overlappedQuotes = getOverlappedQuotes(overlappedSavedStressObjects);
			var overlapParams = getOverlapParams(overlappedQuotes);
			var allOverlappedQuotesString = overlapParams[0];
			var numbers = overlapParams[1];
			var overlappedNumber = inputOverlappedNumber(allOverlappedQuotesString)

			if (Object.keys(numbers).indexOf(overlappedNumber) >= 0) {
				var knowlegeElementNumber = numbers[overlappedNumber][0];
				var elementPartNumber = numbers[overlappedNumber][1];
				var stressObjectsArray = overlappedQuotes[knowlegeElementNumber][elementPartNumber];
				stressObjectsArray = stressObjectsArray.concat(stressObjectsStack);
				stressObjectsArray.sort(sortStressObjectsForStartPositions);

				var mergedStressObjectNumbersArray = [];
				for (var stressObjectNumber=0;stressObjectNumber<stressObjectsArray.length-2;stressObjectNumber++) {
					var thisStressObject = stressObjectsArray[stressObjectNumber];
					var nextStressObject = stressObjectsArray[stressObjectNumber+1];
					if (thisStressObject.defineOverlap(nextStressObject)) {
						nextStressObject = nextStressObject.mergeStress(thisStressObject);
						stressObjectsArray[stressObjectNumber+1] = nextStressObject;
						mergedStressObjectNumbersArray.push(stressObjectNumber);
					};
				};
				var deletedStressObjects = 0;
				mergedStressObjectNumbersArray.forEach(function(eachNumberForDelete) {
					stressObjectsArray.splice(eachNumberForDelete-deletedStressObjects, 1);
					deletedStressObjects++;
				});
				var savedKnowlegeElement = findSavedKnowlegeElement(knowlegeElementNumber);
				var elementPart = savedKnowlegeElement.parts[elementPartNumber-1];
				elementPart.deleteAllTextQuotes();
				stressObjectsArray.forEach(function(eachStressObject) {
					var stressObjectForSaving = new StressObjectConstructor;
					stressObjectForSaving.copyElementsPositionsToThisStressObject(eachStressObject);
					elementPart.saveNewTextQuote(stressObjectForSaving);
				});

				elementPart.refreshTextPart();
				alert('Слияние c ' + createOvelappedChoosingString(overlappedNumber, knowlegeElementNumber, elementPartNumber, elementPart.data));
				return false;
			} else if (overlappedNumber == null) {
				return false;
			} else if (overlappedNumber.toUpperCase() == 'N') {
				return prepareAndSaveMultipuleStressesInStack(stressObjectsStack);
			} else {
				return mergeOrSaveMultipuleStressesInStack(stressObjectForSaving, overlappedQuotes);
			};
		};
	};

	this.stopTextQuoteStep = function() {
		deactivateDocumentSelection();
	};

	this.getMediaStep = function() {

		activateDocumentSelection(addFocusMedia, removeFocusMedia, stressAndSaveMediaElement, false);
		wait = setTimeout(function() {}, 60000);

		elementPart = window.knowlegeElement.elementPart;
		if (!elementPart.processType) { 

		};		

		function addFocusMedia(event) {
			if (isMediaElement(event)) {
				event.target.classList.add('media_focused');
			};
		};

		function removeFocusMedia(event) {
			if (isMediaElement(event)) {
				event.target.classList.remove('media_focused');
			};
		};

		function isAdmittedTypeMediaElement(event) {

			return elementPart.possibleDataTypes.indexOf(event.target.parentElement.dataset.media_type) >= 0;
		};

		function isFilmElement(event) {
			return event.target.tagName == 'IMG' && event.target.parentElement.classList.contains('film-postioner') && isAdmittedTypeMediaElement(event);
		};

		function isSliderViewport(event) {
			return event.target.tagName == 'IMG' && event.target.parentElement.classList.contains('slider-viewport') && isAdmittedTypeMediaElement(event);
		};

		function isMediaElement(event) {
			return isFilmElement(event) || isSliderViewport(event);
		};

		function saveInElementPart(event) {

			var mediaTypeTitles = {'image': "изображение",
									'video': 'видеозапись',
									'audio': 'аудиозапись'}
			var mediaType = event.target.parentElement.dataset.media_type;
			var mediaElementTotalNumber = Number(event.target.parentElement.dataset.media_total_number);
			changePreviewImageInGalleryFilmClass(mediaElementTotalNumber, 'add', 'media_stressed');
			var mediaTitle = getMediaString('media_title', mediaElementTotalNumber);
			var saveCurrentStressObject = confirm('Сохранить медиа-объект ' + mediaTypeTitles[mediaType] + ' для ' + elementPart.stepProps.title + '?\n' + mediaTitle);
			changePreviewImageInGalleryFilmClass(mediaElementTotalNumber, 'remove', 'media_stressed');
			if (saveCurrentStressObject) {
				elementPart.quote = [{'total_number': mediaElementTotalNumber,
									"type": allMediaList[mediaElementTotalNumber].type}];
				elementPart.type = 'media';
				stressPreviewImageClassInMainTextAndMediaAlbum(mediaElementTotalNumber);
				changePreviewImageInGalleryFilmClass(mediaElementTotalNumber, 'add', 'media_saved_stressed');
				clearTimeout(wait);

				savedStressedMediaTotalNumbers.push(mediaElementTotalNumber);
				switch (elementPart.processType) {
					case false:
					case undefined:
						elementPart.knowlegeElement.addNextPart();
						break;
					case 'change':
						elementPart.removeMarkPreviousMediaQuotesInDocument();
					case 'complete':
						elementPart.refreshMedia();
						elementPart.stopMediaStep();

						elementPart.knowlegeElement.deactiveElement();
						elementPart.knowlegeElement.backToKnowlegeElementsPart();
					case 'complete':
						elementPart.fininshCompeleteElementPart();
				};
			};
		};

		function stressAndSaveMediaElement(event) {
			console.log('singleClick')
			if (isFilmElement(event) && shiftMode) {
				removeFocusMedia(event);
				saveInElementPart(event);
			} else if (isSliderViewport(event)) {
				saveInElementPart(event);
			};
		};
	};

	this.stopMediaStep = function() {
		deactivateDocumentSelection();
		shiftMode = false;
	};

	this.stopNoteStep = function() {};

	this.getNoteStep = function() {

		elementPart = window.knowlegeElement.elementPart;
		var comment = prompt('Введите и сохраните текст заметки для ' + elementPart.stepProps.title + ': ');

		elementPart.data = comment;
		elementPart.type = 'text';

		if (elementPart.processType == 'complete') {

			elementPart.knowlegeElement.deactiveElement();
			elementPart.fininshCompeleteElementPart();
		} else {
			elementPart.knowlegeElement.addNextPart();
		};
	};

	this.renderStepField = function() {

		stepButton.innerHTML = 'Шаг: ' + this.stepProps.title;
	};

	this.partsHandlersFunctions = {'quote': {'createFunction': this.getTextQuoteStep,
											'stopFunction': this.stopTextQuoteStep},
									'note': {'createFunction': this.getNoteStep,
												'stopFunction': this.stopNoteStep},
									'media': {'createFunction': this.getMediaStep,
												'stopFunction': this.stopMediaStep}
								};
};

function activateWorkWithMenu() {
	menu.onselectstart = function() {return false};
	createCreatingElementsModeButton("start");
};

function createCreatingElementsModeButton(buttonMode) {
	var buttonModes = {"start": {"text": "Создать",
								"class": "start",
								"function": startCreatingElements,
								"opositeMode": "stop"},
						"stop": {"text": "Остановить",
								"class": "stop",
								"function": stopCreatingElements,
								"opositeMode": "start"}
						};

	workWithTextButton.classList.remove(buttonModes[buttonModes[buttonMode].opositeMode].class);

	workWithTextButton.classList.add(buttonModes[buttonMode].class);

	workWithTextButton.innerHTML = buttonModes[buttonMode].text;
	workWithTextButton.onclick = buttonModes[buttonMode].function;
	setFullWorkSpaceHeight(mainTextContainer, 6);
};

function stopCreatingElements() {
	if (knowlegeElement && knowlegeElement.elementPart) {
		var continueCreatingElements = confirm("В данный момент происходит добавление элемента № " + knowlegeElement.number + " на Шаге № " + knowlegeElement.elementPart.number + " - \""+ knowlegeElement.elementPart.stepProps.title + "\"" + " OK - Продолжить, ОТМЕНА - Приостановить");
		if (!continueCreatingElements) {
			clearTimeout(wait);

			hideStepField();
			knowlegeElement.stopAddElement();
			createCreatingElementsModeButton("start");
		};
	};
};

function startCreatingElements() {
	createCreatingElementsModeButton("stop");
	alert('Начато добавление элементов' + '\nРежим создания элементов "' + currentModeTitle + '"' + '\nНабор элементов "' + currentSet.title + '"');
	showStepField();
	showCommentModeButton();
	addNextElement();
};

function showStepField() {

	stepButton.style.display = 'inline-block';
};

function hideStepField() {

	stepButton.style.display = '';
	stepButton.innerHTML = '';
};

function showCommentModeButton() {

	addCommentModeButton.style.display = 'inline-block';	
};

function hideCommentModeButton() {

	addCommentModeButton.style.display = '';
	addCommentModeButton.innerHTML = '';	
};

function getAddCommentModeAndRenderCommentModeMenu(event) {

	function getAddCommentModeForPart(steps) {
		if (steps[knowlegeElement.elementPart.number-1].comment) {
			return "onStep";
		} else {
			return "offStep";
		};
	};

	function getCurrentUserSetAddComment() {
		if (currentUserSetSettings.comment == null) { 
			alert("Пользовательские настройки для набора элементов \"" + currentSet.title + "\" для комментирования не были ранее заданы\nБудут установлены настройки режима конструктора \"" + currentModeTitle + "\" для комментирования по умолчанию");
			return getCurrentModeAddComment(knowlegeElement.elementPart.number);
		} else {
			addCommentModeSource = "userSettings";
			if (currentUserSetSettings.comment == 'partSetting') {
				return getAddCommentModeForPart(currentUserSetSettings.steps);
			} else {
				return currentUserSetSettings.comment;
			};
		};
	};

	function getCurrentModeAddComment() {
		if (currentModeSettings.comment == null) { 
			var defaultCommentMode = confirm("Настройки режима конструктора \"" + currentModeTitle + "\" для комментирования по умолчанию не заданы\nУстановить комментирование: ОК - Включено всегда, ОТМЕНА - Отключено всегда");
			if (defaultCommentMode) {
				return 'on';
			} else {
				return 'off';
			};
			addCommentModeSource = "constant";			
		} else {
			addCommentModeSource = "modeSettings";
			if (currentModeSettings.comment == 'partSetting') {
				return getAddCommentModeForPart(currentModeSettings.steps, knowlegeElement.elementPart.number);
			} else {
				return currentModeSettings.comment;
			};
		};
	};

	function renderAddCommentModeMenu() {

		addCommentModeMenu.innerHTML = '';

		var addCommentModesAsMenuElements = document.createDocumentFragment();
		addCommentModes.forEach(function(eachModeDict) {
			if (addCommentMode != eachModeDict.mode) {
				var addCommentModeMenuElement = document.createElement("div");
				addCommentModeMenuElement.classList.add("submenu_button");
				addCommentModeMenuElement.innerHTML = eachModeDict.title;
				addCommentModeMenuElement.dataset.comment_mode = eachModeDict.mode;
				addCommentModeMenuElement.onclick = getAddCommentModeAndRenderCommentModeMenu;
				addCommentModesAsMenuElements.appendChild(addCommentModeMenuElement);
			} else {
				var postfix;
				switch (addCommentModeSource) {
					case "userSettings":
						postfix = eachModeDict.title + ' П';
					break;
					case "modeSettings":
						postfix = eachModeDict.title + ' У';
					break;
					default:
						postfix = eachModeDict.title;
				};
				addCommentModeButton.innerHTML = "Комментирование: " + postfix;
			};
		});

		addCommentModesAsMenuElements.appendChild(setModeButton);

		addCommentModeMenu.appendChild(addCommentModesAsMenuElements);
		addCommentModeButton.appendChild(addCommentModeMenu);
	};

	var gottenAddCommentMode;
	if (event == true) { 

		switch (addCommentModeSource) {
			default: 
			case "userSettings": 
				gottenAddCommentMode = getCurrentUserSetAddComment(); 
				break;
			case "constant": 
				gottenAddCommentMode = addCommentMode;
				break;
			case "step": 
				switch (previousAddCommentModeSource) {
					case "modeSettings": 
						gottenAddCommentMode = getCurrentModeAddComment();

						break;
					case "userSettings": 
						gottenAddCommentMode = getCurrentUserSetAddComment();

						break;
					case "constant": 
						gottenAddCommentMode = previousAddCommentMode;
						break;
				};
				break;
			case "modeSettings":
				gottenAddCommentMode = getCurrentModeAddComment();
				break;
		};
	} else { 
		gottenAddCommentMode = event.target.dataset.comment_mode;
		switch (gottenAddCommentMode) {
			case "userSettings":
				gottenAddCommentMode = getCurrentUserSetAddComment();

				break;
			case "modeSettings":
				gottenAddCommentMode = getCurrentModeAddComment();

				break;
			case "offStep":
			case "onStep":
				if (addCommentModeSource != "step") {
					previousAddCommentModeSource = addCommentModeSource;
					previousAddCommentMode = addCommentMode;
					addCommentModeSource = "step";
				};
				break;
			case "off":
			case "on":
				addCommentModeSource = "constant";
				break;
		};
	};

	if (gottenAddCommentMode != addCommentMode || previousAddCommentModeSource != addCommentModeSource) {
		addCommentMode = gottenAddCommentMode;
		renderAddCommentModeMenu(); 
	};
};

function saveCurrentAddCommentMode() {

	function createStepsSettings(defaultPartSettingMode) {
		var steps = [];
		currentModeSettings.steps.forEach(function(eachStep) {
			steps.push({"step": eachStep.step, "comment": defaultPartSettingMode});
		});
		return steps;
	};

	function changeKnowlegeElementPartSetting() {
		if (addCommentMode == "onStep") {
			currentUserSetSettings.steps[knowlegeElement.elementPart.number-1].comment = true;
		} else if (addCommentMode == "offStep") {
			currentUserSetSettings.steps[knowlegeElement.elementPart.number-1].comment = false;
		};
	};

	function getAddCommentModeTitle() {
		for (var eachModeIndex=0; eachModeIndex < addCommentModes.length; eachModeIndex++) {
			if (addCommentModes[eachModeIndex].mode == addCommentMode) {
				return addCommentModes[eachModeIndex].title;
			};
		};
	};

	var addCommentModeTitle = getAddCommentModeTitle();
	switch (addCommentMode) {
		case "on":
		case "off":
			currentUserSetSettings.comment = addCommentMode;
			if (currentUserSetSettings.steps != null) {
				var erasePartSetting = confirm("Ранее для набора \""+ currentSet.title + "\" были установлены настройки комментирования для каждого шага. ОК - Сохранить, ОТМЕНА - Cтереть\nПри необходимости восстановления сохраненных настроек достаточно выбрать любой режим \"...для шага\" и Сохранить эту настройку.\nДля изменяемого шага будет установлен новый режим комментирования, для всех остальных шагов режим будет восстановлен.");
				if (erasePartSetting == false) {
					currentUserSetSettings.steps = null;
					alert("Настройки режима комментирования для каждого шага были стерты!");					
				};
			};
			alert("Сохранен режим: " + addCommentModeTitle);
			break;
		case "onStep":
		case "offStep":
			if (currentUserSetSettings.steps == null) {
				var defaultPartSettingMode = confirm("Установить комментирование для каждой части по умолчанию: ОК - Включено, ОТМЕНА - Отключен");
				currentUserSetSettings.steps = createStepsSettings(defaultPartSettingMode);
			};
			currentUserSetSettings.comment = "partSetting";
			changeKnowlegeElementPartSetting();
			alert("Для шага №" + currentModeSettings.steps[knowlegeElement.elementPart.number-1].step + ' - "' + currentModeSettings.steps[knowlegeElement.elementPart.number-1].title + '" сохранен режим "' + addCommentModeTitle + '"');
			break;
	};		
};

function activateDocumentSelection(onmouseOverFunction, onmouseOutFunction, onMouseDownFunction, onMouseUpFunction) {

	window.getSelection().removeAllRanges();	
	documentBody.onmouseover = onmouseOverFunction;
	documentBody.onmouseout = onmouseOutFunction;
	documentBody.onmousedown = onMouseDownFunction;
	documentBody.onmouseup = onMouseUpFunction;
};

function deactivateDocumentSelection() {
	documentBody.onmouseover = documentBody.onmouseout = null;
	documentBody.onmousedown = documentBody.onmouseup = null;	
	hideCommentModeButton();
};

function addNextElement(event) {
	var knowlegeElementNumber = savedKnowlegeElements.length + 1;
	knowlegeElement = new KnowlegeElementConstructor(knowlegeElementNumber);
	knowlegeElement.setDateTime();

	knowlegeElement.createFirstPart();

};

function clearWindowKnowlegeElement() {
	window.knowlegeElement = undefined;
};

document.addEventListener('keydown', function(event) {
	if (event.key == 'Shift') {
		shiftMode = true;
		console.log('shiftMode', shiftMode)
	};
});

document.addEventListener('keyup', function(event) {
	if (event.key == 'Shift') {
		shiftMode = false;
		console.log('shiftMode', shiftMode)
	};
});