export function calcPointDistance(x1, y1, x2, y2) {
	return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2))
}

export function getTargetOrientation(source, target) {
	const arr = [
		{ distance: 0, orientation: 'left', x: target.x, y: target.y + (target.height / 2) },
		{ distance: 0, orientation: 'top', x: target.x + (target.width / 2), y: target.y },
		{ distance: 0, orientation: 'right', x: target.x + target.width, y: target.y + (target.height / 2) },
		{ distance: 0, orientation: 'bottom', x: target.x + (target.width / 2), y: target.y + target.height }
	]
	
	for (const item of arr){
		item.distance = calcPointDistance(source.x, source.y, item.x, item.y)
	}
	return arr.sort((a, b) => a.distance - b.distance)[0]
}

export function calcShortestDistance(source = { x: 0, y: 0 }, positions = {}){
	const result = []
	for (const k of Object.keys(positions)){
		const target = positions[k]
		result.push(Object.assign({ id: k }, getTargetOrientation(source, target)))
	}
	return result.length > 0 ? result.sort((a, b) => a.distance - b.distance)[0] : { }
}

export function randomString(len = 16) {
	let $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678'
	let maxPos = $chars.length;
	let pwd = '';
	for (let i = 0; i < len; i++) {
		pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
	}
	return pwd;
}