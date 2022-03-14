// 'use strict';
var documentId = 1;
var loadedTextsJson = {};
var savedStressedObjects = {};
var savedStressedMediaTotalNumbers = [];

var allMediaList = [];
var footnotesList = [];
var externalLinksList = [];
var documentLinksList = [];
var currentTotalNumberOfOpenedInSliderMediaElement;

var menu = document.getElementById('menu');
var sandwichButton = document.getElementById('sandwich');
var documentBody = document.getElementById('document');
var gallery = document.getElementById("gallery");
var openFullsreenButton = document.getElementById("open-fullsreen");
var openMediaDescriptionButton = document.getElementById("show-slider-descrition");
var openTextStringForMediaButton = document.getElementById("open-text-string");
var sliderTitle = document.getElementById("gallery_title");
var closeGalleryButton = gallery.querySelector(".close-button");
var slider = gallery.querySelector(".slider");
var viewport = slider.querySelector(".slider-viewport");
var leftButton = slider.querySelector(".slider-button.left");
var rightButton = slider.querySelector(".slider-button.right");
var film = gallery.querySelector('.film');
var mediaDescriptionContainer = gallery.querySelector('[data-source="media_description"]');
var partsContainer = document.getElementById("parts");
var partsTitle = document.getElementById("part_title");
var closePartsButton = document.querySelector("#part_header .close-button");
var aboutTextContainer = document.getElementById('about');
var contentListContainer = document.getElementById('content_title');
var mediaListContainer = document.getElementById('media_list');
var mediaAlbumContainer = document.getElementById('media_album');
var footnoteTextContainer = document.getElementById('footnote');
var externalLinksContainer = document.getElementById('external_link_list');
var knowlegeElementsContainer = document.getElementById('knowlege_elements');
var mainTextContainer = document.getElementById('main_text');

function falseFunction() {
	return false;
};
var partDataTypeTitles = {'text': 'Текст',
						'image': 'изображение'};

partsTitle.onselectstart = falseFunction;

var stringButtonClassName = 'text_button';

window.onload = downloadJson('user_settings.json', dowloadUserSettingsCallback);

function extractNumberFromSpan(element) {
	var number = element.innerHTML;
		if (number.slice(0, 1) == ',') {
			number = number.slice(2);
		};
	return number;
};

function insertReference(referenceDict) {

	var wordElement = getElementForOperation(undefined, referenceDict.textSource, 'word', referenceDict.stringNumber, referenceDict.wordNumber)
	var referenceContainer = wordElement.querySelector('.' + referenceDict.referenceNoteClassName);
	var referenceElement = document.createElement('span');
	if (referenceContainer) {
		referenceElement.innerHTML = ', ';
	} else {
		var referenceContainer = document.createElement('span');
		referenceContainer.classList.add('top_shift', referenceDict.referenceNoteClassName);
		wordElement.appendChild(referenceContainer);
	};
	referenceElement.innerHTML += Number(referenceDict.referenceTotalNumber+1);

	referenceContainer.appendChild(referenceElement);
	referenceElement.onclick = referenceDict.openReferenceFunction;
};

function jsonFileNameCreator(parentLocation, fileName) {
	return parentLocation + '/' + fileName + '.json';
}

function dowloadUserSettingsCallback(jsonData) {
	window.userSettings = jsonData;	
	downloadJson(jsonFileNameCreator('document_settings', documentId), downloadDocumentSettingsCallback);	
};

function downloadDocumentSettingsCallback(jsonData) {
	window.documentSettings = jsonData;
	downloadJson(jsonFileNameCreator("text", documentSettings.text), downloadTextsCallback);

};

function downloadTextsCallback(jsonData) {
	window.documentText = jsonData;
	changeSourceTextToArrays(jsonData);
	createSavedStressedObjectsDict();	
	downloadJson(jsonFileNameCreator('style', documentSettings.style), downloadSourceStylesCallback);
};

function createSavedStressedObjectsDict() {	
	for (textSourceTitle in documentText) {
		window.savedStressedObjects[textSourceTitle] = [];
	};
};

function downloadSourceStylesCallback(stylesJsonData) {
	renderTextContainer(stylesJsonData);
	createContentList();
	downloadJson(jsonFileNameCreator('footnotes', documentId), dowloadFootnotesListCallback);
	downloadJson(jsonFileNameCreator('external_links', documentId), dowloadExternalLinksListCallback);
	downloadJson(jsonFileNameCreator('document_links', documentId), dowloadDocumentLinksListCallback);
	downloadJson(jsonFileNameCreator('recent_modes', documentId), downloadModesTitlesListCallback);
};

function getTextStringArray(textSource, stringNumber) {

	var textStringArray = loadedTextsJson[textSource][stringNumber];
	if (textStringArray == undefined) {
		textStringArray = '';
	};
	return textStringArray;
};

function transformToMediaTitle(titleAsArrays) {
	var wordsArray = [];
	for (wordIndex=0;wordIndex<titleAsArrays.length;wordIndex++) {
		wordsArray.push(titleAsArrays[wordIndex][0]);
	};
	return wordsArray.join(' ');
};

function getMediaString(property, stringNumber) {
	var mediaStringArray = getTextStringArray(property, stringNumber);
	return transformToMediaTitle(mediaStringArray);
};

function checkAndStressSavedKnowlegeElementQuote(currentTextSource, mediaTotalNumber) {	
	savedStressedObjects[currentTextSource].forEach(function(eachSavedStressObject) {		
		if (mediaTotalNumber == eachSavedStressObject.startElementPosition.stringNumber) {			

			eachSavedStressObject.renderStress();
		};
	});
};

function getMediaElementWithTotalNumber(mediaElementTotalNumber) {

	return allMediaList[mediaElementTotalNumber];
};

function stressPreviewImageClassInMainTextAndMediaAlbum(mediaElementTotalNumber, operation='add', className='media_saved_stressed') {
	var mediaElementInTextFilm = getMediaElementWithTotalNumber(mediaElementTotalNumber);	
	mediaElementInTextFilm.previewImageElement.classList[operation](className);
	var imageInMediaAlbum = mediaAlbumContainer.querySelector('.film-postioner[data-media_total_number="' + mediaElementTotalNumber + '"] img');
	imageInMediaAlbum.classList[operation](className);
};

function changePreviewImageInGalleryFilmClass(mediaElementTotalNumber, operation, className) {

	var imageInGalleryFilm = gallery.querySelector('.film .film-postioner[data-media_total_number="' + mediaElementTotalNumber + '"] img');
	if (imageInGalleryFilm) {
		imageInGalleryFilm.classList[operation](className);
	};
};

function changePreviewImageEverywhere(mediaElementTotalNumber, operation, className='media_saved_stressed') {
	stressPreviewImageClassInMainTextAndMediaAlbum(mediaElementTotalNumber, operation, className);
	changePreviewImageInGalleryFilmClass(mediaElementTotalNumber, operation, className);
};

function deleteSavedStressedMediaWithTotalNumber(mediaElementTotalNumber) {
	changePreviewImageEverywhere(mediaElementTotalNumber, 'remove');
	var index = savedStressedMediaTotalNumbers.indexOf(mediaElementTotalNumber);
	savedStressedMediaTotalNumbers.splice(index, 1);
};

function dowloadMediaListCallback(mediaJsonData) {

	function createImageElement(url) {

		var imageElement = new Image();
		imageElement.src = url;
		return imageElement;
	};

	function createFilmPositioner(mediaElement, previewImage) {

		var filmPositioner = document.createElement("div");
		filmPositioner.classList.add("film-postioner");

		filmPositioner.title = getMediaString('media_title', mediaElement.total_number);

		filmPositioner.dataset.media_total_number = mediaElement.total_number;
		filmPositioner.dataset.media_type = mediaElement.type;

		filmPositioner.appendChild(previewImage);
		return filmPositioner;
	};

	function getMediaElementTotalNumber(filmPositioner) {
		var total_number = Number(filmPositioner.dataset.media_total_number);
		return total_number;
	};

	function createGallerySlider(mediaElement) {

		function openImageFullscreen(event) {
			var mediaElement = getMediaElementWithTotalNumber(viewport.dataset.media_total_number);
			film.style.display = 'none';
			mediaDescriptionContainer.style.display = 'none';
			slider.style.height = '92%';
			openFullsreenButton.onclick = closeImageFullscreen;
			openMediaDescriptionButton.style.display = 'none';
			cleanGallerySlider();
			createSlider(mediaElement);
		};

		function closeImageFullscreen(event) {
			openFullsreenButton.onclick = openImageFullscreen;
			setSliderAndFilmHeightDefaults();
			cleanGallerySlider();
			createSlider(mediaElement);
		};

		function createVerticalSlider(image, width, viewportWidth, imageProportions) {

			image.style.height = (width/100*slider.clientWidth - 6)/(width/100*slider.clientWidth)*100 + '%'; 

			viewport.appendChild(image);
			leftButton.style.width = String((100-width)/2) + "%";
			viewport.style.width = String(width) + "%";
			rightButton.style.width = String((100-width)/2) + "%";
		};

		function createHorizotalSlider(image, imageWidthMaximumProp, viewportWidth, imageProportions) {
			var viewportFragments = document.createDocumentFragment();			
			image.style.width = (viewportWidth*imageWidthMaximumProp-6)/(viewportWidth*imageWidthMaximumProp)*100 + '%';
			var height = imageProportions * imageWidthMaximumProp * slider.clientWidth/slider.clientHeight * 100;
			image.style.height = String(height) + "%";			
			var topPadding = document.createElement('div');
			topPadding.style.height = String((100 - height)/2) + "%";
			viewportFragments.appendChild(topPadding);
			viewportFragments.appendChild(image);

			var viewportWidth = imageWidthMaximumProp*100;
			var sideButtonWidthPercentage = String((100 - viewportWidth)/2) + "%";				
			leftButton.style.width = sideButtonWidthPercentage;
			viewport.style.width = String(viewportWidth) + "%";
			rightButton.style.width = sideButtonWidthPercentage;
			viewport.appendChild(viewportFragments); 
		};

		function createSlider(mediaElement) {
			var imageWidthMaximumProp = 0.8;
			var image = createImageElement(mediaElement.location);
			var imageProportions = image.height/image.width;
			var sliderProportions = slider.clientHeight/(slider.clientWidth*imageWidthMaximumProp);
			if (imageProportions >= sliderProportions) {
				var width = (imageProportions ** -1) * slider.clientHeight/slider.clientWidth * 100;
				if (width < imageWidthMaximumProp*10) {
					createHorizotalSlider(image, imageWidthMaximumProp, slider.clientWidth, imageProportions);
				} else {
					createVerticalSlider(image, width, slider.clientWidth, imageProportions);
				};
			} else {
				createHorizotalSlider(image, imageWidthMaximumProp, slider.clientWidth, imageProportions);
			};
		};

		createSlider(mediaElement);
		viewport.dataset.media_type = mediaElement.type;
		viewport.dataset.media_total_number = mediaElement.total_number;

		openFullsreenButton.onclick = openImageFullscreen;

		var mediaSource = 'media_title';
		var titleAsWords = getTextStringArray(mediaSource, mediaElement.total_number);

		sliderTitle.appendChild(createBroadStringElement(titleAsWords, false, mediaElement.total_number));
		checkAndStressSavedKnowlegeElementQuote(mediaSource, mediaElement.total_number);
		insertBroadStringInTextContainer('media_description', mediaElement.total_number);

		if (mediaElement.text_positions) {
			openTextStringForMediaButton.style.display = 'inline-block';
			if (mediaElement.text_positions.length == 1) {
				openTextStringForMediaButton.dataset.text_source = mediaElement.text_positions[0].source;
				openTextStringForMediaButton.dataset.string = mediaElement.text_positions[0].string;
				openTextStringForMediaButton.dataset.word = mediaElement.text_positions[0].word;
				openTextStringForMediaButton.onclick = closeGalleryAndOpenTextContainer;
			} else {
				openTextStringForMediaButton.dataset.total_number = mediaElement.total_number;
				openTextStringForMediaButton.dataset.reference_type = 'media';
				openTextStringForMediaButton.onclick = chooseTextContainerAndStringAndСloseGalleryAndOpenTextContainer;
			};
		};
	};

	function closeGalleryAndOpenTextContainer(event) {
		closeGallery();
		findAndOpenElementInText(event);
	};

	function chooseTextContainerAndStringAndСloseGalleryAndOpenTextContainer(event) {
		closeGallery();		
		chooseTextContainerAndStringAndFindAndOpenElementInText(event);
	};

	function refreshGallerySlider(event) {
		cleanGallerySlider();
		cleanSliderTitle();
		var mediaElementTotalNumber = getMediaElementTotalNumber(event.target.parentElement);
		var currentMediaElement = getMediaElementWithTotalNumber(mediaElementTotalNumber);
		currentTotalNumberOfOpenedInSliderMediaElement = mediaElementTotalNumber;
		createGallerySlider(currentMediaElement);
		unstressPreviewImageInGalleryFilmAsOpened();
		stressPreviewImageInGalleryFilmAsOpened();
	};

	function cleanSliderTitle() {

		openTextStringForMediaButton.style.display = '';
		cleanNodeContent(sliderTitle);
	};

	function setGallerySliderButtonsFunctions() {

		var leftButton = gallery.querySelector(".slider-button.left");
		var rightButton = gallery.querySelector(".slider-button.right");
		leftButton.onclick = slideMediaInGallerySlider;
		rightButton.onclick = slideMediaInGallerySlider;
	};

	function slideMediaInGallerySlider(event) {

		if (event.target.classList.contains('left')) {
			if (currentTotalNumberOfOpenedInSliderMediaElement > 0) {
				currentTotalNumberOfOpenedInSliderMediaElement -= 1;
			} else {
				currentTotalNumberOfOpenedInSliderMediaElement = allMediaList.length-1;
			};
		} else {			
			if (currentTotalNumberOfOpenedInSliderMediaElement < allMediaList.length-1) {
				currentTotalNumberOfOpenedInSliderMediaElement += 1;
			} else {
				currentTotalNumberOfOpenedInSliderMediaElement = 0;
			};
		};
		var currentMediaElement = allMediaList[currentTotalNumberOfOpenedInSliderMediaElement];
		cleanGallerySlider();
		cleanSliderTitle();
		createGallerySlider(currentMediaElement);
		unstressPreviewImageInGalleryFilmAsOpened();
		stressPreviewImageInGalleryFilmAsOpened();
	};

	function unstressPreviewImageInGalleryFilmAsOpened() {

		var previousImage = gallery.querySelector('.film .film-postioner img.media_opened');
		if (previousImage) {previousImage.classList.remove('media_opened')};
	};

	function stressPreviewImageInGalleryFilmAsOpened() {		
		changePreviewImageInGalleryFilmClass(currentTotalNumberOfOpenedInSliderMediaElement, 'add', 'media_opened');
	};

	function cleanGallerySlider() {
		var sliderViewport = document.querySelector(".slider-viewport");			
		cleanNodeContent(sliderViewport);
		var leftButton = document.querySelector(".slider-button.left");			

		var rightButton = document.querySelector(".slider-button.right");

	};

	function getMediaElementInGalleryFilm(direction) {
		var filmRow = document.querySelector(".film-row");
		if (direction == 'previous') {
			filmPositioner = filmRow.firstChild;
		} else {			
			filmPositioner = filmRow.lastChild;
		};				
		return getMediaElementTotalNumber(filmPositioner);
	};

	function showPreviousGalleryFilm(event) {
		var direction = 'previous';
		var mediaElementTotalNumber = getMediaElementInGalleryFilm(direction);		
		cleanGalleryFilm();
		createGalleryFilm(mediaElementTotalNumber, direction);
	};

	function showNextGalleryFilm(event) {
		var direction = 'next';
		var mediaElementTotalNumber = getMediaElementInGalleryFilm(direction);
		cleanGalleryFilm();
		createGalleryFilm(mediaElementTotalNumber, direction);
	};

	function createGalleryFilm(mediaElementTotalNumber, direction) {

		function getWidthDevHeightImageProportion(previewImage) {
			return previewImage.width/previewImage.height;
		}

		function getFullPositionerWidth(previewImage) {
			var paddingRight = 0;
			var borderWidth = 3;

			var imageProportion = getWidthDevHeightImageProportion(previewImage);
			return paddingRight + 2*borderWidth + imageProportion * imagePreviewHeightClient;
		};

		function checkAndAddFilmPositioner(mediaIndex, widthMode, isOpened) {
			var mediaElement = allMediaList[mediaIndex];
			var previewImage = mediaElement.previewImageElement.cloneNode();

			if (isOpened) {
				currentTotalNumberOfOpenedInSliderMediaElement = currentMediaElementIndex;

				createGallerySlider(mediaElement);
			};
			previewImage.onclick = refreshGallerySlider;
			var filmPositioner = createFilmPositioner(mediaElement, previewImage);
			if (!widthMode) {
				var filmPositionerHeight = imagePreviewHeightClient;
			} else {

				var imageProportion = getWidthDevHeightImageProportion(previewImage);								
				var filmPositionerHeight = (filmRowWidthMax) * (imageProportion)**-1; 

			};
			filmPositioner.style.height = filmPositionerHeight + 'px';
			filmRowFragment.appendChild(filmPositioner);
		};

		function fillMediaElementsIndexesForCurrent(mediaElement) {

			var fullCurrentMediaElementPositionerWidth = getFullPositionerWidth(mediaElement.previewImageElement);
			imagePreviewWidthClientTotal += fullCurrentMediaElementPositionerWidth;

			mediaElementPreviousIndexes = [];
			if (mediaElement.total_number > 0) {

				var mediaElementPreviousIndexes = fillMediaElementsIndexes(mediaElement, 'previous', false);

				mediaElementIndexes = mediaElementIndexes.concat(mediaElementPreviousIndexes);				
			};
			mediaElementIndexes.push(mediaElement.total_number);			
			mediaElementNextIndexes = [];
			if (mediaElement.total_number < allMediaList.length-1) {
				var mediaElementNextIndexes = fillMediaElementsIndexes(mediaElement, 'next', false);

			};

			mediaElementIndexes = mediaElementIndexes.concat(mediaElementNextIndexes);
			if (mediaElementIndexes.length == 1 && imagePreviewWidthClientTotal > filmRowWidthMax) {

				checkAndAddFilmPositioner(mediaElementIndexes[0], true, true);
				mediaElementIndexes.splice(0,1);

			};

		};

		function fillMediaElementsIndexes(mediaElement, direction, buttonEvent, previousIndexesLength=0) {

			function compareNumeric(a, b) {
			  if (a > b) return 1;
			  if (a < b) return -1;
			};

			if (direction == 'previous') {
				if (buttonEvent && mediaElement.total_number == 0) {					
					var startIndex = allMediaList.length - 1;
				} else {					
					var startIndex = mediaElement.total_number - 1;
				};
				var limitFunction = function(mediaElementIndex) {return mediaElementIndex>=0};
				var directionValue = -1;
				var recursionFunction = function() {
					if (indexes[0] == 0) {
						var previousIndexes = fillMediaElementsIndexes(allMediaList[0], direction, buttonEvent, indexes.length);
						indexes = previousIndexes.concat(indexes);
					};
				};
			} else { 
				if (buttonEvent && mediaElement.total_number == allMediaList.length - 1) {
					var startIndex = 0;
				} else {
					var startIndex = mediaElement.total_number + 1;
				};
				var limitFunction = function(mediaElementIndex) {return mediaElementIndex<allMediaList.length};
				var directionValue = 1;
				var recursionFunction = function() {
					if (indexes[indexes.length - 1] == allMediaList.length - 1) {
						var nextIndexes = fillMediaElementsIndexes(allMediaList[indexes[indexes.length - 1]], direction, buttonEvent, indexes.length);
						indexes = indexes.concat(nextIndexes);
					};
				};
			};

			var indexes = [];
			for (var mediaElementIndex=startIndex;limitFunction(mediaElementIndex);mediaElementIndex+=directionValue) {				
				var fullPositionerWidth	= getFullPositionerWidth(allMediaList[mediaElementIndex].previewImageElement);
				imagePreviewWidthClientTotal += fullPositionerWidth;				
				if (imagePreviewWidthClientTotal <= filmRowWidthMax) { 
					imagePreviewWidthClientTotal += 3;
					indexes.push(mediaElementIndex);
				} else if (mediaElementIndexes.length == 0 && indexes.length == 0 && previousIndexesLength == 0 && buttonEvent) {

					checkAndAddFilmPositioner(mediaElementIndex, true, false);
					return [];
					break;
				} else { 
					imagePreviewWidthClientTotal -= fullPositionerWidth + 3;					
					return indexes.sort(compareNumeric);
					break;
				};
			};
			indexes.sort(compareNumeric);
			if (imagePreviewWidthClientTotal <= filmRowWidthMax && buttonEvent) {
				recursionFunction();
			};
			return indexes;
		};

		function createFilmPositionersFragmentWithIndexes() {
			mediaElementIndexes.forEach(function(eachMediaIndex){			
				checkAndAddFilmPositioner(eachMediaIndex, false, eachMediaIndex == currentMediaElementIndex);
			});
		};

		mediaElement = getMediaElementWithTotalNumber(mediaElementTotalNumber);		

		var filmRow = document.querySelector(".film-row");

		var galleryFilm = document.querySelector(".film");
		var filmWidth = galleryFilm.clientWidth;
		var filmHeight = galleryFilm.clientHeight;

		var minimalWidthButtons = 50;
		if (filmWidth - 2*minimalWidthButtons) {
			var filmRowWidthMax = filmWidth - 2*minimalWidthButtons;
		} else {
			var filmRowWidthMax = filmWidth*0.9;
		};
		var imagePreviewHeightClient = filmHeight*0.9;
		var imagePreviewWidthClientTotal = 0;

		var filmRowFragment = document.createDocumentFragment();

		var currentMediaElementIndex = mediaElement.total_number;
		var mediaElementIndexes = [];
		switch (direction) {
			case 'current':			
				fillMediaElementsIndexesForCurrent(mediaElement);
				break;
			default:
				mediaElementIndexes = fillMediaElementsIndexes(mediaElement, direction, true);
				break;
		};

		createFilmPositionersFragmentWithIndexes();
		filmRow.appendChild(filmRowFragment);
		var filmRowWidth = filmRow.clientWidth*1.003/filmWidth;
		var buttonWidth = (1 - filmRowWidth)*100/2 + '%';

		var filmLeftButton = document.querySelector(".film-button.left");
		filmLeftButton.style.width = buttonWidth;
		var filmRightButton = document.querySelector(".film-button.right");
		filmRightButton.style.width = buttonWidth;
		filmLeftButton.onclick = showPreviousGalleryFilm;
		filmRightButton.onclick = showNextGalleryFilm;

		stressPreviewImageInGalleryFilmAsOpened();
		changePreviewImageInGalleryFilmClass(mediaElementTotalNumber, 'remove', 'media_focused'); 
	};

	function showGallery(event) {		
		if (!shiftMode) {			

			gallery.style.display = "block";

			setFullWorkSpaceHeight(gallery, 1);

			document.onkeydown = function(event) {
				if (event.key === "Escape") {
					closeGallery(event);
				};

			};
			var element = event.target;
			if (event.target.tagName == "IMG") { 
				element = element.parentNode;
			};
			if (element.dataset.media_total_number == undefined) {
				var mediaElementTotalNumber = extractNumberFromSpan(element) - 1; 
			} else {
				var mediaElementTotalNumber = getMediaElementTotalNumber(element);
			};
			createGalleryFilm(mediaElementTotalNumber, 'current');
		};
	};

	function cleanGalleryFilm() {

		var filmRow = gallery.querySelector(".film-row");
		cleanNodeContent(filmRow);
		hideMediaDescription();
	};

	function closeGallery(event) {

		gallery.style.display = "none";
		currentTotalNumberOfOpenedInSliderMediaElement = false;
		setSliderAndFilmHeightDefaults();
		cleanGalleryFilm();
		cleanGallerySlider();
		cleanSliderTitle();
	};

	function closeGalleryRequest() {
		if (currentTotalNumberOfOpenedInSliderMediaElement != undefined || currentTotalNumberOfOpenedInSliderMediaElement >= 0) {
			var toCloseGallery = confirm('Закрыть галлерею?');
			if (toCloseGallery) {
				closeGallery();
			};
			return false;
		} else {
			return true;
		};
	};

	function setSliderAndFilmHeightDefaults() {
		mediaDescriptionContainer.style.display = '';
		openMediaDescriptionButton.style.display = '';
		film.style.display = '';
		slider.style.height = '';
	};

	function createFilmPositionerForText(mediaElement) {
		var previewImage = createImageElement(mediaElement.preview);
		mediaElement["previewImageElement"] = previewImage;
		previewImage.onclick = showGallery;
		var filmPositioner = createFilmPositioner(mediaElement, previewImage);
		return filmPositioner;
	};

	function createFilmButton(position) {
		var mediaButton = document.createElement("div");
		mediaButton.classList.add("film-button", position);
		return mediaButton;
	};

	function insertMediaLayoutPositionerInText(textSource, stringNumber, position, mediaLayoutPositioner) {
		var stringElement = document.querySelector('.text_container[data-source="'+ textSource + '"] [data-string="' + stringNumber + '"]');
		var textContainer = document.querySelector('.text_container[data-source="'+ textSource + '"]');		
		var stringLayoutPositioner = stringElement.parentElement;

		if (position == "before") { 
			textContainer.insertBefore(mediaLayoutPositioner, stringLayoutPositioner);
		} else if (position == "after") { 
			var nextLayoutPositioner = stringLayoutPositioner.nextSibling;
			if (nextLayoutPositioner) {
				textContainer.insertBefore(mediaLayoutPositioner, nextLayoutPositioner);
			} else { 
				textContainer.appendChild(mediaLayoutPositioner);
			};
		};
	};

	function createMediaFilmsForText(mediaJsonData) {
		var albumFragment = document.createDocumentFragment();
		mediaJsonData.forEach(function(eachTextSource) {

			eachTextSource.strings.forEach(function(eachString) {
				eachString.positions.forEach(function(eachPosition) {

					if (eachPosition.media.length > 0) {
						var broadMediaStringContainer = document.createDocumentFragment();

						var leftFilmButton = createFilmButton("left");
						broadMediaStringContainer.appendChild(leftFilmButton);

						var filmRowFragment = document.createDocumentFragment();

						eachPosition.media.forEach(function(eachMediaElement) {

							eachMediaElement["textSource"] = eachTextSource.source;
							eachMediaElement["string"] = eachString.number;
							eachMediaElement["position"] = eachPosition.position;
							allMediaList.push(eachMediaElement);
							if (eachMediaElement.text_positions != undefined) {
								eachMediaElement.text_positions.forEach(function(text_position) {
								insertReference({'referenceNoteClassName': 'media_link',
												'referenceTotalNumber': eachMediaElement.total_number,
												'textSource': text_position.source,
												'stringNumber': text_position.string,
												'wordNumber': text_position.word,
												'openReferenceFunction': showGallery});
								});
							};
							var filmPositioner = createFilmPositionerForText(eachMediaElement);
							filmRowFragment.appendChild(filmPositioner);							

							var filmPositionerClone = filmPositioner.cloneNode(true);
							filmPositionerClone.onclick = showGallery;
							albumFragment.appendChild(filmPositionerClone);
						});
						var filmCell = document.createElement("div");
						filmCell.classList.add("film");
						filmCell.dataset.string = eachString.number;
						filmCell.dataset.position = eachPosition.position;
						filmCell.appendChild(filmRowFragment);
						broadMediaStringContainer.appendChild(filmCell);

						var rightFilmButton = createFilmButton("right");
						broadMediaStringContainer.appendChild(rightFilmButton);

						var mediaLayoutPositioner = document.createElement("div");
						mediaLayoutPositioner.classList.add("layout-positioner");
						mediaLayoutPositioner.appendChild(broadMediaStringContainer);

						insertMediaLayoutPositionerInText(eachTextSource.source, eachString.number, eachPosition.position, mediaLayoutPositioner);

					};
				});
			});
			mediaAlbumContainer.appendChild(albumFragment);
		});
	};

	function showMediaDescription() {

		film.style.display = 'none';
		var textContainer = document.querySelector('.text_container[data-source=media_description]');
		textContainer.style.display = 'block';
		setMediaDescriptionButtonEventFunction(hideMediaDescription);
	};

	function hideMediaDescription() {

		film.style.display = '';
		var textContainer = document.querySelector('.text_container[data-source=media_description]');
		textContainer.style.display = '';
		setMediaDescriptionButtonEventFunction(showMediaDescription);
	};

	function setMediaDescriptionButtonEventFunction(eventListenerFunction) {
		openMediaDescriptionButton.onclick = eventListenerFunction;
	};

	function setButtonEventListeners() {
		closeGalleryButton.onclick = closeGallery;
		setMediaDescriptionButtonEventFunction(showMediaDescription);
	};

	function createMediaTitleTextStringElement(text, mediaTitleNumber) {
		var mediaTitleTextStringElement = document.createElement("div");
		mediaTitleTextStringElement.dataset.media_total_number = mediaTitleNumber;
		mediaTitleTextStringElement.innerHTML = (mediaTitleNumber + 1) + '. ' + text;
		mediaTitleTextStringElement.onclick = showGallery;
		return mediaTitleTextStringElement;
	};

	function createMediaList() {
		var mediaSource = 'media_title';
		var mediaTitles = loadedTextsJson[mediaSource];
		var stringsAsElements = document.createDocumentFragment();
		for (var mediaTitleNumber=0; mediaTitleNumber<mediaTitles.length; mediaTitleNumber++) {
			var titleAsWords = getMediaString(mediaSource, mediaTitleNumber);
			stringsAsElements.appendChild(createMediaTitleTextStringElement(titleAsWords, mediaTitleNumber));
		};
		mediaListContainer.appendChild(stringsAsElements);
		mediaListContainer.onselectstart = falseFunction;
	};

	function showGalleryWithMediaText(event) {
		showGallery(event);
		if (event.target.dataset.text_source == 'media_description') {
			showMediaDescription();
		};
	};

	createMediaFilmsForText(mediaJsonData);
	setButtonEventListeners();
	setGallerySliderButtonsFunctions();
	createMediaList();
	window.showGallery = showGallery;
	window.closeGalleryRequest = closeGalleryRequest;
	window.showGalleryWithMediaText = showGalleryWithMediaText;
};

function findAndOpenElementInText(event) {
	var textSource = event.target.dataset.text_source;
	var stringNumber = event.target.dataset.string;
	var wordNumber = event.target.dataset.word;
	openPart(event);
	var pairTextButtonElements = blinkPairTextButtonElements(textSource, stringNumber);
	pairTextButtonElements[0].scrollIntoView(true);
	if (wordNumber != undefined) {
		blinkTextElement(textSource, 'word', stringNumber, wordNumber);
	};
};

function getFootnoteWithTotalNumber(footnoteTotalNumber) {
	return footnotesList[footnoteTotalNumber];
};

function getExternalLinkWithTotalNumber(externalLinkTotalNumber) {
	return externalLinksList[externalLinkTotalNumber];
};

function getDocumentLinksPairWithTotalNumber(documentLinkTotalNumber) {
	return documentLinksList[documentLinkTotalNumber];
};

function chooseTextContainerAndStringAndFindAndOpenElementInText(event) {
	var referenceProps = {
		'footnote': {'getFunction': getFootnoteWithTotalNumber,
					'textPositionsTitle': 'positions'},
		'external_link': {'getFunction': getExternalLinkWithTotalNumber,
					'textPositionsTitle': 'positions'},
		'media': {'getFunction': getMediaElementWithTotalNumber,
					'textPositionsTitle': 'text_positions'
				}
	};	
	var referenceType = event.target.dataset.reference_type;
	var reference = referenceProps[referenceType].getFunction(event.target.dataset.total_number);
	var outputString = 'Выберете направление для перехода: \n';
	var positions = reference[referenceProps[referenceType].textPositionsTitle];
	for (var sourceNumber=0; sourceNumber<positions.length; sourceNumber++) {
		var textPosition = positions[sourceNumber];
		outputString += Number(sourceNumber + 1) + '. ' + parts[textPosition.source].title + ', Строка: ' + textPosition.string + ', Слово: ' + textPosition.word;
		if (sourceNumber < positions.length) {
			outputString += '\n';
		};
	};
	var textPositionNumber = prompt(outputString);
	if (textPositionNumber) {
		textPositionNumber -= 1;
		textPosition = positions[textPositionNumber];
		event.target.dataset.text_source = textPosition.source;
		event.target.dataset.string = textPosition.string;
		event.target.dataset.word = textPosition.word;
		findAndOpenElementInText(event);
	};
};

function createContentList() {

	function createTitleTextStringElement(titleArray) {
		var titleTextStringElement = document.createElement("div");
		var text = titleArray.position.join(' ') + ' ' + titleArray.title;
		titleTextStringElement.innerHTML = text;
		titleTextStringElement.dataset.text_source = titleArray.link.source;
		titleTextStringElement.dataset.string = titleArray.link.string;
		titleTextStringElement.onclick = findAndOpenElementInText;
		return titleTextStringElement;
	};

	var contentTitles = loadedTextsJson['content'];
	var stringsAsElements = document.createDocumentFragment();
	for (var contentTitleNumber=0; contentTitleNumber<contentTitles.length; contentTitleNumber++) {
		var titleArray = loadedTextsJson['content'][contentTitleNumber];			
		stringsAsElements.appendChild(createTitleTextStringElement(titleArray));	
	};
	contentListContainer.appendChild(stringsAsElements);
	contentListContainer.onselectstart = falseFunction;
};

function dowloadFootnotesListCallback(footnoteJsonData) {

	function openFootnote(event) {
		var footnoteTotalNumber = extractNumberFromSpan(event.target);
		event.target.dataset.text_source = 'footnote';
		event.target.dataset.string = footnoteTotalNumber - 1;		
		findAndOpenElementInText(event);

	};

	footnotesList = footnoteJsonData;
	var referencesToInsert = [];
	var footnoteAsStrings = document.createDocumentFragment();
	footnoteJsonData.forEach(function(eachFootnote) {
		var footnoteTotalNumber = eachFootnote.total_number;
		var stringText = getTextStringArray('footnote', footnoteTotalNumber);
		eachFootnote.positions.forEach(function(textPosition) {
			var textSource = textPosition.source;
			var stringNumber = textPosition.string;
			var wordNumber = textPosition.word;
			referencesToInsert.push({'referenceNoteClassName': 'footnote',
									'referenceTotalNumber': footnoteTotalNumber,
									'textSource': textSource,
									'stringNumber': stringNumber,
									'wordNumber': wordNumber,
									'openReferenceFunction': openFootnote});
		});

		var indexNumberElement = document.createElement('span');
		indexNumberElement.classList.add('footnote', 'string_number');
		indexNumberElement.innerHTML = footnoteTotalNumber + 1;

		if (eachFootnote.positions.length <= 1) {
			indexNumberElement.dataset.text_source = eachFootnote.positions[0].source;
			indexNumberElement.dataset.string = eachFootnote.positions[0].string;
			indexNumberElement.dataset.word = eachFootnote.positions[0].word;
			indexNumberElement.onclick = findAndOpenElementInText;
		} else {
			indexNumberElement.dataset.total_number = footnoteTotalNumber;
			indexNumberElement.dataset.reference_type = 'footnote';
			indexNumberElement.onclick = chooseTextContainerAndStringAndFindAndOpenElementInText;
		};
		footnoteAsStrings.appendChild(createBroadStringElement(stringText, false, footnoteTotalNumber, indexNumberElement));		
	});
	footnoteTextContainer.appendChild(footnoteAsStrings);
	referencesToInsert.forEach(function(eachReferenceToInsert) {insertReference(eachReferenceToInsert)});
	downloadJson(jsonFileNameCreator('media', documentId), dowloadMediaListCallback);
};

function dowloadExternalLinksListCallback(externalLinkJsonData) {

	function createLinkTextStringElement(indexNumberElement, linkText) {
		var stringElement = document.createElement("div");
		stringElement.append(indexNumberElement);		
		var linkTextElement = document.createElement("span");		
		linkTextElement.innerHTML = linkText;
		linkTextElement.onclick = goToLinkFromSpan;
		stringElement.append(linkTextElement);
		return stringElement;
	};

	function goToLinkFromSpan(event) {
		window.open(event.target.innerHTML);
	};

	function goToLinkFromNumber(event) {
		var externalLinkTotalNumber = extractNumberFromSpan(event.target);
		var externalLink = getExternalLinkWithTotalNumber(externalLinkTotalNumber - 1);
		window.open(externalLink.link);
	};

	externalLinksList = externalLinkJsonData;
	var referencesToInsert = [];
	var externalLinkAsStrings = document.createDocumentFragment();
	externalLinkJsonData.forEach(function(eachExternalLink) {
		var externalLinkTotalNumber = eachExternalLink.total_number;
		var linkText = eachExternalLink.link;
		eachExternalLink.positions.forEach(function(textPosition) {
			var textSource = textPosition.source;
			var stringNumber = textPosition.string;
			var wordNumber = textPosition.word;
			referencesToInsert.push({'referenceNoteClassName': 'external_link',
									'referenceTotalNumber': externalLinkTotalNumber,
									'textSource': textSource,
									'stringNumber': stringNumber,
									'wordNumber': wordNumber,
									'openReferenceFunction': goToLinkFromNumber});
		});

		var indexNumberElement = document.createElement('span');
		indexNumberElement.classList.add('external_link', 'string_number');
		indexNumberElement.innerHTML = externalLinkTotalNumber + 1;

		if (eachExternalLink.positions.length <= 1) {
			indexNumberElement.dataset.text_source = eachExternalLink.positions[0].source;
			indexNumberElement.dataset.string = eachExternalLink.positions[0].string;
			indexNumberElement.onclick = findAndOpenElementInText;
		} else {
			indexNumberElement.dataset.total_number = externalLinkTotalNumber;
			indexNumberElement.dataset.reference_type = 'external_link';
			indexNumberElement.onclick = chooseTextContainerAndStringAndFindAndOpenElementInText;
		};
		externalLinkAsStrings.appendChild(createLinkTextStringElement(indexNumberElement, linkText));
	});
	externalLinksContainer.appendChild(externalLinkAsStrings);
	referencesToInsert.forEach(function(eachReferenceToInsert) {insertReference(eachReferenceToInsert)});
};

function dowloadDocumentLinksListCallback(documentLinkJsonData) {

	function openOppositeDocumentLink(event) {
		var documentLinkTotalNumber = extractNumberFromSpan(event.target) - 1;
		var documentLinksPair = getDocumentLinksPairWithTotalNumber(documentLinkTotalNumber);
		var documentLink = documentLinksPair.positions[0];
		var source = event.target.parentNode.parentNode.parentNode.parentNode.parentNode.dataset.source;
		var string = event.target.parentNode.parentNode.dataset.string;
		var word = event.target.parentNode.parentNode.dataset.word;
		if (documentLink.source == source && documentLink.string == string && documentLink.word == word) {
			documentLink = documentLinksPair.positions[1];
		};
		console.log(documentLink.source, documentLink.string, documentLink.word);
		event.target.dataset.text_source = documentLink.source;
		event.target.dataset.string = documentLink.string;
		event.target.dataset.word = documentLink.word;
		findAndOpenElementInText(event);
	};

	documentLinksList = documentLinkJsonData;
	documentLinkJsonData.forEach(function(eachDocumentLinksPair) {
		var documentLinkTotalNumber = eachDocumentLinksPair.total_number;
		eachDocumentLinksPair.positions.forEach(function(eachDocumentLink) {
			var textSource = eachDocumentLink.source;
			var stringNumber = eachDocumentLink.string;
			var wordNumber = eachDocumentLink.word;
			insertReference({'referenceNoteClassName': 'document_link',
							'referenceTotalNumber': documentLinkTotalNumber,
							'textSource': textSource,
							'stringNumber': stringNumber,
							'wordNumber': wordNumber,
							'openReferenceFunction': openOppositeDocumentLink
							});
		});
	});
};

function downloadModesTitlesListCallback(jsonData) {
	window.modesTitlesList = jsonData;	
	window.currentModeId = modesTitlesList[0].id;
	window.currentModeTitle = modesTitlesList[0].title;

	renderModeMenu();	
	downloadJson(jsonFileNameCreator('mode_setting', currentModeId), downloadModeSettingCallback);
};

function downloadModeSettingCallback(jsonData) {
	window.currentModeSettings = jsonData;
	window.lastSetsList = currentModeSettings.sets;
	var requestSetsString = '';
	for (var setNumber=0; setNumber < lastSetsList.length; setNumber++) {
		if (setNumber > 0) {
			requestSetsString += ',' + lastSetsList[setNumber];
		} else {
			requestSetsString += lastSetsList[setNumber];
		};
	};
	downloadJson('sets_list/'+ requestSetsString + '.json', downloadSetsListCallback);
	window.currentSetId = lastSetsList[0];
	downloadJson(jsonFileNameCreator('set', currentSetId), downloadSetCallback);
	downloadJson(jsonFileNameCreator('user_set_setting', currentSetId), downloadUserModeSettingForSetCallback);
};

function downloadUserModeSettingForSetCallback(jsonData) {
	window.currentUserSetSettings = jsonData;
};

function downloadSetsListCallback(jsonData) {
	window.setsTitlesList = jsonData;
	renderSetMenu();
};

function downloadSetCallback(jsonData) {
	window.currentSet = jsonData;	
	window.savedKnowlegeElements = [];

	transformSavedKnowlegeElementsAndRenderQuotes();
	activateWorkWithMenu();
};

function downloadJson(requestPath, callFunction) {
	var xhr = new XMLHttpRequest();	
	var fullRequestPath = [dataPath, requestPath].join('/');
	xhr.open('GET', fullRequestPath);
	xhr.onload = function(evt) {
		var rawData = evt.target.response;
		var jsonData = JSON.parse(rawData);
		callFunction(jsonData);
	};
	xhr.send();
};

function changeSourceTextToArrays(loadedTextsJson) {	

	loadedTextsJson['main'] = createWordsArrays(loadedTextsJson['main']);
	loadedTextsJson['media_title'] = createWordsArrays(loadedTextsJson['media_title']);
	loadedTextsJson['media_description'] = createWordsArrays(loadedTextsJson['media_description']);
	loadedTextsJson['about'] = createWordsArrays(loadedTextsJson['about']);
	loadedTextsJson['footnote'] = createWordsArrays(loadedTextsJson['footnote']);

	window.loadedTextsJson = loadedTextsJson;
};

function createWordsArrays(stringsArray) {
	var stringsAsWords = [];
	stringsArray.forEach(function(eachString) {
		var wordsArray = createWordsArray(eachString);

		stringsAsWords.push(wordsArray);
	});
	return stringsAsWords;
};

function createWordsArray(stringAsText) {
	var wordsArray = stringAsText.split(' ');
	for (wordNumber=0; wordNumber<wordsArray.length; wordNumber++) {
		wordsArray[wordNumber] = [wordsArray[wordNumber], false, false]; 
	};
	return wordsArray;
};

function renderTextContainer(stylesJson) {
	var textsContainers = {'main': mainTextContainer,
							'about': aboutTextContainer};
	for (var textPartTitle in textsContainers) {
		var sourceStrings = loadedTextsJson[textPartTitle];
		var stylesDict = stylesJson[textPartTitle];
		var stringsAsElements = document.createDocumentFragment();
		for (i=0; i<sourceStrings.length; i++) {
			stringsAsElements.appendChild(createBroadStringElement(sourceStrings[i], stylesDict, i));
		};
		var textContainer = textsContainers[textPartTitle];
		textContainer.appendChild(stringsAsElements);
	};
};

function createBroadStringElement(wordsInString, stylesDict, stringIndex, insertStringIndexElement) {

	BroadStringConstructor = function() {
		this.leftButtonElement = null;
		this.stringElement = null;		
		this.rightButtonElement = null;

		for (element in this) {

			var tagType = 'div'; 
			if (stylesDict && Object.keys(stylesDict).indexOf(String(stringIndex)) >= 0) {
				tagType = stylesDict[String(stringIndex)]['tag'];
			};
			this[element] = document.createElement(tagType);
			this[element].classList.add(layoutColumnClass);
			this[element].dataset.string = stringIndex;
		};
	};

	var layoutColumnClass = 'layout-column';
	var broadStringObject = new BroadStringConstructor(layoutColumnClass);	

	var buttonElement = [broadStringObject.leftButtonElement, broadStringObject.rightButtonElement]
	buttonElement.forEach(function(buttonElement) {
		buttonElement.classList.add(stringButtonClassName);
	});

	broadStringObject.leftButtonElement.classList.add('left');	
	broadStringObject.rightButtonElement.classList.add('right');
	broadStringObject.stringElement.classList.add('string');
	if (insertStringIndexElement != undefined) {		
		broadStringObject.stringElement.appendChild(insertStringIndexElement);
	}
	broadStringObject.stringElement.appendChild(createWordsElements(wordsInString, stringIndex));

	var broadStringContainer = document.createDocumentFragment();		
	for (element in broadStringObject) {
		broadStringContainer.appendChild(broadStringObject[element]);
	};

	var layoutPositioner = document.createElement('div');
	layoutPositioner.classList.add('layout-positioner');
	layoutPositioner.appendChild(broadStringContainer);

	return layoutPositioner;
};

function createWordsElements(wordsInString, stringIndex) {	
	var wordsAsElements = document.createDocumentFragment();
	var wordsInStringCount = wordsInString.length; 
	for (var i=0; i<wordsInStringCount; i++) {
		var spanElementWithWord = document.createElement('span');
		spanElementWithWord.innerHTML = wordsInString[i][0];
		spanElementWithWord.className = 'word';
		spanElementWithWord.dataset.string = stringIndex;
		spanElementWithWord.dataset.word = i;
		wordsAsElements.appendChild(spanElementWithWord);
		if (i < wordsInStringCount - 1) {
			var spanElementWithSpace = document.createElement('span');
			spanElementWithSpace.innerHTML = ' ';
			spanElementWithSpace.className = 'space';
			spanElementWithSpace.dataset.string = stringIndex;
			spanElementWithSpace.dataset.word = i;
			wordsAsElements.appendChild(spanElementWithSpace);			
		};
	};
	return wordsAsElements;
};

function insertBroadStringInTextContainer(textSource, currentStringTextNumber) {
	var textContainer = document.querySelector('.text_container[data-source=' + textSource + ']');
	cleanNodeContent(textContainer);
	var stringText = getTextStringArray(textSource, currentStringTextNumber);
	textContainer.appendChild(createBroadStringElement(stringText, false, currentStringTextNumber));
	checkAndStressSavedKnowlegeElementQuote(textSource, currentStringTextNumber);
};

function cleanNodeContent(parentNode) {
	while (parentNode.firstChild) {
		parentNode.removeChild(parentNode.firstChild);
	};
};

function setOpenElementInTextFunctionForElement(element, source, string, word) {
	console.log(savedStressedObjects);
	element.dataset.text_source = source;
	element.dataset.string = string;
	if (word != undefined) {
		element.dataset.word = word;
	};
	element.onclick = findAndOpenElementInText;
};

function findAndStressObjectsInText(event) {
	var textSource = event.target.dataset.text_source;
	var stressObjectNumbers = event.target.dataset.stress_object_number;
	var stressObjectNumbersArray = stressObjectNumbers.split(' ');
	var savedStressedObjectsForTextSource = savedStressedObjects[textSource];
	var savedStressedObjectsForTheseStrings = [];
	var stringNumbers = [];
	stressObjectNumbersArray.forEach(function(eachStressObjectNumber) {
		savedStressedObjectsForTextSource.forEach(function(eachSavedStressObject) {
			if (eachSavedStressObject.number == eachStressObjectNumber) {
				savedStressedObjectsForTheseStrings.push(eachSavedStressObject);
				var startStringNumber = eachSavedStressObject.startElementPosition.stringNumber;
				var endStringNumber = eachSavedStressObject.endElementPosition.stringNumber;
				for (var eachStringNumber=startStringNumber;eachStringNumber<=endStringNumber;eachStringNumber++) {
					if (stringNumbers.indexOf(eachStringNumber) < 0) {
						stringNumbers.push(eachStringNumber);
					};
				};
			};
		});
	});
	if (['media_title', 'media_description'].indexOf(textSource) >= 0) {

		event.target.dataset.media_total_number = savedStressedObjectsForTheseStrings[0].startElementPosition.stringNumber;
	};
	openPart(event);
	for (var eachStressObjectNumber=0;eachStressObjectNumber<savedStressedObjectsForTheseStrings.length;eachStressObjectNumber++) {
		savedStressedObjectsForTheseStrings[eachStressObjectNumber].blinkStress();
		if (eachStressObjectNumber == 0) {
			savedStressedObjectsForTheseStrings[eachStressObjectNumber].scrollToStartPosition();
		};
	};

	stringNumbers.forEach(function(eachStringNumber) {
		blinkPairTextButtonElements(textSource, eachStringNumber);
	});
};

function getQueryStringForWordOrSpace(textSource, elementType, stringNumber, wordNumber) {
	var queryString = '.' + elementType + '[data-string="' + stringNumber + '"][data-word="' + wordNumber + '"]';
	if (textSource) {
		queryString = '.text_container[data-source="' + textSource + '"] ' + queryString;
	};
	return queryString;

};

function getQueryStringForTextButton(textSource, stringNumber) {
	return '.text_container[data-source=' + '"' + textSource + '"' + '] .text_button[data-string="' + stringNumber + '"]';
};

function getElementForOperation(htmlNode, textSource, elementType, stringNumber, wordNumber) {
	if (htmlNode == undefined) {
		htmlNode = document;
	} else {
		textSource = false;
	};
	var queryString = getQueryStringForWordOrSpace(textSource, elementType, stringNumber, wordNumber);
	return htmlNode.querySelector(queryString);

};

function getPairTextButtonElements(textSource, stringNumber) {
	var queryString = getQueryStringForTextButton(textSource, stringNumber);
	return document.querySelectorAll(queryString);
};

function blinkStressElement(element, stressMode, stage=false) {
	var elementOfClassList = element.classList;

	var blinkClassName = stressClassesNames[stressMode];
	if (stage) {
		var TIMEOUT = userSettings.blinkingTimeOut;
		var stopBlink = setTimeout(function() {
			elementOfClassList.remove(blinkClassName);
			}, TIMEOUT);
	} else {
		elementOfClassList.add(blinkClassName);
		blinkStressElement(element, stressMode, true);
	};
};

function blinkTextElement(textSource, elementType, stringNumber, wordNumber) {
	var textElement = getElementForOperation(undefined, textSource, elementType, stringNumber, wordNumber);
	blinkStressElement(textElement, 'startTemporaryStress');
};

function blinkPairTextButtonElements(textSource, stringNumber) {
	var pairTextButtonElements = getPairTextButtonElements(textSource, stringNumber);
		pairTextButtonElements.forEach(function(textButtonElement) {
			blinkStressElement(textButtonElement, 'startTemporaryStress');
	});
	return pairTextButtonElements;
};

function createTextStringFromTextArray(textStringArray) {

	return textStringArray.join(' ');
};

function findSavedKnowlegeElement(knowlegeElementNumber) {
	return savedKnowlegeElements[knowlegeElementNumber - 1];
};

 function definePart(event) {
	var knowlegeElementNumber = event.target.dataset.knowlege_element_number;
	var partNumber = event.target.dataset.part_number;
	var savedKnowlegeElement = findSavedKnowlegeElement(knowlegeElementNumber);
	var part = savedKnowlegeElement.parts[partNumber - 1];		
	return part;
};

function sortStressObjectsForStartPositions(secondStressObject, firstStressObject) {
	var direction = firstStressObject.startElementPosition.defineElementDirection(secondStressObject.startElementPosition);

	switch (direction) {
		case "hold":
		case "direct":
			return 1;
			break;
		case "reverse":
			return -1;
			break;
	};
};

function copyObject(previousObject) {
	var newObject = {};
	for (var prop in previousObject) {
		if (typeof previousObject[prop] == 'object') {
			newObject[prop] = copyObject(previousObject[prop]);
		} else {
			newObject[prop] = previousObject[prop];
		};
	};
	return newObject;
};

function extractKnowlegeElementNumberAndElementPartNumberFromEvent(event) {
	var knowlegeElementNumber = event.target.dataset.knowlege_element_number;
	var elementPartNumber = event.target.dataset.part_number;
	return [knowlegeElementNumber, elementPartNumber];
};

function getElementPartFromSavedKnowlegeElement(kEandEPNumberList) {
	return savedKnowlegeElements[Number(kEandEPNumberList[0])-1].parts[Number(kEandEPNumberList[1])-1];
};