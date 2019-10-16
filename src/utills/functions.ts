export const onPressEnter = (event: any, callback: (event: any) => void) => {
	const isEnterPressed = event.charCode === 13;
	if (isEnterPressed) {
		callback(event);
	}
};
