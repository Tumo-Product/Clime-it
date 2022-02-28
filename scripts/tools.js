const timeout = (ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const shuffle = (array) => {
	let currentIndex = array.length, tempVal, randomIndex;

	while (0 !== currentIndex)
	{
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex -= 1;

		tempVal = array[currentIndex];
		array[currentIndex] = array[randomIndex];
		array[randomIndex] = tempVal;
	}

	return array;
}

const getBase64 = async (file) => {
    let fr   = new FileReader();
    return await (new Promise((resolve) => {
        fr.readAsDataURL(file);
        fr.onloadend = () => { resolve(fr.result); }
    }));
}